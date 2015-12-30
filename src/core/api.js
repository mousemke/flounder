
import classes          from './classes';

const api = {

    /**
     * ## destroy
     *
     * removes flounder and all it's events from the dom
     *
     * @return _Void_
     */
    destroy : function()
    {
        this.componentWillUnmount();
        let originalTarget      = this.originalTarget;

        this.refs.flounder.flounder = this.originalTarget.flounder = this.target.flounder = null;

        if ( originalTarget.tagName === 'INPUT' || originalTarget.tagName === 'SELECT' )
        {
            let target = originalTarget.nextElementSibling;
            try
            {
                target.parentNode.removeChild( target );
                originalTarget.tabIndex = 0;
                this.removeClass( originalTarget, classes.HIDDEN );
            }
            catch( e )
            {
                throw ' : this flounder may have already been removed';
            }
        }
        else
        {
            try
            {
                let wrapper = this.refs.wrapper;
                let parent  = wrapper.parentNode;
                parent.removeChild( wrapper );
            }
            catch( e )
            {
                throw ' : this flounder may have already been removed';
            }
        }
    },


    /**
     * ## deselectAll
     *
     * deslects all data
     *
     * @return _Void_
     */
    deselectAll : function()
    {
        this.removeSelectedClass();
        this.removeSelectedValue();
    },


    /**
     * ## disable
     *
     * disables flounder by adjusting listeners and classes
     *
     * @param {Boolean} bool dsable or enable
     *
     * @return _Void_
     */
    disable : function( bool )
    {
        let refs        = this.refs;
        let flounder    = refs.flounder;
        let selected    = refs.selected;

        if ( bool )
        {
            refs.flounder.removeEventListener( 'keydown', this.checkFlounderKeypress );
            refs.selected.removeEventListener( 'click', this.toggleList );
            this.addClass( selected, classes.DISABLED );
            this.addClass( flounder, classes.DISABLED );
        }
        else
        {
            refs.flounder.addEventListener( 'keydown', this.checkFlounderKeypress );
            refs.selected.addEventListener( 'click', this.toggleList );
            this.removeClass( selected, classes.DISABLED );
            this.removeClass( flounder, classes.DISABLED );
        }
    },


    /**
     * ## getOption
     *
     * returns the option and div tags related to an option
     *
     * @param {Number} _i index to return
     *
     * @return _Object_ option and div tage
     */
    getOption : function( _i )
    {
        let refs = this.refs;

        return { option : refs.selectOptions[ _i ], div : refs.data[ _i ] };
    },


    /**
     * ## getSelectedOptions
     *
     * returns the currently selected data of a SELECT box
     *
     * @return _Void_
     */
    getSelectedOptions : function()
    {
        let _el         = this.refs.select;
        let opts        = [], opt;
        let _data       = _el.options;

        for ( let i = 0, len = _data.length; i < len; i++ )
        {
            opt = _data[ i ];

            if ( opt.selected )
            {
                opts.push( opt );
            }
        }

        return opts;
    },


    /**
     * ## getSelectedValues
     *
     * returns the values of the currently selected data
     *
     * @return _Void_
     */
    getSelectedValues : function()
    {
        return this.getSelectedOptions().map( ( _v ) => _v.value )
    },


    /**
     * ## rebuildSelect
     *
     * after editing the data, this can be used to rebuild them
     *
     * @param {Array} _data array with optino information
     *
     * @return _Void_
     */
    rebuildSelect : function( _data )
    {
        let refs        = this.refs;
        let selected    = refs.select.selectedOptions;
        selected        = Array.prototype.slice.call( selected ).map( function( e ){ return e.value; } );

        this.removeOptionsListeners();

        refs.select.innerHTML       = '';
        refs.optionsList.innerHTML  = '';

        let _select                 = refs.select;
        refs.select                 = false;
        [ refs.data, refs.selectOptions ] = this.buildData( this._default, _data, refs.optionsList, _select );
        refs.select                 = _select;

        this.removeSelectedValue();
        this.removeSelectedClass();

        refs.selectOptions.forEach( ( el, i ) =>
        {
            let valuePosition = selected.indexOf( el.value );

            if ( valuePosition !== -1 )
            {
                selected.splice( valuePosition, 1 );
                el.selected = true;
                this.addClass( refs.data[ i ], this.selectedClass );
            }
        } );

        this.addOptionsListeners();
    },


    /**
     * ## setIndex
     *
     * programatically sets the value by index.  If there are not enough elements
     * to match the index, then nothing is selected.
     *
     * @param {Mixed} index index to set flounder to.  _Number, or Array of numbers_
     *
     * return _Void_
     */
    setIndex : function( index, multiple )
    {
        let refs = this.refs;

        if ( typeof index !== 'string' && index.length )
        {
            let _setIndex = this.setIndex;
            return index.map( _setIndex );
        }
        else
        {
            var el = refs.data[ index ];

            if ( el )
            {
                let isOpen = this.hasClass( refs.wrapper, 'open' );
                this.toggleList( isOpen ? 'close' : 'open' );
                this.___forceMultiple       = multiple;
                this.___programmaticClick   = true;
                el.click();

                return el;
            }

            return null;
        }
    },



    /**
     * ## setValue
     *
     * programatically sets the value by string.  If the value string
     * is not matched to an element, nothing will be selected
     *
     * @param {Mixed} value value to set flounder to.  _Number, or Array of numbers_
     *
     * return _Void_
     */
    setValue : function( value, multiple )
    {
        if ( typeof value !== 'string' && value.length )
        {
            let _setValue = this.setValue;
            return value.map( _setValue );
        }
        else
        {
            value = this.refs.select.querySelector( '[value="' + value + '"]' );
            return value ? this.setIndex( value.index, multiple ) : null;
        }
    }
};

export default api;

