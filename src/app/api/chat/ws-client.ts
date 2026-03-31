/**
 * WebSocket client manager for OpenClaw gateway connections
 * Maintains persistent WS connections per user, with auto-reconnect
 */

import WebSocket from 'ws'
import { v4 as uuidv4 } from 'uuid'

interface OpenClawMessage {
  type: 'req' | 'res' | 'event'
  id: string
  method?: string
  params?: Record<string, unknown>
  payload?: Record<string, unknown>
  error?: { code: string; message: string }
}

interface ConnectionState {
  ws: WebSocket
  userId: string
  gatewayUrl: string
  gatewayToken: string
  messageHandlers: Map<string, (msg: OpenClawMessage) => void>
  eventHandlers: ((msg: OpenClawMessage) => void)[]
  reconnectAttempts: number
  isConnected: boolean
  connectPromise: Promise<void> | null
}

const connections = new Map<string, ConnectionState>()
const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_DELAY_MS = 2000

function getConnectionKey(userId: string): string {
  return `user:${userId}`
}

async function connectWebSocket(state: ConnectionState): Promise<void> {
  if (state.connectPromise) {
    return state.connectPromise
  }

  state.connectPromise = new Promise((resolve, reject) => {
    const wsUrl = state.gatewayUrl.replace(/^http/, 'ws')
    
    console.log(`[WS] Connecting to ${wsUrl} for user ${state.userId}`)
    
    const ws = new WebSocket(wsUrl, {
      handshakeTimeout: 10000,
    })

    ws.on('open', () => {
      console.log(`[WS] Connected for user ${state.userId}`)
      state.isConnected = true
      state.reconnectAttempts = 0
      
      // Send connect handshake
      const connectMsg: OpenClawMessage = {
        type: 'req',
        id: uuidv4(),
        method: 'connect',
        params: {
          minProtocol: 3,
          maxProtocol: 3,
          client: {
            id: 'enclave-dashboard',
            version: '1.0.0',
            platform: 'server',
            mode: 'operator',
          },
          role: 'operator',
          scopes: ['operator.read', 'operator.chat'],
          auth: {
            token: state.gatewayToken,
          },
        },
      }
      
      ws.send(JSON.stringify(connectMsg))
      resolve()
    })

    ws.on('message', (data: Buffer) => {
      try {
        const msg: OpenClawMessage = JSON.parse(data.toString())
        handleMessage(state, msg)
      } catch (err) {
        console.error('[WS] Failed to parse message:', err)
      }
    })

    ws.on('close', (code: number, reason: Buffer) => {
      console.log(`[WS] Closed for user ${state.userId}: ${code} ${reason.toString()}`)
      state.isConnected = false
      state.connectPromise = null
      attemptReconnect(state)
    })

    ws.on('error', (err: Error) => {
      console.error(`[WS] Error for user ${state.userId}:`, err.message)
      state.connectPromise = null
      reject(err)
    })

    state.ws = ws
  })

  return state.connectPromise
}

function attemptReconnect(state: ConnectionState): void {
  if (state.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error(`[WS] Max reconnect attempts reached for user ${state.userId}`)
    connections.delete(getConnectionKey(state.userId))
    return
  }

  state.reconnectAttempts++
  console.log(`[WS] Reconnecting attempt ${state.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} for user ${state.userId}`)
  
  setTimeout(() => {
    connectWebSocket(state).catch((err) => {
      console.error('[WS] Reconnect failed:', err)
    })
  }, RECONNECT_DELAY_MS * state.reconnectAttempts)
}

function handleMessage(state: ConnectionState, msg: OpenClawMessage): void {
  // Handle response to a specific request
  if (msg.id && state.messageHandlers.has(msg.id)) {
    const handler = state.messageHandlers.get(msg.id)!
    handler(msg)
    state.messageHandlers.delete(msg.id)
    return
  }

  // Handle events (streaming responses)
  if (msg.type === 'event') {
    state.eventHandlers.forEach((handler) => {
      try {
        handler(msg)
      } catch (err) {
        console.error('[WS] Event handler error:', err)
      }
    })
  }
}

export async function getOrCreateConnection(
  userId: string,
  gatewayUrl: string,
  gatewayToken: string
): Promise<ConnectionState> {
  const key = getConnectionKey(userId)
  
  let state = connections.get(key)
  
  if (state) {
    // Check if connection is still valid
    if (state.gatewayUrl === gatewayUrl && state.gatewayToken === gatewayToken) {
      if (!state.isConnected) {
        await connectWebSocket(state)
      }
      return state
    }
    
    // URL or token changed, close old connection
    state.ws.close()
    connections.delete(key)
  }

  // Create new connection
  state = {
    ws: null as unknown as WebSocket, // Will be set in connectWebSocket
    userId,
    gatewayUrl,
    gatewayToken,
    messageHandlers: new Map(),
    eventHandlers: [],
    reconnectAttempts: 0,
    isConnected: false,
    connectPromise: null,
  }

  connections.set(key, state)
  await connectWebSocket(state)
  
  return state
}

export function sendRequest(
  state: ConnectionState,
  method: string,
  params: Record<string, unknown> = {}
): Promise<OpenClawMessage> {
  return new Promise((resolve, reject) => {
    const id = uuidv4()
    const msg: OpenClawMessage = {
      type: 'req',
      id,
      method,
      params,
    }

    // Set up response handler
    const timeout = setTimeout(() => {
      state.messageHandlers.delete(id)
      reject(new Error(`Request timeout: ${method}`))
    }, 30000)

    state.messageHandlers.set(id, (response) => {
      clearTimeout(timeout)
      if (response.error) {
        reject(new Error(response.error.message))
      } else {
        resolve(response)
      }
    })

    // Send the request
    if (state.ws.readyState === WebSocket.OPEN) {
      state.ws.send(JSON.stringify(msg))
    } else {
      clearTimeout(timeout)
      state.messageHandlers.delete(id)
      reject(new Error('WebSocket not connected'))
    }
  })
}

export function subscribeToEvents(
  state: ConnectionState,
  handler: (msg: OpenClawMessage) => void
): () => void {
  state.eventHandlers.push(handler)
  
  // Return unsubscribe function
  return () => {
    const index = state.eventHandlers.indexOf(handler)
    if (index > -1) {
      state.eventHandlers.splice(index, 1)
    }
  }
}

export function closeConnection(userId: string): void {
  const key = getConnectionKey(userId)
  const state = connections.get(key)
  
  if (state) {
    state.ws.close()
    connections.delete(key)
  }
}

// Cleanup on process exit
process.on('SIGINT', () => {
  console.log('[WS] Cleaning up connections...')
  connections.forEach((state) => {
    state.ws.close()
  })
  connections.clear()
  process.exit(0)
})