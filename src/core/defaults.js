import utils                from './utils';
import defaultClasses       from './classes';

export const defaultOptions = {
    allowHTML               : false,
    classes                 : defaultClasses,
    data                    : [],
    defaultEmpty            : false,
    defaultIndex            : false,
    defaultValue            : false,
    disableArrow            : false,
    keepChangesOnDestroy    : false,
    multiple                : false,
    multipleTags            : false,
    multipleMessage         : `(Multiple Items Selected)`,
    onChange                : function( e, selectedValues ){},
    onClose                 : function( e, selectedValues ){},
    onComponentDidMount     : function(){},
    onComponentWillUnmount  : function(){},
    onFirstTouch            : function( e ){},
    onInit                  : function(){},
    onInputChange           : function( e ){},
    onOpen                  : function( e, selectedValues ){},
    openOnHover             : false,
    placeholder             : `Please choose an option`,
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
     * @return {Void} void
     */
    setDefaultOption( self, configObj = {}, data, rebuild = false )
    {

        /**
         * ## setIndexDefault
         *
         * sets a specified index as the default option. This only works correctly
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
        let setPlaceholderDefault = function( self, _data )
        {
            let refs        = self.refs;
            let classes     = self.classes;
            let select      = refs.select;
            let placeholder = configObj.placeholder;

            let _default    = {
                text        : placeholder || placeholder === `` ? placeholder : defaultOptions.placeholder,
                value       : ``,
                index       : 0,
                extraClass  : `${classes.HIDDEN}  ${classes.PLACEHOLDER}`
            };

            if ( select )
            {
                let escapedText     = self.allowHTML ? _default.text : utils.escapeHTML( _default.text );

                let defaultOption   = utils.constructElement( { tagname : `option`,
                                            className   : classes.OPTION_TAG,
                                            value       :  _default.value } );
                defaultOption.innerHTML = escapedText;

                select.insertBefore( defaultOption, select[ 0 ] );
                self.refs.selectOptions.unshift( defaultOption );
            }

            data.unshift( _default );

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
            let defaultProp = _val || `${configObj.defaultValue}`;
            let index;

            _data.forEach( function( dataObj, i )
            {
                let dataObjValue = `${dataObj.value}`;

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
         * ## checkDefaultPriority
         *
         * sorts out which default should be gotten by priority
         *
         * @return {Object} default data object
         */
        let checkDefaultPriority = function()
        {
            let _data = self.sortData( data );

            if ( ( configObj.multipleTags || configObj.multiple )
                    && !configObj.defaultIndex
                    && !configObj.defaultValue )
            {
                configObj.placeholder = configObj.placeholder || defaultOptions.placeholder;
            }

            if ( configObj.defaultEmpty )
            {
                configObj.placeholder = ``;
            }

            let placeholder = configObj.placeholder;

            if ( placeholder || placeholder === `` || _data.length === 0 )
            {
                return setPlaceholderDefault( self, _data );
            }

            let def;

            if ( rebuild )
            {
                let val = self.refs.selected.getAttribute( `data-value` );
                def     = setValueDefault( _data, val );

                if ( def )
                {
                    return def;
                }
            }

            // default prio
            def = configObj.defaultIndex ? setIndexDefault( _data ) : null;
            def = !def && configObj.defaultValue ? setValueDefault( _data ) : def;
            def = !def ? setIndexDefault( _data, 0 ) : def;

            return def;
        };

        data    = data || configObj.data || [];

        return checkDefaultPriority();
    },


    /**
     * ## sortData
     *
     * checks the data object for header options, and sorts it accordingly
     *
     * @return _Boolean_ hasHeaders
     */
    sortData( data, res = [], i = 0 )
    {
        data.forEach( d =>
        {
            if ( d.header )
            {
                res = this.sortData( d.data, res, i );
            }
            else
            {
                if ( typeof d !== `object` )
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
    }
};

export const setDefaultOption = defaults.setDefaultOption;

export default defaults;
