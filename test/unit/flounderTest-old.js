/* global document, QUnit  */

import classes from '../../src/core/classes.js';

let tests = function( Flounder )
{
    QUnit.module( 'flounder.js' );

    /*
     * ## displayMultipleTags tests
     *
     * @test exists
     * @test tags are created for all clicks
     * @test close events are properly bound
     */
    QUnit.test( 'displayMultipleTags', function( assert )
    {
        let data = [
            'doge',
            'moon'
        ];

        let flounder    = new Flounder( document.body,
                                { multiple : true, multipleTags : true, data : data } );

        assert.ok( flounder.displayMultipleTags, 'exists' );

        let refsData       = flounder.refs.data;
        refsData[ 1 ].click();
        refsData[ 2 ].click();

        assert.equal( document.querySelectorAll( '.flounder__multiple--select--tag' ).length,
                                        2, 'tags are created for all clicks' );

        var closeDivs = document.querySelectorAll( '.flounder__multiple__tag__close' );
        closeDivs = Array.prototype.slice.call( closeDivs );
        closeDivs.forEach( function( el )
        {
            el.click();
        } );
        assert.equal( document.querySelectorAll( '.flounder__multiple--select--tag' ).length,
                                        0, 'close events are properly bound' );

        flounder.destroy();
    } );


    /*
     * ## displaySelected tests
     *
     * @test exists
     * @test the correct thing is displayed
     */
    QUnit.test( 'displaySelected', function( assert )
    {
        let data = [
            'doge',
            'moon'
        ];

        let flounder    = new Flounder( document.body, { data : data, defaultIndex : 0 } );

        assert.ok( flounder.displaySelected, 'exists' );
        flounder.setByIndex( 1 );

        assert.equal( flounder.refs.selected.textContent,
                    flounder.refs.data[ 1 ].textContent, 'The correct thing is displayed' );

        flounder.destroy();
    } );


    /*
     * ## removeMultiTag tests
     *
     * @test exists
     */
    QUnit.test( 'removeMultiTag', function( assert )
    {
        let data = [
            'doge',
            'moon'
        ];

        let flounder    = new Flounder( document.body, { data : data, placeholder : 'placeholders!', multipleTags : true } );
        assert.ok( flounder.removeMultiTag, 'exists' );

        let refs = document.body.flounder.refs;
        let doge = refs.data[1];

        doge.click();

        let multiTagWrapper = refs.multiTagWrapper;
        multiTagWrapper.children[0].children[0].click();

        assert.equal( multiTagWrapper.children.length, 0, 'tag is removed' );

        flounder.destroy();
    } );


    /*
     * ## removeSelectedClass tests
     *
     * @test exists
     */
    QUnit.test( 'removeSelectedClass', function( assert )
    {
        let data = [
            'doge',
            'moon'
        ];

        let flounder    = new Flounder( document.body, { data : data, placeholder:'moon', multipleTags : true } );
        assert.ok( flounder.removeSelectedClass, 'exists' );

        let refs = document.body.flounder.refs;

        refs.data[1].click();
        refs.data[2].click();

        flounder.removeSelectedClass();
        let selected = refs.optionsList.querySelectorAll( '.flounder__option--selected' );

        assert.equal( selected.length, 0, 'selected class is removed from divs' );

        flounder.destroy();
    } );


    /*
     * ## removeSelectedValue tests
     *
     * @test exists
     */
    QUnit.test( 'removeSelectedValue', function( assert )
    {
        let data = [
            'doge',
            'moon'
        ];

        let flounder    = new Flounder( document.body, { data : data, defaultIndex : 0, multipleTags : true } );
        assert.ok( flounder.removeSelectedValue, 'exists' );

        let refs = flounder.refs;
        refs.data[0].click();
        refs.data[1].click();

        flounder.removeSelectedValue();

        assert.equal( refs.select.selectedOptions.length, 0, 'selected is set to false for options' );

        flounder.destroy();
    } );


    /*
     * ## setTextMultiTagIndent tests
     *
     * @test exists
     */
    QUnit.test( 'setTextMultiTagIndent', function( assert )
    {
        let data = [
            'doge',
            'moon'
        ];

        let flounder    = new Flounder( document.body, { data : data, defaultIndex : 0, multipleTags : true } );
        assert.ok( flounder.setTextMultiTagIndent, 'exists' );

        let refs = flounder.refs;

        let span = document.createElement( 'SPAN' );
        span.className = 'flounder__multiple--select--tag';
        span.innerHTML = '<a class="flounder__multiple__tag__close" data-index="1"></a>doge';

        refs.multiTagWrapper.appendChild( span );

        flounder.setTextMultiTagIndent();

        let style = getComputedStyle( span );

        let spanOffset = span.offsetWidth + parseInt( style[ 'margin-left' ] ) + parseInt( style[ 'margin-right' ] );
        assert.equal( refs.search.style.textIndent, spanOffset + 'px', 'search box text indent is correctly set' );

        flounder.destroy();
    } );


    /*
     * ## blur Opened Dropdowns
     *
     * @test exists
     * @test multiple targets returns an array
     * @test of flounders
     */
    QUnit.test( 'blurOpenedDropdown', function( assert )
    {
        let data = [
            {
                text : "Item 1",
                value : "item1"
            },
            {
                text : "Item 2",
                value : "item2"
            }
        ];

        let container = document.createElement( 'div' );
        document.body.appendChild( container );

        let flounder    = ( new Flounder( container, { data : data } ) );

        flounder.setByValue( 'item1' );
        flounder.refs.selected.click();

        document.body.click();

        assert.equal( flounder.refs.selected.innerHTML, 'Item 1', 'text is' +
            ' stayed after focusout' );

        flounder.destroy();
    } );


    /**
     * Destroy input when it has siblings.
     * Flounder is added as last sibling.
     * Flounder container should be remove properly on destroy.
     */
    QUnit.test( 'destroyInput', function( assert )
    {
        let data = [
            {
                text : "Item 1",
                value : "item1"
            },
            {
                text : "Item 2",
                value : "item2"
            }
        ];

        let container = document.createElement( 'div' ),
            target = document.createElement( 'input' ),
            someLabel = document.createElement( 'label' );

        container.appendChild(target);
        container.appendChild(someLabel);

        document.body.appendChild( container );

        let flounder    = ( new Flounder( target, { data : data } ) ),
            flounderDomEl = flounder.refs.flounder.parentNode;

        assert.ok( flounderDomEl.parentNode , 'flounder is in DOM' );
        flounder.destroy();
        assert.notOk( flounderDomEl.parentNode, 'flounder is NOT in DOM' +
            ' anymore' );
    } );
};

export default tests;
