/*!
                        * Flounder JavaScript Stylable Selectbox v1.3.0
                        * https://github.com/sociomantic-tsunami/flounder
                        *
                        * Copyright 2015-2017 Sociomantic Labs and other contributors
                        * Released under the MIT license
                        * https://github.com/sociomantic-tsunami/flounder/license
                        *
                        * Date: Wed Oct 11 2017
                        *
                        * "This, so far, is the best Flounder ever"
                        */(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
// Must use `global` or `self` instead of `window` to work in both frames and web
// workers. `global` is a provision of Browserify, Mr, Mrs, or Mop.

/* globals self */
var scope = typeof global !== "undefined" ? global : self;
var BrowserMutationObserver = scope.MutationObserver || scope.WebKitMutationObserver;

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
    throw new TypeError('Promise constructor\'s argument is not a function');
  }
  this._40 = 0;
  this._65 = 0;
  this._55 = null;
  this._72 = null;
  if (fn === noop) return;
  doResolve(fn, this);
}
Promise._37 = null;
Promise._87 = null;
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
}
function handle(self, deferred) {
  while (self._65 === 3) {
    self = self._55;
  }
  if (Promise._37) {
    Promise._37(self);
  }
  if (self._65 === 0) {
    if (self._40 === 0) {
      self._40 = 1;
      self._72 = deferred;
      return;
    }
    if (self._40 === 1) {
      self._40 = 2;
      self._72 = [self._72, deferred];
      return;
    }
    self._72.push(deferred);
    return;
  }
  handleResolved(self, deferred);
}

function handleResolved(self, deferred) {
  asap(function() {
    var cb = self._65 === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      if (self._65 === 1) {
        resolve(deferred.promise, self._55);
      } else {
        reject(deferred.promise, self._55);
      }
      return;
    }
    var ret = tryCallOne(cb, self._55);
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
      self._65 = 3;
      self._55 = newValue;
      finale(self);
      return;
    } else if (typeof then === 'function') {
      doResolve(then.bind(newValue), self);
      return;
    }
  }
  self._65 = 1;
  self._55 = newValue;
  finale(self);
}

function reject(self, newValue) {
  self._65 = 2;
  self._55 = newValue;
  if (Promise._87) {
    Promise._87(self, newValue);
  }
  finale(self);
}
function finale(self) {
  if (self._40 === 1) {
    handle(self, self._72);
    self._72 = null;
  }
  if (self._40 === 2) {
    for (var i = 0; i < self._72.length; i++) {
      handle(self, self._72[i]);
    }
    self._72 = null;
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
  });
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
  p._65 = 1;
  p._55 = value;
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
          while (val._65 === 3) {
            val = val._55;
          }
          if (val._65 === 1) return res(i, val._55);
          if (val._65 === 2) reject(val._55);
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
};

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
};

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
};

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
    if (this._65 === 3) {
      return this._55.getValue();
    }

    if (!this.isFulfilled()) {
      throw new Error('Cannot get a value of an unfulfilled promise.');
    }

    return this._55;
  };

  Promise.prototype.getReason = function () {
    if (this._65 === 3) {
      return this._55.getReason();
    }

    if (!this.isRejected()) {
      throw new Error('Cannot get a rejection reason of a non-rejected promise.');
    }

    return this._55;
  };

  Promise.prototype.getState = function () {
    if (this._65 === 3) {
      return this._55.getState();
    }
    if (this._65 === -1 || this._65 === -2) {
      return 0;
    }

    return this._65;
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
/* globals console */


var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _defaults = require('./defaults');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var api = {

    /**
     * ## buildFromUrl
     *
     * uses loadDataFromUrl and completes the entire build with the new data
     *
     * @param {String} url address to get the data from
     * @param {Function} callback function to run after getting the data
     *
     * @return {Void} void
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
     * @param {Mixed} index index to set flounder to.
     *                                          _Number, or Array of numbers_
     * @param {Boolean} multiple multiSelect or not
     *
     * @return {Void} void
     */
    clickByIndex: function clickByIndex(index, multiple) {
        return this.setByIndex(index, multiple, false);
    },


    /**
     * ## clickByText
     *
     * programatically sets selected by text string.  If the text string
     * is not matched to an element, nothing will be selected. Fires the
     * onClick event
     *
     * @param {Mixed} text text to set flounder to.
     *                                         _String, or Array of strings_
     * @param {Boolean} multiple multiSelect or not
     *
     * @return {Void} void
     */
    clickByText: function clickByText(text, multiple) {
        return this.setByText(text, multiple, false);
    },


    /**
     * ## clickByValue
     *
     * programatically sets selected by value string.  If the value string
     * is not matched to an element, nothing will be selected. Fires the
     * onClick event
     *
     * @param {Mixed} value value to set flounder to.
     *                                      _String, or Array of strings_
     * @param {Boolean} multiple multiSelect or not
     *
     * @return {Void} void
     */
    clickByValue: function clickByValue(value, multiple) {
        return this.setByValue(value, multiple, false);
    },


    /**
     * ## destroy
     *
     * removes flounder and all it`s events from the dom
     *
     * @return {Void} void
     */
    destroy: function destroy() {
        this.componentWillUnmount();

        var refs = this.refs;
        var classes = this.classes;
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
     * @param {Boolean} silent stifle the onChange event
     *
     * @return {Void} void
     */
    deselectAll: function deselectAll(silent) {
        this.removeSelectedClass();
        this.removeSelectedValue();

        if (this.multiple) {
            var multiTagWrapper = this.refs.multiTagWrapper;

            if (multiTagWrapper) {
                var children = multiTagWrapper.children;

                for (var i = 0; i < children.length - 1; i++) {
                    var el = children[i];

                    var lastEl = i === children.length - 1;

                    if (!silent && lastEl) {
                        el = el.children;
                        el = el[0];

                        el.click();
                    } else {
                        el.removeEventListener('click', this.removeMultiTag);
                        el.remove();
                    }
                }

                this.addPlaceholder();
            }
        }
    },


    /**
     * ## disable
     *
     * disables flounder by adjusting listeners and classes
     *
     * @param {Boolean} bool disable or enable
     *
     * @return {Void} void
     */
    disable: function disable(bool) {
        var refs = this.refs;
        var classes = this.classes;
        var flounder = refs.flounder;
        var selected = refs.selected;

        if (bool) {
            flounder.removeEventListener('keydown', this.checkFlounderKeypress);
            selected.removeEventListener('click', this.toggleList);
            _utils2.default.addClass(flounder, classes.DISABLED);
        } else {
            flounder.addEventListener('keydown', this.checkFlounderKeypress);
            selected.addEventListener('click', this.toggleList);
            _utils2.default.removeClass(flounder, classes.DISABLED);
        }
    },


    /**
     * ## disableByIndex
     *
     * disables the options with the given index
     *
     * @param {Mixed} index index of the option
     * @param {Boolean} reenable enables the option instead
     *
     * @return {Void} void
     */
    disableByIndex: function disableByIndex(index, reenable) {
        var refs = this.refs;

        if (typeof index !== 'string' && index.length) {
            var disableByIndex = this.disableByIndex.bind(this);

            return index.map(function (_i) {
                return disableByIndex(_i, reenable);
            });
        }

        var data = refs.data;
        var length = data.length;

        if (index < 0) {
            length = data.length;
            index = length + index;
        }

        var el = data[index];

        if (el) {
            var opt = refs.selectOptions[index];
            var classes = this.classes;

            if (reenable) {
                opt.disabled = false;
                _utils2.default.removeClass(el, classes.DISABLED);
            } else {
                opt.disabled = true;
                _utils2.default.addClass(el, classes.DISABLED);
            }

            return [el, opt];
        }

        console.warn('Flounder - No element to disable.');
    },


    /**
     * ## disableByText
     *
     * disables THE FIRST option that has the given value
     *
     * @param {Mixed} text value of the option
     * @param {Boolean} reenable enables the option instead
     *
     * @return {Void} void
     */
    disableByText: function disableByText(text, reenable) {
        if (typeof text !== 'string' && text.length) {
            var disableByText = this.disableByText.bind(this);
            var _res = text.map(function (_v) {
                return disableByText(_v, reenable);
            });

            return _res.length === 1 ? _res[0] : _res;
        }

        var res = [];

        this.refs.data.forEach(function (el, i) {
            var elText = el.innerHTML;

            if (elText === text) {
                res.push(i);
            }
        });

        res = res.length === 1 ? res[0] : res;

        return this.disableByIndex(res, reenable);
    },


    /**
     * ## disableByValue
     *
     * disables THE FIRST option that has the given value
     *
     * @param {Mixed} value value of the option
     * @param {Boolean} reenable enables the option instead
     *
     * @return {Void} void
     */
    disableByValue: function disableByValue(value, reenable) {
        if (typeof value !== 'string' && value.length) {
            var disableByValue = this.disableByValue.bind(this);
            var _res2 = value.map(function (_v) {
                return disableByValue(_v, reenable);
            });

            return _res2.length === 1 ? _res2[0] : _res2;
        }

        var res = this.refs.selectOptions.map(function (el, i) {
            return '' + el.value === '' + value ? i : null;
        }).filter(function (a) {
            return !!a || a === 0;
        });

        res = res.length === 1 ? res[0] : res;

        return this.disableByIndex(res, reenable);
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
     * @param {Number} index index to return
     *
     * @return {Object} option and div tage
     */
    getData: function getData(index) {
        var _this2 = this;

        var refs = this.refs;

        if (typeof index === 'number') {
            return {
                option: refs.selectOptions[index],
                div: refs.data[index]
            };
        } else if (index && index.length && typeof index !== 'string') {
            return index.map(function (i) {
                return _this2.getData(i);
            });
        } else if (!index) {
            return refs.selectOptions.map(function (el, i) {
                return _this2.getData(i);
            });
        }

        console.warn('Flounder - Illegal parameter type.');
    },


    /**
     * ## getSelected
     *
     * returns the currently selected data of a SELECT box
     *
     * @return {Void} void
     */
    getSelected: function getSelected() {
        var el = this.refs.select;
        var opts = [];
        var data = el.options;
        var classes = this.classes;

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var _el = _step.value;

                if (_el.selected && !_utils2.default.hasClass(_el, classes.PLACEHOLDER)) {
                    opts.push(_el);
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        return opts;
    },


    /**
     * ## getSelectedValues
     *
     * returns the values of the currently selected data
     *
     * @return {Void} void
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
     * @return {Void} void
     */
    loadDataFromUrl: function loadDataFromUrl(url, callback) {
        var _this3 = this;

        var classes = this.classes;

        _utils2.default.http.get(url).then(function (data) {
            if (data) {
                _this3.data = JSON.parse(data);

                if (callback) {
                    callback(_this3.data);
                }
            } else {
                console.warn('no data recieved');
            }
        }).catch(function (e) {
            console.warn('something happened: ', e);
            _this3.rebuild([{
                text: '',
                value: '',
                index: 0,
                extraClass: classes.LOADING_FAILED
            }]);
        });

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
     * @param {Object} props options object
     *
     * @return {Object} rebuilt flounder object
     */
    rebuild: function rebuild(data, props) {
        if (props || !props && (typeof data === 'string' || data && typeof data.length !== 'number')) {
            return this.reconfigure(data, props);
        }

        data = this.data = data || this.data;
        props = this.props;
        var refs = this.refs;
        var select = refs.select;

        this.deselectAll();
        this.removeOptionsListeners();

        refs.select.innerHTML = '';
        refs.select = false;
        this.defaultObj = (0, _defaults.setDefaultOption)(this, props, data, true);

        refs.optionsList.innerHTML = '';

        var _buildData = this.buildData(this.defaultObj, this.data, refs.optionsList, select);

        var _buildData2 = _slicedToArray(_buildData, 3);

        refs.data = _buildData2[0];
        refs.selectOptions = _buildData2[1];
        refs.sections = _buildData2[2];

        refs.select = select;

        this.addOptionsListeners();

        this.data = data;

        this.displaySelected(refs.selected, refs);

        return this;
    },


    /**
     * ## setByIndex
     *
     * programatically sets the value by index.  If there are not enough
     * elements to match the index, then nothing is selected.
     *
     * @param {Mixed} index index to set flounder to.
     *                                          _Number, or Array of numbers_
     * @param {Boolean} multiple multiSelect or not
     * @param {Boolean} programmatic fire onChange and toggle menu or not
     *
     * @return {Void} void
     */
    setByIndex: function setByIndex(index, multiple) {
        var programmatic = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

        var refs = this.refs;

        if (typeof index !== 'string' && index.length) {
            var setByIndex = this.setByIndex.bind(this);

            return index.map(function (_i) {
                return setByIndex(_i, multiple, programmatic);
            });
        }

        var data = this.data;
        var length = data.length;

        if (index < 0) {
            length = data.length;
            index = length + index;
        }

        var el = refs.data[index];

        if (el) {
            this.forceMultiple = multiple && this.multiple;
            this.programmaticClick = programmatic;

            el.click();

            return el;
        }

        return null;
    },


    /**
     * ## setByText
     *
     * programatically sets the text by string.  If the text string
     * is not matched to an element, nothing will be selected
     *
     * @param {Mixed} text text to set flounder to.
     *                                            _String, or Array of strings_
     * @param {Boolean} multiple multiSelect or not
     * @param {Boolean} programmatic fire onChange and toggle menu or not
     *
     * @return {Void} void
     */
    setByText: function setByText(text, multiple) {
        var programmatic = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

        if (typeof text !== 'string' && text.length) {
            var setByText = this.setByText.bind(this);

            return text.map(function (_i) {
                return setByText(_i, multiple, programmatic);
            });
        }

        var res = [];
        text = '' + text;

        this.refs.data.forEach(function (el, i) {
            var elText = el.innerHTML;

            if (elText === text) {
                res.push(i);
            }
        });

        return this.setByIndex(res, multiple, programmatic);
    },


    /**
     * ## setByValue
     *
     * programatically sets the value by string.  If the value string
     * is not matched to an element, nothing will be selected
     *
     * @param {Mixed} value value to set flounder to.
     *                                           _String, or Array of strings_
     * @param {Boolean} multiple multiSelect or not
     * @param {Boolean} programmatic fire onChange and toggle menu or not
     *
     * @return {Void} void
     */
    setByValue: function setByValue(value, multiple) {
        var programmatic = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

        if (typeof value !== 'string' && value.length) {
            var setByValue = this.setByValue.bind(this);

            return value.map(function (_i) {
                return setByValue(_i, multiple, programmatic);
            });
        }

        var values = this.refs.selectOptions.map(function (el, i) {
            return '' + el.value === '' + value ? i : null;
        }).filter(function (a) {
            return a === 0 || !!a;
        });

        return this.setByIndex(values, multiple, programmatic);
    }
};

exports.default = api;

},{"./defaults":15,"./utils":20}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
/* globals document */


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
     *
     * @return {Void} void
     */
    addOptionDescription: function addOptionDescription(el, text) {
        var div = document.createElement('div');
        div.innerHTML = text;
        div.className = this.classes.DESCRIPTION;
        el.appendChild(div);
    },


    /**
     * ## addSearch
     *
     * checks if a search box is required and attaches it or not
     *
     * @param {Object} node node to append the input to
     *
     * @return {Mixed} search node or false
     */
    addSearch: function addSearch(node) {
        if (this.search) {
            var classes = this.classes;
            var search = _utils2.default.constructElement({
                tagname: 'input',
                type: 'text',
                className: classes.SEARCH,
                tabIndex: -1
            });

            node.appendChild(search);

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
     * @return {Void} void
     */
    bindThis: function bindThis() {
        var _this = this;

        ['addHoverClass', 'catchBodyClick', 'checkClickTarget', 'checkFlounderKeypress', 'checkMultiTagKeydown', 'clearPlaceholder', 'clickSet', 'divertTarget', 'displayMultipleTags', 'firstTouchController', 'fuzzySearch', 'removeHoverClass', 'removeMultiTag', 'setKeypress', 'setSelectValue', 'toggleList', 'toggleListSearchClick'].forEach(function (func) {
            _this[func] = _this[func].bind(_this);
            _this[func].isBound = true;
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
        }

        var classes = this.classes;
        var arrow = constructElement({
            className: classes.ARROW
        });

        var arrowInner = constructElement({
            className: classes.ARROW_INNER
        });

        arrow.appendChild(arrowInner);

        return arrow;
    },


    /**
     * ## buildData
     *
     * builds both the div and select based options. will skip the select box
     * if it already exists
     *
     * @param {Mixed} defaultValue default entry (string or number)
     * @param {Array} originalData array with optino information
     * @param {Object} optionsList reference to the div option wrapper
     * @param {Object} select reference to the select box
     *
     * @return {Array} refs to both container elements
     */
    buildData: function buildData(defaultValue, originalData, optionsList, select) {
        var self = this;
        var index = 0;
        var indexSection = 0;
        var data = [];
        var selectOptions = [];
        var sections = [];
        var constructElement = _utils2.default.constructElement;
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
         * @param {Object} dataObj data object
         * @param {Number} i index
         *
         * @return {DOMElement} built div
         */
        function buildDiv(dataObj, i) {
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
                self.addOptionDescription(data, dataObj.description, classes.DESCRIPTION);
            }

            data.className += dataObj.extraClass ? '  ' + dataObj.extraClass : '';

            data.setAttribute('role', 'option');

            return data;
        }

        /**
         * ## buildOption
         *
         * builds an individual option tag for a flounder dropdown
         *
         * @param {Object} dataObj option build properties
         * @param {Number} i index
         *
         * @return {DOMElement} build option tag
         */
        function buildOption(dataObj, i) {
            var selectOption = void 0;

            if (!selectRef) {
                var extra = dataObj.extraClass || '';
                var selectOptionClass = classes.OPTION_TAG + '  ' + extra;

                selectOption = constructElement({
                    tagname: 'option',
                    className: selectOptionClass.trim(),
                    value: dataObj.value
                });

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
        }

        originalData.forEach(function (dataObj, i) {
            /* istanbul ignore next */
            if ((typeof dataObj === 'undefined' ? 'undefined' : _typeof(dataObj)) !== 'object') {
                dataObj = originalData[i] = {
                    text: dataObj,
                    value: dataObj
                };
            }

            if (dataObj.header) {
                var section = constructElement({
                    tagname: 'div',
                    className: classes.SECTION
                });

                var header = constructElement({
                    tagname: 'div',
                    className: classes.HEADER
                });

                header.textContent = dataObj.header;
                section.appendChild(header);
                optionsList.appendChild(section);

                var dataObjData = dataObj.data;
                dataObjData.forEach(function (d, i) {
                    /* istanbul ignore next */
                    if ((typeof d === 'undefined' ? 'undefined' : _typeof(d)) !== 'object') {
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

                // Keep sections with no options, but hide them.
                // We need to keep them because they exist in `originalData`.
                if (dataObjData.length == 0) {
                    _utils2.default.addClass(section, classes.HIDDEN);
                }

                sections[indexSection] = section;
                indexSection++;
            } else {
                data[index] = buildDiv(dataObj, index);
                optionsList.appendChild(data[index]);
                selectOptions[index] = buildOption(dataObj, index);
                index++;
            }
        });

        return [data, selectOptions, sections];
    },


    /**
     * ## buildDom
     *
     * builds flounder
     *
     * @return {Void} void
     */
    buildDom: function buildDom() {
        var props = this.props;
        var classes = this.classes;
        this.refs = {};

        var constructElement = _utils2.default.constructElement;

        var wrapper = _utils2.default.constructElement({
            className: classes.MAIN_WRAPPER
        });

        var flounderClass = classes.MAIN;

        var flounderClasses = this.multipleTags ? flounderClass + ' ' + classes.MULTIPLE_TAG_FLOUNDER : flounderClass;

        var flounder = constructElement({
            className: flounderClasses
        });

        flounder.setAttribute('aria-hidden', true);
        flounder.tabIndex = 0;
        wrapper.appendChild(flounder);

        var select = this.initSelectBox(wrapper);
        select.tabIndex = -1;

        var data = this.data;

        this.defaultObj = (0, _defaults.setDefaultOption)(this, this.props, data);
        var defaultValue = this.defaultObj;

        var selectedClassName = classes.SELECTED_DISPLAYED;
        if (defaultValue.value && defaultValue.extraClass) {
            selectedClassName += ' ' + defaultValue.extraClass;
        }

        var selected = constructElement({
            className: selectedClassName,
            'data-value': defaultValue.value,
            'data-index': defaultValue.index
        });

        var multiTagWrapper = this.multipleTags ? constructElement({
            className: classes.MULTI_TAG_LIST
        }) : null;

        var optionsListWrapper = constructElement({
            className: classes.OPTIONS_WRAPPER + '  ' + classes.HIDDEN
        });

        var optionsList = constructElement({
            className: classes.LIST
        });

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

        var search = this.addSearch(this.multipleTags ? multiTagWrapper : flounder);
        var built = this.buildData(defaultValue, data, optionsList, select);

        data = built[0];
        var selectOptions = built[1];
        var sections = built[2];

        this.target.appendChild(wrapper);

        this.refs = {
            wrapper: wrapper,
            flounder: flounder,
            selected: selected,
            arrow: arrow,
            optionsListWrapper: optionsListWrapper,
            search: search,
            multiTagWrapper: multiTagWrapper,
            optionsList: optionsList,
            select: select,
            data: data,
            sections: sections,
            selectOptions: selectOptions
        };

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
     * @return {DOMElement} option tag
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
     * @return {DOMElement} select box
     */
    initSelectBox: function initSelectBox(wrapper) {
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
                this.refs.select = select;
                var data = [];
                var selectOptions = [];

                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = target.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var optionEl = _step.value;

                        selectOptions.push(optionEl);
                        data.push({
                            text: optionEl.innerHTML,
                            value: optionEl.value
                        });
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                refs.selectOptions = selectOptions;

                this.data = data;
            } else if (this.selectDataOverride) {
                _utils2.default.removeAllChildren(target);
            }

            this.target = target.parentNode;
            _utils2.default.addClass(target, classes.HIDDEN);
        } else {
            select = _utils2.default.constructElement({
                tagname: 'SELECT',
                className: classes.SELECT_TAG + '  ' + classes.HIDDEN
            });

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
     * @return {Void} void
     */
    popInSelectElements: function popInSelectElements(select) {
        _utils2.default.removeAllChildren(select);

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = this.originalChildren[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var el = _step2.value;

                select.appendChild(el);
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }
    },


    /**
     * ## popOutSelectElements
     *
     * pops out all the options of a select box, clones them, then appends the
     * clones.  This gives us the ability to restore the original tag
     *
     * @param {DOMElement} select select element
     *
     * @return {Void} void
     */
    popOutSelectElements: function popOutSelectElements(select) {
        var res = [];

        this.originalChildren = select.children;
        var children = this.originalChildren;

        for (var i = 0; i < children.length; i++) {
            var el = children[i];

            res[i] = el.cloneNode(true);
            select.removeChild(el);
        }

        res.forEach(function (_el) {
            select.appendChild(_el);
        });
    },


    /**
     * ## reconfigure
     *
     * after editing the data, this can be used to rebuild them
     *
     * @param {Array} data flounder data options
     * @param {Object} props object containing config options
     *
     * @return {Object} rebuilt flounder object
     */
    reconfigure: function reconfigure(data, props) {
        if (data && typeof data !== 'string' && typeof data.length === 'number') {
            props = props = props || this.props;
            props.data = data;
        } else if (!props && (typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object') {
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
     * @return {Void} void
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
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var classes = {
    ARROW: 'flounder__arrow--wrapper',
    ARROW_INNER: 'flounder__arrow--inner',
    DESCRIPTION: 'flounder__option--description',
    DISABLED: 'flounder__disabled',
    HEADER: 'flounder__header',
    HIDDEN: 'flounder--hidden',
    HIDDEN_IOS: 'flounder--hidden--ios',
    HOVER: 'flounder__hover',
    LIST: 'flounder__list',
    LOADING: 'flounder__loading',
    LOADING_FAILED: 'flounder__loading--failed',
    MAIN: 'flounder',
    MAIN_WRAPPER: 'flounder--wrapper  flounder__input--select',
    MULTIPLE_TAG_FLOUNDER: 'flounder--multiple',
    MULTI_TAG_LIST: 'flounder__multi--tag--list',
    MULTIPLE_SELECT_TAG: 'flounder__multiple--select--tag',
    MULTIPLE_TAG_CLOSE: 'flounder__multiple__tag__close',
    NO_RESULTS: 'flounder__no-results',
    OPEN: 'open',
    OPTION: 'flounder__option',
    OPTION_TAG: 'flounder--option--tag',
    OPTIONS_WRAPPER: 'flounder__list--wrapper',
    PLACEHOLDER: 'flounder__placeholder',
    PLUG: 'flounder__ios--plug',
    SECTION: 'flounder__section',
    SELECTED: 'flounder__option--selected',
    SELECTED_HIDDEN: 'flounder__option--selected--hidden',
    SELECTED_DISPLAYED: 'flounder__option--selected--displayed',
    SEARCH: 'flounder__input--search',
    SEARCH_HIDDEN: 'flounder--search--hidden',
    SELECT_TAG: 'flounder--select--tag'
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
    noMoreOptionsMessage: 'No more options to add.',
    noMoreResultsMessage: 'No matches found',
    onChange: null, // function( e, selectedValues ){}
    onClose: null, // function( e, selectedValues ){}
    onComponentDidMount: null, // function(){}
    onComponentWillUnmount: null, // function(){}
    onFirstTouch: null, // function( e ){}
    onInit: null, // function(){}
    onInputChange: null, // function( e ){}
    onOpen: null, // function( e, selectedValues ){}
    openOnHover: false,
    placeholder: 'Please choose an option',
    search: false,
    selectDataOverride: false
};

var defaults = {

    defaultOptions: defaultOptions,

    /**
     * ## setDefaultOption
     *
     * sets the initial default value
     *
     * @param {Object} context flounder this
     * @param {Object} configObj props
     * @param {Array} originalData data array
     * @param {Boolean} rebuild rebuild or not
     *
     * @return {Void} void
     */
    setDefaultOption: function setDefaultOption(context) {
        var configObj = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var originalData = arguments[2];
        var rebuild = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

        /**
         * ## setIndexDefault
         *
         * sets a specified index as the default option. This only works
         * correctly if it is a valid index, otherwise it returns null
         *
         * @param {Array} data option data
         * @param {Number} index index
         *
         * @return {Object} default settings
         */
        function setIndexDefault(data, index) {
            var defaultIndex = index || index === 0 ? index : configObj.defaultIndex;
            var defaultOption = data[defaultIndex];

            if (defaultOption) {
                defaultOption.index = defaultIndex;

                return defaultOption;
            }

            return null;
        }

        /**
         * ## setPlaceholderDefault
         *
         * sets a placeholder as the default option.  This inserts an empty
         * option first and sets that as default
         *
         * @param {Object} flounder flounder
         *
         * @return {Object} default settings
         */
        function setPlaceholderDefault(flounder) {
            var refs = flounder.refs;
            var classes = flounder.classes;
            var select = refs.select;
            var placeholder = configObj.placeholder;

            var defaultObj = {
                text: placeholder || placeholder === '' ? placeholder : defaultOptions.placeholder,
                value: '',
                index: 0,
                extraClass: classes.HIDDEN + '  ' + classes.PLACEHOLDER
            };

            if (select) {
                var escapedText = flounder.allowHTML ? defaultObj.text : _utils2.default.escapeHTML(defaultObj.text);

                var defaultOption = _utils2.default.constructElement({
                    tagname: 'option',
                    className: classes.OPTION_TAG,
                    value: defaultObj.value
                });

                defaultOption.innerHTML = escapedText;

                select.insertBefore(defaultOption, select[0]);
                flounder.refs.selectOptions.unshift(defaultOption);
            }

            originalData.unshift(defaultObj);

            return defaultObj;
        }

        /**
         * ## setValueDefault
         *
         * sets a specified index as the default. This only works correctly if
         * it is a valid value, otherwise it returns null
         *
         * @param {Array} data array of data objects
         * @param {String} val value to set
         *
         * @return {Object} default settings
         */
        function setValueDefault(data, val) {
            var defaultProp = val || '' + configObj.defaultValue;
            var index = void 0;

            data.forEach(function (dataObj, i) {
                var dataObjValue = '' + dataObj.value;

                if (dataObjValue === defaultProp) {
                    index = i;
                }
            });

            var defaultValue = index >= 0 ? data[index] : null;

            if (defaultValue) {
                defaultValue.index = index;

                return defaultValue;
            }

            return null;
        }

        /**
         * ## checkDefaultPriority
         *
         * sorts out which default should be gotten by priority
         *
         * @return {Object} default data object
         */
        function checkDefaultPriority() {
            var data = context.sortData(originalData);

            if ((configObj.multipleTags || configObj.multiple) && !configObj.defaultIndex && !configObj.defaultValue) {
                configObj.placeholder = configObj.placeholder || defaultOptions.placeholder;
            }

            if (configObj.defaultEmpty) {
                configObj.placeholder = '';
            }

            var placeholder = configObj.placeholder;

            if (placeholder || placeholder === '' || data.length === 0) {
                return setPlaceholderDefault(context, data);
            }

            var def = void 0;

            if (rebuild) {
                var val = context.refs.selected.getAttribute('data-value');
                def = setValueDefault(data, val);

                if (def) {
                    return def;
                }
            }

            // default prio
            def = configObj.defaultIndex ? setIndexDefault(data) : null;
            def = !def && configObj.defaultValue ? setValueDefault(data) : def;
            def = !def ? setIndexDefault(data, 0) : def;

            return def;
        }

        originalData = originalData || configObj.data || [];

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

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _keycodes = require('./keycodes');

var _keycodes2 = _interopRequireDefault(_keycodes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* globals console, document, setTimeout, window */
var events = {

    /**
     * ## addFirstTouchListeners
     *
     * adds the listeners for onFirstTouch
     *
     * @return {Void} void
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
     * @param {Object} e event object
     *
     * @return {Void} void
     */
    addHoverClass: function addHoverClass(e) {
        _utils2.default.addClass(e.target, this.classes.HOVER);
    },


    /**
     * ## addListeners
     *
     * adds listeners on render
     *
     * @param {Object} refs DOM element references
     *
     * @return {Void} void
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
     * @return {Void} void
     */
    addMultipleTags: function addMultipleTags(selectedOptions, multiTagWrapper) {
        var _this = this;

        selectedOptions.forEach(function (option) {
            if (option.value !== '') {
                var tag = _this.buildMultiTag(option);
                multiTagWrapper.insertBefore(tag, multiTagWrapper.lastChild);
            } else {
                option.selected = false;
            }
        });

        var children = multiTagWrapper.children;

        for (var i = 0; i < children.length - 1; i++) {
            var tag = children[i];
            var closeBtn = tag.firstChild;

            closeBtn.addEventListener('click', this.removeMultiTag);
            tag.addEventListener('keydown', this.checkMultiTagKeydown);
        }
    },


    /**
     * ## addOptionsListeners
     *
     * adds listeners to the options
     *
     * @return {Void} void
     */
    addOptionsListeners: function addOptionsListeners() {
        var _this2 = this;

        this.refs.data.forEach(function (dataObj) {
            if (dataObj.tagName === 'DIV') {
                dataObj.addEventListener('mouseenter', _this2.addHoverClass);
                dataObj.addEventListener('mouseleave', _this2.removeHoverClass);

                dataObj.addEventListener('click', _this2.clickSet);
            }
        });
    },


    /**
     * ## addNoMoreOptionsMessage
     *
     * Adding 'No More Options' message to the option list
     *
     * @return {Void} void
     */
    addNoMoreOptionsMessage: function addNoMoreOptionsMessage() {
        var classes = this.classes;
        var elProps = {
            className: classes.OPTION + '  ' + classes.NO_RESULTS
        };

        var noMoreOptionsEl = this.refs.noMoreOptionsEl || _utils2.default.constructElement(elProps);

        noMoreOptionsEl.innerHTML = this.noMoreOptionsMessage;
        this.refs.optionsList.appendChild(noMoreOptionsEl);

        this.refs.noMoreOptionsEl = noMoreOptionsEl;
    },


    /**
     * ## addNoResultsMessage
     *
     * Adding 'No Results' message to the option list
     *
     * @return {Void} void
     */
    addNoResultsMessage: function addNoResultsMessage() {
        var classes = this.classes;
        var elProps = {
            className: classes.OPTION + '  ' + classes.NO_RESULTS
        };

        var noResultsEl = this.refs.noResultsEl || _utils2.default.constructElement(elProps);

        noResultsEl.innerHTML = this.noMoreResultsMessage;
        this.refs.optionsList.appendChild(noResultsEl);

        this.refs.noResultsEl = noResultsEl;
    },


    /**
     * ## addPlaceholder
     *
     * determines what (if anything) should be refilled into the the
     * placeholder position
     *
     * @return {Void} void
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
     * @return {Void} void
     */
    addSearchListeners: function addSearchListeners() {
        var search = this.refs.search;
        var multiTagWrapper = this.refs.multiTagWrapper;

        this.debouncedFuzzySearch = _utils2.default.debounce(this.fuzzySearch, 200);

        if (multiTagWrapper) {
            multiTagWrapper.addEventListener('click', this.toggleListSearchClick);
        }

        search.addEventListener('click', this.toggleListSearchClick);
        search.addEventListener('focus', this.toggleListSearchClick);
        search.addEventListener('keyup', this.debouncedFuzzySearch);
        search.addEventListener('focus', this.clearPlaceholder);
    },


    /**
     * ## addSelectKeyListener
     *
     * adds a listener to the selectbox to allow for seeking through the native
     * selectbox on keypress
     *
     * @return {Void} void
     */
    addSelectKeyListener: function addSelectKeyListener() {
        var select = this.refs.select;

        select.addEventListener('keyup', this.setSelectValue);
        select.addEventListener('keydown', this.setKeypress);

        // weird shit
        // http://stackoverflow.com/questions/34660500/mobile-safari-multi-select-bug
        if (this.isIos) {
            var classes = this.classes;
            var firstOption = select.children[0];

            var plug = document.createElement('OPTION');
            plug.disabled = true;
            plug.setAttribute('disabled', true);
            plug.className = classes.PLUG;
            select.insertBefore(plug, firstOption);
        }
    },


    /**
     * ## catchBodyClick
     *
     * checks if a click is on the menu and, if it isnt, closes the menu
     *
     * @param  {Object} e event object
     *
     * @return {Void} void
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
     * @return {Boolean}click flouncer or not
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
     * if enter is pressed in the searchox, if there is only one option
     * matching, this selects it
     *
     * @param {Object} e event object
     * @param {Object} refs element references
     *
     * @return {Void} void
     */
    checkEnterOnSearch: function checkEnterOnSearch(e, refs) {
        var val = e.target.value;

        if (val && val !== '') {
            var res = [];
            var selected = this.getSelected();
            var matches = this.search.isThereAnythingRelatedTo(val);

            matches.forEach(function (el) {
                var index = el.i;
                el = refs.selectOptions[index];

                if (selected.indexOf(el) === -1) {
                    res.push(el);
                }
            });

            // If only one result is available, select that result.
            // If more than one results, select one only on exact match.
            var selectedIndex = -1;

            if (res.length === 1) {
                selectedIndex = 0;
            } else if (res.length > 1) {
                for (var i = 0; i < res.length; i++) {
                    if (res[i].text.toUpperCase() === val.toUpperCase()) {
                        selectedIndex = i;
                        break;
                    }
                }
            }

            if (selectedIndex != -1) {
                var el = res[selectedIndex];

                if (!el.disabled) {
                    this.setByIndex(el.index, this.multiple);

                    if (this.multipleTags) {
                        setTimeout(function () {
                            return refs.search.focus();
                        }, 200);
                    }

                    if (this.onChange) {
                        try {
                            this.onChange(e, this.getSelectedValues());
                        } catch (e) {
                            console.warn('something may be wrong in "onChange"', e);
                        }
                    }
                }
            }

            return res;
        }

        return false;
    },


    /**
     * ## checkFlounderKeypress
     *
     * checks flounder focused keypresses and filters all but space and enter
     *
     * @param {Object} e event object
     *
     * @return {Void} void
     */
    checkFlounderKeypress: function checkFlounderKeypress(e) {
        var keyCode = e.keyCode;
        var refs = this.refs;
        var classes = this.classes;

        if (keyCode === _keycodes2.default.TAB) {
            var optionsList = refs.optionsListWrapper;
            var wrapper = refs.wrapper;

            this.addPlaceholder();
            this.toggleClosed(e, optionsList, refs, wrapper, true);
        } else if (keyCode === _keycodes2.default.ENTER || keyCode === _keycodes2.default.SPACE) {
            if (keyCode === _keycodes2.default.ENTER) {
                e.preventDefault();
                e.stopPropagation();

                if (this.search && _utils2.default.hasClass(refs.wrapper, classes.OPEN)) {
                    return this.checkEnterOnSearch(e, refs);
                }
            }

            if (e.target.tagName !== 'INPUT') {
                this.toggleList(e);
            }
        }
        // letters - allows native behavior
        else if (keyCode >= 48 && keyCode <= 57 || keyCode >= 65 && keyCode <= 90) {
                if (refs.search && e.target.tagName === 'INPUT') {
                    refs.selected.innerHTML = '';
                }
            }
    },


    /**
     * ## checkMultiTagKeydown
     *
     * when a tag is selected, this decides how to handle it by either passing
     * the event on, or handling tag removal
     *
     * @param {Object} e event object
     *
     * @return {Void} void
     */
    checkMultiTagKeydown: function checkMultiTagKeydown(e) {
        var _this3 = this;

        var keyCode = e.keyCode,
            target = e.target;


        var catchKeys = [_keycodes2.default.BACKSPACE, _keycodes2.default.LEFT, _keycodes2.default.RIGHT];

        if (catchKeys.indexOf(keyCode) !== -1) {
            e.preventDefault();
            e.stopPropagation();

            if (keyCode === _keycodes2.default.BACKSPACE) {
                this.checkMultiTagKeydownRemove(target);
            } else {
                this.checkMultiTagKeydownNavigate(keyCode, target);
            }
        } else if (e.key.length < 2) {
            setTimeout(function () {
                return _this3.refs.search.focus();
            }, 0);
        }
    },


    /**
     * ## checkMultiTagKeydownNavigate
     *
     * after left or right is hit while a multitag is focused, this focuses on
     * the next tag in that direction or the the search field
     *
     * @param {Number} keyCode keycode from the keypress event
     * @param {DOMElement} target focused multitag
     *
     * @return {Void} void
     */
    checkMultiTagKeydownNavigate: function checkMultiTagKeydownNavigate(keyCode, target) {
        if (keyCode === _keycodes2.default.LEFT) {
            var prev = target.previousSibling;

            if (prev) {
                prev.focus();
            }
        } else if (keyCode === _keycodes2.default.RIGHT) {
            var next = target.nextSibling;

            if (next) {
                setTimeout(function () {
                    return next.focus();
                }, 0);
            }
        }
    },


    /**
     * ## checkMultiTagKeydownRemove
     *
     * after a backspace while a multitag is focused, this removes the tag and
     * focuses on the next
     *
     * @param {DOMElement} target focused multitag
     *
     * @return {Void} void
     */
    checkMultiTagKeydownRemove: function checkMultiTagKeydownRemove(target) {
        var prev = target.previousSibling;
        var next = target.nextSibling;

        target.firstChild.click();

        if (prev) {
            setTimeout(function () {
                return prev.focus();
            }, 0);
        } else if (next) {
            next.focus();
        }
    },


    /**
     * ## clearPlaceholder
     *
     * clears the placeholder
     *
     * @param {Object} e event object
     *
     * @return {Void} void
     */
    clearPlaceholder: function clearPlaceholder() {
        this.refs.selected.innerHTML = '';
    },


    /**
     * ## clickSet
     *
     * when a flounder option is clicked on it needs to set the option as
     * selected
     *
     * @param {Object} e event object
     *
     * @return {Void} void
     */
    clickSet: function clickSet(e) {
        e.preventDefault();
        e.stopPropagation();

        this.setSelectValue({}, e);

        if (!this.programmaticClick) {
            this.toggleList(e, 'close');
        }

        this.programmaticClick = false;
    },


    /**
     * ## displayMultipleTags
     *
     * handles the display and management of tags
     *
     * @param  {Array} selectedOptions currently selected options
     * @param  {DOMElement} multiTagWrapper div to display
     *                                       currently selected options
     *
     * @return {Void} void
     */
    displayMultipleTags: function displayMultipleTags(selectedOptions, multiTagWrapper) {
        var children = multiTagWrapper.children;

        for (var i = 0; i < children.length - 1; i++) {
            var tag = children[i];
            var closeBtn = tag.firstChild;

            closeBtn.removeEventListener('click', this.removeMultiTag);
            tag.removeEventListener('keydown', this.checkMultiTagKeydown);

            multiTagWrapper.removeChild(tag);
        }

        if (selectedOptions.length > 0) {
            this.addMultipleTags(selectedOptions, multiTagWrapper);
        } else {
            this.addPlaceholder();
        }
    },


    /**
     * ## displaySelected
     *
     * formats and displays the chosen options
     *
     * @param {DOMElement} selected display area for the selected option(s)
     * @param {Object} refs element references
     *
     * @return {Void} void
     */
    displaySelected: function displaySelected(selected, refs) {
        var value = [];
        var index = -1;

        var selectedOption = this.getSelected();
        var selectedLength = selectedOption.length;
        var multipleTags = this.multipleTags;

        selected.className = this.classes.SELECTED_DISPLAYED;

        if (!multipleTags && selectedLength === 1) {
            index = selectedOption[0].index;
            selected.innerHTML = refs.data[index].innerHTML;
            value = selectedOption[0].value;

            var extraClass = refs.data[index].extraClass;

            selected.className += extraClass ? ' ' + extraClass : '';
        } else if (!multipleTags && selectedLength === 0) {
            var defaultValue = this.defaultObj;
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
    },


    /**
     * ## divertTarget
     *
     * @param {Object} e event object
     *
     * on interaction with the raw select box, the target will be diverted to
     * the corresponding flounder list element
     *
     * @return {Void} void
     */
    divertTarget: function divertTarget(e) {
        // weird shit
        // http://stackoverflow.com/questions/34660500/mobile-safari-multi-select-bug
        if (this.isIos) {
            var select = this.refs.select;
            var classes = this.classes;
            var plug = select.querySelector('.' + classes.PLUG);

            if (plug) {
                select.removeChild(plug);
            }
        }

        var index = e.target.selectedIndex;

        var event = {
            type: e.type,
            target: this.data[index]
        };

        if (this.multipleTags) {
            e.preventDefault();
            e.stopPropagation();
        }

        this.setSelectValue(event);

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
     * @return {Void} void
     */
    firstTouchController: function firstTouchController(e) {
        var refs = this.refs;

        if (this.onFirstTouch) {
            try {
                this.onFirstTouch(e);
            } catch (e) {
                console.warn('something may be wrong in "onFirstTouch"', e);
            }
        }

        refs.selected.removeEventListener('click', this.firstTouchController);
        refs.select.removeEventListener('focus', this.firstTouchController);

        if (this.props.openOnHover) {
            refs.wrapper.removeEventListener('mouseenter', this.firstTouchController);
        }
    },


    /**
     * ## hideEmptySection
     *
     * Check if the provided element is indeed a section. If it is, check if
     * it must to be shown or hidden.
     *
     * @param {DOMElement} se the section to be checked
     *
     * @return {Void} void
     */
    hideEmptySection: function hideEmptySection(se) {
        var selectedClass = this.selectedClass;
        var sections = this.refs.sections;

        for (var i = 0; i < sections.length; ++i) {
            if (sections[i] === se) {
                var shouldBeHidden = true;

                // Ignore the title in childNodes[0]
                for (var j = 1; j < se.childNodes.length; j++) {
                    if (!_utils2.default.hasClass(se.childNodes[j], selectedClass)) {
                        shouldBeHidden = false;
                        break;
                    }
                }

                if (shouldBeHidden) {
                    _utils2.default.addClass(se, selectedClass);
                } else {
                    _utils2.default.removeClass(se, selectedClass);
                }

                break;
            }
        }
    },


    /**
     * ## removeHoverClass
     *
     * removes a hover class from an element
     *
     * @param {Object} e event object
     * @return {Void} void
     */
    removeHoverClass: function removeHoverClass(e) {
        _utils2.default.removeClass(e.target, this.classes.HOVER);
    },


    /**
     * ## removeListeners
     *
     * removes event listeners from flounder.  normally pre unload
     *
     * @return {Void} void
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
     * removes a multi selection tag on click; fixes all references to value
     * and state
     *
     * @param  {Object} e event object
     *
     * @return {Void} void
     */
    removeMultiTag: function removeMultiTag(e) {
        e.preventDefault();
        e.stopPropagation();

        var value = void 0;
        var index = void 0;
        var classes = this.classes;
        var refs = this.refs;
        var select = refs.select;
        var selected = refs.selected;
        var target = e.target;
        var data = this.refs.data;
        var targetIndex = target.getAttribute('data-index');

        select[targetIndex].selected = false;

        var selectedOptions = this.getSelected();

        _utils2.default.removeClass(data[targetIndex], classes.SELECTED_HIDDEN);
        _utils2.default.removeClass(data[targetIndex], classes.SELECTED);

        this.hideEmptySection(data[targetIndex].parentNode);

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
        this.fuzzySearchReset();

        selected.setAttribute('data-value', value);
        selected.setAttribute('data-index', index);

        if (this.onChange) {
            try {
                this.onChange(e, this.getSelectedValues());
            } catch (e) {
                console.warn('something may be wrong in "onChange"', e);
            }
        }
    },


    /**
     * ## removeOptionsListeners
     *
     * removes event listeners on the data divs
     *
     * @return {Void} void
     */
    removeOptionsListeners: function removeOptionsListeners() {
        var _this4 = this;

        this.refs.data.forEach(function (dataObj) {
            if (dataObj.tagName === 'DIV') {
                dataObj.removeEventListener('click', _this4.clickSet);

                dataObj.removeEventListener('mouseenter', _this4.addHoverClass);
                dataObj.removeEventListener('mouseleave', _this4.removeHoverClass);
            }
        });
    },


    /**
     * ## removeNoMoreOptionsMessage
     *
     * Removing 'No More options' message from the option list
     *
     * @return {Void} void
     */
    removeNoMoreOptionsMessage: function removeNoMoreOptionsMessage() {
        var noMoreOptionsEl = this.refs.noMoreOptionsEl;

        if (this.refs.optionsList && noMoreOptionsEl) {
            this.refs.optionsList.removeChild(noMoreOptionsEl);
            this.refs.noMoreOptionsEl = undefined;
        }
    },


    /**
     * ## removeNoResultsMessage
     *
     * Removing 'No Results' message from the option list
     *
     * @return {Void} void
     */
    removeNoResultsMessage: function removeNoResultsMessage() {
        var noResultsEl = this.refs.noResultsEl;

        if (this.refs.optionsList && noResultsEl) {
            this.refs.optionsList.removeChild(noResultsEl);
            this.refs.noResultsEl = undefined;
        }
    },


    /**
     * ## removeSearchListeners
     *
     * removes the listeners from the search input
     *
     * @return {Void} void
     */
    removeSearchListeners: function removeSearchListeners() {
        var search = this.refs.search;
        search.removeEventListener('click', this.toggleListSearchClick);
        search.removeEventListener('focus', this.toggleListSearchClick);
        search.removeEventListener('keyup', this.debouncedFuzzySearch);
        search.removeEventListener('focus', this.clearPlaceholder);
    },


    /**
     * ## removeSelectedClass
     *
     * removes the [[this.selectedClass]] from all data and sections
     *
     * @param {Array} data array of data objects
     *
     * @param {Array} sections array of section objects
     *
     * @return {Void} void
     */
    removeSelectedClass: function removeSelectedClass(data, sections) {
        var _this5 = this;

        data = data || this.refs.data;
        sections = sections || this.refs.sections;

        data.forEach(function (dataObj) {
            _utils2.default.removeClass(dataObj, _this5.selectedClass);
        });

        sections.forEach(function (sectionObj) {
            _utils2.default.removeClass(sectionObj, _this5.selectedClass);
        });
    },


    /**
     * ## removeSelectedValue
     *
     * sets the selected property to false for all data
     *
     * @param {Array} data array of data objects
     *
     * @return {Void} void
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
     * @return {Void} void
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
     * @return {Void} void
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

                    if (refs.search) {
                        refs.search.value = '';
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
     * @return {Void} void
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
     * sets the selected value in flounder.  when activated by a click,
     * the event object is moved to the second variable.  this gives us the
     * ability to discern between triggered events (keyup) and processed events
     * (click) for the sake of choosing our targets
     *
     * @param {Object} obj possible event object
     * @param {Object} e event object
     *
     * @return {Void} void
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

        if (!this.programmaticClick) {
            // tab, shift, ctrl, alt, caps, cmd
            var nonKeys = [9, 16, 17, 18, 20, 91];

            if (e || obj.type === 'blur' || !keyCode && obj.type === 'change' || keyCode && nonKeys.indexOf(keyCode) === -1) {
                if (this.toggleList.justOpened && !e) {
                    this.toggleList.justOpened = false;
                } else if (this.onChange) {
                    try {
                        this.onChange(e, this.getSelectedValues());
                    } catch (e) {
                        console.warn('something may be wrong in onChange', e);
                    }
                }
            }
            this.programmaticClick = false;
        }
    },


    /**
     * ## setSelectValueButton
     *
     * processes the setting of a value after a keypress event
     *
     * @return {Void} void
     */
    setSelectValueButton: function setSelectValueButton() {
        var refs = this.refs;
        var data = refs.data;
        var selectedClass = this.selectedClass;

        var selectedOption = void 0;

        if (this.multipleTags) {
            return false;
        }

        this.removeSelectedClass(data);

        var dataArray = this.getSelected();
        var baseOption = dataArray[0];

        if (baseOption) {
            selectedOption = data[baseOption.index];

            _utils2.default.addClass(selectedOption, selectedClass);

            _utils2.default.scrollTo(selectedOption, refs.optionsListWrapper);
        }
    },


    /**
     * ## setSelectValueClick
     *
     * processes the setting of a value after a click event
     *
     * @param {Object} e event object
     *
     * @return {Void} void
     */
    setSelectValueClick: function setSelectValueClick(e) {
        var multiple = this.multiple;
        var refs = this.refs;

        var selectedClass = this.selectedClass;

        var target = e.target;
        var index = target.getAttribute('data-index');
        var selectedOption = refs.selectOptions[index];

        if ((!multiple || multiple && !this.multipleTags && !e[this.multiSelect]) && !this.forceMultiple) {
            this.deselectAll();
            _utils2.default.addClass(target, selectedClass);
            selectedOption.selected = selectedOption.selected !== true;
        } else {
            _utils2.default.toggleClass(target, selectedClass);
            selectedOption.selected = !selectedOption.selected;
        }

        this.forceMultiple = false;

        this.hideEmptySection(target.parentNode);

        var firstOption = refs.selectOptions[0];

        if (firstOption.value === '' && this.getSelected().length > 1) {
            _utils2.default.removeClass(refs.data[0], selectedClass);
            refs.selectOptions[0].selected = false;
        }
    },


    /**
     * ## toggleClosed
     *
     * post toggleList, this runs it the list should be closed
     *
     * @param {Object} e event object
     * @param {DOMElement} optionsList the options list
     * @param {Object} refs contains the references of the elements in flounder
     * @param {DOMElement} wrapper wrapper of flounder
     * @param {Boolean} exit prevents refocus. used while tabbing away
     *
     * @return {Void} void
     */
    toggleClosed: function toggleClosed(e, optionsList, refs, wrapper) {
        var exit = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

        var classes = this.classes;

        _utils2.default.addClass(refs.optionsListWrapper, classes.HIDDEN);
        _utils2.default.removeClass(wrapper, classes.OPEN);

        var qsHTML = document.querySelector('html');
        qsHTML.removeEventListener('click', this.catchBodyClick);
        qsHTML.removeEventListener('touchend', this.catchBodyClick);

        if (this.search) {
            this.fuzzySearchReset();
        } else {
            this.removeSelectKeyListener();
        }

        if (!exit) {
            setTimeout(function () {
                return refs.flounder.focus();
            }, 0);
        }

        if (this.onClose && this.ready) {
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
     * @param {Object} e event object
     * @param {String} force toggle can be forced by passing 'open' or 'close'
     *
     * @return {Void} void
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
            this.toggleClosed(e, optionsList, refs, wrapper);
        } else {
            if (type === 'keydown') {
                this.toggleList.justOpened = true;
            }

            this.toggleOpen(e, optionsList, refs, wrapper);
        }
    },


    /**
     * ## toggleListSearchClick
     *
     * toggleList wrapper for search.  only triggered if flounder is closed
     *
     * @param {Object} e event object
     *
     * @return {Void} void
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
     * @param {DOMElement} optionsList the options list
     * @param {Object} refs contains the references of the elements in flounder
     *
     * @return {Void} void
     */
    toggleOpen: function toggleOpen(e, optionsList, refs) {
        if (!this.isIos || this.search || this.multipleTags === true) {
            var classes = this.classes;

            _utils2.default.removeClass(refs.optionsListWrapper, classes.HIDDEN);
            _utils2.default.addClass(refs.wrapper, classes.OPEN);

            var qsHTML = document.querySelector('html');

            qsHTML.addEventListener('click', this.catchBodyClick);
            qsHTML.addEventListener('touchend', this.catchBodyClick);
        }

        if (!this.multipleTags) {
            var index = refs.select.selectedIndex;
            var selectedDiv = refs.data[index];

            _utils2.default.scrollTo(selectedDiv, refs.optionsListWrapper);
        }

        if (this.search) {
            setTimeout(function () {
                return refs.search.focus();
            }, 0);
        } else {
            this.addSelectKeyListener();
            setTimeout(function () {
                return refs.select.focus();
            }, 0);
        }

        var optionCount = refs.data.length;

        if (this.props.placeholder) {
            optionCount--;
        }

        if (refs.multiTagWrapper) {
            var numTags = refs.multiTagWrapper.children.length - 1;

            if (numTags === optionCount) {
                this.removeNoResultsMessage();
                this.addNoMoreOptionsMessage();
            }
        }

        if (this.onOpen && this.ready) {
            try {
                this.onOpen(e, this.getSelectedValues());
            } catch (e) {
                console.warn('something may be wrong in "onOpen"', e);
            }
        }
    }
};

exports.default = events;

},{"./keycodes":18,"./utils":20}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
/* globals console, document, setTimeout */


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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * main flounder class
 *
 * @return {Object} Flounder instance
 */
var Flounder = function () {
    _createClass(Flounder, [{
        key: 'componentWillUnmount',

        /**
         * ## componentWillUnmount
         *
         * on unmount, removes events
         *
         * @return {Void} void
         */
        value: function componentWillUnmount() {
            if (this.onComponentWillUnmount) {
                try {
                    this.onComponentWillUnmount();
                } catch (e) {
                    console.warn('something may be wrong in "onComponentWillUnmount"', e);
                }
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
     * ## filterSearchResults
     *
     * filters results and adjusts the search hidden class on the dataOptions
     *
     * @param {Object} e event object
     *
     * @return {Void} void
     */


    _createClass(Flounder, [{
        key: 'filterSearchResults',
        value: function filterSearchResults(e) {
            var val = e.target.value.trim();

            this.fuzzySearch.previousValue = val;

            var matches = this.search.isThereAnythingRelatedTo(val) || [];

            if (val !== '') {
                var data = this.refs.data;
                var sections = this.refs.sections;
                var classes = this.classes;

                data.forEach(function (el) {
                    _utils2.default.addClass(el, classes.SEARCH_HIDDEN);
                });

                sections.forEach(function (se) {
                    _utils2.default.addClass(se, classes.SEARCH_HIDDEN);
                });

                matches.forEach(function (e) {
                    _utils2.default.removeClass(data[e.i], classes.SEARCH_HIDDEN);

                    if (typeof e.d.s == 'number') {
                        _utils2.default.removeClass(sections[e.d.s], classes.SEARCH_HIDDEN);
                    }
                });

                if (!this.refs.noMoreOptionsEl) {
                    if (matches.length === 0) {
                        this.addNoResultsMessage();
                    } else {
                        this.removeNoResultsMessage();
                    }
                }
            } else {
                this.fuzzySearchReset();
            }
        }

        /**
         * ## fuzzySearch
         *
         * filters events to determine the correct actions, based on events from
         * the search box
         *
         * @param {Object} e event object
         *
         * @return {Void} void
         */

    }, {
        key: 'fuzzySearch',
        value: function fuzzySearch(e) {
            this.fuzzySearch.previousValue = this.fuzzySearch.previousValue || '';

            if (this.onInputChange) {
                try {
                    this.onInputChange(e);
                } catch (e) {
                    console.warn('something may be wrong in "onInputChange"', e);
                }
            }

            if (!this.toggleList.justOpened) {
                e.preventDefault();

                var keyCode = e.keyCode;

                if (keyCode !== _keycodes2.default.UP && keyCode !== _keycodes2.default.DOWN && keyCode !== _keycodes2.default.ENTER && keyCode !== _keycodes2.default.ESCAPE) {
                    if (this.multipleTags && keyCode === _keycodes2.default.BACKSPACE && this.fuzzySearch.previousValue === '') {
                        var lastTag = this.refs.search.previousSibling;

                        if (lastTag) {
                            setTimeout(function () {
                                return lastTag.focus();
                            }, 0);
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
         * @return {Void} void
         */

    }, {
        key: 'fuzzySearchReset',
        value: function fuzzySearchReset() {
            var refs = this.refs;
            var classes = this.classes;

            refs.sections.forEach(function (se) {
                _utils2.default.removeClass(se, classes.SEARCH_HIDDEN);
            });

            refs.data.forEach(function (dataObj) {
                _utils2.default.removeClass(dataObj, classes.SEARCH_HIDDEN);
            });

            refs.search.value = '';
            this.removeNoResultsMessage();
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

            if (this.onInit) {
                try {
                    this.onInit();
                } catch (e) {
                    console.warn('something may be wrong in "onInit"', e);
                }
            }

            this.buildDom();

            var _utils$setPlatform = _utils2.default.setPlatform(),
                isOsx = _utils$setPlatform.isOsx,
                isIos = _utils$setPlatform.isIos,
                multiSelect = _utils$setPlatform.multiSelect;

            this.isOsx = isOsx;
            this.isIos = isIos;
            this.multiSelect = multiSelect;
            this.onRender();

            if (this.onComponentDidMount) {
                try {
                    this.onComponentDidMount();
                } catch (e) {
                    console.warn('something may be wrong in onComponentDidMount', e);
                }
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

            for (var opt in _defaults.defaultOptions) {
                // depreciated @todo remove @2.0.0
                if (opt === 'onChange' && props.onSelect) {
                    this.onChange = props.onSelect;

                    console.warn('Please use onChange.  onSelect has been\n                                    depricated and will be removed in 2.0.0');

                    this.onSelect = function () {
                        console.warn('Please use onChange. onSelect has been\n                                    depricated and will be removed in 2.0.0');
                        this.onChange.apply(this, arguments);
                    };
                } else if (opt === 'classes') {
                    this.classes = {};
                    var defaultClasses = _defaults.defaultOptions[opt];
                    var propClasses = _typeof(props[opt]) === 'object' ? props[opt] : {};

                    for (var clss in defaultClasses) {
                        this.classes[clss] = propClasses[clss] ? propClasses[clss] : defaultClasses[clss];
                    }
                } else if (opt === 'data') {
                    this.data = props.data && props.data.length ? [].concat(_toConsumableArray(props.data)) : [].concat(_toConsumableArray(_defaults.defaultOptions.data));
                } else {
                    this[opt] = props[opt] !== undefined ? props[opt] : _defaults.defaultOptions[opt];
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

            if (!!this.isIos && !this.multiple) {
                var sel = refs.select;
                var classes = this.classes;
                _utils2.default.removeClass(sel, classes.HIDDEN);
                _utils2.default.addClass(sel, classes.HIDDEN_IOS);
            }

            this.addListeners(refs, props);
        }

        /**
         * ## sortData
         *
         * checks the data object for header options, and sorts it accordingly
         *
         * @param {Array} data flounder data options
         * @param {Array} res results
         * @param {Number} i index
         * @param {Number} s section's index (undefined = no section)
         *
         * @return {Boolean} hasHeaders
         */

    }, {
        key: 'sortData',
        value: function sortData(data) {
            var res = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

            var _this = this;

            var i = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
            var s = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;

            var indexHeader = 0;

            data.forEach(function (d) {
                if (d.header) {
                    res = _this.sortData(d.data, res, i, indexHeader);
                    indexHeader++;
                } else {
                    /* istanbul ignore next */
                    if ((typeof d === 'undefined' ? 'undefined' : _typeof(d)) !== 'object') {
                        d = {
                            text: d,
                            value: d,
                            index: i
                        };
                    } else {
                        d.index = i;
                    }

                    if (s !== undefined) {
                        d.s = s;
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
 * @param {Mixed} targets target(s) _Array or String_
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
     * score += this.scoreThis( search[ param ], weights[ param ] );
     */
    scoreProperties: ['text', 'textFlat', 'textSplit', 'value', 'valueFlat', 'valueSplit', 'description', 'descriptionSplit'],

    /*
     * params to test with startsWith
     *
     * called as:
     * startsWith( query, search[ param ], weights[ param + 'StartsWith' ] );
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
         * @return {Number} comparison result
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
         * @param {Object} flounder option object
         *
         * @return {Object} this
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
     * @return {String} escaped string
     */


    _createClass(Sole, [{
        key: 'escapeRegExp',
        value: function escapeRegExp(string) {
            return string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
        }

        /**
         * ## getResultWeights
         *
         * after the data is prepared this is mapped through the data to get
         * weighted results
         *
         * @param  {Object} d object
         * @param  {Number} i index
         *
         * @return {Object} res weighted results
         */

    }, {
        key: 'getResultWeights',
        value: function getResultWeights(d, i) {
            var _this = this;

            var score = 0;
            var res = {
                i: i,
                d: d
            };

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
         * @param {Object} d score object
         *
         * @return {Boolean} the minimum or not
         */

    }, {
        key: 'isItemAboveMinimum',
        value: function isItemAboveMinimum(d) {
            return d.score >= defaults.minimumScore;
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
         * @return {Array} results returns array of relevant search results
         */

    }, {
        key: 'isThereAnythingRelatedTo',
        value: function isThereAnythingRelatedTo() {
            var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

            var ratedRes = void 0;

            query = query.length ? query : '' + query;

            if (query.length >= defaults.minimumValueLength) {
                this.query = query.toLowerCase().split(' ');

                var data = this.flounder.data;
                data = this.flounder.sortData(data);

                ratedRes = this.ratedRes = data.map(this.getResultWeights);
            } else {
                return false;
            }

            ratedRes = ratedRes.filter(this.isItemAboveMinimum);
            ratedRes.sort(this.compareScoreCards);

            return this.ratedRes = ratedRes;
        }

        /**
         * ## startsWith
         *
         * checks the beginning of the given text to see if the query matches
         * exactly
         *
         * @param {String} query string to search for
         * @param {String} value string to search in
         * @param {Integer} weight amount of points to give an exact match
         *
         * @return {Integer} points to award
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
         * @return {Integer} the final weight adjusted score
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
                    } else if (target[0]) {
                        target.forEach(function (word) {
                            count += word.indexOf(queryWord) !== -1 ? 1 : 0;
                        });
                    } else {
                        count = target[queryWord] || 0.000001;
                    }

                    if (count > 0) {
                        score = weight * count * 10;
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
     * @param {DOMElement} el target element
     * @param {String} clss class to add
     *
     * @return {Void} void
     */
    addClass: function addClass(el, clss) {
        if (typeof clss !== 'string' && clss.length) {
            clss.forEach(function (c) {
                utils.addClass(el, c);
            });

            return true;
        }

        var elClass = el.className;
        var elClassLength = elClass.length;

        var className = elClass.slice(elClassLength - clss.length - 1, elClassLength);

        if (!utils.hasClass(el, clss) && elClass.slice(0, clss.length + 1) !== clss + ' ' && className !== ' ' + clss) {
            elClass += '  ' + clss;
        }

        el.className = elClass.trim();
    },


    /**
     * ## attachAttributes
     *
     * attached data attributes and others (seperately)
     *
     * @param {DOMElement} el element to assign attributes
     * @param {Object} elObj contains the attributes to attach
     *
     * @return {Void} void
     */
    attachAttributes: function attachAttributes(el, elObj) {
        if (elObj) {
            for (var att in elObj) {
                if (att.slice(0, 5) === 'data-') {
                    el.setAttribute(att, elObj[att]);
                } else {
                    el[att] = elObj[att];
                }
            }
        } else {
            return null;
        }
    },


    /**
     * ## constructElement
     *
     * @param {Object} elObj object carrying properties to transfer
     *
     * @return {Element} new element
     */
    constructElement: function constructElement(elObj) {
        var el = document.createElement(elObj.tagname || 'div');

        utils.attachAttributes(el, elObj);

        return el;
    },


    /**
     * ## debounce
     *
     * debounces a function using the specified delay
     *
     * @param {Function} func function to be debounced
     * @param {Number} wait debounce delay
     * @param {Object} context context for debounced funtion execution
     *
     * @return {Void} void
     */
    debounce: function debounce(func, wait) {
        var context = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this;

        var args = void 0;
        var timeout = void 0;

        var debounced = function debounced() {
            return func.apply(context, args);
        };

        return function () {
            clearTimeout(timeout);

            args = arguments;
            timeout = setTimeout(debounced, wait);
        };
    },


    /**
     * ## extendClass
     *
     * extends a class from an object.  returns the original reference
     *
     * @param {Class} extend class to be extended
     * @param {Class} objects objects to extend the class with
     *
     * @return {Class} modified class object
     */
    extendClass: function extendClass(extend) {
        extend = extend.prototype;

        /**
         * ## merge
         *
         * combines two objects
         *
         * @param {Object} obj object to combine with extend
         *
         * @return {Obj} newly combined object
         */
        function merge(obj) {
            for (var prop in obj) {
                extend[prop] = obj[prop];
            }
        }

        for (var _len = arguments.length, objects = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            objects[_key - 1] = arguments[_key];
        }

        for (var i = 0, lenI = objects.length; i < lenI; i++) {
            var obj = objects[i];
            merge(obj);
        }

        return extend;
    },


    /**
     * ## escapeHTML
     *
     * Escapes HTML in order to put correct elements in the DOM
     *
     * @param {String} string unescaped string
     *
     * @return {Void} void
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
     * @param {Function} cb callback
     * @param {Object} context transferred this
     * @param {Number} timeout time to wait in ms
     *
     * @return {Integer} adjusted width
     */
    getElWidth: function getElWidth(el, cb, context) {
        var timeout = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1500;

        var style = window.getComputedStyle(el);

        if (el.offsetWidth === 0 && this.checkWidthAgain !== true) {
            if (cb && context) {
                /* istanbul ignore next */
                setTimeout(cb.bind(context), timeout);
                this.checkWidthAgain = true;
            } else {
                throw 'Flounder getElWidth error: no callback given.';
            }
        } else {
            this.checkWidthAgain = false;
        }

        return el.offsetWidth + parseInt(style['margin-left']) + parseInt(style['margin-right']);
    },


    /**
     * ## hasClass
     *
     * on the quest to nuke jquery, a wild helper function appears
     *
     * @param {DOMElement} el target element
     * @param {String} clss class to check
     *
     * @return {Void} void
     */
    hasClass: function hasClass(el, clss) {
        var elClass = el.className;
        var regex = new RegExp('(^' + clss + ' )|( ' + clss + '$)|( ' + clss + ' )|(^' + clss + '$)'); // eslint-disable-line

        return !!elClass.match(regex);
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
     * @return {Void} void
     */
    iosVersion: function iosVersion() {
        var windowObj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window;

        if (/iPad|iPhone|iPod/.test(windowObj.navigator.platform)) {
            if (windowObj.indexedDB) {
                return '8+';
            } else if (windowObj.SpeechSynthesisUtterance) {
                return '7';
            }
            if (windowObj.webkitAudioContext) {
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
     * @return {Void} void
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
     * @param {DOMElement} el target element
     * @param {String} clss class to remove
     *
     * @return {Void} void
     */
    removeClass: function removeClass(el, clss) {
        if (typeof clss !== 'string' && clss.length) {
            clss.forEach(function (_c) {
                utils.removeClass(el, _c);
            });

            return true;
        }

        var baseClass = el.className;
        var baseClassLength = baseClass.length;
        var classLength = clss.length;

        if (baseClass === clss) {
            baseClass = '';
        } else if (baseClass.slice(0, classLength + 1) === clss + ' ') {
            baseClass = baseClass.slice(classLength + 1, baseClassLength);
        } else if (baseClass.slice(baseClassLength - classLength - 1, baseClassLength) === ' ' + clss) {
            baseClass = baseClass.slice(0, baseClassLength - classLength - 1);
        } else if (baseClass.indexOf(' ' + clss + ' ') !== -1) {
            baseClass = baseClass.replace(' ' + clss + ' ', ' ');
        }

        el.className = baseClass.trim();
    },


    /**
     * ## scrollTo
     *
     * checks if an option is visible and, if it is not, scrolls it into view
     *
     * @param {DOMElement}  element         element to check
     * @param {DOMElement}  [scrollParent]  parent element to scroll
     *
     * @return {Void} void
     */
    scrollTo: function scrollTo(element, scrollParent) {
        if (element) {
            var scrollElement = scrollParent || element.offsetParent;

            if (scrollElement.scrollHeight > scrollElement.offsetHeight) {
                var pos = element.offsetTop;
                var elHeight = element.offsetHeight;
                var contHeight = scrollElement.offsetHeight;

                var min = scrollElement.scrollTop;
                var max = min + scrollElement.offsetHeight - elHeight;

                if (pos < min) {
                    scrollElement.scrollTop = pos;
                } else if (pos > max) {
                    scrollElement.scrollTop = pos - (contHeight - elHeight);
                }
            }
        }

        return false;
    },


    /**
     * ## setPlatform
     *
     * sets the platform to osx or not osx for the sake of the multi select key
     *
     * @param {Object} windowObj window, but allows for as testing override
     *
     * @return {Void} void
     */
    setPlatform: function setPlatform() {
        var windowObj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window;

        var platform = windowObj.navigator.platform;
        var isOsx = platform.indexOf('Mac') !== -1;
        var isIos = utils.iosVersion(windowObj);
        var multiSelect = isOsx ? 'metaKey' : 'ctrlKey';

        return {
            isOsx: isOsx,
            isIos: isIos,
            multiSelect: multiSelect
        };
    },


    /**
     * ## toggleClass
     *
     * in a world moving away from jquery, a wild helper function appears
     *
     * @param  {DOMElement} _el target to toggle class on
     * @param  {String} _class class to toggle on/off
     *
     * @return {Void} void
     */
    toggleClass: function toggleClass(_el, _class) {
        if (utils.hasClass(_el, _class)) {
            utils.removeClass(_el, _class);
        } else {
            utils.addClass(_el, _class);
        }
    }
}; /* globals clearTimeout, document, setTimeout, window */


(0, _http2.default)(utils);

exports.default = utils;

},{"microbejs/src/modules/http":3}],21:[function(require,module,exports){
'use strict';

/* globals module */
module.exports = '1.3.0';

},{}]},{},[17]);
