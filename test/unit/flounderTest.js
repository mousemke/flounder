
import assert   from 'assert';
import sinon    from 'sinon';

import Flounder from '/core/flounder';
import version  from '/core/version';


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

// let data = [
//             'doge',
//             'moon'
//         ];

//         let flounder    = new Flounder( document.body, { data : data, defaultIndex : 0, search : true } );

//         assert.ok( flounder.fuzzySearch, 'exists' );

//         let flounderRefs = flounder.refs;

//         flounderRefs.search.click();
//         flounder.fuzzySearch( { keyCode : 77,
//                                 preventDefault : e => e,
//                                 target  : { value : 'm  ' }
//                                 } );

//         let hiddenOptions = flounderRefs.optionsListWrapper.querySelectorAll( '.' + classes.SEARCH_HIDDEN );

//         assert.deepEqual( hiddenOptions[ 0 ], flounderRefs.data[ 0 ], 'correctly filters data elements' );
//         flounder.destroy();
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
        // let data = [
        //     'doge',
        //     'moon'
        // ];

        // let flounder    = new Flounder( document.body, { data : data, defaultIndex : 0, search : true } );

        // assert.ok( flounder.fuzzySearchReset, 'exists' );

        // let flounderRefs = flounder.refs;

        // flounderRefs.search.click();
        // flounder.fuzzySearch( { keyCode : 77,
        //                         preventDefault : e => e,
        //                         target  : { value : 'm  ' }
        //                         } );
        // flounder.fuzzySearchReset();
        // let hiddenOptions = flounderRefs.optionsListWrapper.querySelectorAll( '.' + classes.SEARCH_HIDDEN );

        // assert.equal( flounderRefs.search.value, '', 'correctly blanks the search input' );
        // assert.equal( hiddenOptions.length, 0, 'correctly resets search filtered elements' );
        // flounder.destroy();
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

    it( 'should create all flounder refs', () =>
    {
        let flounder = new Flounder( document.body );

        let ref     = flounder.refs.flounder.flounder instanceof Flounder;
        let oTarget = flounder.originalTarget.flounder instanceof Flounder;
        let target  = flounder.target.flounder instanceof Flounder;

        assert.ok( ref === true && oTarget === true && target === true, 'creates all refs' );
        flounder.destroy();
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

