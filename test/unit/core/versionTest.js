
import version  from '/core/version';
import assert   from 'assert';
import _package from '../../../package.json';


describe( 'version.js', () =>
{
    it( 'should match the package version', () =>
    {
        assert.ok( version, 'exists' );
        assert.equal( version, _package.version, 'versions match' );
    } );
} );
