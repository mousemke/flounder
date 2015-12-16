
/* jshint globalstrict: true */
'use strict';

import React, { Component } from 'react';
import ReactDOM             from 'react-dom';
import Flounder             from '../core/flounder.jsx';
import classes              from '../core/classes';

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
            <div ref="wrapper" className={classes.MAIN_WRAPPER + wrapperClass}>
                <div ref="flounder" tabIndex="0" className={classes.MAIN + flounderClass}>
                    <div ref="selected" className={classes.SELECTED_DISPLAYED} data-value={defaultValue.value}>
                        {defaultValue.text}
                    </div>
                    { props.multiple ? <div ref="multiTagWrapper" className={classes.MULTI_TAG_LIST}  multiple></div> : null }
                    <div ref="arrow" className={classes.ARROW}></div>
                    <div ref="optionsListWrapper" className={classes.OPTIONS_WRAPPER + '  ' + classes.HIDDEN}>
                        <div ref="optionsList" className={classes.LIST}>
                        {
                            options.map( ( _option, i ) =>
                            {
                                let extraClass = i === props.defaultValue ? '  ' + classes.SELECTED : '';
                                extraClass += _option.disabled ? '  ' + classes.DISABLED : '';

                                if ( typeof _option === 'string' )
                                {
                                    _option = [ _option, _option ];
                                }

                                return ( <div className={classes.OPTION + extraClass} data-index={i} key={i} ref={'option' + i}>
                                            {_option.text}
                                            {_option.description ?
                                                <div className={classes.DESCRIPTION}>
                                                    {_option.description}
                                                </div> :
                                                null
                                            }
                                        </div> );
                            } )
                        }
                        </div>
                    </div>
                    { props.search ? <input ref="search" type="text" className={classes.SEARCH} /> : null }
                </div>
                <select ref="select" className={classes.SELECT_TAG + '  ' + classes.HIDDEN} tabIndex="-1" multiple={props.multiple}>
                {
                    options.map( ( _option, i ) =>
                    {
                        let extraClass  = i === defaultValue ? '  ' + this.selectedClass : '';

                        let res = {
                            className       : classes.OPTION + extraClass,
                            'data-index'    : i
                        };

                        return ( <option key={i} value ={_option.value} className={classes.OPTION_TAG} ref={'option' + i}>
                                    {_option.text}
                                </option> );
                    } )
                }
                </select>
            </div>
        );
    }
}


let FlounderPrototype       = Flounder.prototype;
let FlounderReactPrototype  = FlounderReact.prototype;
let methods                 = Object.getOwnPropertyNames( FlounderPrototype );

methods.forEach( function( method )
{
    if ( !FlounderReactPrototype[ method ] && !FlounderPrototype[ method ].propertyIsEnumerable() )
    {
        FlounderReactPrototype[ method ] = FlounderPrototype[ method ]
    }
});

export default { React, Component, ReactDOM, FlounderReact, Flounder };

