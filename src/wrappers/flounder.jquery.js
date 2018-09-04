/*
 * Copyright (c) 2016 dunnhumby Germany GmbH.
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the LICENSE file
 * in the root directory of this source tree.
 *
 */

/* global jQuery */
import Flounder from '../core/flounder';

( function( $ )
{
    $.fn.flounder = function( options )
    {
        const flounderDestroy = Flounder.prototype.destroy;

        this.each( ( i, el ) =>
        {
            const f     = new Flounder( el, options );
            const $el   = $( el );
            $el.data( 'flounder', f );

            f.destroy  = function()
            {
                $el.data( 'flounder', false );
                flounderDestroy.call( f );
            };
        } );

        return this;
    };

}( jQuery ) );
