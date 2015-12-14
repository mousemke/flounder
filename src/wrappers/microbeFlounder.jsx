
/* jshint globalstrict: true */
'use strict';

import Flounder from './flounder.jsx';

( function( µ ) {

    µ.core.flounder = function( options )
    {
        return new Flounder( this, options );
    };

}( µ ) );