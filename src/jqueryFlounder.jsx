
/* jshint globalstrict: true */
'use strict';

import Flounder from './flounder.jsx';

( function( $ ) {

    $.fn.flounder = function( options )
    {
        return new Flounder( this, options );
    };

}( jQuery ) );