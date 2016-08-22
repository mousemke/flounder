
import utils        from '/core/utils';
import µ            from 'microbejs/dist/microbe.http';

import assert       from 'assert';
import sinon        from 'sinon';


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
describe( 'addClass', () =>
{
    let body = document.body;

    it( 'should exist', () =>
    {
        utils.removeClass( body, [ 'brains', 'moon', 'doge' ] );
        assert.ok( utils.addClass, 'exists' );
    } );


    it( 'should add as many classes passed to it without adding anything twice', () =>
    {
        utils.addClass( body, [ 'moon', 'doge' ] );
        assert.equal( body.className, 'moon  doge', 'adds an array of classes' );

        utils.addClass( body, 'brains' );
        assert.equal( body.className, 'moon  doge  brains', 'adds a single class' );

        utils.addClass( body, 'brains' );
        assert.equal( body.className, 'moon  doge  brains', 'only adds a class once' );
    } );
} );


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
describe( 'attachAttributes', () =>
{
    let body = document.body;

    it( 'should exist', () =>
    {
        assert.ok( utils.attachAttributes, 'exists' );
    } );


    it( 'should attach data attributes', () =>
    {
        utils.attachAttributes( body, { 'data-moon' : 'doge' } );
        assert.equal( body.getAttribute( 'data-moon' ), 'doge', 'adds a data-attribute' );
    } );


    it( 'should not do anything if the object is non existant', () =>
    {
        assert.equal( utils.attachAttributes( body ), null );
    } );


    it( 'should attach properties', () =>
    {
        utils.attachAttributes( body, { 'moon' : 'doge' } );
        assert.equal( body.moon, 'doge', 'adds a property' );

        utils.attachAttributes( body, { 'data-moon' : 'moon', moon : 'maymay' } );
        assert.ok( body.getAttribute( 'data-moon' ) === 'moon' && body.moon === 'maymay', 'adds multiple attributes' );
    } );
} );


/**
 * ## constructElement
 *
 * @param {Object} _elObj object carrying properties to transfer
 *
 * @return _Element_
 */
describe( 'constructElement', () =>
{
    let newEl;

    it( 'should exist', () =>
    {
        assert.ok( utils.constructElement, 'exists' );
    } );


    it( 'should add return an element', () =>
    {
        newEl = utils.constructElement( {} );
        assert.equal( newEl.nodeType, 1, 'creates an element' );
    } );


    it( 'should add data attributes and properties where appropriate', () =>
    {
        newEl = utils.constructElement( { 'data-moon' : 'moon', moon : 'maymay' } );

        assert.equal( newEl.getAttribute( 'data-moon' ), 'moon', 'adds a data-attribute' );
        assert.equal( newEl.moon, 'maymay', 'adds a property' );
    } );
} );


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
describe( 'extendClass', () =>
{
    class Test
    {
        constructor( props )
        {
        }
    }

    it( 'should exist', () =>
    {
        assert.ok( utils.extendClass, 'exists' );
    } );


    it( 'should extend as many complex objects as passed to it', () =>
    {
        utils.extendClass( Test, { moon: 'doge' } );

        let test = new Test;
        assert.equal( test.moon, 'doge', 'extends a class with a property' );
        let func = function(){ return 'doge'; };

        utils.extendClass( Test, { m : func } );
        assert.equal( test.m, func, 'extends a class with a function' );

        utils.extendClass( Test, { a: 1 }, { b: 2 }, { c: 3 } );
        assert.ok( test.a === 1 && test.b === 2 && test.c === 3, 'adds a multiple objects' );
    } );
} );


/**
 * ## escapeHTML
 *
 * Escapes HTML in order to put correct elements in the DOM
 *
 * @param {String} string unescaped string
 *
 * @return _Void_
 */
describe( 'escapeHTML', () =>
{
    it( 'should exist', () =>
    {
        assert.ok( utils.escapeHTML, 'exists' );
    } );


    it( 'should properly escape html strings', () =>
    {
        let html = '<div id="qunit-fixture"></div>';

        let escaped = utils.escapeHTML( html );
        assert.equal( escaped, '&lt;div id=&quot;qunit-fixture&quot;&gt;&lt;/div&gt;', 'escapes an html string' );
    } );
} );


/**
 * ## getElWidth
 *
 * gets the width adjusted for margins
 *
 * @param {DOMElement} el target element
 *
 * @return _Integer_ adjusted width
 */
describe( 'getElWidth', () =>
{
    it( 'should exist', () =>
    {
        assert.ok( utils.getElWidth, 'exists' );
    } );


    it( 'should correctly grab an element\'s width', () =>
    {
        let body            = document.body;

        body.offsetWidth    = 0;
        assert.throws( utils.getElWidth.bind( utils, body ), 'Flounder getElWidth error: no callback given' );
        utils.getElWidth( body, ()=>{}, utils );

        body.offsetWidth    = 1000;
        let bodyWidth       = utils.getElWidth( body, ()=>{}, utils, 200 );
        let style           = window.getComputedStyle( body );

        let vanillaBodyWidth = body.offsetWidth + parseInt( style[ 'margin-left' ] ) +
                                parseInt( style[ 'margin-right' ] );

        assert.equal( bodyWidth, vanillaBodyWidth, 'correctly grabs an element\'s width' );
    } );
} );


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
describe( 'hasClass', () =>
{
    it( 'should exist', () =>
    {
        assert.ok( utils.hasClass, 'exists' );
    } );


    it( 'should correctly detect classes', () =>
    {
        let body        = document.body;

        utils.addClass( body, 'mooney-moon' );
        let hasClassBool = utils.hasClass( body, 'mooney-moon' );
        assert.equal( hasClassBool, true, 'correctly detects present class' );

        utils.removeClass( body, 'mooney-moon' );
        hasClassBool = utils.hasClass( body, 'mooney-moon' );
        assert.equal( hasClassBool, false, 'correctly detects missing class' );
    } );
} );


/**
 * ## iosVersion
 *
 * checks and returns the ios version
 *
 * @param {Object} windowObj window, but allows for as testing override
 *
 * @return _Void_
 */
describe( 'iosVersion', () =>
{
    it( 'should exist', () =>
    {
        assert.ok( utils.iosVersion, 'exists' );
    } );

    it( 'shouldn\'t register mocha tests as an ios device', () =>
    {
        assert.equal( utils.iosVersion(), false );
    } );


    it( 'should register as various ios devices with the right params', () =>
    {
        assert.equal( utils.iosVersion( { navigator: { platform : 'iPad' } } ), '5-' );
        assert.equal( utils.iosVersion( { indexedDB : true, navigator: { platform : 'iPad' } } ), '8+' );
        assert.equal( utils.iosVersion( { SpeechSynthesisUtterance: true, navigator: { platform : 'iPad' } } ), '7' );
        assert.equal( utils.iosVersion( { webkitAudioContext: true, navigator: { platform : 'iPad' } } ), '6' );
    } );
} );


/**
 * ## removeAllChildren
 *
 * removes all children from a specified target
 *
 * @param {DOMElement} target target element
 *
 * @return _Void_
 */
describe( 'removeAllChildren', () =>
{
    it( 'should exist', () =>
    {
        assert.ok( utils.removeAllChildren, 'exists' );
    } );


    it( 'should remove all child elements from an element passed to it', () =>
    {
        let body        = document.body;
        let testDiv     = document.createElement( 'DIV' );
        body.appendChild( testDiv );

        let div;
        for ( var i = 0, lenI = 10; i < lenI; i++ )
        {
            div = document.createElement( 'DIV' );
            testDiv.appendChild( div );
        }

        utils.removeAllChildren( testDiv );
        assert.equal( testDiv.children.length, 0, 'all children removed' );
        body.removeChild( testDiv );
    } );
} );


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
describe( 'removeClass', () =>
{
    it( 'should exist', () =>
    {
        assert.ok( utils.removeClass, 'exists' );
    } );


    it( 'should remove the correct classes', () =>
    {
        window.utils = utils;
        let body = document.querySelector( 'body' );

        utils.addClass( body, [ 'brains', 'moon', 'doge' ] );
        utils.removeClass( body, [ 'moon', 'doge' ] );
        assert.ok( body.className.indexOf( 'moon' ) === -1 && body.className.indexOf( 'doge' ) === -1, 'removes an array of classes' );

        utils.removeClass( body, 'brains' );
        assert.equal( body.className.indexOf( 'brains' ), -1, 'removes a single class' );

        utils.addClass( body, [ 'brains', 'moon', 'doge' ] );
        utils.removeClass( body, 'moon' );
        assert.equal( body.className.indexOf( 'moon' ), -1, 'removes a middle class' );
    } );
} );


 /**
 * ## scrollTo
 *
 * checks if an option is visible and, if it is not, scrolls it into view
 *
 * @param {DOMElement} element element to check
 *
 * @return _Void_
 */
describe( 'scrollTo', () =>
{
    it( 'should check the bounds and either scroll up or down', () =>
    {
        let element = {
            offsetHeight: 10,
            offsetTop   : 150,
            parentNode: {
                parentNode: {
                    scrollTop   : 7,
                    offsetHeight: 100
                }
            }
        };

        utils.scrollTo( element );
        assert.equal( element.parentNode.parentNode.scrollTop, 65 );

        element.offsetTop = 5;
        utils.scrollTo( element );
        assert.equal( element.parentNode.parentNode.scrollTop, 0 );
    } );


    it( 'should ignore everything if the element doesnt exist', () =>
    {
        let element = null;

        let res = utils.scrollTo( element );
        assert.equal( res, false );
    } );
} );



/**
 * ## setPlatform
 *
 * sets the platform to osx or not osx for the sake of the multi select key
 *
 * @param {Object} windowObj window, but allows for as testing override
 *
 * @return _Void_
 */
describe( 'setPlatform', () =>
{
    it( 'should exist', () =>
    {
        assert.ok( utils.setPlatform, 'exists' );
    } );


    it( 'should be able to determine the platform conditions', () =>
    {
        assert.equal( utils.setPlatform( { navigator : { platform: 'Mac' } } ).isOsx, true );
        assert.equal( utils.setPlatform( { navigator : { platform: 'Linux' } } ).isOsx, false );
        assert.equal( utils.setPlatform( { navigator : { platform: 'Linux - iPad' } } ).isIos, '5-' );
        assert.equal( utils.setPlatform( { navigator : { platform: 'Linux - Android' } } ).isIos, false );
        assert.equal( utils.setPlatform( { navigator : { platform: 'Mac' } } ).multiSelect, 'metaKey' );
        assert.equal( utils.setPlatform( { navigator : { platform: 'Linux' } } ).multiSelect, 'ctrlKey' );
    } );
} );


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
describe( 'toggleClass', () =>
{
    it( 'should exist', () =>
    {
        assert.ok( utils.toggleClass, 'exists' );
    } );

    let select = document.querySelector( 'SELECT' );
    utils.removeClass( select, 'doge' );

    it( 'should add classes when necessary', () =>
    {
        utils.toggleClass( select, 'doge' );
        assert.equal( utils.hasClass( select, 'doge' ), true, 'adds a class' );
    } );


    it( 'should remove classes when necessary', () =>
    {
        utils.toggleClass( select, 'doge' );
        assert.equal( utils.hasClass( select, 'doge' ), false, 'removes a class' );
    } );
} );
