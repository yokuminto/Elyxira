/**
 * cloudflare-worker/worker.mjs — Elyxira P2P 同步信令服务器
 *
 * 基于 Cloudflare Workers + Durable Object 实现。每间房间对应一个 Durable Object
 * 实例，房间名 = 6 位配对 PIN。最多两个 peer（发起方 + 加入方）。
 *
 * 协议（参考 y-webrtc 信令协议，简化为 2-peer 场景）：
 *   客户端 → 服务器：subscribe / unsubscribe / publish / ping
 *   服务器 → 客户端：publish（转发其他 peer 消息）/ ready（slot 分配）/ presence（人数）
 *
 * 部署：wrangler deploy
 * 免费层：100k req/天，足够 P2P 配对（每对只建立 1-2 个 WebSocket）。
 */

// ─── Durable Object：单间配对房间 ─────────────────────────────

export class PairingRoom {
  constructor(state, env) {
    this.state = state
    this.env = env
    /** @type {Map<string, WebSocket>} slot → socket */
    this.peers = new Map()
  }

  /** 处理 HTTP 请求；只接受 WebSocket 升级 */
  async fetch(request) {
    const upgrade = request.headers.get('Upgrade')
    if (upgrade !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 })
    }

    // 房间满（已 2 人）→ 拒绝
    if (this.peers.size >= 2) {
      return new Response('Room is full', { status: 409 })
    }

    // 分配槽位：第一个进来的 = a（发起方），第二个 = b（加入方）
    const slot = this.peers.has('a') ? 'b' : 'a'

    const pair = new WebSocketPair()
    const [client, server] = Object.values(pair)
    server.accept()
    this.peers.set(slot, server)

    this._send(server, { type: 'ready', slot, initiator: slot === 'a' })
    this._broadcast({ type: 'presence', count: this.peers.size })

    server.addEventListener('message', (event) => {
      let msg
      try {
        msg = JSON.parse(event.data)
      } catch (e) {
        // 解析失败 → 忽略；不抛错以免断连
        return
      }
      // 转发给其他 peer（典型 y-webrtc 信令消息：publish + topic）
      if (msg && msg.type === 'publish' && msg.topic) {
        for (const [s, peer] of this.peers) {
          if (s !== slot) {
            this._send(peer, msg)
          }
        }
      } else if (msg && msg.type === 'ping') {
        this._send(server, { type: 'pong' })
      }
    })

    const cleanup = () => {
      this.peers.delete(slot)
      this._broadcast({ type: 'presence', count: this.peers.size })
    }
    server.addEventListener('close', cleanup)
    server.addEventListener('error', cleanup)

    return new Response(null, { status: 101, webSocket: client })
  }

  /** 安全发送（忽略中断的 socket） */
  _send(peer, msg) {
    try {
      peer.send(JSON.stringify(msg))
    } catch (e) {
      // 静默失败；close 事件会触发清理
    }
  }

  /** 广播给房间内所有 peer */
  _broadcast(msg) {
    for (const peer of this.peers.values()) {
      this._send(peer, msg)
    }
  }
}

// ─── Worker 入口：路由 /ws/{PIN} → 房间 DO ───────────────────

export default {
  /** 健康检查根路径 */
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response(JSON.stringify({ ok: true, service: 'elyxira-signal', ts: Date.now() }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // /ws/{PIN} → 路由到对应 Durable Object
    if (url.pathname.startsWith('/ws/')) {
      const pin = url.pathname.split('/')[2]
      if (!pin || !/^\d{4,6}$/.test(pin)) {
        return new Response('Invalid PIN', { status: 400 })
      }
      const id = env.PAIRING_ROOM.idFromName(pin)
      return env.PAIRING_ROOM.get(id).fetch(request)
    }

    return new Response('Not found', { status: 404 })
  },
}