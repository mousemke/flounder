/* global jQuery */
import Flounder from '../core/flounder';

( function( $ )
{
    $.fn.flounder = function( options )
    {
        let flounderDestroy = Flounder.prototype.destroy;

        this.each( function( i, el )
        {
            let f       = new Flounder( el, options );
            let $el     = $( el );
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
