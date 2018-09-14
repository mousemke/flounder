/*
 * Copyright (c) 2016 dunnhumby Germany GmbH.
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the LICENSE file
 * in the root directory of this source tree.
 *
 */

/* globals describe, it, document */
import Flounder     from '/core/flounder';

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
        const el = document.createElement( 'div' );
        build.classes = classes;
        build.addOptionDescription( el, 'moon' );

        assert.equal( el.children.length, 1 );
        assert.equal( el.children[ 0 ].innerHTML, 'moon' );

        assert.equal( el.children[ 0 ].className, classes.DESCRIPTION );
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
        build.classes   = classes;
        const search      = build.addSearch();
        assert.equal( search, false );
    } );


    it( 'should build a search input and add it to flounder', () =>
    {
        const el          = document.createElement( 'div' );
        const fMock       = document.createElement( 'div' );
        fMock.appendChild( el );
        build.search    = true;

        const search      = build.addSearch( el, fMock );
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
        const flounder = new Flounder( document.body, {} );

        assert.equal( flounder.catchBodyClick.isBound, true );
        assert.equal( flounder.checkClickTarget.isBound, true );
        assert.equal( flounder.checkFlounderKeypress.isBound, true );
        assert.equal( flounder.checkMultiTagKeydown.isBound, true );
        assert.equal( flounder.clearPlaceholder.isBound, true );
        assert.equal( flounder.clickSet.isBound, true );
        assert.equal( flounder.divertTarget.isBound, true );
        assert.equal( flounder.displayMultipleTags.isBound, true );
        assert.equal( flounder.firstTouchController.isBound, true );
        assert.equal( flounder.fuzzySearch.isBound, true );
        assert.equal( flounder.removeMultiTag.isBound, true );
        assert.equal( flounder.setKeypress.isBound, true );
        assert.equal( flounder.setSelectValue.isBound, true );
        assert.equal( flounder.toggleList.isBound, true );
        assert.equal( flounder.toggleListSearchClick.isBound, true );
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

    it( 'should build and return an arrow element unless it\'s disabled', () =>
    {
        const res = build.buildArrow( {
            disableArrow : true
        }, utils.constructElement );

        assert.equal( res, false );

        const el = build.buildArrow( {}, utils.constructElement );

        assert.equal( el.nodeType, 1 );
        assert.equal( el.className, classes.ARROW );
        assert.equal( el.children.length, 1 );
        assert.equal( el.children[ 0 ].className, classes.ARROW_INNER );
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
        const tag = build.buildMultiTag( {
            innerHTML   : 'moon',
            index       : 2
        } );

        assert.equal( tag.tagName, 'SPAN' );
        assert.notEqual( tag.innerHTML.indexOf( 'moon' ), -1 );
        assert.equal( tag.getAttribute( 'tabindex' ), 0 );
        assert.equal( tag.className, classes.MULTIPLE_SELECT_TAG );
        assert.equal( tag.children.length, 1 );

        assert.equal( tag.getAttribute( 'aria-label' ), 'Close' );

        const close = tag.children[ 0 ];

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
 * buildSelect
 * @return {Object} options
 */
function buildSelect()
{
    const select = document.createElement( 'SELECT' );

    const option1 = document.createElement( 'OPTION' );
    select.appendChild( option1 );

    const option2 = document.createElement( 'OPTION' );
    select.appendChild( option2 );

    const option3 = document.createElement( 'OPTION' );
    select.appendChild( option3 );

    return {
        select,
        option1,
        option2,
        option3
    };
}


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
    document.body.flounder = null;
    const flounder = new Flounder( document.body, {} );


    it( 'should restore the original children to the select tag', () =>
    {
        const selectObj1 = buildSelect();
        const selectObj2 = buildSelect();

        flounder.originalChildren = [
            selectObj1.option1,
            selectObj1.option2,
            selectObj1.option3
        ];

        flounder.popInSelectElements( selectObj2.select );

        assert.notDeepEqual( selectObj2.option1, selectObj2.select[ 0 ] );
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
    document.body.flounder = null;
    const flounder = new Flounder( document.body, {} );


    it( 'should save the original children from the select tag', () =>
    {
        const selectObj2 = buildSelect();

        flounder.popOutSelectElements( selectObj2.select );

        assert.equal( flounder.originalChildren.length, 3 );
        assert.equal( flounder.originalChildren[ 0 ].nodeType, 1 );
        assert.equal( flounder.originalChildren[ 0 ].tagName, 'OPTION' );
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
    const flounder = new Flounder( document.body, {
        data : [ 1, 2, 34 ]
    } );

    sinon.stub( flounder, 'constructor', ( el, props ) => props );

    it( 'should sort out the data given as preparation to rebuild', () =>
    {
        const p1 = flounder.reconfigure( [ 1, 2, 3 ] );
        const p2 = flounder.reconfigure( [ 1, 2, 4 ], {
            multiple : true
        } );
        const p3 = flounder.reconfigure( {
            data : [ 1, 2, 5 ]
        } );
        const p4 = flounder.reconfigure( {
            search : true
        } );
        const p5 = flounder.reconfigure( null, {
            data : [ 1, 2, 6 ]
        } );
        const p6 = flounder.reconfigure();

        assert.deepEqual( p1.data, [ 1, 2, 3 ] );

        assert.deepEqual( p2.data, [ 1, 2, 4 ] );
        assert.equal( p2.multiple, true );

        assert.deepEqual( p3.data, [ 1, 2, 5 ] );

        assert.deepEqual( p4, {
            search : true,
            data   : [
                {
                    text    : 1,
                    value   : 1,
                    index   : 0
                },
                {
                    text    : 2,
                    value   : 2,
                    index   : 1
                },
                {
                    text    : 34,
                    value   : 34,
                    index   : 2
                }
            ]
        } );
        assert.equal( p4.search, true );

        assert.deepEqual( p5.data, [ 1, 2, 6 ] );
        assert.deepEqual( p6.data, [
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
    const flounder = new Flounder( document.body, {} );

    it( 'should set a passed element as the target', () =>
    {
        const el = document.createElement( 'DIV' );
        flounder.setTarget( el );

        assert.deepEqual( el, flounder.target );
        assert.deepEqual( el, flounder.originalTarget );
    } );


    it( 'should find a passed selector string and set the first one', () =>
    {
        flounder.setTarget( 'body' );

        assert.deepEqual( document.body, flounder.target );
        assert.deepEqual( document.body, flounder.originalTarget );
    } );


    it( 'should hide a passed input and set it\'s parent as the target', () =>
    {
        const div     = document.createElement( 'DIV' );
        const input   = document.createElement( 'INPUT' );
        div.appendChild( input );

        flounder.setTarget( input );

        assert.deepEqual( div, flounder.target );
        assert.deepEqual( input, flounder.originalTarget );
    } );
} );
