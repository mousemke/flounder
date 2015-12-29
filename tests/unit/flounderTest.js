/* global document, window, µ, $, QUnit, Benchmark, buildTest  */
let tests = function( Flounder )
{
    QUnit.module( 'flounder.jsx' );


    /*
     * constructor tests
     *
     * @test    constructor exists
     * @test    constructor returns constructor with no args
     */
    QUnit.test( 'arrayOfFlounders', function( assert )
    {
        let flounder    = ( new Flounder( document.body ) );
        let flounders   = flounder.arrayOfFlounders( [ document.body ], flounder.props );
        flounder.destroy();
        assert.ok( Array.isArray( flounders ), 'multiple targets returns an array' );
        assert.ok( flounders[0] instanceof Flounder, 'of flounders' );
        flounders.forEach( function( el ){ el.destroy() } );
    });
};

export default tests;
