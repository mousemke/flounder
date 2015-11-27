
/* jshint globalstrict: true */
'use strict';

import React, { Component } from 'react';
import ReactDOM             from 'react-dom';
import Flounder             from './flounder.jsx';

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

        if ( this.componentDidMountFunc )
        {
            this.componentDidMountFunc();
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
     * <div class="flounder  multi-filter"><div class="flounder__option--selected--displayed" data-value="https://kraken.sociomantic.com/blog/category/external-media/"></div><div class="multi--tag--list" style="text-indent: 7px;"><span class="flounder__multiple--select--tag"><a class="flounder__multiple__tag__close" data-index="2"></a>External Media</span></div><div class="flounder__arrow"></div><div class="flounder__list-wrapper  flounder--hidden"><div class="flounder__list"><div class="flounder__option" data-index="0" data-value="https://kraken.sociomantic.com/blog/category/case-study/" data-cssclass="category">Case Study</div><div class="flounder__option" data-index="1" data-value="https://kraken.sociomantic.com/blog/category/events/" data-cssclass="category">Events</div><div class="flounder__option  flounder__option--selected--hidden" data-index="2" data-value="https://kraken.sociomantic.com/blog/category/external-media/" data-cssclass="category">External Media</div><div class="flounder__option" data-index="3" data-value="https://kraken.sociomantic.com/blog/category/general/" data-cssclass="category">General</div><div class="flounder__option" data-index="4" data-value="https://kraken.sociomantic.com/blog/category/infographic/" data-cssclass="category">Infographic</div><div class="flounder__option" data-index="5" data-value="https://kraken.sociomantic.com/blog/category/news/" data-cssclass="category">News</div><div class="flounder__option" data-index="6" data-value="https://kraken.sociomantic.com/blog/category/presentation/" data-cssclass="category">Presentation</div><div class="flounder__option" data-index="7" data-value="https://kraken.sociomantic.com/blog/category/press-release/" data-cssclass="category">Press Release</div><div class="flounder__option" data-index="8" data-value="https://kraken.sociomantic.com/blog/category/rtb-blog/" data-cssclass="category">RTB Blog</div><div class="flounder__option" data-index="9" data-value="https://kraken.sociomantic.com/blog/category/the-labs/" data-cssclass="category">The Labs</div><div class="flounder__option" data-index="10" data-value="https://kraken.sociomantic.com/blog/category/white-paper/" data-cssclass="category">White-Paper</div><div class="flounder__option" data-index="11" data-value="https://kraken.sociomantic.com/blog/category/whitepaper/" data-cssclass="category">Whitepaper</div><div class="flounder__option" data-index="12" data-value="tag/dream-team/" data-cssclass="tag">#dreamteam</div><div class="flounder__option" data-index="13" data-value="tag/agency/" data-cssclass="tag">agency</div><div class="flounder__option" data-index="14" data-value="tag/airlines/" data-cssclass="tag">airlines</div><div class="flounder__option" data-index="15" data-value="tag/asia-pacific/" data-cssclass="tag">APAC</div><div class="flounder__option" data-index="16" data-value="tag/beauty/" data-cssclass="tag">beauty</div><div class="flounder__option" data-index="17" data-value="tag/big-data/" data-cssclass="tag">big data</div><div class="flounder__option" data-index="18" data-value="tag/branding/" data-cssclass="tag">branding</div><div class="flounder__option" data-index="19" data-value="tag/brazil-russia-india-china/" data-cssclass="tag">BRIC</div><div class="flounder__option" data-index="20" data-value="tag/cee/" data-cssclass="tag">CEE</div><div class="flounder__option" data-index="21" data-value="tag/classifieds/" data-cssclass="tag">classifieds</div><div class="flounder__option" data-index="22" data-value="tag/conference/" data-cssclass="tag">conference</div><div class="flounder__option" data-index="23" data-value="tag/crm/" data-cssclass="tag">CRM</div><div class="flounder__option" data-index="24" data-value="tag/cross-device/" data-cssclass="tag">cross-device</div><div class="flounder__option" data-index="25" data-value="tag/customer-lifetime-value/" data-cssclass="tag">customer lifetime value</div><div class="flounder__option" data-index="26" data-value="tag/demand-side-platform/" data-cssclass="tag">demand-side platform</div><div class="flounder__option" data-index="27" data-value="tag/digital/" data-cssclass="tag">digital</div><div class="flounder__option" data-index="28" data-value="tag/digital-marketing/" data-cssclass="tag">digital marketing</div><div class="flounder__option" data-index="29" data-value="tag/digital-strategy/" data-cssclass="tag">digital strategy</div><div class="flounder__option" data-index="30" data-value="tag/display-advertising/" data-cssclass="tag">display advertising</div><div class="flounder__option" data-index="31" data-value="tag/dlang/" data-cssclass="tag">dlang</div><div class="flounder__option" data-index="32" data-value="tag/dynamic-creative-optimization/" data-cssclass="tag">dynamic creative optimization</div><div class="flounder__option" data-index="33" data-value="tag/ecommerce/" data-cssclass="tag">ecommerce</div><div class="flounder__option" data-index="34" data-value="tag/europe-middle-east-africa/" data-cssclass="tag">EMEA</div><div class="flounder__option" data-index="35" data-value="tag/facebook-exchange/" data-cssclass="tag">Facebook Exchange</div><div class="flounder__option" data-index="36" data-value="tag/fashion/" data-cssclass="tag">fashion</div><div class="flounder__option" data-index="37" data-value="tag/finance/" data-cssclass="tag">finance</div><div class="flounder__option" data-index="38" data-value="tag/first-party-data/" data-cssclass="tag">first-party data</div><div class="flounder__option" data-index="39" data-value="tag/growth-stories/" data-cssclass="tag">growth stories</div><div class="flounder__option" data-index="40" data-value="tag/holiday/" data-cssclass="tag">holiday</div><div class="flounder__option" data-index="41" data-value="tag/html5/" data-cssclass="tag">HTML5</div><div class="flounder__option" data-index="42" data-value="tag/latin-america/" data-cssclass="tag">LATAM</div><div class="flounder__option" data-index="43" data-value="tag/loyalty/" data-cssclass="tag">loyalty</div><div class="flounder__option" data-index="44" data-value="tag/mariusz-pawelczyk/" data-cssclass="tag">Mariusz Pawelczyk</div><div class="flounder__option" data-index="45" data-value="tag/mobile/" data-cssclass="tag">mobile</div><div class="flounder__option" data-index="46" data-value="tag/nordics/" data-cssclass="tag">Nordics</div><div class="flounder__option" data-index="47" data-value="tag/north-america/" data-cssclass="tag">North America</div><div class="flounder__option" data-index="48" data-value="tag/performance-marketing/" data-cssclass="tag">performance marketing</div><div class="flounder__option" data-index="49" data-value="tag/personalization/" data-cssclass="tag">personalization</div><div class="flounder__option" data-index="50" data-value="tag/presentations/" data-cssclass="tag">presentations</div><div class="flounder__option" data-index="51" data-value="tag/programmatic/" data-cssclass="tag">programmatic</div><div class="flounder__option" data-index="52" data-value="tag/programmatic-display/" data-cssclass="tag">programmatic display</div><div class="flounder__option" data-index="53" data-value="tag/real-time-bidding/" data-cssclass="tag">real-time bidding</div><div class="flounder__option" data-index="54" data-value="tag/retail/" data-cssclass="tag">retail</div><div class="flounder__option" data-index="55" data-value="tag/retail-and-shopping/" data-cssclass="tag">retail and shopping</div><div class="flounder__option" data-index="56" data-value="tag/retargeting/" data-cssclass="tag">retargeting</div><div class="flounder__option" data-index="57" data-value="tag/romania/" data-cssclass="tag">Romania</div><div class="flounder__option" data-index="58" data-value="tag/segmentation/" data-cssclass="tag">segmentation</div><div class="flounder__option" data-index="59" data-value="tag/shopping-clubs/" data-cssclass="tag">shopping clubs</div><div class="flounder__option" data-index="60" data-value="tag/sociomantic/" data-cssclass="tag">Sociomantic</div><div class="flounder__option" data-index="61" data-value="tag/software-development/" data-cssclass="tag">software development</div><div class="flounder__option" data-index="62" data-value="tag/startup/" data-cssclass="tag">startup</div><div class="flounder__option" data-index="63" data-value="tag/stream-technology/" data-cssclass="tag">stream technology</div><div class="flounder__option" data-index="64" data-value="tag/tag1/" data-cssclass="tag">tag1</div><div class="flounder__option" data-index="65" data-value="tag/tech-talk/" data-cssclass="tag">tech talk</div><div class="flounder__option" data-index="66" data-value="tag/telecommunications/" data-cssclass="tag">telecom</div><div class="flounder__option" data-index="67" data-value="tag/trade-show/" data-cssclass="tag">trade show</div><div class="flounder__option" data-index="68" data-value="tag/transparency/" data-cssclass="tag">transparency</div><div class="flounder__option" data-index="69" data-value="tag/travel/" data-cssclass="tag">travel</div><div class="flounder__option" data-index="70" data-value="tag/tutorial/" data-cssclass="tag">tutorial</div><div class="flounder__option" data-index="71" data-value="tag/web-development/" data-cssclass="tag">web development</div><div class="flounder__option" data-index="72" data-value="https://kraken.sociomantic.com/blog/2015/08/" data-cssclass="month"> August 2015 </div><div class="flounder__option" data-index="73" data-value="https://kraken.sociomantic.com/blog/2015/03/" data-cssclass="month"> March 2015 </div><div class="flounder__option" data-index="74" data-value="https://kraken.sociomantic.com/blog/2015/02/" data-cssclass="month"> February 2015 </div><div class="flounder__option" data-index="75" data-value="https://kraken.sociomantic.com/blog/2014/11/" data-cssclass="month"> November 2014 </div><div class="flounder__option" data-index="76" data-value="https://kraken.sociomantic.com/blog/2014/05/" data-cssclass="month"> May 2014 </div><div class="flounder__option" data-index="77" data-value="https://kraken.sociomantic.com/blog/2014/04/" data-cssclass="month"> April 2014 </div><div class="flounder__option" data-index="78" data-value="https://kraken.sociomantic.com/blog/2014/02/" data-cssclass="month"> February 2014 </div><div class="flounder__option" data-index="79" data-value="https://kraken.sociomantic.com/blog/2014/01/" data-cssclass="month"> January 2014 </div><div class="flounder__option" data-index="80" data-value="https://kraken.sociomantic.com/blog/2013/12/" data-cssclass="month"> December 2013 </div><div class="flounder__option" data-index="81" data-value="https://kraken.sociomantic.com/blog/2013/11/" data-cssclass="month"> November 2013 </div><div class="flounder__option" data-index="82" data-value="https://kraken.sociomantic.com/blog/2013/10/" data-cssclass="month"> October 2013 </div><div class="flounder__option" data-index="83" data-value="https://kraken.sociomantic.com/blog/2013/09/" data-cssclass="month"> September 2013 </div><div class="flounder__option" data-index="84" data-value="https://kraken.sociomantic.com/blog/2013/08/" data-cssclass="month"> August 2013 </div><div class="flounder__option" data-index="85" data-value="https://kraken.sociomantic.com/blog/2013/06/" data-cssclass="month"> June 2013 </div><div class="flounder__option" data-index="86" data-value="https://kraken.sociomantic.com/blog/2013/05/" data-cssclass="month"> May 2013 </div><div class="flounder__option" data-index="87" data-value="https://kraken.sociomantic.com/blog/2013/04/" data-cssclass="month"> April 2013 </div><div class="flounder__option" data-index="88" data-value="https://kraken.sociomantic.com/blog/2013/03/" data-cssclass="month"> March 2013 </div><div class="flounder__option" data-index="89" data-value="https://kraken.sociomantic.com/blog/2013/02/" data-cssclass="month"> February 2013 </div><div class="flounder__option" data-index="90" data-value="https://kraken.sociomantic.com/blog/2013/01/" data-cssclass="month"> January 2013 </div><div class="flounder__option" data-index="91" data-value="https://kraken.sociomantic.com/blog/2012/12/" data-cssclass="month"> December 2012 </div><div class="flounder__option" data-index="92" data-value="https://kraken.sociomantic.com/blog/2012/11/" data-cssclass="month"> November 2012 </div><div class="flounder__option" data-index="93" data-value="https://kraken.sociomantic.com/blog/2012/10/" data-cssclass="month"> October 2012 </div><div class="flounder__option" data-index="94" data-value="https://kraken.sociomantic.com/blog/2012/09/" data-cssclass="month"> September 2012 </div><div class="flounder__option" data-index="95" data-value="https://kraken.sociomantic.com/blog/2012/06/" data-cssclass="month"> June 2012 </div><div class="flounder__option" data-index="96" data-value="https://kraken.sociomantic.com/blog/2012/02/" data-cssclass="month"> February 2012 </div><div class="flounder__option" data-index="97" data-value="https://kraken.sociomantic.com/blog/2012/01/" data-cssclass="month"> January 2012 </div><div class="flounder__option" data-index="98" data-value="https://kraken.sociomantic.com/blog/2011/10/" data-cssclass="month"> October 2011 </div><div class="flounder__option" data-index="99" data-value="https://kraken.sociomantic.com/blog/2011/09/" data-cssclass="month"> September 2011 </div><div class="flounder__option" data-index="100" data-value="https://kraken.sociomantic.com/blog/2011/06/" data-cssclass="month"> June 2011 </div><div class="flounder__option" data-index="101" data-value="https://kraken.sociomantic.com/blog/2011/05/" data-cssclass="month"> May 2011 </div><div class="flounder__option" data-index="102" data-value="https://kraken.sociomantic.com/blog/2011/04/" data-cssclass="month"> April 2011 </div><div class="flounder__option" data-index="103" data-value="https://kraken.sociomantic.com/blog/2011/03/" data-cssclass="month"> March 2011 </div><div class="flounder__option" data-index="104" data-value="https://kraken.sociomantic.com/blog/2011/02/" data-cssclass="month"> February 2011 </div><div class="flounder__option" data-index="105" data-value="https://kraken.sociomantic.com/blog/2011/01/" data-cssclass="month"> January 2011 </div><div class="flounder__option" data-index="106" data-value="https://kraken.sociomantic.com/blog/2010/12/" data-cssclass="month"> December 2010 </div><div class="flounder__option" data-index="107" data-value="https://kraken.sociomantic.com/blog/2010/11/" data-cssclass="month"> November 2010 </div><div class="flounder__option" data-index="108" data-value="https://kraken.sociomantic.com/blog/2010/10/" data-cssclass="month"> October 2010 </div><div class="flounder__option" data-index="109" data-value="https://kraken.sociomantic.com/blog/2010/09/" data-cssclass="month"> September 2010 </div><div class="flounder__option" data-index="110" data-value="https://kraken.sociomantic.com/blog/2010/08/" data-cssclass="month"> August 2010 </div><div class="flounder__option" data-index="111" data-value="https://kraken.sociomantic.com/blog/2010/07/" data-cssclass="month"> July 2010 </div><div class="flounder__option" data-index="112" data-value="https://kraken.sociomantic.com/blog/2010/06/" data-cssclass="month"> June 2010 </div><div class="flounder__option" data-index="113" data-value="https://kraken.sociomantic.com/blog/2010/05/" data-cssclass="month"> May 2010 </div><div class="flounder__option" data-index="114" data-value="https://kraken.sociomantic.com/blog/2010/04/" data-cssclass="month"> April 2010 </div><div class="flounder__option" data-index="115" data-value="https://kraken.sociomantic.com/blog/2010/01/" data-cssclass="month"> January 2010 </div><div class="flounder__option" data-index="116" data-value="https://kraken.sociomantic.com/blog/author/Brian_Ferrario/" data-cssclass="author">Brian Ferrario</div><div class="flounder__option" data-index="117" data-value="https://kraken.sociomantic.com/blog/author/Erika_Soliven/" data-cssclass="author">Erika Soliven</div><div class="flounder__option" data-index="118" data-value="https://kraken.sociomantic.com/blog/author/Jason_Kelly/" data-cssclass="author">Jason Kelly</div><div class="flounder__option" data-index="119" data-value="https://kraken.sociomantic.com/blog/author/Laura/" data-cssclass="author">Laura</div><div class="flounder__option" data-index="120" data-value="https://kraken.sociomantic.com/blog/author/Leandro_Lucarella/" data-cssclass="author">Leandro Lucarella</div><div class="flounder__option" data-index="121" data-value="https://kraken.sociomantic.com/blog/author/Lothar_Krause/" data-cssclass="author">Lothar Krause</div><div class="flounder__option" data-index="122" data-value="https://kraken.sociomantic.com/blog/author/Sarah_Joy_Murray/" data-cssclass="author">Sarah Joy Murray</div><div class="flounder__option" data-index="123" data-value="https://kraken.sociomantic.com/blog/author/Sonja_Dreher/" data-cssclass="author">Sonja Dreher</div><div class="flounder__option" data-index="124" data-value="https://kraken.sociomantic.com/blog/author/Thomas_Brandhoff/" data-cssclass="author">Thomas Brandhoff</div><div class="flounder__option" data-index="125" data-value="https://kraken.sociomantic.com/blog/author/Thomas_Nicolai/" data-cssclass="author">Thomas Nicolai</div><div class="flounder__option" data-index="126" data-value="https://kraken.sociomantic.com/blog/author/david/" data-cssclass="author">david</div><div class="flounder__option" data-index="127" data-value="https://kraken.sociomantic.com/blog/author/dilkrom/" data-cssclass="author">dilkrom</div><div class="flounder__option" data-index="128" data-value="https://kraken.sociomantic.com/blog/author/gavinnorman/" data-cssclass="author">gavinnorman</div><div class="flounder__option" data-index="129" data-value="https://kraken.sociomantic.com/blog/author/josh/" data-cssclass="author">josh</div><div class="flounder__option" data-index="130" data-value="https://kraken.sociomantic.com/blog/author/kristo/" data-cssclass="author">kristo</div><div class="flounder__option" data-index="131" data-value="https://kraken.sociomantic.com/blog/author/lars/" data-cssclass="author">lars</div><div class="flounder__option" data-index="132" data-value="https://kraken.sociomantic.com/blog/author/maciej/" data-cssclass="author">maciej</div><div class="flounder__option" data-index="133" data-value="https://kraken.sociomantic.com/blog/author/mouse/" data-cssclass="author">mouse</div></div></div><input type="text" class="flounder__input--search" style="text-indent: 109px;"></div>
     */
    render( e )
    {
        this.bindThis();

        this.initialzeOptions();

        if ( this.initFunc )
        {
            this.initFunc();
        }

        let optionsCollection       = [];
        let selectOptionsCollection = [];

        let escapeHTML      = this.escapeHTML;
        let props           = this.props;
        let options         = this.options = this.prepOptions( props.options || this.options );
        let handleChange    = this.handleChange.bind( this );
        let multiple        = props.multiple;
        let _default        = this._default = this.setDefaultOption( props._default || this._default, options );

        let _stateModifier  = this.state.modifier;
        _stateModifier = _stateModifier.length > 0 ? '--' + _stateModifier : '';

        return (
            <div ref="wrapper" className="flounder-wrapper  flounder__input--select">
                <div ref="flounder" tabIndex="0" className={'flounder' + ( props.className ? '  ' + props.className : '' )}>
                    <div ref="selected" className="flounder__option--selected--displayed" data-value={_default.value}>
                        {_default.text}
                    </div>
                    { props.multiple ? <div ref="multiTagWrapper" className="multi--tag--list"  multiple></div> : null }
                    <div ref="arrow" className="flounder__arrow"></div>
                    <div ref="optionsListWrapper" className="flounder__list-wrapper  flounder--hidden">
                        <div ref="optionsList" className="flounder__list">
                        {
                            options.map( ( _option, i ) =>
                            {
                                let extraClass = i === props._default ? '  flounder__option--selected' : '';
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
                        let extraClass  = i === _default ? '  ' + this.selectedClass : '';

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

FlounderReact.prototype.addClass                = Flounder.prototype.addClass;
FlounderReact.prototype.addSearch               = Flounder.prototype.addSearch;
FlounderReact.prototype.addSelectKeyListener    = Flounder.prototype.addSelectKeyListener;
FlounderReact.prototype.attachAttributes        = Flounder.prototype.attachAttributes;
FlounderReact.prototype.checkClickTarget        = Flounder.prototype.checkClickTarget;
FlounderReact.prototype.componentWillUnmount    = Flounder.prototype.componentWillUnmount;
FlounderReact.prototype.displaySelected         = Flounder.prototype.displaySelected;
FlounderReact.prototype.escapeHTML              = Flounder.prototype.escapeHTML;
FlounderReact.prototype.fuzzySearchReset        = Flounder.prototype.fuzzySearchReset;
FlounderReact.prototype.getActualWidth          = Flounder.prototype.getActualWidth;
FlounderReact.prototype.getSelectedOptions      = Flounder.prototype.getSelectedOptions;
FlounderReact.prototype.hideElement             = Flounder.prototype.hideElement;
FlounderReact.prototype.initialzeOptions        = Flounder.prototype.initialzeOptions;
FlounderReact.prototype.iosVersion              = Flounder.prototype.iosVersion;
FlounderReact.prototype.onRender                = Flounder.prototype.onRender;
FlounderReact.prototype.removeClass             = Flounder.prototype.removeClass;
FlounderReact.prototype.removeSelectKeyListener = Flounder.prototype.removeSelectKeyListener;
FlounderReact.prototype.removeSelectedClass     = Flounder.prototype.removeSelectedClass;
FlounderReact.prototype.removeSelectedValue     = Flounder.prototype.removeSelectedValue;
FlounderReact.prototype.scrollMultiple          = Flounder.prototype.scrollMultiple;
FlounderReact.prototype.scrollTo                = Flounder.prototype.scrollTo;
FlounderReact.prototype.setDefaultOption        = Flounder.prototype.setDefaultOption;
FlounderReact.prototype.setPlatform             = Flounder.prototype.setPlatform;
FlounderReact.prototype.setTextMultiTagIndent   = Flounder.prototype.setTextMultiTagIndent;
FlounderReact.prototype.showElement             = Flounder.prototype.showElement;


if ( window )
{
    window.FlounderReact = FlounderReact;
}

export default { React, Component, ReactDOM, FlounderReact, Flounder };

