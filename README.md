# Actively

[![npm version](https://badge.fury.io/js/actively.svg)](https://badge.fury.io/js/actively)

## How to use:

```js
  import Actively from 'actively';
  const active = new Actively({
      timeIntervalEllapsedCallbacks: [],
      absoluteTimeEllapsedCallbacks: [],
      browserTabInactiveCallbacks: [],
      browserTabActiveCallbacks: [],
      idleTimeoutMs: 3000,
      checkCallbacksIntervalMs: 250
    })
    
    window.addEventListener('mousemove', active.startTimer)
    window.addEventListener('beforeunload', active.stopTimer)
    
    const cb = {
      multiplier: time => time + (60 * 5 * 1000), // Every 5 minutes
      timeInMilliseconds: 0,
      callback: this.doTransaction
    }
    active.addTimeIntervalEllapsedCallback(cb)
    
    const callback = () => console.log('die')
    active.addBrowserTabInactiveCallback(callback)
    
// active.addBrowserTabActiveCallback(cb.callback)

```
