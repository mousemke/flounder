
import Flounder from '../core/flounder';

( function( $ ) {

    $.fn.flounder = function( options )
    {
        let flounderDestroy = Flounder.prototype.destroy;

        this.each( function( i, el )
        {
            let _f      = new Flounder( el, options );
            let $el     = $( el );
            $el.data( 'flounder', _f );

            _f.destroy  = function()
            {
                $el.data( 'flounder', false );
                flounderDestroy.call( _f );
            };
        } );

        return this;
    };

}( jQuery ) );
