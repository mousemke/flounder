/*
 * Copyright (c) 2016 dunnhumby Germany GmbH.
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the LICENSE file
 * in the root directory of this source tree.
 *
 */

/* globals describe, it */
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
