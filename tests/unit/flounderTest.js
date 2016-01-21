/* global document, window, µ, $, QUnit, Benchmark, buildTest  */
let data = [
    'doge',
    'moon'
];


let tests = function( Flounder )
{
    QUnit.module( 'flounder.jsx' );


    /*
     * arrayOfFlounders tests
     *
     * @test    exists
     * @test    multiple targets returns an array
     * @test    of flounders
     */
    QUnit.test( 'arrayOfFlounders', function( assert )
    {
        let flounder    = ( new Flounder( document.body ) );
        assert.ok( flounder.arrayOfFlounders, 'exists' );

        let flounders   = flounder.arrayOfFlounders( [ document.body ], flounder.props );
        assert.ok( Array.isArray( flounders ), 'multiple targets returns an array' );
        assert.ok( flounders[0] instanceof Flounder, 'of flounders' );

        flounders.forEach( function( el ){ el.destroy() } );
    });


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
    });


    QUnit.test( 'displayMultipleTags', function( assert )
    {
        let flounder    = new Flounder( document.body,
                                { multiple : true, multipleTags : true, data : data } );

        assert.ok( flounder.displayMultipleTags, 'exists' );

        let refs        = flounder.refs;
        refs.data[ 1 ].click();
        refs.data[ 2 ].click();

        assert.equal( document.querySelectorAll( '.flounder__multiple--select--tag' ).length,
                                        2, "tags are created for all clicks" )

        var closeDivs = document.querySelectorAll( '.flounder__multiple__tag__close' );
        closeDivs = Array.prototype.slice.call( closeDivs );
        closeDivs.forEach( function( el )
        {
            el.click();
        } );

        flounder.destroy();
    });
};

export default tests;
