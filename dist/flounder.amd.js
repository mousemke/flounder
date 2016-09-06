/*!
 * Flounder JavaScript Stylable Selectbox v1.0.2
 * https://github.com/sociomantic-tsunami/flounder
 *
 * Copyright 2015-2016 Sociomantic Labs and other contributors
 * Released under the MIT license
 * https://github.com/sociomantic-tsunami/flounder/license
 *
 * Date: Tue Sep 06 2016
 * "This, so far, is the best Flounder ever"
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

// rawAsap provides everything we need except exception management.
var rawAsap = require("./raw");
// RawTasks are recycled to reduce GC churn.
var freeTasks = [];
// We queue errors to ensure they are thrown in right order (FIFO).
// Array-as-queue is good enough here, since we are just dealing with exceptions.
var pendingErrors = [];
var requestErrorThrow = rawAsap.makeRequestCallFromTimer(throwFirstError);

function throwFirstError() {
    if (pendingErrors.length) {
        throw pendingErrors.shift();
    }
}

/**
 * Calls a task as soon as possible after returning, in its own event, with priority
 * over other events like animation, reflow, and repaint. An error thrown from an
 * event will not interrupt, nor even substantially slow down the processing of
 * other events, but will be rather postponed to a lower priority event.
 * @param {{call}} task A callable object, typically a function that takes no
 * arguments.
 */
module.exports = asap;
function asap(task) {
    var rawTask;
    if (freeTasks.length) {
        rawTask = freeTasks.pop();
    } else {
        rawTask = new RawTask();
    }
    rawTask.task = task;
    rawAsap(rawTask);
}

// We wrap tasks with recyclable task objects.  A task object implements
// `call`, just like a function.
function RawTask() {
    this.task = null;
}

// The sole purpose of wrapping the task is to catch the exception and recycle
// the task object after its single use.
RawTask.prototype.call = function () {
    try {
        this.task.call();
    } catch (error) {
        if (asap.onerror) {
            // This hook exists purely for testing purposes.
            // Its name will be periodically randomized to break any code that
            // depends on its existence.
            asap.onerror(error);
        } else {
            // In a web browser, exceptions are not fatal. However, to avoid
            // slowing down the queue of pending tasks, we rethrow the error in a
            // lower priority turn.
            pendingErrors.push(error);
            requestErrorThrow();
        }
    } finally {
        this.task = null;
        freeTasks[freeTasks.length] = this;
    }
};

},{"./raw":2}],2:[function(require,module,exports){
(function (global){
"use strict";

// Use the fastest means possible to execute a task in its own turn, with
// priority over other events including IO, animation, reflow, and redraw
// events in browsers.
//
// An exception thrown by a task will permanently interrupt the processing of
// subsequent tasks. The higher level `asap` function ensures that if an
// exception is thrown by a task, that the task queue will continue flushing as
// soon as possible, but if you use `rawAsap` directly, you are responsible to
// either ensure that no exceptions are thrown from your task, or to manually
// call `rawAsap.requestFlush` if an exception is thrown.
module.exports = rawAsap;
function rawAsap(task) {
    if (!queue.length) {
        requestFlush();
        flushing = true;
    }
    // Equivalent to push, but avoids a function call.
    queue[queue.length] = task;
}

var queue = [];
// Once a flush has been requested, no further calls to `requestFlush` are
// necessary until the next `flush` completes.
var flushing = false;
// `requestFlush` is an implementation-specific method that attempts to kick
// off a `flush` event as quickly as possible. `flush` will attempt to exhaust
// the event queue before yielding to the browser's own event loop.
var requestFlush;
// The position of the next task to execute in the task queue. This is
// preserved between calls to `flush` so that it can be resumed if
// a task throws an exception.
var index = 0;
// If a task schedules additional tasks recursively, the task queue can grow
// unbounded. To prevent memory exhaustion, the task queue will periodically
// truncate already-completed tasks.
var capacity = 1024;

// The flush function processes all tasks that have been scheduled with
// `rawAsap` unless and until one of those tasks throws an exception.
// If a task throws an exception, `flush` ensures that its state will remain
// consistent and will resume where it left off when called again.
// However, `flush` does not make any arrangements to be called again if an
// exception is thrown.
function flush() {
    while (index < queue.length) {
        var currentIndex = index;
        // Advance the index before calling the task. This ensures that we will
        // begin flushing on the next task the task throws an error.
        index = index + 1;
        queue[currentIndex].call();
        // Prevent leaking memory for long chains of recursive calls to `asap`.
        // If we call `asap` within tasks scheduled by `asap`, the queue will
        // grow, but to avoid an O(n) walk for every task we execute, we don't
        // shift tasks off the queue after they have been executed.
        // Instead, we periodically shift 1024 tasks off the queue.
        if (index > capacity) {
            // Manually shift all values starting at the index back to the
            // beginning of the queue.
            for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
                queue[scan] = queue[scan + index];
            }
            queue.length -= index;
            index = 0;
        }
    }
    queue.length = 0;
    index = 0;
    flushing = false;
}

// `requestFlush` is implemented using a strategy based on data collected from
// every available SauceLabs Selenium web driver worker at time of writing.
// https://docs.google.com/spreadsheets/d/1mG-5UYGup5qxGdEMWkhP6BWCz053NUb2E1QoUTU16uA/edit#gid=783724593

// Safari 6 and 6.1 for desktop, iPad, and iPhone are the only browsers that
// have WebKitMutationObserver but not un-prefixed MutationObserver.
// Must use `global` instead of `window` to work in both frames and web
// workers. `global` is a provision of Browserify, Mr, Mrs, or Mop.
var BrowserMutationObserver = global.MutationObserver || global.WebKitMutationObserver;

// MutationObservers are desirable because they have high priority and work
// reliably everywhere they are implemented.
// They are implemented in all modern browsers.
//
// - Android 4-4.3
// - Chrome 26-34
// - Firefox 14-29
// - Internet Explorer 11
// - iPad Safari 6-7.1
// - iPhone Safari 7-7.1
// - Safari 6-7
if (typeof BrowserMutationObserver === "function") {
    requestFlush = makeRequestCallFromMutationObserver(flush);

// MessageChannels are desirable because they give direct access to the HTML
// task queue, are implemented in Internet Explorer 10, Safari 5.0-1, and Opera
// 11-12, and in web workers in many engines.
// Although message channels yield to any queued rendering and IO tasks, they
// would be better than imposing the 4ms delay of timers.
// However, they do not work reliably in Internet Explorer or Safari.

// Internet Explorer 10 is the only browser that has setImmediate but does
// not have MutationObservers.
// Although setImmediate yields to the browser's renderer, it would be
// preferrable to falling back to setTimeout since it does not have
// the minimum 4ms penalty.
// Unfortunately there appears to be a bug in Internet Explorer 10 Mobile (and
// Desktop to a lesser extent) that renders both setImmediate and
// MessageChannel useless for the purposes of ASAP.
// https://github.com/kriskowal/q/issues/396

// Timers are implemented universally.
// We fall back to timers in workers in most engines, and in foreground
// contexts in the following browsers.
// However, note that even this simple case requires nuances to operate in a
// broad spectrum of browsers.
//
// - Firefox 3-13
// - Internet Explorer 6-9
// - iPad Safari 4.3
// - Lynx 2.8.7
} else {
    requestFlush = makeRequestCallFromTimer(flush);
}

// `requestFlush` requests that the high priority event queue be flushed as
// soon as possible.
// This is useful to prevent an error thrown in a task from stalling the event
// queue if the exception handled by Node.js’s
// `process.on("uncaughtException")` or by a domain.
rawAsap.requestFlush = requestFlush;

// To request a high priority event, we induce a mutation observer by toggling
// the text of a text node between "1" and "-1".
function makeRequestCallFromMutationObserver(callback) {
    var toggle = 1;
    var observer = new BrowserMutationObserver(callback);
    var node = document.createTextNode("");
    observer.observe(node, {characterData: true});
    return function requestCall() {
        toggle = -toggle;
        node.data = toggle;
    };
}

// The message channel technique was discovered by Malte Ubl and was the
// original foundation for this library.
// http://www.nonblocking.io/2011/06/windownexttick.html

// Safari 6.0.5 (at least) intermittently fails to create message ports on a
// page's first load. Thankfully, this version of Safari supports
// MutationObservers, so we don't need to fall back in that case.

// function makeRequestCallFromMessageChannel(callback) {
//     var channel = new MessageChannel();
//     channel.port1.onmessage = callback;
//     return function requestCall() {
//         channel.port2.postMessage(0);
//     };
// }

// For reasons explained above, we are also unable to use `setImmediate`
// under any circumstances.
// Even if we were, there is another bug in Internet Explorer 10.
// It is not sufficient to assign `setImmediate` to `requestFlush` because
// `setImmediate` must be called *by name* and therefore must be wrapped in a
// closure.
// Never forget.

// function makeRequestCallFromSetImmediate(callback) {
//     return function requestCall() {
//         setImmediate(callback);
//     };
// }

// Safari 6.0 has a problem where timers will get lost while the user is
// scrolling. This problem does not impact ASAP because Safari 6.0 supports
// mutation observers, so that implementation is used instead.
// However, if we ever elect to use timers in Safari, the prevalent work-around
// is to add a scroll event listener that calls for a flush.

// `setTimeout` does not call the passed callback if the delay is less than
// approximately 7 in web workers in Firefox 8 through 18, and sometimes not
// even then.

function makeRequestCallFromTimer(callback) {
    return function requestCall() {
        // We dispatch a timeout with a specified delay of 0 for engines that
        // can reliably accommodate that request. This will usually be snapped
        // to a 4 milisecond delay, but once we're flushing, there's no delay
        // between events.
        var timeoutHandle = setTimeout(handleTimer, 0);
        // However, since this timer gets frequently dropped in Firefox
        // workers, we enlist an interval handle that will try to fire
        // an event 20 times per second until it succeeds.
        var intervalHandle = setInterval(handleTimer, 50);

        function handleTimer() {
            // Whichever timer succeeds will cancel both timers and
            // execute the callback.
            clearTimeout(timeoutHandle);
            clearInterval(intervalHandle);
            callback();
        }
    };
}

// This is for `asap.js` only.
// Its name will be periodically randomized to break any code that depends on
// its existence.
rawAsap.makeRequestCallFromTimer = makeRequestCallFromTimer;

// ASAP was originally a nextTick shim included in Q. This was factored out
// into this ASAP package. It was later adapted to RSVP which made further
// amendments. These decisions, particularly to marginalize MessageChannel and
// to capture the MutationObserver implementation in a closure, were integrated
// back into ASAP proper.
// https://github.com/tildeio/rsvp.js/blob/cddf7232546a9cf858524b75cde6f9edf72620a7/lib/rsvp/asap.js

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
/**
 * http.js
 *
 * @author  Mouse Braun         <mouse@knoblau.ch>
 * @author  Nicolas Brugneaux   <nicolas.brugneaux@gmail.com>
 *
 * @package Microbe
 */

module.exports = function( Microbe )
{
    'use strict';

    var Promise = require( 'promise' );

    /**
     * ## http
     *
     * Method takes as many as necessary parameters, with url being the only required.
     * The return then has the methods `.then( _cb )` and `.error( _cb )`
     *
     * @param {Object} _parameters http parameters. possible properties
     *                             method, url, data, user, password, headers, async
     *
     * @example µ.http( {url: './test.html', method: 'POST', data: { number: 67867} } ).then( function(){} ).catch( function(){} );
     */
    Microbe.http = function( _parameters )
    {
        var req, method, url, data, user, password, headers, async;

        if ( !_parameters )
        {
            return new Error( 'No parameters given' );
        }
        else
        {
            if ( typeof _parameters === 'string' )
            {
                _parameters = { url: _parameters };
            }

            req         = new XMLHttpRequest();
            method      = _parameters.method || 'GET';
            url         = _parameters.url;
            data        = JSON.stringify( _parameters.data ) || null;
            user        = _parameters.user || '';
            password    = _parameters.password || '';
            headers     = _parameters.headers  || null;
            async       = typeof _parameters.async === "boolean" ?
                                _parameters.async : true;

            req.onreadystatechange = function()
            {
                if ( req.readyState === 4 )
                {
                    return req;
                }
            };
        }

        req.open( method, url, async, user, password );

        // weird Safari voodoo fix
        if ( method === 'POST' )
        {
            req.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );
        }

        if ( headers )
        {
            for ( var header in headers )
            {
                req.setRequestHeader( header, headers[header] );
            }
        }

        if ( async )
        {
            return new Promise( function( resolve, reject )
            {
                req.onerror = function()
                {
                    reject( new Error( 'Network error!' ) );
                };

                req.send( data );
                req.onload = function()
                {
                    if ( req.status === 200 )
                    {
                        resolve( req.response );
                    }
                    else
                    {
                        reject( new Error( req.status ) );
                    }
                };

            });
        }
        else
        {
            var _response = function( _val )
            {
                var _responses = {

                    /**
                     * ## .then
                     *
                     * Called after `http`, `http.get`, or `http.post`, this is
                     * called passing the result as the first parameter to the callback
                     *
                     * @param {Function} _cb function to call after http request
                     *
                     * @return _Object_ contains the `.catch` method
                     */
                    then: function( _cb )
                    {
                        if ( _val.status === 200 )
                        {
                            _cb( _val.responseText );
                        }
                        return _responses;
                    },


                    /**
                     * ## .catch
                     *
                     * Called after `http`, `http.get`, or `http.post`, this is
                     * called passing the error as the first parameter to the callback
                     *
                     * @param {Function} _cb function to call after http request
                     *
                     * @return _Object_ contains the `.then` method
                     */
                    catch: function( _cb )
                    {
                        if ( _val.status !== 200 )
                        {
                            _cb( {
                                status      : _val.status,
                                statusText  : _val.statusText
                            } );
                        }
                        return _responses;
                    }
                };
                return _responses;
            };

            req.send( data );
            req.onloadend = function()
            {
                req.onreadystatechange();
                return _response( req );
            };

            return req.onloadend();
        }
    };


    /**
     * ## http.get
     *
     * Syntactic shortcut for simple GET requests
     *
     * @param {String} _url file url
     *
     * @example µ.http.get( './test.html' ).then( function(){} ).catch( function(){} );
     *
     * @return _Object_ contains `.then` and `.catch`
     */
    Microbe.http.get = function( _url )
    {
        return this( {
            url     : _url,
            method  : 'GET'
        } );
    };


    /**
     * ## http.post
     *
     * Syntactic shortcut for simple POST requests
     *
     * @param {String} _url file url
     * @param {Mixed} _data data to post to location {Object or String}
     *
     * @example µ.http.post( './test.html', { number: 67867} ).then( function(){} ).catch( function(){} );
     *
     * @return _Object_ contains `.then` and `.catch`
     */
    Microbe.http.post = function( _url, _data )
    {
        return this( {
            url     : _url,
            data    : _data,
            method  : 'POST'
        } );
    };
};

},{"promise":4}],4:[function(require,module,exports){
'use strict';

module.exports = require('./lib')

},{"./lib":9}],5:[function(require,module,exports){
'use strict';

var asap = require('asap/raw');

function noop() {}

// States:
//
// 0 - pending
// 1 - fulfilled with _value
// 2 - rejected with _value
// 3 - adopted the state of another promise, _value
//
// once the state is no longer pending (0) it is immutable

// All `_` prefixed properties will be reduced to `_{random number}`
// at build time to obfuscate them and discourage their use.
// We don't use symbols or Object.defineProperty to fully hide them
// because the performance isn't good enough.


// to avoid using try/catch inside critical functions, we
// extract them to here.
var LAST_ERROR = null;
var IS_ERROR = {};
function getThen(obj) {
  try {
    return obj.then;
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

function tryCallOne(fn, a) {
  try {
    return fn(a);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}
function tryCallTwo(fn, a, b) {
  try {
    fn(a, b);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

module.exports = Promise;

function Promise(fn) {
  if (typeof this !== 'object') {
    throw new TypeError('Promises must be constructed via new');
  }
  if (typeof fn !== 'function') {
    throw new TypeError('not a function');
  }
  this._45 = 0;
  this._81 = 0;
  this._65 = null;
  this._54 = null;
  if (fn === noop) return;
  doResolve(fn, this);
}
Promise._10 = null;
Promise._97 = null;
Promise._61 = noop;

Promise.prototype.then = function(onFulfilled, onRejected) {
  if (this.constructor !== Promise) {
    return safeThen(this, onFulfilled, onRejected);
  }
  var res = new Promise(noop);
  handle(this, new Handler(onFulfilled, onRejected, res));
  return res;
};

function safeThen(self, onFulfilled, onRejected) {
  return new self.constructor(function (resolve, reject) {
    var res = new Promise(noop);
    res.then(resolve, reject);
    handle(self, new Handler(onFulfilled, onRejected, res));
  });
};
function handle(self, deferred) {
  while (self._81 === 3) {
    self = self._65;
  }
  if (Promise._10) {
    Promise._10(self);
  }
  if (self._81 === 0) {
    if (self._45 === 0) {
      self._45 = 1;
      self._54 = deferred;
      return;
    }
    if (self._45 === 1) {
      self._45 = 2;
      self._54 = [self._54, deferred];
      return;
    }
    self._54.push(deferred);
    return;
  }
  handleResolved(self, deferred);
}

function handleResolved(self, deferred) {
  asap(function() {
    var cb = self._81 === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      if (self._81 === 1) {
        resolve(deferred.promise, self._65);
      } else {
        reject(deferred.promise, self._65);
      }
      return;
    }
    var ret = tryCallOne(cb, self._65);
    if (ret === IS_ERROR) {
      reject(deferred.promise, LAST_ERROR);
    } else {
      resolve(deferred.promise, ret);
    }
  });
}
function resolve(self, newValue) {
  // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
  if (newValue === self) {
    return reject(
      self,
      new TypeError('A promise cannot be resolved with itself.')
    );
  }
  if (
    newValue &&
    (typeof newValue === 'object' || typeof newValue === 'function')
  ) {
    var then = getThen(newValue);
    if (then === IS_ERROR) {
      return reject(self, LAST_ERROR);
    }
    if (
      then === self.then &&
      newValue instanceof Promise
    ) {
      self._81 = 3;
      self._65 = newValue;
      finale(self);
      return;
    } else if (typeof then === 'function') {
      doResolve(then.bind(newValue), self);
      return;
    }
  }
  self._81 = 1;
  self._65 = newValue;
  finale(self);
}

function reject(self, newValue) {
  self._81 = 2;
  self._65 = newValue;
  if (Promise._97) {
    Promise._97(self, newValue);
  }
  finale(self);
}
function finale(self) {
  if (self._45 === 1) {
    handle(self, self._54);
    self._54 = null;
  }
  if (self._45 === 2) {
    for (var i = 0; i < self._54.length; i++) {
      handle(self, self._54[i]);
    }
    self._54 = null;
  }
}

function Handler(onFulfilled, onRejected, promise){
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
  this.promise = promise;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, promise) {
  var done = false;
  var res = tryCallTwo(fn, function (value) {
    if (done) return;
    done = true;
    resolve(promise, value);
  }, function (reason) {
    if (done) return;
    done = true;
    reject(promise, reason);
  })
  if (!done && res === IS_ERROR) {
    done = true;
    reject(promise, LAST_ERROR);
  }
}

},{"asap/raw":2}],6:[function(require,module,exports){
'use strict';

var Promise = require('./core.js');

module.exports = Promise;
Promise.prototype.done = function (onFulfilled, onRejected) {
  var self = arguments.length ? this.then.apply(this, arguments) : this;
  self.then(null, function (err) {
    setTimeout(function () {
      throw err;
    }, 0);
  });
};

},{"./core.js":5}],7:[function(require,module,exports){
'use strict';

//This file contains the ES6 extensions to the core Promises/A+ API

var Promise = require('./core.js');

module.exports = Promise;

/* Static Functions */

var TRUE = valuePromise(true);
var FALSE = valuePromise(false);
var NULL = valuePromise(null);
var UNDEFINED = valuePromise(undefined);
var ZERO = valuePromise(0);
var EMPTYSTRING = valuePromise('');

function valuePromise(value) {
  var p = new Promise(Promise._61);
  p._81 = 1;
  p._65 = value;
  return p;
}
Promise.resolve = function (value) {
  if (value instanceof Promise) return value;

  if (value === null) return NULL;
  if (value === undefined) return UNDEFINED;
  if (value === true) return TRUE;
  if (value === false) return FALSE;
  if (value === 0) return ZERO;
  if (value === '') return EMPTYSTRING;

  if (typeof value === 'object' || typeof value === 'function') {
    try {
      var then = value.then;
      if (typeof then === 'function') {
        return new Promise(then.bind(value));
      }
    } catch (ex) {
      return new Promise(function (resolve, reject) {
        reject(ex);
      });
    }
  }
  return valuePromise(value);
};

Promise.all = function (arr) {
  var args = Array.prototype.slice.call(arr);

  return new Promise(function (resolve, reject) {
    if (args.length === 0) return resolve([]);
    var remaining = args.length;
    function res(i, val) {
      if (val && (typeof val === 'object' || typeof val === 'function')) {
        if (val instanceof Promise && val.then === Promise.prototype.then) {
          while (val._81 === 3) {
            val = val._65;
          }
          if (val._81 === 1) return res(i, val._65);
          if (val._81 === 2) reject(val._65);
          val.then(function (val) {
            res(i, val);
          }, reject);
          return;
        } else {
          var then = val.then;
          if (typeof then === 'function') {
            var p = new Promise(then.bind(val));
            p.then(function (val) {
              res(i, val);
            }, reject);
            return;
          }
        }
      }
      args[i] = val;
      if (--remaining === 0) {
        resolve(args);
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};

Promise.reject = function (value) {
  return new Promise(function (resolve, reject) {
    reject(value);
  });
};

Promise.race = function (values) {
  return new Promise(function (resolve, reject) {
    values.forEach(function(value){
      Promise.resolve(value).then(resolve, reject);
    });
  });
};

/* Prototype Methods */

Promise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected);
};

},{"./core.js":5}],8:[function(require,module,exports){
'use strict';

var Promise = require('./core.js');

module.exports = Promise;
Promise.prototype['finally'] = function (f) {
  return this.then(function (value) {
    return Promise.resolve(f()).then(function () {
      return value;
    });
  }, function (err) {
    return Promise.resolve(f()).then(function () {
      throw err;
    });
  });
};

},{"./core.js":5}],9:[function(require,module,exports){
'use strict';

module.exports = require('./core.js');
require('./done.js');
require('./finally.js');
require('./es6-extensions.js');
require('./node-extensions.js');
require('./synchronous.js');

},{"./core.js":5,"./done.js":6,"./es6-extensions.js":7,"./finally.js":8,"./node-extensions.js":10,"./synchronous.js":11}],10:[function(require,module,exports){
'use strict';

// This file contains then/promise specific extensions that are only useful
// for node.js interop

var Promise = require('./core.js');
var asap = require('asap');

module.exports = Promise;

/* Static Functions */

Promise.denodeify = function (fn, argumentCount) {
  if (
    typeof argumentCount === 'number' && argumentCount !== Infinity
  ) {
    return denodeifyWithCount(fn, argumentCount);
  } else {
    return denodeifyWithoutCount(fn);
  }
}

var callbackFn = (
  'function (err, res) {' +
  'if (err) { rj(err); } else { rs(res); }' +
  '}'
);
function denodeifyWithCount(fn, argumentCount) {
  var args = [];
  for (var i = 0; i < argumentCount; i++) {
    args.push('a' + i);
  }
  var body = [
    'return function (' + args.join(',') + ') {',
    'var self = this;',
    'return new Promise(function (rs, rj) {',
    'var res = fn.call(',
    ['self'].concat(args).concat([callbackFn]).join(','),
    ');',
    'if (res &&',
    '(typeof res === "object" || typeof res === "function") &&',
    'typeof res.then === "function"',
    ') {rs(res);}',
    '});',
    '};'
  ].join('');
  return Function(['Promise', 'fn'], body)(Promise, fn);
}
function denodeifyWithoutCount(fn) {
  var fnLength = Math.max(fn.length - 1, 3);
  var args = [];
  for (var i = 0; i < fnLength; i++) {
    args.push('a' + i);
  }
  var body = [
    'return function (' + args.join(',') + ') {',
    'var self = this;',
    'var args;',
    'var argLength = arguments.length;',
    'if (arguments.length > ' + fnLength + ') {',
    'args = new Array(arguments.length + 1);',
    'for (var i = 0; i < arguments.length; i++) {',
    'args[i] = arguments[i];',
    '}',
    '}',
    'return new Promise(function (rs, rj) {',
    'var cb = ' + callbackFn + ';',
    'var res;',
    'switch (argLength) {',
    args.concat(['extra']).map(function (_, index) {
      return (
        'case ' + (index) + ':' +
        'res = fn.call(' + ['self'].concat(args.slice(0, index)).concat('cb').join(',') + ');' +
        'break;'
      );
    }).join(''),
    'default:',
    'args[argLength] = cb;',
    'res = fn.apply(self, args);',
    '}',
    
    'if (res &&',
    '(typeof res === "object" || typeof res === "function") &&',
    'typeof res.then === "function"',
    ') {rs(res);}',
    '});',
    '};'
  ].join('');

  return Function(
    ['Promise', 'fn'],
    body
  )(Promise, fn);
}

Promise.nodeify = function (fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    var callback =
      typeof args[args.length - 1] === 'function' ? args.pop() : null;
    var ctx = this;
    try {
      return fn.apply(this, arguments).nodeify(callback, ctx);
    } catch (ex) {
      if (callback === null || typeof callback == 'undefined') {
        return new Promise(function (resolve, reject) {
          reject(ex);
        });
      } else {
        asap(function () {
          callback.call(ctx, ex);
        })
      }
    }
  }
}

Promise.prototype.nodeify = function (callback, ctx) {
  if (typeof callback != 'function') return this;

  this.then(function (value) {
    asap(function () {
      callback.call(ctx, null, value);
    });
  }, function (err) {
    asap(function () {
      callback.call(ctx, err);
    });
  });
}

},{"./core.js":5,"asap":1}],11:[function(require,module,exports){
'use strict';

var Promise = require('./core.js');

module.exports = Promise;
Promise.enableSynchronous = function () {
  Promise.prototype.isPending = function() {
    return this.getState() == 0;
  };

  Promise.prototype.isFulfilled = function() {
    return this.getState() == 1;
  };

  Promise.prototype.isRejected = function() {
    return this.getState() == 2;
  };

  Promise.prototype.getValue = function () {
    if (this._81 === 3) {
      return this._65.getValue();
    }

    if (!this.isFulfilled()) {
      throw new Error('Cannot get a value of an unfulfilled promise.');
    }

    return this._65;
  };

  Promise.prototype.getReason = function () {
    if (this._81 === 3) {
      return this._65.getReason();
    }

    if (!this.isRejected()) {
      throw new Error('Cannot get a rejection reason of a non-rejected promise.');
    }

    return this._65;
  };

  Promise.prototype.getState = function () {
    if (this._81 === 3) {
      return this._65.getState();
    }
    if (this._81 === -1 || this._81 === -2) {
      return 0;
    }

    return this._81;
  };
};

Promise.disableSynchronous = function() {
  Promise.prototype.isPending = undefined;
  Promise.prototype.isFulfilled = undefined;
  Promise.prototype.isRejected = undefined;
  Promise.prototype.getValue = undefined;
  Promise.prototype.getReason = undefined;
  Promise.prototype.getState = undefined;
};

},{"./core.js":5}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _defaults = require('./defaults');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var nativeSlice = Array.prototype.slice;

var api = {

    /**
     * ## buildFromUrl
     *
     * uses loadDataFromUrl and completes the entire build with the new data
     *
     * @param {String} url address to get the data from
     * @param {Function} callback function to run after getting the data
     *
     * @return _Void_
     */

    buildFromUrl: function buildFromUrl(url, callback) {
        var _this = this;

        this.loadDataFromUrl(url, function (data) {
            _this.data = data;

            if (callback) {
                callback(_this.data);
            }

            _this.rebuild(_this.data);
        });

        return [];
    },


    /**
     * ## clickByIndex
     *
     * programatically sets selected by index.  If there are not enough elements
     * to match the index, then nothing is selected. Fires the onClick event
     *
     * @param {Mixed} index index to set flounder to.  _Number, or Array of numbers_
     *
     * return _Void_
     */
    clickByIndex: function clickByIndex(index, multiple) {
        return this.setByIndex(index, multiple, false);
    },


    /**
     * ## clickByText
     *
     * programatically sets selected by text string.  If the text string
     * is not matched to an element, nothing will be selected. Fires the onClick event
     *
     * @param {Mixed} text text to set flounder to.  _String, or Array of strings_
     *
     * return _Void_
     */
    clickByText: function clickByText(text, multiple) {
        return this.setByText(text, multiple, false);
    },


    /**
     * ## clickByValue
     *
     * programatically sets selected by value string.  If the value string
     * is not matched to an element, nothing will be selected. Fires the onClick event
     *
     * @param {Mixed} value value to set flounder to.  _String, or Array of strings_
     *
     * return _Void_
     */
    clickByValue: function clickByValue(value, multiple) {
        return this.setByValue(value, multiple, false);
    },


    /**
     * ## destroy
     *
     * removes flounder and all it`s events from the dom
     *
     * @return _Void_
     */
    destroy: function destroy() {
        this.componentWillUnmount();

        var refs = this.refs;
        var originalTarget = this.originalTarget;
        var tagName = originalTarget.tagName;

        if (tagName === 'INPUT' || tagName === 'SELECT') {
            var target = originalTarget.nextElementSibling;

            if (tagName === 'SELECT') {
                var firstOption = originalTarget[0];

                if (firstOption && _utils2.default.hasClass(firstOption, classes.PLACEHOLDER)) {
                    originalTarget.removeChild(firstOption);
                }
            } else {
                target = refs.flounder.parentNode;
            }

            try {
                var _classes = this.classes;
                target.parentNode.removeChild(target);
                originalTarget.tabIndex = 0;
                _utils2.default.removeClass(originalTarget, _classes.HIDDEN);
            } catch (e) {
                throw ' : this flounder may have already been removed';
            }
        } else {
            try {
                var wrapper = refs.wrapper;
                var parent = wrapper.parentNode;
                parent.removeChild(wrapper);
            } catch (e) {
                throw ' : this flounder may have already been removed';
            }
        }

        refs.flounder.flounder = originalTarget.flounder = this.target.flounder = null;
    },


    /**
     * ## deselectAll
     *
     * deslects all data
     *
     * @return _Void_
     */
    deselectAll: function deselectAll() {
        this.removeSelectedClass();
        this.removeSelectedValue();

        var multiTagWrapper = this.refs.multiTagWrapper;

        if (multiTagWrapper) {
            var tags = nativeSlice.call(multiTagWrapper.children);
            tags.forEach(function (el) {
                if (el.children.length) {
                    return el.children[0].click();
                }
            });
        }
    },


    /**
     * ## disable
     *
     * disables flounder by adjusting listeners and classes
     *
     * @param {Boolean} bool disable or enable
     *
     * @return _Void_
     */
    disable: function disable(bool) {
        var refs = this.refs;
        var classes = this.classes;
        var flounder = refs.flounder;
        var selected = refs.selected;

        if (bool) {
            refs.flounder.removeEventListener('keydown', this.checkFlounderKeypress);
            refs.selected.removeEventListener('click', this.toggleList);
            _utils2.default.addClass(selected, classes.DISABLED);
            _utils2.default.addClass(flounder, classes.DISABLED);
        } else {
            refs.flounder.addEventListener('keydown', this.checkFlounderKeypress);
            refs.selected.addEventListener('click', this.toggleList);
            _utils2.default.removeClass(selected, classes.DISABLED);
            _utils2.default.removeClass(flounder, classes.DISABLED);
        }
    },


    /**
     * ## disableByIndex
     *
     * disables the options with the given index
     *
     * @param {Mixed} i index of the option
     * @param {Boolean} reenable enables the option instead
     *
     * return _Void_
     */
    disableByIndex: function disableByIndex(index, reenable) {
        var _this2 = this;

        var refs = this.refs;

        if (typeof index !== 'string' && index.length) {
            var _ret = function () {
                var disableByIndex = _this2.disableByIndex.bind(_this2);
                return {
                    v: index.map(function (_i) {
                        return disableByIndex(_i, reenable);
                    })
                };
            }();

            if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
        } else {
            var data = refs.data;
            var length = data.length;

            if (index < 0) {
                var _length = data.length;
                index = _length + index;
            }

            var el = data[index];

            if (el) {
                var opt = refs.selectOptions[index];
                var _classes2 = this.classes;

                if (reenable) {
                    opt.disabled = false;
                    _utils2.default.removeClass(el, _classes2.DISABLED);
                } else {
                    opt.disabled = true;
                    _utils2.default.addClass(el, _classes2.DISABLED);
                }

                return [el, opt];
            } else {
                console.warn('Flounder - No element to disable.');
            }
        }
    },


    /**
     * ## disableByText
     *
     * disables THE FIRST option that has the given value
     *
     * @param {Mixed} value value of the option
     * @param {Boolean} reenable enables the option instead
     *
     * return _Void_
     */
    disableByText: function disableByText(text, reenable) {
        var _this3 = this;

        if (typeof text !== 'string' && text.length) {
            var _ret2 = function () {
                var disableByText = _this3.disableByText.bind(_this3);
                var res = text.map(function (_v) {
                    return disableByText(_v, reenable);
                });

                return {
                    v: res.length === 1 ? res[0] : res
                };
            }();

            if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
        } else {
            var _ret3 = function () {
                var res = [];

                _this3.refs.data.forEach(function (el, i) {
                    var _elText = el.innerHTML;

                    if (_elText === text) {
                        res.push(i);
                    }
                });

                res = res.length === 1 ? res[0] : res;

                return {
                    v: _this3.disableByIndex(res, reenable)
                };
            }();

            if ((typeof _ret3 === 'undefined' ? 'undefined' : _typeof(_ret3)) === "object") return _ret3.v;
        }
    },


    /**
     * ## disableByValue
     *
     * disables THE FIRST option that has the given value
     *
     * @param {Mixed} value value of the option
     * @param {Boolean} reenable enables the option instead
     *
     * return _Void_
     */
    disableByValue: function disableByValue(value, reenable) {
        var _this4 = this;

        if (typeof value !== 'string' && value.length) {
            var _ret4 = function () {
                var disableByValue = _this4.disableByValue.bind(_this4);
                var res = value.map(function (_v) {
                    return disableByValue(_v, reenable);
                });

                return {
                    v: res.length === 1 ? res[0] : res
                };
            }();

            if ((typeof _ret4 === 'undefined' ? 'undefined' : _typeof(_ret4)) === "object") return _ret4.v;
        } else {
            var _res = this.refs.selectOptions.map(function (el, i) {
                return '' + el.value === '' + value ? i : null;
            }).filter(function (a) {
                return !!a || a === 0 ? true : false;
            });

            _res = _res.length === 1 ? _res[0] : _res;

            return this.disableByIndex(_res, reenable);
        }
    },


    /**
     * ## enableByIndex
     *
     * shortcut syntax to enable an index
     *
     * @param {Mixed} index index of the option to enable
     *
     * @return {Object} flounder(s)
     */
    enableByIndex: function enableByIndex(index) {
        return this.disableByIndex(index, true);
    },


    /**
     * ## enableByText
     *
     * shortcut syntax to enable by text
     *
     * @param {Mixed} text text of the option to enable
     *
     * @return {Object} flounder(s)
     */
    enableByText: function enableByText(text) {
        return this.disableByText(text, true);
    },


    /**
     * ## enableByValue
     *
     * shortcut syntax to enable a value
     *
     * @param {Mixed} value value of the option to enable
     *
     * @return {Object} flounder(s)
     */
    enableByValue: function enableByValue(value) {
        this.disableByValue(value, true);
    },


    /**
     * ## getData
     *
     * returns the option and div tags related to an option
     *
     * @param {Number} _i index to return
     *
     * @return _Object_ option and div tage
     */
    getData: function getData(_i) {
        var _this5 = this;

        var refs = this.refs;

        if (typeof _i === 'number') {
            return { option: refs.selectOptions[_i], div: refs.data[_i] };
        } else if (_i && _i.length && typeof _i !== 'string') {
            return _i.map(function (i) {
                return _this5.getData(i);
            });
        } else if (!_i) {
            return refs.selectOptions.map(function (el, i) {
                return _this5.getData(i);
            });
        } else {
            console.warn('Flounder - Illegal parameter type.');
        }
    },


    /**
     * ## getSelected
     *
     * returns the currently selected data of a SELECT box
     *
     * @return _Void_
     */
    getSelected: function getSelected() {
        var _el = this.refs.select;
        var opts = [],
            opt = void 0;
        var _data = _el.options;
        var classes = this.classes;

        nativeSlice.call(_data).forEach(function (el) {
            if (el.selected && !_utils2.default.hasClass(el, classes.PLACEHOLDER)) {
                opts.push(el);
            }
        });

        return opts;
    },


    /**
     * ## getSelectedValues
     *
     * returns the values of the currently selected data
     *
     * @return _Void_
     */
    getSelectedValues: function getSelectedValues() {
        return this.getSelected().map(function (_v) {
            return _v.value;
        });
    },


    /**
     * ## loadDataFromUrl
     *
     * loads data from a passed url
     *
     * @param {String} url address to get the data from
     * @param {Function} callback function to run after getting the data
     *
     * @return _Void_
     */
    loadDataFromUrl: function loadDataFromUrl(url, callback) {
        var _this6 = this;

        var classes = this.classes;

        try {
            _utils2.default.http.get(url).then(function (data) {
                if (data) {
                    _this6.data = JSON.parse(data);

                    if (callback) {
                        callback(_this6.data);
                    }
                } else {
                    console.warn('no data recieved');
                }
            }).catch(function (e) {
                console.warn('something happened: ', e);
                _this6.rebuild([{
                    text: '',
                    value: '',
                    index: 0,
                    extraClass: classes.LOADING_FAILED
                }]);
            });
        } catch (e) {
            console.warn('something happened.  check your loadDataFromUrl callback ', e);
        }

        return [{
            text: '',
            value: '',
            index: 0,
            extraClass: classes.LOADING
        }];
    },


    /**
     * ## rebuild
     *
     * after editing the data, this can be used to rebuild them
     *
     * @param {Array} data array with option information
     *
     * @return _Object_ rebuilt flounder object
     */
    rebuild: function rebuild(data, props) {
        if (props || !props && (typeof data === 'string' || data && typeof data.length !== 'number')) {
            return this.reconfigure(data, props);
        }

        data = this.data = data || this.data;
        props = this.props;
        var refs = this.refs;
        var _select = refs.select;

        this.deselectAll();
        this.removeOptionsListeners();
        refs.select.innerHTML = '';
        refs.select = false;
        this._default = (0, _defaults.setDefaultOption)(this, props, data, true);
        refs.optionsList.innerHTML = '';

        var _buildData = this.buildData(this._default, this.data, refs.optionsList, _select);

        var _buildData2 = _slicedToArray(_buildData, 2);

        refs.data = _buildData2[0];
        refs.selectOptions = _buildData2[1];

        refs.select = _select;

        this.addOptionsListeners();
        this.data = data;

        this.displaySelected(refs.selected, refs);

        return this;
    },


    /**
     * ## setByIndex
     *
     * programatically sets the value by index.  If there are not enough elements
     * to match the index, then nothing is selected.
     *
     * @param {Mixed} index index to set flounder to.  _Number, or Array of numbers_
     *
     * return _Void_
     */
    setByIndex: function setByIndex(index, multiple) {
        var _this7 = this;

        var programmatic = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

        var refs = this.refs;

        if (typeof index !== 'string' && index.length) {
            var _ret5 = function () {
                var setByIndex = _this7.setByIndex.bind(_this7);
                return {
                    v: index.map(function (_i) {
                        return setByIndex(_i, multiple, programmatic);
                    })
                };
            }();

            if ((typeof _ret5 === 'undefined' ? 'undefined' : _typeof(_ret5)) === "object") return _ret5.v;
        } else {
            var data = this.data;
            var length = data.length;

            if (index < 0) {
                var _length2 = data.length;
                index = _length2 + index;
            }

            var el = refs.data[index];

            if (el) {
                this.___forceMultiple = multiple && this.multiple;
                this.___programmaticClick = programmatic;

                el.click();

                return el;
            }

            return null;
        }
    },


    /**
     * ## setByText
     *
     * programatically sets the text by string.  If the text string
     * is not matched to an element, nothing will be selected
     *
     * @param {Mixed} text text to set flounder to.  _String, or Array of strings_
     *
     * return _Void_
     */
    setByText: function setByText(text, multiple) {
        var _this8 = this;

        var programmatic = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

        if (typeof text !== 'string' && text.length) {
            var _ret6 = function () {
                var setByText = _this8.setByText.bind(_this8);
                return {
                    v: text.map(function (_i) {
                        return setByText(_i, multiple, programmatic);
                    })
                };
            }();

            if ((typeof _ret6 === 'undefined' ? 'undefined' : _typeof(_ret6)) === "object") return _ret6.v;
        } else {
            var _ret7 = function () {
                var res = [];
                text = '' + text;

                _this8.refs.data.forEach(function (el, i) {
                    var _elText = el.innerHTML;

                    if (_elText === text) {
                        res.push(i);
                    }
                });

                return {
                    v: _this8.setByIndex(res, multiple, programmatic)
                };
            }();

            if ((typeof _ret7 === 'undefined' ? 'undefined' : _typeof(_ret7)) === "object") return _ret7.v;
        }
    },


    /**
     * ## setByValue
     *
     * programatically sets the value by string.  If the value string
     * is not matched to an element, nothing will be selected
     *
     * @param {Mixed} value value to set flounder to.  _String, or Array of strings_
     *
     * return _Void_
     */
    setByValue: function setByValue(value, multiple) {
        var _this9 = this;

        var programmatic = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

        if (typeof value !== 'string' && value.length) {
            var _ret8 = function () {
                var setByValue = _this9.setByValue.bind(_this9);
                return {
                    v: value.map(function (_i) {
                        return setByValue(_i, multiple, programmatic);
                    })
                };
            }();

            if ((typeof _ret8 === 'undefined' ? 'undefined' : _typeof(_ret8)) === "object") return _ret8.v;
        } else {
            var values = this.refs.selectOptions.map(function (el, i) {
                return '' + el.value === '' + value ? i : null;
            }).filter(function (a) {
                return a === 0 || !!a;
            });

            return this.setByIndex(values, multiple, programmatic);
        }
    }
};

exports.default = api;

},{"./defaults":15,"./utils":20}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _defaults = require('./defaults');

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var build = {

    /**
     * ## addOptionDescription
     *
     * adds a description to the option
     *
     * @param {DOMElement} el option element to add description to
     * @param {String} text description
     * @param {String} CSS class to apply
     * @return _Void_
     */

    addOptionDescription: function addOptionDescription(el, text, className) {
        var div = document.createElement('div');
        div.innerHTML = text;
        div.className = className;
        el.appendChild(div);
    },


    /**
     * ## addSearch
     *
     * checks if a search box is required and attaches it or not
     *
     * @param {Object} flounder main element reference
     *
     * @return _Mixed_ search node or false
     */
    addSearch: function addSearch(flounder) {
        if (this.search) {
            var classes = this.classes;
            var search = _utils2.default.constructElement({
                tagname: 'input',
                type: 'text',
                className: classes.SEARCH
            });
            flounder.appendChild(search);

            return search;
        }

        return false;
    },


    /**
     * ## bindThis
     *
     * binds this to whatever functions need it.  Arrow functions cannot be used
     * here due to the react extension needing them as well;
     *
     * @return _Void_
     */
    bindThis: function bindThis() {
        var _this = this;

        ['addHoverClass', 'catchBodyClick', 'checkClickTarget', 'checkFlounderKeypress', 'checkMultiTagKeydown', 'clearPlaceholder', 'clickSet', 'divertTarget', 'displayMultipleTags', 'firstTouchController', 'fuzzySearch', 'removeHoverClass', 'removeMultiTag', 'setKeypress', 'setSelectValue', 'toggleList', 'toggleListSearchClick'].forEach(function (func) {
            _this[func] = _this[func].bind(_this);
            _this[func].___isBound = true;
        });
    },


    /**
     * ## buildArrow
     *
     * builds the arrow and the
     *
     * @param {Object} props property object
     * @param {Function} constructElement ref to this.constructElement
     *
     * @return {DOMElement} arrow
     */
    buildArrow: function buildArrow(props, constructElement) {
        if (props.disableArrow) {
            return false;
        } else {
            var classes = this.classes;
            var arrow = constructElement({ className: classes.ARROW });
            var arrowInner = constructElement({ className: classes.ARROW_INNER });
            arrow.appendChild(arrowInner);

            return arrow;
        }
    },


    /**
     * ## buildData
     *
     * builds both the div and select based options. will skip the select box
     * if it already exists
     *
     * @param {Mixed} defaultValue default entry (string or number)
     * @param {Array} data array with optino information
     * @param {Object} optionsList reference to the div option wrapper
     * @param {Object} select reference to the select box
     *
     * @return _Array_ refs to both container elements
     */
    buildData: function buildData(defaultValue, originalData, optionsList, select) {
        var index = 0;
        var data = [];
        var selectOptions = [];
        var constructElement = _utils2.default.constructElement;
        var addOptionDescription = this.addOptionDescription;
        var selectedClass = this.selectedClass;
        var escapeHTML = _utils2.default.escapeHTML;
        var addClass = _utils2.default.addClass;
        var refs = this.refs;
        var selectRef = refs.select;
        var allowHTML = this.allowHTML;
        var classes = this.classes;

        /**
         * ## buildDiv
         *
         * builds an individual div tag for a flounder dropdown
         *
         * @param {Object} dataObj [description]
         * @param {Number} i index
         *
         * @return _DOMElement_
         */
        var buildDiv = function buildDiv(dataObj, i) {
            dataObj.index = i;

            var extraClass = i === defaultValue.index ? '  ' + selectedClass : '';

            var res = {
                className: classes.OPTION + extraClass,
                'data-index': i
            };

            for (var o in dataObj) {
                if (o !== 'text' && o !== 'description') {
                    res[o] = dataObj[o];
                }
            }

            var data = constructElement(res);
            data.innerHTML = allowHTML ? dataObj.text : escapeHTML(dataObj.text);

            if (dataObj.description) {
                addOptionDescription(data, dataObj.description, classes.DESCRIPTION);
            }

            data.className += dataObj.extraClass ? '  ' + dataObj.extraClass : '';
            data.setAttribute('role', 'option');

            return data;
        };

        /**
         * ## buildOption
         *
         * builds an individual option tag for a flounder dropdown
         *
         * @param {Object} dataObj option build properties
         * @param {Number} i index
         *
         * @return _DOMElement_
         */
        var buildOption = function buildOption(dataObj, i) {
            var selectOption = void 0;

            if (!selectRef) {
                var selectOptionClass = classes.OPTION_TAG + '  ' + (dataObj.extraClass || '');
                selectOption = constructElement({ tagname: 'option',
                    className: selectOptionClass.trim(),
                    value: dataObj.value });
                var escapedText = escapeHTML(dataObj.text);
                selectOption.innerHTML = escapedText;

                var disabled = dataObj.disabled;

                if (disabled) {
                    selectOption.setAttribute('disabled', disabled);
                }

                select.appendChild(selectOption);
            } else {
                var selectChild = selectRef.children[i];
                selectOption = selectChild;
                selectChild.setAttribute('value', selectChild.value);

                if (selectChild.disabled === true && data[i]) {
                    addClass(data[i], classes.DISABLED);
                }

                addClass(selectChild, classes.OPTION_TAG);
            }

            if (i === defaultValue.index) {
                selectOption.selected = true;
            }

            if (selectOption.getAttribute('disabled')) {
                addClass(data[i], classes.DISABLED);
            }

            return selectOption;
        };

        originalData.forEach(function (dataObj, i) {
            /* istanbul ignore next */
            var dataObjType = typeof dataObj === 'undefined' ? 'undefined' : _typeof(dataObj);

            if (dataObjType !== 'object') {
                dataObj = originalData[i] = {
                    text: dataObj,
                    value: dataObj
                };
            }

            if (dataObj.header) {
                (function () {
                    var section = constructElement({ tagname: 'div',
                        className: classes.SECTION });
                    var header = constructElement({ tagname: 'div',
                        className: classes.HEADER });
                    header.textContent = dataObj.header;
                    section.appendChild(header);
                    optionsList.appendChild(section);

                    var dataObjData = dataObj.data;
                    dataObjData.forEach(function (d, i) {
                        if (typeof d !== 'object') {
                            d = dataObjData[i] = {
                                text: d,
                                value: d
                            };
                        }

                        data[index] = buildDiv(d, index);
                        section.appendChild(data[index]);
                        selectOptions[index] = buildOption(d, index);
                        index++;
                    });
                })();
            } else {
                data[index] = buildDiv(dataObj, index);
                optionsList.appendChild(data[index]);
                selectOptions[index] = buildOption(dataObj, index);
                index++;
            }
        });

        return [data, selectOptions];
    },


    /**
     * ## buildDom
     *
     * builds flounder
     *
     * @return _Void_
     */
    buildDom: function buildDom() {
        var props = this.props;
        var classes = this.classes;
        this.refs = {};

        var constructElement = _utils2.default.constructElement;

        var wrapper = _utils2.default.constructElement({ className: classes.MAIN_WRAPPER });

        var flounderClass = classes.MAIN;

        var flounderClasses = this.multipleTags ? flounderClass + ' ' + classes.MULTIPLE_TAG_FLOUNDER : flounderClass;

        var flounder = constructElement({ className: flounderClasses });

        flounder.setAttribute('aria-hidden', true);
        flounder.tabIndex = 0;
        wrapper.appendChild(flounder);

        var select = this.initSelectBox(wrapper);
        select.tabIndex = -1;

        var data = this.data;
        var defaultValue = this._default = (0, _defaults.setDefaultOption)(this, this.props, data);

        var selectedDisplayedClasses = this.multipleTags ? classes.SELECTED_DISPLAYED + ' ' + classes.MULTIPLE_SELECTED : classes.SELECTED_DISPLAYED;

        var selected = constructElement({ className: selectedDisplayedClasses,
            'data-value': defaultValue.value, 'data-index': defaultValue.index });

        var multiTagWrapper = this.multipleTags ? constructElement({ className: classes.MULTI_TAG_LIST }) : null;

        var searchLocation = multiTagWrapper || flounder;

        var search = this.addSearch(searchLocation);

        var optionsListWrapper = constructElement({ className: classes.OPTIONS_WRAPPER + '  ' + classes.HIDDEN });
        var optionsList = constructElement({ className: classes.LIST });
        optionsList.setAttribute('role', 'listbox');
        optionsListWrapper.appendChild(optionsList);

        if (this.multiple === true) {
            select.setAttribute('multiple', '');
            optionsList.setAttribute('aria-multiselectable', 'true');
        }

        var arrow = this.buildArrow(props, constructElement);

        [selected, multiTagWrapper, optionsListWrapper, arrow].forEach(function (el) {
            if (el) {
                flounder.appendChild(el);
            }
        });

        var selectOptions = void 0;

        var _buildData = this.buildData(defaultValue, data, optionsList, select);

        var _buildData2 = _slicedToArray(_buildData, 2);

        data = _buildData2[0];
        selectOptions = _buildData2[1];


        this.target.appendChild(wrapper);

        this.refs = { wrapper: wrapper, flounder: flounder, selected: selected, arrow: arrow, optionsListWrapper: optionsListWrapper,
            search: search, multiTagWrapper: multiTagWrapper, optionsList: optionsList, select: select, data: data, selectOptions: selectOptions };

        if (this.multipleTags) {
            var selectedOptions = this.getSelected();

            if (selectedOptions.length === 0) {
                selected.innerHTML = defaultValue.text;
            } else {
                this.displayMultipleTags(selectedOptions, multiTagWrapper);
            }
        } else {
            selected.innerHTML = defaultValue.text;
        }
    },


    /**
     * ## buildMultiTag
     *
     * builds and returns a single multiTag
     *
     * @param {String} option tag to grab text to add to the tag and role
     *
     * @return _DOMElement_ option tag
     */
    buildMultiTag: function buildMultiTag(option) {
        var classes = this.classes;
        var optionText = option.innerHTML;
        var span = document.createElement('SPAN');
        span.className = classes.MULTIPLE_SELECT_TAG;
        span.setAttribute('aria-label', 'Close');
        span.setAttribute('tabindex', 0);

        var a = document.createElement('A');
        a.className = classes.MULTIPLE_TAG_CLOSE;
        a.setAttribute('data-index', option.index);

        span.appendChild(a);

        span.innerHTML += optionText;

        return span;
    },


    /**
     * ## initSelectBox
     *
     * builds the initial select box.  if the given wrapper element is a select
     * box, this instead scrapes that, thus allowing php fed elements
     *
     * @param {DOMElement} wrapper main wrapper element
     *
     * @return _DOMElement_ select box
     */
    initSelectBox: function initSelectBox(wrapper) {
        var _this2 = this;

        var target = this.target;
        var refs = this.refs;
        var select = refs.select;
        var classes = this.classes;

        if (target.tagName === 'SELECT') {
            _utils2.default.addClass(target, classes.SELECT_TAG);
            _utils2.default.addClass(target, classes.HIDDEN);

            select = target;

            if (!this.props.keepChangesOnDestroy) {
                this.popOutSelectElements(select);
            }

            if (target.length > 0 && !this.selectDataOverride) {
                (function () {
                    _this2.refs.select = select;
                    var data = [],
                        selectOptions = [];

                    Array.prototype.slice.call(target.children, 0).forEach(function (optionEl) {
                        selectOptions.push(optionEl);
                        data.push({
                            text: optionEl.innerHTML,
                            value: optionEl.value
                        });
                    });

                    refs.selectOptions = selectOptions;

                    _this2.data = data;
                })();
            } else if (this.selectDataOverride) {
                _utils2.default.removeAllChildren(target);
            }

            this.target = target.parentNode;
            _utils2.default.addClass(target, classes.HIDDEN);
        } else {
            select = _utils2.default.constructElement({ tagname: 'SELECT', className: classes.SELECT_TAG + '  ' + classes.HIDDEN });
            wrapper.appendChild(select);
        }

        return select;
    },


    /**
     * ## popInSelectElements
     *
     * pops the previously saves elements back into a select tag, restoring the
     * original state
     *
     * @param {DOMElement} select select element
     *
     * @return _Void_
     */
    popInSelectElements: function popInSelectElements(select) {
        _utils2.default.removeAllChildren(select);

        this.originalChildren.forEach(function (_el, i) {
            select.appendChild(_el);
        });
    },


    /**
     * ## popOutSelectElements
     *
     * pops out all the options of a select box, clones them, then appends the
     * clones.  This gives us the ability to restore the original tag
     *
     * @param {DOMElement} select select element
     *
     * @return _Void_
     */
    popOutSelectElements: function popOutSelectElements(select) {
        var res = [];
        var children = this.originalChildren = Array.prototype.slice.call(select.children, 0);

        children.forEach(function (_el, i) {
            res[i] = _el.cloneNode(true);
            select.removeChild(_el);
        });

        res.forEach(function (_el) {
            select.appendChild(_el);
        });
    },


    /**
     * ## reconfigure
     *
     * after editing the data, this can be used to rebuild them
     *
     * @param {Object} props object containing config options
     *
     * @return _Object_ rebuilt flounder object
     */
    reconfigure: function reconfigure(data, props) {
        if (data && typeof data !== 'string' && typeof data.length === 'number') {
            props = props = props || this.props;
            props.data = data;
        } else if (!props && typeof data === 'object') {
            props = data;
            props.data = props.data || this.data;
        } else {
            props = props || {};
            props.data = props.data || this.data;
        }

        return this.constructor(this.originalTarget, props);
    },


    /**
     * ## setTarget
     *
     * sets the target related
     *
     * @param {DOMElement} target  the actual to-be-flounderized element
     *
     * @return _Void_
     */
    setTarget: function setTarget(target) {
        target = target.nodeType === 1 ? target : document.querySelector(target);

        this.originalTarget = target;
        target.flounder = this;

        if (target.tagName === 'INPUT') {
            var classes = this.classes;
            _utils2.default.addClass(target, classes.HIDDEN);
            target.setAttribute('aria-hidden', true);
            target.tabIndex = -1;
            target = target.parentNode;
        }

        this.target = target;
    }
};

exports.default = build;

},{"./defaults":15,"./utils":20}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var classes = {
    ARROW: "flounder__arrow--wrapper",
    ARROW_INNER: "flounder__arrow--inner",
    DESCRIPTION: "flounder__option--description",
    DISABLED: "flounder__disabled",
    DISABLED_OPTION: "flounder__disabled--option",
    HEADER: "flounder__header",
    HIDDEN: "flounder--hidden",
    HIDDEN_IOS: "flounder--hidden--ios",
    HOVER: "flounder__hover",
    LIST: "flounder__list",
    LOADING: "flounder__loading",
    LOADING_FAILED: "flounder__loading--failed",
    MAIN: "flounder",
    MAIN_WRAPPER: "flounder--wrapper  flounder__input--select",
    MULTIPLE_TAG_FLOUNDER: "flounder--multiple",
    MULTI_TAG_LIST: "flounder__multi--tag--list",
    MULTIPLE_SELECT_TAG: "flounder__multiple--select--tag",
    MULTIPLE_SELECTED: "flounder__multiple--selected",
    MULTIPLE_TAG_CLOSE: "flounder__multiple__tag__close",
    NO_RESULTS: "flounder__no-results",
    OPEN: "open",
    OPTION: "flounder__option",
    OPTION_TAG: "flounder--option--tag",
    OPTIONS_WRAPPER: "flounder__list--wrapper",
    PLACEHOLDER: "flounder__placeholder",
    PLUG: "flounder__ios--plug",
    SECTION: "flounder__section",
    SELECTED: "flounder__option--selected",
    SELECTED_HIDDEN: "flounder__option--selected--hidden",
    SELECTED_DISPLAYED: "flounder__option--selected--displayed",
    SEARCH: "flounder__input--search",
    SEARCH_HIDDEN: "flounder--search--hidden",
    SELECT_TAG: "flounder--select--tag"
};

exports.default = classes;

},{}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.setDefaultOption = exports.defaultOptions = undefined;

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _classes = require('./classes');

var _classes2 = _interopRequireDefault(_classes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultOptions = exports.defaultOptions = {
    allowHTML: false,
    classes: _classes2.default,
    data: [],
    defaultEmpty: false,
    defaultIndex: false,
    defaultValue: false,
    disableArrow: false,
    keepChangesOnDestroy: false,
    multiple: false,
    multipleTags: false,
    multipleMessage: '(Multiple Items Selected)',
    onChange: function onChange(e, selectedValues) {},
    onClose: function onClose(e, selectedValues) {},
    onComponentDidMount: function onComponentDidMount() {},
    onComponentWillUnmount: function onComponentWillUnmount() {},
    onFirstTouch: function onFirstTouch(e) {},
    onInit: function onInit() {},
    onInputChange: function onInputChange(e) {},
    onOpen: function onOpen(e, selectedValues) {},
    openOnHover: false,
    placeholder: 'Please choose an option',
    search: false,
    selectDataOverride: false
};

var defaults = {

    /**
     * ## setDefaultOption
     *
     * sets the initial default value
     *
     * @param {String or Number}    defaultProp         default passed from this.props
     * @param {Object}              data                this.props.data
     *
     * @return _Void_
     */

    setDefaultOption: function setDefaultOption(self) {
        var configObj = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
        var data = arguments[2];
        var rebuild = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];


        /**
         * ## setIndexDefault
         *
         * sets a specified index as the default option. This only works correctly
         * if it is a valid index, otherwise it returns null
         *
         * @return {Object} default settings
         */
        var setIndexDefault = function setIndexDefault(_data, index) {
            var defaultIndex = index || index === 0 ? index : configObj.defaultIndex;
            var defaultOption = _data[defaultIndex];

            if (defaultOption) {
                defaultOption.index = defaultIndex;
                return defaultOption;
            }

            return null;
        };

        /**
         * ## setPlaceholderDefault
         *
         * sets a placeholder as the default option.  This inserts an empty
         * option first and sets that as default
         *
         * @return {Object} default settings
         */
        var setPlaceholderDefault = function setPlaceholderDefault(self, _data) {
            var refs = self.refs;
            var classes = self.classes;
            var select = refs.select;
            var placeholder = configObj.placeholder;

            var _default = {
                text: placeholder || placeholder === '' ? placeholder : defaultOptions.placeholder,
                value: '',
                index: 0,
                extraClass: classes.HIDDEN + '  ' + classes.PLACEHOLDER
            };

            if (select) {
                var escapedText = self.allowHTML ? _default.text : _utils2.default.escapeHTML(_default.text);

                var defaultOption = _utils2.default.constructElement({ tagname: 'option',
                    className: classes.OPTION_TAG,
                    value: _default.value });
                defaultOption.innerHTML = escapedText;

                select.insertBefore(defaultOption, select[0]);
                self.refs.selectOptions.unshift(defaultOption);
            }

            data.unshift(_default);

            return _default;
        };

        /**
         * ## setValueDefault
         *
         * sets a specified index as the default. This only works correctly if
         * it is a valid value, otherwise it returns null
         *
         * @return {Object} default settings
         */
        var setValueDefault = function setValueDefault(_data, _val) {
            var defaultProp = _val || '' + configObj.defaultValue;
            var index = void 0;

            _data.forEach(function (dataObj, i) {
                var dataObjValue = '' + dataObj.value;

                if (dataObjValue === defaultProp) {
                    index = i;
                }
            });

            var defaultValue = index >= 0 ? _data[index] : null;

            if (defaultValue) {
                defaultValue.index = index;
                return defaultValue;
            }

            return null;
        };

        /**
         * ## sortData
         *
         * checks the data object for header options, and sorts it accordingly
         *
         * @return _Boolean_ hasHeaders
         */
        var sortData = function sortData(data) {
            var res = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
            var i = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

            data.forEach(function (d) {
                if (d.header) {
                    res = sortData(d.data, res, i);
                } else {
                    if (typeof d !== 'object') {
                        d = {
                            text: d,
                            value: d,
                            index: i
                        };
                    } else {
                        d.index = i;
                    }

                    res.push(d);
                    i++;
                }
            });

            return res;
        };

        /**
         * ## checkDefaultPriority
         *
         * sorts out which default should be gotten by priority
         *
         * @return {Object} default data object
         */
        var checkDefaultPriority = function checkDefaultPriority() {
            var _data = sortData(data);

            if ((configObj.multipleTags || configObj.multiple) && !configObj.defaultIndex && !configObj.defaultValue) {
                configObj.placeholder = configObj.placeholder || defaultOptions.placeholder;
            }

            if (configObj.defaultEmpty) {
                configObj.placeholder = '';
            }

            var placeholder = configObj.placeholder;

            if (placeholder || placeholder === '' || _data.length === 0) {
                return setPlaceholderDefault(self, _data);
            }

            var def = void 0;

            if (rebuild) {
                var val = self.refs.selected.getAttribute('data-value');
                def = setValueDefault(_data, val);

                if (def) {
                    return def;
                }
            }

            // default prio
            def = configObj.defaultIndex ? setIndexDefault(_data) : null;
            def = !def && configObj.defaultValue ? setValueDefault(_data) : def;
            def = !def ? setIndexDefault(_data, 0) : def;

            return def;
        };

        data = data || configObj.data || [];

        return checkDefaultPriority();
    }
};

var setDefaultOption = exports.setDefaultOption = defaults.setDefaultOption;

exports.default = defaults;

},{"./classes":14,"./utils":20}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _search2 = require('./search');

var _search3 = _interopRequireDefault(_search2);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _keycodes = require('./keycodes');

var _keycodes2 = _interopRequireDefault(_keycodes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var nativeSlice = Array.prototype.slice;

var events = {

    /**
     * ## addFirstTouchListeners
     *
     * adds the listeners for onFirstTouch
     *
     * @return _Void_
     */

    addFirstTouchListeners: function addFirstTouchListeners() {
        var refs = this.refs;
        refs.selected.addEventListener('click', this.firstTouchController);
        refs.select.addEventListener('focus', this.firstTouchController);

        if (this.props.openOnHover) {
            refs.wrapper.addEventListener('mouseenter', this.firstTouchController);
        }
    },


    /**
     * ## addHoverClass
     *
     * adds a hover class to an element
     *
     * @return Void_
     */
    addHoverClass: function addHoverClass(e) {
        _utils2.default.addClass(e.target, this.classes.HOVER);
    },


    /**
     * ## addListeners
     *
     * adds listeners on render
     *
     * @return _Void_
     */
    addListeners: function addListeners(refs) {
        var ios = this.isIos;
        var changeEvent = ios ? 'blur' : 'change';

        refs.select.addEventListener(changeEvent, this.divertTarget);
        refs.flounder.addEventListener('keydown', this.checkFlounderKeypress);

        if (this.props.openOnHover) {
            var wrapper = refs.wrapper;
            wrapper.addEventListener('mouseenter', this.toggleList);
            wrapper.addEventListener('mouseleave', this.toggleList);
        } else {
            refs.selected.addEventListener('click', this.toggleList);
        }

        this.addFirstTouchListeners();
        this.addOptionsListeners();

        if (this.search) {
            this.addSearchListeners();
        }
    },


    /**
     * ## addMultipleTags
     *
     * adds a tag for each selected option and attaches the correct events to it
     *
     * @param {Array} selectedOptions currently selected options
     * @param {DOMElement} multiTagWrapper parent element of the tags
     *
     * @return _Void_
     */
    addMultipleTags: function addMultipleTags(selectedOptions, multiTagWrapper) {
        var _this = this;

        selectedOptions.forEach(function (option) {
            if (option.value !== '') {
                var tag = _this.buildMultiTag(option);

                multiTagWrapper.appendChild(tag);
            } else {
                option.selected = false;
            }
        });

        nativeSlice.call(multiTagWrapper.children, 0).forEach(function (el) {
            var firstChild = el.firstChild;

            firstChild.addEventListener('click', _this.removeMultiTag);
            el.addEventListener('keydown', _this.checkMultiTagKeydown);
        });
    },


    /**
     * ## addOptionsListeners
     *
     * adds listeners to the options
     *
     * @return _Void_
     */
    addOptionsListeners: function addOptionsListeners() {
        var _this2 = this;

        this.refs.data.forEach(function (dataObj, i) {
            if (dataObj.tagName === 'DIV') {
                dataObj.addEventListener('mouseenter', _this2.addHoverClass);
                dataObj.addEventListener('mouseleave', _this2.removeHoverClass);

                dataObj.addEventListener('click', _this2.clickSet);
            }
        });
    },


    /**
     * ## addPlaceholder
     *
     * determines what (if anything) should be refilled into the the
     * placeholder position
     *
     * @return _Void_
     */
    addPlaceholder: function addPlaceholder() {
        var selectedValues = this.getSelectedValues();
        var val = selectedValues[0];
        var selectedItems = this.getSelected();
        var selectedText = selectedItems.length ? selectedItems[0].innerHTML : '';
        var selectedCount = selectedValues.length;
        var selected = this.refs.selected;

        switch (selectedCount) {
            case 0:
                this.setByIndex(0);
                break;
            case 1:
                selected.innerHTML = selectedText;
                break;
            default:
                selected.innerHTML = this.multipleMessage;
                break;
        }

        if (this.multipleTags) {
            if (selectedCount === 0) {
                this.setByIndex(0);
            }

            if (!val || val === '') {
                selected.innerHTML = this.placeholder;
            } else {
                selected.innerHTML = '';
            }
        }
    },


    /**
     * ## addSearchListeners
     *
     * adds listeners to the search box
     *
     * @return _Void_
     */
    addSearchListeners: function addSearchListeners() {
        var search = this.refs.search;
        var multiTagWrapper = this.refs.multiTagWrapper;

        if (multiTagWrapper) {
            multiTagWrapper.addEventListener('click', this.toggleListSearchClick);
        }

        search.addEventListener('click', this.toggleListSearchClick);
        search.addEventListener('focus', this.toggleListSearchClick);
        search.addEventListener('keyup', this.fuzzySearch);
        search.addEventListener('focus', this.clearPlaceholder);
    },


    /**
     * ## addSelectKeyListener
     *
     * adds a listener to the selectbox to allow for seeking through the native
     * selectbox on keypress
     *
     * @return _Void_
     */
    addSelectKeyListener: function addSelectKeyListener() {
        var refs = this.refs;
        var select = refs.select;

        select.addEventListener('keyup', this.setSelectValue);
        select.addEventListener('keydown', this.setKeypress);

        // weird shit
        // http://stackoverflow.com/questions/34660500/mobile-safari-multi-select-bug
        if (this.isIos) {
            var _classes = this.classes;
            var firstOption = select[0];

            var plug = document.createElement('OPTION');
            plug.disabled = true;
            plug.className = _classes.PLUG;
            select.insertBefore(plug, firstOption);
        }

        select.focus();
    },


    /**
     * ## catchBodyClick
     *
     * checks if a click is on the menu and, if it isnt, closes the menu
     *
     * @param  {Object} e event object
     *
     * @return _Void_
     */
    catchBodyClick: function catchBodyClick(e) {
        if (!this.checkClickTarget(e)) {
            this.toggleList(e);
            this.addPlaceholder();
        }
    },


    /**
     * ## checkClickTarget
     *
     * checks whether the target of a click is the menu or not
     *
     * @param  {Object} e event object
     * @param  {DOMElement} target click target
     *
     * @return _Boolean_
     */
    checkClickTarget: function checkClickTarget(e, target) {
        target = target || e.target;

        if (target === document) {
            return false;
        } else if (target === this.refs.flounder) {
            return true;
        }

        target = target.parentNode;

        if (target) {
            return this.checkClickTarget(e, target);
        }

        return false;
    },


    /**
     * ## checkEnterOnSearch
     *
     * if enter is pressed in the searchox, if there is only one option matching,
     * this selects it
     *
     * @param {Object} e event object
     * @param {Object} refs element references
     *
     * @return _Void_
     */
    checkEnterOnSearch: function checkEnterOnSearch(e, refs) {
        var _this3 = this;

        var val = e.target.value;

        if (val && val !== '') {
            var _ret = function () {
                var res = [];
                var options = refs.data.length;
                var selected = _this3.getSelected();
                var matches = _this3.search.isThereAnythingRelatedTo(val);

                matches.forEach(function (el) {
                    var index = el.i;
                    el = refs.selectOptions[index];

                    if (selected.indexOf(el) === -1) {
                        res.push(el);
                    }
                });

                if (res.length === 1) {
                    var el = res[0];
                    _this3.setByIndex(el.index, _this3.multiple);

                    if (_this3.multipleTags) {
                        setTimeout(function () {
                            return refs.search.focus();
                        }, 200);
                    }
                }

                return {
                    v: res
                };
            }();

            if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
        } else {
            return false;
        }
    },


    /**
     * ## checkFlounderKeypress
     *
     * checks flounder focused keypresses and filters all but space and enter
     *
     * @return _Void_
     */
    checkFlounderKeypress: function checkFlounderKeypress(e) {
        var keyCode = e.keyCode;
        var refs = this.refs;

        if (keyCode === _keycodes2.default.TAB) {
            var optionsList = refs.optionsListWrapper;
            var wrapper = refs.wrapper;

            this.addPlaceholder();
            this.toggleClosed(e, optionsList, refs, wrapper, true);
        } else if (keyCode === _keycodes2.default.ENTER || keyCode === _keycodes2.default.SPACE && e.target.tagName !== 'INPUT') {
            if (keyCode === _keycodes2.default.ENTER && this.search && _utils2.default.hasClass(refs.wrapper, classes.OPEN)) {
                return this.checkEnterOnSearch(e, refs);
            }

            e.preventDefault();
            this.toggleList(e);
        } else if (keyCode >= 48 && keyCode <= 57 || keyCode >= 65 && keyCode <= 90) // letters - allows native behavior
            {
                if (refs.search && e.target.tagName === 'INPUT') {
                    refs.selected.innerHTML = '';
                }
            }
    },


    /**
     * ## checkMultiTagKeydown
     *
     * when a tag is selected, this decided how to handle it by either
     * passing the event on, or handling tag removal
     *
     * @param {Object} e event object
     *
     * @return _Void_
     */
    checkMultiTagKeydown: function checkMultiTagKeydown(e) {
        var keyCode = e.keyCode;
        var self = this;
        var refs = this.refs;
        var children = refs.multiTagWrapper.children;
        var target = e.target;
        var index = nativeSlice.call(children, 0).indexOf(target);

        function focusSearch() {
            refs.search.focus();
            self.clearPlaceholder();
            self.toggleListSearchClick(e);
        }

        if (keyCode === _keycodes2.default.LEFT || keyCode === _keycodes2.default.RIGHT || keyCode === _keycodes2.default.BACKSPACE) {
            e.preventDefault();
            e.stopPropagation();

            if (keyCode === _keycodes2.default.BACKSPACE) {
                self.checkMultiTagKeydownRemove(target, focusSearch, index);
            } else {
                self.checkMultiTagKeydownNavigate(focusSearch, keyCode, index);
            }
        } else if (e.key.length < 2) {
            focusSearch();
        }
    },


    /**
     * ## checkMultiTagKeydownNavigate
     *
     * after left or right is hit while a multitag is focused, this focus' on
     * the next tag in that direction or the the search field
     *
     * @param {Function} focusSearch function to focus on the search field
     * @param {Number} keyCode keyclode from te keypress event
     * @param {Number} index index of currently focused tag
     *
     * @return _Void_
     */
    checkMultiTagKeydownNavigate: function checkMultiTagKeydownNavigate(focusSearch, keyCode, index) {
        var children = this.refs.multiTagWrapper.children;

        var adjustment = keyCode - 38;
        var newIndex = index + adjustment;
        var length = children.length - 1;

        if (newIndex > length) {
            focusSearch();
        } else if (newIndex >= 0) {
            children[newIndex].focus();
        }
    },


    /**
     * ## checkMultiTagKeydownRemove
     *
     * after a backspece while a multitag is focused, this removes the tag and
     * focus' on the next
     *
     * @param {DOMElement} target focused multitag
     * @param {Function} focusSearch function to focus on the search field
     * @param {Number} index index of currently focused tag
     *
     * @return _Void_
     */
    checkMultiTagKeydownRemove: function checkMultiTagKeydownRemove(target, focusSearch, index) {
        var children = this.refs.multiTagWrapper.children;
        var siblings = children.length - 1;

        target.firstChild.click();

        if (siblings > 0) {
            children[index === 0 ? 0 : index - 1].focus();
        } else {
            focusSearch();
        }
    },


    /**
     * ## clearPlaceholder
     *
     * clears the placeholder
     *
     * @param {Object} e event object
     *
     * @return _Void_
     */
    clearPlaceholder: function clearPlaceholder() {
        var selected = this.refs.selected;
        selected.innerHTML = '';
    },


    /**
     * ## clickSet
     *
     * when a flounder option is clicked on it needs to set the option as selected
     *
     * @param {Object} e event object
     *
     * @return _Void_
     */
    clickSet: function clickSet(e) {
        e.preventDefault();
        e.stopPropagation();

        this.setSelectValue({}, e);

        if (!this.___programmaticClick) {
            this.toggleList(e);
        }

        this.___programmaticClick = false;
    },


    /**
     * ## displayMultipleTags
     *
     * handles the display and management of tags
     *
     * @param  {Array} selectedOptions currently selected options
     * @param  {DOMElement} selected div to display currently selected options
     *
     * @return _Void_
     */
    displayMultipleTags: function displayMultipleTags(selectedOptions, multiTagWrapper) {
        var _this4 = this;

        nativeSlice.call(multiTagWrapper.children, 0).forEach(function (el) {
            var firstChild = el.firstChild;
            if (firstChild) {
                firstChild.removeEventListener('click', _this4.removeMultiTag);
                el.removeEventListener('keydown', _this4.checkMultiTagKeydown);
            }
        });

        multiTagWrapper.innerHTML = '';

        if (selectedOptions.length > 0) {
            this.addMultipleTags(selectedOptions, multiTagWrapper);
        } else {
            this.addPlaceholder();
        }

        this.setTextMultiTagIndent();
    },


    /**
     * ## displaySelected
     *
     * formats and displays the chosen options
     *
     * @param {DOMElement} selected display area for the selected option(s)
     * @param {Object} refs element references
     *
     * @return _Void_
     */
    displaySelected: function displaySelected(selected, refs) {
        var value = [];
        var index = -1;

        var selectedOption = this.getSelected();
        var selectedLength = selectedOption.length;
        var multipleTags = this.multipleTags;

        if (!multipleTags && selectedLength === 1) {
            index = selectedOption[0].index;
            value = selectedOption[0].value;
            selected.innerHTML = refs.data[index].innerHTML;
        } else if (!multipleTags && selectedLength === 0) {
            var defaultValue = this._default;
            index = defaultValue.index;
            value = defaultValue.value;
            selected.innerHTML = defaultValue.text;
        } else {
            if (multipleTags) {
                selected.innerHTML = '';
                this.displayMultipleTags(selectedOption, refs.multiTagWrapper);
            } else {
                selected.innerHTML = this.multipleMessage;
            }

            index = selectedOption.map(function (option) {
                return option.index;
            });
            value = selectedOption.map(function (option) {
                return option.value;
            });
        }

        selected.setAttribute('data-value', value);
        selected.setAttribute('data-index', index);
    },


    /**
     * ## divertTarget
     *
     * @param {Object} e event object
     *
     * on interaction with the raw select box, the target will be diverted to
     * the corresponding flounder list element
     *
     * @return _Void_
     */
    divertTarget: function divertTarget(e) {
        // weird shit
        // http://stackoverflow.com/questions/34660500/mobile-safari-multi-select-bug
        if (this.isIos) {
            var select = this.refs.select;
            var _classes2 = this.classes;
            var plug = select.querySelector('.' + _classes2.PLUG);

            if (plug) {
                select.removeChild(plug);
            }
        }

        var index = e.target.selectedIndex;

        var _e = {
            type: e.type,
            target: this.data[index]
        };

        if (this.multipleTags) {
            e.preventDefault();
            e.stopPropagation();
        }

        this.setSelectValue(_e);

        if (!this.multiple) {
            this.toggleList(e, 'close');
        }
    },


    /**
     * ## firstTouchController
     *
     * on first interaction, onFirstTouch is run, then the event listener is
     * removed
     *
     * @param {Object} e event object
     *
     * @return _Void_
     */
    firstTouchController: function firstTouchController(e) {
        var refs = this.refs;

        try {
            this.onFirstTouch(e);
        } catch (e) {
            console.warn('something may be wrong in "onFirstTouch"', e);
        }

        refs.selected.removeEventListener('click', this.firstTouchController);
        refs.select.removeEventListener('focus', this.firstTouchController);

        if (this.props.openOnHover) {
            refs.wrapper.removeEventListener('mouseenter', this.firstTouchController);
        }
    },


    /**
     * ## removeHoverClass
     *
     * removes a hover class from an element
     *
     * @return Void_
     */
    removeHoverClass: function removeHoverClass(e) {
        _utils2.default.removeClass(e.target, this.classes.HOVER);
    },


    /**
       * ## removeListeners
     *
     * removes event listeners from flounder.  normally pre unload
     *
     * @return _Void_
     */
    removeListeners: function removeListeners() {
        var refs = this.refs;

        this.removeOptionsListeners();

        var qsHTML = document.querySelector('html');
        var catchBodyClick = this.catchBodyClick;
        qsHTML.removeEventListener('click', catchBodyClick);
        qsHTML.removeEventListener('touchend', catchBodyClick);

        var select = refs.select;
        select.removeEventListener('change', this.divertTarget);
        select.removeEventListener('blur', this.divertTarget);
        refs.selected.removeEventListener('click', this.toggleList);
        refs.flounder.removeEventListener('keydown', this.checkFlounderKeypress);

        if (this.search) {
            this.removeSearchListeners();
        }
    },


    /**
     * ## removeMultiTag
     *
     * removes a multi selection tag on click; fixes all references to value and state
     *
     * @param  {Object} e event object
     *
     * @return _Void_
     */
    removeMultiTag: function removeMultiTag(e) {
        e.preventDefault();
        e.stopPropagation();

        var value = void 0;
        var index = void 0;
        var refs = this.refs;
        var select = refs.select;
        var selected = refs.selected;
        var target = e.target;
        var defaultValue = this._default;
        var data = this.refs.data;
        var targetIndex = target.getAttribute('data-index');

        select[targetIndex].selected = false;

        var selectedOptions = this.getSelected();

        _utils2.default.removeClass(data[targetIndex], classes.SELECTED_HIDDEN);
        _utils2.default.removeClass(data[targetIndex], classes.SELECTED);

        target.removeEventListener('click', this.removeMultiTag);

        var span = target.parentNode;
        span.parentNode.removeChild(span);

        if (selectedOptions.length === 0) {
            this.addPlaceholder();
            index = -1;
            value = '';
        } else {
            value = selectedOptions.map(function (option) {
                return option.value;
            });

            index = selectedOptions.map(function (option) {
                return option.index;
            });
        }

        this.setTextMultiTagIndent();

        selected.setAttribute('data-value', value);
        selected.setAttribute('data-index', index);

        try {
            this.onChange(e, this.getSelectedValues());
        } catch (e) {
            console.warn('something may be wrong in "onChange"', e);
        }
    },


    /**
     * ## removeOptionsListeners
     *
     * removes event listeners on the data divs
     *
     * @return _Void_
     */
    removeOptionsListeners: function removeOptionsListeners() {
        var _this5 = this;

        this.refs.data.forEach(function (dataObj) {
            if (dataObj.tagName === 'DIV') {
                dataObj.removeEventListener('click', _this5.clickSet);

                dataObj.removeEventListener('mouseenter', _this5.addHoverClass);
                dataObj.removeEventListener('mouseleave', _this5.removeHoverClass);
            }
        });
    },


    /**
     * ## removeSearchListeners
     *
     * removes the listeners from the search input
     *
     * @return _Void_
     */
    removeSearchListeners: function removeSearchListeners() {
        var search = this.refs.search;
        search.removeEventListener('click', this.toggleListSearchClick);
        search.removeEventListener('focus', this.toggleListSearchClick);
        search.removeEventListener('keyup', this.fuzzySearch);
        search.removeEventListener('focus', this.clearPlaceholder);
    },


    /**
     * ## removeSelectedClass
     *
     * removes the [[this.selectedClass]] from all data
     *
     * @return _Void_
     */
    removeSelectedClass: function removeSelectedClass(data) {
        var _this6 = this;

        data = data || this.refs.data;

        data.forEach(function (dataObj, i) {
            _utils2.default.removeClass(dataObj, _this6.selectedClass);
        });
    },


    /**
     * ## removeSelectedValue
     *
     * sets the selected property to false for all data
     *
     * @return _Void_
     */
    removeSelectedValue: function removeSelectedValue(data) {
        data = data || this.refs.data;
        var optionTags = this.refs.select.children;

        data.forEach(function (d, i) {
            optionTags[i].selected = false;
        });
    },


    /**
     * ## removeSelectKeyListener
     *
     * disables the event listener on the native select box
     *
     * @return _Void_
     */
    removeSelectKeyListener: function removeSelectKeyListener() {
        var select = this.refs.select;
        select.removeEventListener('keyup', this.setSelectValue);
    },


    /**
     * ## setKeypress
     *
     * handles arrow key and enter selection
     *
     * @param {Object} e event object
     *
     * @return _Void_
     */
    setKeypress: function setKeypress(e) {
        var refs = this.refs;
        var increment = 0;
        var keyCode = e.keyCode;

        var nonCharacterKeys = _keycodes2.default.NON_CHARACTER_KEYS;

        if (nonCharacterKeys.indexOf(keyCode) === -1) {
            if (keyCode === _keycodes2.default.TAB) {
                var optionsList = refs.optionsListWrapper;
                var wrapper = refs.wrapper;

                this.addPlaceholder();
                this.toggleClosed(e, optionsList, refs, wrapper, true);
                return false;
            }

            if (keyCode === _keycodes2.default.ENTER || keyCode === _keycodes2.default.ESCAPE || keyCode === _keycodes2.default.SPACE) {
                this.toggleList(e);
                return false;
            }

            if (keyCode === _keycodes2.default.UP || keyCode === _keycodes2.default.DOWN) {
                if (!window.sidebar) {
                    e.preventDefault();
                    var _search = refs.search;

                    if (_search) {
                        _search.value = '';
                    }

                    increment = keyCode - 39;
                }

                this.setKeypressElement(e, increment);
            }

            return true;
        }
    },


    /**
     * ## setKeypressElement
     *
     * sets the element after the keypress.  if the element is hidden or
     * disabled, it passes the event back to setKeypress to process the next
     * element
     *
     * @param {Object} e event object
     * @param {Number} increment amount to change the index by
     *
     * @return _Void_
     */
    setKeypressElement: function setKeypressElement(e, increment) {
        var refs = this.refs;
        var selectTag = refs.select;
        var data = refs.data;
        var dataMaxIndex = data.length - 1;
        var index = selectTag.selectedIndex + increment;

        if (index > dataMaxIndex) {
            index = 0;
        } else if (index < 0) {
            index = dataMaxIndex;
        }

        var classes = this.classes;
        var hasClass = _utils2.default.hasClass;
        var dataAtIndex = data[index];

        selectTag.selectedIndex = index;

        if (hasClass(dataAtIndex, classes.HIDDEN) || hasClass(dataAtIndex, classes.SELECTED_HIDDEN) || hasClass(dataAtIndex, classes.SEARCH_HIDDEN) || hasClass(dataAtIndex, classes.DISABLED)) {
            this.setKeypress(e);
        }
    },


    /**
     * ## setSelectValue
     *
     * sets the selected value in flounder.  when activated by a click, the event
     * object is moved to the second variable.  this gives us the ability to
     * discern between triggered events (keyup) and processed events (click)
     * for the sake of choosing our targets
     *
     * @param {Object} obj possible event object
     * @param {Object} e event object
     *
     * @return _Void_
     */
    setSelectValue: function setSelectValue(obj, e) {
        var refs = this.refs;
        var keyCode = void 0;

        if (e) // click
            {
                this.setSelectValueClick(e);
            } else // keypress
            {
                keyCode = obj.keyCode;
                this.setSelectValueButton(obj);
            }

        this.displaySelected(refs.selected, refs);

        if (!this.___programmaticClick) {
            // tab, shift, ctrl, alt, caps, cmd
            var nonKeys = [9, 16, 17, 18, 20, 91];

            if (e || obj.type === 'blur' || !keyCode && obj.type === 'change' || keyCode && nonKeys.indexOf(keyCode) === -1) {
                if (this.toggleList.justOpened && !e) {
                    this.toggleList.justOpened = false;
                } else {
                    try {
                        this.onChange(e, this.getSelectedValues());
                    } catch (e) {
                        console.warn('something may be wrong in "onChange"', e);
                    }
                }
            }
        }
    },


    /**
     * ## setSelectValueButton
     *
     * processes the setting of a value after a keypress event
     *
     * @return _Void_
     */
    setSelectValueButton: function setSelectValueButton(e) {
        var refs = this.refs;
        var data = refs.data;
        var select = refs.select;
        var selectedClass = this.selectedClass;

        var selectedOption = void 0;

        if (this.multipleTags) return;

        this.removeSelectedClass(data);

        var dataArray = this.getSelected();
        var baseOption = dataArray[0];

        if (baseOption) {
            selectedOption = data[baseOption.index];

            _utils2.default.addClass(selectedOption, selectedClass);

            _utils2.default.scrollTo(selectedOption);
        }
    },


    /**
     * ## setSelectValueClick
     *
     * processes the setting of a value after a click event
     *
     * @param {Object} e event object
     *
     * @return _Void_
     */
    setSelectValueClick: function setSelectValueClick(e) {
        var _multiple = this.multiple;
        var refs = this.refs;
        var selectedClass = this.selectedClass;
        var index = void 0,
            selectedOption = void 0;

        if ((!_multiple || _multiple && !this.multipleTags && !e[this.multiSelect]) && !this.___forceMultiple) {
            this.deselectAll();
        }

        this.___forceMultiple = false;
        var target = e.target;

        _utils2.default.toggleClass(target, selectedClass);
        index = target.getAttribute('data-index');

        selectedOption = refs.selectOptions[index];

        selectedOption.selected = selectedOption.selected === true ? false : true;

        var firstOption = refs.selectOptions[0];

        if (firstOption.value === '' && this.getSelected().length > 1) {
            _utils2.default.removeClass(refs.data[0], selectedClass);
            refs.selectOptions[0].selected = false;
        }
    },


    /**
     * ## setTextMultiTagIndent
     *
     * sets the text-indent on the search field to go around selected tags
     *
     * @return _Void_
     */
    setTextMultiTagIndent: function setTextMultiTagIndent() {
        var _this7 = this;

        var refs = this.refs;
        var search = refs.search;

        var offset = 0;

        nativeSlice.call(refs.multiTagWrapper.children, 0).forEach(function (e, i) {
            offset += _utils2.default.getElWidth(e, _this7.setTextMultiTagIndent, _this7);
        });

        /* istanbul ignore next */
        search.style.textIndent = offset > 0 ? offset + 'px' : '';
    },


    /**
     * ## toggleClosed
     *
     * post toggleList, this runs it the list should be closed
     *
     * @param {Object} e event object
     * @param {DOMElement} optionsListWrapper the options list
     * @param {Object} refs contains the references of the elements in flounder
     * @param {DOMElement} wrapper wrapper of flounder
     * @param {Boolean} exit prevents refocus. used while tabbing away
     *
     * @return _Void_
     */
    toggleClosed: function toggleClosed(e, refs) {
        var wrapper = arguments.length <= 2 || arguments[2] === undefined ? this.refs.wrapper : arguments[2];
        var exit = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

        var classes = this.classes;

        _utils2.default.addClass(refs.optionsListWrapper, classes.HIDDEN);
        this.removeSelectKeyListener();

        _utils2.default.removeClass(wrapper, classes.OPEN);

        var qsHTML = document.querySelector('html');
        qsHTML.removeEventListener('click', this.catchBodyClick);
        qsHTML.removeEventListener('touchend', this.catchBodyClick);

        if (this.search) {
            this.fuzzySearchReset();
        }

        if (!exit) {
            refs.flounder.focus();
        }

        if (this.ready) {
            try {
                this.onClose(e, this.getSelectedValues());
            } catch (e) {
                console.warn('something may be wrong in "onClose"', e);
            }
        }
    },


    /**
     * ## toggleList
     *
     * on click of flounder--selected, this shows or hides the options list
     *
     * @param {String} force toggle can be forced by passing 'open' or 'close'
     *
     * @return _Void_
     */
    toggleList: function toggleList(e, force) {
        var classes = this.classes;
        var refs = this.refs;

        var optionsList = refs.optionsListWrapper;

        var wrapper = refs.wrapper;
        var isHidden = _utils2.default.hasClass(optionsList, classes.HIDDEN);
        var type = e.type;

        if (type === 'mouseleave' || force === 'close' || !isHidden) {
            this.toggleList.justOpened = false;
            this.toggleClosed(e, refs, wrapper);
        } else {
            if (type === 'keydown') {
                this.toggleList.justOpened = true;
            }

            this.toggleOpen(e, refs, wrapper);
        }
    },


    /**
     * ## toggleListSearchClick
     *
     * toggleList wrapper for search.  only triggered if flounder is closed
     *
     * @return _Void_
     */
    toggleListSearchClick: function toggleListSearchClick(e) {
        var classes = this.classes;

        if (!_utils2.default.hasClass(this.refs.wrapper, classes.OPEN)) {
            this.toggleList(e, 'open');
        }
    },


    /**
     * ## toggleOpen
     *
     * post toggleList, this runs it the list should be opened
     *
     * @param {Object} e event object
     * @param {DOMElement} optionsListWrapper the options list
     * @param {Object} refs contains the references of the elements in flounder
     * @param {DOMElement} wrapper wrapper of flounder
     *
     * @return _Void_
     */
    toggleOpen: function toggleOpen(e, refs) {
        this.addSelectKeyListener();

        if (!this.isIos || this.search || this.multipleTags === true) {
            var _classes3 = this.classes;

            _utils2.default.removeClass(refs.optionsListWrapper, _classes3.HIDDEN);
            _utils2.default.addClass(refs.wrapper, _classes3.OPEN);

            var qsHTML = document.querySelector('html');

            qsHTML.addEventListener('click', this.catchBodyClick);
            qsHTML.addEventListener('touchend', this.catchBodyClick);
        }

        if (!this.multiple) {
            var index = refs.select.selectedIndex;
            var selectedDiv = refs.data[index];

            _utils2.default.scrollTo(selectedDiv);
        }

        if (this.search) {
            refs.search.focus();
        }

        if (refs.multiTagWrapper && refs.multiTagWrapper.childNodes.length === refs.optionsList.childNodes.length) {
            this.removeNoResultsMessage();
            this.addNoMoreOptionsMessage();
        }

        if (this.ready) {
            try {
                this.onOpen(e, this.getSelectedValues());
            } catch (e) {
                console.warn('something may be wrong in "onOpen"', e);
            }
        }
    }
};

exports.default = events;

},{"./keycodes":18,"./search":19,"./utils":20}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _defaults = require('./defaults');

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _api = require('./api');

var _api2 = _interopRequireDefault(_api);

var _build = require('./build');

var _build2 = _interopRequireDefault(_build);

var _events = require('./events');

var _events2 = _interopRequireDefault(_events);

var _search = require('./search');

var _search2 = _interopRequireDefault(_search);

var _version = require('./version');

var _version2 = _interopRequireDefault(_version);

var _keycodes = require('./keycodes');

var _keycodes2 = _interopRequireDefault(_keycodes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * main flounder class
 *
 * @return {Object} Flounder instance
 */

var Flounder = function () {
    _createClass(Flounder, [{
        key: 'addNoMoreOptionsMessage',

        /**
         * ## addNoMoreOptionsMessage
         *
         * Adding 'No More Options' message to the option list
         *
         * @return _Void_
         */
        value: function addNoMoreOptionsMessage() {
            var classes = this.classes;
            var noMoreOptionsEl = this.refs.noMoreOptionsEl || _utils2.default.constructElement({ className: classes.NO_RESULTS });

            noMoreOptionsEl.innerHTML = 'No more recipients to add.';
            this.refs.optionsList.appendChild(noMoreOptionsEl);

            this.refs.noMoreOptionsEl = noMoreOptionsEl;
        }

        /**
         * ## addNoResultsMessage
         *
         * Adding 'No Results' message to the option list
         *
         * @return _Void_
         */

    }, {
        key: 'addNoResultsMessage',
        value: function addNoResultsMessage() {
            var classes = this.classes;
            var noResultsEl = this.refs.noResultsEl || _utils2.default.constructElement({ className: classes.NO_RESULTS });

            noResultsEl.innerHTML = 'No matches found';
            this.refs.optionsList.appendChild(noResultsEl);

            this.refs.noResultsEl = noResultsEl;
        }

        /**
         * ## componentWillUnmount
         *
         * on unmount, removes events
         *
         * @return {Void} void
         */

    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            try {
                this.onComponentWillUnmount();
            } catch (e) {
                console.warn('something may be wrong in\n                                        "onComponentWillUnmount"', e);
            }

            this.removeListeners();

            if (this.originalChildren) {
                this.popInSelectElements(this.refs.select);
            }
        }

        /**
         * ## constructor
         *
         * filters and sets up the main init
         *
         * @param {Mixed} target flounder mount point _DOMElement, String, Array_
         * @param {Object} props passed options
         *
         * @return {Object} new flounder object
         */

    }]);

    function Flounder(target, props) {
        _classCallCheck(this, Flounder);

        if (!target) {
            console.warn('Flounder - No target element found.');
        } else {
            if (typeof target === 'string') {
                target = document.querySelectorAll(target);
            }

            if ((target.length || target.length === 0) && target.tagName !== 'SELECT') {
                if (target.length > 1) {
                    console.warn('Flounder - More than one element found.\n                                                Dropping all but the first.');
                } else if (target.length === 0) {
                    throw 'Flounder - No target element found.';
                }

                target = target[0];
            }

            if (target.flounder) {
                target.flounder.destroy();
            }

            return this.init(target, props);
        }
    }

    /**
     * ## displaySelected
     *
     * formats and displays the chosen options
     *
     * @param {DOMElement} selected display area for the selected option(s)
     * @param {Object} refs element references
     *
     * @return _Void_
     */


    _createClass(Flounder, [{
        key: 'displaySelected',
        value: function displaySelected(selected, refs) {
            var value = [];
            var index = -1;

            var selectedOption = this.getSelected();
            var selectedLength = selectedOption.length;
            var multipleTags = this.multipleTags;

            if (!multipleTags && selectedLength === 1) {
                index = selectedOption[0].index;
                selected.innerHTML = refs.data[index].innerHTML;
                value = selectedOption[0].value;
            } else if (!multipleTags && selectedLength === 0) {
                var defaultValue = this._default;
                index = defaultValue.index || -1;
                selected.innerHTML = defaultValue.text;
                value = defaultValue.value;
            } else {
                if (multipleTags) {
                    selected.innerHTML = '';
                    this.displayMultipleTags(selectedOption, refs.multiTagWrapper);
                } else {
                    selected.innerHTML = this.multipleMessage;
                }

                index = selectedOption.map(function (option) {
                    return option.index;
                });
                value = selectedOption.map(function (option) {
                    return option.value;
                });
            }

            selected.setAttribute('data-value', value);
            selected.setAttribute('data-index', index);
        }

        /**
         * ## filterSearchResults
         *
         * filters results and adjusts the search hidden class on the dataOptions
         *
         * @param {Object} e event object
         *
         * @return _Void_
         */

    }, {
        key: 'filterSearchResults',
        value: function filterSearchResults(e) {
            var _this = this;

            var val = e.target.value.trim();

            this.fuzzySearch.__previousValue = val;

            var matches = this.search.isThereAnythingRelatedTo(val) || [];

            if (val !== '') {
                (function () {
                    var data = _this.refs.data;
                    var classes = _this.classes;

                    data.forEach(function (el, i) {
                        _utils2.default.addClass(el, classes.SEARCH_HIDDEN);
                    });

                    matches.forEach(function (e) {
                        _utils2.default.removeClass(data[e.i], classes.SEARCH_HIDDEN);
                    });

                    if (!_this.refs.noMoreOptionsEl) {
                        if (matches.length === 0) {
                            _this.addNoResultsMessage();
                        } else {
                            _this.removeNoResultsMessage();
                        }
                    }
                })();
            } else {
                this.fuzzySearchReset();
            }
        }

        /**
         * ## fuzzySearch
         *
         * filters events to determine the correct actions, based on events from the search box
         *
         * @param {Object} e event object
         *
         * @return _Void_
         */

    }, {
        key: 'fuzzySearch',
        value: function fuzzySearch(e) {
            this.lastSearchEvent = e;
            this.fuzzySearch.__previousValue = this.fuzzySearch.__previousValue || '';

            try {
                this.onInputChange(e);
            } catch (e) {
                console.warn('something may be wrong in "onInputChange"', e);
            }

            if (!this.toggleList.justOpened) {
                e.preventDefault();

                var keyCode = e.keyCode;

                if (keyCode !== _keycodes2.default.UP && keyCode !== _keycodes2.default.DOWN && keyCode !== _keycodes2.default.ENTER && keyCode !== _keycodes2.default.ESCAPE) {
                    if (this.multipleTags && keyCode === _keycodes2.default.BACKSPACE && this.fuzzySearch.__previousValue === '') {
                        var lastTag = this.refs.multiTagWrapper.lastChild;

                        if (lastTag) {
                            lastTag.focus();
                        }
                    } else {
                        this.filterSearchResults(e);
                    }
                } else if (keyCode === _keycodes2.default.ESCAPE || keyCode === _keycodes2.default.ENTER) {
                    this.fuzzySearchReset();
                    this.toggleList(e, 'close');
                    this.addPlaceholder();
                }
            } else {
                this.toggleList.justOpened = false;
            }
        }

        /**
         * ## fuzzySearchReset
         *
         * resets all options to visible
         *
         * @return _Void_
         */

    }, {
        key: 'fuzzySearchReset',
        value: function fuzzySearchReset() {
            var refs = this.refs;
            var classes = this.classes;

            refs.data.forEach(function (dataObj) {
                _utils2.default.removeClass(dataObj, classes.SEARCH_HIDDEN);
            });

            refs.search.value = '';
        }

        /**
         * ## init
         *
         * post setup, this sets initial values and starts the build process
         *
         * @param {DOMElement} target flounder mount point
         * @param {Object} props passed options
         *
         * @return {Object} new flounder object
         */

    }, {
        key: 'init',
        value: function init(target, props) {
            this.props = props;

            this.bindThis();
            this.initializeOptions();
            this.setTarget(target);

            if (this.search) {
                this.search = new _search2.default(this);
            }

            try {
                this.onInit();
            } catch (e) {
                console.warn('something may be wrong in "onInit"', e);
            }

            this.buildDom();

            var _utils$setPlatform = _utils2.default.setPlatform();

            var isOsx = _utils$setPlatform.isOsx;
            var isIos = _utils$setPlatform.isIos;
            var multiSelect = _utils$setPlatform.multiSelect;

            this.isOsx = isOsx;
            this.isIos = isIos;
            this.multiSelect = multiSelect;
            this.onRender();

            try {
                this.onComponentDidMount();
            } catch (e) {
                console.warn('something may be wrong in "onComponentDidMount"', e);
            }

            this.ready = true;

            this.originalTarget.flounder = this.target.flounder = this;

            return this.refs.flounder.flounder = this;
        }

        /**
         * ## initializeOptions
         *
         * inserts the initial options into the flounder object, setting defaults
         * when necessary
         *
         * @return {Void} void
         */

    }, {
        key: 'initializeOptions',
        value: function initializeOptions() {
            var props = this.props = this.props || {};

            if (props.onSelect) {
                props.onChange = props.onSelect;

                console.warn('Please use onChange.  onSelect has been depricated\n                                            and will be removed in 2.0.0');

                this.onSelect = function () {
                    console.warn('Please use onChange. onSelect has been\n                                    depricated and will be removed in 2.0.0');
                    this.onChange.apply(this, arguments);
                };
            }

            for (var opt in _defaults.defaultOptions) {
                if (_defaults.defaultOptions.hasOwnProperty(opt)) {
                    if (opt === 'classes') {
                        this.classes = {};
                        var defaultClasses = _defaults.defaultOptions[opt];
                        var propClasses = typeof props[opt] === 'object' ? props[opt] : {};

                        for (var clss in defaultClasses) {
                            this.classes[clss] = propClasses[clss] ? propClasses[clss] : defaultClasses[clss];
                        }
                    } else {
                        this[opt] = props[opt] !== undefined ? props[opt] : _defaults.defaultOptions[opt];
                    }
                }
            }

            this.selectedClass = this.classes.SELECTED;

            if (props.defaultEmpty) {
                this.placeholder = '';
            }

            if (this.multipleTags) {
                this.search = true;
                this.multiple = true;
                this.selectedClass += '  ' + this.classes.SELECTED_HIDDEN;

                if (!this.placeholder) {
                    this.placeholder = _defaults.defaultOptions.placeholder;
                }
            }
        }

        /**
         * ## onRender
         *
         * attaches necessary events to the built DOM
         *
         * @return {Void} void
         */

    }, {
        key: 'onRender',
        value: function onRender() {
            var props = this.props;
            var refs = this.refs;
            var data = refs.data;

            if (!!this.isIos && !this.multiple) {
                var sel = refs.select;
                var classes = this.classes;
                _utils2.default.removeClass(sel, classes.HIDDEN);
                _utils2.default.addClass(sel, classes.HIDDEN_IOS);
            }

            this.addListeners(refs, props);
        }

        /**
         * ## removeMultiTag
         *
         * removes a multi selection tag on click; fixes all references to value and state
         *
         * @param  {Object} e event object
         *
         * @return _Void_
         */

    }, {
        key: 'removeMultiTag',
        value: function removeMultiTag(e) {
            e.preventDefault();
            e.stopPropagation();

            var value = void 0;
            var index = void 0;
            var classes = this.classes;
            var refs = this.refs;
            var select = refs.select;
            var selected = refs.selected;
            var target = e.target;
            var defaultValue = this._default;
            var data = this.refs.data;
            var targetIndex = target.getAttribute('data-index');
            select[targetIndex].selected = false;

            var selectedOptions = this.getSelected();

            _utils2.default.removeClass(data[targetIndex], classes.SELECTED_HIDDEN);
            _utils2.default.removeClass(data[targetIndex], classes.SELECTED);

            target.removeEventListener('click', this.removeMultiTag);

            var span = target.parentNode;
            span.parentNode.removeChild(span);

            if (selectedOptions.length === 0) {
                this.addPlaceholder();
                index = -1;
                value = '';
            } else {
                value = selectedOptions.map(function (option) {
                    return option.value;
                });

                index = selectedOptions.map(function (option) {
                    return option.index;
                });
            }

            this.removeNoMoreOptionsMessage();
            this.removeNoResultsMessage();

            if (this.lastSearchEvent) {
                this.fuzzySearch(this.lastSearchEvent);
            }

            selected.setAttribute('data-value', value);
            selected.setAttribute('data-index', index);

            try {
                this.onSelect(e, this.getSelectedValues());
            } catch (e) {
                console.warn('something may be wrong in "onSelect"', e);
            }
        }

        /**
         * ## removeNoResultsMessage
         *
         * Removing 'No Results' message from the option list
         *
         * @return _Void_
         */

    }, {
        key: 'removeNoResultsMessage',
        value: function removeNoResultsMessage() {
            var noResultsEl = this.refs.noResultsEl;

            if (this.refs.optionsList && noResultsEl) {
                this.refs.optionsList.removeChild(noResultsEl);
                this.refs.noResultsEl = undefined;
            }
        }

        /**
         * ## removeNoMoreOptionsMessage
         *
         * Removing 'No More options' message from the option list
         *
         * @return _Void_
         */

    }, {
        key: 'removeNoMoreOptionsMessage',
        value: function removeNoMoreOptionsMessage() {
            var noMoreOptionsEl = this.refs.noMoreOptionsEl;

            if (this.refs.optionsList && noMoreOptionsEl) {
                this.refs.optionsList.removeChild(noMoreOptionsEl);
                this.refs.noMoreOptionsEl = undefined;
            }
        }

        /**
         * ## removeSelectedClass
         *
         * removes the [[this.selectedClass]] from all data
         *
         * @return _Void_
         */

    }, {
        key: 'removeSelectedClass',
        value: function removeSelectedClass(data) {
            var _this2 = this;

            data = data || this.refs.data;

            data.forEach(function (dataObj, i) {
                _utils2.default.removeClass(dataObj, _this2.selectedClass);
            });
        }

        /**
         * ## removeSelectedValue
         *
         * sets the selected property to false for all data
         *
         * @return _Void_
         */

    }, {
        key: 'removeSelectedValue',
        value: function removeSelectedValue(data) {
            var _this3 = this;

            data = data || this.refs.data;

            data.forEach(function (d, i) {
                _this3.refs.select[i].selected = false;
            });
        }

        /**
         * ## sortData
         *
         * checks the data object for header options, and sorts it accordingly
         *
         * @return {Boolean} hasHeaders
         */

    }, {
        key: 'sortData',
        value: function sortData(data) {
            var _this4 = this;

            var res = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
            var i = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

            data.forEach(function (d) {
                if (d.header) {
                    res = _this4.sortData(d.data, res, i);
                } else {
                    if (typeof d !== 'object') {
                        d = {
                            text: d,
                            value: d,
                            index: i
                        };
                    } else {
                        d.index = i;
                    }

                    res.push(d);
                    i++;
                }
            });

            return res;
        }
    }]);

    return Flounder;
}();

/**
 * ## .find
 *
 * accepts array-like objects and selector strings to make multiple flounders
 *
 * @param {Array or String} flounder target(s)
 * @param {Object} props passed options
 *
 * @return {Array} array of flounders
 */


Flounder.find = function (targets, props) {
    if (typeof targets === 'string') {
        targets = document.querySelectorAll(targets);
    } else if (targets.nodeType === 1) {
        targets = [targets];
    }

    return Array.prototype.slice.call(targets, 0).map(function (el) {
        return new Flounder(el, props);
    });
};

/**
 * ## version
 *
 * sets version with getters and no setters for the sake of being read-only
 */
Object.defineProperty(Flounder, 'version', {
    get: function get() {
        return _version2.default;
    }
});

Object.defineProperty(Flounder.prototype, 'version', {
    get: function get() {
        return _version2.default;
    }
});

_utils2.default.extendClass(Flounder, _api2.default, _build2.default, _events2.default);

exports.default = Flounder;

},{"./api":12,"./build":13,"./defaults":15,"./events":16,"./keycodes":18,"./search":19,"./utils":20,"./version":21}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var keycodes = {
    BACKSPACE: 8,
    DOWN: 40,
    ENTER: 13,
    ESCAPE: 27,
    LEFT: 37,
    RIGHT: 39,
    SPACE: 32,
    TAB: 9,
    UP: 38,
    NON_CHARACTER_KEYS: [16, 17, 18, 20, 91, 93]
};

exports.default = keycodes;

},{}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * search defaults
 *
 * @type {Object}
 */
var defaults = exports.defaults = {
    /*
     * minimum value length to search
     *
     * _Number_
     */
    minimumValueLength: 1,

    /*
     * minimum score to display
     *
     * _Number_
     */
    minimumScore: 0,

    /*
     * params to test for score
     *
     * called as:
     * score += this.scoreThis( search[ param ], weights[ param ] );
     */
    scoreProperties: ['text', 'textFlat', 'textSplit', 'value', 'valueFlat', 'valueSplit', 'description', 'descriptionSplit'],

    /*
     * params to test with startsWith
     *
     * called as:
     * score += startsWith( query, search[ param ], weights[ param + `StartsWith` ] );
     */
    startsWithProperties: ['text', 'value'],

    /*
     * scoring weight
     */
    weights: {
        text: 30,
        textStartsWith: 50,
        textFlat: 10,
        textSplit: 10,

        value: 30,
        valueStartsWith: 50,
        valueFlat: 10,
        valueSplit: 10,

        description: 15,
        descriptionSplit: 30
    }
};

/**
 * ## Sole
 *
 * turns out there`s all kinds of flounders
 */

var Sole = exports.Sole = function () {
    _createClass(Sole, [{
        key: 'compareScoreCards',

        /**
         * ## compareScoreCards
         *
         * Sorts out results by the score
         *
         * @param {Object} a result
         * @param {Object} b result to compare with
         *
         * @return _Number_ comparison result
         */
        value: function compareScoreCards(a, b) {
            if (a && a.score && b && b.score) {
                a = a.score;
                b = b.score;

                if (a > b) {
                    return 1;
                } else if (a < b) {
                    return -1;
                }

                return 0;
            }

            return null;
        }

        /**
         * ## constructor
         *
         * initial setup of Sole object
         *
         * @param {Object} options option object
         *
         * @return _Object_ this
         */

    }]);

    function Sole(flounder) {
        _classCallCheck(this, Sole);

        this.flounder = flounder;

        this.getResultWeights = this.getResultWeights.bind(this);
        this.getResultWeights.bound = true;

        this.scoreThis = this.scoreThis.bind(this);
        this.scoreThis.bound = true;

        return this;
    }

    /**
     * ## escapeRegExp
     *
     * escapes a string to be compatible with regex
     *
     * @param {String} string string to be escaped
     *
     * return _String_ escaped string
     */


    _createClass(Sole, [{
        key: 'escapeRegExp',
        value: function escapeRegExp(string) {
            return string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
        }

        /**
         * ## getResultWeights
         *
         * after the data is prepared this is mapped through the data to get weighted results
         *
         * @param  {Object} data object
         * @param  {Number} i index
         *
         * @return _Object_ res weighted results
         */

    }, {
        key: 'getResultWeights',
        value: function getResultWeights(d, i) {
            var _this = this;

            var score = 0;
            var res = { i: i, d: d };
            var search = d.search = d.search || {};
            var weights = defaults.weights;
            var dText = '' + d.text;
            var dValue = '' + d.value;

            search.text = dText;
            search.textFlat = dText.toLowerCase();
            search.textSplit = search.textFlat.split(' ');

            search.value = dValue;
            search.valueFlat = dValue.toLowerCase();
            search.valueSplit = search.valueFlat.split(' ');

            search.description = d.description ? d.description.toLowerCase() : null;
            search.descriptionSplit = d.description ? search.description.split(' ') : null;

            defaults.scoreProperties.forEach(function (param) {
                score += _this.scoreThis(search[param], weights[param]);
            });

            defaults.startsWithProperties.forEach(function (param) {
                score += _this.startsWith(_this.query, search[param], weights[param + 'StartsWith']);
            });

            res.score = score;

            return res;
        }

        /**
         * ## isItemAboveMinimum
         *
         * removes the items that have recieved a score lower than the set minimum
         *
         * @return _Boolean_ under the minimum or not
         */

    }, {
        key: 'isItemAboveMinimum',
        value: function isItemAboveMinimum(d) {
            return d.score >= defaults.minimumScore ? true : false;
        }

        /**
         * ## isThereAnythingRelatedTo
         *
         * Check our search content for related query words,
         * here it applies the various weightings to the portions of the search
         * content.  Triggers show results
         *
         * @param {Array} query  array of words to search the content for
         *
         * @return _Array_ results returns array of relevant search results
         */

    }, {
        key: 'isThereAnythingRelatedTo',
        value: function isThereAnythingRelatedTo() {
            var query = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

            var ratedResults = void 0;

            query = query.length ? query : '' + query;

            if (query.length >= defaults.minimumValueLength) {
                this.query = query.toLowerCase().split(' ');

                var data = this.flounder.data;
                data = this.flounder.sortData(data);

                ratedResults = this.ratedResults = data.map(this.getResultWeights);
            } else {
                return false;
            }

            ratedResults.sort(this.compareScoreCards);
            ratedResults = ratedResults.filter(this.isItemAboveMinimum);

            return this.ratedResults = ratedResults;
        }

        /**
         * ## startsWith
         *
         * checks the beginning of the given text to see if the query matches exactly
         *
         * @param {String} query string to search for
         * @param {String} value string to search in
         * @param {Integer} weight amount of points to give an exact match
         *
         * @return _Integer_ points to award
         */

    }, {
        key: 'startsWith',
        value: function startsWith(query, value, weight) {
            var valLength = value.length;
            var queryLength = query.length;

            if (queryLength <= valLength) {
                var valStr = value.toLowerCase().slice(0, queryLength);

                if (valStr === query) {
                    return weight;
                }
            }

            return 0;
        }

        /**
         * ## scoreThis
         *
         * Queries a string or array for a set of search options and assigns a
         * weighted score.
         *
         * @param {String} target string to be search
         * @param {Integer} weight weighting of importance for this target.
         *                   higher is more important
         * @param {Boolean} noPunishment when passed true, this does not give
         *                               negative points for non-matches
         *
         * @return _Integer_ the final weight adjusted score
         */

    }, {
        key: 'scoreThis',
        value: function scoreThis(target, weight, noPunishment) {
            var _this2 = this;

            var score = 0;

            if (target) {
                this.query.forEach(function (queryWord) {
                    queryWord = _this2.escapeRegExp(queryWord);
                    var count = 0;

                    if (typeof target === 'string') {
                        queryWord = new RegExp(queryWord, 'g');
                        count = (target.match(queryWord) || []).length;
                    } else if (target[0]) // array.  what if the words obj has the word length?
                        {
                            target.forEach(function (word) {
                                count = word.indexOf(queryWord) !== -1 ? 1 : 0;
                            });
                        } else {
                        count = target[queryWord] || 0.000001;
                    }

                    if (count && count > 0) {
                        score += weight * count * 10;
                    } else if (noPunishment !== true) {
                        score = -weight;
                    }
                });
            }

            return Math.floor(score);
        }
    }]);

    return Sole;
}();

exports.default = Sole;

},{}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _http = require('microbejs/src/modules/http');

var _http2 = _interopRequireDefault(_http);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var utils = {
    /**
     * ## addClass
     *
     * on the quest to nuke jquery, a wild helper function appears
     *
     * @param {DOMElement} _el target element
     * @param {String} _class class to add
     *
     * @return _Void_
     */

    addClass: function addClass(_el, _class) {
        if (typeof _class !== 'string' && _class.length) {
            _class.forEach(function (_c) {
                utils.addClass(_el, _c);
            });

            return true;
        }

        var _elClass = _el.className;
        var _elClassLength = _elClass.length;

        if (!utils.hasClass(_el, _class) && _elClass.slice(0, _class.length + 1) !== _class + ' ' && _elClass.slice(_elClassLength - _class.length - 1, _elClassLength) !== ' ' + _class) {
            _elClass += '  ' + _class;
        }

        _el.className = _elClass.trim();
    },


    /**
     * ## attachAttributes
     *
     * attached data attributes and others (seperately)
     *
     * @param {DOMElement} _el element to assign attributes
     * @param {Object} _elObj contains the attributes to attach
     *
     * @return _Void_
     */
    attachAttributes: function attachAttributes(_el, _elObj) {
        if (_elObj) {
            for (var att in _elObj) {
                if (att.slice(0, 5) === 'data-') {
                    _el.setAttribute(att, _elObj[att]);
                } else {
                    _el[att] = _elObj[att];
                }
            }
        } else {
            return null;
        }
    },


    /**
     * ## constructElement
     *
     * @param {Object} _elObj object carrying properties to transfer
     *
     * @return _Element_
     */
    constructElement: function constructElement(_elObj) {
        var _el = document.createElement(_elObj.tagname || 'div');

        utils.attachAttributes(_el, _elObj);

        return _el;
    },


    /**
     * ## extendClass
     *
     * extends a class from an object.  returns the original reference
     *
     * @param {Class} _extend class to be extended
     * @param {Class} objects objects to extend the class with
     *
     * @return {Class} modified class object
     */
    extendClass: function extendClass(_extend) {
        _extend = _extend.prototype;

        var merge = function merge(obj) {
            for (var prop in obj) {
                _extend[prop] = obj[prop];
            }
        };

        for (var _len = arguments.length, objects = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            objects[_key - 1] = arguments[_key];
        }

        for (var i = 0, lenI = objects.length; i < lenI; i++) {
            var obj = objects[i];
            merge(obj);
        }

        return _extend;
    },


    /**
     * ## escapeHTML
     *
     * Escapes HTML in order to put correct elements in the DOM
     *
     * @param {String} string unescaped string
     *
     * @return _Void_
     */
    escapeHTML: function escapeHTML(string) {
        return String(string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },


    /**
     * ## getElWidth
     *
     * gets the width adjusted for margins
     *
     * @param {DOMElement} el target element
     *
     * @return _Integer_ adjusted width
     */
    getElWidth: function getElWidth(el, _cb, context) {
        var timeout = arguments.length <= 3 || arguments[3] === undefined ? 1500 : arguments[3];

        var style = window.getComputedStyle(el);

        if (el.offsetWidth === 0 && this.__checkWidthAgain !== true) {
            if (_cb && context) {
                /* istanbul ignore next */
                setTimeout(_cb.bind(context), timeout);
                this.__checkWidthAgain = true;
            } else {
                throw 'Flounder getElWidth error: no callback given.';
            }
        } else {
            this.__checkWidthAgain = false;
        }

        return el.offsetWidth + parseInt(style['margin-left']) + parseInt(style['margin-right']);
    },


    /**
     * ## hasClass
     *
     * on the quest to nuke jquery, a wild helper function appears
     *
     * @param {DOMElement} _el target element
     * @param {String} _class class to check
     *
     * @return _Void_
     */
    hasClass: function hasClass(_el, _class) {
        var _elClass = _el.className;
        var regex = new RegExp('(^' + _class + ' )|( ' + _class + '$)|( ' + _class + ' )|(^' + _class + '$)');
        return !!_elClass.match(regex);
    },


    /* placeholder for microbe http module */
    http: false,

    /**
     * ## iosVersion
     *
     * checks and returns the ios version
     *
     * @param {Object} windowObj window, but allows for as testing override
     *
     * @return _Void_
     */
    iosVersion: function iosVersion() {
        var windowObj = arguments.length <= 0 || arguments[0] === undefined ? window : arguments[0];

        if (/iPad|iPhone|iPod/.test(windowObj.navigator.platform)) {
            if (!!windowObj.indexedDB) {
                return '8+';
            }
            if (!!windowObj.SpeechSynthesisUtterance) {
                return '7';
            }
            if (!!windowObj.webkitAudioContext) {
                return '6';
            }
            return '5-';
        }

        return false;
    },


    /**
     * ## removeAllChildren
     *
     * removes all children from a specified target
     *
     * @param {DOMElement} target target element
     *
     * @return _Void_
     */
    removeAllChildren: function removeAllChildren(target) {
        Array.prototype.slice.call(target.children, 0).forEach(function (el) {
            target.removeChild(el);
        });
    },


    /**
     * ## removeClass
     *
     * on the quest to nuke jquery, a wild helper function appears
     *
     * @param {DOMElement} _el target element
     * @param {String} _class class to remove
     *
     * @return _Void_
     */
    removeClass: function removeClass(el, _class) {
        if (typeof _class !== 'string' && _class.length) {
            _class.forEach(function (_c) {
                utils.removeClass(el, _c);
            });

            return true;
        }

        var baseClass = el.className;
        var baseClassLength = baseClass.length;
        var classLength = _class.length;

        if (baseClass === _class) {
            baseClass = '';
        } else if (baseClass.slice(0, classLength + 1) === _class + ' ') {
            baseClass = baseClass.slice(classLength + 1, baseClassLength);
        } else if (baseClass.slice(baseClassLength - classLength - 1, baseClassLength) === ' ' + _class) {
            baseClass = baseClass.slice(0, baseClassLength - classLength - 1);
        } else if (baseClass.indexOf(' ' + _class + ' ') !== -1) {
            baseClass = baseClass.replace(' ' + _class + ' ', ' ');
        }

        el.className = baseClass.trim();
    },


    /**
     * ## scrollTo
     *
     * checks if an option is visible and, if it is not, scrolls it into view
     *
     * @param {DOMElement} element element to check
     *
     *@return _Void_
     */
    scrollTo: function scrollTo(element) {
        if (element) {
            var parent = element.parentNode.parentNode;
            var elHeight = element.offsetHeight;
            var min = parent.scrollTop;
            var max = parent.scrollTop + parent.offsetHeight - elHeight;
            var pos = element.offsetTop;

            if (pos < min) {
                parent.scrollTop = pos - elHeight * 0.5;
            } else if (pos > max) {
                parent.scrollTop = pos - parent.offsetHeight + elHeight * 1.5;
            }
        } else {
            return false;
        }
    },


    /**
     * ## setPlatform
     *
     * sets the platform to osx or not osx for the sake of the multi select key
     *
     * @param {Object} windowObj window, but allows for as testing override
     *
     * @return _Void_
     */
    setPlatform: function setPlatform() {
        var windowObj = arguments.length <= 0 || arguments[0] === undefined ? window : arguments[0];

        var isOsx = windowObj.navigator.platform.indexOf('Mac') === -1 ? false : true;
        var isIos = utils.iosVersion(windowObj);
        var multiSelect = isOsx ? 'metaKey' : 'ctrlKey';

        return { isOsx: isOsx, isIos: isIos, multiSelect: multiSelect };
    },


    /**
     * ## toggleClass
     *
     * in a world moving away from jquery, a wild helper function appears
     *
     * @param  {DOMElement} _el target to toggle class on
     * @param  {String} _class class to toggle on/off
     *
     * @return _Void_
     */
    toggleClass: function toggleClass(_el, _class) {
        if (utils.hasClass(_el, _class)) {
            utils.removeClass(_el, _class);
        } else {
            utils.addClass(_el, _class);
        }
    }
};

(0, _http2.default)(utils);

exports.default = utils;

},{"microbejs/src/modules/http":3}],21:[function(require,module,exports){
'use strict';

module.exports = '1.0.2';

},{}],22:[function(require,module,exports){
'use strict';

var _flounder = require('../core/flounder');

var _flounder2 = _interopRequireDefault(_flounder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

define('flounder', [], function () {
  return _flounder2.default;
});

},{"../core/flounder":17}]},{},[22]);
