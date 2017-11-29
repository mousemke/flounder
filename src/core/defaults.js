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
    noMoreOptionsMessage    : 'No more options to add.',
    noMoreResultsMessage    : 'No matches found',
    onChange                : null, // function( e, selectedValues ){}
    onClose                 : null, // function( e, selectedValues ){}
    onComponentDidMount     : null, // function(){}
    onComponentWillUnmount  : null, // function(){}
    onFirstTouch            : null, // function( e ){}
    onInit                  : null, // function(){}
    onInputChange           : null, // function( e ){}
    onOpen                  : null, // function( e, selectedValues ){}
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
     * @param {Object} context flounder this
     * @param {Object} configObj props
     * @param {Array} originalData data array
     * @param {Boolean} rebuild rebuild or not
     *
     * @return {Void} void
     */
    setDefaultOption( context, configObj = {}, originalData, rebuild = false )
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
         * @param {Object} flounder flounder
         *
         * @return {Object} default settings
         */
        function setPlaceholderDefault( flounder )
        {
            const refs        = flounder.refs;
            const classes     = flounder.classes;
            const select      = refs.select;
            const placeholder = configObj.placeholder;

            if ( !rebuild || configObj.data )
            {
                const defaultObj    = {
                    text       : placeholder || placeholder === '' ?
                                       placeholder : defaultOptions.placeholder,
                    value      : '',
                    index      : 0,
                    extraClass : `${classes.HIDDEN}  ${classes.PLACEHOLDER}`
                };

                if ( select )
                {
                    const escapedText   = flounder.allowHTML ? defaultObj.text :
                                            utils.escapeHTML( defaultObj.text );

                    const defaultOption = utils.constructElement( {
                        tagname     : 'option',
                        className   : classes.OPTION_TAG,
                        value       :  defaultObj.value
                    } );

                    defaultOption.innerHTML = escapedText;

                    select.insertBefore( defaultOption, select[ 0 ] );
                    flounder.refs.selectOptions.unshift( defaultOption );
                }

                originalData.unshift( defaultObj );

                return defaultObj;
            }

            return flounder.data[ 0 ];
        }


        /**
         * ## setValueDefault
         *
         * sets a specified index as the default. This only works correctly if
         * it is a valid value, otherwise it returns null
         *
         * @param {Array} data array of data objects
         * @param {String} val value to set
         *
         * @return {Object} default settings
         */
        function setValueDefault( data, val )
        {
            const defaultProp = val || `${configObj.defaultValue}`;
            let index;

            data.forEach( ( dataObj, i ) =>
            {
                const dataObjValue = `${dataObj.value}`;

                if ( dataObjValue === defaultProp )
                {
                    index = i;
                }
            } );

            const defaultValue = index >= 0 ? data[ index ] : null;

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
            const data = context.sortData( originalData );

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
                return setPlaceholderDefault( context, data );
            }

            let def;

            if ( rebuild )
            {
                const val = context.refs.selected.getAttribute( 'data-value' );
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

        originalData    = originalData || configObj.data || [];

        return checkDefaultPriority();
    }
};

export const setDefaultOption = defaults.setDefaultOption;

export default defaults;
