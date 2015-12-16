
/* jshint globalstrict: true */
'use strict';

import Flounder from '../core/flounder.jsx';

( function( µ ) {

    µ.core.flounder = function( options )
    {
        return new Flounder( this, options );
    };

}( µ ) );