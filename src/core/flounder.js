
import { defaultOptions }   from './defaults';
import utils                from './utils';
import api                  from './api';
import build                from './build';
import events               from './events';
import Search               from './search';
import version              from './version';
import keycodes             from './keycodes';

/**
 * main flounder class
 *
 * @return {Object} Flounder instance
 */
class Flounder
{
    /**
     * ## addNoMoreOptionsMessage
     *
     * Adding 'No More Options' message to the option list
     *
     * @return _Void_
     */
    addNoMoreOptionsMessage()
    {
        let classes     = this.classes;
        let noMoreOptionsEl = this.refs.noMoreOptionsEl || utils.constructElement( { className : classes.NO_RESULTS } );

        noMoreOptionsEl.innerHTML = 'No more recipients to add.';
        this.refs.optionsList.appendChild( noMoreOptionsEl );

        this.refs.noMoreOptionsEl = noMoreOptionsEl;
    }


    /**
     * ## addNoResultsMessage
     *
     * Adding 'No Results' message to the option list
     *
     * @return _Void_
     */
    addNoResultsMessage()
    {
        let classes     = this.classes;
        let noResultsEl = this.refs.noResultsEl || utils.constructElement( { className : classes.NO_RESULTS } );

        noResultsEl.innerHTML = 'No matches found';
        this.refs.optionsList.appendChild( noResultsEl );

        this.refs.noResultsEl = noResultsEl;
    }


    /**
     * ## componentWillUnmount
     *
     * on unmount, removes events
     *
     * @return {Void} void
     */
    componentWillUnmount()
    {
        try
        {
            this.onComponentWillUnmount();
        }
        catch ( e )
        {
            console.warn( `something may be wrong in
                                        "onComponentWillUnmount"`, e );
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
            if ( typeof target === `string` )
            {
                target = document.querySelectorAll( target );
            }

            if ( ( target.length || target.length === 0 ) &&
                    target.tagName !== `SELECT`)
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
     * ## displaySelected
     *
     * formats and displays the chosen options
     *
     * @param {DOMElement} selected display area for the selected option(s)
     * @param {Object} refs element references
     *
     * @return _Void_
     */
    displaySelected( selected, refs )
    {
        let value = [];
        let index = -1;

        let selectedOption  = this.getSelected();
        let selectedLength  = selectedOption.length;
        let multipleTags    = this.multipleTags;

        if ( !multipleTags && selectedLength ===  1 )
        {
            index               = selectedOption[0].index;
            selected.innerHTML  = refs.data[ index ].innerHTML;
            value               = selectedOption[0].value;
        }
        else if ( !multipleTags && selectedLength === 0 )
        {
            let defaultValue    = this._default;
            index               = defaultValue.index || -1;
            selected.innerHTML  = defaultValue.text;
            value               = defaultValue.value;
        }
        else
        {
            if ( multipleTags )
            {
                selected.innerHTML  = ``;
                this.displayMultipleTags( selectedOption, refs.multiTagWrapper );
            }
            else
            {
                selected.innerHTML  = this.multipleMessage;
            }

            index = selectedOption.map( option => option.index );
            value = selectedOption.map( option => option.value );
        }

        selected.setAttribute( `data-value`, value );
        selected.setAttribute( `data-index`, index );
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
            let classes = this.classes;

            data.forEach( ( el, i ) =>
            {
                utils.addClass( el, classes.SEARCH_HIDDEN );
            } );

            matches.forEach( e =>
            {
                utils.removeClass( data[ e.i ], classes.SEARCH_HIDDEN );
            } );

            if( !this.refs.noMoreOptionsEl )
            {
                if( matches.length === 0 )
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
     * filters events to determine the correct actions, based on events from the search box
     *
     * @param {Object} e event object
     *
     * @return _Void_
     */
    fuzzySearch( e )
    {
        this.lastSearchEvent = e;
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
        let refs    = this.refs;
        let classes = this.classes;

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
        let props = this.props = this.props || {};

        if ( props.onSelect )
        {
            props.onChange = props.onSelect;

            console.warn( `Please use onChange.  onSelect has been depricated
                                            and will be removed in 2.0.0` );

            this.onSelect = function()
            {
                console.warn( `Please use onChange. onSelect has been
                                    depricated and will be removed in 2.0.0` );
                this.onChange( ...arguments );
            };
        }

        for ( let opt in defaultOptions )
        {
            if ( defaultOptions.hasOwnProperty( opt ) )
            {
                if ( opt === `classes` )
                {
                    this.classes       = {};
                    let defaultClasses = defaultOptions[ opt ];
                    let propClasses    = typeof props[ opt ] === `object` ? props[ opt ] : {};

                    for ( let clss in defaultClasses )
                    {
                        this.classes[ clss ] = propClasses[ clss ] ? propClasses[ clss ] : defaultClasses[ clss ];
                    }
                }
                else
                {
                    this[ opt ] = props[ opt ] !== undefined ? props[ opt ] :
                                                     defaultOptions[ opt ];
                }
            }
        }

        this.selectedClass = this.classes.SELECTED;

        if ( props.defaultEmpty )
        {
            this.placeholder = ``;
        }

        if ( this.multipleTags )
        {
            this.search         = true;
            this.multiple       = true;
            this.selectedClass  += `  ${this.classes.SELECTED_HIDDEN}`;

            if ( !this.placeholder )
            {
                this.placeholder = defaultOptions.placeholder;
            }
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
        let props   = this.props;
        let refs    = this.refs;
        let data    = refs.data;

        if ( !!this.isIos && !this.multiple )
        {
            let sel     = refs.select;
            let classes = this.classes;
            utils.removeClass( sel, classes.HIDDEN );
            utils.addClass( sel, classes.HIDDEN_IOS );
        }

        this.addListeners( refs, props );
    }


    /**
     * ## removeMultiTag
     *
     * removes a multi selection tag on click; fixes all references to value and state
     *
     * @param  {Object} e event object
     *
     * @return _Void_
     */
    removeMultiTag( e )
    {
        e.preventDefault();
        e.stopPropagation();

        let value;
        let index;
        let classes         = this.classes;
        let refs            = this.refs;
        let select          = refs.select;
        let selected        = refs.selected;
        let target          = e.target;
        let defaultValue    = this._default;
        let data            = this.refs.data;
        let targetIndex     = target.getAttribute( `data-index` );
        select[ targetIndex ].selected = false;

        let selectedOptions = this.getSelected();

        utils.removeClass( data[ targetIndex ], classes.SELECTED_HIDDEN );
        utils.removeClass( data[ targetIndex ], classes.SELECTED );

        target.removeEventListener( `click`, this.removeMultiTag );

        let span = target.parentNode;
        span.parentNode.removeChild( span );

        if ( selectedOptions.length === 0 )
        {
            this.addPlaceholder();
            index               = -1;
            value               = ``;
        }
        else
        {
            value = selectedOptions.map( function( option )
            {
                return option.value;
            } );

            index = selectedOptions.map( function( option )
            {
                return option.index;
            } );
        }

        this.removeNoMoreOptionsMessage();
        this.removeNoResultsMessage();

        if ( this.lastSearchEvent  )
        {
            this.fuzzySearch( this.lastSearchEvent );
        }

        selected.setAttribute( `data-value`, value );
        selected.setAttribute( `data-index`, index );

        try
        {
            this.onSelect( e, this.getSelectedValues() );
        }
        catch( e )
        {
            console.warn( `something may be wrong in "onSelect"`, e );
        }
    }


    /**
     * ## removeNoResultsMessage
     *
     * Removing 'No Results' message from the option list
     *
     * @return _Void_
     */
    removeNoResultsMessage()
    {
        let noResultsEl =  this.refs.noResultsEl;

        if( this.refs.optionsList && noResultsEl )
        {
            this.refs.optionsList.removeChild( noResultsEl );
            this.refs.noResultsEl = undefined;
        }
    }

    /**
     * ## removeNoMoreOptionsMessage
     *
     * Removing 'No More options' message from the option list
     *
     * @return _Void_
     */
    removeNoMoreOptionsMessage()
    {
        let noMoreOptionsEl =  this.refs.noMoreOptionsEl;

        if( this.refs.optionsList && noMoreOptionsEl )
        {
            this.refs.optionsList.removeChild( noMoreOptionsEl );
            this.refs.noMoreOptionsEl = undefined;
        }
    }


    /**
     * ## removeSelectedClass
     *
     * removes the [[this.selectedClass]] from all data
     *
     * @return _Void_
     */
    removeSelectedClass( data )
    {
        data = data || this.refs.data;

        data.forEach( ( dataObj, i ) =>
        {
            utils.removeClass( dataObj, this.selectedClass );
        } );
    }


    /**
     * ## removeSelectedValue
     *
     * sets the selected property to false for all data
     *
     * @return _Void_
     */
    removeSelectedValue( data )
    {
        data = data || this.refs.data;

        data.forEach( ( d, i ) =>
        {
            this.refs.select[ i ].selected = false;
        } );
    }


    /**
     * ## sortData
     *
     * checks the data object for header options, and sorts it accordingly
     *
     * @return {Boolean} hasHeaders
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

    return Array.prototype.slice.call( targets, 0 )
                                .map( el => new Flounder( el, props ) );
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

