/* globals global require, document */
const jsdom                 = require( 'jsdom' );

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
