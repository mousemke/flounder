
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
    document.body.flounder = null;
    let flounder    = new Flounder( document.body, { data: [ 1, 2, 3 ], search: true } );
    let refs        = flounder.refs;

    it( 'should skip the whole thing if there is no value', () =>
    {
        let e = { target: { value: '' } };

        assert.equal( flounder.checkEnterOnSearch( e, refs ), false );
    } );


    it( 'should select the option if there is only one entry', () =>
    {
        sinon.stub( refs.search, 'focus', () => {} );

        let e = { target: { value: '2' } };

        let res = flounder.checkEnterOnSearch( e, refs );

        assert.equal( res.length, 1 );
        assert.equal( refs.search.focus.callCount, 1 );

        refs.search.focus.restore();
    } );


    it( 'should only select the option if there is only one left', () =>
    {
        sinon.stub( refs.search, 'focus', () => {} );

        let e = { target: { value: '4' } };

        let res = flounder.checkEnterOnSearch( e, refs );

        assert.equal( res.length, 0 );
        assert.equal( refs.search.focus.callCount, 0 );

        refs.search.focus.restore();
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


    it( 'should check enter if search is enabled', () =>
    {
        let e = { keyCode: keycodes.ENTER, target: { value: 2 } };

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


    it( 'should no nothing if it doesnt hit the above conditions', () =>
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
    it( 'should', () =>
    {

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

    it( 'should', () =>
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
    it( 'should', () =>
    {

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
    it( 'should', () =>
    {

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
    it( 'should', () =>
    {




    //         QUnit.test( 'removeMultiTag', function( assert )
    // {
    //     let data = [
    //         'doge',
    //         'moon'
    //     ];

    //     let flounder    = new Flounder( document.body, { data : data, placeholder : 'placeholders!', multipleTags : true } );
    //     assert.ok( flounder.removeMultiTag, 'exists' );

    //     let refs = document.body.flounder.refs;
    //     let doge = refs.data[1];

    //     doge.click();

    //     let multiTagWrapper = refs.multiTagWrapper;
    //     multiTagWrapper.children[0].children[0].click();

    //     assert.equal( multiTagWrapper.children.length, 0, 'tag is removed' );

    //     flounder.destroy();
    // } );




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
        flounder = new Flounder( document.body, { data: [ 1, 2, 3 ] } );

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
    it( 'should', () =>
    {




    //         QUnit.test( 'removeSelectedClass', function( assert )
    // {
    //     let data = [
    //         'doge',
    //         'moon'
    //     ];

    //     let flounder    = new Flounder( document.body, { data : data, placeholder:'moon', multipleTags : true } );
    //     assert.ok( flounder.removeSelectedClass, 'exists' );

    //     let refs = document.body.flounder.refs;

    //     refs.data[1].click();
    //     refs.data[2].click();

    //     flounder.removeSelectedClass();
    //     let selected = refs.optionsList.querySelectorAll( '.flounder__option--selected' );

    //     assert.equal( selected.length, 0, 'selected class is removed from divs' );

    //     flounder.destroy();
    // } );




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
    it( 'should', () =>
    {



    // QUnit.test( 'removeSelectedValue', function( assert )
    // {
    //     let data = [
    //         'doge',
    //         'moon'
    //     ];

    //     let flounder    = new Flounder( document.body, { data : data, defaultIndex : 0, multipleTags : true } );
    //     assert.ok( flounder.removeSelectedValue, 'exists' );

    //     let refs = flounder.refs;
    //     refs.data[0].click();
    //     refs.data[1].click();

    //     flounder.removeSelectedValue();

    //     assert.equal( refs.select.selectedOptions.length, 0, 'selected is set to false for options' );

    //     flounder.destroy();
    // } );



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
 * handles arrow key selection
 *
 * @param {Object} e event object
 *
 * @return _Void_
 */
describe( 'setKeypress', () =>
{
    it( 'should', () =>
    {

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
    it( 'should', () =>
    {

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
    it( 'should', () =>
    {

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
    it( 'should', () =>
    {

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
    it( 'should', () =>
    {



    //         QUnit.test( 'setTextMultiTagIndent', function( assert )
    // {
    //     let data = [
    //         'doge',
    //         'moon'
    //     ];

    //     let flounder    = new Flounder( document.body, { data : data, defaultIndex : 0, multipleTags : true } );
    //     assert.ok( flounder.setTextMultiTagIndent, 'exists' );

    //     let refs = flounder.refs;

    //     let span = document.createElement( 'SPAN' );
    //     span.className = 'flounder__multiple--select--tag';
    //     span.innerHTML = '<a class="flounder__multiple__tag__close" data-index="1"></a>doge';

    //     refs.multiTagWrapper.appendChild( span );

    //     flounder.setTextMultiTagIndent();

    //     let style = getComputedStyle( span );

    //     let spanOffset = span.offsetWidth + parseInt( style[ 'margin-left' ] ) + parseInt( style[ 'margin-right' ] );
    //     assert.equal( refs.search.style.textIndent, spanOffset + 'px', 'search box text indent is correctly set' );

    //     flounder.destroy();
    // } );



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
    it( 'should', () =>
    {

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
    it( 'should', () =>
    {

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
    it( 'should', () =>
    {

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
    it( 'should', () =>
    {

    } );
} );
