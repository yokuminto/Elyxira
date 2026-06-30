# 架构决策记录 — Elyxira

### 1. 绯想击破独立模块架构
**日期**: 2026-06-17
**决策**: break 模式完全独立于 normal quiz 模式，不共享状态、不修改 quiz 代码。
**理由**: quiz 模式已有稳定用户，break 是全新的游戏化模式。隔离可避免相互污染，也便于后续独立维护。

### 2. 视觉设计统一采用 quiz 蓝白风格
**日期**: 2026-06-17
**决策**: 废除最初设计的暗黑科幻主题，与刷题模式共用同一套 CSS 变量体系。
**理由**: 用户反馈暗黑风格与平台整体不协调。统一视觉减少认知负担和维护成本。

### 3. 笔记存储使用独立 localStorage key **[SUPERSEDED by §13 (2026-06-25)]**
**日期**: 2026-06-17
**决策**: ~~break 模式的笔记用 `localStorage.break_notes` 键存取，不使用 `configService.saveNoteToQuestion()`。~~
**当前**: 已迁移至 IndexedDB（见 §13）。

### 4. 角色系统简化：移除稀有度、科目亲和
**日期**: 2026-06-17
**决策**: 移除 `rarity` 和 `organAffinity` 字段，保留 `starLevel`（1-3 星），重复获取升星。

### 5. 使用 npm 作为统一包管理器
**日期**: 2026-06-17 / 修订 2026-06-18
**决策**: 全局使用 npm，CI 和本地开发统一。
**理由**: 项目使用 npm + package-lock.json 管理依赖。npm 11.x 的 exit handler never called bug 已在 npm 11.18 修复；当前项目 npm 11.11，建议 `npm i -g npm@11.18`。

### 6. 代码搬迁必须逐行复制
**日期**: 2026-06-17
**决策**: 从参考源搬迁代码时，禁止精简、简化。做最小化的适配修改。

### 7. 保留帕秋莉角色（移除 knowledge_card 技能接入）
**日期**: 2026-06-18 / 修订 2026-06-28
**决策**: 原定移除帕秋莉及其 knowledge_card 技能。实际数据文件 `break-characters.json` 中仍保留帕秋莉（8 角色总数）。
**理由**: 知识卡片效果（阅读笔记）与现有笔记面板功能重叠，但角色数据已配置完整，保留不破坏游戏平衡。
**当前状态**: 8 角色（含帕秋莉），knowledge_card 类型未接入运行时逻辑。

### 8. 商店简化为纯角色招募
**日期**: 2026-06-18
**决策**: 商店只卖角色（3 个，30 星琼/个），移除 Buff 商品。刷新消耗 5 星琼。
**理由**: Buff 系统（ExtraBreak/StarJadeBoost/CombatResume）增加复杂度但交互收益低，简化为纯角色获取渠道更直观。

### 9. AI 流式渲染去除节流
**日期**: 2026-06-18
**决策**: 移除 `handleStreamChunk` 中的 250ms `setTimeout` 节流，改为每 chunk 直接 `renderNotes()`。
**理由**: 节流导致最后一帧的渲染回调被 `handleCompletion` 中的 `clearTimeout` 取消，造成内容截断。

### 10. TextDecoder 流式缓冲区 flush
**日期**: 2026-06-18
**决策**: SSE 流结束后调用 `decoder.decode()`（无参）清空内部缓冲区。
**理由**: `decode(chunk, { stream: true })` 会在内部缓冲不完整的多字节字符，流结束不 flush 会丢失最后几个字节。

### 11. 节点奖励重平衡
**日期**: 2026-06-18
**决策**: 普通 10 / 精英 20 / Boss 40 / 奖励 20，完美通关回复 5HP。
**理由**: 旧值（2/5/10/0）太低，角色招募 30 星琼难以负担。完美通关回复增加容错。

### 12. `<think>` 标签跨 chunk 流式过滤
**日期**: 2026-06-18
**决策**: 用状态机缓冲区处理 `<think>` 标签，而非单 chunk 正则匹配。
**理由**: SSE 流中 `<think>...</think>` 可能横跨多个 chunk，单 chunk 正则无法匹配。

### 13. 存储从 localStorage 迁移到 IndexedDB
**日期**: 2026-06-25
**决策**: break_notes/break_tags 从 localStorage（5MB 硬上限）迁移到 IndexedDB（浏览器配额 ~50% 磁盘空间）。
**理由**: 100+ AI 笔记总计可达数 MB，localStorage 单 key 和总量均不满足。分片只能缓解单 key 问题，总量瓶颈需 IndexedDB 解决。
**影响**: 新增 breakStorage.ts 模块，所有读写通过该模块。首次加载自动从 localStorage 迁移旧数据（含分片）。

### 14. 8 盒加权预抽题池（修订）
**日期**: 2026-06-25 / **修订**: 2026-06-27
**决策**: 废弃旧的全题库洗牌→顺序消费方案，改为三阶段预抽。

**阶段 1 — 全题库分类**：`_buildFullBoxes()` 遍历全部 `allQuestions`，每道题根据跨局答题统计（`getStats()`）调用 `_classifyBox()` 分入 8 个盒子之一。时间复杂度 O(N)，N 为题目总数。

**阶段 2 — 按预期消耗 ×1.5 预抽**：`_preDrawFromFullBoxes()` 计算每盒预期被抽次数：
```
expectedPerBox[i] = Σ(每个非商店/补给节点 toughness × weight[i] / 100)
预抽数 = ceil(expected × 1.5)
```
从各盒的全题库分类中不重复随机取题，跨盒间 `usedIds` Set 去重。产出 `_preDrawnBoxes`（8 盒 × N 题）。所有预抽 ID 扁平化为 `preDrawnQuestionIds`，供补给站 AI 批量生成。

**阶段 3 — 运行时三级回退抽题**：`_drawQuestion(nodeType)`
1. 一级：加权随机命中盒 i → `_preDrawnBoxes[i]` 随机取（有 AI 笔记覆盖）
2. 二级：预抽盒空 → `_buildFullBoxes()[i]` 同号全量盒（分类正确，无笔记）
3. 三级：同号全量也空 → 兜底链 `FALLBACK_CHAINS[阶段]` 依次尝试各盒（先预抽再全量）
4. 全题库随机兜底

**理由**: 全题库分类保证分类准确性（基于完整答题数据）。预抽保证补给站 AI 批量生成的笔记覆盖本轮所有可能抽到的题目。1.5× 缓冲覆盖答错重试的额外消耗。三级回退在预抽耗尽时优雅降级。

**影响**: `_sessionPool` / `_drawFromPool()` 完全移除。新增 `_buildFullBoxes()`、`_preDrawFromFullBoxes()`、`_drawFromBox()`。`_drawQuestion()` 重写为三级回退版本。

### 15. 8 盒分类规则与三阶段动态权重
**日期**: 2026-06-27
**决策**: 引入基于答题统计的 8 题盒分类和跨局累积进度自动切换的三阶段权重表。

**8 盒优先级分类**（`_classifyBox`，O(1) 时间复杂度）：
1. 难题 — 次数>3 ∧ 平均耗时>16s ∧ 最近错，或连续错≥3
2. 顽固 — 次数>3 ∧ 最近4次错≥2
3. 波动 — 次数>3 ∧ 最近3次错恰好1
4. 奖励 — 次数>5 ∧ 平均耗时≤16s ∧ 最近5次全对
5. 复杂 — 次数>3 ∧ 平均耗时>16s ∧ 最近3次全对
6. 熟悉 — 次数>3 ∧ 平均耗时≤16s ∧ 最近3次全对
7. 陌生 — 兜底（做过但不满足 1-6）
8. 未做 — 无记录

**三阶段阈值**：一期（完成率<30%）→ 二期（30-60%）→ 三期（≥60%），`_computePhase()` 在 `initGame` 时从 `getStats()` 跨局累积判定，整局不变。

**权重表**：3 阶段 × 4 节点类型（Boss/精英/普通/奖励）= 12 行，每行 8 个权重值（总和 100）。

**安全阀**：单盒权重 ≤ 40%，超出部分按原始比例重分配给其他非空盒。

**兜底链**：三个阶段各一条优先级序列，决定加权抽题全部失败时的回退顺序。奖励题位置随阶段前移（一期末位 → 三期紧随波动）。

**理由**: 静态权重表 + 自动阶段切换让抽题策略随玩家进度自然演进，不必每次手动调参。40% 安全阀防止单一盒子垄断抽题（如三期 Boss 难题权重 35，不触发安全阀；若人为调到 50 则被裁）。兜底链的阶段差异化保证奖励题在一期当调剂、三期当主菜。

### 16. GitHub 同步使用 Git Data API 批量提交
**日期**: 2026-06-25
**决策**: 推送使用 Git Data API 一次性创建 tree + commit（5 次请求），而非逐文件 PUT（2N 次请求）。
**理由**: 逐文件 PUT 对已存在文件必先 GET SHA→422 重试，慢且产生大量 422 错误。Git Data API 的 base_tree 机制自动保留不相关文件。
**影响**: useBreakSync._githubBatchPush() 替代 _githubUpsert()。

### 17. AI 提示词板块职责分离
**日期**: 2026-06-25
**决策**: 知识点精讲只讲知识不讲本题，答案分析放入独立的 📌答案/锁定答案板块，考点速记只出脱离题目的记忆卡片。
**理由**: 旧提示词在知识点精讲里写"为什么选这个不选那个"，混淆了知识教学和题目分析。学生在知识板块看到选项讨论会困惑。
**影响**: medical_professor.txt 全面重构，新增板块职责定义表 + 各板块禁止项。

### 18. 击破字段从角色数据迁移到全局状态
**日期**: 2026-06-25
**决策**: 将 `StarEffect.breakBonus`（每个角色的击破加成）删除，改为 `BreakProgress` 上的三个全局字段：`baseBreak`（基础击破, 默认 1）、`breakMultiplier`（击破倍数, 默认 1）、`breakBonus`（击破加成 flat, 默认 0）。击破公式变更为 `baseBreak * breakMultiplier + breakBonus + genki + extraBreakCharges`。
**理由**: 当前所有角色击破倍数均为 1，无技能修改击破值。旧 `breakBonus` 字段语义模糊（是 flat 还是 multiplier？取 max 还是 sum？），且角色数据中 0/1/2 的值无技能描述对应。新设计将击破参数集中到全局运行时状态，未来技能通过修改 `gameState.progress` 上的全局变量生效，不碰角色数据。
**影响**: `StarEffect` 删除 `breakBonus`；`BreakProgress` 新增 3 字段；`_getActiveBonuses()` 不再聚合 breakBonus；`CHARACTER_POOL` + JSON ×2 移除全部 `breakBonus` 值。

### 19. P2P 同步选 PIN + 信令中继（非 QR 直传 SDP）
**日期**: 2026-06-30
**决策**: 设备间同步选 PIN（6 位数字）+ 自部署 Cloudflare Worker 信令 + y-webrtc `password=PIN` 内建加密的方式，不选纯 QR 传 SDP 也不引入第三方云盘账号体系。
**理由**: 浏览器沙箱不允许原始 UDP/multicast，"插同一 WiFi 自动同步"做不到。纯 QR 单传 SDP 受 ICE candidates 众多限制（需 scan 多张 QR），且仅 LAN 可用。PIN + 中继允许跨网络；y-webrtc 自带 3 个公共信令已全死（heroku shutdown），自部署 Worker 免费层 100k req/天足够私人配对。y-webrtc 内置 password 参数走 PBKDF2(100k)+AES-GCM 自动加密全部信令 + DataChannel 流量，无需自己实现 crypto 代码。PIN 既是房间名又是密钥源，单因子即可。
**影响**: 新增 `cloudflare-worker/`（Worker + Durable Object）+ `src/services/p2p-sync.ts`（Yjs + y-webrtc + y-indexeddb）+ `src/modals/modal-p2p-sync.vue`。用户需自行 `wrangler deploy` 信令服务器（默认 URL 占位未部署）。

### 20. P2P 镜像数据范围与脱敏策略
**日期**: 2026-06-30
**决策**: 入 Yjs CRDT 文档的数据集为 `app_settings`（脱敏 githubConfig.token 与 apiPresets[].apiKey 为空串）、`quizStats`、`quizConfig`（chapter/mode/range 4 个 UI 状态键）、`breakNotes`、`breakTags`、`breakStats` 共 6 类。不入 CRDT 的有 `quizData`/`quizCache_*`（500KB-2MB×N 大体积，GitHub repo 同步已覆盖元数据）、`lastRouteError`/`lastQuizStats`/`syncName_*`（瞬时 UI 不必跨设备）。
**理由**: 选 6 类数据体积小、变更频繁、合并语义清晰（CRDT Y.Map 按 key LWW）。脱敏因为 P2P 通道虽加密但每设备各持自有 GitHub PAT 才安全，远端 apply 时由 `_mergeRemoteSettingsIntoLocal` 按 name 对齐 apiPresets 复用本地 apiKey，token 不被广播。
**影响**: `configService` 写 `_sanitizeSettingsForP2P` + `_mergeRemoteSettingsIntoLocal` 两个 helper；`breakStorage` 9 个 set/merge 函数末尾各加一行 `mirrorToYjs`；3 个 save 函数末尾加 `mirrorToYjs`；constructor 末尾 `_registerP2PHooks` 注册 3 个 subscribe + 1 个 addSnapshotProvider。

### 21. P2P 防回环：`_isApplyingRemote` flag
**日期**: 2026-06-30
**决策**: `p2p-sync.ts` 的 `mirrorToYjs` 函数入口检查 `_isApplyingRemote` flag，true 时立即 skip；`_triggerChangeCallbacks` 在执行订阅 callback 前后包裹 set/reset 该 flag。
**理由**: 远端 update → subscribe callback → 业务模块写本地存储 → saveSettings 触发 `mirrorToYjs` → 又写 Yjs 文档 → 触发一遍远端 update → 死循环。`_isApplyingRemote` 在 callback 同步段内 true 阻断反向写。callback 内的异步工作 fire-and-forget 不受影响（flag 在同步段结束已 reset）。
**影响**: mirrorToYjs / _triggerChangeCallbacks 这一对组合自动防止回环。业务模块集成时无需感知，subscribe callback 内只管同步写本地，无需手动抑制 mirror。
