
import keycodes from '/core/keycodes';
import assert   from 'assert';


describe( 'keycodes.js', () =>
{
    it( 'should contain keycodes', () =>
    {
        assert.ok( keycodes, 'exists' );
        assert.equal( keycodes.UP, 38 );
    } );
} );
