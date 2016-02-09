/* global document, window, QUnit, Benchmark, buildTest  */

import classes from '../../src/core/classes.js';

let tests = function( Flounder )
{
    QUnit.module( 'flounder.jsx' );


    /*
     * ## arrayOfFlounders tests
     *
     * @test exists
     * @test multiple targets returns an array
     * @test of flounders
     */
    QUnit.test( 'arrayOfFlounders', function( assert )
    {
        let flounder    = ( new Flounder( document.body ) );
        assert.ok( flounder.arrayOfFlounders, 'exists' );

        let flounders   = flounder.arrayOfFlounders( [ document.body ], flounder.props );
        assert.ok( Array.isArray( flounders ), 'multiple targets returns an array' );
        assert.ok( flounders[0] instanceof Flounder, 'of flounders' );

        flounders.forEach( function( el ){ el.destroy() } );
    } );


    /*
     * ## componentWillUnmount tests
     *
     * @test exists
     * @test events are removed
     */
    QUnit.test( 'componentWillUnmount', function( assert )
    {
        let flounder    = ( new Flounder( document.body ) );
        assert.ok( flounder.componentWillUnmount, 'exists' );

        let refs        = flounder.refs;
        refs.selected.click();

        let firstCheck = refs.wrapper.className.indexOf( 'open' );
        flounder.componentWillUnmount();
        refs.selected.click();

        let secondCheck = refs.wrapper.className.indexOf( 'open' );
        flounder.destroy();

        assert.ok( firstCheck === secondCheck, 'events are removed' );
    } );


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
     * ## fuzzySearch tests
     *
     * @test exists
     * @test correctly filters data elements
     */
    QUnit.test( 'fuzzySearch', function( assert )
    {
        let data = [
            'doge',
            'moon'
        ];

        let flounder    = new Flounder( document.body, { data : data, defaultIndex : 0, search : true } );

        assert.ok( flounder.fuzzySearch, 'exists' );

        let flounderRefs = flounder.refs;

        flounderRefs.search.click();
        flounder.fuzzySearch( { keyCode : 77,
                                preventDefault : e => e,
                                target  : { value : 'm  ' }
                                } );

        let hiddenOptions = flounderRefs.optionsListWrapper.querySelectorAll( '.' + classes.SEARCH_HIDDEN );

        assert.deepEqual( hiddenOptions[ 0 ], flounderRefs.data[ 0 ], 'correctly filters data elements' );
        flounder.destroy();
    } );


    /*
     * ## fuzzySearchReset tests
     *
     * @test exists
     * @test correctly blanks the search input
     * @test correctly resets search filtered elements
     */
    QUnit.test( 'fuzzySearchReset', function( assert )
    {
        let data = [
            'doge',
            'moon'
        ];

        let flounder    = new Flounder( document.body, { data : data, defaultIndex : 0, search : true } );

        assert.ok( flounder.fuzzySearchReset, 'exists' );

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
        flounder.destroy();
    } );


    /*
     * ## initialzeOptions tests
     *
     * @test exists
     * @test correctly resets search filtered elements
     */
    QUnit.test( 'initialzeOptions', function( assert )
    {
        let data = [
            'doge',
            'moon'
        ];

        let flounder    = new Flounder( document.body, { data : data, defaultIndex : 0, search : true } );

        assert.ok( flounder.initialzeOptions, 'exists' );
    } );
};

export default tests;
