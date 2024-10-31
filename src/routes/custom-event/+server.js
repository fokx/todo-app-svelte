// src/routes/events/+server.js
import { clients } from '$lib/clients'
import { produce } from 'sveltekit-sse'

/**
 * @param {number} milliseconds
 * @returns
 */
function delay(milliseconds) {
  return new Promise(function run(resolve) {
    setTimeout(resolve, milliseconds)
  })
}


export function POST({ request }) {
  return produce(
    function start({ emit }) {
      const sessionId = request.headers.get('session-id') ?? ''
      if (!sessionId) {
        return function stop() {
          console.error('Client session id not found.')
        }
      }
      // Map the session id to an emitter.
      // This will also indicate to you that the client is "online".
      clients.set(sessionId, emit)
    },
    {
      // Client goes "offline", so remove the entry.
      stop() {
        const sessionId = request.headers.get('session-id') ?? ''
        if (!sessionId) {
          return
        }
        clients.delete(sessionId)
      },
    },
  )
}