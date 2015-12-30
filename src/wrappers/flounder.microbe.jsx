
/* jshint globalstrict: true */
'use strict';

import Flounder from '../core/flounder.jsx';

( function( µ ) {

    µ.core.flounder = function( options )
    {
        let flounderDestroy = Flounder.prototype.destroy;
        let flounder        = new Flounder( this, options );


        this.each( function( el, i )
        {
            let _f                      = flounder[ i ];
            el.data                     = el.data || {};
            el.data.flounder            = el.data.flounder || {};
            el.data.flounder.flounder   = _f;

            _f.destroy                  = function()
            {
                el.data.flounder.flounder = false;
                flounderDestroy.call( _f );
            };
        } );

        return flounder;
    };
}( µ ) );