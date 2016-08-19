
import Flounder     from '/core/flounder';
import defaults     from '/core/defaults';

import classes      from '/core/classes';
import utils        from '/core/utils';
import build        from '/core/build';

import assert       from 'assert';
import sinon        from 'sinon';



/**
 * ## addOptionDescription
 *
 * adds a description to the option
 *
 * @param {DOMElement} el option leement to add description to
 * @param {String} text description
 *
 * @return _Void_
 */
describe( 'addOptionDescription', () =>
{
    it( 'should add a description element to the passed element', () =>
    {
        let el = document.createElement( 'div' );

        build.addOptionDescription( el, 'moon' );

        assert.equal( el.children.length, 1 );
        assert.equal( el.children[0].innerHTML, 'moon' );
        assert.equal( el.children[0].className, classes.DESCRIPTION );
    } );
} );



/**
 * ## addSearch
 *
 * checks if a search box is required and attaches it or not
 *
 * @param {Object} flounder main element reference
 *
 * @return _Mixed_ search node or false
 */
describe( 'addSearch', () =>
{
    it( 'should return false if no search is needed', () =>
    {
        let search = build.addSearch();
        assert.equal( search, false );
    } );


    it( 'should build a search input and add it to flounder', () =>
    {
        let el          = document.createElement( 'div' );
        build.search    = true;

        let search      = build.addSearch( el );
        assert.equal( search.className, classes.SEARCH );
        assert.equal( search.tagName, 'INPUT' );
        build.search    = false;
    } );
} );



/**
 * ## bindThis
 *
 * binds this to whatever functions need it.  Arrow functions cannot be used
 * here due to the react extension needing them as well;
 *
 * @return _Void_
 */
describe( 'bindThis', () =>
{
    it( 'should bind `this` to the list of functions', () =>
    {
        document.body.flounder = null;
        let flounder = new Flounder( document.body, {} );

        assert.equal( flounder.catchBodyClick.___isBound, true );
        assert.equal( flounder.checkClickTarget.___isBound, true );
        assert.equal( flounder.checkFlounderKeypress.___isBound, true );
        assert.equal( flounder.checkMultiTagKeydown.___isBound, true );
        assert.equal( flounder.clearPlaceholder.___isBound, true );
        assert.equal( flounder.clickSet.___isBound, true );
        assert.equal( flounder.divertTarget.___isBound, true );
        assert.equal( flounder.displayMultipleTags.___isBound, true );
        assert.equal( flounder.firstTouchController.___isBound, true );
        assert.equal( flounder.fuzzySearch.___isBound, true );
        assert.equal( flounder.removeMultiTag.___isBound, true );
        assert.equal( flounder.setKeypress.___isBound, true );
        assert.equal( flounder.setSelectValue.___isBound, true );
        assert.equal( flounder.toggleList.___isBound, true );
        assert.equal( flounder.toggleListSearchClick.___isBound, true );
    } );
} );



/**
 * ## buildArrow
 *
 * builds the arrow and the
 *
 * @param {Object} props property object
 * @param {Function} constructElement ref to this.constructElement
 *
 * @return {DOMElement} arrow
 */
describe( 'buildArrow', () =>
{
    document.body.flounder = null;
    let flounder = new Flounder( document.body, {} );

    it( 'should build and return an arrow element unless it\'s disabled', () =>
    {
        let res = build.buildArrow( { disableArrow : true }, utils.constructElement );

        assert.equal( res, false );

        let el = build.buildArrow( {}, utils.constructElement );

        assert.equal( el.nodeType, 1 );
        assert.equal( el.className, classes.ARROW );
        assert.equal( el.children.length, 1 );
        assert.equal( el.children[0].className, classes.ARROW_INNER );
    } );
} );



/**
 * ## buildData
 *
 * builds both the div and select based options. will skip the select box
 * if it already exists
 *
 * @param {Mixed} defaultValue default entry (string or number)
 * @param {Array} data array with optino information
 * @param {Object} optionsList reference to the div option wrapper
 * @param {Object} select reference to the select box
 *
 * @return _Array_ refs to both container elements
 */
describe( 'buildData', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## buildDom
 *
 * builds flounder
 *
 * @return _Void_
 */
describe( 'buildDom', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## buildMultiTag
 *
 * builds and returns a single multiTag
 *
 * @param {String} optionText text to add to the tag and role
 *
 * @return _DOMElement_ option tag
 */
describe( 'buildMultiTag', () =>
{
    it( 'should return a tag based on the option it\'s passed', () =>
    {
        let tag = build.buildMultiTag( { innerHTML: 'moon', index: 2 } );

        assert.equal( tag.tagName, 'SPAN' );
        assert.notEqual( tag.innerHTML.indexOf( 'moon' ), -1 );
        assert.equal( tag.getAttribute( 'tabindex' ), 0 );
        assert.equal( tag.className, classes.MULTIPLE_SELECT_TAG );
        assert.equal( tag.children.length, 1 );

        assert.equal( tag.getAttribute( 'aria-label' ), 'Close' );

        let close = tag.children[0];

        assert.equal( close.tagName, 'A' );
        assert.equal( close.getAttribute( 'data-index' ), 2 );
        assert.equal( close.className, classes.MULTIPLE_TAG_CLOSE );
    } );
} );



/**
 * ## initSelectBox
 *
 * builds the initial select box.  if the given wrapper element is a select
 * box, this instead scrapes that, thus allowing php fed elements
 *
 * @param {DOMElement} wrapper main wrapper element
 *
 * @return _DOMElement_ select box
 */
describe( 'initSelectBox', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## popInSelectElements
 *
 * pops the previously saves elements back into a select tag, restoring the
 * original state
 *
 * @param {DOMElement} select select element
 *
 * @return _Void_
 */
describe( 'popInSelectElements', () =>
{
    function buildSelect()
    {
        let select = document.createElement( 'SELECT' );

        let option1 = document.createElement( 'OPTION' );
        select.appendChild( option1 );

        let option2 = document.createElement( 'OPTION' );
        select.appendChild( option2 );

        let option3 = document.createElement( 'OPTION' );
        select.appendChild( option3 );

        return { select, option1, option2, option3 };
    }


    document.body.flounder = null;
    let flounder = new Flounder( document.body, {} );


    it( 'should restore the original children to the select tag', () =>
    {
        let selectObj1 = buildSelect();
        let selectObj2 = buildSelect();

        flounder.originalChildren = [ selectObj1.option1, selectObj1.option2, selectObj1.option3 ];

        flounder.popInSelectElements( selectObj2.select );

        assert.notDeepEqual( selectObj2.option1, selectObj2.select[0] );
        assert.equal( selectObj1.select.children.length, 0 );
    } );
} );



/**
 * ## popOutSelectElements
 *
 * pops out all the options of a select box, clones them, then appends the
 * clones.  This gives us the ability to restore the original tag
 *
 * @param {DOMElement} select select element
 *
 * @return _Void_
 */
describe( 'popOutSelectElements', () =>
{
    function buildSelect()
    {
        let select = document.createElement( 'SELECT' );

        let option1 = document.createElement( 'OPTION' );
        select.appendChild( option1 );
        let option2 = document.createElement( 'OPTION' );
        select.appendChild( option2 );
        let option3 = document.createElement( 'OPTION' );
        select.appendChild( option3 );

        return { select, option1, option2, option3 };
    }


    document.body.flounder = null;
    let flounder = new Flounder( document.body, {} );


    it( 'should save the original children from the select tag', () =>
    {
        let selectObj1 = buildSelect();
        let selectObj2 = buildSelect();

        flounder.popOutSelectElements( selectObj2.select );

        assert.equal( flounder.originalChildren.length, 3 );
        assert.equal( flounder.originalChildren[0].nodeType, 1 );
        assert.equal( flounder.originalChildren[0].tagName, 'OPTION' );
    } );
} );



/**
 * ## reconfigure
 *
 * after editing the data, this can be used to rebuild them
 *
 * @param {Object} props object containing config options
 *
 * @return _Object_ rebuilt flounder object
 */
describe( 'reconfigure', () =>
{
    document.body.flounder = null;
    let flounder = new Flounder( document.body, { data: [ 1, 2, 34 ] } );
    let _f;

    let flounderSpy = sinon.stub( flounder, 'constructor', ( el, props ) => props );

    it( 'should sort out the data given to it in preparation to rebuild, then call the constructor', () =>
    {
        let _p1 = flounder.reconfigure( [ 1, 2, 3 ] );
        let _p2 = flounder.reconfigure( [ 1, 2, 4 ], { multiple: true} );
        let _p3 = flounder.reconfigure( { data: [ 1, 2, 5 ] } );
        let _p4 = flounder.reconfigure( { search: true } );
        let _p5 = flounder.reconfigure( null, { data: [ 1, 2, 6 ] } );
        let _p6 = flounder.reconfigure();

        assert.deepEqual( _p1.data, [ 1, 2, 3 ] );

        assert.deepEqual( _p2.data, [ 1, 2, 4 ] );
        assert.equal( _p2.multiple, true );

        assert.deepEqual( _p3.data, [ 1, 2, 5 ] );

        assert.deepEqual( _p4, { search : true,
                                 data   : [
                                            { text: 1, value: 1, index: 0 },
                                            { text: 2, value: 2, index: 1 },
                                            { text: 34, value: 34, index: 2 }
                                        ]
                                    } );
        assert.equal( _p4.search, true );

        assert.deepEqual( _p5.data , [ 1, 2, 6 ] );
        assert.deepEqual( _p6.data , [
            {
                'index' : 0,
                'text'  : 1,
                'value' : 1
            },
            {
                'index' : 1,
                'text'  : 2,
                'value' : 2
            },
            {
                'index' : 2,
                'text'  : 34,
                'value' : 34
            }
        ] );
    } );
} );



/**
 * ## setTarget
 *
 * sets the target related
 *
 * @param {DOMElement} target  the actual to-be-flounderized element
 *
 * @return _Void_
 */
describe( 'setTarget', () =>
{
    document.body.flounder = null;
    let flounder = new Flounder( document.body, {} );

    it( 'should set a passed element as the target', () =>
    {
        let el = document.createElement( 'DIV' );
        flounder.setTarget( el );

        assert.deepEqual( el, flounder.target );
        assert.deepEqual( el, flounder.originalTarget );
    } );


    it( 'should find a passed selector string and set the first one as the target', () =>
    {
        flounder.setTarget( 'body' );

        assert.deepEqual( document.body, flounder.target );
        assert.deepEqual( document.body, flounder.originalTarget );
    } );


    it( 'should hide a passed input and set it\'s parent as the target', () =>
    {
        let div     = document.createElement( 'DIV' );
        let input   = document.createElement( 'INPUT' );
        div.appendChild( input );

        flounder.setTarget( input );

        assert.deepEqual( div, flounder.target );
        assert.deepEqual( input, flounder.originalTarget );
    } );
} );
