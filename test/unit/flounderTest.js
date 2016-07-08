
import assert   from 'assert';
import sinon    from 'sinon';

import Flounder from '/core/flounder';
import version  from '/core/version';
import classes  from '/core/classes';
import keycodes from '/core/keycodes';
import utils    from '/core/utils';


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
        console.warn.restore();

        assert.equal( consoleSpy.callCount, 1 );
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



    it( 'should reset the field is there are no matches', () =>
    {
        let e               = { target: { value: 'd  ' } };
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

    // it( 'should create all flounder refs', () =>
    // {
    //     let flounder = new Flounder( document.body );

    //     let ref     = flounder.refs.flounder.flounder instanceof Flounder;
    //     let oTarget = flounder.originalTarget.flounder instanceof Flounder;
    //     let target  = flounder.target.flounder instanceof Flounder;

    //     assert.ok( ref === true && oTarget === true && target === true, 'creates all refs' );
    //     flounder.destroy();
    // } );
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
// let data = [
//             'doge',
//             'moon'
//         ];

//         let flounder    = new Flounder( document.body, { data : data, defaultIndex : 0, search : true } );
//         assert.ok( flounder.initializeOptions, 'exists' );

//         assert.ok( flounder.data[0].text === 'doge', 'correctly sets data' );
//         assert.ok( flounder.search, 'correctly sets a prop' );
//         assert.ok( flounder.defaultIndex === 0, 'correctly sets a different prop' );

//         flounder.destroy();
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
// let data = [
//             'doge',
//             'moon'
//         ];

//         let flounder    = new Flounder( document.body, { data : data, defaultIndex : 0, search : true } );
//         assert.ok( flounder.onRender, 'exists' );

//         flounder.destroy();
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
        // let data = [
        //     'doge',
        //     'moon'
        // ];

        // let flounder    = new Flounder( document.body, { data : data } );
        // assert.ok( flounder.sortData, 'exists' );

        // let sortedData  = flounder.sortData( ['doge','moon'] );

        // assert.equal( sortedData[0].index, 0, 'sets the index' );

        // sortedData      = flounder.sortData( [{text:'doge',value:'moon'},'moon'] );
        // assert.equal( sortedData[0].value, 'moon', 'sets the value' );

        // flounder.destroy();
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


    it( 'should return an arrays of flounders', () =>
    {
        let flounders = Flounder.find( [ document.body ] );
        assert.ok( Array.isArray( flounders ), 'multiple targets returns an array' );
        assert.ok( flounders[0] instanceof Flounder, 'of flounders' );
        flounders[0].destroy();
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

