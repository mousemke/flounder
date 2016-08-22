
import Flounder from '../core/flounder';

( function( µ ) {

    µ.core.flounder = function( options )
    {
        let flounderDestroy = Flounder.prototype.destroy;

        this.each( function( el, i )
        {
            let _f                      = new Flounder( el, options );
            el.data                     = el.data || {};
            el.data.flounder            = el.data.flounder || {};
            el.data.flounder.flounder   = _f;

            _f.destroy                  = function()
            {
                el.data.flounder.flounder = false;
                flounderDestroy.call( _f );
            };
        } );

        return this;
    };
}( µ ) );
