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
    });
};

export default tests;