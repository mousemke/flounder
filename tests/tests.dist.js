(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
                            _cb({
                                status      : _val.status,
                                statusText  : _val.statusText
                            });
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

},{"promise":2}],2:[function(require,module,exports){
'use strict';

module.exports = require('./lib')

},{"./lib":7}],3:[function(require,module,exports){
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

},{"asap/raw":11}],4:[function(require,module,exports){
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

},{"./core.js":3}],5:[function(require,module,exports){
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

},{"./core.js":3}],6:[function(require,module,exports){
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

},{"./core.js":3}],7:[function(require,module,exports){
'use strict';

module.exports = require('./core.js');
require('./done.js');
require('./finally.js');
require('./es6-extensions.js');
require('./node-extensions.js');
require('./synchronous.js');

},{"./core.js":3,"./done.js":4,"./es6-extensions.js":5,"./finally.js":6,"./node-extensions.js":8,"./synchronous.js":9}],8:[function(require,module,exports){
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

},{"./core.js":3,"asap":10}],9:[function(require,module,exports){
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

},{"./core.js":3}],10:[function(require,module,exports){
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

},{"./raw":11}],11:[function(require,module,exports){
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
},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _classes = require('./classes');

var _classes2 = _interopRequireDefault(_classes);

var _defaults = require('./defaults');

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
     * removes flounder and all it's events from the dom
     *
     * @return _Void_
     */
    destroy: function destroy() {
        this.componentWillUnmount();

        var refs = this.refs;
        var originalTarget = this.originalTarget;
        var tagName = originalTarget.tagName;

        refs.flounder.flounder = originalTarget.flounder = this.target.flounder = null;

        if (tagName === 'INPUT' || tagName === 'SELECT') {
            if (tagName === 'SELECT') {
                var firstOption = originalTarget[0];

                if (firstOption && firstOption.textContent === this.props.placeholder) {
                    originalTarget.removeChild(firstOption);
                }
            }

            var target = originalTarget.nextElementSibling;

            try {
                target.parentNode.removeChild(target);
                originalTarget.tabIndex = 0;
                this.removeClass(originalTarget, _classes2['default'].HIDDEN);
            } catch (e) {
                throw ' : this flounder may have already been removed';
            }
        } else {
            try {
                var wrapper = refs.wrapper;
                var _parent = wrapper.parentNode;
                _parent.removeChild(wrapper);
            } catch (e) {
                throw ' : this flounder may have already been removed';
            }
        }
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
    },

    /**
     * ## disable
     *
     * disables flounder by adjusting listeners and classes
     *
     * @param {Boolean} bool dsable or enable
     *
     * @return _Void_
     */
    disable: function disable(bool) {
        var refs = this.refs;
        var flounder = refs.flounder;
        var selected = refs.selected;

        if (bool) {
            refs.flounder.removeEventListener('keydown', this.checkFlounderKeypress);
            refs.selected.removeEventListener('click', this.toggleList);
            this.addClass(selected, _classes2['default'].DISABLED);
            this.addClass(flounder, _classes2['default'].DISABLED);
        } else {
            refs.flounder.addEventListener('keydown', this.checkFlounderKeypress);
            refs.selected.addEventListener('click', this.toggleList);
            this.removeClass(selected, _classes2['default'].DISABLED);
            this.removeClass(flounder, _classes2['default'].DISABLED);
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
            var _ret = (function () {
                var disableByIndex = _this2.disableByIndex.bind(_this2);
                return {
                    v: index.map(function (_i) {
                        return disableByIndex(_i, reenable);
                    })
                };
            })();

            if (typeof _ret === 'object') return _ret.v;
        } else {
            var el = refs.data[index];

            if (el) {
                var opt = refs.selectOptions[index];

                if (reenable) {
                    opt.disabled = false;
                    this.removeClass(el, 'flounder__disabled');
                } else {
                    opt.disabled = true;
                    this.addClass(el, 'flounder__disabled');
                }

                return [el, opt];
            }

            return null;
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
            var _ret2 = (function () {
                var disableByText = _this3.disableByText.bind(_this3);
                return {
                    v: text.map(function (_t) {
                        return disableByText(_t, reenable);
                    })
                };
            })();

            if (typeof _ret2 === 'object') return _ret2.v;
        } else {
            var _ret3 = (function () {
                var res = [];
                var getText = document.all ? 'innerText' : 'textContent';

                _this3.refs.selectOptions.forEach(function (el) {
                    var _elText = el[getText];

                    if (_elText === text) {
                        res.push(el.index);
                    }
                });

                return {
                    v: res.length ? _this3.disableByIndex(res, reenable) : null
                };
            })();

            if (typeof _ret3 === 'object') return _ret3.v;
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
            var _ret4 = (function () {
                var disableByValue = _this4.disableByValue.bind(_this4);
                return {
                    v: value.map(function (_v) {
                        return disableByValue(_v, reenable);
                    })
                };
            })();

            if (typeof _ret4 === 'object') return _ret4.v;
        } else {
            var values = this.refs.selectOptions.map(function (el) {
                return el.value === value ? el.index : null;
            }).filter(function (a) {
                return !!a;
            });

            return value ? this.disableByIndex(values, reenable) : null;
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
        } else {
            return refs.selectOptions.map(function (el, i) {
                return _this5.getData(i);
            });
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
            opt = undefined;
        var _data = _el.options;

        for (var i = 0, len = _data.length; i < len; i++) {
            opt = _data[i];

            if (opt.selected) {
                opts.push(opt);
            }
        }

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

        try {
            this.http.get(url).then(function (data) {
                if (data) {
                    _this6.data = JSON.parse(data);
                    if (callback) {
                        callback(_this6.data);
                    }
                } else {
                    console.log('no data recieved');
                }
            })['catch'](function (e) {
                console.log('something happened: ', e);
                _this6.rebuild([{
                    text: '',
                    value: '',
                    index: 0,
                    extraClass: _classes2['default'].LOADING_FAILED
                }]);
            });
        } catch (e) {
            console.log('something happened.  check your loadDataFromUrl callback ', e);
        }

        return [{
            text: '',
            value: '',
            index: 0,
            extraClass: _classes2['default'].LOADING
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
        if (props || !props && (typeof data === 'string' || typeof data.length !== 'number')) {
            this.reconfigureFlounder(data, props);
        }

        props = this.props;
        data = this.data = data || this.data;
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
            var _ret5 = (function () {
                var setByIndex = _this7.setByIndex.bind(_this7);
                return {
                    v: index.map(function (_i) {
                        return setByIndex(_i, multiple, programmatic);
                    })
                };
            })();

            if (typeof _ret5 === 'object') return _ret5.v;
        } else {
            var el = refs.data[index];

            if (el) {
                var isOpen = this.hasClass(refs.wrapper, 'open');
                this.toggleList(isOpen ? 'close' : 'open');
                this.___forceMultiple = multiple;
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
            var _ret6 = (function () {
                var setByText = _this8.setByText.bind(_this8);
                return {
                    v: text.map(function (_i) {
                        return setByText(_i, multiple, programmatic);
                    })
                };
            })();

            if (typeof _ret6 === 'object') return _ret6.v;
        } else {
            var _ret7 = (function () {
                var res = [];
                var getText = document.all ? 'innerText' : 'textContent';

                _this8.refs.selectOptions.forEach(function (el) {
                    var _elText = el[getText];

                    if (_elText === text) {
                        res.push(el.index);
                    }
                });

                return {
                    v: res.length ? _this8.setByIndex(res, multiple, programmatic) : null
                };
            })();

            if (typeof _ret7 === 'object') return _ret7.v;
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
            var _ret8 = (function () {
                var setByValue = _this9.setByValue.bind(_this9);
                return {
                    v: value.map(function (_i) {
                        return setByValue(_i, multiple, programmatic);
                    })
                };
            })();

            if (typeof _ret8 === 'object') return _ret8.v;
        } else {
            var values = this.refs.selectOptions.map(function (el) {
                return el.value === value + '' ? el.index : null;
            }).filter(function (a) {
                return !!a;
            });

            return value ? this.setByIndex(values, multiple, programmatic) : null;
        }
    }
};

exports['default'] = api;
module.exports = exports['default'];

},{"./classes":14,"./defaults":15}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _classes = require('./classes');

var _classes2 = _interopRequireDefault(_classes);

var _defaults = require('./defaults');

var nativeSlice = Array.prototype.slice;

var build = {

    /**
     * ## addOptionDescription
     *
     * adds a description to the option
     *
     * @param {DOMElement} el option leement to add description to
     * @param {String} text description
     *
     * @return _Void_
     */
    addOptionDescription: function addOptionDescription(el, text) {
        var div = document.createElement('div');
        div.innerHTML = text;
        div.className = _classes2['default'].DESCRIPTION;
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
            var search = this.constructElement({
                tagname: 'input',
                type: 'text',
                className: _classes2['default'].SEARCH
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

        ['addClass', 'attachAttributes', 'catchBodyClick', 'checkClickTarget', 'checkFlounderKeypress', 'checkPlaceholder', 'clickSet', 'divertTarget', 'displayMultipleTags', 'fuzzySearch', 'removeMultiTag', 'firstTouchController', 'setKeypress', 'setSelectValue', 'toggleClass', 'toggleList'].forEach(function (func) {
            _this[func] = _this[func].bind(_this);
            _this[func].___isBound = true;
        });
    },

    /**
     * ## buildDom
     *
     * builds flounder
     *
     * @return _Void_
     */
    buildDom: function buildDom() {
        this.refs = {};

        var constructElement = this.constructElement;

        var wrapperClass = _classes2['default'].MAIN_WRAPPER;
        var wrapper = this.constructElement({ className: this.wrapperClass ? wrapperClass + ' ' + this.wrapperClass : wrapperClass });
        var flounderClass = _classes2['default'].MAIN;
        var flounder = constructElement({ className: this.flounderClass ? flounderClass + '  ' + this.flounderClass : flounderClass });

        flounder.setAttribute('aria-hidden', true);
        flounder.tabIndex = 0;
        wrapper.appendChild(flounder);

        var select = this.initSelectBox(wrapper);
        select.tabIndex = -1;

        if (this.multiple === true) {
            select.setAttribute('multiple', '');
        }

        var data = this.data;
        var defaultValue = this._default = (0, _defaults.setDefaultOption)(this, this.props, data);
        var selected = constructElement({ className: _classes2['default'].SELECTED_DISPLAYED,
            'data-value': defaultValue.value, 'data-index': defaultValue.index || -1 });
        selected.innerHTML = defaultValue.text;

        var multiTagWrapper = this.multiple ? constructElement({ className: _classes2['default'].MULTI_TAG_LIST }) : null;

        var arrow = constructElement({ className: _classes2['default'].ARROW });
        var optionsListWrapper = constructElement({ className: _classes2['default'].OPTIONS_WRAPPER + '  ' + _classes2['default'].HIDDEN });
        var optionsList = constructElement({ className: _classes2['default'].LIST });
        optionsList.setAttribute('role', 'listbox');
        optionsListWrapper.appendChild(optionsList);

        [selected, multiTagWrapper, arrow, optionsListWrapper].forEach(function (el) {
            if (el) {
                flounder.appendChild(el);
            }
        });

        var search = this.addSearch(flounder);
        var selectOptions = undefined;

        var _buildData = this.buildData(defaultValue, data, optionsList, select);

        var _buildData2 = _slicedToArray(_buildData, 2);

        data = _buildData2[0];
        selectOptions = _buildData2[1];

        this.target.appendChild(wrapper);

        this.refs = { wrapper: wrapper, flounder: flounder, selected: selected, arrow: arrow, optionsListWrapper: optionsListWrapper,
            search: search, multiTagWrapper: multiTagWrapper, optionsList: optionsList, select: select, data: data, selectOptions: selectOptions };
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
        originalData = originalData || [];
        var index = 0;
        var data = [];
        var selectOptions = [];
        var constructElement = this.constructElement;
        var addOptionDescription = this.addOptionDescription;
        var selectedClass = this.selectedClass;
        var escapeHTML = this.escapeHTML;
        var addClass = this.addClass;
        var selectRef = this.refs.select;

        /**
         * ## buildDiv
         *
         * builds an individual div tag for a flounder dropdown
         *
         * @param {Object} dataObj [description]
         * @param {Number} i index
         *
         * @return {DOMElement}
         */
        var buildDiv = function buildDiv(dataObj, i) {
            if (typeof dataObj !== 'object') {
                dataObj = {
                    text: dataObj,
                    value: dataObj
                };
            }
            dataObj.index = i;

            var extraClass = i === defaultValue.index ? '  ' + selectedClass : '';

            var res = {
                className: _classes2['default'].OPTION + extraClass,
                'data-index': i
            };

            for (var o in dataObj) {
                if (o !== 'text' && o !== 'description') {
                    res[o] = dataObj[o];
                }
            }

            var data = constructElement(res);
            var escapedText = escapeHTML(dataObj.text);
            data.innerHTML = escapedText;

            if (dataObj.description) {
                addOptionDescription(data, dataObj.description);
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
         * @param {Object} dataObj [description]
         * @param {Number} i index
         *
         * @return {DOMElement}
         */
        var buildOption = function buildOption(dataObj, i) {
            var selectOption = undefined;

            if (!selectRef) {
                selectOption = constructElement({ tagname: 'option',
                    className: _classes2['default'].OPTION_TAG,
                    value: dataObj.value });
                var escapedText = escapeHTML(dataObj.text);
                selectOption.innerHTML = escapedText;
                select.appendChild(selectOption);
            } else {
                var selectChild = selectRef.children[i];
                selectOption = selectChild;
                selectChild.setAttribute('value', selectChild.value);
                addClass(selectChild, 'flounder--option--tag');
            }

            if (i === defaultValue.index) {
                selectOption.selected = true;
            }

            if (selectOption.getAttribute('disabled')) {
                addClass(data[i], _classes2['default'].DISABLED_OPTION);
            }

            return selectOption;
        };

        originalData.forEach(function (dataObj, i) {
            var dataObjType = typeof dataObj;

            if (dataObjType !== 'object') {
                dataObj = originalData[i] = {
                    text: dataObj,
                    value: dataObj
                };
            }

            if (dataObj.header) {
                (function () {
                    var section = constructElement({ tagname: 'div',
                        className: _classes2['default'].SECTION });
                    var header = constructElement({ tagname: 'div',
                        className: _classes2['default'].HEADER });
                    header.textContent = dataObj.header;
                    section.appendChild(header);
                    optionsList.appendChild(section);

                    dataObj.data.forEach(function (d) {
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

        if (target.tagName === 'SELECT') {
            this.addClass(target, _classes2['default'].SELECT_TAG);
            this.addClass(target, _classes2['default'].HIDDEN);

            select = target;

            if (!this.props.keepChangesOnDestroy) {
                this.popOutSelectElements(select);
            }

            if (target.length > 0 && !this.selectDataOverride) {
                (function () {
                    _this2.refs.select = select;
                    var data = [],
                        selectOptions = [];

                    nativeSlice.apply(target.children).forEach(function (optionEl) {
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
                this.removeAllChildren(target);
            }

            this.target = target.parentNode;
            this.addClass(select || target, _classes2['default'].HIDDEN);
        } else {
            select = this.constructElement({ tagname: 'SELECT', className: _classes2['default'].SELECT_TAG + '  ' + _classes2['default'].HIDDEN });
            wrapper.appendChild(select);
        }

        return select;
    },

    /**
     * popInSelectElements
     *
     * pops the previously saves elements back into a select tag, restoring the
     * original state
     *
     * @param {DOMElement} select select element
     *
     * @return _Void_
     */
    popInSelectElements: function popInSelectElements(select) {
        this.removeAllChildren(select);

        this.originalChildren.forEach(function (_el, i) {
            select.appendChild(_el);
        });
    },

    /**
     * popOutSelectElements
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
        var children = this.originalChildren = nativeSlice.call(select.children);

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
        if (typeof data !== 'string' && typeof data.length === 'number') {
            props = props = props || this.props;
            props.data = data;
        } else if (!props && typeof data === 'object') {
            props = data;
            props.data = props.data || this.data;
        } else {
            props.data = data || props.data || this.data;
        }

        return this.constructor(this.originalTarget, props);
    },

    /**
     * ## Set Target
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
            this.addClass(target, _classes2['default'].HIDDEN);
            target.setAttribute('aria-hidden', true);
            target.tabIndex = -1;
            target = target.parentNode;
        }

        this.target = target;
    }
};

exports['default'] = build;
module.exports = exports['default'];

},{"./classes":14,"./defaults":15}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var classes = {
    ARROW: 'flounder__arrow',
    DESCRIPTION: 'flounder__option--description',
    DISABLED: 'flounder__disabled',
    DISABLED_OPTION: 'flounder__disabled--option',
    HEADER: 'flounder__header',
    HIDDEN: 'flounder--hidden',
    HIDDEN_IOS: 'flounder--hidden--ios',
    LIST: 'flounder__list',
    LOADING: 'flounder__loading',
    LOADING_FAILED: 'flounder__loading--failed',
    MAIN: 'flounder',
    MAIN_WRAPPER: 'flounder--wrapper  flounder__input--select',
    MULTI_TAG_LIST: 'flounder__multi--tag--list',
    MULTIPLE_SELECT_TAG: 'flounder__multiple--select--tag',
    MULTIPLE_TAG_CLOSE: 'flounder__multiple__tag__close',
    OPTION: 'flounder__option',
    OPTION_TAG: 'flounder--option--tag',
    OPTIONS_WRAPPER: 'flounder__list--wrapper',
    PLUG: 'flounder__ios--plug',
    SECTION: 'flounder__section',
    SELECTED: 'flounder__option--selected',
    SELECTED_HIDDEN: 'flounder__option--selected--hidden',
    SELECTED_DISPLAYED: 'flounder__option--selected--displayed',
    SEARCH: 'flounder__input--search',
    SEARCH_HIDDEN: 'flounder--search--hidden',
    SELECT_TAG: 'flounder--select--tag'
};

exports['default'] = classes;
module.exports = exports['default'];

},{}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _classes = require('./classes');

var _classes2 = _interopRequireDefault(_classes);

var defaultOptions = {
    classes: {
        flounder: '',
        hidden: 'flounder--hidden',
        selected: 'flounder__option--selected',
        wrapper: ''
    },
    data: [],
    keepChangesOnDestroy: false,
    multiple: false,
    multipleTags: false,
    multipleMessage: '(Multiple Items Selected)',
    onClose: function onClose(e, selectedValues) {},
    onComponentDidMount: function onComponentDidMount() {},
    onComponentWillUnmount: function onComponentWillUnmount() {},
    onFirstTouch: function onFirstTouch(e) {},
    onInit: function onInit() {},
    onOpen: function onOpen(e, selectedValues) {},
    onSelect: function onSelect(e, selectedValues) {},
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
     * @param {String or Number}    defaultProp         default passed from this.props
     * @param {Object}              data                this.props.data
     *
     * @return _Void_
     */
    setDefaultOption: function setDefaultOption(self, configObj) {
        var data = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
        var rebuild = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

        /**
         * ## setIndexDefault
         *
         * sets a specified indexas the default option. This only works correctly
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
        var setPlaceholderDefault = function setPlaceholderDefault(_data) {
            var refs = self.refs;
            var select = refs.select;

            var _default = {
                text: configObj.placeholder || defaultOptions.placeholder,
                value: '',
                index: 0,
                extraClass: _classes2['default'].HIDDEN
            };

            if (select) {
                var escapedText = self.escapeHTML(_default.text);

                if (!select[0] || select[0].value !== '') {
                    var defaultOption = self.constructElement({ tagname: 'option',
                        className: _classes2['default'].OPTION_TAG,
                        value: _default.value });
                    defaultOption.innerHTML = escapedText;

                    select.insertBefore(defaultOption, select[0]);
                    self.refs.selectOptions.unshift(defaultOption);
                    data.unshift(_default);
                } else {
                    data[0] = _default;
                }
            } else {
                data.unshift(_default);
            }

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
        var setValueDefault = function setValueDefault(_data) {
            var defaultProp = configObj.defaultValue + '';
            var index = undefined;

            _data.forEach(function (dataObj, i) {
                var dataObjValue = dataObj.value;

                if (typeof dataObjValue === 'number') {
                    dataObjValue += '';
                }

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

        var defaultObj = undefined;
        var _data = sortData(data);

        // if ( rebuild )
        // {

        // }
        // else
        // {
        if (configObj.placeholder || _data.length === 0) {
            defaultObj = setPlaceholderDefault(self, _data);
        } else if (configObj.defaultIndex) {
            defaultObj = setIndexDefault(_data);
        } else if (configObj.defaultValue) {
            defaultObj = setValueDefault(_data);
        } else {
            if (configObj.multiple) {
                defaultObj = setPlaceholderDefault(self, _data);
            } else {
                defaultObj = setIndexDefault(_data, 0);
            }
        }
        // }

        return defaultObj;
    }
};

exports['default'] = defaults;
module.exports = exports['default'];

},{"./classes":14}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _classes = require('./classes');

var _classes2 = _interopRequireDefault(_classes);

var _search2 = require('./search');

var _search3 = _interopRequireDefault(_search2);

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
    },

    /**
     * ## addListeners
     *
     * adds listeners on render
     *
     * @return _Void_
     */
    addListeners: function addListeners(refs, props) {
        var ios = this.isIos;
        var changeEvent = ios ? 'blur' : 'change';

        refs.select.addEventListener(changeEvent, this.divertTarget);

        refs.flounder.addEventListener('keydown', this.checkFlounderKeypress);
        refs.selected.addEventListener('click', this.toggleList);

        this.addFirstTouchListeners();
        this.addOptionsListeners();

        if (this.search) {
            this.addSearchListeners();
        }
    },

    /**
     * ## addOptionsListeners
     *
     * adds listeners to the options
     *
     * @return _Void_
     */
    addOptionsListeners: function addOptionsListeners() {
        var _this = this;

        this.refs.data.forEach(function (dataObj, i) {
            if (dataObj.tagName === 'DIV') {
                dataObj.addEventListener('click', _this.clickSet);
            }
        });
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
        search.addEventListener('click', this.toggleList);
        search.addEventListener('keyup', this.fuzzySearch);
        search.addEventListener('focus', this.checkPlaceholder);
        search.addEventListener('blur', this.checkPlaceholder);
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
            var firstOption = select[0];
            var plug = document.createElement('OPTION');
            plug.disabled = true;
            plug.className = _classes2['default'].PLUG;
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
        target = target || this.refs.data[e.target.getAttribute('data-index')] || e.target;

        if (target === document) {
            return false;
        } else if (target === this.refs.flounder) {
            return true;
        }

        target = target.parentNode;

        if (target) {
            return this.checkClickTarget(e, target);
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

        if (keyCode === 13 || keyCode === 32 && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            this.toggleList(e);
        } else if (keyCode >= 48 && keyCode <= 57 || keyCode >= 65 && keyCode <= 90) // letters - allows native behavior
            {
                var refs = this.refs;

                if (refs.search && e.target.tagName === 'INPUT') {
                    refs.selected.innerHTML = '';
                }
            }
    },

    /**
     * ## checkPlaceholder
     *
     * clears or re-adds the placeholder
     *
     * @param {Object} e event object
     *
     * @return _Void_
     */
    checkPlaceholder: function checkPlaceholder(e) {
        var type = e.type;
        var refs = this.refs;
        var selected = refs.selected;

        if (type === 'focus') {
            selected.innerHTML = '';
        } else {
            if (refs.multiTagWrapper && refs.multiTagWrapper.children.length === 0) {
                selected.innerHTML = this._default.text;
            } else {
                var active = this.getSelected();
                active = active.length === 1 ? active[0].innerHTML : this.multipleMessage;

                selected.innerHTML = active;
            }
        }
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
        this.setSelectValue({}, e);

        if (!this.multiple || !e[this.multiSelect]) {
            this.toggleList(e);
        }
    },

    /**
     * ## divertTarget
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
            var plug = select.querySelector('.' + _classes2['default'].PLUG);

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
            console.log('something may be wrong in "onFirstTouch"', e);
        }

        refs.selected.removeEventListener('click', this.firstTouchController);
        refs.select.removeEventListener('focus', this.firstTouchController);
    },

    /**
     * ## removeOptionsListeners
     *
     * removes event listeners on the data divs
     *
     * @return _Void_
     */
    removeOptionsListeners: function removeOptionsListeners() {
        var _this2 = this;

        this.refs.data.forEach(function (dataObj) {
            if (dataObj.tagName === 'DIV') {
                dataObj.removeEventListener('click', _this2.clickSet);
            }
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
     * handles arrow key selection
     *
     * @param {Object} e event object
     *
     * @return _Void_
     */
    setKeypress: function setKeypress(e) {
        var refs = this.refs;

        var increment = 0;
        var keyCode = e.keyCode;

        if (this.multipleTags) {
            e.preventDefault();
            return false;
        }

        if (keyCode === 13 || keyCode === 27 || keyCode === 32) // space enter escape
            {
                this.toggleList(e);
                return false;
            } else if (!window.sidebar && (keyCode === 38 || keyCode === 40)) // up and down
            {
                e.preventDefault();
                var _search = refs.search;

                if (_search) {
                    _search.value = '';
                }

                increment = keyCode - 39;
            } else if (keyCode >= 48 && keyCode <= 57 || keyCode >= 65 && keyCode <= 90) // letters - allows native behavior
            {
                return true;
            }

        var selectTag = refs.select;
        var data = refs.data;
        var dataMaxIndex = data.length - 1;
        var index = selectTag.selectedIndex + increment;

        if (index > dataMaxIndex) {
            index = 0;
        } else if (index < 0) {
            index = dataMaxIndex;
        }

        selectTag.selectedIndex = index;

        var hasClass = this.hasClass;
        var dataAtIndex = data[index];

        if (hasClass(dataAtIndex, _classes2['default'].HIDDEN) || hasClass(dataAtIndex, _classes2['default'].SELECTED_HIDDEN) || hasClass(dataAtIndex, _classes2['default'].SEARCH_HIDDEN) || hasClass(dataAtIndex, _classes2['default'].DISABLED)) {
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
        var keyCode = undefined;

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

            if (e || obj.type === 'blur' || keyCode && nonKeys.indexOf(keyCode) === -1) {
                if (this.toggleList.justOpened && !e) {
                    this.toggleList.justOpened = false;
                } else {
                    try {
                        this.onSelect(e, this.getSelectedValues());
                    } catch (e) {
                        console.log('something may be wrong in "onSelect"', e);
                    }
                }
            }
        }

        this.___programmaticClick = false;
    },

    /**
     * ## setSelectValueButton
     *
     * processes the setting of a value after a keypress event
     *
     * @return _Void_
     */
    setSelectValueButton: function setSelectValueButton() {
        var refs = this.refs;
        var data = refs.data;
        var select = refs.select;
        var selectedClass = this.selectedClass;

        var selectedOption = undefined;

        this.removeSelectedClass(data);

        var dataArray = this.getSelected();
        var baseOption = dataArray[0];

        if (baseOption) {
            selectedOption = data[baseOption.index];

            this.addClass(selectedOption, selectedClass);

            this.scrollTo(selectedOption);
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
        var index = undefined,
            selectedOption = undefined;

        if ((!_multiple || _multiple && !this.multipleTags && !e[this.multiSelect]) && !this.___forceMultiple) {
            this.deselectAll();
        }

        this.___forceMultiple = false;
        var target = e.target;

        this.toggleClass(target, selectedClass);
        index = target.getAttribute('data-index');

        selectedOption = refs.selectOptions[index];

        selectedOption.selected = selectedOption.selected === true ? false : true;
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
     *
     * @return _Void_
     */
    toggleClosed: function toggleClosed(e, optionsList, refs, wrapper) {
        this.hideElement(optionsList);
        this.removeSelectKeyListener();
        this.removeClass(wrapper, 'open');

        var qsHTML = document.querySelector('html');
        qsHTML.removeEventListener('click', this.catchBodyClick);
        qsHTML.removeEventListener('touchend', this.catchBodyClick);

        if (this.search) {
            this.fuzzySearchReset();
        }

        refs.flounder.focus();

        if (this.ready) {
            try {
                this.onClose(e, this.getSelectedValues());
            } catch (e) {
                console.log('something may be wrong in "onClose"', e);
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
        var refs = this.refs;
        var optionsList = refs.optionsListWrapper;
        var wrapper = refs.wrapper;
        var hasClass = this.hasClass;

        if (force === 'open' || force !== 'close' && hasClass(optionsList, _classes2['default'].HIDDEN)) {
            if (e.type === 'keydown') {
                this.toggleList.justOpened = true;
            }

            this.toggleOpen(e, optionsList, refs, wrapper);
        } else if (force === 'close' || !hasClass(optionsList, _classes2['default'].HIDDEN)) {
            this.toggleList.justOpened = false;
            this.toggleClosed(e, optionsList, refs, wrapper);
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
     * @param {DOMElement} wrapper wrapper of flounder
     *
     * @return _Void_
     */
    toggleOpen: function toggleOpen(e, optionsList, refs, wrapper) {
        this.addSelectKeyListener();

        if (!this.isIos || this.search || this.multipleTags === true && this.multiple === true) {
            this.showElement(optionsList);
            this.addClass(wrapper, 'open');

            var qsHTML = document.querySelector('html');

            qsHTML.addEventListener('click', this.catchBodyClick);
            qsHTML.addEventListener('touchend', this.catchBodyClick);
        }

        if (!this.multiple) {
            var index = refs.select.selectedIndex;
            var selectedDiv = refs.data[index];

            if (selectedDiv) {
                this.scrollTo(selectedDiv);
            }
        }

        if (this.search) {
            refs.search.focus();
        }

        if (this.ready) {
            try {
                this.onOpen(e, this.getSelectedValues());
            } catch (e) {
                console.log('something may be wrong in "onOpen"', e);
            }
        }
    }
};

exports['default'] = events;
module.exports = exports['default'];

},{"./classes":14,"./search":18}],17:[function(require,module,exports){

/* jshint globalstrict: true */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _defaults = require('./defaults');

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _api = require('./api');

var _api2 = _interopRequireDefault(_api);

var _build = require('./build');

var _build2 = _interopRequireDefault(_build);

var _events = require('./events');

var _events2 = _interopRequireDefault(_events);

var _classes2 = require('./classes');

var _classes3 = _interopRequireDefault(_classes2);

var _search = require('./search');

var _search2 = _interopRequireDefault(_search);

var _version = require('./version');

var _version2 = _interopRequireDefault(_version);

var nativeSlice = Array.prototype.slice;

var Flounder = (function () {
    _createClass(Flounder, [{
        key: 'arrayOfFlounders',

        /**
         * ## arrayOfFlounders
         *
         * called when a jquery object, microbe, or array is fed into flounder
         * as a target
         *
         * @param {DOMElement} target flounder mount point
         * @param {Object} props passed options
         *
         * @return {Array} array of flounders
         */
        value: function arrayOfFlounders(targets, props) {
            var _this = this;

            targets = nativeSlice.call(targets);
            return targets.map(function (el, i) {
                return new _this.constructor(el, props);
            });
        }

        /**
         * ## componentWillUnmount
         *
         * on unmount, removes events
         *
         * @return _Void_
         */
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            try {
                this.onComponentWillUnmount();
            } catch (e) {
                console.log('something may be wrong in "onComponentWillUnmount"', e);
            }

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

            if (this.originalChildren) {
                this.popInSelectElements(select);
            }

            if (this.search) {
                var search = refs.search;
                search.removeEventListener('click', this.toggleList);
                search.removeEventListener('keyup', this.fuzzySearch);
                search.removeEventListener('focus', this.checkPlaceholder);
                search.removeEventListener('blur', this.checkPlaceholder);
            }
        }

        /**
         * ## constructor
         *
         * main constuctor
         *
         * @param {DOMElement} target flounder mount point
         * @param {Object} props passed options
         *
         * @return _Object_ new flounder object
         */
    }]);

    function Flounder(target, props) {
        _classCallCheck(this, Flounder);

        if (!target && !props) {
            return this.constructor;
        } else if (target) {
            if (typeof target === 'string') {
                target = document.querySelectorAll(target);
            }
            if (target.length && target.tagName !== 'SELECT') {
                return this.arrayOfFlounders(target, props);
            } else if (!target.length && target.length !== 0 || target.tagName === 'SELECT') {
                if (target.flounder) {
                    target.flounder.destroy();
                }

                this.props = props;
                this.setTarget(target);
                this.bindThis();
                this.initialzeOptions();

                if (this.search) {
                    this.search = new _search2['default'](this);
                }

                try {
                    this.onInit();
                } catch (e) {
                    console.log('something may be wrong in "onInit"', e);
                }
                this.buildDom();
                this.setPlatform();
                this.onRender();

                try {
                    this.onComponentDidMount();
                } catch (e) {
                    console.log('something may be wrong in "onComponentDidMount"', e);
                }

                this.ready = true;

                return this.refs.flounder.flounder = this.originalTarget.flounder = this.target.flounder = this;
            }
        }
    }

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

    _createClass(Flounder, [{
        key: 'displayMultipleTags',
        value: function displayMultipleTags(selectedOptions, multiTagWrapper) {
            var span = undefined,
                a = undefined;

            var removeMultiTag = this.removeMultiTag;

            nativeSlice.call(multiTagWrapper.children).forEach(function (el) {
                el.firstChild.removeEventListener('click', removeMultiTag);
            });

            multiTagWrapper.innerHTML = '';

            selectedOptions.forEach(function (option) {
                if (option.value !== '') {
                    var _span = document.createElement('span');
                    _span.className = _classes3['default'].MULTIPLE_SELECT_TAG;

                    var _a = document.createElement('a');
                    _a.className = _classes3['default'].MULTIPLE_TAG_CLOSE;
                    _a.setAttribute('data-index', option.index);

                    _span.appendChild(_a);

                    _span.innerHTML += option.innerHTML;

                    multiTagWrapper.appendChild(_span);
                } else {
                    option.selected = false;
                }
            });

            this.setTextMultiTagIndent();

            nativeSlice.call(multiTagWrapper.children).forEach(function (el) {
                el.firstChild.addEventListener('click', removeMultiTag);
            });
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
    }, {
        key: 'displaySelected',
        value: function displaySelected(selected, refs) {
            var value = [];
            var index = -1;

            var selectedOption = this.getSelected();

            var selectedLength = selectedOption.length;

            if (!this.multiple || !this.multipleTags && selectedLength === 1) {
                index = selectedOption[0].index;
                selected.innerHTML = selectedOption[0].innerHTML;
                value = selectedOption[0].value;
            } else if (selectedLength === 0) {
                var defaultValue = this._default;

                index = defaultValue.index || -1;
                selected.innerHTML = defaultValue.text;
                value = defaultValue.value;
            } else {
                if (this.multipleTags) {
                    selected.innerHTML = '';
                    this.displayMultipleTags(selectedOption, this.refs.multiTagWrapper);
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
         * ## fuzzySearch
         *
         * searches for things
         *
         * @param {Object} e event object
         *
         * @return _Void_
         */
    }, {
        key: 'fuzzySearch',
        value: function fuzzySearch(e) {
            var _this2 = this;

            if (!this.toggleList.justOpened) {
                e.preventDefault();
                var keyCode = e.keyCode;

                if (keyCode !== 38 && keyCode !== 40 && keyCode !== 13 && keyCode !== 27) {
                    var val = e.target.value.trim();

                    var matches = this.search.isThereAnythingRelatedTo(val);

                    if (matches) {
                        (function () {
                            var data = _this2.refs.data;

                            data.forEach(function (el, i) {
                                _this2.addClass(el, _classes3['default'].SEARCH_HIDDEN);
                            });

                            matches.forEach(function (e) {
                                _this2.removeClass(data[e.i], _classes3['default'].SEARCH_HIDDEN);
                            });
                        })();
                    } else {
                        this.fuzzySearchReset();
                    }
                } else {
                    console.log('m');
                    this.setKeypress(e);
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
            var _this3 = this;

            var refs = this.refs;

            refs.data.forEach(function (dataObj) {
                _this3.removeClass(dataObj, _classes3['default'].SEARCH_HIDDEN);
            });

            refs.search.value = '';
        }

        /**
         * ## initialzeOptions
         *
         * inserts the initial options into the flounder object, setting defaults when necessary
         *
         * @return _Void_
         */
    }, {
        key: 'initialzeOptions',
        value: function initialzeOptions() {
            this.props = this.props || {};
            var props = this.props;

            for (var opt in _defaults.defaultOptions) {
                if (_defaults.defaultOptions.hasOwnProperty(opt) && opt !== 'classes') {
                    this[opt] = props[opt] !== undefined ? props[opt] : _defaults.defaultOptions[opt];
                } else if (opt === 'classes') {
                    var _classes = _defaults.defaultOptions[opt];
                    var propsClasses = props.classes;

                    for (var clss in _classes) {
                        this[clss + 'Class'] = propsClasses && propsClasses[clss] !== undefined ? propsClasses[clss] : _classes[clss];
                    }
                }
            }

            if (this.multipleTags) {
                this.search = true;
                this.multiple = true;
                this.selectedClass += '  ' + _classes3['default'].SELECTED_HIDDEN;

                if (!props.placeholder) {
                    props.placeholder = _defaults.defaultOptions.placeholder;
                }
            }
        }

        /**
         * ## onRender
         *
         * attaches necessary events to the built DOM
         *
         * @return _Void_
         */
    }, {
        key: 'onRender',
        value: function onRender() {
            var props = this.props;
            var refs = this.refs;
            var data = refs.data;

            if (!!this.isIos && (!this.multipleTags || !this.multiple)) {
                var sel = refs.select;
                this.removeClass(sel, _classes3['default'].HIDDEN);
                this.addClass(sel, _classes3['default'].HIDDEN_IOS);
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

            var value = undefined;
            var index = undefined;
            var refs = this.refs;
            var select = refs.select;
            var selected = refs.selected;
            var target = e.target;
            var defaultValue = this._default;
            var data = this.refs.data;
            var targetIndex = target.getAttribute('data-index');
            select[targetIndex].selected = false;

            var selectedOptions = this.getSelected();

            this.removeClass(data[targetIndex], _classes3['default'].SELECTED_HIDDEN);
            this.removeClass(data[targetIndex], _classes3['default'].SELECTED);

            target.removeEventListener('click', this.removeMultiTag);

            var span = target.parentNode;
            span.parentNode.removeChild(span);

            if (selectedOptions.length === 0) {
                index = defaultValue.index || -1;
                selected.innerHTML = defaultValue.text;
                value = defaultValue.value;
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
                this.onSelect(e, this.getSelectedValues());
            } catch (e) {
                console.log('something may be wrong in "onSelect"', e);
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
            var _this4 = this;

            data = data || this.refs.data;

            data.forEach(function (dataObj, i) {
                _this4.removeClass(dataObj, _this4.selectedClass);
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
            var _this5 = this;

            data = data || this.refs.data;

            data.forEach(function (d, i) {
                _this5.refs.select[i].selected = false;
            });
        }

        /**
         * ## setTextMultiTagIndent
         *
         * sets the text-indent on the search field to go around selected tags
         *
         * @return _Void_
         */
    }, {
        key: 'setTextMultiTagIndent',
        value: function setTextMultiTagIndent() {
            var _this6 = this;

            var search = this.refs.search;
            var offset = 0;

            if (search) {
                var els = document.getElementsByClassName(_classes3['default'].MULTIPLE_SELECT_TAG);

                nativeSlice.call(els).forEach(function (e, i) {
                    offset += _this6.getElWidth(e);
                });

                search.style.textIndent = offset + 'px';
            }
        }

        /**
         * ## sortData
         *
         * checks the data object for header options, and sorts it accordingly
         *
         * @return _Boolean_ hasHeaders
         */
    }, {
        key: 'sortData',
        value: function sortData(data) {
            var _this7 = this;

            var res = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
            var i = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

            data.forEach(function (d) {
                if (d.header) {
                    res = _this7.sortData(d.data, res, i);
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
})();

Object.defineProperty(Flounder, 'version', {
    get: function get() {
        return _version2['default'];
    }
});

Object.defineProperty(Flounder.prototype, 'version', {
    get: function get() {
        return _version2['default'];
    }
});

_utils2['default'].extendClass(Flounder, _utils2['default'], _api2['default'], _build2['default'], _events2['default']);

exports['default'] = Flounder;
module.exports = exports['default'];

},{"./api":12,"./build":13,"./classes":14,"./defaults":15,"./events":16,"./search":18,"./utils":19,"./version":20}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var defaults = {
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
     * score += startsWith( query, search[ param ], weights[ param + 'StartsWith' ] );
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
 * turns out there's all kinds of flounders
 */

var Sole = (function () {
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
            a = a.score;
            b = b.score;

            if (a && b) {
                if (a > b) {
                    return 1;
                } else if (a < b) {
                    return -1;
                }

                return 0;
            }
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
        var _this = this;

        _classCallCheck(this, Sole);

        this.scoreThis = function (target, weight, noPunishment) {
            var score = 0;

            if (target) {
                _this.query.forEach(function (queryWord) {
                    queryWord = _this.escapeRegExp(queryWord);
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
        };

        this.flounder = flounder;
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
        value: function isThereAnythingRelatedTo(query) {
            var _this2 = this;

            var ratedResults = undefined;

            if (query.length >= defaults.minimumValueLength) {
                (function () {
                    _this2.query = query.toLowerCase().split(' ');

                    var scoreThis = _this2.scoreThis;
                    var startsWith = _this2.startsWith;
                    var data = _this2.flounder.data;
                    data = _this2.flounder.sortData(data);

                    ratedResults = _this2.ratedResults = data.map(function (d, i) {
                        var score = 0;
                        var res = { i: i, d: d };
                        var search = d.search = d.search || {};
                        var weights = defaults.weights;

                        search.text = d.text;
                        search.textFlat = d.text.toLowerCase();
                        search.textSplit = search.textFlat.split(' ');

                        search.value = d.value;
                        search.valueFlat = d.value.toLowerCase();
                        search.valueSplit = search.valueFlat.split(' ');

                        search.description = d.description ? d.description.toLowerCase() : null;
                        search.descriptionSplit = d.description ? search.description.split(' ') : null;

                        defaults.scoreProperties.forEach(function (param) {
                            score += scoreThis(search[param], weights[param]);
                        });

                        defaults.startsWithProperties.forEach(function (param) {
                            score += startsWith(query, search[param], weights[param + 'StartsWith']);
                        });

                        res.score = score;

                        return res;
                    });
                })();
            } else {
                return false;
            }

            ratedResults.sort(this.compareScoreCards);
            ratedResults = ratedResults.filter(this.removeItemsUnderMinimum);

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
         * @return {Integer} points to award
         */
    }, {
        key: 'startsWith',
        value: function startsWith(query, value, weight) {
            var valLength = value.length;
            var queryLength = query.length;

            if (queryLength <= valLength) {
                var valStr = value.toLowerCase().slice(0, valLength);

                if (valStr === query) {
                    return weight;
                }
            }

            return 0;
        }

        /**
         * ## removeItemsUnderMinimum
         *
         * removes the items that have recieved a score lower than the set minimum
         *
         * @return _Boolean_ under the minimum or not
         */
    }, {
        key: 'removeItemsUnderMinimum',
        value: function removeItemsUnderMinimum(d) {
            return d.score >= defaults.minimumScore ? true : false;
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
    }]);

    return Sole;
})();

exports.Sole = Sole;
exports['default'] = Sole;

},{}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _classes = require('./classes');

var _classes2 = _interopRequireDefault(_classes);

var _microbejsSrcModulesHttp = require('microbejs/src/modules/http');

var _microbejsSrcModulesHttp2 = _interopRequireDefault(_microbejsSrcModulesHttp);

var nativeSlice = Array.prototype.slice;

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

        var _elClass = _el.className;
        var _elClassLength = _elClass.length;

        if (!utils.hasClass(_el, _class) && _elClass.slice(0, _class.length + 1) !== _class + ' ' && _elClass.slice(_elClassLength - _class.length - 1, _elClassLength) !== ' ' + _class) {
            _elClass += '  ' + _class;
        }

        _el.className = _elClass.trim();
    },

    /**
     * ## attachAttribute
     *
     * attached data attributes and others (seperately)
     *
     * @param {DOMElement} _el element to assign attributes
     * @param {Object} _elObj contains the attributes to attach
     *
     * @return _Void_
     */
    attachAttributes: function attachAttributes(_el, _elObj) {
        for (var att in _elObj) {
            if (att.indexOf('data-') !== -1) {
                _el.setAttribute(att, _elObj[att]);
            } else {
                _el[att] = _elObj[att];
            }
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
     *
     * @return {Class} modified class object
     */
    extendClass: function extendClass(_extend) {
        _extend = _extend.prototype;

        var merge = function merge(obj) {
            for (var prop in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                    _extend[prop] = obj[prop];
                }
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
    getElWidth: function getElWidth(el) {
        var style = getComputedStyle(el);

        if (el.offsetWidth === 0) {
            if (this.__checkWidthAgain !== true) {
                setTimeout(this.setTextMultiTagIndent.bind(this), 1500);
                this.__checkWidthAgain === true;
            }
        } else {
            this.__checkWidthAgain !== false;
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

    /**
     * hideElement
     *
     * hides an element offscreen
     *
     * @param {Object} el element to hide
     *
     * @return _Void_
     */
    hideElement: function hideElement(el) {
        this.addClass(el, _classes2['default'].HIDDEN);
    },

    http: {},

    /**
     * ## iosVersion
     *
     * checks and returns the ios version
     *
     * @return _Void_:
     */
    iosVersion: function iosVersion() {

        if (/iPad|iPhone|iPod/.test(navigator.platform)) {
            if (!!window.indexedDB) {
                return '8+';
            }
            if (!!window.SpeechSynthesisUtterance) {
                return '7';
            }
            if (!!window.webkitAudioContext) {
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
        nativeSlice.call(target.children).forEach(function (el) {
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
        var baseClass = el.className;
        var baseClassLength = baseClass.length;
        var classLength = _class.length;

        if (baseClass.slice(0, classLength + 1) === _class + ' ') {
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
        var parent = element.parentNode.parentNode;
        var elHeight = element.offsetHeight;
        var min = parent.scrollTop;
        var max = parent.scrollTop + parent.offsetHeight - element.offsetHeight;
        var pos = element.offsetTop;

        if (pos < min) {
            parent.scrollTop = pos - elHeight * 0.5;
        } else if (pos > max) {
            parent.scrollTop = pos - parent.offsetHeight + elHeight * 1.5;
        }
    },

    /**
     * ## setPlatform
     *
     * sets the platform to osx or not osx for the sake of the multi select key
     *
     * @return _Void_
     */
    setPlatform: function setPlatform() {
        var _osx = this.isOsx = window.navigator.platform.indexOf('Mac') === -1 ? false : true;

        this.isIos = this.iosVersion();
        this.multiSelect = _osx ? 'metaKey' : 'ctrlKey';
    },

    /**
     * ## showElement
     *
     * remove classes.HIDDEN from a given element
     *
     * @param {Object} _el element to show
     *
     * @return _Void_
     */
    showElement: function showElement(_el) {
        this.removeClass(_el, _classes2['default'].HIDDEN);
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
        var _addClass = utils.addClass;
        var _removeClass = utils.removeClass;

        if (utils.hasClass(_el, _class)) {
            _removeClass(_el, _class);
        } else {
            _addClass(_el, _class);
        }
    }
};

(0, _microbejsSrcModulesHttp2['default'])(utils);

exports['default'] = utils;
module.exports = exports['default'];

},{"./classes":14,"microbejs/src/modules/http":1}],20:[function(require,module,exports){
'use strict';

module.exports = '0.5.0';

},{}],21:[function(require,module,exports){

/* jshint globalstrict: true */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _srcCoreFlounderJsx = require('../src/core/flounder.jsx');

var _srcCoreFlounderJsx2 = _interopRequireDefault(_srcCoreFlounderJsx);

var _srcCoreUtils = require('../src/core/utils');

var _srcCoreUtils2 = _interopRequireDefault(_srcCoreUtils);

var _unitConstructorTest = require('./unit/constructorTest');

var _unitConstructorTest2 = _interopRequireDefault(_unitConstructorTest);

var _unitFlounderTest = require('./unit/flounderTest');

var _unitFlounderTest2 = _interopRequireDefault(_unitFlounderTest);

var nativeSlice = Array.prototype.slice;

var Tests = function Tests() {
    _classCallCheck(this, Tests);

    window.Flounder = _srcCoreFlounderJsx2['default'];

    return this;
};

;

_srcCoreUtils2['default'].extendClass(Tests, _srcCoreUtils2['default']);
var tests = new Tests();

(0, _unitConstructorTest2['default'])(_srcCoreFlounderJsx2['default']);
(0, _unitFlounderTest2['default'])(_srcCoreFlounderJsx2['default']);

exports['default'] = tests;
module.exports = exports['default'];

},{"../src/core/flounder.jsx":17,"../src/core/utils":19,"./unit/constructorTest":22,"./unit/flounderTest":23}],22:[function(require,module,exports){
/* global document, window, µ, $, QUnit, Benchmark, buildTest  */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var tests = function tests(Flounder) {
    QUnit.module('Flounder constructor');

    /*
     * constructor tests
     *
     * @test    constructor exists
     * @test    constructor returns constructor with no args
     */
    QUnit.test('Flounder', function (assert) {
        assert.ok(Flounder, 'Flounder Exists');
        var flounder = new Flounder();

        assert.deepEqual(Flounder, flounder, 'empty returns a new constructor');

        var flounders = new Flounder([document.body]);
        assert.ok(Array.isArray(flounders), 'multiple targets returns an array');
        assert.ok(flounders[0] instanceof Flounder, 'of flounders');
        flounders[0].destroy();

        flounder = new Flounder(document.body);
        assert.ok(flounder instanceof Flounder, 'a single target makes a flounder');
        flounder.destroy();

        flounder = new Flounder(document.body);

        var ref = flounder.refs.flounder.flounder instanceof Flounder;
        var oTarget = flounder.originalTarget.flounder instanceof Flounder;
        var target = flounder.target.flounder instanceof Flounder;

        assert.ok(ref === true && oTarget === true && target === true, 'creates all refs');
        flounder.destroy();
        ref = flounder.refs.flounder.flounder instanceof Flounder;
        oTarget = flounder.originalTarget.flounder instanceof Flounder;
        target = flounder.target.flounder instanceof Flounder;

        assert.ok(!ref && !oTarget && !target, 'and removes them all');
    });
};

exports['default'] = tests;
module.exports = exports['default'];

},{}],23:[function(require,module,exports){
/* global document, window, QUnit, Benchmark, buildTest  */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _srcCoreClassesJs = require('../../src/core/classes.js');

var _srcCoreClassesJs2 = _interopRequireDefault(_srcCoreClassesJs);

var tests = function tests(Flounder) {
    QUnit.module('flounder.jsx');

    /*
     * ## arrayOfFlounders tests
     *
     * @test exists
     * @test multiple targets returns an array
     * @test of flounders
     */
    QUnit.test('arrayOfFlounders', function (assert) {
        var flounder = new Flounder(document.body);
        assert.ok(flounder.arrayOfFlounders, 'exists');

        var flounders = flounder.arrayOfFlounders([document.body], flounder.props);
        assert.ok(Array.isArray(flounders), 'multiple targets returns an array');
        assert.ok(flounders[0] instanceof Flounder, 'of flounders');

        flounders.forEach(function (el) {
            el.destroy();
        });
    });

    /*
     * ## componentWillUnmount tests
     *
     * @test exists
     * @test events are removed
     */
    QUnit.test('componentWillUnmount', function (assert) {
        var flounder = new Flounder(document.body);
        assert.ok(flounder.componentWillUnmount, 'exists');

        var refs = flounder.refs;
        refs.selected.click();

        var firstCheck = refs.wrapper.className.indexOf('open');
        flounder.componentWillUnmount();
        refs.selected.click();

        var secondCheck = refs.wrapper.className.indexOf('open');
        flounder.destroy();

        assert.ok(firstCheck === secondCheck, 'events are removed');
    });

    /*
     * ## displayMultipleTags tests
     *
     * @test exists
     * @test tags are created for all clicks
     * @test close events are properly bound
     */
    QUnit.test('displayMultipleTags', function (assert) {
        var data = ['doge', 'moon'];

        var flounder = new Flounder(document.body, { multiple: true, multipleTags: true, data: data });

        assert.ok(flounder.displayMultipleTags, 'exists');

        var refsData = flounder.refs.data;
        refsData[1].click();
        refsData[2].click();

        assert.equal(document.querySelectorAll('.flounder__multiple--select--tag').length, 2, 'tags are created for all clicks');

        var closeDivs = document.querySelectorAll('.flounder__multiple__tag__close');
        closeDivs = Array.prototype.slice.call(closeDivs);
        closeDivs.forEach(function (el) {
            el.click();
        });
        assert.equal(document.querySelectorAll('.flounder__multiple--select--tag').length, 0, 'close events are properly bound');

        flounder.destroy();
    });

    /*
     * ## displaySelected tests
     *
     * @test exists
     * @test the correct thing is displayed
     */
    QUnit.test('displaySelected', function (assert) {
        var data = ['doge', 'moon'];

        var flounder = new Flounder(document.body, { data: data, defaultIndex: 0 });

        assert.ok(flounder.displaySelected, 'exists');
        flounder.setByIndex(1);

        assert.equal(flounder.refs.selected.textContent, flounder.refs.data[1].textContent, 'The correct thing is displayed');

        flounder.destroy();
    });

    /*
     * ## fuzzySearch tests
     *
     * @test exists
     * @test correctly filters data elements
     */
    QUnit.test('fuzzySearch', function (assert) {
        var data = ['doge', 'moon'];

        var flounder = new Flounder(document.body, { data: data, defaultIndex: 0, search: true });

        assert.ok(flounder.fuzzySearch, 'exists');

        var flounderRefs = flounder.refs;

        flounderRefs.search.click();
        flounder.fuzzySearch({ keyCode: 77,
            preventDefault: function preventDefault(e) {
                return e;
            },
            target: { value: 'm  ' }
        });

        var hiddenOptions = flounderRefs.optionsListWrapper.querySelectorAll('.' + _srcCoreClassesJs2['default'].SEARCH_HIDDEN);

        assert.deepEqual(hiddenOptions[0], flounderRefs.data[0], 'correctly filters data elements');
        flounder.destroy();
    });

    /*
     * ## fuzzySearchReset tests
     *
     * @test exists
     * @test correctly resets search filtered elements
     */
    QUnit.test('fuzzySearchReset', function (assert) {
        var data = ['doge', 'moon'];

        var flounder = new Flounder(document.body, { data: data, defaultIndex: 0, search: true });

        assert.ok(flounder.fuzzySearchReset, 'exists');

        var flounderRefs = flounder.refs;

        flounderRefs.search.click();
        flounder.fuzzySearch({ keyCode: 77,
            preventDefault: function preventDefault(e) {
                return e;
            },
            target: { value: 'm  ' }
        });
        flounder.fuzzySearchReset();
        var hiddenOptions = flounderRefs.optionsListWrapper.querySelectorAll('.' + _srcCoreClassesJs2['default'].SEARCH_HIDDEN);

        assert.equal(flounderRefs.search.value, '', 'correctly blanks the search input');
        assert.equal(hiddenOptions.length, 0, 'correctly resets search filtered elements');
        flounder.destroy();
    });
};

exports['default'] = tests;
module.exports = exports['default'];

},{"../../src/core/classes.js":14}]},{},[21]);
