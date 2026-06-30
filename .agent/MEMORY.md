# Agent 自学习记忆

> Hard cap: 2,200 chars (~500 tokens)。超限时必须 consolidate（去重 + 删过时 → 留最多 4 条）。

## 2026-06-30 — P2P 同步
- y-webrtc 三个公共信令服务器全死（heroku shutdown），**必须自部署** `cloudflare-worker/`；默认 URL `wss://elyxira-signal.workers.dev` 是占位符
- y-webrtc 的 `password` 参数从 PIN 派生密钥，内建 PBKDF2(100k)+AES-GCM，不需要自己写 crypto
- `p2p-sync.ts` 的 `mirrorToYjs()` 在 `_isApplyingRemote=true` 时自动 skip，防止远端 apply → 写本地 → mirror → broadcast 死循环
- 信令服务器单房间 2-peer 上限（`this.peers.size >= 2 → 409`），多于两台设备需扩 mesh

## 2026-06-28 — 8 盒抽题
- 抽题从有放回切换无放回时容易漏消费语义 → 重复题 bug。新系统上线第一件事：验证 `splice`/`shift` 抽走 + `Set` 跨盒去重
- Vue watcher + 对象引用：修改嵌套对象必须返回新引用 `{ ...obj }`，原地改 `obj.nested = x` 不触发 watcher
- `_ensureDB` 自动升迁：opening → check stores → close → increment version → reopen，任何缺 store 场景通用
