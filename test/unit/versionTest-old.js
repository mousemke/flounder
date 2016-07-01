
/* global document, QUnit  */
import version  from '../../src/core/version.js';
import _package from '../../package.json';

let tests = function( Flounder )
{
    QUnit.module( 'version.js' );

    /*
     * ## version tests
     *
     * @test exists
     * @test matches the package file
     */
    QUnit.test( 'version', function( assert )
    {
        assert.ok( version, 'exists' );

        assert.equal( version, _package.version, 'versions match' );
    } );
};

export default tests;
