# Actively

> Actively track user engagement and know when they move away from your page.

[![npm version](https://badge.fury.io/js/actively.svg)](https://badge.fury.io/js/actively)

## Install
```
npm install --save actively
```

## Example - basic
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
```

## Example - Advanced

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
  callback: () => {
    console.log("Doing Something every 5 minutes")
  }
}
active.addTimeIntervalEllapsedCallback(cb)

const callback = () => console.log('Browser going inactive');
active.addBrowserTabInactiveCallback(callback)

var ActiveTimeIntervals = active.times; // array of time periods with user activity
```

## API

### Public methods

#### running <sup>Bool</sup>
Shows is user is active on current webpage and the timer is running.

#### times <sup>Array</sup>
Array of timeDurations when the user was active.

Each time duration is an  Object({
      start: DateTime,
      stop: DateTime
    })

#### idle <sup>Bool</sup>
True when the user is inactive on current webpage and the timer is stopped.

#### currentIdleTimeMs <sup>Integer</sup>
Time elapsed(in miliseconds) since the user was last active.

#### idleTimeoutMs <sup>Integer</sup>
The idle time for a user after which timer stops and user is marked as inactive.

## Public Demo

> Demo coming soon!

[Used in production by Gratia](https://goodwill.zense.co.in/resources/1)

## License 
MIT &copy; [Gaurav Koley](https://gaurav.koley.in), 2020