import os
import argparse
import sys
import shutil
import glob
import re


def rename_file(target_path, new_name):
    """
    重命名指定的文件。

    Args:
        target_path (str): 要重命名的文件的完整路径或相对路径。
        new_name (str): 文件的新名称（不包含路径）。
    """
    if not os.path.exists(target_path):
        print(f"错误：文件 '{target_path}' 不存在。", file=sys.stderr)
        return False

    if not os.path.isfile(target_path):
        print(f"错误：'{target_path}' 不是一个文件。", file=sys.stderr)
        return False

    dir_path = os.path.dirname(target_path)
    new_path = os.path.join(dir_path, new_name)

    if os.path.exists(new_path):
        print(f"错误：目标名称 '{new_path}' 已存在。", file=sys.stderr)
        return False

    try:
        os.rename(target_path, new_path)
        print(f"成功将 '{target_path}' 重命名为 '{new_path}'")
        return True
    except OSError as e:
        print(f"错误：重命名文件时出错: {e}", file=sys.stderr)
        return False


def delete_file(target_path):
    """
    删除指定的文件。

    Args:
        target_path (str): 要删除的文件的完整路径或相对路径。
    """
    if not os.path.exists(target_path):
        print(f"错误：文件 '{target_path}' 不存在。", file=sys.stderr)
        return False

    if not os.path.isfile(target_path):
        print(f"错误：'{target_path}' 不是一个文件。", file=sys.stderr)
        return False

    try:
        os.remove(target_path)
        print(f"成功删除文件 '{target_path}'")
        return True
    except OSError as e:
        print(f"错误：删除文件时出错: {e}", file=sys.stderr)
        return False


def move_file(source_path, destination):
    """
    移动文件到指定目标位置。

    Args:
        source_path (str): 要移动的文件的完整路径或相对路径。
        destination (str): 目标路径（文件夹路径或新的文件路径）。
    """
    if not os.path.exists(source_path):
        print(f"错误：源文件 '{source_path}' 不存在。", file=sys.stderr)
        return False

    if not os.path.isfile(source_path):
        print(f"错误：'{source_path}' 不是一个文件。", file=sys.stderr)
        return False

    # 如果目标是目录，则保持原文件名
    if os.path.isdir(destination):
        dest_path = os.path.join(destination, os.path.basename(source_path))
    else:
        dest_path = destination
        # 确保目标目录存在
        dest_dir = os.path.dirname(dest_path)
        if dest_dir and not os.path.exists(dest_dir):
            try:
                os.makedirs(dest_dir)
            except OSError as e:
                print(f"错误：创建目标目录时出错: {e}", file=sys.stderr)
                return False

    # 检查目标文件是否已存在
    if os.path.exists(dest_path):
        # 修复：先检查目标是否与源相同，只有在不同文件时才报错
        try:
            if os.path.exists(source_path) and os.path.samefile(source_path, dest_path):
                print(f"错误：源文件和目标文件相同。", file=sys.stderr)
                return False
            print(f"错误：目标文件 '{dest_path}' 已存在。", file=sys.stderr)
            return False
        except OSError:
            # 如果samefile抛出错误（可能在某些操作系统上出现）
            print(f"错误：目标文件 '{dest_path}' 已存在。", file=sys.stderr)
            return False

    try:
        shutil.move(source_path, dest_path)
        print(f"成功将 '{source_path}' 移动到 '{dest_path}'")
        return True
    except OSError as e:
        print(f"错误：移动文件时出错: {e}", file=sys.stderr)
        return False


def list_directory(dir_path, recursive=False):
    """
    列出指定目录中的内容。

    Args:
        dir_path (str): 目录路径。
        recursive (bool): 是否递归列出子目录内容。
    """
    if not os.path.exists(dir_path):
        print(f"错误：目录 '{dir_path}' 不存在。", file=sys.stderr)
        return False

    if not os.path.isdir(dir_path):
        print(f"错误：'{dir_path}' 不是一个目录。", file=sys.stderr)
        return False

    try:
        if recursive:
            print(f"递归列出目录 '{dir_path}' 的内容:")
            for root, dirs, files in os.walk(dir_path):
                level = root.replace(dir_path, "").count(os.sep)
                indent = " " * 4 * level
                print(f"{indent}{os.path.basename(root)}/")
                sub_indent = " " * 4 * (level + 1)
                for f in files:
                    print(f"{sub_indent}{f}")
        else:
            print(f"列出目录 '{dir_path}' 的内容:")
            for item in os.listdir(dir_path):
                item_path = os.path.join(dir_path, item)
                if os.path.isdir(item_path):
                    print(f"    {item}/")
                else:
                    print(f"    {item}")
        return True
    except OSError as e:
        print(f"错误：列出目录内容时出错: {e}", file=sys.stderr)
        return False


def search_files(directory, pattern, recursive=False):
    """
    在指定目录中搜索匹配模式的文件。

    Args:
        directory (str): 搜索的起始目录。
        pattern (str): 搜索模式（支持glob通配符和正则表达式）。
        recursive (bool): 是否递归搜索子目录。
    """
    if not os.path.exists(directory):
        print(f"错误：目录 '{directory}' 不存在。", file=sys.stderr)
        return False

    if not os.path.isdir(directory):
        print(f"错误：'{directory}' 不是一个目录。", file=sys.stderr)
        return False

    try:
        # 检查pattern是否为正则表达式
        is_regex = False
        try:
            re.compile(pattern)
            # 如果包含典型的正则字符但不是glob通配符
            if any(c in pattern for c in ".?+*[](){}|^$\\") and not any(
                c in pattern for c in "*?"
            ):
                is_regex = True
        except re.error:
            pass

        matches = []
        if recursive:
            if is_regex:
                # 使用正则表达式搜索
                regex = re.compile(pattern)
                for root, _, files in os.walk(directory):
                    for file in files:
                        if regex.search(file):
                            matches.append(os.path.join(root, file))
            else:
                # 使用glob搜索
                search_pattern = os.path.join(directory, "**", pattern)
                matches = glob.glob(search_pattern, recursive=True)
        else:
            if is_regex:
                # 使用正则表达式搜索（仅当前目录）
                regex = re.compile(pattern)
                for file in os.listdir(directory):
                    if regex.search(file) and os.path.isfile(
                        os.path.join(directory, file)
                    ):
                        matches.append(os.path.join(directory, file))
            else:
                # 使用glob搜索（仅当前目录）
                search_pattern = os.path.join(directory, pattern)
                matches = glob.glob(search_pattern)

        if matches:
            print(
                f"在 '{directory}' {'及其子目录' if recursive else ''} 中找到 {len(matches)} 个匹配项:"
            )
            for match in matches:
                print(f"    {match}")
        else:
            print(
                f"在 '{directory}' {'及其子目录' if recursive else ''} 中未找到匹配 '{pattern}' 的文件。"
            )

        return True
    except Exception as e:
        print(f"错误：搜索文件时出错: {e}", file=sys.stderr)
        return False


def process_multiple_files(operation, files, target=None, recursive=False):
    """
    对多个文件执行相同的操作。

    Args:
        operation (function): 要执行的操作函数。
        files (list): 要处理的文件列表或模式。
        target (str, optional): 目标路径（用于移动和重命名操作）。
        recursive (bool): 是否递归处理目录（用于列出和搜索操作）。
    """
    # 展开文件通配符
    expanded_files = []
    for file_pattern in files:
        # 修复：使用recursive=True以支持**通配符
        matching_files = glob.glob(file_pattern, recursive=True)
        if not matching_files:
            print(f"警告：没有找到匹配 '{file_pattern}' 的文件。")
        expanded_files.extend(matching_files)

    if not expanded_files:
        print("错误：没有找到任何匹配的文件。", file=sys.stderr)
        return False

    success_count = 0
    for file_path in expanded_files:
        if operation == rename_file and target:
            # 为每个文件生成新名称
            if len(expanded_files) == 1:
                # 单文件重命名，直接使用提供的新名称
                success = rename_file(file_path, target)
            else:
                # 多文件重命名，根据原名生成新名称
                old_name = os.path.basename(file_path)
                # 改进替换逻辑：检查是否包含*作为替换标记
                if "*" in target:
                    new_name = target.replace("*", old_name)
                else:
                    # 如果没有替换模式，添加前缀或后缀
                    base, ext = os.path.splitext(old_name)
                    new_name = f"{target}{ext}"
                success = rename_file(file_path, new_name)
        elif operation == move_file and target:
            success = move_file(file_path, target)
        elif operation == delete_file:
            success = delete_file(file_path)
        elif operation == list_directory:
            success = list_directory(file_path, recursive)
        elif operation == search_files and target:
            success = search_files(file_path, target, recursive)
        else:
            print(f"错误：无效的操作或缺少必要参数。", file=sys.stderr)
            return False

        if success:
            success_count += 1

    print(f"成功处理了 {success_count}/{len(expanded_files)} 个文件。")
    return success_count > 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="文件操作工具")

    # 添加所有子命令
    subparsers = parser.add_subparsers(dest="command", help="要执行的命令")

    # 重命名命令
    rename_parser = subparsers.add_parser("rename", help="重命名文件")
    rename_parser.add_argument(
        "source", nargs="+", help="要重命名的文件路径（支持通配符）"
    )
    rename_parser.add_argument(
        "new_name", help="新的文件名（对于多文件，可使用*作为替换标记）"
    )

    # 删除命令
    delete_parser = subparsers.add_parser("delete", help="删除文件")
    delete_parser.add_argument(
        "files", nargs="+", help="要删除的文件路径（支持通配符）"
    )

    # 移动命令
    move_parser = subparsers.add_parser("move", help="移动文件")
    move_parser.add_argument("source", nargs="+", help="要移动的文件路径（支持通配符）")
    move_parser.add_argument("destination", help="目标路径（文件夹或新的文件路径）")

    # 列出目录内容命令
    list_parser = subparsers.add_parser("list", help="列出目录内容")
    list_parser.add_argument("directory", nargs="+", help="要列出内容的目录路径")
    list_parser.add_argument(
        "-r", "--recursive", action="store_true", help="递归列出子目录内容"
    )

    # 搜索文件命令
    search_parser = subparsers.add_parser("search", help="搜索文件")
    search_parser.add_argument("directory", nargs="+", help="要搜索的目录路径")
    search_parser.add_argument("pattern", help="搜索模式（支持通配符和正则表达式）")
    search_parser.add_argument(
        "-r", "--recursive", action="store_true", help="递归搜索子目录"
    )

    # 兼容旧版接口的参数 - 只在没有子命令时生效
    parser.add_argument("--legacy", action="store_true", help="使用旧版接口")
    parser.add_argument("file_path", nargs="?", help="文件路径")
    parser.add_argument("file_name", nargs="?", help="新文件名")

    args = parser.parse_args()

    # 处理命令
    if args.command == "rename":
        process_multiple_files(rename_file, args.source, args.new_name)
    elif args.command == "delete":
        process_multiple_files(delete_file, args.files)
    elif args.command == "move":
        process_multiple_files(move_file, args.source, args.destination)
    elif args.command == "list":
        process_multiple_files(list_directory, args.directory, recursive=args.recursive)
    elif args.command == "search":
        process_multiple_files(
            search_files, args.directory, args.pattern, args.recursive
        )
    # 处理旧版接口
    elif args.legacy and args.file_path and args.file_name:
        rename_file(args.file_path, args.file_name)
    # 自动检测旧版接口使用
    elif not args.command and args.file_path and args.file_name:
        rename_file(args.file_path, args.file_name)
    else:
        parser.print_help()
        sys.exit(1)
