
/* jshint globalstrict: true */
'use strict';

import React, { Component } from 'react';
import ReactDOM             from 'react-dom';
import Flounder             from '../core/flounder.jsx';

const slice = Array.prototype.slice;

class FlounderReact extends Component
{
    /**
     * available states
     *
     * @return _Array_ available states
     */
    allStates()
    {
        return [
            'default'
        ];
    }


    /**
     * ## componentDidMount
     *
     * setup to run afte rendering the dom
     *
     * @return _Void_
     */
    componentDidMount()
    {
        let refs            = this.refs;

        this.target         = refs.wrapper.parentNode;

        refs.options        = slice.call( refs.optionsList.children, 0 );
        refs.selectOptions  = slice.call( refs.select.children, 0 );

        this.refs.select.flounder = this.refs.selected.flounder = this.target.flounder = this;

        let multiTagWrapper = this.refs.multiTagWrapper;

        if ( multiTagWrapper )
        {
            multiTagWrapper.style.textIndent = this.defaultTextIndent + 'px';
        }

        if ( !this.multiple )
        {
            refs.select.removeAttribute( 'multiple' );
        }

        this.onRender();

        if ( this.onComponentDidMount )
        {
            this.onComponentDidMount();
        }

        this.setPlatform();
    }


    /**
     * sets the initial state
     *
     * @return _Void_
     */
    constructor( props )
    {
        super( props );
        this.state = {
            modifier        : '',
            errorMessage    : ''
        };
    }


    /**
     * Callback to handle change.
     *
     * Also updates div state and classes
     *
     * @param  _Object_ e Event object
     */
    handleChange( e )
    {
        if ( this.props.onChange )
        {
            this.props.onChange( e );
        }
    }


    /**
     * ## prepOptions
     *
     * double checks that the options are correctly formatted
     *
     * @param {Array} _options array object that may contain objects or strings
     *
     * @return _Array_ correctly formatted options
     */
    prepOptions( _options )
    {
        _options.forEach( ( _option, i ) =>
        {
            if ( typeof _option === 'string' )
            {
                _option = {
                    text    : _option,
                    value   : _option
                };
            }

            _option.text = this.escapeHTML( _option.text );
        } );

        return _options;
    }


    /**
     * Spits out our markup
     *
     * REACT FLOUNDER CAN NOT MOUNT TO INPUT OR SELECT TAGS.
     *
     */
    render( e )
    {
        this.bindThis();

        this.initialzeOptions();

        if ( this.onInit )
        {
            this.onInit();
        }

        let optionsCollection       = [];
        let selectOptionsCollection = [];

        let escapeHTML      = this.escapeHTML;
        let props           = this.props;
        let options         = this.options = this.prepOptions( props.options || this.options );

        let handleChange    = this.handleChange.bind( this );
        let multiple        = props.multiple;
        let defaultValue    = this.defaultValue = this.setDefaultOption( props.defaultValue || this.defaultValue, options );
        let wrapperClass    = this.wrapperClass ? '  ' + this.wrapperClass : '';
        let flounderClass   = this.flounderClass ? '  ' + this.flounderClass : '';

        let _stateModifier  = this.state.modifier;
        _stateModifier = _stateModifier.length > 0 ? '--' + _stateModifier : '';

        return (
            <div ref="wrapper" className={'flounder-wrapper  flounder__input--select' + wrapperClass}>
                <div ref="flounder" tabIndex="0" className={'flounder' + flounderClass}>
                    <div ref="selected" className="flounder__option--selected--displayed" data-value={defaultValue.value}>
                        {defaultValue.text}
                    </div>
                    { props.multiple ? <div ref="multiTagWrapper" className="multi--tag--list"  multiple></div> : null }
                    <div ref="arrow" className="flounder__arrow"></div>
                    <div ref="optionsListWrapper" className="flounder__list-wrapper  flounder--hidden">
                        <div ref="optionsList" className="flounder__list">
                        {
                            options.map( ( _option, i ) =>
                            {
                                let extraClass = i === props.defaultValue ? '  flounder__option--selected' : '';
                                extraClass += _option.disabled ? '  flounder--disabled' : '';

                                if ( typeof _option === 'string' )
                                {
                                    _option = [ _option, _option ];
                                }

                                return ( <div className={'flounder__option' + extraClass} data-index={i} key={i} ref={'option' + i}>
                                            {_option.text}
                                            {_option.description ?
                                                <div className="flounder__option--description">
                                                    {_option.description}
                                                </div> :
                                                null
                                            }
                                        </div> );
                            } )
                        }
                        </div>
                    </div>
                    { props.search ? <input ref="search" type="text" className="flounder__input--search" /> : null }
                </div>
                <select ref="select" className="flounder--select--tag  flounder--hidden" tabIndex="-1" multiple={props.multiple}>
                {
                    options.map( ( _option, i ) =>
                    {
                        let extraClass  = i === defaultValue ? '  ' + this.selectedClass : '';

                        let res = {
                            className       : 'flounder__option' + extraClass,
                            'data-index'    : i
                        };

                        return ( <option key={i} className="flounder--option--tag" ref={'option' + i}>
                                    {_option.text}
                                </option> );
                    } )
                }
                </select>
            </div>
        );
    }
}


// these get rebound to this
FlounderReact.prototype.bindThis                = Flounder.prototype.bindThis;
FlounderReact.prototype.catchBodyClick          = Flounder.prototype.catchBodyClick;
FlounderReact.prototype.checkClickTarget        = Flounder.prototype.checkClickTarget;
FlounderReact.prototype.checkFlounderKeypress   = Flounder.prototype.checkFlounderKeypress
FlounderReact.prototype.checkPlaceholder        = Flounder.prototype.checkPlaceholder;
FlounderReact.prototype.clickSet                = Flounder.prototype.clickSet;
FlounderReact.prototype.displayMultipleTags     = Flounder.prototype.displayMultipleTags;
FlounderReact.prototype.fuzzySearch             = Flounder.prototype.fuzzySearch;
FlounderReact.prototype.removeMultiTag          = Flounder.prototype.removeMultiTag;
FlounderReact.prototype.setKeypress             = Flounder.prototype.setKeypress;
FlounderReact.prototype.setSelectValue          = Flounder.prototype.setSelectValue;
FlounderReact.prototype.setSelectValueButton    = Flounder.prototype.setSelectValueButton;
FlounderReact.prototype.setSelectValueClick     = Flounder.prototype.setSelectValueClick;
FlounderReact.prototype.toggleClass             = Flounder.prototype.toggleClass;
FlounderReact.prototype.toggleList              = Flounder.prototype.toggleList;


// just your every day, run of the mill functions
FlounderReact.prototype.addClass                = Flounder.prototype.addClass;
FlounderReact.prototype.addOptionsListeners     = Flounder.prototype.addOptionsListeners;
FlounderReact.prototype.addSearch               = Flounder.prototype.addSearch;
FlounderReact.prototype.addSelectKeyListener    = Flounder.prototype.addSelectKeyListener;
FlounderReact.prototype.attachAttributes        = Flounder.prototype.attachAttributes;
FlounderReact.prototype.checkClickTarget        = Flounder.prototype.checkClickTarget;
FlounderReact.prototype.checkSelect             = Flounder.prototype.checkSelect;
FlounderReact.prototype.componentWillUnmount    = Flounder.prototype.componentWillUnmount;
FlounderReact.prototype.displaySelected         = Flounder.prototype.displaySelected;
FlounderReact.prototype.escapeHTML              = Flounder.prototype.escapeHTML;
FlounderReact.prototype.fuzzySearchReset        = Flounder.prototype.fuzzySearchReset;
FlounderReact.prototype.getActualWidth          = Flounder.prototype.getActualWidth;
FlounderReact.prototype.getOption               = Flounder.prototype.getOption;
FlounderReact.prototype.getSelectedOptions      = Flounder.prototype.getSelectedOptions;
FlounderReact.prototype.hideElement             = Flounder.prototype.hideElement;
FlounderReact.prototype.initialzeOptions        = Flounder.prototype.initialzeOptions;
FlounderReact.prototype.iosVersion              = Flounder.prototype.iosVersion;
FlounderReact.prototype.onRender                = Flounder.prototype.onRender;
FlounderReact.prototype.rebuildOptions          = Flounder.prototype.rebuildOptions;
FlounderReact.prototype.removeClass             = Flounder.prototype.removeClass;
FlounderReact.prototype.removeOptionsListeners  = Flounder.prototype.removeOptionsListeners;
FlounderReact.prototype.removeSelectKeyListener = Flounder.prototype.removeSelectKeyListener;
FlounderReact.prototype.removeSelectedClass     = Flounder.prototype.removeSelectedClass;
FlounderReact.prototype.removeSelectedValue     = Flounder.prototype.removeSelectedValue;
FlounderReact.prototype.scrollMultiple          = Flounder.prototype.scrollMultiple;
FlounderReact.prototype.scrollTo                = Flounder.prototype.scrollTo;
FlounderReact.prototype.setDefaultOption        = Flounder.prototype.setDefaultOption;
FlounderReact.prototype.setPlatform             = Flounder.prototype.setPlatform;
FlounderReact.prototype.setTextMultiTagIndent   = Flounder.prototype.setTextMultiTagIndent;
FlounderReact.prototype.showElement             = Flounder.prototype.showElement;
FlounderReact.prototype.toggleClosed            = Flounder.prototype.toggleClosed;
FlounderReact.prototype.toggleOpen              = Flounder.prototype.toggleOpen;

export default { React, Component, ReactDOM, FlounderReact, Flounder };

