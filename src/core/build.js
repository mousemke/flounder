
import classes                  from './classes';
import { setDefaultOption }     from './defaults';
import utils                    from './utils';

const build = {

    /**
     * ## addOptionDescription
     *
     * adds a description to the option
     *
     * @param {DOMElement} el option element to add description to
     * @param {String} text description
     *
     * @return _Void_
     */
    addOptionDescription( el, text )
    {
        let div         = document.createElement( `div` );
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
    addSearch( flounder )
    {
        if ( this.search )
        {
            let search = utils.constructElement( {
                                    tagname     : `input`,
                                    type        : `text`,
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
    bindThis()
    {
        [ 
            `catchBodyClick`,
            `checkClickTarget`,
            `checkFlounderKeypress`,
            `checkMultiTagKeydown`,
            `clearPlaceholder`,
            `clickSet`,
            `divertTarget`,
            `displayMultipleTags`,
            `firstTouchController`,
            `fuzzySearch`,
            `removeMultiTag`,
            `setKeypress`,
            `setSelectValue`,
            `toggleList`,
            `toggleListSearchClick`
        ].forEach( func =>
        {
            this[ func ] = this[ func ].bind( this );
            this[ func ].___isBound = true;
        } );
    },

    /**
     * ## buildArrow
     *
     * builds the arrow and the
     *
     * @param {Object} props property object
     * @param {Function} constructElement ref to this.constructElement
     *
     * @return {DOMElement} arrow
     */
    buildArrow( props, constructElement )
    {
        if (  props.disableArrow )
        {
            return false;
        }
        else
        {
            let arrow       = constructElement( { className : classes.ARROW } );
            let arrowInner  = constructElement( { className : classes.ARROW_INNER } );
            arrow.appendChild( arrowInner )

            return arrow;
        }
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
    buildData( defaultValue, originalData, optionsList, select )
    {
        let index                   = 0;
        let data                    = [];
        let selectOptions           = [];
        let constructElement        = utils.constructElement;
        let addOptionDescription    = this.addOptionDescription;
        let selectedClass           = this.selectedClass;
        let escapeHTML              = utils.escapeHTML;
        let addClass                = utils.addClass;
        let refs                    = this.refs;
        let selectRef               = refs.select;
        let allowHTML               = this.allowHTML;

        /**
         * ## buildDiv
         *
         * builds an individual div tag for a flounder dropdown
         *
         * @param {Object} dataObj [description]
         * @param {Number} i index
         *
         * @return _DOMElement_
         */
        let buildDiv = function( dataObj, i )
        {
            dataObj.index   = i;

            let extraClass  = i === defaultValue.index ? `  ${selectedClass}` : ``;

            let res = {
                className       : classes.OPTION + extraClass,
                'data-index'    : i
            };

            for ( let o in dataObj )
            {
                if ( o !== `text` && o !== `description` )
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

            data.className += dataObj.extraClass ? `  ${dataObj.extraClass}` : ``;
            data.setAttribute( `role`, `option` );

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
         * @return _DOMElement_
         */
        let buildOption = function( dataObj, i )
        {
            let selectOption;

            if ( !selectRef )
            {
                let selectOptionClass   = `${classes.OPTION_TAG}  ${dataObj.extraClass || ''}`;
                selectOption            = constructElement( { tagname : `option`,
                                            className   : selectOptionClass.trim(),
                                            value       : dataObj.value } );
                let escapedText         = escapeHTML( dataObj.text );
                selectOption.innerHTML  = escapedText;

                let disabled            = dataObj.disabled;

                if ( disabled )
                {
                    selectOption.setAttribute( `disabled`, disabled );
                }

                select.appendChild( selectOption );
            }
            else
            {
                let selectChild     = selectRef.children[ i ];
                selectOption        = selectChild;
                selectChild.setAttribute( `value`, selectChild.value );

                if ( selectChild.disabled === true && data[ i ] )
                {
                    addClass( data[ i ], classes.DISABLED );
                }

                addClass( selectChild, classes.OPTION_TAG );
            }

            if ( i === defaultValue.index )
            {
                selectOption.selected = true;
            }


            if ( selectOption.getAttribute( `disabled` ) )
            {
                addClass( data[ i ], classes.DISABLED );
            }

            return selectOption;
        };



        originalData.forEach( ( dataObj, i ) =>
        {
            /* istanbul ignore next */
            let dataObjType = typeof dataObj;

            if ( dataObjType !== `object` )
            {
                dataObj = originalData[ i ] = {
                    text    : dataObj,
                    value   : dataObj
                };
            }

            if ( dataObj.header )
            {
                let section = constructElement( { tagname   : `div`,
                                                className   : classes.SECTION } );
                let header = constructElement( { tagname    : `div`,
                                                className   : classes.HEADER } );
                header.textContent = dataObj.header;
                section.appendChild( header );
                optionsList.appendChild( section );

                let dataObjData = dataObj.data;
                dataObjData.forEach( ( d, i ) =>
                {
                    if ( typeof d !== `object` )
                    {
                        d = dataObjData[ i ] = {
                            text    : d,
                            value   : d
                        };
                    }

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
     * ## buildDom
     *
     * builds flounder
     *
     * @return _Void_
     */
    buildDom()
    {
        let props               = this.props;
        this.refs               = {};

        let constructElement    = utils.constructElement;

        let wrapperClass        = classes.MAIN_WRAPPER;
        let wrapper             = utils.constructElement( { className : this.wrapperClass ?
                                    `${wrapperClass}  ${this.wrapperClass}` : wrapperClass } );
        let flounderClass       = classes.MAIN;
        let flounder            = constructElement( { className : this.flounderClass ?
                                    `${flounderClass}  ${this.flounderClass}` : flounderClass } );

        flounder.setAttribute( `aria-hidden`, true );
        flounder.tabIndex       = 0;
        wrapper.appendChild( flounder );

        let select              = this.initSelectBox( wrapper );
        select.tabIndex         = -1;

        let data                = this.data;
        let defaultValue        = this._default = setDefaultOption( this, this.props, data );

        let selected            = constructElement( { className : classes.SELECTED_DISPLAYED,
                                        'data-value' : defaultValue.value, 'data-index' : defaultValue.index || -1 } );

        let multiTagWrapper     = this.multipleTags ? constructElement( { className : classes.MULTI_TAG_LIST } ) : null;

        let optionsListWrapper  = constructElement( { className : `${classes.OPTIONS_WRAPPER}  ${classes.HIDDEN}` } );
        let optionsList         = constructElement( { className : classes.LIST } );
        optionsList.setAttribute( `role`, `listbox` );
        optionsListWrapper.appendChild( optionsList );

        if ( this.multiple === true )
        {
            select.setAttribute( `multiple`, `` );
            optionsList.setAttribute( `aria-multiselectable`, `true` );
        }

        let arrow               = this.buildArrow( props, constructElement );

        [ selected, multiTagWrapper, optionsListWrapper, arrow ].forEach( el =>
        {
            if ( el )
            {
                flounder.appendChild( el );
            }
        } );

        let search              = this.addSearch( flounder );

        let selectOptions;

        [ data, selectOptions ] = this.buildData( defaultValue, data, optionsList, select );

        this.target.appendChild( wrapper );

        this.refs = { wrapper, flounder, selected, arrow, optionsListWrapper,
                    search, multiTagWrapper, optionsList, select, data, selectOptions };

        if ( this.multipleTags )
        {
            let selectedOptions = this.getSelected();

            if ( selectedOptions.length === 0 )
            {
                selected.innerHTML = defaultValue.text;
            }
            else
            {
                this.displayMultipleTags( selectedOptions, multiTagWrapper );
            }
        }
        else
        {
            selected.innerHTML = defaultValue.text;
        }
    },


    /**
     * ## buildMultiTag
     *
     * builds and returns a single multiTag
     *
     * @param {String} option tag to grab text to add to the tag and role
     *
     * @return _DOMElement_ option tag
     */
    buildMultiTag( option )
    {
        let optionText  = option.innerHTML;
        let span        = document.createElement( `SPAN` )
        span.className  = classes.MULTIPLE_SELECT_TAG;
        span.setAttribute( `aria-label`, `Close` );
        span.setAttribute( `tabindex`, 0 );

        let a           = document.createElement( `A` )
        a.className     = classes.MULTIPLE_TAG_CLOSE;
        a.setAttribute( `data-index`, option.index );

        span.appendChild( a );

        span.innerHTML += optionText;

        return span;
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
    initSelectBox( wrapper )
    {
        let target  = this.target;
        let refs    = this.refs;
        let select  = refs.select;

        if ( target.tagName === `SELECT` )
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

                Array.prototype.slice.call( target.children, 0 ).forEach( function( optionEl )
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
            utils.addClass( target, classes.HIDDEN );
        }
        else
        {
            select = utils.constructElement( { tagname : `SELECT`, className : `${classes.SELECT_TAG}  ${classes.HIDDEN}` } );
            wrapper.appendChild( select );
        }

        return select;
    },


    /**
     * ## popInSelectElements
     *
     * pops the previously saves elements back into a select tag, restoring the
     * original state
     *
     * @param {DOMElement} select select element
     *
     * @return _Void_
     */
    popInSelectElements( select )
    {
        utils.removeAllChildren( select );

        this.originalChildren.forEach( function( _el, i )
        {
            select.appendChild( _el );
        } );
    },


    /**
     * ## popOutSelectElements
     *
     * pops out all the options of a select box, clones them, then appends the
     * clones.  This gives us the ability to restore the original tag
     *
     * @param {DOMElement} select select element
     *
     * @return _Void_
     */
    popOutSelectElements( select )
    {
        let res = [];
        let children = this.originalChildren = Array.prototype.slice.call( select.children, 0 );

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
    reconfigure( data, props )
    {
        if ( data && typeof data !== `string` && typeof data.length === `number` )
        {
            props       = props       = props || this.props;
            props.data  = data;
        }
        else if ( !props && typeof data === `object` )
        {
            props       = data;
            props.data  = props.data || this.data;
        }
        else
        {
            props       = props         || {};
            props.data  = props.data    || this.data;
        }

        return this.constructor( this.originalTarget, props );
    },


    /**
     * ## setTarget
     *
     * sets the target related
     *
     * @param {DOMElement} target  the actual to-be-flounderized element
     *
     * @return _Void_
     */
    setTarget( target )
    {
        target      = target.nodeType === 1 ? target : document.querySelector( target );

        this.originalTarget = target;
        target.flounder     = this;

        if ( target.tagName === `INPUT` )
        {
            utils.addClass( target, classes.HIDDEN );
            target.setAttribute( `aria-hidden`, true );
            target.tabIndex = -1;
            target          = target.parentNode;
        }

        this.target = target;
    }
};

export default build;
