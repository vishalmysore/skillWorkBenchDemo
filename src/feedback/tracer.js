const listeners = {}

const tracer = {
  publish(event, data) {
    const handlers = [...(listeners['*'] || []), ...(listeners[event] || [])]
    handlers.forEach(fn => fn(event, data))
  },
  subscribe(event, fn) {
    if (!listeners[event]) listeners[event] = []
    listeners[event].push(fn)
    return () => { listeners[event] = listeners[event].filter(f => f !== fn) }
  },
  clearLogs() {
    Object.keys(listeners).forEach(k => { if (k !== '*') delete listeners[k] })
  },
}

export default tracer
