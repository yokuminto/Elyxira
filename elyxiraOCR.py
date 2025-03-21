import os
import sys
import json
import subprocess
import re
import time
from datetime import datetime
from functools import partial

# 图像处理
from PIL import Image
import cv2
import numpy as np

# 键盘监听
import keyboard

# Qt界面库
from PyQt5.QtWidgets import (
    QApplication,
    QMainWindow,
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QTextEdit,
    QFileDialog,
    QMessageBox,
    QLineEdit,
    QStatusBar,
    QTabWidget,
    QComboBox,
    QTableWidget,
    QTableWidgetItem,
    QDialog,
    QDialogButtonBox,
    QHeaderView,
    QAbstractItemView,
    QInputDialog,
)
from PyQt5.QtCore import (
    Qt,
    QThread,
    pyqtSignal,
    QSettings,
    QTemporaryFile,
    QTimer,
    QEventLoop,
)
from PyQt5.QtGui import QIcon, QIntValidator, QDoubleValidator, QTextCursor, QPixmap

# 尝试导入OCR库
try:
    from paddleocr import PaddleOCR

    PADDLE_OCR_AVAILABLE = True
except ImportError:
    PADDLE_OCR_AVAILABLE = False

    # 定义解析文本函数
import re
from typing import List, Dict


class OCRThread(QThread):
    finished = pyqtSignal(dict)
    raw_text = pyqtSignal(str)

    def __init__(self, image):
        super().__init__()
        self.image = image

    def preprocess_text(self, lines: List[str]) -> str:
        """预处理文本，规范化格式"""
        text = " ".join(lines).replace("（）", "").replace("?", "").strip()
        # 将全角符号转为半角
        text = text.replace("：", ":").replace("。", ".").replace("、", ",")
        return text

    def extract_options(self, text: str) -> Dict[str, str]:
        """提取选项"""
        option_dict = {}
        # 更加全面的正则表达式，适应更多格式，并防止提取到后续内容
        pattern = r"(?:（\s*）|√\s*|×\s*|\?|\s)*([A-E])[\.\s,:、：]+([^A-E\n]+?)(?=\s*(?:（\s*）|√\s*|×\s*|\?|\s)*[A-E][\.\s,:、：]|答案[：:\s]|试题纠错|难度[：:\s]|$)"

        for match in re.finditer(pattern, text):
            code, content = match.groups()
            content = content.strip()
            if content:
                option_dict[code] = content
        return option_dict

    def format_options(self, option_dict: Dict[str, str]) -> List[str]:
        """格式化选项输出"""
        options = []
        for code in sorted(option_dict.keys()):
            content = re.sub(r"[√×\s]+", "", option_dict[code]).strip()
            if content:
                options.append(f"{code}、{content}")
        return options

    def process_options(self, option_lines: List[str]) -> List[str]:
        """主处理函数"""
        # 预处理
        text = self.preprocess_text(option_lines)
        # 提取选项
        option_dict = self.extract_options(text)
        # 最多只保留5个选项（A-E）
        valid_options = {}
        for code in sorted(option_dict.keys()):
            if len(valid_options) >= 5:
                break
            valid_options[code] = option_dict[code]
        # 格式化输出
        return self.format_options(valid_options)

    def _process_options(self, result, option_lines):
        """处理选项数据"""
        if not option_lines:
            return

        # 最多只处理前5个选项（A-E）
        option_count = 0
        processed_options = {}

        # 使用已有的选项处理方法
        formatted_options = self.process_options(option_lines)
        if formatted_options:
            # 只保留前5个不同的选项
            for opt in formatted_options:
                if option_count >= 5:
                    break

                code = opt[0]  # 获取选项代码（A-E）
                if code not in processed_options:
                    processed_options[code] = opt
                    option_count += 1

            # 按照选项代码排序并添加到结果中
            result["options"] = [
                processed_options[code] for code in sorted(processed_options.keys())
            ]
        else:
            # 备用方法：尝试直接提取每一行作为选项
            processed_options = {}

            for line in option_lines:
                if option_count >= 5:
                    break

                # 改进的正则表达式，匹配更多选项格式，但排除后续解析内容
                if match := re.match(
                    r"(?:（\s*）|√\s*|×\s*|\?|\s)*([A-E])[\.、:：\s]+(.*?)(?=试题纠错|难度[：:\s]|标签|$)",
                    line,
                ):
                    code, content = match.groups()

                    # 如果该选项代码已处理过，跳过
                    if code in processed_options:
                        continue

                    # 清理内容中的特殊标记
                    content = re.sub(r"[?√×（）()\s]+", "", content).strip()
                    if content:
                        processed_options[code] = f"{code}、{content}"
                        option_count += 1

            # 按照选项代码排序并添加到结果中
            result["options"] = [
                processed_options[code] for code in sorted(processed_options.keys())
            ]

    def _clean_option_contents(self, options):
        """清理选项内容，移除非选项的部分"""
        cleaned_options = []
        for opt in options:
            # 查找是否包含试题纠错、难度、标签等关键词
            match = re.match(
                r"^([A-E])、(.*?)(?=试题纠错|难度[：:\s]|标签|收藏|评论|点赞|$)", opt
            )
            if match:
                code, content = match.groups()
                content = content.strip()
                if content:
                    cleaned_options.append(f"{code}、{content}")
            else:
                cleaned_options.append(opt)
        return cleaned_options

    def _clean_question_text(self, text):
        """清理题目文本，移除括号等标记"""
        if not text:
            return text

        # 移除题号
        cleaned_text = re.sub(r"^\d+\.?\s*", "", text)

        # 移除题目末尾的各种括号
        cleaned_text = re.sub(r"\s*[\(（][\s\)）]*$", "", cleaned_text)

        # 移除题目中的独立括号"（）"，但保留包含内容的括号
        cleaned_text = re.sub(r"\s*[\(（]\s*[\)）]\s*", " ", cleaned_text)

        # 清理多余空格
        cleaned_text = re.sub(r"\s+", " ", cleaned_text).strip()

        return cleaned_text

    def _post_process_result(self, result):
        """对解析结果进行后处理，确保数据格式正确"""
        # 处理答案
        if result.get("answer"):
            result["answer"] = result["answer"].strip().upper()

        # 确保所有选项都以"X、内容"格式
        processed_options = []
        for opt in result.get("options", []):
            # 如果选项已经是正确格式
            if re.match(r"^[A-E]、", opt):
                processed_options.append(opt)
            # 如果选项以A.或A:开头
            elif match := re.match(r"^([A-E])[\.,:：]?\s*(.*)", opt):
                code, content = match.groups()
                if content.strip():
                    processed_options.append(f"{code}、{content.strip()}")

        # 更新选项
        if processed_options:
            result["options"] = processed_options

        # 清理选项内容，移除非选项部分
        result["options"] = self._clean_option_contents(result["options"])

        # 过滤空选项
        result["options"] = [opt for opt in result["options"] if len(opt) > 2]

        # 确保题目不是选项
        if result.get("question") and re.match(r"^[A-E][\.、:：]", result["question"]):
            result["question"] = re.sub(r"^[A-E][\.、:：]\s*", "", result["question"])

        # 清理题目中的括号标记
        if result.get("question"):
            result["question"] = self._clean_question_text(result["question"])

        # 确保选项末尾没有解析内容
        for i, opt in enumerate(result["options"]):
            if "试题纠错" in opt or "难度：" in opt or "标签：" in opt:
                parts = re.split(r"试题纠错|难度[：:\s]|标签", opt, 1)
                if parts:
                    result["options"][i] = parts[0].strip()

        return result

    def _extract_medical_exam_format(self, text):
        """专门处理医学考试题格式"""
        result = {"question": "", "options": [], "answer": ""}

        # 先尝试提取答案
        answer_match = re.search(r"答案[：:\s]*([A-E]+)", text, re.IGNORECASE)
        if answer_match:
            result["answer"] = answer_match.group(1).upper()

        # 处理带有"（）"或"√"标记的选项
        # 使用更精确的模式匹配医学考试题的选项格式，排除后续内容
        option_matches = re.findall(
            r"(?:（\s*）|√\s*|×\s*)?([A-E])[\.、:：\s]+(.*?)(?=\s*(?:（\s*）|√\s*|×\s*)?[A-E][\.、:：\s]|答案[：:\s]|试题纠错|难度[：:\s]|$)",
            text,
            re.DOTALL,
        )

        if option_matches:
            # 限制最多提取5个选项（A-E）
            valid_options = []
            option_codes = set()

            for code, content in option_matches:
                # 如果已经有5个选项了，停止处理
                if len(valid_options) >= 5:
                    break

                # 确保选项代码不重复
                if code in option_codes:
                    continue

                # 清理选项内容，排除非选项内容
                clean_content = re.sub(r"[?√×（）()\s]+", "", content).strip()
                # 排除可能包含的解析内容
                if (
                    "试题纠错" in clean_content
                    or "难度：" in clean_content
                    or "标签：" in clean_content
                ):
                    parts = re.split(r"试题纠错|难度[：:\s]|标签", clean_content, 1)
                    if parts:
                        clean_content = parts[0].strip()

                if clean_content:
                    valid_options.append((code, clean_content))
                    option_codes.add(code)

            # 按选项代码排序并添加到结果中
            for code, content in sorted(valid_options, key=lambda x: x[0]):
                result["options"].append(f"{code}、{content}")

            # 如果找到了选项，尝试提取题目
            # 找到第一个选项的起始位置
            first_option_pos = text.find(option_matches[0][0])
            if first_option_pos > 0:
                # 获取选项前的所有文本
                question_part = text[:first_option_pos].strip()

                # 清理题目
                # 1. 移除章节信息
                lines = [
                    line.strip() for line in question_part.split("\n") if line.strip()
                ]
                question_lines = []
                for line in lines:
                    if not re.search(
                        r"(医学|考试|科目|章|节|篇|单选题|多选题|判断题|\d+$)", line
                    ):
                        question_lines.append(line)

                if question_lines:
                    # 2. 合并题目文本
                    question_text = " ".join(question_lines)
                    # 3. 使用统一的题目清理方法
                    result["question"] = self._clean_question_text(question_text)

        return result

    def _parse_text(self, text):
        """试题解析器"""
        # 先尝试专门的格式处理
        medical_format_result = self._extract_medical_exam_format(text)

        # 如果专门处理方法成功提取了完整的题目数据，直接返回
        if (
            medical_format_result["question"]
            and medical_format_result["options"]
            and medical_format_result["answer"]
        ):
            return medical_format_result

        # 否则继续原有的处理逻辑
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        result = {"question": "", "options": [], "answer": ""}

        # 尝试先查找答案，可能在任何位置出现
        for line in lines:
            if "答案" in line:
                if match := re.search(r"答案[：:\s]*([A-E]+)", line, re.IGNORECASE):
                    result["answer"] = match.group(1).upper()
                    break

        # 预处理：识别选项行 - 更新正则以匹配更多格式
        option_pattern = re.compile(
            r"(?:（\s*）|√\s*|×\s*|\?|\s)*([A-E])[\.、:：\s]+(.*)"
        )
        option_lines = []
        option_indices = []
        for i, line in enumerate(lines):
            if option_pattern.match(line):
                option_lines.append(line)
                option_indices.append(i)

        # 如果找到选项行
        if option_indices:
            # 尝试提取题目：选项前的所有内容，但排除题号和考试信息
            first_option_idx = min(option_indices)
            if first_option_idx > 0:
                # 过滤掉章节和考试信息
                question_lines = []
                for i in range(first_option_idx):
                    line = lines[i]
                    # 排除章节、考试信息等
                    if not re.search(
                        r"^(医学|考试|科目|章|节|篇|单选题|多选题|判断题|\d+$)", line
                    ):
                        question_lines.append(line)

                if question_lines:
                    question_text = " ".join(question_lines)
                    # 使用统一的题目清理方法
                    result["question"] = self._clean_question_text(question_text)

            # 处理选项
            self._process_options(result, option_lines)

        # 如果没有题目，尝试在文本开头查找
        if not result["question"] and lines:
            # 尝试提取疑似题目内容，跳过章节信息
            for line in lines:
                if (
                    not re.match(r"^\s*(?:\d+\.?\s*)?[A-E][\.、:：]", line)
                    and "答案" not in line.lower()
                    and not re.search(
                        r"^(医学|考试|科目|章|节|篇|单选题|多选题|判断题|\d+$)", line
                    )
                ):
                    # 使用统一的题目清理方法
                    result["question"] = self._clean_question_text(line)
                    break

        # 确保每个选项都以 "A、" 格式开头
        processed_options = []
        for opt in result["options"]:
            if not re.match(r"^[A-E]、", opt):
                if re.match(r"^[A-E]", opt):
                    code = opt[0]
                    content = opt[1:].strip()
                    if content:
                        processed_options.append(f"{code}、{content}")
            else:
                processed_options.append(opt)

        result["options"] = processed_options

        # 清理问题文本中的多余空格和特殊字符
        if result["question"]:
            result["question"] = re.sub(r"\s+", " ", result["question"]).strip()

        return result

    def run(self):
        try:
            if PADDLE_OCR_AVAILABLE:
                ocr = PaddleOCR(use_angle_cls=True, lang="ch", show_log=False)
                result = ocr.ocr(np.array(self.image), cls=True)

                # 提取并格式化OCR文本
                if result and len(result) > 0:
                    # 按照行号排序以保证文本顺序正确
                    sorted_lines = sorted(
                        result[0], key=lambda x: x[0][0][1]
                    )  # 按y坐标排序

                    # 合并同一行的文本
                    merged_lines = []
                    current_y = -1
                    current_line = ""

                    for line in sorted_lines:
                        y_coord = line[0][0][1]
                        text = line[1][0]

                        # 如果y坐标相差不大，认为是同一行
                        if (
                            current_y == -1 or abs(y_coord - current_y) > 10
                        ):  # 阈值可调整
                            if current_line:
                                merged_lines.append(current_line)
                            current_line = text
                            current_y = y_coord
                        else:
                            # 检查是否需要在特定位置添加换行
                            # 特殊处理：如果前一段文本以选项结尾，而这一段以"试题纠错"等开头，则添加换行
                            if re.search(r"[A-E]\s*$", current_line) and re.match(
                                r"试题纠错|难度[：:\s]|标签|答案", text
                            ):
                                merged_lines.append(current_line)
                                current_line = text
                                current_y = y_coord
                            else:
                                current_line += " " + text

                    # 添加最后一行
                    if current_line:
                        merged_lines.append(current_line)

                    # 连接所有行
                    ocr_text = "\n".join(merged_lines)

                    # 预处理：分离解析部分
                    ocr_text = self._preprocess_medical_text(ocr_text)

                    self.raw_text.emit(ocr_text)

                    # 解析文本
                    parsed_result = self._parse_text(ocr_text)

                    # 补充处理，确保选项和答案的格式
                    parsed_result = self._post_process_result(parsed_result)

                    self.finished.emit(parsed_result)
                else:
                    self.finished.emit({"error": "OCR未能识别出文本"})
            else:
                raise Exception("PaddleOCR未安装")
        except Exception as e:
            self.finished.emit({"error": str(e)})

    def _preprocess_medical_text(self, text):
        """预处理医学题文本，分离题目、选项和解析"""
        # 在题目解析部分前添加明确的换行
        for marker in [
            "试题纠错",
            "难度：",
            "标签：",
            "统计：",
            "考点还原",
            "标准解析",
            "收藏",
            "评论",
            "点赞",
        ]:
            text = re.sub(f"({marker})", r"\n\1", text)

        # 确保答案前有换行
        text = re.sub(r"([A-E])\s*答案[：:\s]", r"\1\n答案:", text)

        # 尝试找到题目解析的起始位置
        analysis_start = -1
        for marker in ["试题纠错", "难度：", "统计：", "考点还原", "标准解析"]:
            pos = text.find(marker)
            if pos > 0 and (analysis_start == -1 or pos < analysis_start):
                analysis_start = pos

        # 分割题目和选项与解析部分
        main_content = text
        analysis_content = ""
        if analysis_start > 0:
            main_content = text[:analysis_start].strip()
            analysis_content = text[analysis_start:].strip()

        # 处理选项格式，确保每个选项单独成行
        lines = main_content.split("\n")
        processed_lines = []

        for line in lines:
            # 如果行包含多个选项，拆分它们
            if re.search(r"[A-E][\.、:：][^A-E]+[A-E][\.、:：]", line):
                # 尝试按选项分割
                option_splits = re.split(r"(?<=\S)(?=[A-E][\.、:：])", line)
                processed_lines.extend(option_splits)
            else:
                processed_lines.append(line)

        # 如果找到了解析部分，作为单独的行添加
        if analysis_content:
            processed_lines.append("")  # 空行作为分隔
            processed_lines.append(analysis_content)

        # 重新组合文本
        return "\n".join(processed_lines)

    def _clean_option_contents(self, options):
        """清理选项内容，移除非选项的部分"""
        cleaned_options = []
        for opt in options:
            # 查找是否包含试题纠错、难度、标签等关键词
            match = re.match(
                r"^([A-E])、(.*?)(?=试题纠错|难度[：:\s]|标签|收藏|评论|点赞|$)", opt
            )
            if match:
                code, content = match.groups()
                content = content.strip()
                if content:
                    cleaned_options.append(f"{code}、{content}")
            else:
                cleaned_options.append(opt)
        return cleaned_options


class AutoCollectThread(QThread):
    """自动收集题目的线程"""

    progress = pyqtSignal(str)  # 进度信号
    collected = pyqtSignal(dict)  # 收集到新题目的信号
    finished = pyqtSignal()  # 完成信号

    def __init__(self, parent, adb_path, device_address, max_questions=100, delay=2.0):
        super().__init__(parent)
        self.parent = parent
        self.adb_path = adb_path
        self.device_address = device_address
        self.max_questions = max_questions  # 最大收集题目数
        self.delay = delay  # 等待时间（秒）
        self.running = False
        self.question_count = 0
        self.timeout = 30  # 设置30秒超时

    def wait(self, timeout=None):
        """重写wait方法，添加超时机制"""
        # 不再覆盖原生wait方法，而是创建一个安全的等待机制
        if timeout is None:
            return super().wait()

        # 使用QThread的原生wait方法，而不是自己实现循环
        return super().wait(timeout)

    def run(self):
        """线程主函数"""
        self.running = True
        self.question_count = 0

        try:
            # 确保ADB连接
            if not self._connect_adb():
                self.progress.emit("ADB连接失败，无法启动自动收集")
                self.running = False
                self.finished.emit()
                return

            self.progress.emit(f"开始自动收集，计划收集{self.max_questions}道题目")

            # 主循环
            while self.running and self.question_count < self.max_questions:
                # 1. 截图
                self.progress.emit(
                    f"正在截图 ({self.question_count + 1}/{self.max_questions})..."
                )
                image = self._take_screenshot()
                if image is None:
                    self.progress.emit("截图失败，尝试继续...")
                    time.sleep(1)
                    continue

                # 2. 识别文本
                self.progress.emit("正在识别文本...")
                question_data = self._process_image(image)
                if not question_data or "error" in question_data:
                    self.progress.emit(
                        f"识别失败: {question_data.get('error', '未知错误')}"
                    )
                    time.sleep(1)
                    continue

                # 3. 如果识别成功，发送题目数据
                if question_data.get("question") and question_data.get("options"):
                    self.question_count += 1
                    self.collected.emit(question_data)
                    self.progress.emit(
                        f"已收集 {self.question_count}/{self.max_questions}"
                    )
                else:
                    self.progress.emit("识别结果不完整，跳过保存")

                # 4. 滑动到下一题
                self.progress.emit("滑动到下一题...")
                self._swipe_to_next()

                # 5. 等待加载
                self.progress.emit(f"等待 {self.delay} 秒加载下一题...")
                time.sleep(self.delay)

            self.progress.emit(
                "自动收集完成!"
                if self.question_count >= self.max_questions
                else "自动收集已停止"
            )

        except Exception as e:
            self.progress.emit(f"自动收集出错: {str(e)}")

        self.running = False
        self.finished.emit()

    def stop(self):
        """停止收集"""
        self.running = False
        self.progress.emit("正在停止自动收集...")

    def _connect_adb(self):
        """连接ADB设备"""
        try:
            result = subprocess.run(
                [self.adb_path, "connect", self.device_address],
                check=True,
                capture_output=True,
                text=True,
                timeout=5,
            )
            return (
                "connected to" in result.stdout or "already connected" in result.stdout
            )
        except Exception:
            return False

    def _take_screenshot(self):
        """获取屏幕截图"""
        try:
            # 创建临时文件
            temp_file = QTemporaryFile()
            if temp_file.open():
                temp_path = temp_file.fileName()
                temp_file.close()

                # 执行截图命令
                result = subprocess.run(
                    [self.adb_path, "exec-out", "screencap -p"],
                    check=True,
                    timeout=5,
                    capture_output=True,
                )

                # 保存截图到临时文件
                with open(temp_path, "wb") as f:
                    f.write(result.stdout)

                # 加载图像
                return Image.open(temp_path)
        except Exception as e:
            self.progress.emit(f"截图出错: {str(e)}")

        return None

    def _process_image(self, image):
        """处理图像提取题目"""
        try:
            if not PADDLE_OCR_AVAILABLE:
                return {"error": "PaddleOCR未安装"}

            # 图像预处理
            processed_image = self.parent.preprocess_image(image)

            # 创建OCR线程
            ocr_thread = OCRThread(processed_image)

            # 使用事件循环等待OCR完成
            loop = QEventLoop()
            result = {}

            def on_finish(data):
                nonlocal result
                result = data
                loop.quit()

            ocr_thread.finished.connect(on_finish)
            ocr_thread.start()

            # 设置超时
            timer = QTimer()
            timer.setSingleShot(True)
            timer.timeout.connect(loop.quit)
            timer.start(10000)  # 10秒超时

            loop.exec_()

            # 检查OCR线程是否仍在运行，如果是则终止它
            if ocr_thread.isRunning():
                ocr_thread.terminate()
                ocr_thread.wait(2000)  # 等待最多2秒确保终止
                self.progress.emit("OCR处理被终止")

            if not result:
                return {"error": "OCR处理超时"}

            return result

        except Exception as e:
            return {"error": str(e)}

    def _swipe_to_next(self):
        """滑动到下一题"""
        try:
            # 从右向左滑动屏幕
            subprocess.run(
                [
                    self.adb_path,
                    "shell",
                    "input swipe 900 500 100 500 300",  # 从右向左滑动
                ],
                check=True,
                timeout=5,
            )
            return True
        except Exception as e:
            self.progress.emit(f"滑动出错: {str(e)}")
            return False


class ChapterManager:
    def __init__(self, settings):
        self.settings = settings
        self.chapters = self.load_chapters()
        self.current_chapter = self.settings.value("current_chapter") or "默认章节"

    def load_chapters(self):
        return json.loads(self.settings.value("chapters", json.dumps(["默认章节"])))

    def save_chapters(self):
        self.settings.setValue("chapters", json.dumps(self.chapters))
        self.settings.setValue("current_chapter", self.current_chapter)

    def add_chapter(self, name):
        if name not in self.chapters:
            self.chapters.append(name)
            self.save_chapters()
            return True
        return False

    def rename_chapter(self, old_name, new_name):
        if new_name not in self.chapters:
            index = self.chapters.index(old_name)
            self.chapters[index] = new_name
            if self.current_chapter == old_name:
                self.current_chapter = new_name
            self.save_chapters()
            return True
        return False

    def delete_chapter(self, name):
        if name in self.chapters:
            self.chapters.remove(name)
            if self.current_chapter == name:
                self.current_chapter = self.chapters[0] if self.chapters else ""
            self.save_chapters()
            return True
        return False


class QuestionEditor(QDialog):
    def __init__(self, data, parent=None):
        super().__init__(parent)
        self.setWindowTitle("编辑题目")
        self.data = data

        layout = QVBoxLayout()
        self.question_edit = QTextEdit(data.get("question", ""))
        self.options_edit = QTextEdit("\n".join(data.get("options", [])))
        self.answer_edit = QLineEdit(data.get("answer", ""))

        buttons = QDialogButtonBox(QDialogButtonBox.Save | QDialogButtonBox.Cancel)
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)

        layout.addWidget(QLabel("题目:"))
        layout.addWidget(self.question_edit)
        layout.addWidget(QLabel("选项（每行一个）:"))
        layout.addWidget(self.options_edit)
        layout.addWidget(QLabel("答案:"))
        layout.addWidget(self.answer_edit)
        layout.addWidget(buttons)
        self.setLayout(layout)

    def get_data(self):
        return {
            "question": self.question_edit.toPlainText(),
            "options": self.options_edit.toPlainText().split("\n"),
            "answer": self.answer_edit.text(),
        }


class QuizCaptureApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.settings = QSettings("MedicalQuiz", "QuizCapture")
        self.chapter_manager = ChapterManager(self.settings)
        self.output_dir = self.settings.value(
            "output_dir", os.path.join(os.path.expanduser("~"), "Documents", "QuizData")
        )
        self.init_ui()
        self.current_question = {}
        self.current_image = None
        self.last_raw_text = ""
        self.question_counter = 0
        self.ocr_thread = None  # 初始化OCR线程变量
        keyboard.add_hotkey("F9", self.take_screenshot)
        self.auto_collect_thread = None  # 初始化线程变量

    def closeEvent(self, event):
        """应用程序关闭时的处理"""
        # 首先处理自动收集线程
        if self.auto_collect_thread and self.auto_collect_thread.isRunning():
            # 停止线程
            self.auto_collect_thread.stop()
            # 等待线程结束，设置超时时间
            if not self.auto_collect_thread.wait(5000):  # 等待最多5秒
                self.auto_collect_thread.terminate()  # 如果等待超时，强制终止

        # 检查是否有OCR线程在运行
        if (
            hasattr(self, "ocr_thread")
            and self.ocr_thread
            and self.ocr_thread.isRunning()
        ):
            self.ocr_thread.terminate()
            self.ocr_thread.wait(2000)  # 等待最多2秒确保终止

        event.accept()

    def init_ui(self):
        self.setWindowTitle("医考题目抓取工具")
        self.resize(400, 600)

        # 主容器
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout(central_widget)

        # 标签页容器
        self.tabs = QTabWidget()
        main_layout.addWidget(self.tabs)

        # 创建标签页
        self.create_main_tab()
        self.create_chapter_tab()
        self.create_settings_tab()  # 添加设置标签页
        self.create_auto_collect_tab()  # 添加自动收集标签页

        # 状态栏
        self.statusBar = QStatusBar()
        self.setStatusBar(self.statusBar)

        # 初始化章节显示
        self.update_chapter_display()

        # 连接标签页切换信号
        self.tabs.currentChanged.connect(self.on_tab_changed)

        # 检查ADB配置
        if not self.settings.value("adb_path") or not self.settings.value(
            "default_adb_address"
        ):
            self.statusBar.showMessage("请先在设置中配置ADB", 5000)
            self.tabs.setCurrentIndex(2)  # 显示设置标签页

    def on_tab_changed(self, index):
        """标签页切换时的处理"""
        if self.auto_collect_thread and self.auto_collect_thread.isRunning():
            reply = QMessageBox.question(
                self,
                "自动收集正在进行",
                "切换标签页将停止自动收集，是否继续？",
                QMessageBox.Yes | QMessageBox.No,
                QMessageBox.No,
            )
            if reply == QMessageBox.Yes:
                self.stop_auto_collect()  # 使用改进后的停止方法
                # 切换标签页
                self.tabs.setCurrentIndex(index)
            else:
                # 保持在当前标签页
                self.tabs.blockSignals(True)
                self.tabs.setCurrentIndex(3)  # 返回到自动收集标签页
                self.tabs.blockSignals(False)

    def create_main_tab(self):
        """主功能标签页"""
        main_tab = QWidget()
        layout = QVBoxLayout(main_tab)

        # 章节显示
        chapter_layout = QHBoxLayout()
        self.chapter_label = QLabel()
        self.screenshot_btn = QPushButton("截图 (F9)")
        self.screenshot_btn.clicked.connect(self.take_screenshot)

        chapter_layout.addWidget(QLabel("当前章节:"))
        chapter_layout.addWidget(self.chapter_label)
        chapter_layout.addWidget(self.screenshot_btn)
        layout.addLayout(chapter_layout)

        # JSON编辑器
        self.json_edit = QTextEdit()
        self.json_edit.setPlaceholderText("JSON数据将显示在这里")
        layout.addWidget(self.json_edit)

        # 操作按钮
        btn_layout = QHBoxLayout()
        self.save_btn = QPushButton("保存")
        self.save_btn.clicked.connect(self.save_question)
        self.export_btn = QPushButton("导出章节")
        self.export_btn.clicked.connect(self.export_json)
        self.debug_btn = QPushButton("原始文本")
        self.debug_btn.clicked.connect(self.copy_raw_text)

        btn_layout.addWidget(self.save_btn)
        btn_layout.addWidget(self.export_btn)
        btn_layout.addWidget(self.debug_btn)
        layout.addLayout(btn_layout)

        self.tabs.addTab(main_tab, "主功能")

    def create_chapter_tab(self):
        """章节管理标签页"""
        chapter_tab = QWidget()
        layout = QVBoxLayout(chapter_tab)

        # 章节管理区域
        chapter_group = QWidget()
        chapter_group_layout = QHBoxLayout(chapter_group)

        # 章节选择
        self.chapter_combo = QComboBox()
        self.chapter_combo.addItems(self.chapter_manager.chapters)
        self.chapter_combo.currentTextChanged.connect(self.change_chapter)

        # 操作按钮
        self.add_btn = QPushButton("新增章节")
        self.add_btn.clicked.connect(self.show_add_chapter_dialog)
        self.edit_btn = QPushButton("重命名章节")
        self.edit_btn.clicked.connect(self.show_rename_dialog)
        self.del_btn = QPushButton("删除章节")
        self.del_btn.clicked.connect(self.delete_chapter)

        chapter_group_layout.addWidget(QLabel("当前章节:"))
        chapter_group_layout.addWidget(self.chapter_combo)
        chapter_group_layout.addWidget(self.add_btn)
        chapter_group_layout.addWidget(self.edit_btn)
        chapter_group_layout.addWidget(self.del_btn)
        chapter_group_layout.addStretch()

        # 题目管理区域
        question_group = QWidget()
        question_group_layout = QHBoxLayout(question_group)

        self.refresh_btn = QPushButton("刷新列表")
        self.refresh_btn.clicked.connect(self.refresh_questions)
        self.export_btn = QPushButton("导出章节")
        self.export_btn.clicked.connect(self.export_json)

        question_group_layout.addWidget(QLabel("题目管理:"))
        question_group_layout.addWidget(self.refresh_btn)
        question_group_layout.addWidget(self.export_btn)
        question_group_layout.addStretch()

        # 题目表格
        self.question_table = QTableWidget()
        self.question_table.setColumnCount(6)  # 增加一列用于删除按钮
        self.question_table.setHorizontalHeaderLabels(
            ["ID", "题目", "选项数", "答案", "编辑", "删除"]
        )
        # 设置表格样式
        self.question_table.setStyleSheet(
            """
            QTableWidget {
                background-color: white;
                alternate-background-color: #f6f6f6;
                gridline-color: #e0e0e0;
            }
            QTableWidget::item {
                padding: 5px;
            }
            QHeaderView::section {
                background-color: #f0f0f0;
                padding: 5px;
                border: none;
                border-bottom: 1px solid #cccccc;
            }
        """
        )
        self.question_table.setAlternatingRowColors(True)
        self.question_table.horizontalHeader().setSectionResizeMode(
            1, QHeaderView.Stretch
        )
        self.question_table.setEditTriggers(QAbstractItemView.NoEditTriggers)
        self.question_table.verticalHeader().setVisible(False)  # 隐藏行号
        self.question_table.setSelectionBehavior(
            QAbstractItemView.SelectRows
        )  # 整行选择
        self.question_table.doubleClicked.connect(self.edit_table_question)

        # 添加到主布局
        layout.addWidget(chapter_group)
        layout.addWidget(question_group)
        layout.addWidget(self.question_table)

        self.tabs.addTab(chapter_tab, "章节管理")

        QTimer.singleShot(100, self.refresh_questions)  # 延迟加载表格数据

    def create_settings_tab(self):
        """设置标签页"""
        settings_tab = QWidget()
        layout = QVBoxLayout(settings_tab)

        # ADB路径设置
        adb_layout = QHBoxLayout()
        adb_label = QLabel("ADB路径:")
        self.adb_path_edit = QLineEdit(self.settings.value("adb_path", "adb"))
        adb_browse_btn = QPushButton("浏览...")
        adb_browse_btn.clicked.connect(self.browse_adb_path)

        adb_layout.addWidget(adb_label)
        adb_layout.addWidget(self.adb_path_edit)
        adb_layout.addWidget(adb_browse_btn)

        # 设备地址设置
        device_layout = QHBoxLayout()
        device_label = QLabel("设备地址:")
        self.device_address_edit = QLineEdit(
            self.settings.value("default_adb_address", "127.0.0.1:5555")
        )
        device_test_btn = QPushButton("测试连接")
        device_test_btn.clicked.connect(self.test_adb_connection)

        device_layout.addWidget(device_label)
        device_layout.addWidget(self.device_address_edit)
        device_layout.addWidget(device_test_btn)

        # 输出目录设置
        output_layout = QHBoxLayout()
        output_label = QLabel("输出目录:")
        self.output_dir_edit = QLineEdit(self.output_dir)
        output_browse_btn = QPushButton("浏览...")
        output_browse_btn.clicked.connect(self.browse_output_dir)

        output_layout.addWidget(output_label)
        output_layout.addWidget(self.output_dir_edit)
        output_layout.addWidget(output_browse_btn)

        # 保存按钮
        save_btn = QPushButton("保存设置")
        save_btn.clicked.connect(self.save_settings)

        # 添加到布局
        layout.addLayout(adb_layout)
        layout.addLayout(device_layout)
        layout.addLayout(output_layout)
        layout.addWidget(save_btn)
        layout.addStretch()

        self.tabs.addTab(settings_tab, "设置")

    def create_auto_collect_tab(self):
        """创建自动收集标签页"""
        tab = QWidget()
        layout = QVBoxLayout(tab)

        # 配置区域
        config_group = QWidget()
        config_layout = QHBoxLayout(config_group)

        # 题目数量
        self.question_count_edit = QLineEdit("100")
        self.question_count_edit.setValidator(QIntValidator(1, 1000))
        self.question_count_edit.setMaximumWidth(100)

        # 延迟时间
        self.delay_edit = QLineEdit("2.0")
        self.delay_edit.setValidator(QDoubleValidator(0.5, 10.0, 1))
        self.delay_edit.setMaximumWidth(100)

        config_layout.addWidget(QLabel("计划收集题目数:"))
        config_layout.addWidget(self.question_count_edit)
        config_layout.addWidget(QLabel("每题延迟(秒):"))
        config_layout.addWidget(self.delay_edit)
        config_layout.addStretch()

        # 操作按钮
        btn_group = QWidget()
        btn_layout = QHBoxLayout(btn_group)

        self.start_collect_btn = QPushButton("开始自动收集")
        self.start_collect_btn.clicked.connect(self.start_auto_collect)
        self.stop_collect_btn = QPushButton("停止收集")
        self.stop_collect_btn.clicked.connect(self.stop_auto_collect)
        self.stop_collect_btn.setEnabled(False)

        btn_layout.addWidget(self.start_collect_btn)
        btn_layout.addWidget(self.stop_collect_btn)
        btn_layout.addStretch()

        # 进度显示区域
        self.progress_text = QTextEdit()
        self.progress_text.setReadOnly(True)
        self.progress_text.setPlaceholderText("自动收集进度将显示在这里")

        # 添加到布局
        layout.addWidget(config_group)
        layout.addWidget(btn_group)
        layout.addWidget(QLabel("进度:"))
        layout.addWidget(self.progress_text)

        self.tabs.addTab(tab, "自动收集")

        # 初始化自动收集线程
        self.auto_collect_thread = None

    def start_auto_collect(self):
        """开始自动收集"""
        # 确保之前的线程已经停止
        if self.auto_collect_thread and self.auto_collect_thread.isRunning():
            self.stop_auto_collect()
            # 等待之前的线程完全停止
            if not self.auto_collect_thread.wait(5000):
                QMessageBox.warning(self, "警告", "无法停止之前的收集线程，请稍后重试")
                return

        # 检查ADB设置
        adb_path = self.settings.value("adb_path", "")
        device_address = self.settings.value("default_adb_address", "")

        if not adb_path or not device_address:
            QMessageBox.warning(self, "配置错误", "请先在设置中配置ADB路径和设备地址")
            self.tabs.setCurrentIndex(2)  # 切换到设置标签页
            return

        try:
            max_questions = int(self.question_count_edit.text())
            delay = float(self.delay_edit.text())

            if max_questions <= 0 or delay < 0.5:
                raise ValueError("参数无效")
        except ValueError:
            QMessageBox.warning(self, "参数错误", "请输入有效的题目数量和延迟时间")
            return

        # 清空进度显示
        self.progress_text.clear()

        # 创建并启动新的自动收集线程
        self.auto_collect_thread = AutoCollectThread(
            self, adb_path, device_address, max_questions, delay
        )
        self.auto_collect_thread.progress.connect(self.update_collect_progress)
        self.auto_collect_thread.collected.connect(self.process_collected_question)
        self.auto_collect_thread.finished.connect(self.on_auto_collect_finished)

        # 更新UI状态
        self.start_collect_btn.setEnabled(False)
        self.stop_collect_btn.setEnabled(True)

        # 启动线程
        self.auto_collect_thread.start()

    def stop_auto_collect(self):
        """停止自动收集"""
        if self.auto_collect_thread and self.auto_collect_thread.isRunning():
            self.auto_collect_thread.stop()
            # 等待线程完成
            if not self.auto_collect_thread.wait(5000):  # 等待最多5秒
                self.auto_collect_thread.terminate()  # 如果等待超时，强制终止
            self.start_collect_btn.setEnabled(True)
            self.stop_collect_btn.setEnabled(False)
            self.update_collect_progress("自动收集已手动停止")

    def on_auto_collect_finished(self):
        """自动收集完成的处理"""
        self.start_collect_btn.setEnabled(True)
        self.stop_collect_btn.setEnabled(False)
        self.update_collect_progress("自动收集已结束")

    def update_collect_progress(self, message):
        """更新收集进度信息"""
        self.progress_text.append(message)
        # 滚动到底部
        cursor = self.progress_text.textCursor()
        cursor.movePosition(QTextCursor.End)
        self.progress_text.setTextCursor(cursor)

    def process_collected_question(self, question_data):
        """处理收集到的题目数据"""
        try:
            # 设置计数器ID
            self.question_counter += 1
            question_data["id"] = self.question_counter
            question_data["number"] = self.question_counter

            # 显示在界面上
            self.current_question = question_data
            self.json_edit.setText(
                json.dumps(question_data, ensure_ascii=False, indent=2)
            )

            # 自动保存
            self.save_question(auto_save=True)

        except Exception as e:
            self.update_collect_progress(f"处理题目失败: {str(e)}")

    def save_question(self, auto_save=False):
        """完整的题目保存逻辑"""
        try:
            # 验证数据完整性
            if not auto_save and not self.validate_question_data():
                raise Exception("题目数据不完整")

            # 获取章节目录
            chapter_dir = self.get_chapter_dir()
            os.makedirs(chapter_dir, exist_ok=True)

            # 获取当前编辑区的内容
            try:
                question_data = (
                    json.loads(self.json_edit.toPlainText())
                    if not auto_save
                    else self.current_question
                )
            except json.JSONDecodeError:
                QMessageBox.critical(self, "格式错误", "请检查JSON格式是否正确")
                return

            # 检查是否存在相同ID的文件
            question_id = question_data.get("id", self.question_counter)
            existing_file = None

            # 遍历当前章节目录查找相同ID的文件
            for filename in os.listdir(chapter_dir):
                if filename.endswith(".json"):
                    file_path = os.path.join(chapter_dir, filename)
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            file_data = json.load(f)
                            if file_data.get("id") == question_id:
                                existing_file = file_path
                                break
                    except:
                        continue

            # 如果找到相同ID的文件就覆盖,否则创建新文件
            if existing_file:
                filename = existing_file
            else:
                # 生成新文件名
                timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
                filename = os.path.join(chapter_dir, f"Q{timestamp}.json")

            # 构建完整数据结构
            full_data = {
                "metadata": {
                    "create_time": datetime.now().strftime("%Y%m%d%H%M%S"),
                    "chapter": self.chapter_manager.current_chapter,
                    "source_image": (
                        self.current_image.filename
                        if hasattr(self.current_image, "filename")
                        else ""
                    ),
                    "ocr_text": self.last_raw_text,
                },
                "id": question_id,
                "question": question_data.get("question", ""),
                "options": question_data.get("options", []),
                "answer": question_data.get("answer", ""),
            }

            # 保存文件
            with open(filename, "w", encoding="utf-8") as f:
                json.dump(full_data, f, ensure_ascii=False, indent=2)

            # 更新状态
            if not auto_save:
                message = "题目已覆盖保存至: " if existing_file else "题目已保存至: "
                self.statusBar.showMessage(message + filename, 5000)
            else:
                # 自动收集模式下，发送到进度信息
                if existing_file:
                    self.update_collect_progress(f"题目ID:{question_id} 已更新")
                else:
                    self.update_collect_progress(f"题目ID:{question_id} 已保存")

            # 刷新题目列表
            if self.tabs.currentIndex() == 1:  # 章节管理标签页
                self.refresh_questions()

        except Exception as e:
            if auto_save:
                self.update_collect_progress(f"保存题目失败: {str(e)}")
            else:
                QMessageBox.critical(self, "保存失败", str(e))

    def validate_question_data(self):
        """数据验证逻辑"""
        try:
            data = json.loads(self.json_edit.toPlainText())

            # 检查题目
            if not data.get("question"):
                QMessageBox.warning(self, "数据不完整", "题目内容不能为空")
                return False

            # 检查选项
            options = data.get("options", [])
            if len(options) < 2:
                QMessageBox.warning(self, "选项不足", "至少需要2个选项")
                return False

            # 检查答案
            answer = data.get("answer", "")
            if not answer:
                QMessageBox.warning(self, "数据不完整", "必须指定正确答案")
                return False

            # 检查答案是否存在于选项中
            option_codes = []
            for opt in options:
                # 支持两种格式: "A、选项内容" 或 ["A", "选项内容"]
                if isinstance(opt, str) and len(opt) > 0:
                    option_codes.append(opt[0])  # 取第一个字符作为选项代码
                elif isinstance(opt, list) and len(opt) > 0:
                    option_codes.append(opt[0])

            if answer not in option_codes:
                QMessageBox.warning(
                    self, "答案不匹配", f"答案'{answer}'必须存在于选项中"
                )
                return False

            return True
        except json.JSONDecodeError:
            QMessageBox.critical(self, "格式错误", "请检查JSON格式是否正确")
            return False
        except Exception as e:
            QMessageBox.critical(self, "验证失败", f"数据验证出错: {str(e)}")
            return False

    def export_json(self):
        """完整的章节导出逻辑"""
        try:
            # 获取章节数据
            chapter = self.chapter_manager.current_chapter
            chapter_dir = self.get_chapter_dir()

            if not os.path.exists(chapter_dir):
                raise Exception(f"章节目录不存在: {chapter_dir}")

            # 收集所有题目
            questions = []
            for filename in sorted(os.listdir(chapter_dir)):
                if filename.endswith(".json"):
                    file_path = os.path.join(chapter_dir, filename)
                    with open(file_path, "r", encoding="utf-8") as f:
                        try:
                            data = json.load(f)
                            # 统一数据结构
                            question_item = {
                                "id": data.get("id", ""),
                                "number": len(questions) + 1,  # 根据顺序自动生成序号
                                "question": data.get("question", ""),
                                "options": data.get("options", []),
                                "answer": data.get("answer", ""),
                            }
                            if question_item.get("question"):
                                questions.append(question_item)
                        except json.JSONDecodeError:
                            self.statusBar.showMessage(
                                f"跳过无效JSON文件: {filename}", 3000
                            )
                            continue

            if not questions:
                raise Exception("当前章节没有可导出的题目")

            # 构建导出数据结构
            export_data = {
                "chapters": [
                    {
                        "title": chapter,
                        "questions": sorted(questions, key=lambda x: x.get("id", 0)),
                    }
                ]
            }

            # 选择保存路径
            default_name = f"{chapter}_export_{datetime.now().strftime('%Y%m%d')}.json"
            path, _ = QFileDialog.getSaveFileName(
                self,
                "导出JSON文件",
                os.path.join(self.output_dir, default_name),
                "JSON Files (*.json)",
            )

            if path:
                # 保存文件
                with open(path, "w", encoding="utf-8") as f:
                    json.dump(export_data, f, ensure_ascii=False, indent=2)

                # 显示导出结果
                self.statusBar.showMessage(f"成功导出{len(questions)}道题目", 5000)
                QMessageBox.information(
                    self,
                    "导出完成",
                    f"文件已保存至:\n{path}\n\n包含题目数量: {len(questions)}",
                )

        except Exception as e:
            QMessageBox.critical(self, "导出失败", str(e))

    def copy_raw_text(self):
        """完整的原始文本处理"""
        if not self.last_raw_text:
            QMessageBox.warning(self, "无可用文本", "请先进行OCR识别")
            return

        try:
            # 创建文本查看对话框
            dialog = QDialog(self)
            dialog.setWindowTitle("原始OCR文本")
            dialog.resize(400, 300)

            layout = QVBoxLayout()
            text_edit = QTextEdit()
            text_edit.setPlainText(self.last_raw_text)
            text_edit.setReadOnly(True)

            # 使用标准的Ok按钮，并添加自定义的复制按钮
            btn_box = QDialogButtonBox(QDialogButtonBox.Ok)
            copy_btn = btn_box.addButton("复制", QDialogButtonBox.ActionRole)
            btn_box.accepted.connect(dialog.accept)
            copy_btn.clicked.connect(
                lambda: QApplication.clipboard().setText(self.last_raw_text)
            )

            layout.addWidget(text_edit)
            layout.addWidget(btn_box)
            dialog.setLayout(layout)
            dialog.exec_()

        except Exception as e:
            QMessageBox.critical(self, "操作失败", f"无法处理文本: {str(e)}")

    def extract_question(self):
        """完整的OCR处理流程"""
        if not self.current_image:
            return

        self.json_edit.clear()
        self.statusBar.showMessage("正在分析截图...", 3000)

        # 图像预处理
        processed_image = self.preprocess_image(self.current_image)

        # 创建并启动OCR线程
        self.ocr_thread = OCRThread(processed_image)
        self.ocr_thread.finished.connect(self.process_ocr_result)
        self.ocr_thread.raw_text.connect(self.process_raw_text)
        self.ocr_thread.start()

    def preprocess_image(self, image):
        """图像预处理增强OCR识别率"""
        try:
            # 转换为OpenCV格式
            cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

            # 应用CLAHE增强对比度
            lab = cv2.cvtColor(cv_image, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
            limg = cv2.merge([clahe.apply(l), a, b])

            # 转换为灰度图
            processed = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
            gray = cv2.cvtColor(processed, cv2.COLOR_BGR2GRAY)

            # 二值化处理
            _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)

            return Image.fromarray(thresh)
        except Exception as e:
            print(f"图像预处理失败: {str(e)}")
            return image  # 失败时返回原图

    def take_screenshot(self):
        """获取截图并进行OCR处理"""
        try:
            # 询问是否通过ADB获取屏幕截图
            if self.settings.value("default_adb_address") and self.settings.value(
                "adb_path"
            ):
                reply = QMessageBox.question(
                    self,
                    "截图方式",
                    "是否使用ADB截取连接设备的屏幕？",
                    QMessageBox.Yes | QMessageBox.No,
                    QMessageBox.Yes,
                )

                if reply == QMessageBox.Yes:
                    self.statusBar.showMessage("正在获取屏幕截图...", 3000)
                    # 使用ADB获取截图
                    try:
                        # 创建临时文件
                        temp_file = QTemporaryFile()
                        if temp_file.open():
                            temp_path = temp_file.fileName()
                            temp_file.close()

                            # 执行ADB命令
                            adb_path = self.settings.value("adb_path")
                            device_address = self.settings.value("default_adb_address")

                            # 确保连接
                            subprocess.run(
                                [adb_path, "connect", device_address],
                                check=True,
                                timeout=5,
                                capture_output=True,
                            )

                            # 执行截图命令
                            result = subprocess.run(
                                [adb_path, "exec-out", "screencap -p"],
                                check=True,
                                timeout=5,
                                capture_output=True,
                            )

                            # 保存截图到临时文件
                            with open(temp_path, "wb") as f:
                                f.write(result.stdout)

                            # 加载图像
                            self.current_image = Image.open(temp_path)
                            self.extract_question()
                            return
                        else:
                            raise Exception("无法创建临时文件")
                    except Exception as e:
                        QMessageBox.warning(
                            self,
                            "ADB截图失败",
                            f"使用ADB截图失败: {str(e)}\n将使用系统截图对话框。",
                        )
                # 如果用户选择否或ADB截图失败，使用系统对话框

            # 打开系统截图对话框
            file_path, _ = QFileDialog.getOpenFileName(
                self, "打开图片文件", "", "图片文件 (*.png *.jpg *.jpeg *.bmp)"
            )
            if file_path:
                self.current_image = Image.open(file_path)
                # 保存图片路径到图像对象
                self.current_image.filename = file_path
                self.extract_question()
        except Exception as e:
            QMessageBox.critical(self, "截图失败", f"无法获取截图: {str(e)}")

    def update_chapter_display(self):
        """更新章节显示"""
        self.chapter_label.setText(self.chapter_manager.current_chapter)
        if hasattr(self, "chapter_combo"):
            # 更新下拉框选中项
            index = self.chapter_combo.findText(self.chapter_manager.current_chapter)
            if index >= 0:
                self.chapter_combo.setCurrentIndex(index)

    def process_ocr_result(self, result):
        """处理OCR结果"""
        if "error" in result:
            QMessageBox.warning(self, "OCR识别错误", result["error"])
            return

        # 显示JSON数据
        if result:
            # 添加ID字段
            self.question_counter += 1
            result["id"] = self.question_counter

            # 保存当前题目数据
            self.current_question = result

            # 显示在编辑区
            self.json_edit.setText(json.dumps(result, ensure_ascii=False, indent=2))

            self.statusBar.showMessage("OCR识别完成，请检查并保存", 5000)
        else:
            self.statusBar.showMessage("OCR未返回有效结果", 5000)

    def process_raw_text(self, text):
        """处理原始OCR文本"""
        self.last_raw_text = text

    def change_chapter(self, chapter_name):
        """切换章节"""
        if chapter_name and chapter_name != self.chapter_manager.current_chapter:
            self.chapter_manager.current_chapter = chapter_name
            self.chapter_manager.save_chapters()
            self.update_chapter_display()
            self.refresh_questions()

    def show_add_chapter_dialog(self):
        """显示添加章节对话框"""
        chapter_name, ok = QInputDialog.getText(self, "新增章节", "请输入章节名称:")
        if ok and chapter_name:
            if self.chapter_manager.add_chapter(chapter_name):
                self.chapter_combo.addItem(chapter_name)
                self.chapter_combo.setCurrentText(chapter_name)
                self.statusBar.showMessage(f"章节「{chapter_name}」已创建", 3000)
            else:
                QMessageBox.warning(self, "添加失败", f"章节「{chapter_name}」已存在")

    def show_rename_dialog(self):
        """显示重命名章节对话框"""
        old_name = self.chapter_combo.currentText()
        if not old_name:
            return

        new_name, ok = QInputDialog.getText(
            self, "重命名章节", "请输入新的章节名称:", text=old_name
        )
        if ok and new_name and new_name != old_name:
            if self.chapter_manager.rename_chapter(old_name, new_name):
                # 更新下拉框
                current_index = self.chapter_combo.currentIndex()
                self.chapter_combo.setItemText(current_index, new_name)
                self.statusBar.showMessage(f"章节已重命名为「{new_name}」", 3000)
                self.update_chapter_display()
            else:
                QMessageBox.warning(self, "重命名失败", f"章节「{new_name}」已存在")

    def delete_chapter(self):
        """删除当前章节"""
        chapter_name = self.chapter_combo.currentText()
        if not chapter_name:
            return

        # 确认删除
        reply = QMessageBox.question(
            self,
            "确认删除",
            f"确定要删除章节「{chapter_name}」吗？\n此操作不会删除已保存的题目文件。",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No,
        )

        if reply == QMessageBox.Yes:
            # 删除章节
            if self.chapter_manager.delete_chapter(chapter_name):
                # 更新下拉框
                current_index = self.chapter_combo.currentIndex()
                self.chapter_combo.removeItem(current_index)
                self.statusBar.showMessage(f"章节「{chapter_name}」已删除", 3000)
                self.update_chapter_display()
                self.refresh_questions()
            else:
                QMessageBox.warning(self, "删除失败", "无法删除章节")

    def refresh_questions(self):
        """刷新题目列表"""
        try:
            self.question_table.setRowCount(0)  # 清空表格

            # 获取章节目录
            chapter_dir = self.get_chapter_dir()
            if not os.path.exists(chapter_dir):
                return

            # 读取所有题目
            questions = []
            for filename in os.listdir(chapter_dir):
                if filename.endswith(".json"):
                    file_path = os.path.join(chapter_dir, filename)
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            data = json.load(f)
                            # 构建题目数据，确保包含必要字段
                            question = {
                                "id": data.get("id", ""),
                                "question": data.get("question", ""),
                                "options": data.get("options", []),
                                "answer": data.get("answer", ""),
                                "file_path": file_path,
                            }
                            questions.append(question)
                    except:
                        # 忽略无法解析的文件
                        continue

            # 按ID排序
            questions.sort(key=lambda x: x.get("id", 0))

            # 填充表格
            for i, question in enumerate(questions):
                self.question_table.insertRow(i)

                # ID列
                id_item = QTableWidgetItem(str(question.get("id", "")))
                self.question_table.setItem(i, 0, id_item)

                # 题目列 - 截断显示
                question_text = question.get("question", "")
                if len(question_text) > 50:
                    question_text = question_text[:47] + "..."
                question_item = QTableWidgetItem(question_text)
                self.question_table.setItem(i, 1, question_item)

                # 选项数列
                options_count = len(question.get("options", []))
                options_item = QTableWidgetItem(str(options_count))
                self.question_table.setItem(i, 2, options_item)

                # 答案列
                answer_item = QTableWidgetItem(question.get("answer", ""))
                self.question_table.setItem(i, 3, answer_item)

                # 编辑按钮列
                edit_btn = QPushButton("编辑")
                edit_btn.setProperty("row", i)
                edit_btn.setProperty("file_path", question.get("file_path"))
                edit_btn.clicked.connect(self.edit_question)
                self.question_table.setCellWidget(i, 4, edit_btn)

                # 删除按钮列
                del_btn = QPushButton("删除")
                del_btn.setProperty("row", i)
                del_btn.setProperty("file_path", question.get("file_path"))
                del_btn.clicked.connect(self.delete_question)
                self.question_table.setCellWidget(i, 5, del_btn)

            # 更新状态栏
            self.statusBar.showMessage(f"共加载 {len(questions)} 个题目", 3000)

        except Exception as e:
            self.statusBar.showMessage(f"刷新题目列表失败: {str(e)}", 5000)

    def edit_question(self):
        """编辑按钮点击处理"""
        sender = self.sender()
        if not sender:
            return

        file_path = sender.property("file_path")
        if not file_path or not os.path.exists(file_path):
            QMessageBox.warning(self, "文件不存在", "题目文件不存在，可能已被删除")
            self.refresh_questions()
            return

        # 加载题目数据
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            # 打开编辑对话框
            editor = QuestionEditor(data, self)
            if editor.exec_():
                # 获取修改后的数据
                edited_data = editor.get_data()

                # 合并数据，保留原始元数据
                data["question"] = edited_data["question"]
                data["options"] = edited_data["options"]
                data["answer"] = edited_data["answer"]

                # 保存回文件
                with open(file_path, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)

                self.statusBar.showMessage("题目已更新", 3000)
                self.refresh_questions()

        except Exception as e:
            QMessageBox.critical(self, "编辑失败", f"无法编辑题目: {str(e)}")

    def delete_question(self):
        """删除按钮点击处理"""
        sender = self.sender()
        if not sender:
            return

        file_path = sender.property("file_path")
        if not file_path or not os.path.exists(file_path):
            QMessageBox.warning(self, "文件不存在", "题目文件不存在，可能已被删除")
            self.refresh_questions()
            return

        # 确认删除
        reply = QMessageBox.question(
            self,
            "确认删除",
            "确定要删除该题目吗？此操作不可恢复。",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No,
        )

        if reply == QMessageBox.Yes:
            try:
                # 删除文件
                os.remove(file_path)
                self.statusBar.showMessage("题目已删除", 3000)
                self.refresh_questions()
            except Exception as e:
                QMessageBox.critical(self, "删除失败", f"无法删除题目: {str(e)}")

    def edit_table_question(self, index):
        """表格双击编辑题目"""
        row = index.row()
        # 获取题目文件路径
        edit_btn = self.question_table.cellWidget(row, 4)
        if edit_btn:
            file_path = edit_btn.property("file_path")
            if file_path and os.path.exists(file_path):
                # 使用与编辑按钮相同的处理逻辑
                edit_btn.click()

    def get_chapter_dir(self):
        """获取当前章节的目录路径"""
        chapter_dir = os.path.join(
            self.output_dir,
            re.sub(r'[\\/:*?"<>|]', "_", self.chapter_manager.current_chapter),
        )
        return chapter_dir

    def browse_adb_path(self):
        """浏览选择ADB路径"""
        path, _ = QFileDialog.getOpenFileName(
            self, "选择ADB路径", "", "可执行文件 (*.exe);;所有文件 (*.*)"
        )
        if path:
            self.adb_path_edit.setText(path)

    def browse_output_dir(self):
        """浏览选择输出目录"""
        directory = QFileDialog.getExistingDirectory(
            self, "选择输出目录", self.output_dir
        )
        if directory:
            self.output_dir_edit.setText(directory)

    def save_settings(self):
        """保存设置"""
        try:
            # 保存ADB路径
            adb_path = self.adb_path_edit.text().strip()
            if adb_path:
                self.settings.setValue("adb_path", adb_path)

            # 保存设备地址
            device_address = self.device_address_edit.text().strip()
            if device_address:
                self.settings.setValue("default_adb_address", device_address)

            # 保存输出目录
            output_dir = self.output_dir_edit.text().strip()
            if output_dir and os.path.isdir(output_dir):
                self.settings.setValue("output_dir", output_dir)
                self.output_dir = output_dir

            self.statusBar.showMessage("设置已保存", 3000)
        except Exception as e:
            QMessageBox.critical(self, "保存失败", f"无法保存设置: {str(e)}")

    def test_adb_connection(self):
        """测试ADB连接"""
        try:
            adb_path = self.adb_path_edit.text().strip()
            device_address = self.device_address_edit.text().strip()

            if not adb_path or not device_address:
                QMessageBox.warning(self, "参数不足", "请输入ADB路径和设备地址")
                return

            # 执行连接命令
            result = subprocess.run(
                [adb_path, "connect", device_address],
                check=True,
                capture_output=True,
                text=True,
                timeout=5,
            )

            # 检查连接结果
            if "connected to" in result.stdout or "already connected" in result.stdout:
                QMessageBox.information(
                    self, "连接成功", f"成功连接到设备: {device_address}"
                )
            else:
                QMessageBox.warning(
                    self, "连接失败", f"无法连接到设备: {result.stdout}"
                )
        except Exception as e:
            QMessageBox.critical(self, "连接错误", f"ADB连接失败: {str(e)}")


if __name__ == "__main__":
    QApplication.setAttribute(Qt.AA_EnableHighDpiScaling)
    app = QApplication(sys.argv)
    window = QuizCaptureApp()
    window.show()
    sys.exit(app.exec_())
