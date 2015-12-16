
/* jshint globalstrict: true */
'use strict';

import Flounder from '../core/flounder.jsx';

( function( µ ) {

    µ.core.flounder = function( options )
    {
        console.log( Flounder );
        return new Flounder( this, options );
    };

}( µ ) );