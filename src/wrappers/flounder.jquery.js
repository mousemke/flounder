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
