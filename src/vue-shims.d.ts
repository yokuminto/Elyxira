declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>
  export default component
}

// y-webrtc 没有官方类型声明
declare module 'y-webrtc' {
  import type { Doc } from 'yjs'
  export interface WebrtcProvider {}
  export class WebrtcProvider {
    constructor(
      roomName: string,
      ydoc: Doc,
      opts?: {
        signaling?: string[]
        password?: string
        maxConns?: number
        filterBcConns?: boolean
        awareness?: unknown
        peerOpts?: unknown
      }
    )
    destroy(): void
    connect(): void
    disconnect(): void
    readonly awareness: {
      clientID: number
      setLocalStateField(key: string, value: unknown): void
      setLocalState(state: unknown): void
      getLocalState(): unknown
      getStates(): Map<number, unknown>
      on(type: string, cb: (...args: unknown[]) => void): void
      off(type: string, cb: (...args: unknown[]) => void): void
    }
    readonly roomName: string
    readonly connected: boolean
    on(type: string, cb: (...args: unknown[]) => void): void
    off(type: string, cb: (...args: unknown[]) => void): void
    readonly peers: unknown[]
  }
}

// y-indexeddb 类型简化声明
declare module 'y-indexeddb' {
  import type { Doc } from 'yjs'
  export interface IndexeddbPersistence {}
  export class IndexeddbPersistence {
    constructor(roomName: string, ydoc: Doc)
    on(type: string, cb: (...args: unknown[]) => void): void
    off(type: string, cb: (...args: unknown[]) => void): void
    destroy(): void
    readonly synced: boolean
    flush(): void
  }
}