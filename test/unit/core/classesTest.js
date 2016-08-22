
import classes from '/core/classes';
import assert   from 'assert';


describe( 'classes.js', () =>
{
    it( 'should contain classes', () =>
    {
        assert.ok( classes, 'exists' );
        assert.equal( classes.DISABLED, 'flounder__disabled' );
    } );
} );
