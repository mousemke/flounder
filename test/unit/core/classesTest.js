/*
 * Copyright (c) 2016 dunnhumby Germany GmbH.
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the LICENSE file
 * in the root directory of this source tree.
 *
 */

/* globals describe, it */
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
