
import Flounder     from '/core/flounder';
import events       from '/core/events';

import classes      from '/core/classes';
import utils        from '/core/utils';
import keycodes     from '/core/keycodes';

import assert       from 'assert';
import sinon        from 'sinon';
import simulant     from 'simulant';


const nativeSlice = Array.prototype.slice;


/**
 * ## addFirstTouchListeners
 *
 * adds the listeners for onFirstTouch
 *
 * @return _Void_
 */
describe( 'addFirstTouchListeners', () =>
{
    let flounder    = new Flounder( document.body, {} );
    flounder.firstTouchController( {} );

    let refs        = flounder.refs;

    sinon.stub( flounder, 'firstTouchController', () => {} );

    flounder.addFirstTouchListeners();

    it( 'should react on click and focus events', () =>
    {
        refs.selected.click();
        refs.select.focus();

        assert.equal( flounder.firstTouchController.callCount, 2 );
        flounder.firstTouchController.restore();
    } );


    it( 'should bind mouseenter to the wrapper if openOnHover is set', () =>
    {
        document.body.flounder = null;
        let flounder    = new Flounder( document.body, { openOnHover: true } );

        flounder.firstTouchController( {} );

        sinon.stub( flounder, 'firstTouchController', e => e );

        flounder.addFirstTouchListeners();

        assert.equal( flounder.firstTouchController.callCount, 0 );

        simulant.fire( flounder.refs.wrapper, 'mouseenter' );

        // there's some weird focus event too
        assert.equal( flounder.firstTouchController.callCount, 2 );
        flounder.firstTouchController.restore();
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
        let el = document.createElement( 'DIV' );
        events.addHoverClass.call( el );
        assert.equal( utils.hasClass( el, classes.HOVER ), true );
    } );
} );



/**
 * ## addListeners
 *
 * adds listeners on render
 *
 * @return _Void_
 */
describe( 'addListeners', () =>
{
    let flounder;

    beforeEach( () =>
    {
        document.body.flounder = null;

        flounder    = new Flounder( document.body, {} );
        flounder.removeListeners( {} );

        sinon.stub( flounder, 'divertTarget', () => {} );
        sinon.stub( flounder, 'toggleList', () => {} );
        sinon.stub( flounder, 'checkFlounderKeypress', () => {} );
        sinon.stub( flounder, 'addFirstTouchListeners', () => {} );
        sinon.stub( flounder, 'addOptionsListeners', () => {} );
        sinon.stub( flounder, 'addSearchListeners', () => {} );
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
        let refs        = flounder.refs;
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
        let refs        = flounder.refs;

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
 * @return _Void_
 */
describe( 'addMultipleTags', () =>
{
    let flounder    = new Flounder( document.body, {} );

    sinon.stub( flounder, 'removeMultiTag', () => {} );
    sinon.stub( flounder, 'checkMultiTagKeydown', () => {} );

    let select          = document.createElement( 'SELECT' );
    let multiTagWrapper = document.createElement( 'DIV' );

    it( 'should add a tag with event listeners for each selected value', () =>
    {
        let options = [ {}, {}, {} ].map( ( el, i ) =>
        {
            el = document.createElement( 'OPTION' );
            el.selected = true;

            el.value    = i === 0 ? '' : 'moon';

            select.appendChild( el );

            return el;
        } );

        flounder.addMultipleTags( options, multiTagWrapper );

        assert.equal( options[0].selected, false );
        assert.equal( multiTagWrapper.children.length, 2 );
    } );


    it( 'should have the proper events bound to it', () =>
    {
        let firstChild = multiTagWrapper.children[0];

        simulant.fire( firstChild, 'keydown' );
        simulant.fire( firstChild.firstChild, 'click' );

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
 * @return _Void_
 */
describe( 'addOptionsListeners', () =>
{
    let flounder;

    beforeEach( () =>
    {
        document.body.flounder = null;
        flounder = new Flounder( document.body, { data: [ 1, 2, 3 ] } );

        flounder.removeOptionsListeners();

        flounder.refs.data[1] = document.createElement( 'NOTADIV' );

        sinon.stub( flounder, 'addHoverClass', () => {} );
        sinon.stub( flounder, 'removeHoverClass', () => {} );
        sinon.stub( flounder, 'clickSet', () => {} );
    } );


    afterEach( () =>
    {
        flounder.addHoverClass.restore();
        flounder.removeHoverClass.restore();
        flounder.clickSet.restore();
    } );


    it( 'should add hover and click listeners on each data div (and only divs)', () =>
    {
        flounder.addOptionsListeners();

        let firstData = flounder.refs.data[0];

        simulant.fire( firstData, 'mouseenter' );
        simulant.fire( firstData, 'mouseleave' );
        simulant.fire( firstData, 'click' );

        simulant.fire( flounder.refs.data[1], 'click' );


        assert.equal( flounder.addHoverClass.callCount, 1 );
        assert.equal( flounder.removeHoverClass.callCount, 1 );
        assert.equal( flounder.clickSet.callCount, 1 );
    } );
} );



/**
 * ## addPlaceholder
 *
 * called on body click, this determines what (if anything) should be
 * refilled into the the placeholder position
 *
 * @return _Void_
 */
describe( 'addPlaceholder', () =>
{
    let flounder;

    beforeEach( () =>
    {
        document.body.flounder = null;
        flounder = new Flounder( document.body, {
                                                    data: [ 1, 2, 3 ],
                                                    multiple: true,
                                                    placeholder: 'moon'
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

        assert.equal( flounder.refs.selected.innerHTML, flounder.multipleMessage );
    } );


    it( 'should handle multipleTags placeholders', () =>
    {
        document.body.flounder = null;
        flounder = new Flounder( document.body, {
                                                    data: [ 1, 2, 3 ],
                                                    multipleTags: true,
                                                    placeholder: 'moon'
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
 * @return _Void_
 */
describe( 'addSearchListeners', () =>
{
    let flounder;

    beforeEach( () =>
    {
        document.body.flounder = null;
        flounder = new Flounder( document.body, { data: [ 1, 2, 3 ], search: true } );

        flounder.removeSearchListeners();


        sinon.stub( flounder, 'toggleListSearchClick', () => {} );
        sinon.stub( flounder, 'fuzzySearch', () => {} );
        sinon.stub( flounder, 'clearPlaceholder', () => {} );
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
        let search = flounder.refs.search;

        simulant.fire( search, 'click' );
        simulant.fire( search, 'keyup' );
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
 * @return _Void_
 */
describe( 'addSelectKeyListener', () =>
{
    let flounder;

    beforeEach( () =>
    {
        document.body.flounder = null;
        flounder = new Flounder( document.body, { data: [ 1, 2, 3 ], search: true } );

        flounder.removeSelectKeyListener();


        sinon.stub( flounder, 'setSelectValue', () => {} );
        sinon.stub( flounder, 'setKeypress', () => {} );
    } );


    afterEach( () =>
    {
        flounder.setSelectValue.restore();
        flounder.setKeypress.restore();
    } );


    it( 'should add the correct events and functions', () =>
    {
        flounder.addSelectKeyListener();
        let select = flounder.refs.select;

        simulant.fire( select, 'keydown' );
        simulant.fire( select, 'keyup' );


        assert.equal( flounder.setSelectValue.callCount, 1 );
        assert.equal( flounder.setKeypress.callCount, 1 );
    } );


    it( 'should insert a plug option element into the select box for ios weirdness', () =>
    {
        flounder.isIos = true;

        flounder.addSelectKeyListener();

        let select  = flounder.refs.select;
        let plug    = select.children[0];

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
 * @return _Void_
 */
describe( 'catchBodyClick', () =>
{
    document.body.flounder = null;
    let flounder = new Flounder( document.body, { data: [ 1, 2, 3 ] } );

    sinon.stub( flounder, 'toggleList', () => {} );
    sinon.stub( flounder, 'addPlaceholder', () => {} );

    it( 'should run toggleList and addPlaceholder if clicked off flounder', () =>
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
    let flounder = new Flounder( document.body, { data: [ 1, 2, 3 ] } );

    it( 'should return true if the click is inside flounder', () =>
    {
        let el = flounder.refs.data[1];

        assert.equal( flounder.checkClickTarget( { target: el } ), true );
    } );


    it( 'should return false if the click is not inside flounder', () =>
    {
        assert.equal( flounder.checkClickTarget( { target: document.body } ), false );
    } );


    it( 'should return false if the element is not in the DOM', () =>
    {
        let el = document.createElement( 'DIV' );

        assert.equal( flounder.checkClickTarget( { target: el } ), false );
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
 * @return _Void_
 */
describe( 'checkEnterOnSearch', () =>
{
    it( 'should skip the whole thing if there is no value', () =>
    {
        document.body.flounder = null;
        let flounder    = new Flounder( document.body, { data: [ 1, 2, 3 ], search: true } );
        let refs        = flounder.refs;

        let e = { target: { value: '' } };

        assert.equal( flounder.checkEnterOnSearch( e, refs ), false );
    } );


    it( 'should select the option if there is only one entry', () =>
    {
        document.body.flounder = null;
        let flounder    = new Flounder( document.body, { data: [ 1, 2, 3 ], search: true } );
        let refs        = flounder.refs;

        sinon.stub( refs.search, 'focus', () => {} );

        let e = { target: { value: '2' } };

        let res = flounder.checkEnterOnSearch( e, refs );

        assert.equal( res.length, 1 );
        assert.equal( refs.search.focus.callCount, 1 );

        refs.search.focus.restore();
    } );


    it( 'should only select the option if there is only one left', () =>
    {
        document.body.flounder = null;
        let flounder    = new Flounder( document.body, { data: [ 1, 2, 3 ], search: true } );
        let refs        = flounder.refs;

        sinon.stub( refs.search, 'focus', () => {} );

        let e = { target: { value: '4' } };

        let res = flounder.checkEnterOnSearch( e, refs );

        assert.equal( res.length, 0 );
        assert.equal( refs.search.focus.callCount, 0 );

        refs.search.focus.restore();
    } );


    it( 'should only refocus on search if multipleTags is active', done =>
    {
        document.body.flounder = null;
        let flounder    = new Flounder( document.body, { data: [ 1, 2, 3 ], multipleTags: true } );
        let refs        = flounder.refs;

        sinon.stub( refs.search, 'focus', () => {} );

        let e = { target: { value: '2' } };

        let res = flounder.checkEnterOnSearch( e, refs );

        assert.equal( res.length, 1 );

        setTimeout( function()
        {
            assert.equal( refs.search.focus.callCount, 2 );
            refs.search.focus.restore();
            done();
        }, 300 );
    } );


    it( 'should exclude items that are already selected', () =>
    {
        document.body.flounder = null;
        let flounder    = new Flounder( document.body, { data: [ 1, 2, 3 ], search: true } );
        let refs        = flounder.refs;

        flounder.setByValue( '2' );
        let e = { target: { value: '2' } };
        let res = flounder.checkEnterOnSearch( e, refs );

        assert.equal( res.length, 0 );
    } );
} );



/**
 * ## checkFlounderKeypress
 *
 * checks flounder focused keypresses and filters all but space and enter
 *
 * @return _Void_
 */
describe( 'checkFlounderKeypress', () =>
{
    document.body.flounder = null;
    let flounder    = new Flounder( document.body, { data: [ 1, 2, 3 ], search: true } );
    let refs        = flounder.refs;


    it( 'should close the menu and add the placeholder on tab', () =>
    {
        let e = { keyCode: keycodes.TAB, target: { value: 2 }, preventDefault: () => {} };

        sinon.stub( flounder, 'addPlaceholder', () => {} );
        sinon.stub( flounder, 'toggleClosed', () => {} );

        let res = flounder.checkFlounderKeypress( e );

        assert.equal( flounder.addPlaceholder.callCount, 1 );
        assert.equal( flounder.toggleClosed.callCount, 1 );

        flounder.addPlaceholder.restore();
        flounder.toggleClosed.restore();
    } );


    it( 'should toggle open on enter', () =>
    {
        let e = { keyCode: keycodes.ENTER, target: { value: 2 }, preventDefault: () => {} };

        let res = flounder.checkFlounderKeypress( e );

        assert.equal( utils.hasClass( refs.wrapper, classes.OPEN ), true );
    } );


    it( 'should toggle enter if search is enabled', () =>
    {
        let e = { keyCode: keycodes.ENTER, target: { value: 2 }, preventDefault: () => {} };

        let res = flounder.checkFlounderKeypress( e );

        assert.equal( res[0].value, '2' );
        assert.equal( res.length, 1 );
    } );


    it( 'should toggle the list open with space', () =>
    {
        let e = { keyCode: keycodes.SPACE, target: { tagName: 'MOON' }, preventDefault: () => {} };

        flounder.checkFlounderKeypress( e );

        assert.equal( utils.hasClass( refs.wrapper, classes.OPEN ), true );
    } );


    it( 'should pass normal letters through', () =>
    {
        let e = { keyCode: 49, target: { tagName: 'INPUT' } };
        flounder.checkFlounderKeypress( e );

        assert.equal( refs.selected.innerHTML, '' );

        e = { keyCode: 70, target: { tagName: 'INPUT' } };
        flounder.checkFlounderKeypress( e );
    } );


    it( 'should do nothing if it doesnt hit the above conditions', () =>
    {
        refs.selected.innerHTML = 'moon';

        let e = { keyCode: 49, target: {} };
        flounder.checkFlounderKeypress( e );

        e = { keyCode: 0 };
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
 * @return _Void_
 */
describe( 'checkMultiTagKeydown', () =>
{
    it( 'should navigate tags on left or right', () =>
    {
        document.body.flounder = null;

        let flounder    = new Flounder( document.body, { data: [ 1, 2, 3 ], multipleTags : true } );
        let refs        = flounder.refs;

        flounder.setByIndex( 1 );
        flounder.setByIndex( 2 );

        sinon.stub( flounder, 'checkMultiTagKeydownNavigate', () => {} );
        sinon.stub( flounder, 'checkMultiTagKeydownRemove', () => {} );

        let children    = refs.multiTagWrapper.children;
        let target      = children[ 0 ];

        flounder.checkMultiTagKeydown( {    keyCode         : 39,
                                            target          : target,
                                            preventDefault  : () => {},
                                            stopPropagation : () => {}
                                        } );

        flounder.checkMultiTagKeydown( {    keyCode         : 37,
                                            target          : target,
                                            preventDefault  : () => {},
                                            stopPropagation : () => {}
                                        } );

        assert.equal( flounder.checkMultiTagKeydownNavigate.callCount, 2 );
        assert.equal( flounder.checkMultiTagKeydownRemove.callCount, 0 );
    } );


    it( 'should remove tags on backspace', () =>
    {
        document.body.flounder = null;

        let flounder    = new Flounder( document.body, { data: [ 1, 2, 3 ], multipleTags : true } );
        let refs        = flounder.refs;

        flounder.setByIndex( 1 );
        flounder.setByIndex( 2 );

        sinon.stub( flounder, 'checkMultiTagKeydownNavigate', () => {} );
        sinon.stub( flounder, 'checkMultiTagKeydownRemove', () => {} );

        let children    = refs.multiTagWrapper.children;
        let target      = children[ 0 ];

        flounder.checkMultiTagKeydown( {    keyCode         : 8,
                                            target          : target,
                                            preventDefault  : () => {},
                                            stopPropagation : () => {}
                                        } );

        assert.equal( flounder.checkMultiTagKeydownNavigate.callCount, 0 );
        assert.equal( flounder.checkMultiTagKeydownRemove.callCount, 1 );
    } );


    it( 'should focus on the search blank to type on letters', () =>
    {
        document.body.flounder = null;

        let flounder    = new Flounder( document.body, { data: [ 1, 2, 3 ], multipleTags : true } );
        let refs        = flounder.refs;

        flounder.setByIndex( 1 );
        flounder.setByIndex( 2 );

        sinon.stub( flounder, 'clearPlaceholder', () => {} );
        sinon.stub( flounder, 'toggleListSearchClick', () => {} );

        let children    = refs.multiTagWrapper.children;
        let target      = children[ 0 ];

        flounder.checkMultiTagKeydown( {    keyCode         : 888,
                                            key             : 'm',
                                            target          : target,
                                            preventDefault  : () => {},
                                            stopPropagation : () => {}
                                        } );

        assert.equal( flounder.clearPlaceholder.callCount, 1 );
        assert.equal( flounder.toggleListSearchClick.callCount, 1 );
    } );


    it( 'should do nothing on other keys', () =>
    {
        document.body.flounder = null;

        let flounder    = new Flounder( document.body, { data: [ 1, 2, 3 ], multipleTags : true } );
        let refs        = flounder.refs;

        flounder.setByIndex( 1 );
        flounder.setByIndex( 2 );

        sinon.stub( flounder, 'clearPlaceholder', () => {} );
        sinon.stub( flounder, 'toggleListSearchClick', () => {} );

        let children    = refs.multiTagWrapper.children;
        let target      = children[ 0 ];

        flounder.checkMultiTagKeydown( {    keyCode         : 888,
                                            key             : 'mkjbkhj',
                                            target          : target,
                                            preventDefault  : () => {},
                                            stopPropagation : () => {}
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
 * @return _Void_
 */
describe( 'checkMultiTagKeydownNavigate', () =>
{
    it( 'should focus on next left tag when left is pressed', () =>
    {
        document.body.flounder = null;

        let flounder    = new Flounder( document.body, { data: [ 1, 2, 3 ], multipleTags : true } );
        let refs        = flounder.refs;

        flounder.setByIndex( 1 );
        flounder.setByIndex( 2 );

        let children    = refs.multiTagWrapper.children;
        let target      = children[ 0 ];

        sinon.stub( target, 'focus', () => {} );
        let focusSearch = sinon.spy();

        flounder.checkMultiTagKeydownNavigate( focusSearch, 37, 1 );

        assert.equal( focusSearch.callCount, 0 );
        assert.equal( target.focus.callCount, 1 );
    } );


    it( 'should remain focused on left when already on the leftest tag', () =>
    {
        document.body.flounder = null;

        let flounder    = new Flounder( document.body, { data: [ 1, 2, 3 ], multipleTags : true } );
        let refs        = flounder.refs;

        flounder.setByIndex( 1 );

        let children    = refs.multiTagWrapper.children;
        let target      = children[ 0 ];

        sinon.stub( target, 'focus', () => {} );
        let focusSearch = sinon.spy();

        flounder.checkMultiTagKeydownNavigate( focusSearch, 37, 0 );

        assert.equal( focusSearch.callCount, 0 );
        assert.equal( target.focus.callCount, 0 );
    } );


    it( 'should focus on next right tag when right is pressed', () =>
    {
        document.body.flounder = null;

        let flounder    = new Flounder( document.body, { data: [ 1, 2, 3 ], multipleTags : true } );
        let refs        = flounder.refs;

        flounder.setByIndex( 1 );
        flounder.setByIndex( 2 );

        let children    = refs.multiTagWrapper.children;
        let target      = children[ 1 ];

        sinon.stub( target, 'focus', () => {} );
        let focusSearch = sinon.spy();

        flounder.checkMultiTagKeydownNavigate( focusSearch, 39, 0 );

        assert.equal( focusSearch.callCount, 0 );
        assert.equal( target.focus.callCount, 1 );
    } );


    it( 'should focus on search when already on the right most tag', () =>
    {
        document.body.flounder = null;

        let flounder    = new Flounder( document.body, { data: [ 1, 2, 3 ], multipleTags : true } );
        let refs        = flounder.refs;

        flounder.setByIndex( 1 );

        let children    = refs.multiTagWrapper.children;
        let target      = children[ 0 ];

        sinon.stub( target, 'focus', () => {} );
        let focusSearch = sinon.spy();

        flounder.checkMultiTagKeydownNavigate( focusSearch, 39, 0 );

        assert.equal( focusSearch.callCount, 1 );
        assert.equal( target.focus.callCount, 0 );
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
 * @return _Void_
 */
describe( 'checkMultiTagKeydownRemove', () =>
{
    it( 'should focus on the search field if there are no siblings', () =>
    {
        document.body.flounder = null;

        let flounder    = new Flounder( document.body, { data: [ 1, 2, 3 ], multipleTags : true } );
        let refs        = flounder.refs;

        flounder.setByIndex( 1 );

        let children    = refs.multiTagWrapper.children;
        let target      = children[ 0 ];
        let focusSearch = sinon.spy();

        flounder.checkMultiTagKeydownRemove( target, focusSearch, [ target ], 1 );

        assert.equal( focusSearch.callCount, 1 );
    } );


    it( 'should remove the focused target and focus on the previous tag when there are more then 2', () =>
    {
        document.body.flounder = null;

        let flounder    = new Flounder( document.body, { data: [ 1, 2, 3 ], multipleTags : true } );
        let refs        = flounder.refs;

        flounder.setByIndex( 1 );
        flounder.setByIndex( 2 );
        flounder.setByIndex( 3 );

        let target      = refs.multiTagWrapper.children[ 1 ];
        let focusSearch = sinon.spy();

        sinon.stub( refs.multiTagWrapper.children[ 0 ], 'focus', () => {} );
        flounder.checkMultiTagKeydownRemove( target, focusSearch, 1 );

        let children    = refs.multiTagWrapper.children;
        assert.equal( focusSearch.callCount, 0 );
        assert.equal( children[ 0 ].focus.callCount, 1 );

        children[ 0 ].focus.restore();
    } );


    /*
            maybe not a complete test? it runs the code so should break if it
            doesnt work, but there were some weird things going on with
            the assertions
     */
    it( 'should remove the focused target and focus on the new first tag when the first one was removed', () =>
    {
        document.body.flounder = null;

        let flounder    = new Flounder( document.body, { data: [ 1, 2, 3 ], multipleTags : true } );
        let refs        = flounder.refs;

        flounder.setByIndex( 1 );
        flounder.setByIndex( 2 );
        flounder.setByIndex( 3 );

        let target      = refs.multiTagWrapper.children[ 0 ];
        let focusSearch = sinon.spy();

        flounder.checkMultiTagKeydownRemove( target, focusSearch, 0 );

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
 * @return _Void_
 */
describe( 'clearPlaceholder', () =>
{
    let flounder = new Flounder( document.body, {} );

    it( 'should clear the placeholder', () =>
    {
        flounder.clearPlaceholder();
        assert.equal( flounder.refs.selected.innerHTML, `` );
    } );
} );



/**
 * ## clickSet
 *
 * when a flounder option is clicked on it needs to set the option as selected
 *
 * @param {Object} e event object
 *
 * @return _Void_
 */
describe( 'clickSet', () =>
{
    it( 'should set the clicked div\'s option as selected' , () =>
    {
        let flounder    = new Flounder( document.body, {} );
        flounder.multiple = true;
        let e           = { preventDefault: sinon.spy(), stopPropagation: sinon.spy() };
        e[ flounder.multiSelect ] = true;

        sinon.stub( flounder, 'setSelectValue', () => {} );
        sinon.stub( flounder, 'toggleList', () => {} );

        flounder.clickSet( e );

        assert.equal( flounder.setSelectValue.callCount, 1 );
        assert.equal( flounder.toggleList.callCount, 0 );

        flounder.setSelectValue.restore();
        flounder.toggleList.restore();
    } );


    it( 'should set the clicked div\'s option as selected and toggle the list if it\'s not a multiple select', () =>
    {
        let flounder    = new Flounder( document.body, {} );
        let e           = { preventDefault: sinon.spy(), stopPropagation: sinon.spy() };

        sinon.stub( flounder, 'setSelectValue', () => {} );
        sinon.stub( flounder, 'toggleList', () => {} );

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
 * @return _Void_
 */
describe( 'displayMultipleTags', () =>
{
    let data = [
            'doge',
            'moon',
            'mon',
            'moin',
            'main'
        ];

    document.body.flounder = null;
    let flounder    = new Flounder( document.body,
                            { multipleTags : true, data : data } );

    let refs            = flounder.refs;
    let refsData        = refs.data;
    let multiTagWrapper = refs.multiTagWrapper;


    it( 'should create a tag for each selection', () =>
    {
        flounder.displayMultipleTags( [ refsData[ 1 ], refsData[ 2 ] ], multiTagWrapper );
        assert.equal( refs.multiTagWrapper.children.length, 2 );
    } );


    it( 'should re-add the placeholder if there are no tags', () =>
    {
        flounder.deselectAll();
        flounder.refs.selected.innerHTML = ``;

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
 * @return _Void_
 */
describe( 'displaySelected', () =>
{
    it( 'should display the selected option in refs.selected', () =>
    {
        let data = [
            'doge',
            'moon'
        ];

        let flounder    = new Flounder( document.body, { data : data, defaultIndex : 0 } );

        flounder.setByIndex( 1 );

        let refs = flounder.refs;

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
 * @return _Void_
 */
describe( 'divertTarget', () =>
{
    it( 'should remove the plug if in ios', () =>
    {
        document.body.flounder = null;

        let flounder    = new Flounder( document.body, { data: [ 1, 2, 3 ], multiple : true } );
        let refs        = flounder.refs;
        let select      = refs.select;
        flounder.isIos  = true;

        let plug        = document.createElement( 'OPTION' );
        plug.className  = `${classes.PLUG}`;
        select.appendChild( plug );

        sinon.spy( select, 'removeChild' );
        sinon.stub( flounder, 'setSelectValue', () => {} );

        flounder.divertTarget( { type: 'moon', target: select } );

        assert.equal( select.removeChild.callCount, 1 );
        assert.equal( flounder.setSelectValue.callCount, 1 );

        flounder.divertTarget( { type: 'moon', target: select } );

        assert.equal( select.removeChild.callCount, 1 );
        assert.equal( flounder.setSelectValue.callCount, 2 );
    } );


    it( 'should close the list if not multiple select', () =>
    {
        let select      = document.querySelector( 'SELECT' );
        select.flounder = null;

        let flounder    = new Flounder( select, {
                                                    data: [ 1, 2, 3 ],
                                                    keepChangesOnDestroy: true,
                                                    selectDataOverride: true
                                                } );
        let refs        = flounder.refs;
        select          = refs.select;

        let plug        = document.createElement( 'OPTION' );
        plug.className  = `${classes.PLUG}`;
        select.appendChild( plug );

        sinon.stub( select, 'removeChild', () => {} );
        sinon.stub( flounder, 'setSelectValue', () => {} );
        sinon.stub( flounder, 'toggleList', () => {} );

        flounder.divertTarget( { type: 'moon', target: select } );

        assert.equal( select.removeChild.callCount, 0 );
        assert.equal( flounder.setSelectValue.callCount, 1 );
        assert.equal( flounder.toggleList.callCount, 1 );
    } );


    it( 'should prevent default if multiple tags', () =>
    {
        document.body.flounder = null;

        let flounder    = new Flounder( document.body, { data: [ 1, 2, 3 ], multipleTags : true } );
        let refs        = flounder.refs;
        let select      = refs.select;

        let plug        = document.createElement( 'OPTION' );
        plug.className  = `${classes.PLUG}`;
        select.appendChild( plug );

        sinon.stub( select, 'removeChild', () => {} );
        sinon.stub( flounder, 'setSelectValue', () => {} );
        sinon.stub( flounder, 'toggleList', () => {} );

        let _preventDefault     = sinon.spy();
        let _stopPropagation    = sinon.spy();

        flounder.divertTarget( {    type            : 'moon',
                                    target          : select,
                                    preventDefault  : _preventDefault,
                                    stopPropagation : _stopPropagation
                                } );

        assert.equal( _preventDefault.callCount, 1 );
        assert.equal( _stopPropagation.callCount, 1 );
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
 * @return _Void_
 */
describe( 'firstTouchController', () =>
{
    it( 'should fail properly', () =>
    {
        document.body.flounder = null;

        let flounder    = new Flounder( document.body, { data: [ 1, 2, 3 ], multipleTags : true } );

        flounder.onFirstTouch = () => a + b;

        sinon.stub( console, 'warn', () => {} );

        flounder.firstTouchController( {} );

        assert.equal( console.warn.callCount, 1 );

        console.warn.restore();
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
        let el = document.createElement( 'DIV' );
        el.className = classes.HOVER;

        events.removeHoverClass.call( el );
        assert.equal( utils.hasClass( el, classes.HOVER ), false );
    } );
} );



/**
 * ## removeListeners
 *
 * removes event listeners from flounder.  normally pre unload
 *
 * @return _Void_
 */
describe( 'removeListeners', () =>
{
    let flounder;

    beforeEach( () =>
    {
        document.body.flounder = null;

        flounder    = new Flounder( document.body, {} );
        flounder.removeListeners( {} );

        sinon.stub( flounder, 'divertTarget', () => {} );
        sinon.stub( flounder, 'toggleList', () => {} );
        sinon.stub( flounder, 'checkFlounderKeypress', () => {} );
        sinon.stub( flounder, 'removeOptionsListeners', () => {} );
        sinon.stub( flounder, 'removeSearchListeners', () => {} );

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
        let refs        = flounder.refs;
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
        let refs        = flounder.refs;

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
 * removes a multi selection tag on click; fixes all references to value and state
 *
 * @param  {Object} e event object
 *
 * @return _Void_
 */
describe( 'removeMultiTag', () =>
{
    it( 'should remove a tag and deselect the option', () =>
    {
        document.body.flounder = null;

        let flounder        = new Flounder( document.body, { data: [ 1, 2, 3 ], multipleTags : true } );
        let refs            = flounder.refs;
        let multiTagWrapper = refs.multiTagWrapper;

        flounder.setByIndex( 1 );
        flounder.setByIndex( 2 );

        let _preventDefault     = sinon.spy();
        let _stopPropagation    = sinon.spy();

        let target      = multiTagWrapper.children[ 0 ].children[ 0 ];
        let targetIndex = target.getAttribute( `data-index` );

        refs.select[ targetIndex ] = target;

        flounder.removeMultiTag( {  target          : target,
                                    preventDefault  : _preventDefault,
                                    stopPropagation : _stopPropagation
                                } );

        assert.equal( multiTagWrapper.children.length, 1 );
        assert.equal( _preventDefault.callCount, 1 );
        assert.equal( _stopPropagation.callCount, 1 );
    } );


    it( 'should add the placeholder if there is nothing more selected', () =>
    {
        document.body.flounder = null;

        let flounder        = new Flounder( document.body, { data: [ 1, 2, 3 ], multipleTags : true } );
        let refs            = flounder.refs;
        let multiTagWrapper = refs.multiTagWrapper;

        flounder.setByIndex( 1 );

        let _preventDefault     = sinon.spy();
        let _stopPropagation    = sinon.spy();

        sinon.stub( flounder, 'addPlaceholder', () => {} );

        let target      = multiTagWrapper.children[ 0 ].children[ 0 ];
        let targetIndex = target.getAttribute( `data-index` );

        refs.select[ targetIndex ] = refs.select.options[ targetIndex ];

        flounder.removeMultiTag( {  target          : target,
                                    preventDefault  : _preventDefault,
                                    stopPropagation : _stopPropagation
                                } );

        assert.equal( multiTagWrapper.children.length, 0 );
        assert.equal( _preventDefault.callCount, 1 );
        assert.equal( _stopPropagation.callCount, 1 );
        assert.equal( flounder.addPlaceholder.callCount, 1 );
    } );


    it( 'should catch onSelect failures', () =>
    {
        document.body.flounder = null;

        let flounder        = new Flounder( document.body, { data: [ 1, 2, 3 ], multipleTags : true } );
        let refs            = flounder.refs;
        let multiTagWrapper = refs.multiTagWrapper;

        flounder.onSelect   =  () => a + b;

        flounder.setByIndex( 1 );

        let _preventDefault     = sinon.spy();
        let _stopPropagation    = sinon.spy();
        sinon.stub( console, 'warn', () => {} );

        let target      = multiTagWrapper.children[ 0 ].children[ 0 ];
        let targetIndex = target.getAttribute( `data-index` );

        refs.select[ targetIndex ] = refs.select.options[ targetIndex ];

        flounder.removeMultiTag( {  target          : target,
                                    preventDefault  : _preventDefault,
                                    stopPropagation : _stopPropagation
                                } );

        assert.equal( _preventDefault.callCount, 1 );
        assert.equal( _stopPropagation.callCount, 1 );
        assert.equal( console.warn.callCount, 1 );

        console.warn.restore();
    } );
} );


/**
 * ## removeOptionsListeners
 *
 * removes event listeners on the data divs
 *
 * @return _Void_
 */
describe( 'removeOptionsListeners', () =>
{
    let flounder;

    beforeEach( () =>
    {
        document.body.flounder = null;
        flounder = new Flounder( document.body, { data: [ 1, 2, 3 ], multipleTags: true, defaultValue: 1 } );

        flounder.removeOptionsListeners();

        flounder.refs.data[1] = document.createElement( 'NOTADIV' );

        sinon.stub( flounder, 'addHoverClass', () => {} );
        sinon.stub( flounder, 'removeHoverClass', () => {} );
        sinon.stub( flounder, 'clickSet', () => {} );

        flounder.addOptionsListeners();
    } );


    afterEach( () =>
    {
        flounder.addHoverClass.restore();
        flounder.removeHoverClass.restore();
        flounder.clickSet.restore();
    } );


    it( 'should remove hover and click listeners on each data div (and only divs)', () =>
    {
        flounder.removeOptionsListeners();

        let firstData = flounder.refs.data[0];

        simulant.fire( firstData, 'mouseenter' );
        simulant.fire( firstData, 'mouseleave' );
        simulant.fire( firstData, 'click' );

        simulant.fire( flounder.refs.data[1], 'click' );


        assert.equal( flounder.addHoverClass.callCount, 0 );
        assert.equal( flounder.removeHoverClass.callCount, 0 );
        assert.equal( flounder.clickSet.callCount, 0 );
    } );
} );



/**
 * ## removeSearchListeners
 *
 * removes the listeners from the search input
 *
 * @return _Void_
 */
describe( 'removeSearchListeners', () =>
{
    let flounder;

    beforeEach( () =>
    {
        document.body.flounder = null;
        flounder = new Flounder( document.body, { data: [ 1, 2, 3 ], search: true } );

        sinon.stub( flounder, 'toggleListSearchClick', () => {} );
        sinon.stub( flounder, 'fuzzySearch', () => {} );
        sinon.stub( flounder, 'clearPlaceholder', () => {} );
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
        let search = flounder.refs.search;

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
 * @return _Void_
 */
describe( 'removeSelectedClass', () =>
{
    it( 'should remove the selected class', () =>
    {

        document.body.flounder = null;

        let flounder        = new Flounder( document.body, { data: [ 1, 2, 3 ], multipleTags : true } );
        let refs            = flounder.refs;
        let multiTagWrapper = refs.multiTagWrapper;

        flounder.setByIndex( 1 );
        flounder.setByIndex( 2 );

        flounder.removeSelectedClass();
        let selected = refs.optionsList.querySelectorAll( '.flounder__option--selected' );

        assert.equal( selected.length, 0, 'selected class is removed from divs' );
    } );
} );



/**
 * ## removeSelectedValue
 *
 * sets the selected property to false for all data
 *
 * @return _Void_
 */
describe( 'removeSelectedValue', () =>
{
    it( 'should remove the selected value', () =>
    {

        document.body.flounder = null;

        let flounder        = new Flounder( document.body, { data: [ 1, 2, 3 ], multipleTags : true } );
        let refs            = flounder.refs;
        let multiTagWrapper = refs.multiTagWrapper;

        flounder.setByIndex( 1 );
        flounder.setByIndex( 2 );

        flounder.removeSelectedValue();

        assert.equal( flounder.getSelected().length, 0, 'selected is set to false for options' );
    } );
} );



/**
 * ## removeSelectKeyListener
 *
 * disables the event listener on the native select box
 *
 * @return _Void_
 */
describe( 'removeSelectKeyListener', () =>
{
    let flounder;

    beforeEach( () =>
    {
        document.body.flounder = null;
        flounder = new Flounder( document.body, { data: [ 1, 2, 3 ], search: true } );

        flounder.removeSelectKeyListener();

        sinon.stub( flounder, 'setSelectValue', () => {} );

        flounder.addSelectKeyListener();
    } );


    afterEach( () =>
    {
        flounder.setSelectValue.restore();
    } );


    it( 'should remove the keyup function', () =>
    {
        flounder.removeSelectKeyListener();
        let select = flounder.refs.select;

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
 * @return _Void_
 */
describe( 'setKeypress', () =>
{
    it( 'should close the menu and add the placeholder on tab', () =>
    {
        document.body.flounder = null;
        let flounder = new Flounder( document.body, { data: [ 1, 2, 3 ], search: true } );

        let e = { keyCode: keycodes.TAB };

        sinon.stub( flounder, 'addPlaceholder', () => {} );
        sinon.stub( flounder, 'toggleClosed', () => {} );

        let res = flounder.setKeypress( e );

        assert.equal( flounder.addPlaceholder.callCount, 1 );
        assert.equal( flounder.toggleClosed.callCount, 1 );

        flounder.addPlaceholder.restore();
        flounder.toggleClosed.restore();
    } );


    it( 'should ignore the keypress if it is a non character key', () =>
    {
        document.body.flounder = null;
        let flounder = new Flounder( document.body, { data: [ 1, 2, 3 ], search: true } );

        sinon.stub( flounder, 'setKeypressElement', () => {} );
        sinon.stub( flounder, 'toggleList', () => {} );

        let res = flounder.setKeypress( { keyCode: 16 } );

        assert.equal( flounder.setKeypressElement.callCount, 0 );
        assert.equal( flounder.toggleList.callCount, 0 );

        assert.equal( res, undefined );
    } );


    it( 'should toggle the list on enter, escape, and space', () =>
    {
        let res;

        document.body.flounder = null;
        let flounder = new Flounder( document.body, { data: [ 1, 2, 3 ] } );

        sinon.stub( flounder, 'toggleList', () => {} );

        res = flounder.setKeypress( { keyCode: keycodes.ENTER } );
        assert.equal( res, false );

        res = flounder.setKeypress( { keyCode: keycodes.SPACE } );
        assert.equal( res, false );

        res = flounder.setKeypress( { keyCode: keycodes.ESCAPE } );
        assert.equal( res, false );

        assert.equal( flounder.toggleList.callCount, 3 );
    } );


    it( 'should change the selected element on up and down', () =>
    {
        document.body.flounder = null;
        let flounder = new Flounder( document.body, { data: [ 1, 2, 3 ] } );

        sinon.stub( flounder, 'setKeypressElement', () => {} );
        let _preventDefault = sinon.spy();

        flounder.setKeypress( { keyCode: keycodes.UP, preventDefault: _preventDefault } );

        window.sidebar = true;
        flounder.setKeypress( { keyCode: keycodes.DOWN, preventDefault: _preventDefault } );

        assert.equal( _preventDefault.callCount, 1 );
        assert.equal( flounder.setKeypressElement.callCount, 2 );

        document.body.flounder = null;
        flounder = new Flounder( document.body, { data: [ 1, 2, 3 ], search: true } );

        window.sidebar = false;
        sinon.stub( flounder, 'setKeypressElement', () => {} );
        flounder.setKeypress( { keyCode: keycodes.DOWN, preventDefault: _preventDefault } );
    } );


    it( 'should pass anything else through unaffected', () =>
    {
        document.body.flounder = null;
        let flounder = new Flounder( document.body, { data: [ 1, 2, 3 ] } );

        sinon.stub( flounder, 'setKeypressElement', () => {} );
        let _preventDefault = sinon.spy();

        flounder.setKeypress( { keyCode: 999, preventDefault: _preventDefault } );

        assert.equal( _preventDefault.callCount, 0 );
        assert.equal( flounder.setKeypressElement.callCount, 0 );
    } );
} );



/**
 * ## setKeypressElement
 *
 * sets the element after the keypress.  if the element is hidden for some
 * reason, it passes the event back to setKeypress to process the next element
 *
 * @return _Void_
 */
describe( 'setKeypressElement', () =>
{
    it( 'should rotate from top to bottom and bottom to top when min and max are reached', () =>
    {
        document.body.flounder = null;
        let flounder = new Flounder( document.body, { data: [ 1, 2, 3 ], search: true } );

        sinon.stub( flounder, 'setKeypress', () => {} );

        flounder.setKeypressElement( {}, 9 );
        flounder.setKeypressElement( {}, -9 );

        assert.equal( flounder.setKeypress.callCount, 0 );
    } );


    it( 'should skip disabled and hidden items', () =>
    {
        document.body.flounder = null;
        let flounder = new Flounder( document.body, { data: [ 1, 2, 3 ], search: true } );

        sinon.stub( flounder, 'setKeypress', () => {} );

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
 * @return _Void_
 */
describe( 'setSelectValue', () =>
{
    it( 'should decide whether or not it\'s a click or keypress by where the event object is' , () =>
    {
        document.body.flounder = null;
        let flounder = new Flounder( document.body, { data: [ 1, 2, 3 ] } );

        sinon.stub( flounder, 'setSelectValueClick', () => {} );
        sinon.stub( flounder, 'setSelectValueButton', () => {} );

        flounder.setSelectValue( null, {} );
        flounder.setSelectValue( {} );

        assert.equal( flounder.setSelectValueClick.callCount, 1 );
        assert.equal( flounder.setSelectValueButton.callCount, 1 );
    } );


    it( 'should only run onSelect if it is not a programatic click' , () =>
    {
        document.body.flounder = null;
        let flounder = new Flounder( document.body, { data: [ 1, 2, 3 ] } );

        sinon.stub( flounder, 'setSelectValueClick', () => {} );

        flounder.___programmaticClick = true;
        flounder.setSelectValue( null, {} );

        assert.equal( flounder.___programmaticClick, false );
        assert.equal( flounder.setSelectValueClick.callCount, 1 );

        sinon.stub( flounder, 'onSelect', () => {} );
        flounder.setSelectValue( null, {} );

        assert.equal( flounder.onSelect.callCount, 1 );
    } );


    it( 'should warn when onSelect fails' , () =>
    {
        document.body.flounder = null;
        let flounder = new Flounder( document.body, { data: [ 1, 2, 3 ] } );

        sinon.stub( flounder, 'setSelectValueButton', () => {} );
        sinon.stub( flounder, 'onSelect', () => a + b );
        sinon.stub( console, 'warn', () => {} );

        flounder.setSelectValue( { keyCode: 99 } );

        assert.equal( console.warn.callCount, 1 );
        assert.equal( flounder.onSelect.callCount, 1 );

        console.warn.restore();
    } );


    it( 'should ignore the keypress if the list was just opened' , () =>
    {
        document.body.flounder = null;
        let flounder = new Flounder( document.body, { data: [ 1, 2, 3 ] } );

        sinon.stub( flounder, 'setSelectValueButton', () => {} );
        sinon.stub( flounder, 'onSelect', () => {} );

        flounder.toggleList.justOpened = true;
        flounder.setSelectValue( { keyCode: 99 } );

        assert.equal( flounder.toggleList.justOpened, false );
        assert.equal( flounder.onSelect.callCount, 0 );
    } );
} );



/**
 * ## setSelectValueButton
 *
 * processes the setting of a value after a keypress event
 *
 * @return _Void_
 */
describe( 'setSelectValueButton', () =>
{
    it( 'should remove the selected class and scroll to the selected option' , () =>
    {
        document.body.flounder = null;
        let flounder = new Flounder( document.body, { data: [ 1, 2, 3 ], defaultIndex: 1 } );

        sinon.spy( flounder, 'removeSelectedClass' );
        sinon.stub( utils, 'scrollTo', () => {} );

        flounder.setSelectValueButton();
        assert.equal( flounder.removeSelectedClass.callCount, 1 );

        sinon.stub( flounder, 'getSelected', () => { return []; } );
        flounder.setSelectValueButton();

        assert.equal( flounder.removeSelectedClass.callCount, 2 );
        assert.equal( utils.scrollTo.callCount, 1 );
        utils.scrollTo.restore();
    } );
} );



/**
 * ## setSelectValueClick
 *
 * processes the setting of a value after a click event
 *
 * @param {Object} e event object
 *
 * @return _Void_
 */
describe( 'setSelectValueClick', () =>
{
    it( 'should toggle the selected value', () =>
    {
        document.body.flounder = null;
        let flounder    = new Flounder( document.body, { data: [ 1, 2, 3 ] } );
        let refs        = flounder.refs;

        sinon.stub( flounder, 'deselectAll', () => {} );

        let res1 = utils.hasClass( refs.data[ 0 ], flounder.selectedClass );

        flounder.setSelectValueClick( { target: refs.data[ 0 ] } );

        let res2 = utils.hasClass( refs.data[ 0 ], flounder.selectedClass );

        assert.equal( res1, !res2 );
        assert.equal( flounder.deselectAll.callCount, 1 );
    } );
} );



/**
 * ## setTextMultiTagIndent
 *
 * sets the text-indent on the search field to go around selected tags
 *
 * @return _Void_
 */
describe( 'setTextMultiTagIndent', () =>
{
    it( 'should set the search box text indent correctly', () =>
    {
        document.body.flounder = null;

        let data = [
            'doge',
            'moon'
        ];

        let flounder    = new Flounder( document.body, { data : data, defaultIndex : 0, multipleTags : true } );
        let refs = flounder.refs;

        let span = document.createElement( 'SPAN' );
        span.className = 'flounder__multiple--select--tag';
        span.innerHTML = '<a class="flounder__multiple__tag__close" data-index="1"></a>doge';

        refs.multiTagWrapper.appendChild( span );

        flounder.setTextMultiTagIndent();

        let style       = window.getComputedStyle( span );

        let spanOffset  = span.offsetWidth + parseInt( style[ 'margin-left' ] ) + parseInt( style[ 'margin-right' ] );

        assert.equal( refs.search.style.textIndent, spanOffset > 0 ? `${spanOffset}px` : `` );
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
 * @return _Void_
 */

describe( 'toggleClosed', () =>
{
    it( 'should close the options list and remove necessary listeners', () =>
    {
        document.body.flounder  = null;
        let flounder            = new Flounder( document.body, { data: [ 1, 2, 3 ], search: true } );
        let refs                = flounder.refs;

        sinon.stub( utils, 'addClass', () => {} );
        sinon.stub( utils, 'removeClass', () => {} );

        sinon.stub( flounder, 'removeSelectKeyListener', () => {} );
        sinon.stub( flounder, 'fuzzySearchReset', () => {} );
        sinon.stub( refs.flounder, 'focus', () => {} );
        sinon.stub( flounder, 'onClose', () => {} );

        flounder.toggleClosed( {}, {}, refs, refs.wrapper );

        assert.equal( flounder.fuzzySearchReset.callCount, 1 );
        assert.equal( refs.flounder.focus.callCount, 1 );
        assert.equal( flounder.onClose.callCount, 1 );

        assert.equal( utils.addClass.callCount, 1 );
        assert.equal( utils.removeClass.callCount, 1 );

        utils.addClass.restore();
        utils.removeClass.restore();
    } );


    it( 'should correctly handle onClose failures', () =>
    {
        document.body.flounder  = null;
        let flounder            = new Flounder( document.body, { data: [ 1, 2, 3 ] } );
        let refs                = flounder.refs;

        sinon.stub( utils, 'addClass', () => {} );
        sinon.stub( utils, 'removeClass', () => {} );

        sinon.stub( console, 'warn', () => {} );
        sinon.stub( flounder, 'onClose', () => a + b );

        flounder.toggleClosed( {}, {}, refs, refs.wrapper );

        assert.equal( console.warn.callCount, 1 );

        console.warn.restore();
        utils.addClass.restore();
        utils.removeClass.restore();
    } );


    it( 'should skip focus on exit bool', () =>
    {
        document.body.flounder  = null;
        let flounder            = new Flounder( document.body, { data: [ 1, 2, 3 ] } );
        let refs                = flounder.refs;

        sinon.stub( utils, 'addClass', () => {} );
        sinon.stub( utils, 'removeClass', () => {} );

        sinon.stub( refs.flounder, 'focus', () => {} );

        flounder.toggleClosed( {}, {}, refs, refs.wrapper, true );

        assert.equal( refs.flounder.focus.callCount, 0 );

        utils.addClass.restore();
        utils.removeClass.restore();
    } );



    it( 'should skip everything if not ready', () =>
    {
        document.body.flounder  = null;
        let flounder            = new Flounder( document.body, { data: [
                                                            { text: 1, value: 1, disabled: true },
                                                            2,
                                                            3
                                                        ] } );
        flounder.ready          = false;
        let refs                = flounder.refs;

        sinon.stub( utils, 'addClass', () => {} );
        sinon.stub( utils, 'removeClass', () => {} );

        sinon.stub( flounder, 'onClose', () => {} );

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
 * @return _Void_
 */
describe( 'toggleList', () =>
{
    it( 'should open and close the list', () =>
    {
        document.body.flounder  = null;
        let flounder            = new Flounder( document.body, { data: [ 1, 2, 3 ] } );
        let refs                = flounder.refs;

        sinon.stub( flounder, 'toggleOpen', () => {} );
        sinon.stub( flounder, 'toggleClosed', () => {} );

        flounder.toggleList( { type: 'mouseleave' } );
        flounder.toggleList( {}, 'close' );

        flounder.toggleList( { type: 'mouseenter' } );
        flounder.toggleList( { type: 'keydown' } );
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
 * @return _Void_
 */
describe( 'toggleListSearchClick', () =>
{
    it( 'should trigger toggleList only if flounder is closed', () =>
    {
        document.body.flounder  = null;
        let flounder            = new Flounder( document.body, { data: [ 1, 2, 3 ] } );
        let refs                = flounder.refs;
        let wrapper             = refs.wrapper;

        sinon.stub( flounder, 'toggleList', () => {} );

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
 * @return _Void_
 */
describe( 'toggleOpen', () =>
{
    it( 'should open the options list and add necessary listeners', () =>
    {
        document.body.flounder  = null;
        let flounder            = new Flounder( document.body, { data: [ 1, 2, 3 ], search: true } );
        let refs                = flounder.refs;

        sinon.stub( utils, 'addClass', () => {} );
        sinon.stub( utils, 'removeClass', () => {} );

        sinon.stub( refs.search, 'focus', () => {} );
        sinon.stub( flounder, 'onOpen', () => {} );
        sinon.stub( flounder, 'addSelectKeyListener', () => {} );

        flounder.toggleOpen( {}, refs.optionList, refs, refs.wrapper );

        assert.equal( refs.search.focus.callCount, 1 );
        assert.equal( flounder.onOpen.callCount, 1 );
        assert.equal( flounder.addSelectKeyListener.callCount, 1 );

        assert.equal( utils.addClass.callCount, 1 );
        assert.equal( utils.removeClass.callCount, 1 );

        flounder            = new Flounder( document.body, { data: [ 1, 2, 3 ] } );
        flounder.isIos      = true;
        refs                = flounder.refs;

        sinon.stub( flounder, 'onOpen', () => {} );
        sinon.stub( flounder, 'addSelectKeyListener', () => {} );

        flounder.toggleOpen( {}, refs.optionList, refs, refs.wrapper );

        utils.addClass.restore();
        utils.removeClass.restore();
    } );


    it( 'should correctly handle onOpen failures', () =>
    {
        document.body.flounder  = null;
        let flounder            = new Flounder( document.body, {
                    classes     : {
                        wrapper: 'maymay'
                    },
                    data        : [
                        {
                            header : 'header test',
                            data : [ { text: 1, value: 1 }, 2 ]
                        },
                        3
                    ],
                    allowHTML   : true,
                    multiple    : true
                } );
        let refs                = flounder.refs;

        sinon.stub( utils, 'addClass', () => {} );
        sinon.stub( utils, 'removeClass', () => {} );

        sinon.stub( console, 'warn', () => {} );
        sinon.stub( flounder, 'onOpen', () => a + b );

        flounder.toggleOpen( {}, {}, refs, refs.wrapper );

        assert.equal( console.warn.callCount, 1 );

        console.warn.restore();
        utils.addClass.restore();
        utils.removeClass.restore();
    } );



    it( 'should skip everything if not ready', () =>
    {
        let select      = document.querySelector( 'SELECT' );
        select.innerHTML = '<option value="2">2</option><option value="3" disabled>3</option>';
        select.flounder = null;
        let flounder    = new Flounder( select );
        flounder.ready  = false;
        let refs        = flounder.refs;

        sinon.stub( utils, 'addClass', () => {} );
        sinon.stub( utils, 'removeClass', () => {} );

        sinon.stub( flounder, 'onClose', () => {} );

        flounder.toggleOpen( {}, {}, refs, refs.wrapper );

        assert.equal( flounder.onClose.callCount, 0 );

        utils.addClass.restore();
        utils.removeClass.restore();
        select.innerHTML = '';
    } );
} );
