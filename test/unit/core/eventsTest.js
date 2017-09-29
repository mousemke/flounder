/* globals describe, it, document, beforeEach, afterEach, console,
window, setTimeout */
import Flounder     from '/core/flounder';

import classes      from '/core/classes';
import utils        from '/core/utils';
import keycodes     from '/core/keycodes';

import assert       from 'assert';
import sinon        from 'sinon';
import simulant     from 'simulant';

const noop = () =>
{};


/**
 * ## addFirstTouchListeners
 *
 * adds the listeners for onFirstTouch
 *
 * @return {Void} void
 */
describe( 'addFirstTouchListeners', () =>
{
    const flounder    = new Flounder( document.body, {} );
    flounder.firstTouchController( {} );

    const refs        = flounder.refs;

    sinon.stub( flounder, 'firstTouchController', noop );

    flounder.addFirstTouchListeners();

    it( 'should react on click and focus events', done  =>
    {
        refs.selected.click();
        refs.select.focus();

        setTimeout( () =>
        {
            assert.equal( flounder.firstTouchController.callCount, 2 );
            flounder.firstTouchController.restore();
            done();
        }, 100 );
    } );


    it( 'should bind mouseenter to the wrapper if openOnHover is set', done =>
    {
        document.body.flounder = null;
        const flounder    = new Flounder( document.body, {
            openOnHover : true
        } );

        flounder.firstTouchController( {} );

        sinon.stub( flounder, 'firstTouchController', e => e );

        flounder.addFirstTouchListeners();

        assert.equal( flounder.firstTouchController.callCount, 0 );

        simulant.fire( flounder.refs.wrapper, 'mouseenter' );

        // there's some weird focus event too
        setTimeout( () =>
        {
            assert.equal( flounder.firstTouchController.callCount, 2 );
            flounder.firstTouchController.restore();
            done();
        }, 100 );
    } );
} );



/**
 * ## addHoverClass
 *
 * adds a hover class to an element
 *
 * @return Void_
 */
describe( 'addHoverClass', () =>
{
    it( 'should add a hover class to it\'s triggered element', () =>
    {
        document.body.flounder = null;
        const flounder    = new Flounder( document.body );

        const el = document.createElement( 'DIV' );
        flounder.addHoverClass( {
            target : el
        } );
        assert.equal( utils.hasClass( el, classes.HOVER ), true );
    } );
} );



/**
 * ## addListeners
 *
 * adds listeners on render
 *
 * @return {Void} void
 */
describe( 'addListeners', () =>
{
    let flounder;

    beforeEach( () =>
    {
        document.body.flounder = null;

        flounder    = new Flounder( document.body, {} );
        flounder.removeListeners( {} );

        sinon.stub( flounder, 'divertTarget', noop );
        sinon.stub( flounder, 'toggleList', noop );
        sinon.stub( flounder, 'checkFlounderKeypress', noop );
        sinon.stub( flounder, 'addFirstTouchListeners', noop );
        sinon.stub( flounder, 'addOptionsListeners', noop );
        sinon.stub( flounder, 'addSearchListeners', noop );
    } );


    afterEach( () =>
    {
        flounder.divertTarget.restore();
        flounder.toggleList.restore();
        flounder.checkFlounderKeypress.restore();
        flounder.addFirstTouchListeners.restore();
        flounder.addOptionsListeners.restore();
        flounder.addSearchListeners.restore();
    } );


    it( 'should react on change, click, and keydown events', () =>
    {
        const refs        = flounder.refs;
        flounder.isIos  = false;

        flounder.addListeners( refs );

        simulant.fire( refs.select, 'change' );
        simulant.fire( refs.selected, 'click' );
        simulant.fire( refs.flounder, 'keydown' );

        assert.equal( flounder.divertTarget.callCount, 1 );
        assert.equal( flounder.checkFlounderKeypress.callCount, 1 );
        assert.equal( flounder.toggleList.callCount, 1 );
    } );




    it( 'should bind mouseenter to the wrapper if openOnHover is set', () =>
    {
        const refs        = flounder.refs;

        flounder.isIos  = true;
        flounder.props.openOnHover = true;
        flounder.search = true;

        flounder.addListeners( refs );

        simulant.fire( refs.wrapper, 'mouseenter' );
        simulant.fire( refs.wrapper, 'mouseleave' );

        assert.equal( flounder.addSearchListeners.callCount, 1 );
        assert.equal( flounder.toggleList.callCount, 2 );
    } );
} );



/**
 * ## addMultipleTags
 *
 * adds a tag for each selected option and attaches the correct events to it
 *
 * @param {Array} selectedOptions currently selected options
 * @param {DOMElement} multiTagWrapper parent element of the tags
 *
 * @return {Void} void
 */
describe( 'addMultipleTags', () =>
{
    const select          = document.createElement( 'SELECT' );
    const multiTagWrapper = document.createElement( 'DIV' );

    const options = [ {}, {}, {} ].map( ( el, i ) =>
    {
        el = document.createElement( 'OPTION' );
        el.selected = true;

        el.value    = i === 0 ? '' : 'moon';

        select.appendChild( el );

        return el;
    } );

    it( 'should add a tag with event listeners for each selected value', () =>
    {
        document.body.flounder = null;
        const flounder    = new Flounder( document.body, {
            multipleTags : true
        } );

        flounder.addMultipleTags( options, multiTagWrapper );

        assert.equal( options[ 0 ].selected, false );
        assert.equal( multiTagWrapper.children.length, 2 );
    } );


    it( 'should have the proper events bound to it', () =>
    {
        document.body.flounder = null;
        const flounder    = new Flounder( document.body, {
            multipleTags : true
        } );

        sinon.stub( flounder, 'removeMultiTag', noop );
        sinon.stub( flounder, 'checkMultiTagKeydown', noop );

        flounder.addMultipleTags( options, multiTagWrapper );

        const firstTag = multiTagWrapper.firstChild;

        simulant.fire( firstTag, 'keydown' );
        simulant.fire( firstTag.firstChild, 'click' );

        assert.equal( flounder.removeMultiTag.callCount, 1 );
        assert.equal( flounder.checkMultiTagKeydown.callCount, 1 );

        flounder.removeMultiTag.restore();
        flounder.checkMultiTagKeydown.restore();
    } );
} );



/**
 * ## addOptionsListeners
 *
 * adds listeners to the options
 *
 * @return {Void} void
 */
describe( 'addOptionsListeners', () =>
{
    let flounder;

    beforeEach( () =>
    {
        document.body.flounder = null;
        flounder = new Flounder( document.body, {
            data : [ 1, 2, 3 ]
        } );

        flounder.removeOptionsListeners();

        flounder.refs.data[ 1 ] = document.createElement( 'NOTADIV' );

        sinon.stub( flounder, 'addHoverClass', noop );
        sinon.stub( flounder, 'removeHoverClass', noop );
        sinon.stub( flounder, 'clickSet', noop );
    } );


    afterEach( () =>
    {
        flounder.addHoverClass.restore();
        flounder.removeHoverClass.restore();
        flounder.clickSet.restore();
    } );


    it( 'should add hover and click listeners on each data div', () =>
    {
        flounder.addOptionsListeners();

        const firstData = flounder.refs.data[ 0 ];

        simulant.fire( firstData, 'mouseenter' );
        simulant.fire( firstData, 'mouseleave' );
        simulant.fire( firstData, 'click' );

        simulant.fire( flounder.refs.data[ 1 ], 'click' );


        assert.equal( flounder.addHoverClass.callCount, 1 );
        assert.equal( flounder.removeHoverClass.callCount, 1 );
        assert.equal( flounder.clickSet.callCount, 1 );
    } );
} );



/**
 * ## addNoMoreOptionsMessage
 *
 * Adding 'No More Options' message to the option list
 *
 * @return {Void} void
 */
describe( 'addNoMoreOptionsMessage', () =>
{
    it( 'should add a addNoMoreOptions message', () =>
    {
        document.body.flounder = null;
        const flounder = new Flounder( document.body, {
            data : [ 1, 2, 3 ]
        } );

        flounder.addNoMoreOptionsMessage();

        assert.equal( typeof flounder.refs.noMoreOptionsEl, 'object' );
    } );
} );



/**
 * ## addNoResultsMessage
 *
 * Adding 'No Results' message to the option list
 *
 * @return {Void} void
 */
describe( 'addNoResultsMessage', () =>
{
    it( 'should add a addNoResults message', () =>
    {
        document.body.flounder = null;
        const flounder = new Flounder( document.body, {
            data : [ 1, 2, 3 ]
        } );

        flounder.addNoResultsMessage();

        assert.equal( typeof flounder.refs.noResultsEl, 'object' );
    } );
} );



/**
 * ## addPlaceholder
 *
 * called on body click, this determines what (if anything) should be
 * refilled into the the placeholder position
 *
 * @return {Void} void
 */
describe( 'addPlaceholder', () =>
{
    let flounder;

    beforeEach( () =>
    {
        document.body.flounder = null;
        flounder = new Flounder( document.body, {
            data        : [ 1, 2, 3 ],
            multiple    : true,
            placeholder : 'moon'
        } );
    } );

    it( 'should add the placeholder if there is nothing selected', () =>
    {
        flounder.deselectAll();
        flounder.addPlaceholder();

        assert.equal( flounder.refs.selected.innerHTML, flounder.placeholder );
    } );


    it( 'should remove the placeholder if there is anything selected', () =>
    {
        flounder.setByIndex( 2 );
        flounder.addPlaceholder();

        assert.equal( flounder.refs.selected.innerHTML, 2 );
    } );


    it( 'should set the placeholder text if the placeholder is selected', () =>
    {
        flounder.setByIndex( 0 );
        flounder.addPlaceholder();

        assert.equal( flounder.refs.selected.innerHTML, flounder.placeholder );
    } );


    it( 'should set the multi text if there is more than one selected', () =>
    {
        flounder.setByIndex( 2 );
        flounder.setByIndex( 3, true );
        flounder.addPlaceholder();

        assert.equal(
                flounder.refs.selected.innerHTML, flounder.multipleMessage );
    } );


    it( 'should handle multipleTags placeholders', () =>
    {
        document.body.flounder = null;
        flounder = new Flounder( document.body, {
            data            : [ 1, 2, 3 ],
            multipleTags    : true,
            placeholder     : 'moon'
        } );
        flounder.setByIndex( 2 );
        flounder.addPlaceholder();
        assert.equal( flounder.refs.selected.innerHTML, '' );
    } );
} );



/**
 * ## addSearchListeners
 *
 * adds listeners to the search box
 *
 * @return {Void} void
 */
describe( 'addSearchListeners', () =>
{
    let flounder;

    beforeEach( () =>
    {
        document.body.flounder = null;
        flounder = new Flounder( document.body, {
            data    : [ 1, 2, 3 ],
            search  : true
        } );

        flounder.removeSearchListeners();


        sinon.stub( flounder, 'toggleListSearchClick', noop );
        sinon.stub( flounder, 'fuzzySearch', noop );
        sinon.stub( flounder, 'clearPlaceholder', noop );
    } );


    afterEach( () =>
    {
        flounder.toggleListSearchClick.restore();
        flounder.fuzzySearch.restore();
        flounder.clearPlaceholder.restore();
    } );


    it( 'should add the correct events and functions', () =>
    {
        flounder.addSearchListeners();
        const search = flounder.refs.search;

        simulant.fire( search, 'click' );
        simulant.fire( search, 'input' );
        search.focus();

        assert.equal( flounder.toggleListSearchClick.callCount, 2 );
        assert.equal( flounder.fuzzySearch.callCount, 1 );
        assert.equal( flounder.clearPlaceholder.callCount, 1 );
    } );
} );



/**
 * ## addSelectKeyListener
 *
 * adds a listener to the selectbox to allow for seeking through the native
 * selectbox on keypress
 *
 * @return {Void} void
 */
describe( 'addSelectKeyListener', () =>
{
    let flounder;

    beforeEach( () =>
    {
        document.body.flounder = null;
        flounder = new Flounder( document.body, {
            data   : [ 1, 2, 3 ],
            search : true
        } );

        flounder.removeSelectKeyListener();


        sinon.stub( flounder, 'setSelectValue', noop );
        sinon.stub( flounder, 'setKeypress', noop );
    } );


    afterEach( () =>
    {
        flounder.setSelectValue.restore();
        flounder.setKeypress.restore();
    } );


    it( 'should add the correct events and functions', () =>
    {
        flounder.addSelectKeyListener();
        const select = flounder.refs.select;

        simulant.fire( select, 'keydown' );
        simulant.fire( select, 'keyup' );


        assert.equal( flounder.setSelectValue.callCount, 1 );
        assert.equal( flounder.setKeypress.callCount, 1 );
    } );


    it( 'should insert a plug element into the select box', () =>
    {
        flounder.isIos = true;

        flounder.addSelectKeyListener();

        const select  = flounder.refs.select;
        const plug    = select.children[ 0 ];

        assert.equal( plug.tagName, 'OPTION' );

        assert.equal( plug.disabled, true );
        assert.equal( plug.className, classes.PLUG );
        assert.deepEqual( plug.parentNode, select );
    } );
} );



/**
 * ## catchBodyClick
 *
 * checks if a click is on the menu and, if it isnt, closes the menu
 *
 * @param  {Object} e event object
 *
 * @return {Void} void
 */
describe( 'catchBodyClick', () =>
{
    document.body.flounder = null;
    const flounder = new Flounder( document.body, {
        data : [ 1, 2, 3 ]
    } );

    sinon.stub( flounder, 'toggleList', noop );
    sinon.stub( flounder, 'addPlaceholder', noop );

    it( 'should toggleList() and addPlaceholder if clicked off flounder', () =>
    {
        sinon.stub( flounder, 'checkClickTarget', () => false );

        flounder.catchBodyClick( {} );

        assert.equal( flounder.toggleList.callCount, 1 );
        assert.equal( flounder.addPlaceholder.callCount, 1 );

        flounder.checkClickTarget.restore();
    } );


    it( 'should skip them if the click is inside flounder', () =>
    {
        sinon.stub( flounder, 'checkClickTarget', () => true );

        flounder.catchBodyClick( {} );

        assert.equal( flounder.toggleList.callCount, 1 );
        assert.equal( flounder.addPlaceholder.callCount, 1 );

        flounder.checkClickTarget.restore();
    } );
} );



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
describe( 'checkClickTarget', () =>
{
    document.body.flounder = null;
    const flounder = new Flounder( document.body, {
        data : [ 1, 2, 3 ]
    } );

    it( 'should return true if the click is inside flounder', () =>
    {
        const el = flounder.refs.data[ 1 ];

        assert.equal( flounder.checkClickTarget( {
            target : el
        } ), true );
    } );


    it( 'should return false if the click is not inside flounder', () =>
    {
        assert.equal( flounder.checkClickTarget( {
            target : document.body

        } ), false );
    } );


    it( 'should return false if the element is not in the DOM', () =>
    {
        const el = document.createElement( 'DIV' );

        assert.equal( flounder.checkClickTarget( {
            target : el
        } ), false );
    } );
} );



/**
 * ## checkEnterOnSearch
 *
 * if enter is pressed in the searchox, if there is only one option matching,
 * this selects it
 *
 * @param {Object} e event object
 * @param {Object} refs element references
 *
 * @return {Void} void
 */
describe( 'checkEnterOnSearch', () =>
{
    it( 'should skip the whole thing if there is no value', () =>
    {
        document.body.flounder = null;
        const flounder    = new Flounder( document.body, {
            data    : [ 1, 2, 3 ],
            search  : true
        } );

        const refs        = flounder.refs;

        const e = {
            target : {
                value : ''
            }
        };

        assert.equal( flounder.checkEnterOnSearch( e, refs ), false );
    } );


    it( 'should select the option if there is only one entry', () =>
    {
        document.body.flounder = null;
        const flounder    = new Flounder( document.body, {
            data    : [ 1, 2, 3 ],
            search  : true
        } );

        const refs        = flounder.refs;

        sinon.stub( refs.search, 'focus', noop );

        const e = {
            target : {
                value : '2'
            }
        };

        const res = flounder.checkEnterOnSearch( e, refs );

        assert.equal( res.length, 1 );
        assert.equal( flounder.getSelected()[ 0 ].value, 2 );
    } );


    it( 'should select the option if there is an exact match', () =>
    {
        document.body.flounder = null;
        const flounder    = new Flounder( document.body, {
            data    : [ 'abcd', 'abcde', 'abc' ],
            search  : true
        } );

        const refs        = flounder.refs;

        sinon.stub( refs.search, 'focus', noop );

        // Case insensitive match.
        const e = {
            target : {
                value : 'Abc'
            }
        };

        const res = flounder.checkEnterOnSearch( e, refs );

        assert.equal( res.length, 2 );
        assert.equal( flounder.getSelected().length, 1 );
        assert.equal( flounder.getSelected()[ 0 ].value, 'abc' );
    } );


    it( 'should only select the option if there is only one left', () =>
    {
        document.body.flounder = null;
        const flounder    = new Flounder( document.body, {
            data    : [ 1, 2, 3 ],
            search  : true
        } );

        const refs        = flounder.refs;

        sinon.stub( refs.search, 'focus', noop );

        const e = {
            target : {
                value : '4'
            }
        };

        const res = flounder.checkEnterOnSearch( e, refs );

        assert.equal( res.length, 0 );
        assert.equal( refs.search.focus.callCount, 0 );

        refs.search.focus.restore();
    } );


    it( 'should only refocus on search if multipletags is active', done =>
    {
        document.body.flounder = null;

        const opt         = {
            data            : [ 1, 2, 3 ],
            multipleTags    : true
        };

        const flounder    = new Flounder( document.body, opt );
        const refs        = flounder.refs;

        sinon.stub( refs.search, 'focus', noop );

        const e = {
            target : {
                value : '2'
            }
        };

        const res = flounder.checkEnterOnSearch( e, refs );

        assert.equal( res.length, 1 );

        setTimeout( () =>
        {
            assert.equal( refs.search.focus.callCount, 1 );
            refs.search.focus.restore();
            done();
        }, 300 );
    } );


    it( 'should exclude items that are already selected', () =>
    {
        document.body.flounder = null;
        const flounder    = new Flounder( document.body, {
            data    : [ 1, 2, 3 ],
            search  : true
        } );

        const refs        = flounder.refs;

        flounder.setByValue( '2' );
        const e = {
            target : {
                value : '2'
            }
        };
        const res = flounder.checkEnterOnSearch( e, refs );

        assert.equal( res.length, 0 );
    } );


    it( 'should exclude items that are already disabled', () =>
    {
        document.body.flounder = null;

        const flounder    = new Flounder( document.body, {
            data    : [ 1, 2, 3 ],
            search  : true
        } );

        const refs        = flounder.refs;

        flounder.disableByValue( '2' );

        const e = {
            target : {
                value : '2'
            }
        };

        sinon.stub( flounder, 'onChange', () =>
        {
        } );

        flounder.checkEnterOnSearch( e, refs );

        assert.equal( flounder.onChange.callCount, 0 );

        flounder.onChange.restore();
    } );


    it( 'should display a message when onChange fails', () =>
    {
        document.body.flounder = null;

        const flounder    = new Flounder( document.body, {
            data        : [ 1, 2, 3 ],
            onChange    : () => a + b,  // eslint-disable-line
            search      : true
        } );

        const refs  = flounder.refs;
        const e     = {
            target : {
                value : '2'
            }
        };

        sinon.stub( console, 'warn', () =>
        {
        } );

        flounder.checkEnterOnSearch( e, refs );

        assert.equal( console.warn.callCount, 1 );

        console.warn.restore();
    } );
} );



/**
 * ## checkFlounderKeypress
 *
 * checks flounder focused keypresses and filters all but space and enter
 *
 * @return {Void} void
 */

describe( 'checkFlounderKeypress', () =>
{
    it( 'should close the menu and add the placeholder on tab', () =>
    {
        document.body.flounder = null;
        const flounder    = new Flounder( document.body, {
            data    : [ 1, 2, 3 ],
            search  : true
        } );

        const e = {
            keyCode         : keycodes.TAB,
            target          : {
                value : 2
            },
            preventDefault  : noop
        };

        sinon.stub( flounder, 'addPlaceholder', noop );
        sinon.stub( flounder, 'toggleClosed', noop );

        flounder.checkFlounderKeypress( e );

        assert.equal( flounder.addPlaceholder.callCount, 1 );
        assert.equal( flounder.toggleClosed.callCount, 1 );

        flounder.addPlaceholder.restore();
        flounder.toggleClosed.restore();
    } );


    it( 'should toggle open on enter', () =>
    {
        document.body.flounder = null;
        const flounder    = new Flounder( document.body, {
            data    : [ 1, 2, 3 ],
            search  : true
        } );

        const refs        = flounder.refs;

        const e = {
            keyCode : keycodes.ENTER,
            target  : {
                value   : 2
            },
            preventDefault  : noop,
            stopPropagation : noop
        };

        flounder.checkFlounderKeypress( e );

        assert.equal( utils.hasClass( refs.wrapper, classes.OPEN ), true );
    } );


    it( 'should toggle enter if search is enabled', () =>
    {
        document.body.flounder = null;
        const flounder    = new Flounder( document.body, {
            data    : [ 1, 2, 3 ],
            search  : true
        } );
        const refs        = flounder.refs;
        refs.wrapper.className += '  open';

        const e = {
            keyCode         : keycodes.ENTER,
            target          : {
                value : 2
            },
            preventDefault  : noop,
            stopPropagation : noop
        };

        const res = flounder.checkFlounderKeypress( e );

        assert.equal( res[ 0 ].value, '2' );
        assert.equal( res.length, 1 );
    } );


    it( 'should toggle the list open with space in a non-input', () =>
    {
        document.body.flounder = null;
        const flounder    = new Flounder( document.body, {
            data    : [ 1, 2, 3 ],
            search  : true
        } );

        const refs        = flounder.refs;

        const e = {
            keyCode : keycodes.SPACE,
            target  : {
                tagName : 'MOON'
            },
            preventDefault  : noop,
            stopPropagation : noop
        };

        flounder.checkFlounderKeypress( e );

        assert.equal( utils.hasClass( refs.wrapper, classes.OPEN ), true );
    } );


    it( 'should not toggle the list open with space in an input', () =>
    {
        document.body.flounder = null;
        const flounder    = new Flounder( document.body, {
            data    : [ 1, 2, 3 ],
            search  : true
        } );

        const refs        = flounder.refs;

        const e = {
            keyCode : keycodes.SPACE,
            target  : {
                tagName : 'INPUT'
            },
            preventDefault  : noop,
            stopPropagation : noop
        };

        flounder.checkFlounderKeypress( e );

        assert.equal( utils.hasClass( refs.wrapper, classes.OPEN ), false );
    } );


    it( 'should pass normal letters through', () =>
    {
        document.body.flounder = null;
        const flounder    = new Flounder( document.body, {
            data    : [ 1, 2, 3 ],
            search  : true
        } );

        const refs        = flounder.refs;

        let e = {
            keyCode : 49,
            target  : {
                tagName : 'INPUT'
            }
        };
        flounder.checkFlounderKeypress( e );

        assert.equal( refs.selected.innerHTML, '' );

        e = {
            keyCode : 70,
            target  : {
                tagName : 'INPUT'
            }
        };

        flounder.checkFlounderKeypress( e );
    } );


    it( 'should do nothing if it doesnt hit the above conditions', () =>
    {
        document.body.flounder = null;
        const flounder    = new Flounder( document.body, {
            data    : [ 1, 2, 3 ],
            search  : true
        } );

        const refs        = flounder.refs;

        refs.selected.innerHTML = 'moon';

        let e = {
            keyCode : 49,
            target  : {}
        };
        flounder.checkFlounderKeypress( e );

        e = {
            keyCode : 0
        };
        flounder.checkFlounderKeypress( e );

        assert.equal( refs.selected.innerHTML, 'moon' );
    } );
} );



/**
 * ## checkMultiTagKeydown
 *
 * when a tag is selected, this decided how to handle it by either
 * passing the event on, or handling tag removal
 *
 * @param {Object} e event object
 *
 * @return {Void} void
 */
describe( 'checkMultiTagKeydown', () =>
{
    it( 'should navigate tags on left or right', () =>
    {
        document.body.flounder = null;

        const flounder    = new Flounder( document.body, {
            data            : [ 1, 2, 3 ],
            multipleTags    : true
        } );
        const refs        = flounder.refs;

        flounder.setByIndex( 1 );
        flounder.setByIndex( 2 );

        sinon.stub( flounder, 'checkMultiTagKeydownNavigate', noop );
        sinon.stub( flounder, 'checkMultiTagKeydownRemove', noop );

        const firstChild = refs.multiTagWrapper.firstChild;

        flounder.checkMultiTagKeydown( {
            keyCode         : keycodes.RIGHT,
            target          : firstChild,
            preventDefault  : noop,
            stopPropagation : noop
        } );

        flounder.checkMultiTagKeydown( {
            keyCode         : keycodes.LEFT,
            target          : firstChild,
            preventDefault  : noop,
            stopPropagation : noop
        } );

        assert.equal( flounder.checkMultiTagKeydownNavigate.callCount, 2 );
        assert.equal( flounder.checkMultiTagKeydownRemove.callCount, 0 );
    } );


    it( 'should remove tags on backspace', () =>
    {
        document.body.flounder = null;

        const flounder    = new Flounder( document.body, {
            data            : [ 1, 2, 3 ],
            multipleTags    : true
        } );
        const refs        = flounder.refs;

        flounder.setByIndex( 1 );
        flounder.setByIndex( 2 );

        sinon.stub( flounder, 'checkMultiTagKeydownNavigate', noop );
        sinon.stub( flounder, 'checkMultiTagKeydownRemove', noop );

        const firstChild = refs.multiTagWrapper.firstChild;

        flounder.checkMultiTagKeydown( {
            keyCode         : keycodes.BACKSPACE,
            target          : firstChild,
            preventDefault  : noop,
            stopPropagation : noop
        } );

        assert.equal( flounder.checkMultiTagKeydownNavigate.callCount, 0 );
        assert.equal( flounder.checkMultiTagKeydownRemove.callCount, 1 );
    } );


    it( 'should focus on the search blank to type on letters', () =>
    {
        document.body.flounder = null;

        const flounder    = new Flounder( document.body, {
            data            : [ 1, 2, 3 ],
            multipleTags    : true
        } );
        const refs        = flounder.refs;

        flounder.setByIndex( 1 );
        flounder.setByIndex( 2 );

        sinon.stub( flounder, 'clearPlaceholder', noop );
        sinon.stub( flounder, 'toggleListSearchClick', noop );

        const firstChild = refs.multiTagWrapper.firstChild;

        flounder.checkMultiTagKeydown( {
            keyCode         : 888,
            key             : 'm',
            target          : firstChild,
            preventDefault  : noop,
            stopPropagation : noop
        } );

        assert.equal( flounder.clearPlaceholder.callCount, 1 );
        assert.equal( flounder.toggleListSearchClick.callCount, 1 );
    } );


    it( 'should do nothing on other keys', () =>
    {
        document.body.flounder = null;

        const flounder    = new Flounder( document.body, {
            data            : [ 1, 2, 3 ],
            multipleTags    : true
        } );
        const refs        = flounder.refs;

        flounder.setByIndex( 1 );
        flounder.setByIndex( 2 );

        sinon.stub( flounder, 'clearPlaceholder', noop );
        sinon.stub( flounder, 'toggleListSearchClick', noop );

        const firstChild = refs.multiTagWrapper.firstChild;

        flounder.checkMultiTagKeydown( {
            keyCode         : 888,
            key             : 'mkjbkhj',
            target          : firstChild,
            preventDefault  : noop,
            stopPropagation : noop
        } );

        assert.equal( flounder.clearPlaceholder.callCount, 0 );
        assert.equal( flounder.toggleListSearchClick.callCount, 0 );
    } );
} );


/**
 * ## checkMultiTagKeydownNavigate
 *
 * after left or right is hit while a multitag is focused, this focus' on
 * the next tag in that direction or the the search field
 *
 * @param {Function} focusSearch function to focus on the search field
 * @param {Number} keyCode keyclode from te keypress event
 * @param {Number} index index of currently focused tag
 *
 * @return {Void} void
 */
describe( 'checkMultiTagKeydownNavigate', () =>
{
    it( 'should focus on next left tag when left is pressed', done =>
    {
        document.body.flounder = null;

        const flounder    = new Flounder( document.body, {
            data            : [ 1, 2, 3 ],
            multipleTags    : true
        } );
        const refs        = flounder.refs;

        flounder.setByIndex( 1 );
        flounder.setByIndex( 2 );

        const firstTag = refs.multiTagWrapper.firstChild;

        sinon.stub( firstTag, 'focus', noop );
        const focusSearch = sinon.spy();

        flounder.checkMultiTagKeydownNavigate( focusSearch, keycodes.LEFT, 1 );

        assert.equal( focusSearch.callCount, 0 );

        setTimeout( () =>
        {
            assert.equal( firstTag.focus.callCount, 1 );
            done();
        }, 100 );
    } );


    it( 'should remain focused on left when already on the leftest tag', () =>
    {
        document.body.flounder = null;

        const flounder    = new Flounder( document.body, {
            data            : [ 1, 2, 3 ],
            multipleTags    : true
        } );
        const refs        = flounder.refs;

        flounder.setByIndex( 1 );

        const firstTag = refs.multiTagWrapper.firstChild;

        sinon.stub( firstTag, 'focus', noop );
        const focusSearch = sinon.spy();

        flounder.checkMultiTagKeydownNavigate( focusSearch, keycodes.LEFT, 0 );

        assert.equal( focusSearch.callCount, 0 );
        assert.equal( firstTag.focus.callCount, 0 );
    } );


    it( 'should focus on next right tag when right is pressed', done =>
    {
        document.body.flounder = null;

        const flounder    = new Flounder( document.body, {
            data            : [ 1, 2, 3 ],
            multipleTags    : true
        } );
        const refs        = flounder.refs;

        flounder.setByIndex( 1 );
        flounder.setByIndex( 2 );

        const lastTag = Array.prototype.slice.call(
            refs.multiTagWrapper.children, 0, -1 ).pop();

        sinon.stub( lastTag, 'focus', noop );
        const focusSearch = sinon.spy();

        flounder.checkMultiTagKeydownNavigate( focusSearch, keycodes.RIGHT, 0 );

        assert.equal( focusSearch.callCount, 0 );

        setTimeout( () =>
        {
            assert.equal( lastTag.focus.callCount, 1 );
            done();
        }, 100 );
    } );


    it( 'should focus on search when already on the right most tag', () =>
    {
        document.body.flounder = null;

        const flounder    = new Flounder( document.body, {
            data            : [ 1, 2, 3 ],
            multipleTags    : true
        } );
        const refs        = flounder.refs;

        flounder.setByIndex( 1 );

        const firstTag = refs.multiTagWrapper.firstChild;

        sinon.stub( firstTag, 'focus', noop );
        const focusSearch = sinon.spy();

        flounder.checkMultiTagKeydownNavigate( focusSearch, keycodes.RIGHT, 0 );

        assert.equal( focusSearch.callCount, 1 );
        assert.equal( firstTag.focus.callCount, 0 );
    } );
} );


/**
 * ## checkMultiTagKeydownRemove
 *
 * after a backspece while a multitag is focused, this removes the tag and
 * focus' on the next
 *
 * @param {DOMElement} focused multitag
 * @param {Function} focusSearch function to focus on the search field
 * @param {Number} index index of currently focused tag
 *
 * @return {Void} void
 */
describe( 'checkMultiTagKeydownRemove', () =>
{
    it( 'should focus on the search field if there are no siblings', () =>
    {
        document.body.flounder = null;

        const flounder  = new Flounder( document.body, {
            data            : [ 1, 2, 3 ],
            multipleTags    : true
        } );
        const refs      = flounder.refs;

        flounder.setByIndex( 1 );

        const tags          = Array.prototype.slice.call(
            refs.multiTagWrapper.children, 0, -1 );
        const firstTag      =  tags[ 0 ];
        const focusSearch   = sinon.spy();

        flounder.checkMultiTagKeydownRemove(
            firstTag, focusSearch, 0 );

        assert.equal( focusSearch.callCount, 1 );
    } );


    it( 'should focus on the previous tag whn there are more than 2', done =>
    {
        document.body.flounder = null;

        const flounder    = new Flounder( document.body, {
            data            : [ 1, 2, 3 ],
            multipleTags    : true
        } );
        const refs        = flounder.refs;

        flounder.setByIndex( 1 );
        flounder.setByIndex( 2 );
        flounder.setByIndex( 3 );

        const tags = Array.prototype.slice.call(
            refs.multiTagWrapper.children, 0, -1 );

        const targetTag = tags[ 1 ];

        const focusSearch = sinon.spy();

        sinon.stub( tags[ 0 ], 'focus', noop );
        flounder.checkMultiTagKeydownRemove( targetTag, focusSearch, 1 );

        assert.equal( focusSearch.callCount, 0 );

        setTimeout( () =>
        {
            assert.equal( tags[ 0 ].focus.callCount, 1 );
            tags[ 0 ].focus.restore();
            done();
        }, 100 );


    } );


    /*
            maybe not a complete test? it runs the code so should break if it
            doesnt work, but there were some weird things going on with
            the assertions
     */
    it( 'should focus on new first tag when the first one was removed', () =>
    {
        document.body.flounder = null;

        const flounder    = new Flounder( document.body, {
            data            : [ 1, 2, 3 ],
            multipleTags    : true
        } );
        const refs        = flounder.refs;

        flounder.setByIndex( 1 );
        flounder.setByIndex( 2 );
        flounder.setByIndex( 3 );

        const firstTag    = refs.multiTagWrapper.firstChild;
        const focusSearch = sinon.spy();

        flounder.checkMultiTagKeydownRemove( firstTag, focusSearch, 0 );

        assert.equal( focusSearch.callCount, 0 );
    } );
} );


/**
 * ## clearPlaceholder
 *
 * clears the placeholder
 *
 * @param {Object} e event object
 *
 * @return {Void} void
 */
describe( 'clearPlaceholder', () =>
{
    const flounder = new Flounder( document.body, {} );

    it( 'should clear the placeholder', () =>
    {
        flounder.clearPlaceholder();
        assert.equal( flounder.refs.selected.innerHTML, '' );
    } );
} );



/**
 * ## clickSet
 *
 * when a flounder option is clicked on it needs to set the option as selected
 *
 * @param {Object} e event object
 *
 * @return {Void} void
 */
describe( 'clickSet', () =>
{
    it( 'should set the clicked div\'s option as selected', () =>
    {
        document.body.flounder      = null;
        const flounder                = new Flounder( document.body, {} );
        flounder.multiple           = true;
        flounder.programmaticClick  = true;
        const e                       = {
            preventDefault  : sinon.spy(),
            stopPropagation : sinon.spy()
        };

        e[ flounder.multiSelect ]   = true;

        sinon.stub( flounder, 'setSelectValue', noop );
        sinon.stub( flounder, 'toggleList', noop );

        flounder.clickSet( e );

        assert.equal( flounder.setSelectValue.callCount, 1 );
        assert.equal( flounder.toggleList.callCount, 0 );

        flounder.setSelectValue.restore();
        flounder.toggleList.restore();
    } );


    it( 'should set the clicked div and toggle the list', () =>
    {
        document.body.flounder = null;
        const flounder    = new Flounder( document.body, {} );
        const e           = {
            preventDefault  : sinon.spy(),
            stopPropagation : sinon.spy()
        };

        sinon.stub( flounder, 'setSelectValue', noop );
        sinon.stub( flounder, 'toggleList', noop );

        flounder.clickSet( e );

        assert.equal( flounder.setSelectValue.callCount, 1 );
        assert.equal( flounder.toggleList.callCount, 1 );

        flounder.setSelectValue.restore();
        flounder.toggleList.restore();
    } );
} );



/**
 * ## displayMultipleTags
 *
 * handles the display and management of tags
 *
 * @param  {Array} selectedOptions currently selected options
 * @param  {DOMElement} selected div to display currently selected options
 *
 * @return {Void} void
 */
describe( 'displayMultipleTags', () =>
{
    const data = [
        'doge',
        'moon',
        'mon',
        'moin',
        'main'
    ];

    it( 'should create a tag for each selection', () =>
    {
        document.body.flounder = null;
        const flounder    = new Flounder( document.body, {
            multipleTags    : true,
            data            : data
        } );

        const refs            = flounder.refs;
        const refsData        = refs.selectOptions;
        const multiTagWrapper = refs.multiTagWrapper;

        flounder.displayMultipleTags( [ refsData[ 1 ], refsData[ 2 ] ],
            multiTagWrapper );

        const tags = Array.prototype.slice.call(
            multiTagWrapper.children, 0, -1 );

        assert.equal( tags.length, 2 );
    } );


    it( 'should re-add the placeholder if there are no tags', () =>
    {
        document.body.flounder = null;
        const flounder    = new Flounder( document.body, {
            multipleTags    : true,
            data            : data
        } );

        const refs            = flounder.refs;
        const multiTagWrapper = refs.multiTagWrapper;

        flounder.deselectAll();
        flounder.refs.selected.innerHTML = '';

        flounder.displayMultipleTags( [], multiTagWrapper );

        assert.equal( refs.selected.innerHTML, flounder.placeholder );
    } );
} );



/**
 * ## displaySelected
 *
 * formats and displays the chosen options
 *
 * @param {DOMElement} selected display area for the selected option(s)
 * @param {Object} refs element references
 *
 * @return {Void} void
 */
describe( 'displaySelected', () =>
{
    it( 'should display the selected option in refs.selected', () =>
    {
        const data = [
            'doge',
            'moon'
        ];

        const flounder    = new Flounder( document.body, {
            data            : data,
            defaultIndex    : 0
        } );

        flounder.refs.data[ 1 ].extraClass = 'extra!';
        flounder.setByIndex( 1 );

        const refs = flounder.refs;

        assert.equal( refs.selected.textContent, refs.data[ 1 ].textContent );
    } );
} );



/**
 * ## divertTarget
 *
 * @param {Object} e event object
 *
 * on interaction with the raw select box, the target will be diverted to
 * the corresponding flounder list element
 *
 * @return {Void} void
 */
describe( 'divertTarget', () =>
{
    it( 'should remove the plug if in ios', () =>
    {
        document.body.flounder = null;

        const flounder    = new Flounder( document.body, {
            data        : [ 1, 2, 3 ],
            multiple    : true
        } );
        const refs        = flounder.refs;
        const select      = refs.select;
        flounder.isIos  = true;

        const plug        = document.createElement( 'OPTION' );
        plug.className  = `${classes.PLUG}`;
        select.appendChild( plug );

        sinon.spy( select, 'removeChild' );
        sinon.stub( flounder, 'setSelectValue', noop );

        flounder.divertTarget( {
            type    : 'moon',
            target  : select
        } );

        assert.equal( select.removeChild.callCount, 1 );
        assert.equal( flounder.setSelectValue.callCount, 1 );

        flounder.divertTarget( {
            type    : 'moon',
            target  : select
        } );

        assert.equal( select.removeChild.callCount, 1 );
        assert.equal( flounder.setSelectValue.callCount, 2 );
    } );


    it( 'should close the list if not multiple select', () =>
    {
        let select      = document.querySelector( 'SELECT' );
        select.flounder = null;

        const flounder    = new Flounder( select, {
            data                    : [ 1, 2, 3 ],
            keepChangesOnDestroy    : true,
            selectDataOverride      : true
        } );
        const refs        = flounder.refs;
        select          = refs.select;

        const plug        = document.createElement( 'OPTION' );
        plug.className  = `${classes.PLUG}`;
        select.appendChild( plug );

        sinon.stub( select, 'removeChild', noop );
        sinon.stub( flounder, 'setSelectValue', noop );
        sinon.stub( flounder, 'toggleList', noop );

        flounder.divertTarget( {
            type    : 'moon',
            target  : select
        } );

        assert.equal( select.removeChild.callCount, 0 );
        assert.equal( flounder.setSelectValue.callCount, 1 );
        assert.equal( flounder.toggleList.callCount, 1 );
    } );


    it( 'should prevent default if multiple tags', () =>
    {
        document.body.flounder = null;

        const flounder    = new Flounder( document.body, {
            data            : [ 1, 2, 3 ],
            multipleTags    : true
        } );

        const select    = flounder.refs.select;

        const plug      = document.createElement( 'OPTION' );
        plug.className  = `${classes.PLUG}`;
        select.appendChild( plug );

        sinon.stub( select, 'removeChild', noop );
        sinon.stub( flounder, 'setSelectValue', noop );
        sinon.stub( flounder, 'toggleList', noop );

        const preventDefault     = sinon.spy();
        const stopPropagation    = sinon.spy();

        flounder.divertTarget( {
            type            : 'moon',
            target          : select,
            preventDefault,
            stopPropagation
        } );

        assert.equal( preventDefault.callCount, 1 );
        assert.equal( stopPropagation.callCount, 1 );
    } );
} );



/**
 * ## firstTouchController
 *
 * on first interaction, onFirstTouch is run, then the event listener is
 * removed
 *
 * @param {Object} e event object
 *
 * @return {Void} void
 */
describe( 'firstTouchController', () =>
{
    it( 'should fail properly', () =>
    {
        document.body.flounder = null;

        const flounder    = new Flounder( document.body, {
            data            : [ 1, 2, 3 ],
            multipleTags    : true
        } );

        flounder.onFirstTouch = () => a + b; // eslint-disable-line

        sinon.stub( console, 'warn', noop );

        flounder.firstTouchController( {} );

        assert.equal( console.warn.callCount, 1 );

        console.warn.restore();
    } );
} );


/**
 * ## hideEmptySection
 *
 * Check if the provided element is indeed a section. If it is, check if
 * it must to be shown or hidden.
 *
 * @param {DOMElement} se the section to be checked
 *
 * @return {Void} void
 */
describe( 'hideEmptySection', () =>
{
    it( 'should hide sections that have no visible content', () =>
    {
        document.body.flounder = null;

        const flounder    = new Flounder( document.body, {
            data : [
                'doge',
                {
                    header : 'top',
                    data    : [ {
                        text  : 'doge',
                        value : 'doge'
                    } ]
                },
                {
                    header : 'empty',
                    data    : []
                },
                {
                    header : 'bottom',
                    data    : [ {
                        text  : 'moon',
                        value : 'moon'
                    } ]
                }
            ]
        } );

        const selectedClass = flounder.selectedClass;

        const secShowing    = flounder.refs.sections[ 0 ];
        flounder.hideEmptySection( secShowing );
        assert.equal( utils.hasClass( secShowing, selectedClass ), false );

        const secHidden     = flounder.refs.sections[ 1 ];
        flounder.hideEmptySection( secHidden );
        assert.equal( utils.hasClass( secHidden, selectedClass ), true );
    } );
} );


/**
 * ## removeHoverClass
 *
 * removes a hover class from an element
 *
 * @return Void_
 */
describe( 'removeHoverClass', () =>
{
    it( 'should remove a hover class to it\'s triggered element', () =>
    {
        document.body.flounder = null;

        const flounder    = new Flounder( document.body, {
            data : [ 1, 2, 3 ]
        } );

        const el = document.createElement( 'DIV' );
        el.className = flounder.classes.HOVER;

        flounder.removeHoverClass( {
            target : el
        } );
        assert.equal( utils.hasClass( el, flounder.classes.HOVER ), false );
    } );
} );



/**
 * ## removeListeners
 *
 * removes event listeners from flounder.  normally pre unload
 *
 * @return {Void} void
 */
describe( 'removeListeners', () =>
{
    let flounder;

    beforeEach( () =>
    {
        document.body.flounder = null;

        flounder    = new Flounder( document.body, {} );
        flounder.removeListeners( {} );

        sinon.stub( flounder, 'divertTarget', noop );
        sinon.stub( flounder, 'toggleList', noop );
        sinon.stub( flounder, 'checkFlounderKeypress', noop );
        sinon.stub( flounder, 'removeOptionsListeners', noop );
        sinon.stub( flounder, 'removeSearchListeners', noop );

        flounder.addListeners( flounder.refs );
    } );


    afterEach( () =>
    {
        flounder.divertTarget.restore();
        flounder.toggleList.restore();
        flounder.checkFlounderKeypress.restore();
        flounder.removeOptionsListeners.restore();
        flounder.removeSearchListeners.restore();
    } );


    it( 'should react on change, click, and keydown events', () =>
    {
        const refs        = flounder.refs;
        flounder.isIos  = false;

        flounder.removeListeners( refs );

        simulant.fire( refs.select, 'change' );
        simulant.fire( refs.selected, 'click' );
        simulant.fire( refs.flounder, 'keydown' );

        assert.equal( flounder.divertTarget.callCount, 0 );
        assert.equal( flounder.removeOptionsListeners.callCount, 1 );
        assert.equal( flounder.checkFlounderKeypress.callCount, 0 );
        assert.equal( flounder.toggleList.callCount, 0 );
    } );




    it( 'should bind mouseenter to the wrapper if openOnHover is set', () =>
    {
        const refs        = flounder.refs;

        flounder.isIos  = true;
        flounder.props.openOnHover = true;
        flounder.search = true;

        flounder.removeListeners( refs );

        simulant.fire( refs.wrapper, 'mouseenter' );
        simulant.fire( refs.wrapper, 'mouseleave' );

        assert.equal( flounder.removeSearchListeners.callCount, 1 );
        assert.equal( flounder.toggleList.callCount, 0 );
    } );
} );



/**
 * ## removeMultiTag
 *
 * removes a multi selection tag on click; fixes all references to value
 * and state
 *
 * @param  {Object} e event object
 *
 * @return {Void} void
 */
describe( 'removeMultiTag', () =>
{
    it( 'should remove a tag and deselect the option', () =>
    {
        document.body.flounder = null;

        const flounder        = new Flounder( document.body, {
            data            : [ 1, 2, 3 ],
            multipleTags    : true
        } );
        const refs            = flounder.refs;
        const multiTagWrapper = refs.multiTagWrapper;

        flounder.setByIndex( 1 );
        flounder.setByIndex( 2 );

        const preventDefault     = sinon.spy();
        const stopPropagation    = sinon.spy();

        const target      = multiTagWrapper.children[ 0 ].children[ 0 ];
        const targetIndex = target.getAttribute( 'data-index' );

        refs.select[ targetIndex ] = target;

        flounder.removeMultiTag( {
            target          : target,
            preventDefault  : preventDefault,
            stopPropagation : stopPropagation
        } );

        const tags = Array.prototype.slice.call(
            refs.multiTagWrapper.children, 0, -1 );

        assert.equal( tags.length, 1 );
        assert.equal( preventDefault.callCount, 1 );
        assert.equal( stopPropagation.callCount, 1 );
    } );


    it( 'should add the placeholder if there is nothing more selected', () =>
    {
        document.body.flounder = null;

        const flounder        = new Flounder( document.body, {
            data            : [ 1, 2, 3 ],
            multipleTags    : true
        } );
        const refs            = flounder.refs;
        const multiTagWrapper = refs.multiTagWrapper;

        flounder.setByIndex( 1 );

        const preventDefault     = sinon.spy();
        const stopPropagation    = sinon.spy();

        sinon.stub( flounder, 'addPlaceholder', noop );

        const target      = multiTagWrapper.children[ 0 ].children[ 0 ];
        const targetIndex = target.getAttribute( 'data-index' );

        refs.select[ targetIndex ] = refs.select.options[ targetIndex ];

        flounder.removeMultiTag( {
            target          : target,
            preventDefault  : preventDefault,
            stopPropagation : stopPropagation
        } );

        assert.equal( multiTagWrapper.children.length, 1 );
        assert.equal( preventDefault.callCount, 1 );
        assert.equal( stopPropagation.callCount, 1 );
        assert.equal( flounder.addPlaceholder.callCount, 1 );
    } );



    it( 'should catch onChange failures', () =>
    {
        document.body.flounder = null;

        const flounder        = new Flounder( document.body, {
            data            : [ 1, 2, 3 ],
            multipleTags    : true
        } );
        const refs            = flounder.refs;
        const multiTagWrapper = refs.multiTagWrapper;

        flounder.onChange   =  () => a + b; // eslint-disable-line

        flounder.setByIndex( 1 );

        const preventDefault     = sinon.spy();
        const stopPropagation    = sinon.spy();
        sinon.stub( console, 'warn', noop );

        const target      = multiTagWrapper.children[ 0 ].children[ 0 ];
        const targetIndex = target.getAttribute( 'data-index' );

        refs.select[ targetIndex ] = refs.select.options[ targetIndex ];

        flounder.removeMultiTag( {
            target          : target,
            preventDefault  : preventDefault,
            stopPropagation : stopPropagation
        } );

        assert.equal( preventDefault.callCount, 1 );
        assert.equal( stopPropagation.callCount, 1 );
        assert.equal( console.warn.callCount, 1 );

        console.warn.restore();
    } );
} );


/**
 * ## removeOptionsListeners
 *
 * removes event listeners on the data divs
 *
 * @return {Void} void
 */
describe( 'removeOptionsListeners', () =>
{
    let flounder;

    beforeEach( () =>
    {
        document.body.flounder = null;
        flounder = new Flounder( document.body, {
            data            : [ 1, 2, 3 ],
            multipleTags    : true,
            defaultValue    : 1
        } );

        flounder.removeOptionsListeners();

        flounder.refs.data[ 1 ] = document.createElement( 'NOTADIV' );

        sinon.stub( flounder, 'addHoverClass', noop );
        sinon.stub( flounder, 'removeHoverClass', noop );
        sinon.stub( flounder, 'clickSet', noop );

        flounder.addOptionsListeners();
    } );


    afterEach( () =>
    {
        flounder.addHoverClass.restore();
        flounder.removeHoverClass.restore();
        flounder.clickSet.restore();
    } );


    it( 'should remove hover and click listeners on each data div', () =>
    {
        flounder.removeOptionsListeners();

        const firstData = flounder.refs.data[ 0 ];

        simulant.fire( firstData, 'mouseenter' );
        simulant.fire( firstData, 'mouseleave' );
        simulant.fire( firstData, 'click' );

        simulant.fire( flounder.refs.data[ 1 ], 'click' );


        assert.equal( flounder.addHoverClass.callCount, 0 );
        assert.equal( flounder.removeHoverClass.callCount, 0 );
        assert.equal( flounder.clickSet.callCount, 0 );
    } );
} );



/**
 * ## addNoMoreOptionsMessage
 *
 * Adding 'No More Options' message to the option list
 *
 * @return {Void} void
 */
describe( 'removeNoMoreOptionsMessage', () =>
{
    it( 'should remove the noMoreOptions message', () =>
    {
        document.body.flounder = null;
        const flounder = new Flounder( document.body, {
            data : [ 1, 2, 3 ]
        } );

        flounder.addNoMoreOptionsMessage();
        flounder.removeNoMoreOptionsMessage();

        assert.equal( typeof flounder.refs.noMoreOptionsEl, 'undefined' );
    } );
} );



/**
 * ## addNoResultsMessage
 *
 * Adding 'No Results' message to the option list
 *
 * @return {Void} void
 */
describe( 'removeNoResultsMessage', () =>
{
    it( 'should remove the noResults message', () =>
    {
        document.body.flounder = null;
        const flounder = new Flounder( document.body, {
            data : [ 1, 2, 3 ]
        } );

        flounder.addNoResultsMessage();
        flounder.removeNoResultsMessage();

        assert.equal( typeof flounder.refs.noResultsEl, 'undefined' );
    } );
} );



/**
 * ## removeSearchListeners
 *
 * removes the listeners from the search input
 *
 * @return {Void} void
 */
describe( 'removeSearchListeners', () =>
{
    let flounder;

    beforeEach( () =>
    {
        document.body.flounder = null;
        flounder = new Flounder( document.body, {
            data    : [ 1, 2, 3 ],
            search  : true
        } );


        sinon.stub( flounder, 'toggleListSearchClick', noop );
        sinon.stub( flounder, 'fuzzySearch', noop );
        sinon.stub( flounder, 'clearPlaceholder', noop );
    } );


    afterEach( () =>
    {
        flounder.toggleListSearchClick.restore();
        flounder.fuzzySearch.restore();
        flounder.clearPlaceholder.restore();
    } );


    it( 'should remove the correct events and functions', () =>
    {
        flounder.removeSearchListeners();
        const search = flounder.refs.search;

        simulant.fire( search, 'click' );
        simulant.fire( search, 'keyup' );
        search.focus();

        assert.equal( flounder.toggleListSearchClick.callCount, 0 );
        assert.equal( flounder.fuzzySearch.callCount, 0 );
        assert.equal( flounder.clearPlaceholder.callCount, 0 );
    } );
} );



/**
 * ## removeSelectedClass
 *
 * removes the [[this.selectedClass]] from all data
 *
 * @return {Void} void
 */
describe( 'removeSelectedClass', () =>
{
    it( 'should remove the selected class', () =>
    {

        document.body.flounder = null;

        const flounder        = new Flounder( document.body, {
            data            : [ 1, 2, 3 ],
            multipleTags    : true
        } );
        const refs            = flounder.refs;

        flounder.setByIndex( 1 );
        flounder.setByIndex( 2 );

        flounder.removeSelectedClass();
        const selected = refs.optionsList.querySelectorAll(
                                            '.flounder__option--selected' );

        assert.equal( selected.length, 0 );
    } );
} );



/**
 * ## removeSelectedValue
 *
 * sets the selected property to false for all data
 *
 * @return {Void} void
 */
describe( 'removeSelectedValue', () =>
{
    it( 'should remove the selected value', () =>
    {

        document.body.flounder = null;

        const flounder        = new Flounder( document.body, {
            data            : [ 1, 2, 3 ],
            multipleTags    : true
        } );

        flounder.setByIndex( 1 );
        flounder.setByIndex( 2 );

        flounder.removeSelectedValue();

        assert.equal( flounder.getSelected().length, 0 );
    } );
} );



/**
 * ## removeSelectKeyListener
 *
 * disables the event listener on the native select box
 *
 * @return {Void} void
 */
describe( 'removeSelectKeyListener', () =>
{
    let flounder;

    beforeEach( () =>
    {
        document.body.flounder = null;
        flounder = new Flounder( document.body, {
            data    : [ 1, 2, 3 ],
            search  : true
        } );


        flounder.removeSelectKeyListener();

        sinon.stub( flounder, 'setSelectValue', noop );

        flounder.addSelectKeyListener();
    } );


    afterEach( () =>
    {
        flounder.setSelectValue.restore();
    } );


    it( 'should remove the keyup function', () =>
    {
        flounder.removeSelectKeyListener();
        const select = flounder.refs.select;

        simulant.fire( select, 'keyup' );

        assert.equal( flounder.setSelectValue.callCount, 0 );
    } );
} );



/**
 * ## setKeypress
 *
 * handles arrow key and enter selection
 *
 * @param {Object} e event object
 *
 * @return {Void} void
 */
describe( 'setKeypress', () =>
{
    it( 'should close the menu and add the placeholder on tab', () =>
    {
        document.body.flounder = null;
        const flounder = new Flounder( document.body, {
            data    : [ 1, 2, 3 ],
            search  : true
        } );

        const e = {
            keyCode : keycodes.TAB
        };

        sinon.stub( flounder, 'addPlaceholder', noop );
        sinon.stub( flounder, 'toggleClosed', noop );

        flounder.setKeypress( e );

        assert.equal( flounder.addPlaceholder.callCount, 1 );
        assert.equal( flounder.toggleClosed.callCount, 1 );

        flounder.addPlaceholder.restore();
        flounder.toggleClosed.restore();
    } );


    it( 'should ignore the keypress if it is a non character key', () =>
    {
        document.body.flounder = null;
        const flounder = new Flounder( document.body, {
            data    : [ 1, 2, 3 ],
            search  : true
        } );


        sinon.stub( flounder, 'setKeypressElement', noop );
        sinon.stub( flounder, 'toggleList', noop );

        const res = flounder.setKeypress( {
            keyCode : 16
        } );

        assert.equal( flounder.setKeypressElement.callCount, 0 );
        assert.equal( flounder.toggleList.callCount, 0 );

        assert.equal( res, undefined );
    } );


    it( 'should toggle the list on enter, escape, and space', () =>
    {
        let res;

        document.body.flounder = null;
        const flounder = new Flounder( document.body, {
            data : [ 1, 2, 3 ]
        } );

        sinon.stub( flounder, 'toggleList', noop );

        res = flounder.setKeypress( {
            keyCode : keycodes.ENTER
        } );
        assert.equal( res, false );

        res = flounder.setKeypress( {
            keyCode : keycodes.SPACE
        } );
        assert.equal( res, false );

        res = flounder.setKeypress( {
            keyCode : keycodes.ESCAPE
        } );
        assert.equal( res, false );

        assert.equal( flounder.toggleList.callCount, 3 );
    } );


    it( 'should change the selected element on up and down', () =>
    {
        document.body.flounder = null;
        let flounder = new Flounder( document.body, {
            data : [ 1, 2, 3 ]
        } );

        sinon.stub( flounder, 'setKeypressElement', noop );
        const preventDefault = sinon.spy();

        flounder.setKeypress( {
            keyCode         : keycodes.UP,
            preventDefault  : preventDefault
        } );

        window.sidebar = true;
        flounder.setKeypress( {
            keyCode         : keycodes.DOWN,
            preventDefault  : preventDefault
        } );

        assert.equal( preventDefault.callCount, 1 );
        assert.equal( flounder.setKeypressElement.callCount, 2 );

        document.body.flounder = null;
        flounder = new Flounder( document.body, {
            data    : [ 1, 2, 3 ],
            search  : true
        } );


        window.sidebar = false;
        sinon.stub( flounder, 'setKeypressElement', noop );
        flounder.setKeypress( {
            keyCode         : keycodes.DOWN,
            preventDefault  : preventDefault
        } );
    } );


    it( 'should pass anything else through unaffected', () =>
    {
        document.body.flounder = null;
        const flounder = new Flounder( document.body, {
            data : [ 1, 2, 3 ]
        } );

        sinon.stub( flounder, 'setKeypressElement', noop );
        const preventDefault = sinon.spy();

        flounder.setKeypress( {
            keyCode         : 999,
            preventDefault  : preventDefault
        } );

        assert.equal( preventDefault.callCount, 0 );
        assert.equal( flounder.setKeypressElement.callCount, 0 );
    } );
} );



/**
 * ## setKeypressElement
 *
 * sets the element after the keypress.  if the element is hidden for some
 * reason, it passes the event back to setKeypress to process the next element
 *
 * @return {Void} void
 */
describe( 'setKeypressElement', () =>
{
    it( 'should rotate top to bottom and bottom to top on min and max', () =>
    {
        document.body.flounder = null;
        const flounder = new Flounder( document.body, {
            data    : [ 1, 2, 3 ],
            search  : true
        } );


        sinon.stub( flounder, 'setKeypress', noop );

        flounder.setKeypressElement( {}, 9 );
        flounder.setKeypressElement( {}, -9 );

        assert.equal( flounder.setKeypress.callCount, 0 );
    } );


    it( 'should skip disabled and hidden items', () =>
    {
        document.body.flounder = null;
        const flounder = new Flounder( document.body, {
            data    : [ 1, 2, 3 ],
            search  : true
        } );


        sinon.stub( flounder, 'setKeypress', noop );

        flounder.disableByIndex( 1 );
        flounder.setByIndex( 0 );
        flounder.setKeypressElement( {}, 1 );

        assert.equal( flounder.setKeypress.callCount, 1 );
    } );
} );



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
 * @return {Void} void
 */
describe( 'setSelectValue', () =>
{
    it( 'should decide whether it\'s a click or keypress', () =>
    {
        document.body.flounder = null;
        const flounder = new Flounder( document.body, {
            data : [ 1, 2, 3 ]
        } );

        sinon.stub( flounder, 'setSelectValueClick', noop );
        sinon.stub( flounder, 'setSelectValueButton', noop );

        flounder.setSelectValue( null, {} );
        flounder.setSelectValue( {} );

        assert.equal( flounder.setSelectValueClick.callCount, 1 );
        assert.equal( flounder.setSelectValueButton.callCount, 1 );
    } );


    it( 'should only run onChange if it is not a programatic click', () =>
    {
        document.body.flounder = null;
        const flounder = new Flounder( document.body, {
            data : [ 1, 2, 3 ]
        } );

        sinon.stub( flounder, 'setSelectValueClick', noop );
        sinon.stub( flounder, 'onChange', noop );

        flounder.programmaticClick = true;
        flounder.setSelectValue( null, {} );

        assert.equal( flounder.setSelectValueClick.callCount, 1 );

        flounder.programmaticClick = false;
        flounder.setSelectValue( null, {} );

        assert.equal( flounder.setSelectValueClick.callCount, 2 );
        assert.equal( flounder.onChange.callCount, 1 );
    } );


    it( 'should warn when onChange fails', () =>
    {
        document.body.flounder = null;
        const flounder = new Flounder( document.body, {
            data : [ 1, 2, 3 ]
        } );

        sinon.stub( flounder, 'setSelectValueButton', noop );
        sinon.stub( flounder, 'onChange', () => a + b ); // eslint-disable-line
        sinon.stub( console, 'warn', noop );

        flounder.setSelectValue( {
            keyCode : 99
        } );

        assert.equal( console.warn.callCount, 1 );
        assert.equal( flounder.onChange.callCount, 1 );

        console.warn.restore();
    } );


    it( 'should ignore the keypress if the list was just opened', () =>
    {
        document.body.flounder = null;
        const flounder = new Flounder( document.body, {
            data : [ 1, 2, 3 ]
        } );

        sinon.stub( flounder, 'setSelectValueButton', noop );
        sinon.stub( flounder, 'onChange', noop );

        flounder.toggleList.justOpened = true;
        flounder.setSelectValue( {
            keyCode : 99
        } );

        assert.equal( flounder.toggleList.justOpened, false );
        assert.equal( flounder.onChange.callCount, 0 );
    } );
} );



/**
 * ## setSelectValueButton
 *
 * processes the setting of a value after a keypress event
 *
 * @return {Void} void
 */
describe( 'setSelectValueButton', () =>
{
    it( 'should remove the selected class and scroll to selected option', () =>
    {
        document.body.flounder = null;
        const flounder = new Flounder( document.body, {
            data            : [ 1, 2, 3 ],
            defaultIndex    : 1
        } );

        sinon.spy( flounder, 'removeSelectedClass' );
        sinon.stub( utils, 'scrollTo', noop );

        flounder.setSelectValueButton();
        assert.equal( flounder.removeSelectedClass.callCount, 1 );

        sinon.stub( flounder, 'getSelected', () =>
        {
            return [];
        } );
        flounder.setSelectValueButton();

        assert.equal( flounder.removeSelectedClass.callCount, 2 );
        assert.equal( utils.scrollTo.callCount, 1 );
        utils.scrollTo.restore();
    } );


    it( 'should not do anything if it\'s a multipleTag Flounder', () =>
    {
        document.body.flounder = null;
        const flounder = new Flounder( document.body, {
            data            : [ 1, 2, 3 ],
            multipleTags    : true
        } );

        sinon.stub( flounder, 'removeSelectedClass', noop );

        const res = flounder.setSelectValueButton();

        assert.equal( res, false );
        assert.equal( flounder.removeSelectedClass.callCount, 0 );
    } );
} );



/**
 * ## setSelectValueClick
 *
 * processes the setting of a value after a click event
 *
 * @param {Object} e event object
 *
 * @return {Void} void
 */
describe( 'setSelectValueClick', () =>
{
    it( 'should add the selected class', () =>
    {
        document.body.flounder  = null;
        const flounder          = new Flounder( document.body, {
            placeholder : 'nothing selected', // placeholder is data[ 0 ]
            data        : [ 1, 2, 3 ]
        } );
        const refs        = flounder.refs;

        sinon.stub( flounder, 'deselectAll', noop );

        const res1 = utils.hasClass( refs.data[ 1 ], flounder.selectedClass );

        flounder.setSelectValueClick( {
            target : refs.data[ 1 ]
        } );

        const res2 = utils.hasClass( refs.data[ 1 ], flounder.selectedClass );

        assert.equal( res1, !res2 );
        assert.equal( flounder.deselectAll.callCount, 1 );
    } );

    it( 'should toggle the selected class on both options and sections', () =>
    {
        document.body.flounder  = null;
        const flounder          = new Flounder( document.body, {
            data : [
                'doge',                 // data[ 0 ] - selected by default
                'moon',                 // data[ 1 ]
                {
                    header : 'top',     // section [ 0 ]
                    data    : [ {
                        text  : 'doge', // data[2]
                        value : 'doge'
                    } ]
                },
                {
                    header : 'empty',   // section [ 1 ]
                    data    : []
                },
                {
                    header : 'bottom',  // section [ 2 ]
                    data    : [ {
                        text  : 'moon', // data[ 3 ]
                        value : 'moon'
                    } ]
                }
            ]
        } );

        const refs  = flounder.refs;

        assert.equal( refs.data.length, 4 );
        assert.equal( refs.sections.length, 3 );

        const res1a = utils.hasClass( refs.data[ 0 ], flounder.selectedClass );
        const res2a = utils.hasClass( refs.data[ 1 ], flounder.selectedClass );
        const res3a = utils.hasClass( refs.data[ 2 ], flounder.selectedClass );
        const res4a = utils.hasClass( refs.data[ 3 ], flounder.selectedClass );
        const res5a = utils.hasClass( refs.sections[ 0 ],
                                                    flounder.selectedClass );
        const res6a = utils.hasClass( refs.sections[ 1 ],
                                                    flounder.selectedClass );
        const res7a = utils.hasClass( refs.sections[ 2 ],
                                                    flounder.selectedClass );

        // Select option 2.
        flounder.setSelectValueClick( {
            target : refs.data[ 2 ]
        } );

        const res1b = utils.hasClass( refs.data[ 0 ], flounder.selectedClass );
        const res2b = utils.hasClass( refs.data[ 1 ], flounder.selectedClass );
        const res3b = utils.hasClass( refs.data[ 2 ], flounder.selectedClass );
        const res4b = utils.hasClass( refs.data[ 3 ], flounder.selectedClass );
        const res5b = utils.hasClass( refs.sections[ 0 ],
                                                    flounder.selectedClass );
        const res6b = utils.hasClass( refs.sections[ 1 ],
                                                    flounder.selectedClass );
        const res7b = utils.hasClass( refs.sections[ 2 ],
                                                    flounder.selectedClass );

        assert.equal( res1a, !res1b );
        assert.equal( res2a,  res2b );
        assert.equal( res3a, !res3b );
        assert.equal( res4a,  res4b );
        assert.equal( res5a, !res5b );
        assert.equal( res6a,  res6b );
        assert.equal( res7a,  res7b );

        // Select option 3
        flounder.setSelectValueClick( {
            target : refs.data[ 3 ]
        } );

        const res1c = utils.hasClass( refs.data[ 0 ], flounder.selectedClass );
        const res2c = utils.hasClass( refs.data[ 1 ], flounder.selectedClass );
        const res3c = utils.hasClass( refs.data[ 2 ], flounder.selectedClass );
        const res4c = utils.hasClass( refs.data[ 3 ], flounder.selectedClass );
        const res5c = utils.hasClass( refs.sections[ 0 ],
                                                    flounder.selectedClass );
        const res6c = utils.hasClass( refs.sections[ 1 ],
                                                    flounder.selectedClass );
        const res7c = utils.hasClass( refs.sections[ 2 ],
                                                    flounder.selectedClass );

        assert.equal( res1a, !res1c );
        assert.equal( res2a,  res2c );
        assert.equal( res3a,  res3c );
        assert.equal( res4a, !res4c );
        assert.equal( res5a,  res5c );
        assert.equal( res6a,  res6c );
        assert.equal( res7a, !res7c );

    } );
} );



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
 * @return {Void} void
 */
describe( 'toggleClosed', () =>
{
    it( 'should close the options list and remove necessary listeners', done =>
    {
        document.body.flounder  = null;
        const flounder            = new Flounder( document.body, {
            data    : [ 1, 2, 3 ],
            search  : true
        } );

        const refs                = flounder.refs;

        sinon.stub( utils, 'addClass', noop );
        sinon.stub( utils, 'removeClass', noop );

        sinon.stub( flounder, 'removeSelectKeyListener', noop );
        sinon.stub( flounder, 'fuzzySearchReset', noop );
        sinon.stub( refs.flounder, 'focus', noop );
        sinon.stub( flounder, 'onClose', noop );

        flounder.toggleClosed( {}, {}, refs, refs.wrapper );

        assert.equal( flounder.fuzzySearchReset.callCount, 1 );
        assert.equal( flounder.onClose.callCount, 1 );
        assert.equal( utils.addClass.callCount, 1 );
        assert.equal( utils.removeClass.callCount, 1 );

        utils.addClass.restore();
        utils.removeClass.restore();

        setTimeout( () =>
        {
            assert.equal( refs.flounder.focus.callCount, 1 );
            refs.flounder.focus.restore();
            done();
        }, 100 );
    } );


    it( 'should correctly handle onClose failures', () =>
    {
        document.body.flounder  = null;
        const flounder            = new Flounder( document.body, {
            data : [ 1, 2, 3 ]
        } );
        const refs                = flounder.refs;

        sinon.stub( utils, 'addClass', noop );
        sinon.stub( utils, 'removeClass', noop );

        sinon.stub( console, 'warn', noop );
        sinon.stub( flounder, 'onClose', () => a + b ); // eslint-disable-line

        flounder.toggleClosed( {}, {}, refs, refs.wrapper );

        assert.equal( console.warn.callCount, 1 );

        console.warn.restore();
        utils.addClass.restore();
        utils.removeClass.restore();
    } );


    it( 'should skip focus on exit bool', () =>
    {
        document.body.flounder  = null;
        const flounder            = new Flounder( document.body, {
            data : [ 1, 2, 3 ]
        } );
        const refs                = flounder.refs;

        sinon.stub( utils, 'addClass', noop );
        sinon.stub( utils, 'removeClass', noop );

        sinon.stub( refs.flounder, 'focus', noop );

        flounder.toggleClosed( {}, {}, refs, refs.wrapper, true );

        assert.equal( refs.flounder.focus.callCount, 0 );

        utils.addClass.restore();
        utils.removeClass.restore();
    } );



    it( 'should skip everything if not ready', () =>
    {
        document.body.flounder  = null;
        const flounder          = new Flounder( document.body, {
            data : [
                {
                    text        : 1,
                    value       : 1,
                    disabled    : true
                },
                2,
                3
            ]
        } );

        flounder.ready          = false;
        const refs                = flounder.refs;

        sinon.stub( utils, 'addClass', noop );
        sinon.stub( utils, 'removeClass', noop );

        sinon.stub( flounder, 'onClose', noop );

        flounder.toggleClosed( {}, {}, refs, refs.wrapper, true );

        assert.equal( flounder.onClose.callCount, 0 );

        utils.addClass.restore();
        utils.removeClass.restore();
    } );
} );



/**
 * ## toggleList
 *
 * on click of flounder--selected, this shows or hides the options list
 *
 * @param {String} force toggle can be forced by passing 'open' or 'close'
 *
 * @return {Void} void
 */
describe( 'toggleList', () =>
{
    it( 'should open and close the list', () =>
    {
        document.body.flounder  = null;
        const flounder          = new Flounder( document.body, {
            data : [ 1, 2, 3 ]
        } );

        sinon.stub( flounder, 'toggleOpen', noop );
        sinon.stub( flounder, 'toggleClosed', noop );

        flounder.toggleList( {
            type : 'mouseleave'
        } );

        flounder.toggleList( {}, 'close' );

        flounder.toggleList( {
            type : 'mouseenter'
        } );
        flounder.toggleList( {
            type : 'keydown'
        } );
        flounder.toggleList( {}, 'open' );

        assert.equal( flounder.toggleClosed.callCount, 2 );
        assert.equal( flounder.toggleOpen.callCount, 3 );
    } );
} );



/**
 * ## toggleListSearchClick
 *
 * toggleList wrapper for search.  only triggered if flounder is closed
 *
 * @return {Void} void
 */
describe( 'toggleListSearchClick', () =>
{
    it( 'should trigger toggleList only if flounder is closed', () =>
    {
        document.body.flounder  = null;
        const flounder          = new Flounder( document.body, {
            data : [ 1, 2, 3 ]
        } );
        const refs              = flounder.refs;
        const wrapper           = refs.wrapper;

        sinon.stub( flounder, 'toggleList', noop );

        utils.addClass( wrapper, classes.OPEN );
        flounder.toggleListSearchClick( {} );
        assert.equal( utils.hasClass( wrapper, classes.OPEN ), true );


        utils.removeClass( wrapper, classes.OPEN );
        flounder.toggleListSearchClick( {} );

        assert.equal( flounder.toggleList.callCount, 1 );
    } );
} );



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
 * @return {Void} void
 */
describe( 'toggleOpen', () =>
{
    it( 'should open the options list and add necessary listeners', done =>
    {
        document.body.flounder  = null;
        const flounder          = new Flounder( document.body, {
            data    : [ 1, 2, 3 ],
            search  : true
        } );

        const refs              = flounder.refs;

        sinon.stub( utils, 'addClass', noop );
        sinon.stub( utils, 'removeClass', noop );

        sinon.stub( refs.search, 'focus', noop );
        sinon.stub( flounder, 'onOpen', noop );

        flounder.toggleOpen( {}, refs.optionList, refs, refs.wrapper );

        assert.equal( flounder.onOpen.callCount, 1 );

        assert.equal( utils.addClass.callCount, 1 );
        assert.equal( utils.removeClass.callCount, 1 );

        utils.addClass.restore();
        utils.removeClass.restore();

        setTimeout( () =>
        {
            assert.equal( refs.search.focus.callCount, 1 );
            done();
        }, 100 );
    } );

    it( 'should call addSelectKeyListener when search is disabled', () =>
    {
        document.body.flounder  = null;
        const flounder          = new Flounder( document.body, {
            data    : [ 1, 2, 3 ],
            search  : false
        } );

        const refs              = flounder.refs;

        sinon.stub( flounder, 'addSelectKeyListener', noop );

        flounder.toggleOpen( {}, refs.optionList, refs, refs.wrapper );

        assert.equal( flounder.addSelectKeyListener.callCount, 1 );
    } );

    it( 'should not call addSelectKeyListener when search is enabled', () =>
    {
        document.body.flounder  = null;
        const flounder          = new Flounder( document.body, {
            data    : [ 1, 2, 3 ],
            search  : true
        } );

        const refs              = flounder.refs;

        sinon.stub( flounder, 'addSelectKeyListener', noop );

        flounder.toggleOpen( {}, refs.optionList, refs, refs.wrapper );

        assert.equal( flounder.addSelectKeyListener.callCount, 0 );
    } );


    it( 'should add a no more options message if all are selected', () =>
    {
        document.body.flounder  = null;
        const flounder          = new Flounder( document.body, {
            data            : [ 1 ],
            multipleTags    : true,
            placeholder     : 'moon'
        } );

        flounder.setByValue( 1 );
        flounder.toggleOpen( {}, {}, flounder.refs );

        assert.equal( typeof flounder.refs.noMoreOptionsEl, 'object' );
    } );



    it( 'should correctly handle onOpen failures', () =>
    {
        document.body.flounder  = null;
        const flounder          = new Flounder( document.body, {
            classes : {
                wrapper : 'maymay'
            },
            data    : [
                {
                    header : 'header test',
                    data   : [
                        {
                            text    : 1,
                            value   : 1
                        },
                        2
                    ]
                },
                3
            ],
            allowHTML   : true,
            multiple    : true
        } );

        const refs                = flounder.refs;

        sinon.stub( utils, 'addClass', noop );
        sinon.stub( utils, 'removeClass', noop );

        sinon.stub( console, 'warn', noop );
        sinon.stub( flounder, 'onOpen', () => a + b ); // eslint-disable-line

        flounder.toggleOpen( {}, {}, refs, refs.wrapper );

        assert.equal( console.warn.callCount, 1 );

        console.warn.restore();
        utils.addClass.restore();
        utils.removeClass.restore();
    } );



    it( 'should skip everything if not ready', () =>
    {
        const select        = document.querySelector( 'SELECT' );
        select.innerHTML    = '<option value="2">2</option><option value="3" disabled>3</option>'; // eslint-disable-line
        select.flounder     = null;
        const flounder      = new Flounder( select );
        flounder.ready      = false;
        const refs          = flounder.refs;

        sinon.stub( utils, 'addClass', noop );
        sinon.stub( utils, 'removeClass', noop );

        sinon.stub( flounder, 'onClose', noop );

        flounder.toggleOpen( {}, {}, refs, refs.wrapper );

        assert.equal( flounder.onClose.callCount, 0 );

        utils.addClass.restore();
        utils.removeClass.restore();
        select.innerHTML = '';
    } );
} );
