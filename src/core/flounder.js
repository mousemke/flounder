
/* globals console, document, setTimeout */
import { defaultOptions }   from './defaults';
import utils                from './utils';
import api                  from './api';
import build                from './build';
import events               from './events';
import Search               from './search';
import version              from './version';
import keycodes             from './keycodes';

const nativeSlice = Array.prototype.slice;

/**
 * main flounder class
 *
 * @return {Object} Flounder instance
 */
class Flounder
{
    /**
     * ## componentWillUnmount
     *
     * on unmount, removes events
     *
     * @return {Void} void
     */
    componentWillUnmount()
    {
        if ( this.onComponentWillUnmount )
        {
            try
            {
                this.onComponentWillUnmount();
            }
            catch ( e )
            {
                console.warn(
                    'something may be wrong in "onComponentWillUnmount"', e );
            }
        }

        this.removeListeners();

        if ( this.originalChildren )
        {
            this.popInSelectElements( this.refs.select );
        }
    }


    /**
     * ## constructor
     *
     * filters and sets up the main init
     *
     * @param {Mixed} target flounder mount point _DOMElement, String, Array_
     * @param {Object} props passed options
     *
     * @return {Object} new flounder object
     */
    constructor( target, props )
    {
        if ( !target )
        {
            console.warn( 'Flounder - No target element found.' );
        }
        else
        {
            if ( typeof target === 'string' )
            {
                target = document.querySelectorAll( target );
            }

            if ( ( target.length || target.length === 0 ) &&
                        target.tagName !== 'SELECT' )
            {
                if ( target.length > 1 )
                {
                    console.warn( `Flounder - More than one element found.
                                                Dropping all but the first.` );
                }
                else if ( target.length === 0 )
                {
                    throw 'Flounder - No target element found.';
                }

                target = target[ 0 ];
            }

            if ( target.flounder )
            {
                target.flounder.destroy();
            }

            return this.init( target, props );
        }
    }


    /**
     * ## filterSearchResults
     *
     * filters results and adjusts the search hidden class on the dataOptions
     *
     * @param {Object} e event object
     *
     * @return {Void} void
     */
    filterSearchResults( e )
    {
        const val = e.target.value.trim();

        this.fuzzySearch.previousValue = val;

        const matches = this.search.isThereAnythingRelatedTo( val ) || [];


        if ( val !== '' )
        {
            const data    = this.refs.data;
            const sections = this.refs.sections;
            const classes = this.classes;

            data.forEach( el =>
            {
                utils.addClass( el, classes.SEARCH_HIDDEN );
            } );

            sections.forEach( se =>
            {
                utils.addClass( se, classes.SEARCH_HIDDEN );
            } );

            matches.forEach( e =>
            {
                utils.removeClass( data[ e.i ], classes.SEARCH_HIDDEN );

                if ( typeof e.d.s == 'number' )
                {
                    utils.removeClass( sections[ e.d.s ],
                        classes.SEARCH_HIDDEN );
                }
            } );

            if ( !this.refs.noMoreOptionsEl )
            {
                if ( matches.length === 0 )
                {
                    this.addNoResultsMessage();
                }
                else
                {
                    this.removeNoResultsMessage();
                }
            }
        }
        else
        {
            this.fuzzySearchReset();
        }
    }


    /**
     * ## fuzzySearch
     *
     * filters events to determine the correct actions, based on events from
     * the search box
     *
     * @param {Object} e event object
     *
     * @return {Void} void
     */
    fuzzySearch( e )
    {
        this.fuzzySearch.previousValue = this.fuzzySearch.previousValue || '';

        if ( this.onInputChange )
        {
            try
            {
                this.onInputChange( e );
            }
            catch ( e )
            {
                console.warn( 'something may be wrong in "onInputChange"', e );
            }
        }

        if ( !this.toggleList.justOpened )
        {
            e.preventDefault();

            const keyCode = e.keyCode;

            if ( keyCode !== keycodes.UP && keyCode !== keycodes.DOWN &&
                    keyCode !== keycodes.ENTER && keyCode !== keycodes.ESCAPE )
            {
                if ( this.multipleTags && keyCode === keycodes.BACKSPACE &&
                        this.fuzzySearch.previousValue === '' )
                {
                    const lastTag = nativeSlice.call(
                        this.refs.multiTagWrapper.children, 0, -1 ).pop();

                    if ( lastTag )
                    {
                        setTimeout( () => lastTag.focus(), 0 );
                    }
                }
                else
                {
                    this.filterSearchResults( e );
                }
            }
            else if ( keyCode === keycodes.ESCAPE ||
                keyCode === keycodes.ENTER )
            {
                this.fuzzySearchReset();
                this.toggleList( e, 'close' );
                this.addPlaceholder();
            }
        }
        else
        {
            this.toggleList.justOpened = false;
        }
    }


    /**
     * ## fuzzySearchReset
     *
     * resets all options to visible
     *
     * @return {Void} void
     */
    fuzzySearchReset()
    {
        const refs    = this.refs;
        const classes = this.classes;

        refs.sections.forEach( se =>
        {
            utils.removeClass( se, classes.SEARCH_HIDDEN );
        } );

        refs.data.forEach( dataObj =>
        {
            utils.removeClass( dataObj, classes.SEARCH_HIDDEN );
        } );

        refs.search.value = '';
        this.removeNoResultsMessage();
    }


    /**
     * ## init
     *
     * post setup, this sets initial values and starts the build process
     *
     * @param {DOMElement} target flounder mount point
     * @param {Object} props passed options
     *
     * @return {Object} new flounder object
     */
    init( target, props )
    {
        this.props = props;

        this.bindThis();
        this.initializeOptions();

        this.setTarget( target );

        if ( this.search )
        {
            this.search = new Search( this );
        }

        if ( this.onInit )
        {
            try
            {
                this.onInit();
            }
            catch ( e )
            {
                console.warn( 'something may be wrong in "onInit"', e );
            }
        }

        this.buildDom();

        const { isOsx, isIos, multiSelect } = utils.setPlatform();

        this.isOsx          = isOsx;
        this.isIos          = isIos;
        this.multiSelect    = multiSelect;
        this.onRender();

        if ( this.onComponentDidMount )
        {
            try
            {
                this.onComponentDidMount();
            }
            catch ( e )
            {
                console.warn(
                  'something may be wrong in onComponentDidMount', e );
            }
        }

        this.ready = true;

        this.originalTarget.flounder = this.target.flounder = this;

        return this.refs.flounder.flounder = this;
    }


    /**
     * ## initializeOptions
     *
     * inserts the initial options into the flounder object, setting defaults
     * when necessary
     *
     * @return {Void} void
     */
    initializeOptions()
    {
        const props = this.props = this.props || {};

        for ( const opt in defaultOptions )
        {
            // depreciated @todo remove @2.0.0
            if ( opt === 'onChange' && props.onSelect )
            {
                this.onChange = props.onSelect;

                console.warn( `Please use onChange.  onSelect has been
                                    depricated and will be removed in 2.0.0` );

                this.onSelect = function()
                {
                    console.warn( `Please use onChange. onSelect has been
                                    depricated and will be removed in 2.0.0` );
                    this.onChange( ...arguments );
                };
            }
            else if ( opt === 'classes' )
            {
                this.classes            = {};
                const defaultClasses    = defaultOptions[ opt ];
                const propClasses       = typeof props[ opt ] === 'object' ?
                                                        props[ opt ] : {};

                for ( const clss in defaultClasses )
                {
                    this.classes[ clss ] = propClasses[ clss ] ?
                                                    propClasses[ clss ] :
                                                    defaultClasses[ clss ];
                }
            }
            else if ( opt === 'data' )
            {
                this.data = props.data && props.data.length ?
                                                    [ ...props.data ] :
                                                    [ ...defaultOptions.data ];
            }
            else
            {
                this[ opt ] = props[ opt ] !== undefined ? props[ opt ] :
                                                 defaultOptions[ opt ];
            }
        }

        this.selectedClass = this.classes.SELECTED;

        if ( props.defaultEmpty )
        {
            this.placeholder = '';
        }

        if ( this.multipleTags )
        {
            this.search         = true;
            this.multiple       = true;
            this.selectedClass  += `  ${this.classes.SELECTED_HIDDEN}`;
        }
    }


    /**
     * ## onRender
     *
     * attaches necessary events to the built DOM
     *
     * @return {Void} void
     */
    onRender()
    {
        const props   = this.props;
        const refs    = this.refs;

        if ( !!this.isIos && !this.multiple )
        {
            const sel     = refs.select;
            const classes = this.classes;
            utils.removeClass( sel, classes.HIDDEN );
            utils.addClass( sel, classes.HIDDEN_IOS );
        }

        this.addListeners( refs, props );
    }


    /**
     * ## sortData
     *
     * checks the data object for header options, and sorts it accordingly
     *
     * @param {Array} data flounder data options
     * @param {Array} res results
     * @param {Number} i index
     * @param {Number} s section's index (undefined = no section)
     *
     * @return {Boolean} hasHeaders
     */
    sortData( data, res = [], i = 0, s = undefined )
    {
        let indexHeader = 0;

        data.forEach( d =>
        {
            if ( d.header )
            {
                res = this.sortData( d.data, res, i, indexHeader );
                indexHeader++;
            }
            else
            {
                /* istanbul ignore next */
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

                if ( s !== undefined )
                {
                    d.s = s;
                }

                res.push( d );

                i++;
            }
        } );

        return res;
    }
}


/**
 * ## .find
 *
 * accepts array-like objects and selector strings to make multiple flounders
 *
 * @param {Mixed} targets target(s) _Array or String_
 * @param {Object} props passed options
 *
 * @return {Array} array of flounders
 */
Flounder.find = function( targets, props )
{
    if ( typeof targets === 'string' )
    {
        targets = document.querySelectorAll( targets );
    }
    else if ( targets.nodeType === 1 )
    {
        targets = [ targets ];
    }

    return Array.prototype.slice.call( targets, 0 )
                                .map( el => new Flounder( el, props ) );

};


/**
 * ## version
 *
 * sets version with getters and no setters for the sake of being read-only
 */
Object.defineProperty( Flounder, 'version', {
    get : function()
    {
        return version;
    }
} );

Object.defineProperty( Flounder.prototype, 'version', {
    get : function()
    {
        return version;
    }
} );

utils.extendClass( Flounder, api, build, events );

export default Flounder;
