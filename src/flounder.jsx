
/* jshint globalstrict: true */
'use strict';

const _slice = Array.prototype.slice;

class Flounder
{
    /**
     * ## addClass
     *
     * on the quest to nuke jquery, a wild helper function appears
     *
     * @param {DOMElement} _el target element
     * @param {String} _class class to add
     *
     * @return _Void_
     */
    addClass( _el, _class )
    {
        let _elClass        = _el.className;
        let _elClassLength  = _elClass.length;

        if ( _elClass.indexOf( ' ' + _class + ' ' ) === -1 &&
            _elClass.slice( 0, _class.length + 1 ) !== _class + ' ' &&
            _elClass.slice( _elClassLength - _class.length - 1, _elClassLength ) !== ' ' + _class )
        {
            _el.className += '  ' + _class;
        }
    }


    /**
     * ## addOptionDescription
     *
     * adds a description to the option
     *
     * @param {DOMElement} _el option leement to add description to
     * @param {String} text description
     *
     * @return _Void_
     */
    addOptionDescription( _el, text )
    {
        let _e = document.createElement( 'div' );
        _e.innerHTML = text;
        _e.className = 'flounder__option--description';
        _el.appendChild( _e );
    }


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
        if ( this.props.search )
        {
            let search = this.constructElement( {
                                    tagname     : 'input',
                                    type        : 'text',
                                    className   : 'flounder__input--search'
                                } );
            flounder.appendChild( search );

            return search;
        }

        return false;
    };


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
        let select = this.refs.select;
        select.addEventListener( 'keyup', this.setSelectValue );
        select.addEventListener( 'keydown', this.setSelectArrows );
        select.focus();
    }


    /**
     * ## attachAttribute
     *
     * attached data attributes and others (seperately)
     *
     * @param {DOMElement} _el element to assign attributes
     * @param {Object} _elObj contains the attributes to attach
     *
     * @return _Void_
     */
    attachAttributes( _el, _elObj )
    {
        for ( let att in _elObj )
        {
            if ( att.indexOf( 'data-' ) !== -1 )
            {
                _el.setAttribute( att, _elObj[ att ] );
            }
            else
            {
                _el[ att ] = _elObj[ att ];
            }
        }
    }


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
        this.attachAttributes      = this.attachAttributes.bind( this );
        this.catchBodyClick        = this.catchBodyClick.bind( this );
        this.checkClickTarget      = this.checkClickTarget.bind( this );
        this.checkPlaceholder      = this.checkPlaceholder.bind( this );
        this.clickSet              = this.clickSet.bind( this );
        this.displayMultipleTags   = this.displayMultipleTags.bind( this );
        this.fuzzySearch           = this.fuzzySearch.bind( this );
        this.removeMultiTag        = this.removeMultiTag.bind( this );
        this.setSelectArrows       = this.setSelectArrows.bind( this );
        this.setSelectValue        = this.setSelectValue.bind( this );
        this.toggleClass           = this.toggleClass.bind( this );
        this.toggleList            = this.toggleList.bind( this );
    }


    /**
     * ## buildDom
     *
     * builds flounder
     *
     * @return _Void_
     */
    buildDom()
    {
        this.refs               = {};

        let constructElement    = this.constructElement;

        let wrapper             = constructElement( { className : 'flounder-wrapper  flounder__input--select' } );

        let flounderClass       = 'flounder' + ( this.props.className ? '  ' + this.props.className : '' );
        let flounder            = constructElement( { className : flounderClass } );
        wrapper.appendChild( flounder );

        let select              = this.initSelectBox( wrapper );

        if ( this.multiple === true )
        {
            select.setAttribute( 'multiple', '' );
        }

        let _options            = this.options;

        let _default            = this._default = this.setDefaultOption( this._default, _options );

        let selected            = constructElement( { className : 'flounder__option--selected--displayed',
                                        'data-value' : _default.value  } );
            selected.innerHTML  = _default.text;

        let multiTagWrapper     = this.props.multiple ? constructElement( { className : 'multi--tag--list' } ) : null;

        if ( multiTagWrapper !== null )
        {
            multiTagWrapper.style.textIndent = this.defaultTextIndent + 'px';
        }

        let arrow               = constructElement( { className : 'flounder__arrow' } );
        let optionsListWrapper  = constructElement( { className : 'flounder__list-wrapper  flounder--hidden' } );
        let optionsList         = constructElement( { className : 'flounder__list' } );
        optionsListWrapper.appendChild( optionsList );

        [ selected, multiTagWrapper, arrow, optionsListWrapper ].forEach( _el =>
        {
            if ( _el )
            {
                flounder.appendChild( _el );
            }
        } );

        let search = this.addSearch( flounder );
        let [ options, selectOptions ] = this.buildOptions( _default, _options, optionsList, select );

        this.target.appendChild( wrapper );

        this.refs = { wrapper, flounder, selected, arrow, optionsListWrapper,
                    search, multiTagWrapper, optionsList, select, options, selectOptions };
    }


    /**
     * ## buildOptions
     *
     * builds both the div and select based options. will skip the select box
     * if it already exists
     *
     * @param {Mixed} _default default entry (string or number)
     * @param {Array} _options array with optino information
     * @param {Object} optionsList reference to the div option wrapper
     * @param {Object} select reference to the select box
     *
     * @return _Array_ refs to both container elements
     */
    buildOptions( _default, _options, optionsList, select )
    {
        let options             = [];
        let selectOptions       = [];
        let constructElement    = this.constructElement;
        let addOptionDescription      = this.addOptionDescription;

        _options.forEach( ( _option, i ) =>
        {
            if ( typeof _option === 'string' )
            {
                _option = {
                    text    : _option,
                    value   : _option
                };
            }

            let escapedText = this.escapeHTML( _option.text );
            let extraClass  = i === _default ? '  ' + this.selectedClass : '';

            let res = {
                className       : 'flounder__option' + extraClass,
                'data-index'    : i
            };

            for ( let _o in _option )
            {
                if ( _o !== 'text' && _o !== 'description' )
                {
                    res[ _o ] = _option[ _o ];
                }
            }

            options[ i ] = constructElement( res );

            options[ i ].innerHTML = escapedText;
            optionsList.appendChild( options[ i ] );

            let description = _option.description;

            if ( description )
            {
                addOptionDescription( options[ i ], description );
            }

            if ( ! this.refs.select )
            {
                selectOptions[ i ] = constructElement( { tagname : 'option',
                                            className   : 'flounder--option--tag',
                                            value       :  _option.value } );
                selectOptions[ i ].innerHTML = escapedText;
                select.appendChild( selectOptions[ i ] );
            }
            else
            {
                selectOptions[ i ] = select.children[ i ];
            }

            if ( selectOptions[ i ].getAttribute( 'disabled' ) )
            {
                this.addClass( options[ i ], 'flounder--disabled' );
            }
        } );

        return  [ options, selectOptions ];
    }


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
            if ( this.cancelFunc )
            {
                this.cancelFunc( e );
            }
            this.toggleList( e );
        }
    }


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

        return this.checkClickTarget( e, target.parentNode );
    }


    /**
     * ## checkPlaceholder
     *
     * clears or readds the placeholder
     *
     * @param {Object} e event object
     *
     * @return _Void_
     */
    checkPlaceholder( e )
    {
        let type = e.type;
        let refs = this.refs;

        if ( type === 'focus' )
        {
            refs.selected.innerHTML = '';
        }
        else
        {
            if ( refs.multiTagWrapper &&
                    refs.multiTagWrapper.children.length === 0 )
            {
                this.refs.selected.innerHTML = this._default.text;
            }
        }
    }


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

        this.setSelectValue( {}, e );

        if ( !this.multiple || !e[ this.multiSelect ] )
        {
            this.toggleList( e );
        }
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
        let props       = this.props;
        let refs        = this.refs;

        let _events     = props.events;
        let _div        = refs.flounder;

        for ( let _event in _events )
        {
            _div.removeEventListener( _event, _events[ _event ] );
        }

        refs.options.forEach( _option =>
        {
            if ( _option.tagName === 'DIV' )
            {
                _option.removeEventListener( 'click', this.clickSet );
            }
        } );

        refs.selected.removeEventListener( 'click', this.toggleList );

        if ( props.search )
        {
            let search = refs.search;
            search.removeEventListener( 'click', this.toggleList );
            search.removeEventListener( 'keyup', this.fuzzySearch );
        }
    }


    /**
     * ## constructElement
     *
     * @param {Object} _elObj object carrying properties to transfer
     *
     * @return _Element_
     */
    constructElement = _elObj =>
    {
        let _el         = document.createElement( _elObj.tagname || 'div' );

        this.attachAttributes( _el, _elObj );

        return _el;
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
        if ( target && target.length !== 0 )
        {
            this.props  = props;
            target      = target.jquery ? target[0] : target;
            target      = target.nodeType === 1 ? target : document.querySelector( target );

            if ( target.tagName === 'INPUT' )
            {
                this.addClass( target, 'flounder--hidden' );
                target = target.parentNode;
            }

            this.target     = target;

            this.bindThis();

            this.initialzeOptions();

            if ( this.initFunc )
            {
                this.initFunc();
            }

            this.buildDom();

            this.setPlatform();

            this.onRender();

            if ( this.componentDidMountFunc )
            {
                this.componentDidMountFunc();
            }

            this.refs.select.flounder = this.refs.selected.flounder = this.target.flounder = this;

            return this;
        }


    }


    /**
     * ## destroy
     *
     * removes flounder and all it'S events from the dom
     *
     * @return _Void_
     */
    destroy()
    {
        this.componentWillUnmount();
        let target = this.target;
        target.parentNode.removeChild( target );
    }


    /**
     * ## displayMultipleTags
     *
     * handles the display and management of multiple choice tage
     *
     * @param  {Array} selectedOptions currently selected options
     * @param  {DOMElement} selected div to display currently selected options
     *
     * @return _Void_
     */
    displayMultipleTags( selectedOptions, multiTagWrapper )
    {
        let _span, _a, refs = this.refs;

        let removeMultiTag = this.removeMultiTag

        _slice.call( multiTagWrapper.children ).forEach( function( el )
        {
            el.firstChild.removeEventListener( 'click', removeMultiTag );
        } );

        multiTagWrapper.innerHTML = '';

        selectedOptions.forEach( function( option )
        {
            _span           = document.createElement( 'span' )
            _span.className = 'flounder__multiple--select--tag';

            _a              = document.createElement( 'a' )
            _a.className    = 'flounder__multiple__tag__close';
            _a.setAttribute( 'data-index', option.index );

            _span.appendChild( _a );

            _span.innerHTML += option.innerHTML;

            multiTagWrapper.appendChild( _span );
        } );

        this.setTextMultiTagIndent();

        _slice.call( multiTagWrapper.children ).forEach( function( el )
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

     */
    displaySelected( selected, refs )
    {
        let value = [];

        let selectedOption  = _slice.call( this.getSelectedOptions( refs.select ) );
        let selectedLength  = selectedOption.length;
        let multiple        = this.multiple

        if ( !multiple || ( !this.multipleTags && selectedLength ===  1 ) )
        {
            selected.innerHTML  = selectedOption[0].innerHTML;
            value               = selectedOption[0].value;
        }
        else if ( selectedLength === 0 )
        {
            let _default = this._default;

            selected.innerHTML  = _default.text;
            value               = _default.value;
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

            value = selectedOption.map( function( option )
            {
                return option.value;
            } );
        }

        selected.setAttribute( 'data-value', value );
    }


    /**
     * ## escapeHTML
     *
     * Escapes HTML in order to put correct elements in the DOM
     *
     * @param {String} string unescaped string
     *
     * @return _Void_
     */
    escapeHTML( string )
    {
        return String( string ).replace( /&/g, '&amp;' )
                                .replace( /</g, '&lt;' )
                                .replace( />/g, '&gt;' )
                                .replace( /"/g, '&quot;' );
    }


    /**
     * ## fuzzySearch
     *
     * searches each option element to see whether it contains a string
     *
     * @param {Object} e event object
     *
     * @return _Void_
     */
    fuzzySearch( e ) // disclaimer: not actually fuzzy
    {
        e.preventDefault();
        let keyCode = e.keyCode;

        if ( keyCode !== 38 && keyCode !== 40 &&
                keyCode !== 13 && keyCode !== 27 )
        {
            let term        = e.target.value.toLowerCase();

            this.refs.options.forEach( _option =>
            {
                let text    = _option.innerHTML.toLowerCase();

                if ( term !== '' && text.indexOf( term ) === -1 )
                {
                    this.addClass( _option, 'flounder--search--hidden' );
                }
                else
                {
                    this.removeClass( _option, 'flounder--search--hidden' );
                }
            } );
        }
        else
        {
            this.setSelectArrows( e );
            this.setSelectValue( e );
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
        this.refs.options.forEach( _option =>
        {
            this.removeClass( _option, 'flounder--search--hidden' );
        } );

        this.refs.search.value = '';
    }


    /**
     * ## getActualWidth
     *
     * gets the width adjusted for margins
     *
     * @param {DOMElement} _el target element
     *
     * @return _Integer_ adjusted width
     */
    getActualWidth( _el )
    {
        let style = getComputedStyle( _el );

        if ( _el.offsetWidth === 0 )
        {
            if ( this.__checkWidthAgain !== true )
            {
                setTimeout( this.setTextMultiTagIndent.bind( this ), 1500 );
                this.__checkWidthAgain === true;
            }
        }
        else
        {
            this.__checkWidthAgain !== false
        }

        return _el.offsetWidth + parseInt( style[ 'margin-left' ] ) +
                                parseInt( style[ 'margin-right' ] );
    }


    /**
     * ## getSelectedOptions
     *
     * returns the currently selected otions of a SELECT box
     *
     * @param {Object} _el select box
     */
    getSelectedOptions( _el )
    {
        if ( _el.selectedOptions )
        {
            return _el.selectedOptions;
        }
        else
        {
            var opts        = [], opt;
            var _options    = _el.options;

            for ( var i = 0, len = _options.length; i < len; i++ )
            {
                opt = _options[ i ];

                if ( opt.selected )
                {
                    opts.push( opt );
                }
            }

            return opts;
        }
    }


    /**
     * hideElement
     *
     * hides an element offscreen
     *
     * @param {Object} _el element to hide
     *
     * @return _Void_
     */
    hideElement( _el )
    {
        this.addClass( _el, 'flounder--hidden' );
    }


    /**
     * ## initialzeOptions
     *
     * inserts the initial options into the flounder object, setting defaults when necessary
     *
     * @return _Void_
     */
    initialzeOptions()
    {
        this.props                  = this.props || {};
        let props                   = this.props;
        this.initFunc               = props.init                !== undefined ? props.init            : false;
        this.openFunc               = props.open                !== undefined ? props.open            : false;
        this.selectFunc             = props.select              !== undefined ? props.select          : false;
        this.cancelFunc             = props.cancel              !== undefined ? props.cancel          : false;
        this.closeFunc              = props.close               !== undefined ? props.close           : false;
        this.componentDidMountFunc  = props.componentDidMount   !== undefined ? props.componentDidMount : false;
        this.multiple               = props.multiple            !== undefined ? props.multiple        : false;
        this.multipleTags           = props.multipleTags        !== undefined ? props.multipleTags    : true;
        this.multipleMessage        = props.multipleMessage     !== undefined ? props.multipleMessage : '(Multiple Items Selected)';
        this.hiddenClass            = props.hiddenClass         !== undefined ? props.hiddenClass     : 'flounder--hidden';
        this.defaultTextIndent      = props.defaultTextIndent   !== undefined ? props.defaultTextIndent : 0;
        this.options                = props.options             !== undefined ? props.options         : [];

        this.selectedClass          = this.multipleTags ? 'flounder__option--selected--hidden'          : 'flounder__option--selected';

        this._default    = '';
        if ( props._default || props._default === 0 )
        {
            this._default = props._default;
        }
    }


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
        let target = this.target;
        let select;

        if ( target.tagName === 'SELECT' )
        {
            this.addClass( target, 'flounder--select--tag' );
            this.addClass( target, 'flounder--hidden' );
            this.refs.select    = target;

            let options = [], selectOptions = [];
            _slice.apply( target.children ).forEach( function( optionEl )
            {
                selectOptions.push( optionEl );
                options.push( {
                    text    : optionEl.innerHTML,
                    value   : optionEl.value
                } );
            } );

            this.options            = options;
            this.target             = target.parentNode;
            this.refs.selectOptions = selectOptions;

            select = this.refs.select;
            this.addClass( select, 'flounder--hidden' );
        }
        else
        {
            select = this.constructElement( { tagname : 'select', className : 'flounder--select--tag  flounder--hidden' } );
            wrapper.appendChild( select );
        }

        return select;
    }


    iosVersion()
    {

      if ( /iPad|iPhone|iPod/.test( navigator.platform ) )
      {
        if ( !!window.indexedDB ) { return '8+'; }
        if ( !!window.SpeechSynthesisUtterance ) { return '7'; }
        if ( !!window.webkitAudioContext ) { return '6'; }
        return '5-';
      }

      return false;
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
        let options = refs.options;

        if ( !!this.isIos && ( !this.multipleTags || !this.multiple )  )
        {
            let sel     = refs.select;
            this.removeClass( sel, 'flounder--hidden' );
            this.addClass( sel, 'flounder--hidden--ios' );
        }


        let self    = this;
        var _divertTarget = function( e )
        {
            var index   = this.selectedIndex;
            var _e      = {
                target          : refs.options[ index ]
            };

            self.setSelectValue( _e );

            if ( !self.multiple )
            {
                self.toggleList( e, 'close' );
            }
        };




        refs.select.addEventListener( 'change', _divertTarget  );

        options.forEach( ( option, i ) =>
        {
            if ( option.tagName === 'DIV' )
            {
                option.addEventListener( 'click', this.clickSet );
            }
        } );

        refs.selected.addEventListener( 'click', this.toggleList );

        if ( props.search )
        {
            let search = refs.search;
            search.addEventListener( 'click', this.toggleList );
            search.addEventListener( 'keyup', this.fuzzySearch );
            search.addEventListener( 'focus', this.checkPlaceholder );
            search.addEventListener( 'blur', this.checkPlaceholder );
        }
    }


    /**
     * ## removeClass
     *
     * on the quest to nuke jquery, a wild helper function appears
     *
     * @param {DOMElement} _el target element
     * @param {String} _class class to remove
     *
     * @return _Void_
     */
    removeClass( _el, _class )
    {
        let _elClass        = _el.className;
        let _elClassLength  = _elClass.length;
        let _classLength    = _class.length;

        if ( _elClass.slice( 0, _classLength + 1 ) === _class + ' ' )
        {
            _el.className = _elClass.slice( _classLength + 1, _elClassLength );
        }

        if ( _elClass.slice( _elClassLength - _classLength - 1, _elClassLength ) === ' ' + _class )
        {
            _el.className = _elClass.slice( 0, _elClassLength - _classLength - 1 );
        }

        _el.className =  _el.className.trim();
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
        let refs            = this.refs;
        let select          = refs.select;
        let selected        = refs.selected;
        let target          = e.target;
        let index           = target.getAttribute( 'data-index' );
        select[ index ].selected = false;

        let selectedOptions = _slice.call( this.getSelectedOptions( select ) );

        this.removeClass( refs.options[ index ], 'flounder__option--selected--hidden' );

        let span = target.parentNode;
        span.parentNode.removeChild( span );

        if ( selectedOptions.length === 0 )
        {
            selected.innerHTML  = this._default.text;
            value               = this._default.value;
        }
        else
        {
            value = selectedOptions.map( function( option )
            {
                return option.value;
            } );
        }

        this.setTextMultiTagIndent();

        selected.setAttribute( 'data-value', value );

        if ( this.selectFunc )
        {
            this.selectFunc( e );
        }
    };


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
        select.removeEventListener( 'keyup', this.setSelectValue );
    }


    /**
     * ## removeSelectedClass
     *
     * removes the [[this.selectedClass]] from all options
     *
     * @return _Void_
     */
    removeSelectedClass( options )
    {
        options.forEach( ( _option, i ) =>
        {
            this.removeClass( _option, this.selectedClass );
        } );
    }


    /**
     * ## removeSelectedValue
     *
     * sets the selected property to false for all options
     *
     * @return _Void_
     */
    removeSelectedValue( options )
    {
        options.forEach( ( _option, i ) =>
        {
            this.refs.select[ i ].selected = false;
        } );
    }


    /**
     * ## scrollMultiple
     *
     * handles up and down scroll indicators on multi select boxes
     *
     * @param {Integer} _indexModifier +1 or 1
     *
     * @return _Void_
     */
    scrollMultiple( _indexModifier )
    {
        let options     = this.refs.options;
        let $options    = $( options );
        let $visible     = $options.filter( '*:not(.flounder--hidden,.flounder__option--selected--hidden)' );
        let $selected    = $visible.filter( '.flounder__multi--selected' );
        let selected;

        if ( _indexModifier === -26 ) // enter
        {
            $selected.removeClass( 'flounder__multi--selected' ).click();
        }
        else
        {
            if ( $visible.length !== 0 )
            {
                if ( $selected.length === 1 )
                {
                    let index = $selected.index() + _indexModifier;
                    $visible.removeClass( 'flounder__multi--selected' );
                    this.addClass( selected = $visible.get( index ), 'flounder__multi--selected' );
                }
                else
                {
                    selected = $visible.first().addClass( 'flounder__multi--selected' )[0];
                }

                this.scrollTo( selected );
            }
        }
    }


    /**
     * ## scrollTo
     *
     * checks if an option is visible and, if it is not, scrolls it into view
     *
     * @param {DOMElement} element element to check
     *
     *@return _Void_
     */
    scrollTo( element )
    {
        let parent      = element.parentNode.parentNode;
        let elHeight    = element.offsetHeight;
        let min         = parent.scrollTop;
        let max         = parent.scrollTop + parent.offsetHeight - element.offsetHeight;
        let pos         = element.offsetTop;

        if ( pos < min )
        {
            parent.scrollTop = pos  - ( elHeight * 0.5 );
        }
        else if ( pos > max )
        {
            parent.scrollTop = pos - parent.offsetHeight + ( elHeight * 1.5 );
        }
    }


    /**
     * ## setDefaultOption
     *
     * sets the initial default value
     *
     * @param {String or Number}    defaultProp         default passed from this.props
     * @param {Object}              options             this.props.options
     *
     * @return _Void_
     */
    setDefaultOption( defaultProp, options )
    {
        let _default = '';

        if ( typeof defaultProp === 'number' )
        {
            _default = options[ defaultProp ];
        }
        else if ( typeof defaultProp === 'string' )
        {
            _default = {
                text    : defaultProp,
                value   : defaultProp
            };
        }

        return _default;
    }


    /**
     * ## setPlatform
     *
     * sets the platform to osx or not osx for the sake of the multi select key
     *
     * @return _Void_
     */
    setPlatform()
    {
        let _osx = this.isOsx = window.navigator.platform.indexOf( 'Mac' ) === -1 ? false : true;

        this.isIos          = this.iosVersion();
        this.multiSelect    = _osx ? 'metaKey' : 'ctrlKey';
    }


    /**
     * ## setSelectArrows
     *
     * handles arrow key selection
     *
     * @param {Object} e event object
     *
     * @return _Void_
     */
    setSelectArrows( e )
    {
        let increment = 0;

        switch( e.keyCode )
        {
            case 13:
            case 27:
                this.toggleList( e );
                return;
            case 38:
                e.preventDefault();
                increment--;
                break;
            case 40:
                e.preventDefault();
                increment++;
                break;
            default:
                return;
        }

        if ( !!window.sidebar ) // ff
        {
            increment = 0;
        }

        let refs                = this.refs;
        let selectTag           = refs.select;
        let options             = refs.options;
        let optionsMaxIndex     = options.length - 1;
        let index               = selectTag.selectedIndex + increment;

        if ( index > optionsMaxIndex )
        {
            index = 0;
        }
        else if ( index < 0 )
        {
            index = optionsMaxIndex;
        }

        selectTag.selectedIndex = index;

        let optionClassName = options[ index ].className;

        if ( optionClassName.indexOf( 'flounder--hidden' ) !== -1 &&
             optionClassName.indexOf( 'flounder__option--selected--hidden' ) !== -1 )
        {
            this.setSelectArrows( e );
        }
    }


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
        let refs            = this.refs;
        let options         = refs.options;
        let select          = refs.select;
        let selectedClass   = this.selectedClass;
        let _addClass       = this.addClass;
        let _toggleClass    = this.toggleClass;

        let index, selectedOption;

        if ( e ) // click
        {
            if ( !this.multiple || ( this.multiple && !this.multipleTags && !e[ this.multiSelect ] ) )
            {
                this.removeSelectedClass( options );
                this.removeSelectedValue( options );
            }
            let target              = e.target;

            _toggleClass( target, selectedClass );
            index                   = target.getAttribute( 'data-index' );

            selectedOption          = refs.selectOptions[ index ];

            selectedOption.selected = selectedOption.selected === true ? false : true;
            selectedOption          = this.getSelectedOptions( select );
        }
        else // button press
        {
            if ( this.multiple )
            {
                obj.preventDefault();
                obj.stopPropagation();

                return false;
            }

            this.removeSelectedClass( options );

            selectedOption = options[ this.getSelectedOptions( select )[ 0 ].index ];
            _addClass( selectedOption, selectedClass );

            this.scrollTo( selectedOption );
        }

        this.displaySelected( refs.selected, refs );

        if ( this.selectFunc )
        {
            this.selectFunc( e );
        }
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
        let offset = this.defaultTextIndent;

        if ( search )
        {
            $( '.flounder__multiple--select--tag' ).each( ( i, e ) =>
            {
                offset += this.getActualWidth( e );
            } );

            search.style.textIndent = offset + 'px';
        }
    }


    /**
     * ## showElement
     *
     * remove 'flounder--hidden' from a given element
     *
     * @param {Object} _el element to show
     *
     * @return _Void_
     */
    showElement( _el )
    {
        this.removeClass( _el, 'flounder--hidden' );
    }


    /**
     * ## toggleClass
     *
     * in a world moving away from jquery, a wild helper function appears
     *
     * @param  {DOMElement} _el target to toggle class on
     * @param  {String} _class class to toggle on/off
     *
     * @return _Void_
     */
    toggleClass( _el, _class )
    {
        let _addClass       = this.addClass;
        let _removeClass    = this.removeClass;

        if ( _el.className.indexOf( _class ) !== -1 )
        {
            _removeClass( _el, _class );
        }
        else
        {
            _addClass( _el, _class );
        }
    }


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
        let isIos       = this.isIos

        if ( force === 'open' || force !== 'close' && optionsList.className.indexOf( 'flounder--hidden' ) !== -1 )
        {
            this.addSelectKeyListener();

            if ( !isIos || ( this.multipleTags === true && this.multiple === true ) )
            {
                this.showElement( optionsList );
                this.addClass( wrapper, 'open' );

                document.querySelector( 'html' ).addEventListener( 'click', this.catchBodyClick );
                document.querySelector( 'html' ).addEventListener( 'touchend', this.catchBodyClick );
            }

            if ( this.props.search )
            {
                refs.search.focus();
            }

            if ( this.openFunc )
            {
                this.openFunc( e );
            }
        }
        else if ( force === 'close' || optionsList.className.indexOf( 'flounder--hidden' ) === -1 )
        {
            this.hideElement( optionsList );
            this.removeSelectKeyListener();
            this.removeClass( wrapper, 'open' );

            document.querySelector( 'html' ).removeEventListener( 'click', this.catchBodyClick );
            document.querySelector( 'html' ).removeEventListener( 'touchend', this.catchBodyClick );

            if ( this.props.search )
            {
                this.fuzzySearchReset();
                refs.search.blur();
            }

            optionsList.blur();
            refs.optionsList.blur();
            refs.select.blur();

            if ( this.closeFunc )
            {
                this.closeFunc( e );
            }
        }
    }
}

if ( window )
{
    window.Flounder = Flounder;
}

export default Flounder;

