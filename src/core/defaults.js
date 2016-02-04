import classes              from './classes';

const defaultOptions = {
    classes                 : {
        flounder    : '',
        hidden      : 'flounder--hidden',
        selected    : 'flounder__option--selected',
        wrapper     : ''
    },
    data                    : [],
    keepChangesOnDestroy    : false,
    multiple                : false,
    multipleTags            : false,
    multipleMessage         : '(Multiple Items Selected)',
    onClose                 : function( e, selectedValues ){},
    onComponentDidMount     : function(){},
    onComponentWillUnmount  : function(){},
    onFirstTouch            : function( e ){},
    onInit                  : function(){},
    onOpen                  : function( e, selectedValues ){},
    onSelect                : function( e, selectedValues ){},
    placeholder             : 'Please choose an option',
    search                  : false,
    selectDataOverride      : false
};

const defaults = {

    defaultOptions : defaultOptions,


    /**
     * ## setDefaultOption
     *
     * sets the initial default value
     *
     * @param {String or Number}    defaultProp         default passed from this.props
     * @param {Object}              data                this.props.data
     *
     * @return _Void_
     */
    setDefaultOption : function( self, configObj, data = [], rebuild = false )
    {
        /**
         * ## setIndexDefault
         *
         * sets a specified indexas the default option. This only works correctly
         * if it is a valid index, otherwise it returns null
         *
         * @return {Object} default settings
         */
        let setIndexDefault = function( _data, index )
        {
            let defaultIndex        = index || index === 0 ? index : configObj.defaultIndex;
            let defaultOption       = _data[ defaultIndex ];

            if ( defaultOption )
            {
                defaultOption.index   = defaultIndex;
                return defaultOption;
            }

            return null;
        };


        /**
         * ## setPlaceholderDefault
         *
         * sets a placeholder as the default option.  This inserts an empty
         * option first and sets that as default
         *
         * @return {Object} default settings
         */
        let setPlaceholderDefault = function( _data )
        {
            let refs        = self.refs;
            let select      = refs.select;

            let _default    = {
                text        : configObj.placeholder || defaultOptions.placeholder,
                value       : '',
                index       : 0,
                extraClass  : classes.HIDDEN
            };

            if ( select )
            {
                let escapedText     = self.escapeHTML( _default.text );

                if ( !select[ 0 ] || select[ 0 ].value !== '' )
                {
                    let defaultOption   = self.constructElement( { tagname : 'option',
                                                className   : classes.OPTION_TAG,
                                                value       :  _default.value } );
                    defaultOption.innerHTML = escapedText;

                    select.insertBefore( defaultOption, select[ 0 ] );
                    self.refs.selectOptions.unshift( defaultOption );
                    data.unshift( _default );
                }
                else
                {
                    data[ 0 ] = _default;
                }
            }
            else
            {
                data.unshift( _default );
            }


            return _default;
        };


        /**
         * ## setValueDefault
         *
         * sets a specified index as the default. This only works correctly if
         * it is a valid value, otherwise it returns null
         *
         * @return {Object} default settings
         */
        let setValueDefault = function( _data, _val )
        {
            let defaultProp = _val || configObj.defaultValue + '';
            let index;

            _data.forEach( function( dataObj, i )
            {
                let dataObjValue = dataObj.value + '';

                if ( dataObjValue === defaultProp )
                {
                    index = i;
                }
            } );

            let defaultValue = index >= 0 ? _data[ index ] : null;

            if ( defaultValue )
            {
                defaultValue.index = index;
                return defaultValue;
            }

            return null;
        };


        /**
         * ## sortData
         *
         * checks the data object for header options, and sorts it accordingly
         *
         * @return _Boolean_ hasHeaders
         */
        let sortData = function( data, res = [], i = 0 )
        {
            data.forEach( function( d )
            {
                if ( d.header )
                {
                    res = sortData( d.data, res, i );
                }
                else
                {
                    if ( typeof d !== 'object' )
                    {
                        d = {
                            text    : d,
                            value   : d,
                            index   : i
                        };
                    }
                    else
                    {
                        d.index = i;
                    }

                    res.push( d );
                    i++;
                }
            } );

            return res;
        };



        let defaultObj;
        let _data       = sortData( data );

        if ( rebuild )
        {
            let val = self.refs.selected.getAttribute( 'data-value' );
            let def = setValueDefault( _data, val );

            if ( !def )
            {
                if ( configObj.placeholder || _data.length === 0 )
                {
                    return setPlaceholderDefault( self, _data );
                }
                else
                {
                    if ( configObj.multiple )
                    {
                        return setPlaceholderDefault( self, _data );
                    }
                    else
                    {
                        return setIndexDefault( _data, 0 )
                    }
                }
            }

            return def;
        }
        else
        {
            if ( configObj.placeholder || _data.length === 0 )
            {
                return setPlaceholderDefault( self, _data );
            }
            else if ( configObj.defaultIndex )
            {
                return setIndexDefault( _data );
            }
            else if ( configObj.defaultValue )
            {
                return setValueDefault( _data );
            }
            else
            {
                if ( configObj.multiple )
                {
                    return setPlaceholderDefault( self, _data );
                }
                else
                {
                    return setIndexDefault( _data, 0 )
                }
            }
        }
    }
};

export default defaults;
