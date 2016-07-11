
import utils    from '/core/utils';

import assert   from 'assert';
import sinon    from 'sinon';


/*
 * ## addClass tests
 *
 * @test exists
 * @test should add as many classes passed to it without adding anything twice
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


/*
 * ## attachAttributes tests
 *
 * @test exists
 * @test should attach data attributes
 * @test should not do anything if the object is non existant
 * @test should attach properties
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


/*
 * ## constructElement tests
 *
 * @test exists
 * @test should add return an element
 * @test should add data attributes and properties where appropriate
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


/*
 * ## extendClass tests
 *
 * @test exists
 * @test should extend as many complex objects as passed to it
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


/*
 * ## escapeHTML tests
 *
 * @test exists
 * @test should properly escape html strings
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


/*
 * ## getElWidth tests
 *
 * @test exists
 * @test correctly grabs an element's width
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


/*
 * ## hasClass tests
 *
 * @test exists
 * @test should correctly detect classe
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


/*
 * ## http tests
 *
 * @test exists
 */
describe( 'http', () =>
{
    // assert.ok( utils.http, 'exists' );

    // var getTest      = assert.async();
    // utils.http( { url: './httpTest.html', method: 'GET' } ).then( function( data )
    // {
    //     assert.equal( data, 'moon', 'page correctly retrieved' );
    //     getTest();
    // } );

    // var parameterTest      = assert.async();
    // utils.http( {
    //             url         : './httpTest.html',
    //             method      : 'GET',
    //             headers     : {
    //                 Accept      : 'text/plain'
    //             },
    //             async       : true
    //         }
    // ).then( function( data )
    // {
    //     assert.equal( data, 'moon', 'parameters are recieved correctly' );
    //     parameterTest();
    // } );

    // var errorTest      = assert.async();
    // utils.http( { url : './httpTest.hml' }
    // ).catch( function( e )
    // {
    //     e = ( e instanceof Error );
    //     assert.equal( e, true, 'errors are handled correctly' );
    //     errorTest();
    // } );
} );


/*
 * ## iosVersion tests
 *
 * @test exists
 * @test shouldn\'t register mocha tests as an ios device
 * @test should register as various ios devices with the right params
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


/*
 * ## removeAllChildren tests
 *
 * @test exists
 * @test should remove all child elements from an element passed to it
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


/*
 * ## removeClass tests
 *
 * @test exists
 * @test should remove the correct classes
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


/*
 * ## scrollTo tests
 *
 * @test exists
 * @test should check the bounds and either scroll up or down
 */
describe( 'scrollTo', () =>
{
    it( 'should exist', () =>
    {
        assert.ok( utils.scrollTo, 'exists' );
    } );


    it( 'should check the bounds and either scroll up or down', () =>
    {
        let element = {
            offsetHeight: 10,
            offsetTop   : 150,
            parentNode: {
                parentNode: {
                    scrollTop   : 0,
                    offsetHeight: 100
                }
            }
        };

        utils.scrollTo( element );
        assert.equal( element.parentNode.parentNode.scrollTop, 65 );

        element.offsetTop = 10;
        assert.equal( element.parentNode.parentNode.scrollTop, 65 );
    } );
} );


/*
 * ## setPlatform tests
 *
 * @test exists
 * @test should be able to determine the platform conditions
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


/*
 * ## toggleClass tests
 *
 * @test exists
 * @test should add classes when necessary
 * @test should remove classes when necessary
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
