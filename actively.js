import throttle from 'lodash/throttle'

const windowIdleEvents = ['scroll', 'resize']
const documentIdleEvents = [
  'mousemove',
  'keyup',
  'keydown',
  'touchstart',
  'click',
  'contextmenu'
]

export default class Actively {
  running
  times
  idle
  checkCallbackIntervalId
  currentIdleTimeMs

  idleTimeoutMs
  checkCallbacksIntervalMs
  browserTabActiveCallbacks
  browserTabInactiveCallbacks
  timeIntervalEllapsedCallbacks
  absoluteTimeEllapsedCallbacks
  marks 
  measures

  constructor({
    timeIntervalEllapsedCallbacks,
    absoluteTimeEllapsedCallbacks,
    checkCallbacksIntervalMs,
    browserTabInactiveCallbacks,
    browserTabActiveCallbacks,
    idleTimeoutMs
  }) {
    this.running = false
    this.times = []
    this.idle = false
    this.currentIdleTimeMs = 0
    this.marks = {}
    this.measures = {}
    this.browserTabActiveCallbacks = browserTabActiveCallbacks || []
    this.browserTabInactiveCallbacks = browserTabInactiveCallbacks || []
    this.checkCallbacksIntervalMs = checkCallbacksIntervalMs || 100
    this.idleTimeoutMs = idleTimeoutMs || 3000 // 3s
    this.timeIntervalEllapsedCallbacks = timeIntervalEllapsedCallbacks || []
    this.absoluteTimeEllapsedCallbacks = absoluteTimeEllapsedCallbacks || []

    this.registerEventListeners()
  }

  onBrowserTabInactive = (event) => {
    // if running pause timer
    if (this.isRunning()) {
      this.stopTimer()
    }

    this.browserTabInactiveCallbacks.forEach(fn =>
      fn(this.getTimeInMilliseconds())
    )
  }

  onBrowserTabActive = (event) => {
    // if not running start timer
    if (!this.isRunning()) {
      this.startTimer()
    }

    this.browserTabActiveCallbacks.forEach(fn =>
      fn(this.getTimeInMilliseconds())
    )
  }

  onTimePassed = () => {
    // check all callbacks time and if passed execute callback
    this.absoluteTimeEllapsedCallbacks.forEach(
      ({ callback, pending, timeInMilliseconds }, index) => {
        if (pending && timeInMilliseconds <= this.getTimeInMilliseconds()) {
          callback(this.getTimeInMilliseconds())
          this.absoluteTimeEllapsedCallbacks[index].pending = false
        }
      }
    )

    this.timeIntervalEllapsedCallbacks.forEach(
      ({ callback, timeInMilliseconds, multiplier }, index) => {
        if (timeInMilliseconds <= this.getTimeInMilliseconds()) {
          callback(this.getTimeInMilliseconds())
          this.timeIntervalEllapsedCallbacks[
            index
          ].timeInMilliseconds = multiplier(timeInMilliseconds)
        }
      }
    )

    if (this.currentIdleTimeMs >= this.idleTimeoutMs && this.isRunning()) {
      this.idle = true
      this.stopTimer()
    } else {
      this.currentIdleTimeMs += this.checkCallbacksIntervalMs
    }
  }

  resetIdleTime = () => {
    if (this.idle) {
      this.startTimer()
    }
    this.idle = false
    this.currentIdleTimeMs = 0
  }

  registerEventListeners = () => {
    const eventListenerOptions = { passive: true }

    window.addEventListener(
      'blur',
      this.onBrowserTabInactive,
      eventListenerOptions
    )
    window.addEventListener(
      'focus',
      this.onBrowserTabActive,
      eventListenerOptions
    )

    const throttleResetIdleTime = throttle(this.resetIdleTime, 2000, {
      leading: true,
      trailing: false
    })
    windowIdleEvents.forEach(event => {
      window.addEventListener(
        event,
        throttleResetIdleTime,
        eventListenerOptions
      )
    })

    documentIdleEvents.forEach(event =>
      document.addEventListener(
        event,
        throttleResetIdleTime,
        eventListenerOptions
      )
    )
  }

  deregisterEventListeners = () => {
    window.removeEventListener('blur', this.onBrowserTabInactive)
    window.removeEventListener('focus', this.onBrowserTabActive)
    windowIdleEvents.forEach(event =>
      window.removeEventListener(event, this.resetIdleTime)
    )

    documentIdleEvents.forEach(event =>
      document.removeEventListener(event, this.resetIdleTime)
    )
  }

  checkCallbacksOnInterval = () => {
    this.checkCallbackIntervalId = window.setInterval(() => {
      this.onTimePassed()
    }, this.checkCallbacksIntervalMs)
  }

  startTimer = () => {
    if (!this.checkCallbackIntervalId) {
      this.checkCallbacksOnInterval()
    }
    const last = this.times[this.times.length - 1]
    if (last && last.stop === null) {
      return
    }
    this.times.push({
      start: performance.now(),
      stop: null
    })
    this.running = true
  }

  stopTimer = () => {
    if (!this.times.length) {
      return
    }
    this.times[this.times.length - 1].stop = performance.now()
    this.running = false
  }

  addTimeIntervalEllapsedCallback = (
    timeIntervalEllapsedCallback
  ) => {
    this.timeIntervalEllapsedCallbacks.push(timeIntervalEllapsedCallback)
  }

  addAbsoluteTimeEllapsedCallback = (
    absoluteTimeEllapsedCallback
  ) => {
    this.absoluteTimeEllapsedCallbacks.push(absoluteTimeEllapsedCallback)
  }

  addBrowserTabInactiveCallback = (
    browserTabInactiveCallback
  ) => {
    this.browserTabInactiveCallbacks.push(browserTabInactiveCallback)
  }

  addBrowserTabActiveCallback = (browserTabActiveCallback) => {
    this.browserTabActiveCallbacks.push(browserTabActiveCallback)
  }

  getTimeInMilliseconds = () => {
    return this.times.reduce((acc, current) => {
      if (current.stop) {
        acc = acc + (current.stop - current.start)
      } else {
        acc = acc + (performance.now() - current.start)
      }
      return acc
    }, 0)
  }

  isRunning = () => {
    return this.running
  }

  reset = () => {
    this.times = []
  }

  destroy = () => {
    this.unregisterEventListeners()
    if (this.checkCallbackIntervalId) {
      window.clearInterval(this.checkCallbackIntervalId)
    }
  }

  mark(key) {
    if (!this.marks[key]) {
      this.marks[key] = []
    }
    this.marks[key].push({ time: this.getTimeInMilliseconds() })
  }

  getMarks(name) {
    if (this.marks[name].length < 1) {
      return
    }

    return this.marks[name]
  }

  measure(name, startMarkName, endMarkName) {
    const startMarks = this.marks[startMarkName]
    const startMark = startMarks[startMarks.length - 1]
    const endMarks = this.marks[endMarkName]
    const endMark = endMarks[endMarks.length - 1]

    if (!this.measures[name]) {
      this.measures[name] = []
    }

    this.measures[name].push({
      name,
      startTime: startMark.time,
      duration: endMark.time - startMark.time
    })
  }

  getMeasures(name) {
    if (!this.measures[name] && this.measures[name].length < 1) {
      return
    }

    return this.measures[name]
  }
}
