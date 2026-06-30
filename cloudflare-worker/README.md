# Elyxira P2P 同步信令服务器

Cloudflare Workers + Durable Object 实现的轻量 WebSocket 信令中继，用于 Elyxira 的 P2P 配对同步功能。

## 部署

```bash
cd cloudflare-worker
npm install -g wrangler       # 如未安装
wrangler login                # 一次登录
wrangler deploy
```

部署后会得到 `wss://elyxira-signal.<your-subdomain>.workers.dev`。

## 客户端配置

把生成的 URL 填入 Elyxira 设置 → P2P 同步 → 信令服务器地址 字段。

## 协议

- `GET /health` — 健康检查
- `WS /ws/{PIN}` — 进入 PIN 房间，最多 2 peer

消息格式一致 y-webrtc 信令（`{type: 'publish', topic, ...}`），转发不解析、不存储——PIN 协商完成后客户端 P2P 直连，服务器对内容**完全无知**（y-webrtc 客户端会以 password 参数对载荷加 AES-GCM）。

## 免费层

100k 请求/日 + Durable Object 频率计费 —— Elyxira 私人 P2P 配对完全够用，零成本。