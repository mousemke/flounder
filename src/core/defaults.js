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
    multipleMessage         : '(Multiple Items Selected)',
    onChange                : function( e, selectedValues ){},  // eslint-disable-line
    onClose                 : function( e, selectedValues ){},  // eslint-disable-line
    onComponentDidMount     : function(){},                     // eslint-disable-line
    onComponentWillUnmount  : function(){},                     // eslint-disable-line
    onFirstTouch            : function( e ){},                  // eslint-disable-line
    onInit                  : function(){},                     // eslint-disable-line
    onInputChange           : function( e ){},                  // eslint-disable-line
    onOpen                  : function( e, selectedValues ){},  // eslint-disable-line
    openOnHover             : false,
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
     * @param {String} defaultProp default passed from this.props
     * @param {Object} data this.props.data
     *
     * @return {Void} void
     */
    setDefaultOption( self, configObj = {}, data, rebuild = false )
    {
        /**
         * ## setIndexDefault
         *
         * sets a specified index as the default option. This only works
         * correctly if it is a valid index, otherwise it returns null
         *
         * @param {Array} data option data
         * @param {Number} index index
         *
         * @return {Object} default settings
         */
        function setIndexDefault( data, index )
        {
            const defaultIndex        = index || index === 0 ? index :
                                                        configObj.defaultIndex;
            const defaultOption       = data[ defaultIndex ];

            if ( defaultOption )
            {
                defaultOption.index   = defaultIndex;

                return defaultOption;
            }

            return null;
        }


        /**
         * ## setPlaceholderDefault
         *
         * sets a placeholder as the default option.  This inserts an empty
         * option first and sets that as default
         *
         * @return {Object} default settings
         */
        function setPlaceholderDefault( self )
        {
            const refs        = self.refs;
            const classes     = self.classes;
            const select      = refs.select;
            const placeholder = configObj.placeholder;

            const defaultObj    = {
                text        : placeholder || placeholder === '' ? placeholder :
                                                    defaultOptions.placeholder,
                value       : '',
                index       : 0,
                extraClass  : `${classes.HIDDEN}  ${classes.PLACEHOLDER}`
            };

            if ( select )
            {
                const escapedText     = self.allowHTML ? defaultObj.text :
                                            utils.escapeHTML( defaultObj.text );

                const defaultOption   = utils.constructElement( {
                    tagname     : 'option',
                    className   : classes.OPTION_TAG,
                    value       :  defaultObj.value
                } );

                defaultOption.innerHTML = escapedText;

                select.insertBefore( defaultOption, select[ 0 ] );
                self.refs.selectOptions.unshift( defaultOption );
            }

            data.unshift( defaultObj );

            return defaultObj;
        }


        /**
         * ## setValueDefault
         *
         * sets a specified index as the default. This only works correctly if
         * it is a valid value, otherwise it returns null
         *
         * @return {Object} default settings
         */
        function setValueDefault( _data, _val )
        {
            const defaultProp = _val || `${configObj.defaultValue}`;
            let index;

            _data.forEach( ( dataObj, i ) =>
            {
                const dataObjValue = `${dataObj.value}`;

                if ( dataObjValue === defaultProp )
                {
                    index = i;
                }
            } );

            const defaultValue = index >= 0 ? _data[ index ] : null;

            if ( defaultValue )
            {
                defaultValue.index = index;

                return defaultValue;
            }

            return null;
        }


        /**
         * ## checkDefaultPriority
         *
         * sorts out which default should be gotten by priority
         *
         * @return {Object} default data object
         */
        function checkDefaultPriority()
        {
            const data = self.sortData( data );

            if ( ( configObj.multipleTags || configObj.multiple )
                    && !configObj.defaultIndex
                    && !configObj.defaultValue )
            {
                configObj.placeholder = configObj.placeholder ||
                                                defaultOptions.placeholder;
            }

            if ( configObj.defaultEmpty )
            {
                configObj.placeholder = '';
            }

            const placeholder = configObj.placeholder;

            if ( placeholder || placeholder === '' || data.length === 0 )
            {
                return setPlaceholderDefault( self, data );
            }

            let def;

            if ( rebuild )
            {
                const val = self.refs.selected.getAttribute( 'data-value' );
                def     = setValueDefault( data, val );

                if ( def )
                {
                    return def;
                }
            }

            // default prio
            def = configObj.defaultIndex ? setIndexDefault( data ) : null;
            def = !def && configObj.defaultValue ? setValueDefault( data ) :
                                                                            def;
            def = !def ? setIndexDefault( data, 0 ) : def;

            return def;
        }

        data    = data || configObj.data || [];

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
    }
};

export const setDefaultOption = defaults.setDefaultOption;

export default defaults;
