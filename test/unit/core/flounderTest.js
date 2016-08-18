
import assert   from 'assert';
import sinon    from 'sinon';

import Flounder from '/core/flounder';
import version  from '/core/version';
import classes  from '/core/classes';
import keycodes from '/core/keycodes';
import utils    from '/core/utils';
import Sole     from '/core/search';


/**
 * ## componentWillUnmount
 *
 * on unmount, removes events
 *
 * @return _Void_
 */
describe( 'componentWillUnmount', () =>
{
    let flounder    = new Flounder( document.body );

    it( 'should exist', () =>
    {
        assert.ok( flounder.componentWillUnmount, 'exists' );
    } );


    flounder.originalChildren       = true;
    let popInSelectElementsSpy      = sinon.stub( flounder, 'popInSelectElements', () => {} );

    flounder.componentWillUnmount();
    flounder.originalChildren       = false;

    it( 'should be able to pop in the original children ', () =>
    {
        assert.ok( popInSelectElementsSpy.callCount === 1 );
    } );



    it( 'should remove event listeners', () =>
    {
        flounder                = new Flounder( document.body );
        let removeListenersSpy  = sinon.spy( flounder, 'removeListeners' );

        let refs        = flounder.refs;
        refs.selected.click();

        let firstCheck = refs.wrapper.className.indexOf( 'open' );
        flounder.componentWillUnmount();
        refs.selected.click();

        let secondCheck = refs.wrapper.className.indexOf( 'open' );

        assert.equal( firstCheck, secondCheck, 'events are removed' );
        assert.equal( removeListenersSpy.callCount, 1 );
    } );



    it( 'should run this.onComponentWillUnmount()', () =>
    {
        flounder                = new Flounder( document.body );
        let onComponentWillUnmountSpy   = sinon.stub( flounder, 'onComponentWillUnmount', () => {} );

        flounder.componentWillUnmount();
        assert.equal( onComponentWillUnmountSpy.callCount, 1 );
        flounder.onComponentWillUnmount.restore();

        onComponentWillUnmountSpy   = sinon.stub( flounder, 'onComponentWillUnmount', () => { a + b } );

        let consoleSpy = sinon.stub( console, 'warn', () => {} );
        flounder.componentWillUnmount();
        assert.equal( consoleSpy.callCount, 1 );

        flounder.onComponentWillUnmount.restore();
        console.warn.restore();
    } );
} );


/**
 * ## constructor
 *
 * filters and sets up the main init
 *
 * @param {DOMElement, String, Array} target flounder mount point
 * @param {Object} props passed options
 *
 * @return _Object_ new flounder object
 */
describe( 'constructor', () =>
{
    let flounder;

    it( 'should exist', () =>
    {
        assert.ok( Flounder );
    } );



    it( 'shouldn\'t run if there is no target', () =>
    {
        let consoleSpy  = sinon.stub( console, 'warn', () => {} );
        flounder        = new Flounder();

        assert.equal( consoleSpy.callCount, 1 );
        console.warn.restore();

        assert.throws( () => new Flounder( 'moon' ), 'Flounder - No target element found.' );
    } );



    it( 'should make a single flounder from a target(s)', () =>
    {
        flounder = new Flounder( 'select' );
        assert.ok( flounder instanceof Flounder, 'a single target makes a flounder' );


        let consoleSpy  = sinon.stub( console, 'warn', () => {} );
        flounder        = new Flounder( 'div' );
        assert.equal( consoleSpy.callCount, 1 );

        console.warn.restore();
    } );



    it( 'should destroy any previously added flounder on the same element', () =>
    {
        let flounderBackup  = document.body.flounder;
        let flounder        = new Flounder( 'body' );
        assert.notDeepEqual( flounder, flounderBackup );
    } );
});


/**
 * ## filterSearchResults
 *
 * filters results and adjusts the search hidden class on the dataOptions
 *
 * @param {Object} e event object
 *
 * @return _Void_
 */
describe( 'filterSearchResults', () =>
{
    let flounder        = new Flounder( 'div', { data: [ 'a', 'b', 'c' ], search: true } );

    it( 'should find all matching field and unhide them', () =>
    {
        let e               = { target: { value: 'a' } };
        flounder.filterSearchResults( e );

        assert.equal( flounder.refs.wrapper.querySelectorAll( `.${classes.SEARCH_HIDDEN}` ).length, 2 );
    } );



    it( 'should reset the field if there in nothing in the input', () =>
    {
        let e               = { target: { value: '' } };
        let searchResetSpy  = sinon.stub( flounder, 'fuzzySearchReset', () => {} );

        flounder.filterSearchResults( e );

        assert.equal( flounder.fuzzySearchReset.callCount, 1 );
        flounder.fuzzySearchReset.restore();
    } );
} );


/**
 * ## fuzzySearch
 *
 * filters events to determine the correct actions, based on events from the search box
 *
 * @param {Object} e event object
 *
 * @return _Void_
 */
describe( 'fuzzySearch', () =>
{
    let data = [
        'doge',
        'moon',
        'such'
    ];

    let flounder    = new Flounder( document.body, {
                                                        multipleTags    : true,
                                                        data            : data,
                                                        defaultIndex    : 0,
                                                        search          : true
                                                    } );
    let e = {
                keyCode : 77,
                preventDefault : e => e,
                target  : { value : 'm  ' }
            };


    it( 'should exist', () =>
    {
        assert.ok( flounder.fuzzySearch, 'exists' );
    } );



    it( 'should correctly filter data elements', () =>
    {
        let flounderRefs = flounder.refs;

        flounderRefs.search.click();
        flounder.fuzzySearch( e );

        let hiddenOptions = flounderRefs.optionsListWrapper.querySelectorAll( '.' + classes.SEARCH_HIDDEN );

        assert.deepEqual( hiddenOptions[ 0 ], flounderRefs.data[ 0 ], 'correctly filters data elements' );
    } );



    it( 'should correctly report failed running of user .onInputChange()', () =>
    {
        sinon.stub( flounder, 'onInputChange', () => { a+ b } );
        sinon.stub( console, 'warn', () => {} );
        flounder.toggleList.justOpened = true;

        flounder.fuzzySearch( e );
        assert.equal( flounder.onInputChange.callCount, 1 );
        assert.equal( console.warn.callCount, 1 );


        flounder.onInputChange.restore();
        console.warn.restore();
    } );



    it( 'should skip the search if it was just opened', () =>
    {
        assert.equal( flounder.toggleList.justOpened, false );
    } );



    it( 'should close the list on enter and escape', () =>
    {
        e.keyCode = keycodes.ENTER;

        utils.addClass( flounder.refs.wrapper, classes.OPEN );
        flounder.fuzzySearch( e );
        assert.equal( utils.hasClass( flounder.refs.wrapper, classes.OPEN ), false );

        e.keyCode = keycodes.ESCAPE;

        utils.addClass( flounder.refs.wrapper, classes.OPEN );
        flounder.fuzzySearch( e );
        assert.equal( utils.hasClass( flounder.refs.wrapper, classes.OPEN ), false );
    } );



    it( 'should go to the last tag when backspace is hit in an empty searchbox', () =>
    {
        e.keyCode = keycodes.BACKSPACE;

        flounder.fuzzySearch.__previousValue = '';

        flounder.fuzzySearch( e );

        flounder.refs.multiTagWrapper.innerHTML = '<span class="flounder__multiple--select--tag" aria-label="Deselect All" tabindex="0"><a class="flounder__multiple__tag__close" data-index="1"></a>All</span><span class="flounder__multiple--select--tag" aria-label="Deselect Tags" tabindex="0"><a class="flounder__multiple__tag__close" data-index="2"></a>Tags</span>';
        sinon.spy( flounder.refs.multiTagWrapper.lastChild, 'focus' );

        flounder.fuzzySearch( e );

        assert.equal( flounder.refs.multiTagWrapper.lastChild.focus.callCount, 1 );
    } );



    it( 'should totally ignore up and down', () =>
    {
        let flounderRefs    = flounder.refs;
        let hiddenOptions1  = flounderRefs.optionsListWrapper.querySelectorAll( '.' + classes.SEARCH_HIDDEN );
        e.keyCode           = keycodes.UP;

        flounder.fuzzySearch( e );
        let hiddenOptions2 = flounderRefs.optionsListWrapper.querySelectorAll( '.' + classes.SEARCH_HIDDEN );
        assert.equal( hiddenOptions1.length, hiddenOptions2.length );

        e.keyCode = keycodes.DOWN;
        flounder.fuzzySearch( e );

        let hiddenOptions3 = flounderRefs.optionsListWrapper.querySelectorAll( '.' + classes.SEARCH_HIDDEN );
        assert.equal( hiddenOptions1.length, hiddenOptions3.length );
    } );
} );



/**
 * ## fuzzySearchReset
 *
 * resets all options to visible
 *
 * @return _Void_
 */
describe( 'fuzzySearchReset', () =>
{
    let data = [
        'doge',
        'moon'
    ];

    let flounder    = new Flounder( document.body, { data : data, defaultIndex : 0, search : true } );

    it( 'should exist', () =>
    {
        assert.ok( flounder.fuzzySearchReset, 'exists' );
    } );



    it( 'should correctly reset all search elements', () =>
    {

        let flounderRefs = flounder.refs;

        flounderRefs.search.click();
        flounder.fuzzySearch( { keyCode : 77,
                                preventDefault : e => e,
                                target  : { value : 'm  ' }
                                } );
        flounder.fuzzySearchReset();
        let hiddenOptions = flounderRefs.optionsListWrapper.querySelectorAll( '.' + classes.SEARCH_HIDDEN );

        assert.equal( flounderRefs.search.value, '', 'correctly blanks the search input' );
        assert.equal( hiddenOptions.length, 0, 'correctly resets search filtered elements' );
    } );
} );



/**
 * ## init
 *
 * post setup, this sets initial values and starts the build process
 *
 * @param {DOMElement} target flounder mount point
 * @param {Object} props passed options
 *
 * @return _Object_ new flounder object
 */
describe( 'init', () =>
{

    let flounder = new Flounder( document.body, { moon: 'doge', data: [ 1, 2, 3 ] } );

    it( 'should exist', () =>
    {
        assert.ok( flounder.init, 'exists' );
    } );



    it( 'should not add search unless the value is set', () =>
    {
        assert.equal( flounder.search, false );

        let searchyFlounder = new Flounder( document.querySelector( 'div' ), { search: true  } );

        assert.equal( searchyFlounder.search instanceof Sole, true );
    } );



    it( 'should create flounder refs on targets', () =>
    {
        let oTarget = flounder.originalTarget.flounder instanceof Flounder;
        let target  = flounder.target.flounder instanceof Flounder;

        assert.ok( oTarget === true && target === true, 'creates all refs' );
    } );



    it( 'should set the inital props, target, and environment', () =>
    {
        assert.equal( flounder.props.moon, 'doge' );
        assert.deepEqual( document.body, flounder.target );
    } );



    it( 'should warn when the user functions dont work', () =>
    {
        sinon.stub( console, 'warn', () => {} );

        let func = () => { a + b };

        new Flounder( document.querySelector( 'div' ), { onInit : func,
                                                         onComponentDidMount : func
                                                     } );

        assert( console.warn.callCount, 2 );

        console.warn.restore();
    } );



    it( 'should be set to ready after init', () =>
    {
        assert.equal( flounder.ready, true );
    } );
} );



/**
 * ## initializeOptions
 *
 * inserts the initial options into the flounder object, setting defaults
 * when necessary
 *
 * @return _Void_
 */
describe( 'initializeOptions', () =>
{
    let data = [
        'doge',
        'moon',
        'wow'
    ];

    let flounder = new Flounder( document.body, { data: data, multiple: 'doge', classes: { flounder: 'cat' } } );

    it( 'should exist', () =>
    {
        assert.ok( flounder.initializeOptions, 'exists' );
    } );


    it( 'should transfer all props to flounder (classes get a `Class` suffix)', () =>
    {
        assert.deepEqual( flounder.data, data );
        assert.equal( flounder.multiple, 'doge' );
        assert.equal( flounder.flounderClass, 'cat' );
    } );


    let flounder2 = new Flounder( document.body, { data: data, defaultEmpty: true, multipleTags: true } );


    it( 'should have an empty placeholder if set empty', () =>
    {
        assert.equal( flounder2.placeholder, '' );
    } );


    it( 'should set appropriate setting if it have multiple tags', () =>
    {
        assert.equal( flounder2.multipleTags, true );
        assert.equal( flounder2.search instanceof Sole, true );
        assert.equal( flounder2.multiple, true );
    } );
} );



/**
 * ## onRender
 *
 * attaches necessary events to the built DOM
 *
 * @return _Void_
 */
describe( 'onRender', () =>
{
    let data = [
        'doge',
        'moon',
        'wow'
    ];

    let flounder = new Flounder( document.body, { data: data, classes: { flounder: 'cat' } } );
    sinon.stub( flounder, 'addListeners', () => {} );

    it( 'should exist', () =>
    {
        assert.ok( flounder.onRender, 'exists' );
    } );



    it( 'should check if it\'s ios, and adjust classes', () =>
    {
        flounder.isIos = true;

        flounder.onRender();
        assert.equal( utils.hasClass( flounder.refs.select, classes.HIDDEN_IOS ), true );

        let flounder2 = new Flounder( document.body, { data: data, multiple: true } );
        assert.equal( utils.hasClass( flounder2.refs.select, classes.HIDDEN_IOS ), false );

        flounder.isIos = false;
    } );



    it( 'should attach the event listeners', () =>
    {
        flounder.onRender();
        assert.equal( flounder.addListeners.callCount, 2 );
    } );
} );



/**
 * ## sortData
 *
 * checks the data object for header options, and sorts it accordingly
 *
 * @return _Boolean_ hasHeaders
 */
describe( 'sortData', () =>
{
    let data = [
        'doge',
        'moon'
    ];

    let flounder    = new Flounder( document.body, { data : data } );


    it( 'should exist', () =>
    {
        assert.ok( flounder.sortData, 'exists' );
    } );



    let sortedData  = flounder.sortData( [
                                    'doge',
                                    {
                                        text:'moon',
                                        value: 'moon'
                                    },
                                    {
                                        header: 'moin!',
                                        data: [ 1, 2, 3 ]
                                    } ] );

    assert.ok( sortedData[0].index === 0 && sortedData[0].text === 'doge', 'sets simple text' );
    assert.ok( sortedData[1].index === 1 && sortedData[1].text === 'moon', 'sets data objects' );
    assert.ok( sortedData[2].index === 2 && sortedData[2].text === 1, 'sets header info' );
} );



/*
 * ## find tests
 *
 * @test exists
 * @test multiple targets returns an array
 * @test of flounders
 */
describe( 'find', () =>
{
    it( 'should exist', () =>
    {
        assert.ok( Flounder.find, 'exists' );
    } );



    it( 'should accept an array and return an arrays of flounders', () =>
    {
        let flounders = Flounder.find( [ document.body ] );
        assert.ok( Array.isArray( flounders ), 'multiple targets returns an array' );
        assert.ok( flounders[0] instanceof Flounder, 'of flounders' );
    } );



    it( 'should accept a string and return an arrays of flounders', () =>
    {
        let flounders = Flounder.find( 'div' );
        assert.ok( Array.isArray( flounders ), 'multiple targets returns an array' );
        assert.ok( flounders[0] instanceof Flounder, 'of flounders' );
    } );


    it( 'should accept a DOM element and return an arrays of flounders', () =>
    {
        let flounders = Flounder.find( document.body );
        assert.ok( Array.isArray( flounders ), 'multiple targets returns an array' );
        assert.ok( flounders[0] instanceof Flounder, 'of flounders' );
    } );
} );


/**
 * ## version
 *
 * sets version with getters and no setters for the sake of being read-only
 */
describe( 'version', () =>
{
    it( 'should be the same on the class and in the prototype', () =>
    {
        assert.equal( Flounder.version, version );
        assert.equal( Flounder.prototype.version, version );
    } );
} );

