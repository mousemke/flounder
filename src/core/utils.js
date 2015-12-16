const utils =
{
    /**
     * ## addClass
     *
     * on the quest to nuke jquery, a wild helper function appears
     *
     * @param {DOMElement} _el target element
     * @param {String} _class class to add
     *
     * @return _Void_
     */
    addClass : function( _el, _class )
    {
        let _elClass        = _el.className;
        let _elClassLength  = _elClass.length;

        if ( !utils.hasClass( _el, _class ) && _elClass.slice( 0, _class.length + 1 ) !== _class + ' ' &&
            _elClass.slice( _elClassLength - _class.length - 1, _elClassLength ) !== ' ' + _class )
        {
            _el.className += '  ' + _class;
        }
    },


    /**
     * ## attachAttribute
     *
     * attached data attributes and others (seperately)
     *
     * @param {DOMElement} _el element to assign attributes
     * @param {Object} _elObj contains the attributes to attach
     *
     * @return _Void_
     */
    attachAttributes : function( _el, _elObj )
    {
        for ( let att in _elObj )
        {
            if ( att.indexOf( 'data-' ) !== -1 )
            {
                _el.setAttribute( att, _elObj[ att ] );
            }
            else
            {
                _el[ att ] = _elObj[ att ];
            }
        }
    },


    /**
     * ## constructElement
     *
     * @param {Object} _elObj object carrying properties to transfer
     *
     * @return _Element_
     */
    constructElement : function( _elObj )
    {
        let _el         = document.createElement( _elObj.tagname || 'div' );

        utils.attachAttributes( _el, _elObj );

        return _el;
    },


    /**
     * ## extendClass
     *
     * extends a class from an object.  returns the original reference
     *
     * @param {Class} arguments[0]
     *
     * @return {Class} modified class object
     */
    extendClass : function()
    {
        let extended = arguments[ 0 ].prototype;

        let merge = function ( obj )
        {
            for ( let prop in obj )
            {
                if ( Object.prototype.hasOwnProperty.call( obj, prop ) )
                {
                    extended[ prop ] = obj[ prop ];
                }
            }
        };

        for ( let i = 1, lenI = arguments.length; i < lenI; i++ )
        {
            let obj = arguments[ i ];
            merge( obj );
        }

        return extended;
    },


    /**
     * ## escapeHTML
     *
     * Escapes HTML in order to put correct elements in the DOM
     *
     * @param {String} string unescaped string
     *
     * @return _Void_
     */
    escapeHTML : function( string )
    {
        return String( string ).replace( /&/g, '&amp;' )
                                .replace( /</g, '&lt;' )
                                .replace( />/g, '&gt;' )
                                .replace( /"/g, '&quot;' );
    },


    /**
     * ## hasClass
     *
     * on the quest to nuke jquery, a wild helper function appears
     *
     * @param {DOMElement} _el target element
     * @param {String} _class class to check
     *
     * @return _Void_
     */
    hasClass : function( _el, _class )
    {
        let _elClass    = _el.className;
        let regex       = new RegExp( '(^' + _class + ' )|( ' + _class + '$)|( ' + _class + ' )|(^' + _class + '$)' );
        return !!_elClass.match( regex );
    },


    /**
     * ## iosVersion
     *
     * checks and returns the ios version
     *
     * @return _Void_:
     */
    iosVersion : function()
    {

      if ( /iPad|iPhone|iPod/.test( navigator.platform ) )
      {
        if ( !!window.indexedDB ) { return '8+'; }
        if ( !!window.SpeechSynthesisUtterance ) { return '7'; }
        if ( !!window.webkitAudioContext ) { return '6'; }
        return '5-';
      }

      return false;
    },


    /**
     * ## removeClass
     *
     * on the quest to nuke jquery, a wild helper function appears
     *
     * @param {DOMElement} _el target element
     * @param {String} _class class to remove
     *
     * @return _Void_
     */
    removeClass : function( _el, _class )
    {
        let _elClass        = _el.className;
        let _elClassLength  = _elClass.length;
        let _classLength    = _class.length;

        if ( _elClass.slice( 0, _classLength + 1 ) === _class + ' ' )
        {
            _el.className = _elClass.slice( _classLength + 1, _elClassLength );
        }

        if ( _elClass.slice( _elClassLength - _classLength - 1, _elClassLength ) === ' ' + _class )
        {
            _el.className = _elClass.slice( 0, _elClassLength - _classLength - 1 );
        }

        _el.className =  _el.className.trim();
    },


    /**
     * ## scrollTo
     *
     * checks if an option is visible and, if it is not, scrolls it into view
     *
     * @param {DOMElement} element element to check
     *
     *@return _Void_
     */
    scrollTo : function( element )
    {
        let parent      = element.parentNode.parentNode;
        let elHeight    = element.offsetHeight;
        let min         = parent.scrollTop;
        let max         = parent.scrollTop + parent.offsetHeight - element.offsetHeight;
        let pos         = element.offsetTop;

        if ( pos < min )
        {
            parent.scrollTop = pos  - ( elHeight * 0.5 );
        }
        else if ( pos > max )
        {
            parent.scrollTop = pos - parent.offsetHeight + ( elHeight * 1.5 );
        }
    },


    /**
     * ## toggleClass
     *
     * in a world moving away from jquery, a wild helper function appears
     *
     * @param  {DOMElement} _el target to toggle class on
     * @param  {String} _class class to toggle on/off
     *
     * @return _Void_
     */
    toggleClass : function( _el, _class )
    {
        let _addClass       = utils.addClass;
        let _removeClass    = utils.removeClass;

        if ( utils.hasClass( _el, _class ) )
        {
            _removeClass( _el, _class );
        }
        else
        {
            _addClass( _el, _class );
        }
    }
}

export default utils;
