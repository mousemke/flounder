
import classes          from './classes';
import search           from './search';
import utils            from './utils';

const events = {

    /**
     * ## addFirstTouchListeners
     *
     * adds the listeners for onFirstTouch
     *
     * @return _Void_
     */
    addFirstTouchListeners : function()
    {
        let refs = this.refs;
        refs.selected.addEventListener( 'click', this.firstTouchController );
        refs.select.addEventListener( 'focus', this.firstTouchController );

        if ( this.props.openOnHover )
        {
            refs.wrapper.addEventListener( 'mouseenter', this.firstTouchController );
        }
    },


    /**
     * ## addListeners
     *
     * adds listeners on render
     *
     * @return _Void_
     */
    addListeners : function( refs, props )
    {
        let ios         = this.isIos;
        let changeEvent = ios ? 'blur' : 'change';


        refs.select.addEventListener( changeEvent, this.divertTarget );

        refs.flounder.addEventListener( 'keydown', this.checkFlounderKeypress );

        if ( props.openOnHover )
        {
            let wrapper = refs.wrapper;
            wrapper.addEventListener( 'mouseenter', this.toggleList );
            wrapper.addEventListener( 'mouseleave', this.toggleList );
        }
        else
        {
            refs.selected.addEventListener( 'click', this.toggleList );
        }

        this.addFirstTouchListeners();
        this.addOptionsListeners();

        if ( this.search )
        {
            this.addSearchListeners();
        }
    },


    /**
     * ## addOptionsListeners
     *
     * adds listeners to the options
     *
     * @return _Void_
     */
    addOptionsListeners : function()
    {
        this.refs.data.forEach( ( dataObj, i ) =>
        {
            if ( dataObj.tagName === 'DIV' )
            {
                dataObj.addEventListener( 'mouseenter', this.addHoverClass );
                dataObj.addEventListener( 'mouseleave', this.removeHoverClass );

                dataObj.addEventListener( 'click', this.clickSet );
            }
        } );
    },


    addHoverClass : function()
    {
        utils.addClass( this, classes.HOVER );
    },


    removeHoverClass : function()
    {
        utils.removeClass( this, classes.HOVER );
    },


    /**
     * ## addPlaceholder
     *
     * called on body click, this determines what (if anything) should be
     * refilled into the the placeholder position
     *
     * @return _Void_
     */
    addPlaceholder : function()
    {
        let multiTags       = this.multipleTags;
        let selectedValues  = this.getSelectedValues();
        let val             = selectedValues[0];
        let selectedItems   = this.getSelected();
        let selectedText    = selectedItems.length ? selectedItems[0].innerHTML : '';
        let selectedCount   = selectedValues.length;
        let selected        = this.refs.selected;

        switch ( selectedCount )
        {
            case 0:
                this.setByIndex( 0 );
                break;
            case 1:
                selected.innerHTML = val === '' ? this.placeholder : selectedText;
                break;
            default:
                selected.innerHTML = this.multipleMessage;
                break;
        }

        if ( multiTags )
        {
            if ( selectedCount === 0 )
            {
                this.setByIndex( 0 );
            }

            if ( !val || val === '' )
            {
                selected.innerHTML = this.placeholder;
            }
            else
            {
                selected.innerHTML = '';
            }
        }
    },


    /**
     * ## addSearchListeners
     *
     * adds listeners to the search box
     *
     * @return _Void_
     */
    addSearchListeners : function()
    {
        let search = this.refs.search;
        search.addEventListener( 'click', this.toggleListSearchClick );
        search.addEventListener( 'keyup', this.fuzzySearch );
        search.addEventListener( 'focus', this.clearPlaceholder );
    },


    /**
     * ## addSelectKeyListener
     *
     * adds a listener to the selectbox to allow for seeking through the native
     * selectbox on keypress
     *
     * @return _Void_
     */
    addSelectKeyListener : function()
    {
        let refs    = this.refs;
        let select  = refs.select;

        select.addEventListener( 'keyup', this.setSelectValue );
        select.addEventListener( 'keydown', this.setKeypress );

        // weird shit
        // http://stackoverflow.com/questions/34660500/mobile-safari-multi-select-bug
        if ( this.isIos )
        {
            let firstOption = select[0];
            let plug        = document.createElement( 'OPTION' );
            plug.disabled   = true;
            plug.className  = classes.PLUG;
            select.insertBefore( plug, firstOption );
        }

        select.focus();
    },


    /**
     * ## catchBodyClick
     *
     * checks if a click is on the menu and, if it isnt, closes the menu
     *
     * @param  {Object} e event object
     *
     * @return _Void_
     */
    catchBodyClick : function( e )
    {
        if ( ! this.checkClickTarget( e ) )
        {
            this.toggleList( e );
            this.addPlaceholder();
        }
    },


    /**
     * ## checkClickTarget
     *
     * checks whether the target of a click is the menu or not
     *
     * @param  {Object} e event object
     * @param  {DOMElement} target click target
     *
     * @return _Boolean_
     */
    checkClickTarget : function( e, target )
    {
        target = target || e.target;
        if ( target === document )
        {
            return false;
        }
        else if ( target === this.refs.flounder )
        {
            return true;
        }

        target = target.parentNode;

        if ( target )
        {
            return this.checkClickTarget( e, target );
        }
        else
        {
            return false;
        }
    },


    /**
     * ## checkFlounderKeypress
     *
     * checks flounder focused keypresses and filters all but space and enter
     *
     * @return _Void_
     */
    checkFlounderKeypress : function( e )
    {
        let keyCode = e.keyCode;

        if ( keyCode === 13 || ( keyCode === 32 && e.target.tagName !== 'INPUT' ) )
        {
            e.preventDefault();
            this.toggleList( e );
        }
        else if ( ( keyCode >= 48 && keyCode <= 57 ) ||
                    ( keyCode >= 65 && keyCode <= 90 ) ) // letters - allows native behavior
        {
            let refs = this.refs;

            if ( refs.search && e.target.tagName === 'INPUT' )
            {
                refs.selected.innerHTML = '';
            }
        }
    },


    /**
     * ## checkPlaceholder
     *
     * clears or re-adds the placeholder
     *
     * @param {Object} e event object
     *
     * @return _Void_
     */
     clearPlaceholder : function( e )
     {
        let selected    = this.refs.selected;
        selected.innerHTML = '';
     },


    /**
     * ## clickSet
     *
     * when a flounder option is clicked on it needs to set the option as selected
     *
     * @param {Object} e event object
     *
     * @return _Void_
     */
    clickSet : function( e )
    {
        this.setSelectValue( {}, e );

        if ( !this.multiple || !e[ this.multiSelect ] )
        {
            this.toggleList( e );
        }
    },


    /**
     * ## divertTarget
     *
     * on interaction with the raw select box, the target will be diverted to
     * the corresponding flounder list element
     *
     * @return _Void_
     */
    divertTarget : function( e )
    {
        // weird shit
        // http://stackoverflow.com/questions/34660500/mobile-safari-multi-select-bug
        if ( this.isIos )
        {
            let select  = this.refs.select;
            let plug    = select.querySelector( '.' + classes.PLUG );

            if ( plug )
            {
                select.removeChild( plug );
            }
        }

        let index   = e.target.selectedIndex;

        let _e      = {
            type            : e.type,
            target          : this.data[ index ]
        };

        if ( this.multipleTags )
        {
            e.preventDefault();
            e.stopPropagation();
        }

        this.setSelectValue( _e );

        if ( !this.multiple )
        {
            this.toggleList( e, 'close' );
        }
    },


    /**
     * ## firstTouchController
     *
     * on first interaction, onFirstTouch is run, then the event listener is
     * removed
     *
     * @param {Object} e event object
     *
     * @return _Void_
     */
    firstTouchController : function( e )
    {
        let refs = this.refs;

        try
        {
            this.onFirstTouch( e );
        }
        catch( e )
        {
            console.log( 'something may be wrong in "onFirstTouch"', e );
        }

        refs.selected.removeEventListener( 'click', this.firstTouchController );
        refs.select.removeEventListener( 'focus', this.firstTouchController );

        if ( this.props.openOnHover )
        {
            refs.wrapper.removeEventListener( 'mouseenter', this.firstTouchController );
        }
    },


    /**
     * ## removeListeners
     *
     * removes event listeners from flounder.  normally pre unload
     *
     * @return _Void_
     */
    removeListeners : function()
    {
        let refs        = this.refs;

        this.removeOptionsListeners();

        let qsHTML          = document.querySelector( 'html' );
        let catchBodyClick  = this.catchBodyClick;
        qsHTML.removeEventListener( 'click', catchBodyClick );
        qsHTML.removeEventListener( 'touchend', catchBodyClick );

        let select = refs.select;
        select.removeEventListener( 'change', this.divertTarget  );
        select.removeEventListener( 'blur', this.divertTarget );
        refs.selected.removeEventListener( 'click', this.toggleList );
        refs.flounder.removeEventListener( 'keydown', this.checkFlounderKeypress );

        if ( this.search )
        {
            this.removeSearchListeners();
        }
    },


    /**
     * ## removeOptionsListeners
     *
     * removes event listeners on the data divs
     *
     * @return _Void_
     */
    removeOptionsListeners : function()
    {
        this.refs.data.forEach( dataObj =>
        {
            if ( dataObj.tagName === 'DIV' )
            {
                dataObj.removeEventListener( 'click', this.clickSet );
            }
        } );
    },


    /**
     * ## removeSearchListeners
     *
     * removes the listeners from the search input
     *
     * @return _Void_
     */
    removeSearchListeners : function()
    {
        let search = this.refs.search;
        search.removeEventListener( 'click', this.toggleList );
        search.removeEventListener( 'keyup', this.fuzzySearch );
        search.removeEventListener( 'focus', this.clearPlaceholder );
    },


    /**
     * ## removeSelectKeyListener
     *
     * disables the event listener on the native select box
     *
     * @return _Void_
     */
    removeSelectKeyListener : function()
    {
        let select = this.refs.select;
        select.removeEventListener( 'keyup', this.setSelectValue );
    },


    /**
     * ## setKeypress
     *
     * handles arrow key selection
     *
     * @param {Object} e event object
     *
     * @return _Void_
     */
    setKeypress : function( e )
    {
        let refs        = this.refs;
        let increment   = 0;
        let keyCode     = e.keyCode;

        let nonCharacterKeys = [ 16, 17, 18, 20, 91, 93 ]

        if ( nonCharacterKeys.indexOf( keyCode ) === -1 )
        {
            if ( this.multipleTags )
            {
                e.preventDefault();
                return false;
            }

            if ( keyCode === 13 || keyCode === 27 || keyCode === 32 ) // space enter escape
            {
                this.toggleList( e );
                return false;
            }
            else if ( !window.sidebar && ( keyCode === 38 || keyCode === 40 ) ) // up and down
            {
                e.preventDefault();
                let search = refs.search;

                if ( search )
                {
                    search.value = '';
                }

                increment = keyCode - 39;
            }
            else if ( ( keyCode >= 48 && keyCode <= 57 ) ||
                    ( keyCode >= 65 && keyCode <= 90 ) ) // letters - allows native behavior
            {
                return true;
            }

            let selectTag           = refs.select;
            let data                = refs.data;
            let dataMaxIndex        = data.length - 1;
            let index               = selectTag.selectedIndex + increment;

            if ( index > dataMaxIndex )
            {
                index = 0;
            }
            else if ( index < 0 )
            {
                index = dataMaxIndex;
            }

            selectTag.selectedIndex = index;

            let hasClass            = utils.hasClass;
            let dataAtIndex         = data[ index ];

            if ( hasClass( dataAtIndex, classes.HIDDEN ) ||
                 hasClass( dataAtIndex, classes.SELECTED_HIDDEN ) ||
                 hasClass( dataAtIndex, classes.SEARCH_HIDDEN ) ||
                 hasClass( dataAtIndex, classes.DISABLED ) )
            {
                this.setKeypress( e );
            }
        }
    },


    /**
     * ## setSelectValue
     *
     * sets the selected value in flounder.  when activated by a click, the event
     * object is moved to the second variable.  this gives us the ability to
     * discern between triggered events (keyup) and processed events (click)
     * for the sake of choosing our targets
     *
     * @param {Object} obj possible event object
     * @param {Object} e event object
     *
     * @return _Void_
     */
    setSelectValue : function( obj, e )
    {
        let refs        = this.refs;
        let keyCode;

        if ( e ) // click
        {
            this.setSelectValueClick( e );
        }
        else // keypress
        {
            keyCode = obj.keyCode;
            this.setSelectValueButton( obj );
        }

        this.displaySelected( refs.selected, refs );

        if ( !this.___programmaticClick )
        {
            // tab, shift, ctrl, alt, caps, cmd
            let nonKeys = [ 9, 16, 17, 18, 20, 91 ];

            if ( e || obj.type === 'blur' ||
                ( !keyCode && obj.type === 'change' ) ||
                ( keyCode && nonKeys.indexOf( keyCode ) === -1 ) )
            {
                if ( this.toggleList.justOpened && !e )
                {
                    this.toggleList.justOpened = false;
                }
                else
                {
                    try
                    {
                        this.onSelect( e, this.getSelectedValues() );
                    }
                    catch( e )
                    {
                        console.log( 'something may be wrong in "onSelect"', e );
                    }
                }
            }
        }

        this.___programmaticClick = false;
    },


    /**
     * ## setSelectValueButton
     *
     * processes the setting of a value after a keypress event
     *
     * @return _Void_
     */
    setSelectValueButton : function()
    {
        let refs            = this.refs;
        let data            = refs.data;
        let select          = refs.select;
        let selectedClass   = this.selectedClass;

        let selectedOption;

        this.removeSelectedClass( data );

        let dataArray       = this.getSelected();
        let baseOption      = dataArray[ 0 ];

        if ( baseOption )
        {
            selectedOption  = data[ baseOption.index ];

            utils.addClass( selectedOption, selectedClass );

            utils.scrollTo( selectedOption );
        }
    },


    /**
     * ## setSelectValueClick
     *
     * processes the setting of a value after a click event
     *
     * @param {Object} e event object
     *
     * @return _Void_
     */
    setSelectValueClick : function( e )
    {
        let _multiple       = this.multiple;
        let refs            = this.refs;
        let selectedClass   = this.selectedClass;
        let index, selectedOption;

        if ( ( !_multiple ||  _multiple && !this.multipleTags && !e[ this.multiSelect ] ) && !this.___forceMultiple )
        {
            this.deselectAll();
        }

        this.___forceMultiple   = false;
        let target              = e.target;

        utils.toggleClass( target, selectedClass );
        index                   = target.getAttribute( 'data-index' );

        selectedOption          = refs.selectOptions[ index ];

        selectedOption.selected = selectedOption.selected === true ? false : true;

        let firstOption = refs.selectOptions[ 0 ];

        if ( firstOption.value === '' && this.getSelected().length > 1 )
        {
            utils.removeClass( refs.data[0], selectedClass );
            refs.selectOptions[0].selected = false;
        }
    },


    /**
     * ## toggleClosed
     *
     * post toggleList, this runs it the list should be closed
     *
     * @param {Object} e event object
     * @param {DOMElement} optionsList the options list
     * @param {Object} refs contains the references of the elements in flounder
     * @param {DOMElement} wrapper wrapper of flounder
     *
     * @return _Void_
     */
    toggleClosed : function( e, optionsList, refs, wrapper )
    {
        utils.addClass( optionsList, classes.HIDDEN );
        this.removeSelectKeyListener();
        utils.removeClass( wrapper, 'open' );

        let qsHTML = document.querySelector( 'html' );
        qsHTML.removeEventListener( 'click', this.catchBodyClick );
        qsHTML.removeEventListener( 'touchend', this.catchBodyClick );

        if ( this.search )
        {
            this.fuzzySearchReset();
        }

        refs.flounder.focus();

        if ( this.ready )
        {
            try
            {
                this.onClose( e, this.getSelectedValues() );
            }
            catch( e )
            {
                console.log( 'something may be wrong in "onClose"', e );
            }
        }
    },


    /**
     * ## toggleListSearchClick
     *
     * toggleList wrapper for search.  only triggered if flounder is closed
     *
     * @return _Void_
     */
    toggleListSearchClick : function( e )
    {
        if ( !utils.hasClass( this.refs.wrapper, 'open' ) )
        {
            this.toggleList( e, 'open' );
        }
    },


    /**
     * ## toggleList
     *
     * on click of flounder--selected, this shows or hides the options list
     *
     * @param {String} force toggle can be forced by passing 'open' or 'close'
     *
     * @return _Void_
     */
    toggleList : function( e, force )
    {
        let refs        = this.refs;
        let optionsList = refs.optionsListWrapper;
        let wrapper     = refs.wrapper;
        let hasClass    = utils.hasClass;
        let type        = e.type;

        if ( type === 'mouseleave' || force === 'close' ||
            !hasClass( optionsList, classes.HIDDEN ) )
        {
            this.toggleList.justOpened = false;
            this.toggleClosed( e, optionsList, refs, wrapper );
        }
        else if ( type === 'mouseenter' || force === 'open' ||
            force !== 'close' && utils.hasClass( optionsList, classes.HIDDEN ) )
        {
            if ( type === 'keydown' )
            {
                this.toggleList.justOpened = true;
            }

            this.toggleOpen( e, optionsList, refs, wrapper );
        }
    },


    /**
     * ## toggleOpen
     *
     * post toggleList, this runs it the list should be opened
     *
     * @param {Object} e event object
     * @param {DOMElement} optionsList the options list
     * @param {Object} refs contains the references of the elements in flounder
     * @param {DOMElement} wrapper wrapper of flounder
     *
     * @return _Void_
     */
    toggleOpen : function( e, optionsList, refs, wrapper )
    {
        this.addSelectKeyListener();

        if ( !this.isIos || this.search || ( this.multipleTags === true && this.multiple === true ) )
        {
            utils.removeClass( optionsList, classes.HIDDEN );
            utils.addClass( wrapper, 'open' );

            let qsHTML = document.querySelector( 'html' );

            qsHTML.addEventListener( 'click', this.catchBodyClick );
            qsHTML.addEventListener( 'touchend', this.catchBodyClick );
        }


        if ( !this.multiple )
        {
            let index       = refs.select.selectedIndex;
            let selectedDiv = refs.data[ index ];

            if ( selectedDiv )
            {
                utils.scrollTo( selectedDiv  );
            }
        }

        if ( this.search )
        {
            refs.search.focus();
        }

        if ( this.ready )
        {
            try
            {
                this.onOpen( e, this.getSelectedValues() );
            }
            catch( e )
            {
                console.log( 'something may be wrong in "onOpen"', e );
            }
        }
    }
};


export default events;
