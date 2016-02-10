/* global document, QUnit  */

import utils from '../../src/core/utils.js';

let tests = function( Flounder )
{
    QUnit.module( 'utils.jsx' );


    /*
     * ## addClass tests
     *
     * @test exists
     * @test multiple targets returns an array
     * @test of flounders
     */
    QUnit.test( 'addClass', function( assert )
    {
        let body = document.body;
        assert.ok( utils.addClass, 'exists' );

        utils.addClass( body, 'moon' );
        assert.equal( document.body.className, 'moon', 'adds a class' );

        utils.addClass( body, [ 'moon', 'doge' ] );
        assert.equal( document.body.className, 'moon  doge', 'adds an array of classes' );
    } );


    // /*
    //  * ## addClass tests
    //  *
    //  * @test exists
    //  * @test multiple targets returns an array
    //  * @test of flounders
    //  */
    // QUnit.test( 'addClass', function( assert )
    // {
    //     let body = document.body;
    //     assert.ok( utils.addClass, 'exists' );

    //     utils.addClass( body, 'moon' );
    //     assert.equal( document.body.className, 'moon', 'adds a class' );

    //     utils.addClass( body, [ 'moon', 'doge' ] );
    //     assert.equal( document.body.className, 'moon  doge', 'adds an array of classes' );
    // } );
};

export default tests;
