/*
 * Copyright (c) 2015-2018 dunnhumby Germany GmbH.
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the LICENSE file
 * in the root directory of this source tree.
 *
 */

/* globals clearTimeout, document, setTimeout, window */

const utils = {
    /**
     * ## addClass
     *
     * on the quest to nuke jquery, a wild helper function appears
     *
     * @param {DOMElement} el target element
     * @param {String} clss class to add
     *
     * @return {Void} void
     */
    addClass( el, clss )
    {
        if ( Array.isArray( clss ) )
        {
            // $fixme
            // this should be Set, but uglify was mangling it away
            const uniqueValues = [];

            clss.forEach( c =>
            {
                if ( uniqueValues.includes( c ) )
                {
                    return;
                }

                uniqueValues.push( c );
            } );

            uniqueValues.forEach( c =>
            {
                utils.addClass( el, c );
            } );

            return true;
        }

        el.classList.add( clss );
    },


    /**
     * ## attachAttributes
     *
     * attached data attributes and others (seperately)
     *
     * @param {DOMElement} el element to assign attributes
     * @param {Object} elObj contains the attributes to attach
     *
     * @return {Void} void
     */
    attachAttributes( el, elObj )
    {
        if ( elObj )
        {
            for ( const att in elObj )
            {
                if ( att.slice( 0, 5 ) === 'data-' )
                {
                    el.setAttribute( att, elObj[ att ] );
                }
                else if ( att === 'className' )
                {
                    const objClass = elObj.className;
                    el.className = Array.isArray( objClass ) ?
                                            objClass.join( '  ' ) :
                                            objClass;
                }
                else
                {
                    el[ att ] = elObj[ att ];
                }
            }
        }
        else
        {
            return null;
        }
    },


    /**
     * ## constructElement
     *
     * @param {Object} elObj object carrying properties to transfer
     *
     * @return {Element} new element
     */
    constructElement( elObj )
    {
        const el = document.createElement( elObj.tagname || 'div' );

        utils.attachAttributes( el, elObj );

        return el;
    },


    /**
     * ## debounce
     *
     * debounces a function using the specified delay
     *
     * @param {Function} func function to be debounced
     * @param {Number} wait debounce delay
     * @param {Object} context context for debounced funtion execution
     *
     * @return {Void} void
     */
    debounce( func, wait, context = this )
    {
        let args;
        let timeout;

        const debounced = () => func.apply( context, args );

        return function()
        {
            clearTimeout( timeout );

            args    = arguments;
            timeout = setTimeout( debounced, wait );
        };
    },


    /**
     * ## extendClass
     *
     * extends a class from an object.  returns the original reference
     *
     * @param {Class} extend class to be extended
     * @param {Class} objects objects to extend the class with
     *
     * @return {Class} modified class object
     */
    extendClass( extend, ...objects )
    {
        extend = extend.prototype;

        /**
         * ## merge
         *
         * combines two objects
         *
         * @param {Object} obj object to combine with extend
         *
         * @return {Obj} newly combined object
         */
        function merge( obj )
        {
            for ( const prop in obj )
            {
                extend[ prop ] = obj[ prop ];
            }
        }

        for ( let i = 0, lenI = objects.length; i < lenI; i++ )
        {
            const obj = objects[ i ];
            merge( obj );
        }

        return extend;
    },


    /**
     * ## escapeHTML
     *
     * Escapes HTML in order to put correct elements in the DOM
     *
     * @param {String} string unescaped string
     *
     * @return {Void} void
     */
    escapeHTML( string )
    {
        return String( string ).replace( /&/g, '&amp;' )
                                .replace( /</g, '&lt;' )
                                .replace( />/g, '&gt;' )
                                .replace( /"/g, '&quot;' );
    },


    /**
     * ## getElWidth
     *
     * gets the width adjusted for margins
     *
     * @param {DOMElement} el target element
     * @param {Function} cb callback
     * @param {Object} context transferred this
     * @param {Number} timeout time to wait in ms
     *
     * @return {Integer} adjusted width
     */
    getElWidth( el, cb, context, timeout = 1500 )
    {
        const style = window.getComputedStyle( el );

        if ( el.offsetWidth === 0 && this.checkWidthAgain !== true )
        {
            if ( cb && context )
            {
                /* istanbul ignore next */
                setTimeout( cb.bind( context ), timeout );
                this.checkWidthAgain = true;
            }
            else
            {
                throw 'Flounder getElWidth error: no callback given.';
            }
        }
        else
        {
            this.checkWidthAgain = false;
        }

        return el.offsetWidth + parseInt( style[ 'margin-left' ] ) +
                                parseInt( style[ 'margin-right' ] );
    },


    /**
     * ## hasClass
     *
     * on the quest to nuke jquery, a wild helper function appears
     *
     * @param {DOMElement} el target element
     * @param {String} clss class to check
     *
     * @return {Void} void
     */
    hasClass( el, clss )
    {
        let testClass = clss;

        if ( Array.isArray( clss ) )
        {
            testClass = testClass[ 0 ];
        }

        return el.classList.contains( testClass );
    },


    /**
     * ## iosVersion
     *
     * checks and returns the ios version
     *
     * @param {Object} windowObj window, but allows for as testing override
     *
     * @return {Void} void
     */
    iosVersion( windowObj = window )
    {
        if ( /iPad|iPhone|iPod/.test( windowObj.navigator.platform ) )
        {
            if ( windowObj.indexedDB )
            {
                return '8+';
            }
            else if ( windowObj.SpeechSynthesisUtterance )
            {
                return '7';
            }
            if ( windowObj.webkitAudioContext )
            {
                return '6';
            }

            return '5-';
        }

        return false;
    },


    /**
     * ## removeAllChildren
     *
     * removes all children from a specified target
     *
     * @param {DOMElement} target target element
     *
     * @return {Void} void
     */
    removeAllChildren( target )
    {
        Array.prototype.slice.call( target.children, 0 ).forEach( el =>
        {
            target.removeChild( el );
        } );
    },


    /**
     * ## removeClass
     *
     * on the quest to nuke jquery, a wild helper function appears
     *
     * @param {DOMElement} el target element
     * @param {String} clss class to remove
     *
     * @return {Void} void
     */
    removeClass( el, clss )
    {
        if ( Array.isArray( clss ) )
        {
            // $fixme
            // this should be Set, but uglify was mangling it away
            const uniqueValues = [];

            clss.forEach( c =>
            {
                if ( uniqueValues.includes( c ) )
                {
                    return;
                }

                uniqueValues.push( c );
            } );

            uniqueValues.forEach( c =>
            {
                utils.removeClass( el, c );
            } );

            return true;
        }

        el.classList.remove( clss );
    },


    /**
     * ## scrollTo
     *
     * checks if an option is visible and, if it is not, scrolls it into view
     *
     * @param {DOMElement}  element         element to check
     * @param {DOMElement}  [scrollParent]  parent element to scroll
     *
     * @return {Void} void
     */
    scrollTo( element, scrollParent )
    {
        if ( element )
        {
            const scrollElement = scrollParent || element.offsetParent;

            if ( scrollElement.scrollHeight > scrollElement.offsetHeight )
            {
                const pos        = element.offsetTop;
                const elHeight   = element.offsetHeight;
                const contHeight = scrollElement.offsetHeight;

                const min = scrollElement.scrollTop;
                const max = min + scrollElement.offsetHeight - elHeight;

                if ( pos < min )
                {
                    scrollElement.scrollTop = pos;
                }
                else if ( pos > max )
                {
                    scrollElement.scrollTop = pos - ( contHeight - elHeight );
                }
            }
        }

        return false;
    },


    /**
     * ## setPlatform
     *
     * sets the platform to osx or not osx for the sake of the multi select key
     *
     * @param {Object} windowObj window, but allows for as testing override
     *
     * @return {Void} void
     */
    setPlatform( windowObj = window )
    {
        const platform      = windowObj.navigator.platform;
        const isOsx         = platform.indexOf( 'Mac' ) !== -1;
        const isIos         = utils.iosVersion( windowObj );
        const multiSelect   = isOsx ? 'metaKey' : 'ctrlKey';

        return {
            isOsx,
            isIos,
            multiSelect
        };
    },


    /**
     * ## toggleClass
     *
     * in a world moving away from jquery, a wild helper function appears
     *
     * @param  {DOMElement} _el target to toggle class on
     * @param  {String} _class class to toggle on/off
     *
     * @return {Void} void
     */
    toggleClass( _el, _class )
    {
        if ( utils.hasClass( _el, _class ) )
        {
            utils.removeClass( _el, _class );
        }
        else
        {
            utils.addClass( _el, _class );
        }
    }
};

export default utils;
