
import classes          from './classes';
import search           from './search';
import utils            from './utils';
import keycodes         from './keycodes';

const nativeSlice = Array.prototype.slice;

const events = {

    /**
     * ## addFirstTouchListeners
     *
     * adds the listeners for onFirstTouch
     *
     * @return _Void_
     */
    addFirstTouchListeners()
    {
        let refs = this.refs;
        refs.selected.addEventListener( `click`, this.firstTouchController );
        refs.select.addEventListener( `focus`, this.firstTouchController );

        if ( this.props.openOnHover )
        {
            refs.wrapper.addEventListener( `mouseenter`, this.firstTouchController );
        }
    },


    /**
     * ## addHoverClass
     *
     * adds a hover class to an element
     *
     * @return Void_
     */
    addHoverClass()
    {
        utils.addClass( this, classes.HOVER );
    },


    /**
     * ## addListeners
     *
     * adds listeners on render
     *
     * @return _Void_
     */
    addListeners( refs )
    {
        let ios         = this.isIos;
        let changeEvent = ios ? `blur` : `change`;


        refs.select.addEventListener( changeEvent, this.divertTarget );
        refs.flounder.addEventListener( `keydown`, this.checkFlounderKeypress );


        if ( this.props.openOnHover )
        {
            let wrapper = refs.wrapper;
            wrapper.addEventListener( `mouseenter`, this.toggleList );
            wrapper.addEventListener( `mouseleave`, this.toggleList );
        }
        else
        {
            refs.selected.addEventListener( `click`, this.toggleList );
        }

        this.addFirstTouchListeners();
        this.addOptionsListeners();

        if ( this.search )
        {
            this.addSearchListeners();
        }
    },


    /**
     * ## addMultipleTags
     *
     * adds a tag for each selected option and attaches the correct events to it
     *
     * @param {Array} selectedOptions currently selected options
     * @param {DOMElement} multiTagWrapper parent element of the tags
     *
     * @return _Void_
     */
    addMultipleTags( selectedOptions, multiTagWrapper )
    {
        selectedOptions.forEach( option =>
        {
            if ( option.value !== `` )
            {
                let tag = this.buildMultiTag( option );

                multiTagWrapper.appendChild( tag );
            }
            else
            {
                option.selected = false;
            }
        } );

        nativeSlice.call( multiTagWrapper.children, 0 ).forEach( el =>
        {
            let firstChild = el.firstChild;

            firstChild.addEventListener( `click`, this.removeMultiTag );
            el.addEventListener( `keydown`, this.checkMultiTagKeydown );
        } );
    },


    /**
     * ## addOptionsListeners
     *
     * adds listeners to the options
     *
     * @return _Void_
     */
    addOptionsListeners()
    {
        this.refs.data.forEach( ( dataObj, i ) =>
        {
            if ( dataObj.tagName === `DIV` )
            {
                dataObj.addEventListener( `mouseenter`, this.addHoverClass );
                dataObj.addEventListener( `mouseleave`, this.removeHoverClass );

                dataObj.addEventListener( `click`, this.clickSet );
            }
        } );
    },


    /**
     * ## addPlaceholder
     *
     * determines what (if anything) should be refilled into the the
     * placeholder position
     *
     * @return _Void_
     */
    addPlaceholder()
    {
        let selectedValues  = this.getSelectedValues();
        let val             = selectedValues[ 0 ];
        let selectedItems   = this.getSelected();
        let selectedText    = selectedItems.length ? selectedItems[ 0 ].innerHTML : ``;
        let selectedCount   = selectedValues.length;
        let selected        = this.refs.selected;

        switch ( selectedCount )
        {
            case 0:
                this.setByIndex( 0 );
                break;
            case 1:
                selected.innerHTML = selectedText;
                break;
            default:
                selected.innerHTML = this.multipleMessage;
                break;
        }

        if ( this.multipleTags )
        {
            if ( selectedCount === 0 )
            {
                this.setByIndex( 0 );
            }

            if ( !val || val === `` )
            {
                selected.innerHTML = this.placeholder;
            }
            else
            {
                selected.innerHTML = ``;
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
    addSearchListeners()
    {
        let search = this.refs.search;
        search.addEventListener( `click`, this.toggleListSearchClick );
        search.addEventListener( `focus`, this.toggleListSearchClick );
        search.addEventListener( `keyup`, this.fuzzySearch );
        search.addEventListener( `focus`, this.clearPlaceholder );
    },


    /**
     * ## addSelectKeyListener
     *
     * adds a listener to the selectbox to allow for seeking through the native
     * selectbox on keypress
     *
     * @return _Void_
     */
    addSelectKeyListener()
    {
        let refs    = this.refs;
        let select  = refs.select;

        select.addEventListener( `keyup`, this.setSelectValue );
        select.addEventListener( `keydown`, this.setKeypress );

        // weird shit
        // http://stackoverflow.com/questions/34660500/mobile-safari-multi-select-bug
        if ( this.isIos )
        {
            let firstOption = select.children[0];

            let plug        = document.createElement( `OPTION` );
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
    catchBodyClick( e )
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
    checkClickTarget( e, target )
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

        return false;
    },


    /**
     * ## checkEnterOnSearch
     *
     * if enter is pressed in the searchox, if there is only one option matching,
     * this selects it
     *
     * @param {Object} e event object
     * @param {Object} refs element references
     *
     * @return _Void_
     */
    checkEnterOnSearch( e , refs )
    {
        let val  = e.target.value;

        if ( val && val !== '' )
        {
            let res         = [];
            let options     = refs.data.length;
            let selected    = this.getSelected();
            let matches     = this.search.isThereAnythingRelatedTo( val );

            matches.forEach( el =>
            {
                let index   = el.i;
                el          = refs.selectOptions[ index ];

                if ( selected.indexOf( el ) === -1 )
                {
                    res.push( el );
                }
            } );

            if ( res.length === 1 )
            {
                let el = res[ 0 ];
                this.setByIndex( el.index, this.multiple );

                if ( this.multipleTags )
                {
                    setTimeout( () => refs.search.focus(), 200 );
                }
            }

            return res;
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
    checkFlounderKeypress( e )
    {
        let keyCode = e.keyCode;
        let refs    = this.refs;

        if ( keyCode === keycodes.TAB )
        {
            let optionsList = refs.optionsListWrapper;
            let wrapper     = refs.wrapper;

            this.addPlaceholder();
            this.toggleClosed( e, optionsList, refs, wrapper, true );
        }
        else if ( keyCode === keycodes.ENTER ||
            ( keyCode === keycodes.SPACE && e.target.tagName !== `INPUT` ) )
        {
            if ( keyCode === keycodes.ENTER && this.search &&
                    utils.hasClass( refs.wrapper, classes.OPEN ) )
            {
                return this.checkEnterOnSearch( e, refs );
            }

            e.preventDefault();
            this.toggleList( e );
        }
        else if ( ( keyCode >= 48 && keyCode <= 57 ) ||
                    ( keyCode >= 65 && keyCode <= 90 ) ) // letters - allows native behavior
        {
            if ( refs.search && e.target.tagName === `INPUT` )
            {
                refs.selected.innerHTML = ``;
            }
        }
    },


    /**
     * ## checkMultiTagKeydown
     *
     * when a tag is selected, this decided how to handle it by either
     * passing the event on, or handling tag removal
     *
     * @param {Object} e event object
     *
     * @return _Void_
     */
    checkMultiTagKeydown( e )
    {
        let keyCode                 = e.keyCode;
        let self                    = this;
        let refs                    = this.refs;
        let children                = refs.multiTagWrapper.children;
        let target                  = e.target;
        let index                   = nativeSlice.call( children, 0 ).indexOf( target );

        function focusSearch()
        {
            refs.search.focus();
            self.clearPlaceholder();
            self.toggleListSearchClick( e );
        }

        if ( keyCode === keycodes.LEFT || keyCode === keycodes.RIGHT ||
            keyCode === keycodes.BACKSPACE )
        {
            e.preventDefault();
            e.stopPropagation();


            if ( keyCode === keycodes.BACKSPACE )
            {
                self.checkMultiTagKeydownRemove( target, focusSearch, index );
            }
            else
            {
                self.checkMultiTagKeydownNavigate( focusSearch, keyCode, index );
            }
        }
        else if ( e.key.length < 2 )
        {
            focusSearch();
        }
    },


    /**
     * ## checkMultiTagKeydownNavigate
     *
     * after left or right is hit while a multitag is focused, this focus' on
     * the next tag in that direction or the the search field
     *
     * @param {Function} focusSearch function to focus on the search field
     * @param {Number} keyCode keyclode from te keypress event
     * @param {Number} index index of currently focused tag
     *
     * @return _Void_
     */
    checkMultiTagKeydownNavigate( focusSearch, keyCode, index )
    {
        let children    = this.refs.multiTagWrapper.children;

        let adjustment  = keyCode - 38;
        let newIndex    = index + adjustment;
        let length      = children.length - 1;

        if ( newIndex > length )
        {
            focusSearch();
        }
        else if ( newIndex >= 0 )
        {
            children[ newIndex ].focus();
        }
    },


    /**
     * ## checkMultiTagKeydownRemove
     *
     * after a backspece while a multitag is focused, this removes the tag and
     * focus' on the next
     *
     * @param {DOMElement} target focused multitag
     * @param {Function} focusSearch function to focus on the search field
     * @param {Number} index index of currently focused tag
     *
     * @return _Void_
     */
    checkMultiTagKeydownRemove( target, focusSearch, index )
    {
        let children    = this.refs.multiTagWrapper.children;
        let siblings    = children.length - 1;

        target.firstChild.click();

        if ( siblings > 0 )
        {
            children[ index === 0 ? 0 : index - 1 ].focus();
        }
        else
        {
            focusSearch();
        }
    },


    /**
     * ## clearPlaceholder
     *
     * clears the placeholder
     *
     * @param {Object} e event object
     *
     * @return _Void_
     */
     clearPlaceholder()
     {
        let selected    = this.refs.selected;
        selected.innerHTML = ``;
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
    clickSet( e )
    {
        e.preventDefault();
        e.stopPropagation();

        this.setSelectValue( {}, e );

        if ( !this.multiple || !e[ this.multiSelect ] )
        {
            this.toggleList( e );
        }
    },


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
        nativeSlice.call( multiTagWrapper.children, 0 ).forEach( el =>
        {
            let firstChild = el.firstChild;

            firstChild.removeEventListener( `click`, this.removeMultiTag );
            el.removeEventListener( `keydown`, this.checkMultiTagKeydown );
        } );

        multiTagWrapper.innerHTML = ``;

        if ( selectedOptions.length > 0 )
        {
            this.addMultipleTags( selectedOptions, multiTagWrapper );
        }
        else
        {
            this.addPlaceholder();
        }

        this.setTextMultiTagIndent();
    },


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
            value               = selectedOption[0].value;
            selected.innerHTML  = refs.data[ index ].innerHTML;
        }
        else if ( !multipleTags && selectedLength === 0 )
        {
            let defaultValue    = this._default;
            index               = defaultValue.index;
            value               = defaultValue.value;
            selected.innerHTML  = defaultValue.text;
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
    },


    /**
     * ## divertTarget
     *
     * @param {Object} e event object
     *
     * on interaction with the raw select box, the target will be diverted to
     * the corresponding flounder list element
     *
     * @return _Void_
     */
    divertTarget( e )
    {
        // weird shit
        // http://stackoverflow.com/questions/34660500/mobile-safari-multi-select-bug
        if ( this.isIos )
        {
            let select  = this.refs.select;
            let plug    = select.querySelector( `.${classes.PLUG}` );

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
            this.toggleList( e, `close` );
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
    firstTouchController( e )
    {
        let refs = this.refs;

        try
        {
            this.onFirstTouch( e );
        }
        catch( e )
        {
            console.warn( `something may be wrong in "onFirstTouch"`, e );
        }

        refs.selected.removeEventListener( `click`, this.firstTouchController );
        refs.select.removeEventListener( `focus`, this.firstTouchController );

        if ( this.props.openOnHover )
        {
            refs.wrapper.removeEventListener( `mouseenter`, this.firstTouchController );
        }
    },


    /**
     * ## removeHoverClass
     *
     * removes a hover class from an element
     *
     * @return Void_
     */
    removeHoverClass()
    {
        utils.removeClass( this, classes.HOVER );
    },


    /**
     * ## removeListeners
     *
     * removes event listeners from flounder.  normally pre unload
     *
     * @return _Void_
     */
    removeListeners()
    {
        let refs        = this.refs;

        this.removeOptionsListeners();

        let qsHTML          = document.querySelector( `html` );
        let catchBodyClick  = this.catchBodyClick;
        qsHTML.removeEventListener( `click`, catchBodyClick );
        qsHTML.removeEventListener( `touchend`, catchBodyClick );

        let select = refs.select;
        select.removeEventListener( `change`, this.divertTarget  );
        select.removeEventListener( `blur`, this.divertTarget );
        refs.selected.removeEventListener( `click`, this.toggleList );
        refs.flounder.removeEventListener( `keydown`, this.checkFlounderKeypress );

        if ( this.search )
        {
            this.removeSearchListeners();
        }
    },


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

        this.setTextMultiTagIndent();

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
    },


    /**
     * ## removeOptionsListeners
     *
     * removes event listeners on the data divs
     *
     * @return _Void_
     */
    removeOptionsListeners()
    {
        this.refs.data.forEach( dataObj =>
        {
            if ( dataObj.tagName === `DIV` )
            {
                dataObj.removeEventListener( `click`, this.clickSet );

                dataObj.removeEventListener( `mouseenter`, this.addHoverClass );
                dataObj.removeEventListener( `mouseleave`, this.removeHoverClass );
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
    removeSearchListeners()
    {
        let search = this.refs.search;
        search.removeEventListener( `click`, this.toggleListSearchClick );
        search.removeEventListener( `focus`, this.toggleListSearchClick );
        search.removeEventListener( `keyup`, this.fuzzySearch );
        search.removeEventListener( `focus`, this.clearPlaceholder );
    },


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
    },


    /**
     * ## removeSelectedValue
     *
     * sets the selected property to false for all data
     *
     * @return _Void_
     */
    removeSelectedValue( data )
    {
        data            = data || this.refs.data;
        let optionTags  = this.refs.select.children;

        data.forEach( ( d, i ) =>
        {
            optionTags[ i ].selected = false;
        } );
    },


    /**
     * ## removeSelectKeyListener
     *
     * disables the event listener on the native select box
     *
     * @return _Void_
     */
    removeSelectKeyListener()
    {
        let select = this.refs.select;
        select.removeEventListener( `keyup`, this.setSelectValue );
    },


    /**
     * ## setKeypress
     *
     * handles arrow key and enter selection
     *
     * @param {Object} e event object
     *
     * @return _Void_
     */
    setKeypress( e )
    {
        let refs        = this.refs;
        let increment   = 0;
        let keyCode     = e.keyCode;

        let nonCharacterKeys = keycodes.NON_CHARACTER_KEYS;

        if ( nonCharacterKeys.indexOf( keyCode ) === -1 )
        {
            if ( keyCode === keycodes.TAB )
            {
                let optionsList = refs.optionsListWrapper;
                let wrapper     = refs.wrapper;

                this.addPlaceholder();
                this.toggleClosed( e, optionsList, refs, wrapper, true );
                return false;
            }

            if ( keyCode === keycodes.ENTER || keyCode === keycodes.ESCAPE ||
                    keyCode === keycodes.SPACE )
            {
                this.toggleList( e );
                return false;
            }

            if ( keyCode === keycodes.UP || keyCode === keycodes.DOWN )
            {
                if ( !window.sidebar )
                {
                    e.preventDefault();
                    let search = refs.search;

                    if ( search )
                    {
                        search.value = ``;
                    }

                    increment = keyCode - 39;
                }

                this.setKeypressElement( e, increment );
            }

            return true;
        }
    },


    /**
     * ## setKeypressElement
     *
     * sets the element after the keypress.  if the element is hidden or
     * disabled, it passes the event back to setKeypress to process the next
     * element
     *
     * @param {Object} e event object
     * @param {Number} increment amount to change the index by
     *
     * @return _Void_
     */
    setKeypressElement( e, increment )
    {
        let refs                = this.refs;
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
    setSelectValue( obj, e )
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

            if ( e || obj.type === `blur` ||
                ( !keyCode && obj.type === `change` ) ||
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
                        console.warn( `something may be wrong in "onSelect"`, e );
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
    setSelectValueButton()
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
    setSelectValueClick( e )
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
        index                   = target.getAttribute( `data-index` );

        selectedOption          = refs.selectOptions[ index ];

        selectedOption.selected = selectedOption.selected === true ? false : true;

        let firstOption = refs.selectOptions[ 0 ];

        if ( firstOption.value === `` && this.getSelected().length > 1 )
        {
            utils.removeClass( refs.data[0], selectedClass );
            refs.selectOptions[0].selected = false;
        }
    },


    /**
     * ## setTextMultiTagIndent
     *
     * sets the text-indent on the search field to go around selected tags
     *
     * @return _Void_
     */
    setTextMultiTagIndent()
    {
        let refs    = this.refs;
        let search  = refs.search;

        let offset  = 0;

        nativeSlice.call( refs.multiTagWrapper.children, 0 ).forEach( ( e, i ) =>
        {
            offset += utils.getElWidth( e, this.setTextMultiTagIndent, this );
        } );


        /* istanbul ignore next */
        search.style.textIndent = offset > 0 ? `${offset}px` : ``;
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
     * @param {Boolean} exit prevents refocus. used while tabbing away
     *
     * @return _Void_
     */
    toggleClosed( e, optionsList, refs, wrapper, exit = false )
    {
        utils.addClass( optionsList, classes.HIDDEN );
        this.removeSelectKeyListener();
        utils.removeClass( wrapper, classes.OPEN );

        let qsHTML = document.querySelector( `html` );
        qsHTML.removeEventListener( `click`, this.catchBodyClick );
        qsHTML.removeEventListener( `touchend`, this.catchBodyClick );

        if ( this.search )
        {
            this.fuzzySearchReset();
        }

        if ( !exit )
        {
            refs.flounder.focus();
        }

        if ( this.ready )
        {
            try
            {
                this.onClose( e, this.getSelectedValues() );
            }
            catch( e )
            {
                console.warn( `something may be wrong in "onClose"`, e );
            }
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
    toggleList( e, force )
    {
        let refs        = this.refs;
        let optionsList = refs.optionsListWrapper;
        let wrapper     = refs.wrapper;
        let isHidden    = utils.hasClass( optionsList, classes.HIDDEN );
        let type        = e.type;

        if ( type === `mouseleave` || force === `close` || !isHidden )
        {
            this.toggleList.justOpened = false;
            this.toggleClosed( e, optionsList, refs, wrapper );
        }
        else
        {
            if ( type === `keydown` )
            {
                this.toggleList.justOpened = true;
            }

            this.toggleOpen( e, optionsList, refs, wrapper );
        }
    },


    /**
     * ## toggleListSearchClick
     *
     * toggleList wrapper for search.  only triggered if flounder is closed
     *
     * @return _Void_
     */
    toggleListSearchClick( e )
    {
        if ( !utils.hasClass( this.refs.wrapper, classes.OPEN ) )
        {
            this.toggleList( e, `open` );
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
    toggleOpen( e, optionsList, refs, wrapper )
    {
        this.addSelectKeyListener();

        if ( !this.isIos || this.search || this.multipleTags === true )
        {
            utils.removeClass( optionsList, classes.HIDDEN );
            utils.addClass( wrapper, classes.OPEN );

            let qsHTML = document.querySelector( `html` );

            qsHTML.addEventListener( `click`, this.catchBodyClick );
            qsHTML.addEventListener( `touchend`, this.catchBodyClick );
        }


        if ( !this.multiple )
        {
            let index       = refs.select.selectedIndex;
            let selectedDiv = refs.data[ index ];

            utils.scrollTo( selectedDiv  );
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
                console.warn( `something may be wrong in "onOpen"`, e );
            }
        }
    }
};


export default events;
