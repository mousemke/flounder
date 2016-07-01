/* global document, QUnit  */
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

        // let flounders = Flounder.find( [ document.body ] );
        // assert.ok( Array.isArray( flounders ), 'multiple targets returns an array' );
        // assert.ok( flounders[0] instanceof Flounder, 'of flounders' );
        // flounders[0].destroy();

        let flounder = new Flounder( document.body );
        assert.ok( flounder instanceof Flounder, 'a single target makes a flounder' );
        flounder.destroy();


        flounder = new Flounder( document.body );

        let ref     = flounder.refs.flounder.flounder instanceof Flounder;
        let oTarget = flounder.originalTarget.flounder instanceof Flounder;
        let target  = flounder.target.flounder instanceof Flounder;

        assert.ok( ref === true && oTarget === true && target === true, 'creates all refs' );
        flounder.destroy();
        ref     = flounder.refs.flounder.flounder instanceof Flounder;
        oTarget = flounder.originalTarget.flounder instanceof Flounder;
        target  = flounder.target.flounder instanceof Flounder;

        assert.ok( ( !ref && !oTarget && !target ), 'and removes them all' );
    });


    /*
     * ## find tests
     *
     * @test exists
     * @test multiple targets returns an array
     * @test of flounders
     */
    QUnit.test( 'find', function( assert )
    {
        assert.ok( Flounder.find, 'exists' );

        let flounders   = Flounder.find( [ document.body ], {} );
        assert.ok( Array.isArray( flounders ), 'multiple targets returns an array' );
        assert.ok( flounders[0] instanceof Flounder, 'of flounders' );

        flounders.forEach( function( el ){ el.destroy() } );
    } );

};

export default tests;
