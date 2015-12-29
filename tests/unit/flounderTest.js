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
        assert.ok( flounder.arrayOfFlounders, 'exists' );
        let flounders   = flounder.arrayOfFlounders( [ document.body ], flounder.props );
        flounder.destroy();
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

        assert.ok( firstCheck === secondCheck, 'multiple targets returns an array' );
    });
};

export default tests;
