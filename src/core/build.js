
import classes                  from './classes';
import { setDefaultOption }     from './defaults';
import utils                    from './utils';

const nativeSlice = Array.prototype.slice;

const build = {

    /**
     * ## addOptionDescription
     *
     * adds a description to the option
     *
     * @param {DOMElement} el option leement to add description to
     * @param {String} text description
     *
     * @return _Void_
     */
    addOptionDescription : function( el, text )
    {
        let div         = document.createElement( 'div' );
        div.innerHTML   = text;
        div.className   = classes.DESCRIPTION;
        el.appendChild( div );
    },


    /**
     * ## addSearch
     *
     * checks if a search box is required and attaches it or not
     *
     * @param {Object} flounder main element reference
     *
     * @return _Mixed_ search node or false
     */
    addSearch : function( flounder )
    {
        if ( this.search )
        {
            let search = utils.constructElement( {
                                    tagname     : 'input',
                                    type        : 'text',
                                    className   : classes.SEARCH
                                } );
            flounder.appendChild( search );

            return search;
        }

        return false;
    },


    /**
     * ## bindThis
     *
     * binds this to whatever functions need it.  Arrow functions cannot be used
     * here due to the react extension needing them as well;
     *
     * @return _Void_
     */
    bindThis : function()
    {
            [ 'catchBodyClick',
            'checkClickTarget',
            'checkFlounderKeypress',
            'clearPlaceholder',
            'clickSet',
            'divertTarget',
            'displayMultipleTags',
            'firstTouchController',
            'fuzzySearch',
            'removeMultiTag',
            'setKeypress',
            'setSelectValue',
            'toggleList' ].forEach( func =>
            {
                this[ func ] = this[ func ].bind( this );
                this[ func ].___isBound = true;
            } );
    },


    /**
     * ## buildDom
     *
     * builds flounder
     *
     * @return _Void_
     */
    buildDom : function()
    {
        this.refs               = {};

        let constructElement    = utils.constructElement;

        let wrapperClass        = classes.MAIN_WRAPPER;
        let wrapper             = utils.constructElement( { className : this.wrapperClass ?
                                    wrapperClass + ' ' + this.wrapperClass : wrapperClass } );
        let flounderClass       = classes.MAIN;
        let flounder            = constructElement( { className : this.flounderClass ?
                                    flounderClass + '  ' + this.flounderClass : flounderClass } );

        flounder.setAttribute( 'aria-hidden', true );
        flounder.tabIndex       = 0;
        wrapper.appendChild( flounder );

        let select              = this.initSelectBox( wrapper );
        select.tabIndex         = -1;

        if ( this.multiple === true )
        {
            select.setAttribute( 'multiple', '' );
        }

        let data                = this.data;
        let defaultValue        = this._default = setDefaultOption( this, this.props, data );
        let selected            = constructElement( { className : classes.SELECTED_DISPLAYED,
                                        'data-value' : defaultValue.value, 'data-index' : defaultValue.index || -1 } );
            selected.innerHTML  = defaultValue.text;

        let multiTagWrapper     = this.multiple ? constructElement( { className : classes.MULTI_TAG_LIST } ) : null;

        let arrow               = constructElement( { className : classes.ARROW } );
        let optionsListWrapper  = constructElement( { className : classes.OPTIONS_WRAPPER + '  ' + classes.HIDDEN } );
        let optionsList         = constructElement( { className : classes.LIST } );
        optionsList.setAttribute( 'role', 'listbox' );
        optionsListWrapper.appendChild( optionsList );

        [ selected, multiTagWrapper, arrow, optionsListWrapper ].forEach( el =>
        {
            if ( el )
            {
                flounder.appendChild( el );
            }
        } );

        let search = this.addSearch( flounder );
        let selectOptions;

        [ data, selectOptions ] = this.buildData( defaultValue, data, optionsList, select );

        this.target.appendChild( wrapper );

        this.refs = { wrapper, flounder, selected, arrow, optionsListWrapper,
                    search, multiTagWrapper, optionsList, select, data, selectOptions };
    },


    /**
     * ## buildData
     *
     * builds both the div and select based options. will skip the select box
     * if it already exists
     *
     * @param {Mixed} defaultValue default entry (string or number)
     * @param {Array} data array with optino information
     * @param {Object} optionsList reference to the div option wrapper
     * @param {Object} select reference to the select box
     *
     * @return _Array_ refs to both container elements
     */
    buildData : function( defaultValue, originalData, optionsList, select )
    {
        originalData                = originalData || [];
        let index                   = 0;
        let data                    = [];
        let selectOptions           = [];
        let constructElement        = utils.constructElement;
        let addOptionDescription    = this.addOptionDescription;
        let selectedClass           = this.selectedClass;
        let escapeHTML              = utils.escapeHTML;
        let addClass                = utils.addClass;
        let selectRef               = this.refs.select;
        let allowHTML               = this.allowHTML;


        /**
         * ## buildDiv
         *
         * builds an individual div tag for a flounder dropdown
         *
         * @param {Object} dataObj [description]
         * @param {Number} i index
         *
         * @return {DOMElement}
         */
        let buildDiv = function( dataObj, i )
        {
            if ( typeof dataObj !== 'object' )
            {
                dataObj = {
                    text    : dataObj,
                    value   : dataObj
                };
            }
            dataObj.index   = i;

            let extraClass  = i === defaultValue.index ? '  ' + selectedClass : '';

            let res = {
                className       : classes.OPTION + extraClass,
                'data-index'    : i
            };

            for ( let o in dataObj )
            {
                if ( o !== 'text' && o !== 'description' )
                {
                    res[ o ] = dataObj[ o ];
                }
            }

            let data        = constructElement( res );
            data.innerHTML  = allowHTML ? dataObj.text : escapeHTML( dataObj.text );

            if ( dataObj.description )
            {
                addOptionDescription( data, dataObj.description );
            }

            data.className += dataObj.extraClass ? '  ' + dataObj.extraClass : '';
            data.setAttribute( 'role', 'option' );

            return data;
        };


        /**
         * ## buildOption
         *
         * builds an individual option tag for a flounder dropdown
         *
         * @param {Object} dataObj option build properties
         * @param {Number} i index
         *
         * @return {DOMElement}
         */
        let buildOption = function( dataObj, i )
        {
            let selectOption;

            if ( !selectRef )
            {
                selectOption            = constructElement( { tagname : 'option',
                                            className   : classes.OPTION_TAG,
                                            value       : dataObj.value } );
                let escapedText         = escapeHTML( dataObj.text );
                selectOption.innerHTML  = escapedText;

                let disabled = dataObj.disabled;
                if ( disabled )
                {
                    selectOption.setAttribute( 'disabled', disabled );
                }

                select.appendChild( selectOption );
            }
            else
            {
                let selectChild     = selectRef.children[ i ];
                selectOption        = selectChild;
                selectChild.setAttribute( 'value', selectChild.value );
                addClass( selectChild, 'flounder--option--tag' );
            }

            if ( i === defaultValue.index )
            {
                selectOption.selected = true;
            }

            if ( selectOption.getAttribute( 'disabled' ) )
            {
                addClass( data[ i ], classes.DISABLED );
            }

            return selectOption;
        };



        originalData.forEach( ( dataObj, i ) =>
        {
            let dataObjType = typeof dataObj;

            if ( dataObjType !== 'object' )
            {
                dataObj = originalData[ i ] = {
                    text    : dataObj,
                    value   : dataObj
                };
            }

            if ( dataObj.header )
            {
                let section = constructElement( { tagname   : 'div',
                                                className   : classes.SECTION } );
                let header = constructElement( { tagname    : 'div',
                                                className   : classes.HEADER } );
                header.textContent = dataObj.header;
                section.appendChild( header );
                optionsList.appendChild( section );

                dataObj.data.forEach( ( d ) =>
                {
                    data[ index ]           = buildDiv( d, index );
                    section.appendChild( data[ index ] );
                    selectOptions[ index ]  = buildOption( d, index );
                    index++;
                } );
            }
            else
            {
                data[ index ]           = buildDiv( dataObj, index );
                optionsList.appendChild( data[ index ] );
                selectOptions[ index ]  = buildOption( dataObj, index );
                index++;
            }
        } );

        return  [ data, selectOptions ];
    },


    /**
     * ## initSelectBox
     *
     * builds the initial select box.  if the given wrapper element is a select
     * box, this instead scrapes that, thus allowing php fed elements
     *
     * @param {DOMElement} wrapper main wrapper element
     *
     * @return _DOMElement_ select box
     */
    initSelectBox : function( wrapper )
    {
        let target  = this.target;
        let refs    = this.refs;
        let select  = refs.select;

        if ( target.tagName === 'SELECT' )
        {
            utils.addClass( target, classes.SELECT_TAG );
            utils.addClass( target, classes.HIDDEN );

            select = target;

            if ( !this.props.keepChangesOnDestroy )
            {
                this.popOutSelectElements( select );
            }

            if ( target.length > 0 && !this.selectDataOverride )
            {
                this.refs.select    = select;
                let data            = [],
                    selectOptions   = [];

                nativeSlice.apply( target.children ).forEach( function( optionEl )
                {
                    selectOptions.push( optionEl );
                    data.push( {
                        text    : optionEl.innerHTML,
                        value   : optionEl.value
                    } );
                } );

                refs.selectOptions = selectOptions;

                this.data               = data;
            }
            else if ( this.selectDataOverride )
            {
                utils.removeAllChildren( target );
            }

            this.target             = target.parentNode;
            utils.addClass( select || target, classes.HIDDEN );
        }
        else
        {
            select = utils.constructElement( { tagname : 'SELECT', className : classes.SELECT_TAG + '  ' + classes.HIDDEN } );
            wrapper.appendChild( select );
        }

        return select;
    },


    /**
     * popInSelectElements
     *
     * pops the previously saves elements back into a select tag, restoring the
     * original state
     *
     * @param {DOMElement} select select element
     *
     * @return _Void_
     */
    popInSelectElements : function( select )
    {
        utils.removeAllChildren( select );

        this.originalChildren.forEach( function( _el, i )
        {
            select.appendChild( _el );
        } );
    },


    /**
     * popOutSelectElements
     *
     * pops out all the options of a select box, clones them, then appends the
     * clones.  This gives us the ability to restore the original tag
     *
     * @param {DOMElement} select select element
     *
     * @return _Void_
     */
    popOutSelectElements : function( select )
    {
        let res = [];
        let children = this.originalChildren = nativeSlice.call( select.children );

        children.forEach( function( _el, i )
        {
            res[ i ] = _el.cloneNode( true );
            select.removeChild( _el );
        } );

        res.forEach( function( _el )
        {
            select.appendChild( _el );
        } );
    },


    /**
     * ## reconfigure
     *
     * after editing the data, this can be used to rebuild them
     *
     * @param {Object} props object containing config options
     *
     * @return _Object_ rebuilt flounder object
     */
    reconfigure : function( data, props )
    {
        if ( typeof data !== 'string' && typeof data.length === 'number' )
        {
            props       = props       = props || this.props;
            props.data  = data;
        }
        else if ( !props && typeof data === 'object' )
        {
            props       = data;
            props.data  = props.data || this.data;
        }
        else
        {
            props.data  = data || props.data || this.data;
        }

        return this.constructor( this.originalTarget, props );
    },


    /**
     * ## Set Target
     *
     * sets the target related
     *
     * @param {DOMElement} target  the actual to-be-flounderized element
     *
     * @return _Void_
     */
    setTarget : function( target )
    {
        target      = target.nodeType === 1 ? target : document.querySelector( target );

        this.originalTarget = target;
        target.flounder     = this;

        if ( target.tagName === 'INPUT' )
        {
            utils.addClass( target, classes.HIDDEN );
            target.setAttribute( 'aria-hidden', true );
            target.tabIndex = -1;
            target          = target.parentNode;
        }

        this.target = target;
    }
};

export default build;
