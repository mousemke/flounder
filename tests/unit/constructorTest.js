/* global document, window, µ, $, QUnit, Benchmark, buildTest  */
let tests = function( Flounder )
{
    QUnit.module( 'Flounder constructor' );


    /*
     * constructor tests
     *
     * @test    constructor exists
     * @test    constructor returns constructor with no args
     */
    QUnit.test( 'Flounder', function( assert )
    {
        assert.ok( Flounder, 'Flounder Exists' );
        let flounder = new Flounder;

        assert.deepEqual( Flounder, flounder, 'empty returns a new constructor' );

        let flounders = new Flounder( [ document.body ] );
        assert.ok( Array.isArray( flounders ), 'multiple targets returns an array' );
        assert.ok( flounders[0] instanceof Flounder, 'of flounders' );
        flounders[0].destroy();

        flounder = new Flounder( document.body );
        assert.ok( flounder instanceof Flounder, 'a single target makes a flounder' );
        flounder.destroy();
    });
};

export default tests;
