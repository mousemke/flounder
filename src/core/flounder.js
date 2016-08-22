
import { defaultOptions }   from './defaults';
import utils                from './utils';
import api                  from './api';
import build                from './build';
import events               from './events';
import classes              from './classes';
import Search               from './search';
import version              from './version';
import keycodes             from './keycodes';


class Flounder
{
    /**
     * ## componentWillUnmount
     *
     * on unmount, removes events
     *
     * @return _Void_
     */
    componentWillUnmount()
    {
        try
        {
            this.onComponentWillUnmount();
        }
        catch( e )
        {
            console.warn( `something may be wrong in "onComponentWillUnmount"`, e );
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
     * @param {DOMElement, String, Array} target flounder mount point
     * @param {Object} props passed options
     *
     * @return _Object_ new flounder object
     */
    constructor( target, props )
    {
        if ( !target )
        {
            console.warn( 'Flounder - No target element found.' );
        }
        else
        {
            if ( typeof target === `string` )
            {
                target = document.querySelectorAll( target );
            }

            if ( ( target.length || target.length === 0 ) && target.tagName !== `SELECT`)
            {
                if ( target.length > 1 )
                {
                    console.warn( 'Flounder - More than one element found. Dropping all but the first.' );
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
     * @return _Void_
     */
    filterSearchResults( e )
    {
        let val = e.target.value.trim();

        this.fuzzySearch.__previousValue = val;

        let matches = this.search.isThereAnythingRelatedTo( val ) || [];

        if ( val !== '' )
        {
            let data    = this.refs.data;

            data.forEach( ( el, i ) =>
            {
                utils.addClass( el, classes.SEARCH_HIDDEN );
            } );

            matches.forEach( e =>
            {
                utils.removeClass( data[ e.i ], classes.SEARCH_HIDDEN );
            } );
        }
        else
        {
            this.fuzzySearchReset();
        }
    }


    /**
     * ## fuzzySearch
     *
     * filters events to determine the correct actions, based on events from the search box
     *
     * @param {Object} e event object
     *
     * @return _Void_
     */
    fuzzySearch( e )
    {
        this.fuzzySearch.__previousValue = this.fuzzySearch.__previousValue || '';

        try
        {
            this.onInputChange( e );
        }
        catch( e )
        {
            console.warn( `something may be wrong in "onInputChange"`, e );
        }

        if ( !this.toggleList.justOpened )
        {
            e.preventDefault();

            let keyCode = e.keyCode;

            if ( keyCode !== keycodes.UP && keyCode !== keycodes.DOWN &&
                    keyCode !== keycodes.ENTER && keyCode !== keycodes.ESCAPE )
            {
                if ( this.multipleTags && keyCode === keycodes.BACKSPACE &&
                        this.fuzzySearch.__previousValue === '' )
                {
                    let lastTag = this.refs.multiTagWrapper.lastChild;

                    if ( lastTag )
                    {
                        lastTag.focus();
                    }
                }
                else
                {
                    this.filterSearchResults( e );
                }
            }
            else if ( keyCode === keycodes.ESCAPE || keyCode === keycodes.ENTER )
            {
                this.fuzzySearchReset();
                this.toggleList( e, `close` );
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
     * @return _Void_
     */
    fuzzySearchReset()
    {
        let refs = this.refs;

        refs.data.forEach( dataObj =>
        {
            utils.removeClass( dataObj, classes.SEARCH_HIDDEN );
        } );

        refs.search.value = ``;
    }


    /**
     * ## init
     *
     * post setup, this sets initial values and starts the build process
     *
     * @param {DOMElement} target flounder mount point
     * @param {Object} props passed options
     *
     * @return _Object_ new flounder object
     */
    init( target, props )
    {
        this.props = props;
        this.setTarget( target );
        this.bindThis();
        this.initializeOptions();

        if ( this.search )
        {
            this.search = new Search( this );
        }

        try
        {
            this.onInit();
        }
        catch( e )
        {
            console.warn( `something may be wrong in "onInit"`, e );
        }

        this.buildDom();
        let { isOsx, isIos, multiSelect } = utils.setPlatform();
        this.isOsx          = isOsx;
        this.isIos          = isIos;
        this.multiSelect    = multiSelect;
        this.onRender();

        try
        {
            this.onComponentDidMount();
        }
        catch( e )
        {
            console.warn( `something may be wrong in "onComponentDidMount"`, e );
        }

        this.ready = true;

        return this.refs.flounder.flounder = this.originalTarget.flounder = this.target.flounder = this;
    }


    /**
     * ## initializeOptions
     *
     * inserts the initial options into the flounder object, setting defaults
     * when necessary
     *
     * @return _Void_
     */
    initializeOptions()
    {
        let props = this.props = this.props || {};

        for ( let opt in defaultOptions )
        {
            if ( opt !== `classes` )
            {
                this[ opt ] = props[ opt ] !== undefined ? props[ opt ] : defaultOptions[ opt ];
            }
            else
            {
                let classes         = defaultOptions[ opt ];
                let propsClasses    = props.classes;

                for ( let clss in classes )
                {
                    this[ `${clss}Class` ] = propsClasses && propsClasses[ clss ] !== undefined ?
                                                propsClasses[ clss ] :
                                                classes[ clss ];
                }
            }
        }

        if ( props.defaultEmpty )
        {
            this.placeholder = ``;
        }

        if ( this.multipleTags )
        {
            this.search         = true;
            this.multiple       = true;
            this.selectedClass  += `  ${classes.SELECTED_HIDDEN}`;

            this.placeholder    = this.placeholder === '' ? this.placeholder
                                                    : defaultOptions.placeholder;
        }
    }


    /**
     * ## onRender
     *
     * attaches necessary events to the built DOM
     *
     * @return _Void_
     */
    onRender()
    {
        let props   = this.props;
        let refs    = this.refs;
        let data    = refs.data;

        if ( !!this.isIos && !this.multiple )
        {
            let sel     = refs.select;
            utils.removeClass( sel, classes.HIDDEN );
            utils.addClass( sel, classes.HIDDEN_IOS );
        }

        this.addListeners( refs );
    }


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
}


/**
 * ## .find
 *
 * accepts array-like objects and selector strings to make multiple flounders
 *
 * @param {Array or String} flounder target(s)
 * @param {Object} props passed options
 *
 * @return {Array} array of flounders
 */
Flounder.find = function( targets, props )
{
    if ( typeof targets === `string` )
    {
        targets = document.querySelectorAll( targets );
    }
    else if ( targets.nodeType === 1 )
    {
        targets = [ targets ];
    }

    return Array.prototype.slice.call( targets, 0 ).map( el => new Flounder( el, props ) );
};


/**
 * ## version
 *
 * sets version with getters and no setters for the sake of being read-only
 */
Object.defineProperty( Flounder, `version`, {
    get : function()
    {
        return version;
    }
} );

Object.defineProperty( Flounder.prototype, `version`, {
    get : function()
    {
        return version;
    }
} );

utils.extendClass( Flounder, api, build, events );

export default Flounder;

