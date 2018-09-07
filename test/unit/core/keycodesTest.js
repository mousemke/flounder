/*
 * Copyright (c) 2016 dunnhumby Germany GmbH.
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the LICENSE file
 * in the root directory of this source tree.
 *
 */

/* globals describe, it */
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
