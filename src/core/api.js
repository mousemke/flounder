/*
 * Copyright (c) 2015-2017 dunnhumby Germany GmbH.
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the LICENSE file
 * in the root directory of this source tree.
 *
 */

/* globals console */
import utils                from './utils';
import { setDefaultOption } from './defaults';

const api = {

    /**
     * ## buildFromUrl
     *
     * uses loadDataFromUrl and completes the entire build with the new data
     *
     * @param {String} url address to get the data from
     * @param {Function} callback function to run after getting the data
     *
     * @return {Void} void
     */
    buildFromUrl( url, callback )
    {
        this.loadDataFromUrl( url, data =>
        {
            this.data = data;

            if ( callback )
            {
                callback( this.data );
            }

            this.rebuild( this.data );
        } );

        return [];
    },


    /**
     * ## clickByIndex
     *
     * programatically sets selected by index.  If there are not enough elements
     * to match the index, then nothing is selected. Fires the onClick event
     *
     * @param {Mixed} index index to set flounder to.
     *                                          _Number, or Array of numbers_
     * @param {Boolean} multiple multiSelect or not
     *
     * @return {Void} void
     */
    clickByIndex( index, multiple )
    {
        return this.setByIndex( index, multiple, false );
    },


    /**
     * ## clickByText
     *
     * programatically sets selected by text string.  If the text string
     * is not matched to an element, nothing will be selected. Fires the
     * onClick event
     *
     * @param {Mixed} text text to set flounder to.
     *                                         _String, or Array of strings_
     * @param {Boolean} multiple multiSelect or not
     *
     * @return {Void} void
     */
    clickByText( text, multiple )
    {
        return this.setByText( text, multiple, false );
    },


    /**
     * ## clickByValue
     *
     * programatically sets selected by value string.  If the value string
     * is not matched to an element, nothing will be selected. Fires the
     * onClick event
     *
     * @param {Mixed} value value to set flounder to.
     *                                      _String, or Array of strings_
     * @param {Boolean} multiple multiSelect or not
     *
     * @return {Void} void
     */
    clickByValue( value, multiple )
    {
        return this.setByValue( value, multiple, false );
    },


    /**
     * ## destroy
     *
     * removes flounder and all it`s events from the dom
     *
     * @return {Void} void
     */
    destroy()
    {
        this.componentWillUnmount();

        const refs                = this.refs;
        const classes             = this.classes;
        const originalTarget      = this.originalTarget;
        const tagName             =  originalTarget.tagName;

        if ( tagName === 'INPUT' || tagName === 'SELECT' )
        {
            let target = originalTarget.nextElementSibling;

            if ( tagName === 'SELECT' )
            {
                const firstOption = originalTarget[ 0 ];

                if ( firstOption &&
                            utils.hasClass( firstOption, classes.PLACEHOLDER ) )
                {
                    originalTarget.removeChild( firstOption );
                }
            }
            else
            {
                target = refs.flounder.parentNode;
            }

            try
            {
                const classes = this.classes;
                target.parentNode.removeChild( target );
                originalTarget.tabIndex = 0;
                utils.removeClass( originalTarget, classes.HIDDEN );
            }
            catch ( e )
            {
                throw ' : this flounder may have already been removed';
            }
        }
        else
        {
            try
            {
                const wrapper = refs.wrapper;
                const parent  = wrapper.parentNode;
                parent.removeChild( wrapper );
            }
            catch ( e )
            {
                throw ' : this flounder may have already been removed';
            }
        }

        refs.flounder.flounder  = originalTarget.flounder =
                                                    this.target.flounder = null;
    },


    /**
     * ## deselectAll
     *
     * deslects all data
     *
     * @param {Boolean} silent stifle the onChange event
     *
     * @return {Void} void
     */
    deselectAll( silent )
    {
        this.removeSelectedClass();
        this.removeSelectedValue();

        if ( this.multiple )
        {
            const multiTagWrapper = this.refs.multiTagWrapper;

            if ( multiTagWrapper )
            {
                const children = multiTagWrapper.children;

                for ( let i = 0; i < children.length - 1; i++ )
                {
                    let el = children[ i ];

                    const lastEl = i === children.length - 1;

                    if ( !silent && lastEl )
                    {
                        el = el.children;
                        el = el[ 0 ];

                        el.click();
                    }
                    else
                    {
                        el.removeEventListener( 'click', this.removeMultiTag );
                        el.remove();
                    }
                }

                this.addPlaceholder();
            }
        }
    },


    /**
     * ## disable
     *
     * disables flounder by adjusting listeners and classes
     *
     * @param {Boolean} bool disable or enable
     *
     * @return {Void} void
     */
    disable( bool )
    {
        const refs        = this.refs;
        const classes     = this.classes;
        const flounder    = refs.flounder;
        const selected    = refs.selected;

        if ( bool )
        {
            flounder.removeEventListener( 'keydown',
                                                this.checkFlounderKeypress );
            selected.removeEventListener( 'click', this.toggleList );
            utils.addClass( flounder, classes.DISABLED );
        }
        else
        {
            flounder.addEventListener( 'keydown', this.checkFlounderKeypress );
            selected.addEventListener( 'click', this.toggleList );
            utils.removeClass( flounder, classes.DISABLED );
        }
    },


    /**
     * ## disableByIndex
     *
     * disables the options with the given index
     *
     * @param {Mixed} index index of the option
     * @param {Boolean} reenable enables the option instead
     *
     * @return {Void} void
     */
    disableByIndex( index, reenable )
    {
        const refs = this.refs;

        if ( typeof index !== 'string' && index.length )
        {
            const disableByIndex = this.disableByIndex.bind( this );

            return index.map( _i => disableByIndex( _i, reenable ) );
        }

        const data  = refs.data;
        let length  = data.length;

        if ( index < 0 )
        {
            length  = data.length;
            index = length + index;
        }

        const el = data[ index ];

        if ( el )
        {
            const opt     = refs.selectOptions[ index ];
            const classes = this.classes;

            if ( reenable )
            {
                opt.disabled = false;
                utils.removeClass( el, classes.DISABLED );
            }
            else
            {
                opt.disabled = true;
                utils.addClass( el, classes.DISABLED );
            }

            return [ el, opt ];
        }

        console.warn( 'Flounder - No element to disable.' );
    },


    /**
     * ## disableByText
     *
     * disables THE FIRST option that has the given value
     *
     * @param {Mixed} text value of the option
     * @param {Boolean} reenable enables the option instead
     *
     * @return {Void} void
     */
    disableByText( text, reenable )
    {
        if ( typeof text !== 'string' && text.length )
        {
            const disableByText = this.disableByText.bind( this );
            const res = text.map( _v => disableByText( _v, reenable ) );

            return res.length === 1 ? res[ 0 ] : res;
        }

        let res     = [];

        this.refs.data.forEach( ( el, i ) =>
        {
            const elText = el.innerHTML;

            if ( elText === text )
            {
                res.push( i );
            }
        } );

        res = res.length === 1 ? res[ 0 ] : res;

        return this.disableByIndex( res, reenable );
    },


    /**
     * ## disableByValue
     *
     * disables THE FIRST option that has the given value
     *
     * @param {Mixed} value value of the option
     * @param {Boolean} reenable enables the option instead
     *
     * @return {Void} void
     */
    disableByValue( value, reenable )
    {
        if ( typeof value !== 'string' && value.length )
        {
            const disableByValue = this.disableByValue.bind( this );
            const res = value.map( _v => disableByValue( _v, reenable ) );

            return res.length === 1 ? res[ 0 ] : res;
        }

        let res = this.refs.selectOptions.map( ( el, i ) =>
        {
            return `${el.value}` === `${value}` ? i : null;
        } ).filter( a => !!a || a === 0 );

        res = res.length === 1 ? res[ 0 ] : res;

        return this.disableByIndex( res, reenable );
    },


    /**
     * ## enableByIndex
     *
     * shortcut syntax to enable an index
     *
     * @param {Mixed} index index of the option to enable
     *
     * @return {Object} flounder(s)
     */
    enableByIndex( index )
    {
        return this.disableByIndex( index, true );
    },


    /**
     * ## enableByText
     *
     * shortcut syntax to enable by text
     *
     * @param {Mixed} text text of the option to enable
     *
     * @return {Object} flounder(s)
     */
    enableByText( text )
    {
        return this.disableByText( text, true );
    },


    /**
     * ## enableByValue
     *
     * shortcut syntax to enable a value
     *
     * @param {Mixed} value value of the option to enable
     *
     * @return {Object} flounder(s)
     */
    enableByValue( value )
    {
        this.disableByValue( value, true );
    },


    /**
     * ## getData
     *
     * returns the option and div tags related to an option
     *
     * @param {Number} index index to return
     *
     * @return {Object} option and div tage
     */
    getData( index )
    {
        const refs = this.refs;

        if ( typeof index === 'number' )
        {
            return {
                option  : refs.selectOptions[ index ],
                div     : refs.data[ index ]
            };
        }
        else if ( index && index.length && typeof index !== 'string' )
        {
            return index.map( i =>
            {
                return this.getData( i );
            } );
        }
        else if ( !index )
        {
            return refs.selectOptions.map( ( el, i ) =>
            {
                return this.getData( i );
            } );
        }

        console.warn( 'Flounder - Illegal parameter type.' );
    },


    /**
     * ## getSelected
     *
     * returns the currently selected data of a SELECT box
     *
     * @return {Void} void
     */
    getSelected()
    {
        const el        = this.refs.select;
        const opts      = [];
        const data      = el.options;
        const classes   = this.classes;

        for ( let i = 0; i < data.length; i++ )
        {
            const el = data[ i ];
            if ( el.selected && !utils.hasClass( el, classes.PLACEHOLDER ) )
            {
                opts.push( el );
            }
        }

        return opts;
    },


    /**
     * ## getSelectedValues
     *
     * returns the values of the currently selected data
     *
     * @return {Void} void
     */
    getSelectedValues()
    {
        return this.getSelected().map( _v => _v.value );
    },


    /**
     * ## loadDataFromUrl
     *
     * loads data from a passed url
     *
     * @param {String} url address to get the data from
     * @param {Function} callback function to run after getting the data
     *
     * @return {Void} void
     */
    loadDataFromUrl( url, callback )
    {
        const classes = this.classes;

        utils.http.get( url ).then( data =>
        {
            if ( data )
            {
                this.data = JSON.parse( data );

                if ( callback )
                {
                    callback( this.data );
                }
            }
            else
            {
                console.warn( 'no data recieved' );
            }
        } ).catch( e =>
        {
            console.warn( 'something happened: ', e );
            this.rebuild( [ {
                text        : '',
                value       : '',
                index       : 0,
                extraClass  : classes.LOADING_FAILED
            } ] );
        } );

        return [ {
            text        : '',
            value       : '',
            index       : 0,
            extraClass  : classes.LOADING
        } ];
    },


    /**
     * ## rebuild
     *
     * after editing the data, this can be used to rebuild them
     *
     * @param {Array} data array with option information
     * @param {Object} props options object
     *
     * @return {Object} rebuilt flounder object
     */
    rebuild( data, props )
    {
        if ( props || !props && ( typeof data === 'string' ||
                                data && typeof data.length !== 'number' ) )
        {
            return this.reconfigure( data, props );
        }

        data            = this.data = data || this.data;
        props           = this.props;
        const refs      = this.refs;
        const select    = refs.select;

        this.deselectAll();
        this.removeOptionsListeners();

        refs.select.innerHTML = '';
        refs.select           = false;

        this.defaultObj       = setDefaultOption( this, props, data, true );

        refs.optionsList.innerHTML  = '';

        if ( refs.noMoreOptionsEl || typeof refs.noMoreOptionsEl === undefined )
        {
            delete refs.noMoreOptionsEl;
        }
        if ( refs.noResultsEl || typeof refs.noResultsEl === undefined )
        {
            delete refs.noResultsEl;
        }

        [ refs.data, refs.selectOptions, refs.sections ] = this.buildData(
                        this.defaultObj, this.data, refs.optionsList, select );
        refs.select                 = select;

        this.addOptionsListeners();

        this.data = data;

        this.displaySelected( refs.selected, refs );

        return this;
    },


    /**
     * ## setByIndex
     *
     * programatically sets the value by index.  If there are not enough
     * elements to match the index, then nothing is selected.
     *
     * @param {Mixed} index index to set flounder to.
     *                                          _Number, or Array of numbers_
     * @param {Boolean} multiple multiSelect or not
     * @param {Boolean} programmatic fire onChange and toggle menu or not
     *
     * @return {Void} void
     */
    setByIndex( index, multiple, programmatic = true )
    {
        const refs = this.refs;

        if ( typeof index !== 'string' && index.length )
        {
            const setByIndex = this.setByIndex.bind( this );

            return index.map( _i => setByIndex( _i, multiple, programmatic ) );
        }

        const data    = this.data;
        let length    = data.length;

        if ( index < 0 )
        {
            length  = data.length;
            index = length + index;
        }

        const el = refs.data[ index ];

        if ( el )
        {
            this.forceMultiple     = multiple && this.multiple;
            this.programmaticClick = programmatic;

            el.click();

            return el;
        }

        return null;
    },


    /**
     * ## setByText
     *
     * programatically sets the text by string.  If the text string
     * is not matched to an element, nothing will be selected
     *
     * @param {Mixed} text text to set flounder to.
     *                                            _String, or Array of strings_
     * @param {Boolean} multiple multiSelect or not
     * @param {Boolean} programmatic fire onChange and toggle menu or not
     *
     * @return {Void} void
     */
    setByText( text, multiple, programmatic = true )
    {
        if ( typeof text !== 'string' && text.length )
        {
            const setByText = this.setByText.bind( this );

            return text.map( _i => setByText( _i, multiple, programmatic ) );
        }

        const res = [];
        text    = `${text}`;

        this.refs.data.forEach( ( el, i ) =>
        {
            const elText = el.innerHTML;

            if ( elText === text )
            {
                res.push( i );
            }
        } );

        return this.setByIndex( res, multiple, programmatic );
    },


    /**
     * ## setByValue
     *
     * programatically sets the value by string.  If the value string
     * is not matched to an element, nothing will be selected
     *
     * @param {Mixed} value value to set flounder to.
     *                                           _String, or Array of strings_
     * @param {Boolean} multiple multiSelect or not
     * @param {Boolean} programmatic fire onChange and toggle menu or not
     *
     * @return {Void} void
     */
    setByValue( value, multiple, programmatic = true )
    {
        if ( typeof value !== 'string' && value.length )
        {
            const setByValue = this.setByValue.bind( this );

            return value.map( _i => setByValue( _i, multiple, programmatic ) );
        }

        const values = this.refs.selectOptions.map( ( el, i ) =>
        {
            return `${el.value}` === `${value}` ? i : null;
        } ).filter( a => a === 0 || !!a );

        return this.setByIndex( values, multiple, programmatic );
    }
};

export default api;
