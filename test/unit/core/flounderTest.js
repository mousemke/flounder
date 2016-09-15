/* globals describe, it, document, console */
import assert   from 'assert';
import sinon    from 'sinon';

import Flounder from '/core/flounder';
import version  from '/core/version';
import classes  from '/core/classes';
import keycodes from '/core/keycodes';
import utils    from '/core/utils';
import Sole     from '/core/search';


const noop = () =>
{};

/**
 * ## componentWillUnmount
 *
 * on unmount, removes events
 *
 * @return _Void_
 */
describe( 'componentWillUnmount', () =>
{
    let flounder    = new Flounder( document.body );

    it( 'should exist', () =>
    {
        assert.ok( flounder.componentWillUnmount, 'exists' );
    } );


    flounder.originalChildren       = true;
    const selectEl = sinon.stub( flounder, 'popInSelectElements', noop );

    flounder.componentWillUnmount();
    flounder.originalChildren       = false;

    it( 'should be able to pop in the original children ', () =>
    {
        assert.ok( selectEl.callCount === 1 );
    } );



    it( 'should remove event listeners', () =>
    {
        flounder                = new Flounder( document.body );
        const removeListenersSpy  = sinon.spy( flounder, 'removeListeners' );

        const refs        = flounder.refs;
        refs.selected.click();

        const firstCheck = refs.wrapper.className.indexOf( 'open' );
        flounder.componentWillUnmount();
        refs.selected.click();

        const secondCheck = refs.wrapper.className.indexOf( 'open' );

        assert.equal( firstCheck, secondCheck, 'events are removed' );
        assert.equal( removeListenersSpy.callCount, 1 );
    } );



    it( 'should run this.onComponentWillUnmount()', () =>
    {
        flounder                        = new Flounder( document.body );
        let elSpy = sinon.stub( flounder, 'onComponentWillUnmount', noop );

        flounder.componentWillUnmount();
        assert.equal( elSpy.callCount, 1 );
        flounder.onComponentWillUnmount.restore();

        elSpy   = sinon.stub( flounder, 'onComponentWillUnmount', () =>
        {
            a + b // eslint-disable-line
        } );

        const consoleSpy = sinon.stub( console, 'warn', noop );
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
        const consoleSpy  = sinon.stub( console, 'warn', noop );
        flounder        = new Flounder();

        assert.equal( consoleSpy.callCount, 1 );
        console.warn.restore();

        assert.throws( () => new Flounder( 'moon' ) );
    } );



    it( 'should make a single flounder from a target(s)', () =>
    {
        flounder = new Flounder( 'select' );
        assert.ok( flounder instanceof Flounder );


        const consoleSpy  = sinon.stub( console, 'warn', noop );
        flounder        = new Flounder( 'div' );
        assert.equal( consoleSpy.callCount, 1 );

        console.warn.restore();
    } );



    it( 'should destroy any previous flounder on the same element', () =>
    {
        const flounderBackup  = document.body.flounder;
        const flounder        = new Flounder( 'body' );
        assert.notDeepEqual( flounder, flounderBackup );
    } );
} );


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
    const flounder        = new Flounder( 'div', {
        data : [
            'a',
            'b',
            'c'
        ],
        search : true
    } );

    it( 'should find all matching field and unhide them', () =>
    {
        const e               = {
            target : {
                value : 'a'
            }
        };
        flounder.filterSearchResults( e );

        const wrapper = flounder.refs.wrapper;
        assert.equal( wrapper.querySelectorAll(
                                    `.${classes.SEARCH_HIDDEN}` ).length, 2 );
    } );



    it( 'should reset the field if there in nothing in the input', () =>
    {
        const e              = {
            target : {
                value : ''
            }
        };
        sinon.stub( flounder, 'fuzzySearchReset', noop );

        flounder.filterSearchResults( e );

        assert.equal( flounder.fuzzySearchReset.callCount, 1 );
        flounder.fuzzySearchReset.restore();
    } );


    it( 'should add the no results el if there are no results', () =>
    {
        const e              = {
            target : {
                value : '676876876'
            }
        };

        sinon.stub( flounder, 'addNoResultsMessage', noop );
        sinon.stub( flounder, 'removeNoResultsMessage', noop );

        flounder.filterSearchResults( e );

        assert.equal( flounder.addNoResultsMessage.callCount, 1 );
        assert.equal( flounder.removeNoResultsMessage.callCount, 0 );

        flounder.addNoResultsMessage.restore();
        flounder.removeNoResultsMessage.restore();
    } );


    it( 'should add ignore no results el if there are no options', () =>
    {
        const e              = {
            target : {
                value : '676876876'
            }
        };
        flounder.addNoMoreOptionsMessage();

        sinon.stub( flounder, 'addNoResultsMessage', noop );
        sinon.stub( flounder, 'removeNoResultsMessage', noop );

        flounder.filterSearchResults( e );

        assert.equal( flounder.addNoResultsMessage.callCount, 0 );
        assert.equal( flounder.removeNoResultsMessage.callCount, 0 );

        flounder.addNoResultsMessage.restore();
        flounder.removeNoResultsMessage.restore();

        flounder.removeNoMoreOptionsMessage();
    } );
} );


/**
 * ## fuzzySearch
 *
 * filters events to determine the correct actions, based on events from the
 * search box
 *
 * @param {Object} e event object
 *
 * @return _Void_
 */
describe( 'fuzzySearch', () =>
{
    const data = [
        'doge',
        'moon',
        'such'
    ];

    const flounder    = new Flounder( document.body, {
        multipleTags    : true,
        data            : data,
        defaultIndex    : 0,
        search          : true
    } );

    const e = {
        keyCode         : 77,
        preventDefault  : e => e,
        target          : {
            value : 'm  '
        }
    };


    it( 'should exist', () =>
    {
        assert.ok( flounder.fuzzySearch, 'exists' );
    } );



    it( 'should correctly filter data elements', () =>
    {
        const flounderRefs = flounder.refs;

        flounderRefs.search.click();
        flounder.fuzzySearch( e );

        const hiddenOptions = flounderRefs.optionsListWrapper.querySelectorAll(
                                            `.${classes.SEARCH_HIDDEN}` );

        assert.deepEqual( hiddenOptions[ 0 ], flounderRefs.data[ 0 ] );
    } );



    it( 'should correctly report failed running of user .onInputChange()', () =>
    {
        sinon.stub( flounder, 'onInputChange', () => { a+ b } ); // eslint-disable-line
        sinon.stub( console, 'warn', noop );
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
        assert.equal( utils.hasClass( flounder.refs.wrapper, classes.OPEN ),
                                                                    false );

        e.keyCode = keycodes.ESCAPE;

        utils.addClass( flounder.refs.wrapper, classes.OPEN );
        flounder.fuzzySearch( e );
        assert.equal( utils.hasClass( flounder.refs.wrapper, classes.OPEN ),
                                                                    false );
    } );



    it( 'should go to the last tag on backspace in an empty searchbox', () =>
    {
        e.keyCode = keycodes.BACKSPACE;

        flounder.fuzzySearch.previousValue = '';

        flounder.fuzzySearch( e );

        flounder.refs.multiTagWrapper.innerHTML = '<span class="flounder__multiple--select--tag" aria-label="Deselect All" tabindex="0"><a class="flounder__multiple__tag__close" data-index="1"></a>All</span><span class="flounder__multiple--select--tag" aria-label="Deselect Tags" tabindex="0"><a class="flounder__multiple__tag__close" data-index="2"></a>Tags</span>'; // eslint-disable-line

        const lastTag = flounder.refs.multiTagWrapper.lastChild;
        sinon.spy( lastTag, 'focus' );

        flounder.fuzzySearch( e );

        assert.equal( lastTag.focus.callCount, 1 );
    } );



    it( 'should totally ignore up and down', () =>
    {
        const flounderRefs    = flounder.refs;
        const wrapper         = flounderRefs.optionsListWrapper;
        const hiddenOptions1  = wrapper.querySelectorAll(
                                                `.${classes.SEARCH_HIDDEN}` );
        e.keyCode             = keycodes.UP;

        flounder.fuzzySearch( e );
        const hiddenOptions2 = wrapper.querySelectorAll(
                                                `.${classes.SEARCH_HIDDEN}` );
        assert.equal( hiddenOptions1.length, hiddenOptions2.length );

        e.keyCode = keycodes.DOWN;
        flounder.fuzzySearch( e );

        const hiddenOptions3 = wrapper.querySelectorAll(
                                                `.${classes.SEARCH_HIDDEN}` );
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
    const data = [
        'doge',
        'moon'
    ];

    const flounder    = new Flounder( document.body, {
        data         : data,
        defaultIndex : 0,
        search       : true
    } );

    it( 'should exist', () =>
    {
        assert.ok( flounder.fuzzySearchReset, 'exists' );
    } );



    it( 'should correctly reset all search elements', () =>
    {

        const flounderRefs = flounder.refs;

        flounderRefs.search.click();
        flounder.fuzzySearch( {
            keyCode         : 77,
            preventDefault  : e => e,
            target          : {
                value : 'm  '
            }
        } );

        flounder.fuzzySearchReset();
        const wrapper = flounderRefs.optionsListWrapper;
        const hiddenOptions = wrapper.querySelectorAll(
                                                `.${classes.SEARCH_HIDDEN}` );

        assert.equal( flounderRefs.search.value, '' );
        assert.equal( hiddenOptions.length, 0 );
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

    const flounder = new Flounder( document.body, {
        moon : 'doge',
        data : [
            1,
            2,
            3
        ]
    } );

    it( 'should exist', () =>
    {
        assert.ok( flounder.init, 'exists' );
    } );



    it( 'should not add search unless the value is set', () =>
    {
        assert.equal( flounder.search, false );

        const searchyFlounder = new Flounder( document.querySelector( 'div' ), {
            search : true
        } );

        assert.equal( searchyFlounder.search instanceof Sole, true );
    } );



    it( 'should create flounder refs on targets', () =>
    {
        const oTarget = flounder.originalTarget.flounder instanceof Flounder;
        const target  = flounder.target.flounder instanceof Flounder;

        assert.ok( oTarget === true && target === true, 'creates all refs' );
    } );



    it( 'should set the inital props, target, and environment', () =>
    {
        assert.equal( flounder.props.moon, 'doge' );
        assert.deepEqual( document.body, flounder.target );
    } );



    it( 'should warn when the user functions dont work', () =>
    {
        sinon.stub( console, 'warn', noop );

        let func = () => { a + b }; // eslint-disable-line

        new Flounder( document.querySelector( 'div' ), {
            onInit              : func,
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
    const data = [
        'doge',
        'moon',
        'wow'
    ];

    const flounder = new Flounder( document.body, {
        data        : data,
        multiple    : 'doge',
        classes     : {
            MAIN : 'cat'
        }
    } );


    it( 'should exist', () =>
    {
        assert.ok( flounder.initializeOptions, 'exists' );
    } );


    it( 'should transfer all props to flounder', () =>
    {
        assert.deepEqual( flounder.data, data );
        assert.equal( flounder.multiple, 'doge' );
        assert.equal( flounder.classes.MAIN, 'cat' );
    } );


    const f2Options = {
        data            : data,
        defaultEmpty    : true,
        multipleTags    : true,
        onSelect        : noop
    };


    const flounder2 = new Flounder( document.body, f2Options );


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


    it( 'should reassign onSelect to onChange and give a warning', () =>
    {
        sinon.stub( console, 'warn', noop );

        assert.equal( typeof flounder2.onSelect, 'function' );
        assert.equal( typeof flounder2.onChange, 'function' );

        assert.equal( console.warn.callCount, 0 );

        flounder2.onSelect( {} );

        assert.equal( console.warn.callCount, 1 );

        console.warn.restore();
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
    const data = [
        'doge',
        'moon',
        'wow'
    ];

    const flounder = new Flounder( document.body, {
        data    : data,
        classes : {
            flounder : 'cat'
        }
    } );
    sinon.stub( flounder, 'addListeners', noop );

    it( 'should exist', () =>
    {
        assert.ok( flounder.onRender, 'exists' );
    } );



    it( 'should check if it\'s ios, and adjust classes', () =>
    {
        flounder.isIos = true;

        flounder.onRender();
        assert.equal(
            utils.hasClass( flounder.refs.select, classes.HIDDEN_IOS ), true );

        const flounder2 = new Flounder( document.body, {
            data     : data,
            multiple : true
        } );
        assert.equal(
        utils.hasClass( flounder2.refs.select, classes.HIDDEN_IOS ), false );

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
    const data = [
        'doge',
        'moon'
    ];

    const flounder    = new Flounder( document.body, {
        data : data
    } );


    it( 'should exist', () =>
    {
        assert.ok( flounder.sortData, 'exists' );
    } );



    const sortedData  = flounder.sortData( [
        'doge',
        {
            text    : 'moon',
            value   : 'moon'
        },
        {
            header  : 'moin!',
            data    : [ 1, 2, 3 ]
        } ] );

    assert.ok( sortedData[ 0 ].index === 0 && sortedData[ 0 ].text === 'doge' );
    assert.ok( sortedData[ 1 ].index === 1 && sortedData[ 1 ].text === 'moon' );
    assert.ok( sortedData[ 2 ].index === 2 && sortedData[ 2 ].text === 1 );
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
        const flounders = Flounder.find( [ document.body ] );
        assert.ok( Array.isArray( flounders ) );
        assert.ok( flounders[ 0 ] instanceof Flounder, 'of flounders' );
    } );



    it( 'should accept a string and return an arrays of flounders', () =>
    {
        const flounders = Flounder.find( 'div' );
        assert.ok( Array.isArray( flounders ) );
        assert.ok( flounders[ 0 ] instanceof Flounder, 'of flounders' );
    } );


    it( 'should accept a DOM element and return an arrays of flounders', () =>
    {
        const flounders = Flounder.find( document.body );
        assert.ok( Array.isArray( flounders ) );
        assert.ok( flounders[ 0 ] instanceof Flounder, 'of flounders' );
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

