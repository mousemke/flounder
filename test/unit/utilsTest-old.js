/* global document, QUnit  */

let tests = function( Flounder, utils )
{
    QUnit.module( 'utils.js' );


    /*
     * ## addClass tests
     *
     * @test exists
     * @test adds an array of classes
     * @test adds a single class
     * @test only adds a class once
     */
    QUnit.test( 'addClass', function( assert )
    {
        let body = document.body;
        utils.removeClass( body, [ 'brains', 'moon', 'doge' ] );
        assert.ok( utils.addClass, 'exists' );

        utils.addClass( body, [ 'moon', 'doge' ] );
        assert.equal( body.className, 'moon  doge', 'adds an array of classes' );

        utils.addClass( body, 'brains' );
        assert.equal( body.className, 'moon  doge  brains', 'adds a single class' );

        utils.addClass( body, 'brains' );
        assert.equal( body.className, 'moon  doge  brains', 'only adds a class once' );
    } );


    /*
     * ## attachAttributes tests
     *
     * @test exists
     * @test adds a data-attribute
     * @test adds a property
     * @test adds multiple attributes
     */
    QUnit.test( 'attachAttributes', function( assert )
    {
        let body = document.body;
        assert.ok( utils.attachAttributes, 'exists' );

        utils.attachAttributes( body, { 'data-moon' : 'doge' } );
        assert.equal( body.getAttribute( 'data-moon' ), 'doge', 'adds a data-attribute' );

        utils.attachAttributes( body, { 'moon' : 'doge' } );
        assert.equal( body.moon, 'doge', 'adds a property' );

        utils.attachAttributes( body, { 'data-moon' : 'moon', moon : 'maymay' } );
        assert.ok( body.getAttribute( 'data-moon' ) === 'moon' && body.moon === 'maymay', 'adds multiple attributes' );
    } );


    /*
     * ## constructElement tests
     *
     * @test exists
     * @test creates an element
     * @test adds a data-attribute
     * @test adds a property
     */
    QUnit.test( 'constructElement', function( assert )
    {
        let newEl;

        assert.ok( utils.constructElement, 'exists' );

        newEl = utils.constructElement( {} );
        assert.equal( newEl.nodeType, 1, 'creates an element' );

        newEl = utils.constructElement( { 'data-moon' : 'moon', moon : 'maymay' } );

        assert.equal( newEl.getAttribute( 'data-moon' ), 'moon', 'adds a data-attribute' );
        assert.equal( newEl.moon, 'maymay', 'adds a property' );
    } );


    /*
     * ## extendClass tests
     *
     * @test exists
     * @test extends a class with a property
     * @test extends a class with a function
     * @test adds a multiple objects
     */
    QUnit.test( 'extendClass', function( assert )
    {
        class Test
        {
            constructor( props )
            {
            }
        }

        assert.ok( utils.extendClass, 'exists' );

        utils.extendClass( Test, { moon: 'doge' } );

        let test = new Test;
        assert.equal( test.moon, 'doge', 'extends a class with a property' );
        let func = function(){ return 'doge'; };

        utils.extendClass( Test, { m : func } );
        assert.equal( test.m, func, 'extends a class with a function' );

        utils.extendClass( Test, { a: 1 }, { b: 2 }, { c: 3 } );
        assert.ok( test.a === 1 && test.b === 2 && test.c === 3, 'adds a multiple objects' );
    } );


    /*
     * ## escapeHTML tests
     *
     * @test exists
     * @test escapes an html string
     */
    QUnit.test( 'escapeHTML', function( assert )
    {
        assert.ok( utils.escapeHTML, 'exists' );

        let html = '<div id="qunit-fixture"></div>';

        let escaped = utils.escapeHTML( html );
        assert.equal( escaped, '&lt;div id=&quot;qunit-fixture&quot;&gt;&lt;/div&gt;', 'escapes an html string' );
    } );


    /*
     * ## getElWidth tests
     *
     * @test exists
     * @test correctly grabs an element's width
     */
    QUnit.test( 'getElWidth', function( assert )
    {
        assert.ok( utils.getElWidth, 'exists' );

        let body        = document.body;
        let bodyWidth   = utils.getElWidth( body );
        let style       = getComputedStyle( body );

        let vanillaBodyWidth = body.offsetWidth + parseInt( style[ 'margin-left' ] ) +
                                parseInt( style[ 'margin-right' ] );

        assert.equal( bodyWidth, vanillaBodyWidth, 'correctly grabs an element\'s width' );
    } );


    /*
     * ## hasClass tests
     *
     * @test exists
     * @test correctly grabs an element's width
     */
    QUnit.test( 'hasClass', function( assert )
    {
        assert.ok( utils.hasClass, 'exists' );

        let body        = document.body;

        utils.addClass( body, 'mooney-moon' );
        let hasClassBool = utils.hasClass( body, 'mooney-moon' );
        assert.equal( hasClassBool, true, 'correctly detects present class' );

        utils.removeClass( body, 'mooney-moon' );
        hasClassBool = utils.hasClass( body, 'mooney-moon' );
        assert.equal( hasClassBool, false, 'correctly detects missing class' );
    } );


    /*
     * ## http tests
     *
     * @test exists
     */
    QUnit.test( 'http', function( assert )
    {
        assert.ok( utils.http, 'exists' );

        var getTest      = assert.async();
        utils.http( { url: './httpTest.html', method: 'GET' } ).then( function( data )
        {
            assert.equal( data, 'moon', 'page correctly retrieved' );
            getTest();
        } );

        var parameterTest      = assert.async();
        utils.http( {
                    url         : './httpTest.html',
                    method      : 'GET',
                    headers     : {
                        Accept      : 'text/plain'
                    },
                    async       : true
                }
        ).then( function( data )
        {
            assert.equal( data, 'moon', 'parameters are recieved correctly' );
            parameterTest();
        } );

        var errorTest      = assert.async();
        utils.http( { url : './httpTest.hml' }
        ).catch( function( e )
        {
            e = ( e instanceof Error );
            assert.equal( e, true, 'errors are handled correctly' );
            errorTest();
        } );
    } );


    /*
     * ## iosVersion tests
     *
     * @test exists
     */
    QUnit.test( 'iosVersion', function( assert )
    {
        assert.ok( utils.iosVersion, 'exists' );
    } );


    /*
     * ## removeAllChildren tests
     *
     * @test exists
     * @test all children removed
     */
    QUnit.test( 'removeAllChildren', function( assert )
    {
        assert.ok( utils.removeAllChildren, 'exists' );

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


    /*
     * ## removeClass tests
     *
     * @test exists
     * @test removes an array of classes
     * @test removes a single class
     */
    QUnit.test( 'removeClass', function( assert )
    {
        window.utils = utils;
        let qunit = document.querySelector( '#qunit' );

        assert.ok( utils.removeClass, 'exists' );

        utils.addClass( qunit, [ 'brains', 'moon', 'doge' ] );
        utils.removeClass( qunit, [ 'moon', 'doge' ] );
        assert.ok( qunit.className.indexOf( 'moon' ) === -1 && qunit.className.indexOf( 'doge' ) === -1, 'removes an array of classes' );

        utils.removeClass( qunit, 'brains' );
        assert.equal( qunit.className.indexOf( 'brains' ), -1, 'removes a single class' );
    } );


    /*
     * ## scrollTo tests
     *
     * @test exists
     */
    QUnit.test( 'scrollTo', function( assert )
    {
        assert.ok( utils.scrollTo, 'exists' );
    } );


    /*
     * ## setPlatform tests
     *
     * @test exists
     */
    QUnit.test( 'setPlatform', function( assert )
    {
        assert.ok( utils.setPlatform, 'exists' );
    } );


    /*
     * ## toggleClass tests
     *
     * @test exists
     * @test adds a class
     * @test removes a class
     */
    QUnit.test( 'toggleClass', function( assert )
    {
        let body = document.body;
        utils.removeClass( body, 'doge' );

        assert.ok( utils.toggleClass, 'exists' );

        utils.toggleClass( body, 'doge' );
        assert.equal( utils.hasClass( body, 'doge' ), true, 'adds a class' );

        utils.toggleClass( body, 'doge' );
        assert.equal( utils.hasClass( body, 'doge' ), false, 'removes a class' );
    } );
};

export default tests;
