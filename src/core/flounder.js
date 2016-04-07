
/* jshint globalstrict: true */
'use strict';

import { defaultOptions }   from './defaults';
import utils                from './utils';
import api                  from './api';
import build                from './build';
import events               from './events';
import classes              from './classes';
import Search               from './search';
import version              from './version';

const nativeSlice = Array.prototype.slice;

class Flounder
{
    /**
     * ## arrayOfFlounders
     *
     * called when a jquery object, microbe, or array is fed into flounder
     * as a target
     *
     * @param {DOMElement} target flounder mount point
     * @param {Object} props passed options
     *
     * @return {Array} array of flounders
     */
    arrayOfFlounders( targets, props )
    {
        targets = nativeSlice.call( targets );
        return targets.map( ( el, i ) => new this.constructor( el, props ) );
    }


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
            console.log( 'something may be wrong in "onComponentWillUnmount"', e );
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
     * main constuctor
     *
     * @param {DOMElement} target flounder mount point
     * @param {Object} props passed options
     *
     * @return _Object_ new flounder object
     */
    constructor( target, props )
    {
        if ( !target && !props )
        {
            return this.constructor;
        }
        else if ( target )
        {
            if ( typeof target === 'string' )
            {
                target = document.querySelectorAll( target );
            }
            if ( target.length && target.tagName !== 'SELECT' )
            {
                return this.arrayOfFlounders( target, props );
            }
            else if ( ( !target.length && target.length !== 0 ) || target.tagName === 'SELECT' )
            {
                if ( target.flounder )
                {
                    target.flounder.destroy();
                }

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
                    console.log( 'something may be wrong in "onInit"', e );
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
                    console.log( 'something may be wrong in "onComponentDidMount"', e );
                }

                this.ready = true;

                return this.refs.flounder.flounder = this.originalTarget.flounder = this.target.flounder = this;
            }
        }
    }


    /**
     * ## displayMultipleTags
     *
     * handles the display and management of tags
     *
     * @param  {Array} selectedOptions currently selected options
     * @param  {DOMElement} selected div to display currently selected options
     *
     * @return _Void_
     */
    displayMultipleTags( selectedOptions, multiTagWrapper )
    {
        let span, a;

        let removeMultiTag = this.removeMultiTag

        nativeSlice.call( multiTagWrapper.children ).forEach( function( el )
        {
            el.firstChild.removeEventListener( 'click', removeMultiTag );
        } );

        multiTagWrapper.innerHTML = '';

        selectedOptions.forEach( function( option )
        {
            if ( option.value !== '' )
            {
                let span        = document.createElement( 'span' )
                span.className  = classes.MULTIPLE_SELECT_TAG;

                let a           = document.createElement( 'a' )
                a.className     = classes.MULTIPLE_TAG_CLOSE;
                a.setAttribute( 'data-index', option.index );

                span.appendChild( a );

                span.innerHTML += option.innerHTML;

                multiTagWrapper.appendChild( span );
            }
            else
            {
                option.selected = false;
            }
        } );

        this.setTextMultiTagIndent();

        nativeSlice.call( multiTagWrapper.children ).forEach( function( el )
        {
            el.firstChild.addEventListener( 'click', removeMultiTag );
        } );
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

        if ( !this.multiple || ( !this.multipleTags && selectedLength ===  1 ) )
        {
            index               = selectedOption[0].index;
            selected.innerHTML  = this.refs.data[ index ].innerHTML;
            value               = selectedOption[0].value;
        }
        else if ( selectedLength === 0 )
        {
            let defaultValue = this._default;

            index               = defaultValue.index || -1;
            selected.innerHTML  = defaultValue.text;
            value               = defaultValue.value;
        }
        else
        {
            if ( this.multipleTags )
            {
                selected.innerHTML  = '';
                this.displayMultipleTags( selectedOption, this.refs.multiTagWrapper );
            }
            else
            {
                selected.innerHTML  = this.multipleMessage;
            }

            index = selectedOption.map( option => option.index );
            value = selectedOption.map( option => option.value );
        }

        selected.setAttribute( 'data-value', value );
        selected.setAttribute( 'data-index', index );
    }


    /**
     * ## fuzzySearch
     *
     * searches for things
     *
     * @param {Object} e event object
     *
     * @return _Void_
     */
    fuzzySearch( e )
    {
        if ( !this.toggleList.justOpened )
        {
            e.preventDefault();
            let keyCode = e.keyCode;

            if ( keyCode !== 38 && keyCode !== 40 &&
                    keyCode !== 13 && keyCode !== 27 )
            {
                let val = e.target.value.trim();

                let matches = this.search.isThereAnythingRelatedTo( val );

                if ( matches )
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
            else
            {
                this.setSelectValue( e );
                this.setKeypress( e );
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

        refs.search.value = '';
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
            if ( defaultOptions.hasOwnProperty( opt ) && opt !== 'classes' )
            {
                this[ opt ] = props[ opt ] !== undefined ? props[ opt ] : defaultOptions[ opt ];
            }
            else if ( opt === 'classes' )
            {
                let classes         = defaultOptions[ opt ];
                let propsClasses    = props.classes;

                for ( let clss in classes )
                {
                    this[ clss + 'Class' ] = propsClasses && propsClasses[ clss ] !== undefined ?
                                                propsClasses[ clss ] :
                                                classes[ clss ];
                }
            }
        }

        if ( props.defaultEmpty )
        {
            this.placeholder = '';
        }

        if ( this.multipleTags )
        {
            this.search         = true;
            this.multiple       = true;
            this.selectedClass  += '  ' + classes.SELECTED_HIDDEN;

            if ( !props.placeholder )
            {
                props.placeholder = defaultOptions.placeholder;
            }
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

        if ( !!this.isIos && ( !this.multipleTags || !this.multiple )  )
        {
            let sel     = refs.select;
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
        let refs            = this.refs;
        let select          = refs.select;
        let selected        = refs.selected;
        let target          = e.target;
        let defaultValue    = this._default;
        let data            = this.refs.data;
        let targetIndex     = target.getAttribute( 'data-index' );
        select[ targetIndex ].selected = false;

        let selectedOptions = this.getSelected();

        utils.removeClass( data[ targetIndex ], classes.SELECTED_HIDDEN );
        utils.removeClass( data[ targetIndex ], classes.SELECTED );

        target.removeEventListener( 'click', this.removeMultiTag );

        let span = target.parentNode;
        span.parentNode.removeChild( span );

        if ( selectedOptions.length === 0 )
        {
            index               = defaultValue.index || -1;
            selected.innerHTML  = defaultValue.text;
            value               = defaultValue.value;
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

        this.setTextMultiTagIndent();

        selected.setAttribute( 'data-value', value );
        selected.setAttribute( 'data-index', index );

        try
        {
            this.onSelect( e, this.getSelectedValues() );
        }
        catch( e )
        {
            console.log( 'something may be wrong in "onSelect"', e );
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
     * ## setTextMultiTagIndent
     *
     * sets the text-indent on the search field to go around selected tags
     *
     * @return _Void_
     */
    setTextMultiTagIndent()
    {
        let search = this.refs.search;
        let offset = 0;

        if ( search )
        {
            let els = document.getElementsByClassName( classes.MULTIPLE_SELECT_TAG );

            nativeSlice.call( els ).forEach( ( e, i ) =>
            {
                offset += utils.getElWidth( e, this.setTextMultiTagIndent, this );
            } );

            search.style.textIndent = offset + 'px';
        }
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
}


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

