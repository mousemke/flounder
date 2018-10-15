/*
 * Copyright (c) 2016 dunnhumby Germany GmbH.
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the LICENSE file
 * in the root directory of this source tree.
 *
 */

/* globals global require, document */
const jsdom                 = require( 'jsdom' );
require( 'isomorphic-fetch' );

global.document             = jsdom.jsdom( `
    <!doctype html>
    <html>
        <body>
            <input></input>
            <select></select>
            <div></div>
            <div></div>
        </body>
    </html>` );
global.window               = document.defaultView;
global.navigator            = {
    userAgent : 'node.js'
};
