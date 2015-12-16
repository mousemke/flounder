/*!
 * Flounder JavaScript Styleable Selectbox v0.2.1
 * https://github.com/sociomantic/flounder
 *
 * Copyright 2015 Sociomantic Labs and other contributors
 * Released under the MIT license
 * https://github.com/sociomantic/flounder/license
 *
 * Date: Wed Dec 16 2015
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var classes = {
    ARROW: 'flounder__arrow',
    DESCRIPTION: 'flounder__option--description',
    DISABLED: 'flounder__disabled',
    DISABLED_OPTION: 'flounder__disabled--option',
    HIDDEN: 'flounder--hidden',
    HIDDEN_IOS: 'flounder--hidden--ios',
    LIST: 'flounder__list',
    MAIN: 'flounder',
    MAIN_WRAPPER: 'flounder--wrapper  flounder__input--select',
    MULTI_TAG_LIST: 'flounder__multi--tag--list',
    MULTIPLE_SELECT_TAG: 'flounder__multiple--select--tag',
    MULTIPLE_TAG_CLOSE: 'flounder__multiple__tag__close',
    OPTION: 'flounder__option',
    OPTION_TAG: 'flounder--option--tag',
    OPTIONS_WRAPPER: 'flounder__list--wrapper',
    SELECTED: 'flounder__option--selected',
    SELECTED_HIDDEN: 'flounder__option--selected--hidden',
    SELECTED_DISPLAYED: 'flounder__option--selected--displayed',
    SEARCH: 'flounder__input--search',
    SEARCH_HIDDEN: 'flounder--search--hidden',
    SELECT_TAG: 'flounder--select--tag'
};

exports['default'] = classes;
module.exports = exports['default'];

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var defaults = {
    classes: {
        flounder: '',
        hidden: 'flounder--hidden',
        selected: 'flounder__option--selected',
        wrapper: ''
    },
    defaultTextIndent: 0,
    defaultValue: '',
    multiple: false,
    multipleTags: true,
    multipleMessage: '(Multiple Items Selected)',
    onClose: function onClose() {},
    onComponentDidMount: function onComponentDidMount() {},
    onInit: function onInit() {},
    onOpen: function onOpen() {},
    onSelect: function onSelect() {},
    options: [],
    search: false
};

exports['default'] = defaults;
module.exports = exports['default'];

},{}],3:[function(require,module,exports){

/* jshint globalstrict: true */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _defaults = require('./defaults');

var _defaults2 = _interopRequireDefault(_defaults);

var _classes2 = require('./classes');

var _classes3 = _interopRequireDefault(_classes2);

var Flounder = (function () {
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

    function Flounder(target, props) {
        var _this = this;

        _classCallCheck(this, Flounder);

        this.constructElement = function (_elObj) {
            var _el = document.createElement(_elObj.tagname || 'div');

            _this.attachAttributes(_el, _elObj);

            return _el;
        };

        if (target && target.length !== 0) {
            if (target.jquery) {
                return target.map(function (i, _el) {
                    return new _this.constructor(_el, props);
                });
            } else if (target.isMicrobe) {
                return target.map(function (_el) {
                    return new _this.constructor(_el, props);
                });
            }

            this.props = props;
            target = target.nodeType === 1 ? target : document.querySelector(target);

            this.originalTarget = target;

            if (target.tagName === 'INPUT') {
                this.addClass(target, _classes3['default'].HIDDEN);
                target.tabIndex = -1;
                target = target.parentNode;
            }

            this.target = target;

            this.bindThis();

            this.initialzeOptions();

            this.onInit();

            this.buildDom();

            this.setPlatform();

            this.onRender();

            this.onComponentDidMount();

            this.refs.select.flounder = this.refs.selected.flounder = this.target.flounder = this;

            return this;
        } else if (!target && !props) {
            return this.constructor;
        }
    }

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

    _createClass(Flounder, [{
        key: 'addClass',
        value: function addClass(_el, _class) {
            var _elClass = _el.className;
            var _elClassLength = _elClass.length;

            if (!this.hasClass(_el, _class) && _elClass.slice(0, _class.length + 1) !== _class + ' ' && _elClass.slice(_elClassLength - _class.length - 1, _elClassLength) !== ' ' + _class) {
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
    }, {
        key: 'addOptionDescription',
        value: function addOptionDescription(_el, text) {
            var _e = document.createElement('div');
            _e.innerHTML = text;
            _e.className = _classes3['default'].DESCRIPTION;
            _el.appendChild(_e);
        }

        /**
         * ## addOptionsListeners
         *
         * adds listeners to the options
         *
         * @return _Void_
         */
    }, {
        key: 'addOptionsListeners',
        value: function addOptionsListeners() {
            var _this2 = this;

            this.refs.options.forEach(function (_option, i) {
                if (_option.tagName === 'DIV') {
                    _option.addEventListener('click', _this2.clickSet);
                }
            });
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
    }, {
        key: 'addSearch',
        value: function addSearch(flounder) {
            if (this.props.search) {
                var search = this.constructElement({
                    tagname: 'input',
                    type: 'text',
                    className: _classes3['default'].SEARCH
                });
                flounder.appendChild(search);

                return search;
            }

            return false;
        }
    }, {
        key: 'addSelectKeyListener',

        /**
         * ## addSelectKeyListener
         *
         * adds a listener to the selectbox to allow for seeking through the native
         * selectbox on keypress
         *
         * @return _Void_
         */
        value: function addSelectKeyListener() {
            var select = this.refs.select;
            select.addEventListener('keyup', this.setSelectValue);
            select.addEventListener('keydown', this.setKeypress);
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
    }, {
        key: 'attachAttributes',
        value: function attachAttributes(_el, _elObj) {
            for (var att in _elObj) {
                if (att.indexOf('data-') !== -1) {
                    _el.setAttribute(att, _elObj[att]);
                } else {
                    _el[att] = _elObj[att];
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
    }, {
        key: 'bindThis',
        value: function bindThis() {
            this.addClass = this.addClass.bind(this);
            this.attachAttributes = this.attachAttributes.bind(this);
            this.catchBodyClick = this.catchBodyClick.bind(this);
            this.checkClickTarget = this.checkClickTarget.bind(this);
            this.checkFlounderKeypress = this.checkFlounderKeypress.bind(this);
            this.checkPlaceholder = this.checkPlaceholder.bind(this);
            this.clickSet = this.clickSet.bind(this);
            this.displayMultipleTags = this.displayMultipleTags.bind(this);
            this.fuzzySearch = this.fuzzySearch.bind(this);
            this.removeMultiTag = this.removeMultiTag.bind(this);
            this.setKeypress = this.setKeypress.bind(this);
            this.setSelectValue = this.setSelectValue.bind(this);
            this.toggleClass = this.toggleClass.bind(this);
            this.toggleList = this.toggleList.bind(this);
        }

        /**
         * ## buildDom
         *
         * builds flounder
         *
         * @return _Void_
         */
    }, {
        key: 'buildDom',
        value: function buildDom() {
            this.refs = {};

            var constructElement = this.constructElement;

            var wrapperClass = _classes3['default'].MAIN_WRAPPER;
            var wrapper = constructElement({ className: this.wrapperClass ? wrapperClass + ' ' + this.wrapperClass : wrapperClass });
            var flounderClass = _classes3['default'].MAIN;
            var flounder = constructElement({ className: this.flounderClass ? flounderClass + '  ' + this.flounderClass : flounderClass });

            flounder.tabIndex = 0;
            wrapper.appendChild(flounder);

            var select = this.initSelectBox(wrapper);
            select.tabIndex = -1;

            if (this.multiple === true) {
                select.setAttribute('multiple', '');
            }

            var _options = this.options;

            var defaultValue = this.defaultValue = this.setDefaultOption(this.defaultValue, _options);

            var selected = constructElement({ className: _classes3['default'].SELECTED_DISPLAYED,
                'data-value': defaultValue.value, 'data-index': defaultValue.index || -1 });
            selected.innerHTML = defaultValue.text;

            var multiTagWrapper = this.props.multiple ? constructElement({ className: _classes3['default'].MULTI_TAG_LIST }) : null;

            if (multiTagWrapper !== null) {
                multiTagWrapper.style.textIndent = this.defaultTextIndent + 'px';
            }

            var arrow = constructElement({ className: _classes3['default'].ARROW });
            var optionsListWrapper = constructElement({ className: _classes3['default'].OPTIONS_WRAPPER + '  ' + _classes3['default'].HIDDEN });
            var optionsList = constructElement({ className: _classes3['default'].LIST });
            optionsListWrapper.appendChild(optionsList);

            [selected, multiTagWrapper, arrow, optionsListWrapper].forEach(function (_el) {
                if (_el) {
                    flounder.appendChild(_el);
                }
            });

            var search = this.addSearch(flounder);

            var _buildOptions = this.buildOptions(defaultValue, _options, optionsList, select);

            var _buildOptions2 = _slicedToArray(_buildOptions, 2);

            var options = _buildOptions2[0];
            var selectOptions = _buildOptions2[1];

            this.target.appendChild(wrapper);

            this.refs = { wrapper: wrapper, flounder: flounder, selected: selected, arrow: arrow, optionsListWrapper: optionsListWrapper,
                search: search, multiTagWrapper: multiTagWrapper, optionsList: optionsList, select: select, options: options, selectOptions: selectOptions };
        }

        /**
         * ## buildOptions
         *
         * builds both the div and select based options. will skip the select box
         * if it already exists
         *
         * @param {Mixed} defaultValue default entry (string or number)
         * @param {Array} _options array with optino information
         * @param {Object} optionsList reference to the div option wrapper
         * @param {Object} select reference to the select box
         *
         * @return _Array_ refs to both container elements
         */
    }, {
        key: 'buildOptions',
        value: function buildOptions(defaultValue, _options, optionsList, select) {
            var _this3 = this;

            _options = _options || [];
            var options = [];
            var selectOptions = [];
            var constructElement = this.constructElement;
            var addOptionDescription = this.addOptionDescription;

            _options.forEach(function (_option, i) {
                if (typeof _option !== 'object') {
                    _option = {
                        text: _option,
                        value: _option
                    };
                }
                _option.index = i;

                var escapedText = _this3.escapeHTML(_option.text);
                var extraClass = i === defaultValue.index ? '  ' + _this3.selectedClass : '';

                var res = {
                    className: _classes3['default'].OPTION + extraClass,
                    'data-index': i
                };

                for (var _o in _option) {
                    if (_o !== 'text' && _o !== 'description') {
                        res[_o] = _option[_o];
                    }
                }

                options[i] = constructElement(res);

                options[i].innerHTML = escapedText;
                optionsList.appendChild(options[i]);

                var description = _option.description;

                if (description) {
                    addOptionDescription(options[i], description);
                }

                var uniqueExtraClass = _option.extraClass;

                if (uniqueExtraClass) {
                    options[i].className += '  ' + uniqueExtraClass;
                }

                if (!_this3.refs.select) {
                    selectOptions[i] = constructElement({ tagname: 'option',
                        className: _classes3['default'].OPTION_TAG,
                        value: _option.value });
                    selectOptions[i].innerHTML = escapedText;
                    select.appendChild(selectOptions[i]);

                    if (i === defaultValue.index) {
                        selectOptions[i].selected = true;
                    }
                } else {
                    var selectChild = select.children[i];

                    selectOptions[i] = selectChild;
                    selectChild.setAttribute('value', selectChild.value);
                }

                if (selectOptions[i].getAttribute('disabled')) {
                    _this3.addClass(options[i], _classes3['default'].DISABLED_OPTION);
                }
            });

            return [options, selectOptions];
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
    }, {
        key: 'catchBodyClick',
        value: function catchBodyClick(e) {
            if (!this.checkClickTarget(e)) {
                this.toggleList(e);
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
    }, {
        key: 'checkClickTarget',
        value: function checkClickTarget(e, target) {
            target = target || this.refs.options[e.target.getAttribute('data-index')] || e.target;

            if (target === document) {
                return false;
            } else if (target === this.refs.flounder) {
                return true;
            }

            return this.checkClickTarget(e, target.parentNode);
        }

        /**
         * ## checkSelect
         *
         * checks if a keypress is a selection
         */
    }, {
        key: 'checkSelect',
        value: function checkSelect(e) {
            if (!this.toggleList.justOpened) {
                switch (e.keyCode) {
                    case 13:
                    case 27:
                    case 32:
                    case 38:
                    case 40:
                        return true;
                }
            } else {
                this.toggleList.justOpened = false;
            }

            return false;
        }

        /**
         * ## checkFlounderKeypress
         *
         * checks flounder focused keypresses and filters all but space and enter
         *
         * @return _Void_
         */
    }, {
        key: 'checkFlounderKeypress',
        value: function checkFlounderKeypress(e) {
            if (e.keyCode === 13 || e.keyCode === 32) {
                e.preventDefault();
                this.toggleList(e);
            }
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
    }, {
        key: 'checkPlaceholder',
        value: function checkPlaceholder(e) {
            var type = e.type;
            var refs = this.refs;

            if (type === 'focus') {
                refs.selected.innerHTML = '';
            } else {
                if (refs.multiTagWrapper && refs.multiTagWrapper.children.length === 0) {
                    this.refs.selected.innerHTML = this.defaultValue.text;
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
    }, {
        key: 'clickSet',
        value: function clickSet(e) {
            this.setSelectValue({}, e);

            if (!this.multiple || !e[this.multiSelect]) {
                this.toggleList(e);
            }
        }

        /**
         * ## componentWillUnmount
         *
         * on unmount, removes events
         *
         * @return _Void_
         */
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            var props = this.props;
            var refs = this.refs;

            var _events = props.events;
            var _div = refs.flounder;

            for (var _event in _events) {
                _div.removeEventListener(_event, _events[_event]);
            }

            this.removeOptionsListeners();

            refs.selected.removeEventListener('click', this.toggleList);

            if (props.search) {
                var search = refs.search;
                search.removeEventListener('click', this.toggleList);
                search.removeEventListener('keyup', this.fuzzySearch);
            }
        }

        /**
         * ## constructElement
         *
         * @param {Object} _elObj object carrying properties to transfer
         *
         * @return _Element_
         */
    }, {
        key: 'destroy',

        /**
         * ## destroy
         *
         * removes flounder and all it's events from the dom
         *
         * @return _Void_
         */
        value: function destroy() {
            this.componentWillUnmount();
            var originalTarget = this.originalTarget;

            if (originalTarget.tagName === 'INPUT' || originalTarget.tagName === 'SELECT') {
                var target = originalTarget.nextElementSibling;
                target.parentNode.removeChild(target);
                originalTarget.tabIndex = 0;
                this.removeClass(originalTarget, _classes3['default'].HIDDEN);
            } else {
                var target = this.target;
                target.innerHTML = '';
            }
        }
    }, {
        key: 'disable',
        value: function disable(bool) {
            var refs = this.refs;
            var flounder = refs.flounder;
            var selected = refs.selected;

            if (bool) {
                refs.flounder.removeEventListener('keydown', this.checkFlounderKeypress);
                refs.selected.removeEventListener('click', this.toggleList);
                this.addClass(selected, _classes3['default'].DISABLED);
                this.addClass(flounder, _classes3['default'].DISABLED);
            } else {
                refs.flounder.addEventListener('keydown', this.checkFlounderKeypress);
                refs.selected.addEventListener('click', this.toggleList);
                this.removeClass(selected, _classes3['default'].DISABLED);
                this.removeClass(flounder, _classes3['default'].DISABLED);
            }
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
    }, {
        key: 'displayMultipleTags',
        value: function displayMultipleTags(selectedOptions, multiTagWrapper) {
            var _span = undefined,
                _a = undefined;

            var removeMultiTag = this.removeMultiTag;

            Array.prototype.slice.call(multiTagWrapper.children).forEach(function (el) {
                el.firstChild.removeEventListener('click', removeMultiTag);
            });

            multiTagWrapper.innerHTML = '';

            selectedOptions.forEach(function (option) {
                _span = document.createElement('span');
                _span.className = _classes3['default'].MULTIPLE_SELECT_TAG;

                _a = document.createElement('a');
                _a.className = _classes3['default'].MULTIPLE_TAG_CLOSE;
                _a.setAttribute('data-index', option.index);

                _span.appendChild(_a);

                _span.innerHTML += option.innerHTML;

                multiTagWrapper.appendChild(_span);
            });

            this.setTextMultiTagIndent();

            Array.prototype.slice.call(multiTagWrapper.children).forEach(function (el) {
                el.firstChild.addEventListener('click', removeMultiTag);
            });
        }

        /**
         * ## displaySelected
         *
         * formats and displays the chosen options
         *
         * @param {DOMElement} selected display area for the selected option(s)
         * @param {Object} refs element references
          */
    }, {
        key: 'displaySelected',
        value: function displaySelected(selected, refs) {
            console.log(this);
            var value = [];
            var index = -1;

            var selectedOption = this.getSelectedOptions();

            var selectedLength = selectedOption.length;

            if (!this.multiple || !this.multipleTags && selectedLength === 1) {
                index = selectedOption[0].index;
                selected.innerHTML = selectedOption[0].innerHTML;
                value = selectedOption[0].value;
            } else if (selectedLength === 0) {
                var defaultValue = this.defaultValue;

                index = defaultValue.index || -1;
                selected.innerHTML = defaultValue.text;
                value = defaultValue.value;
            } else {
                if (this.multipleTags) {
                    selected.innerHTML = '';
                    this.displayMultipleTags(selectedOption, this.refs.multiTagWrapper);
                } else {
                    selected.innerHTML = this.multipleMessage;
                }

                index = selectedOption.map(function (option) {
                    return option.index;
                });

                value = selectedOption.map(function (option) {
                    return option.value;
                });
            }

            selected.setAttribute('data-value', value);
            selected.setAttribute('data-index', index);
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
    }, {
        key: 'escapeHTML',
        value: function escapeHTML(string) {
            return String(string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
    }, {
        key: 'fuzzySearch',
        value: function fuzzySearch(e) // disclaimer: not actually fuzzy
        {
            var _this4 = this;

            e.preventDefault();
            var keyCode = e.keyCode;

            if (keyCode !== 38 && keyCode !== 40 && keyCode !== 13 && keyCode !== 27) {
                (function () {
                    var term = e.target.value.toLowerCase();

                    _this4.refs.options.forEach(function (_option) {
                        var text = _option.innerHTML.toLowerCase();

                        if (term !== '' && text.indexOf(term) === -1) {
                            _this4.addClass(_option, _classes3['default'].SEARCH_HIDDEN);
                        } else {
                            _this4.removeClass(_option, _classes3['default'].SEARCH_HIDDEN);
                        }
                    });
                })();
            } else {
                this.setKeypress(e);
                this.setSelectValue(e);
            }
        }

        /**
         * ## fuzzySearchReset
         *
         * resets all options to visible
         *
         * @return _Void_
         */
    }, {
        key: 'fuzzySearchReset',
        value: function fuzzySearchReset() {
            var _this5 = this;

            this.refs.options.forEach(function (_option) {
                _this5.removeClass(_option, _classes3['default'].SEARCH_HIDDEN);
            });

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
    }, {
        key: 'getActualWidth',
        value: function getActualWidth(_el) {
            var style = getComputedStyle(_el);

            if (_el.offsetWidth === 0) {
                if (this.__checkWidthAgain !== true) {
                    setTimeout(this.setTextMultiTagIndent.bind(this), 1500);
                    this.__checkWidthAgain === true;
                }
            } else {
                this.__checkWidthAgain !== false;
            }

            return _el.offsetWidth + parseInt(style['margin-left']) + parseInt(style['margin-right']);
        }

        /**
         * ## getOption
         *
         * returns the option and div tags related to an option
         *
         * @param {Number} _i index to return
         *
         * @return _Object_ option and div tage
         */
    }, {
        key: 'getOption',
        value: function getOption(_i) {
            var refs = this.refs;

            return { option: refs.selectOptions[_i], div: refs.options[_i] };
        }

        /**
         * ## getSelectedOptions
         *
         * returns the currently selected options of a SELECT box
         *
         * @return _Void_
         */
    }, {
        key: 'getSelectedOptions',
        value: function getSelectedOptions() {
            var _el = this.refs.select;
            var opts = [],
                opt = undefined;
            var _options = _el.options;

            for (var i = 0, len = _options.length; i < len; i++) {
                opt = _options[i];

                if (opt.selected) {
                    opts.push(opt);
                }
            }

            return opts;
        }

        /**
         * ## getSelectedValues
         *
         * returns the values of the currently selected options
         *
         * @return _Void_
         */
    }, {
        key: 'getSelectedValues',
        value: function getSelectedValues() {
            return this.getSelectedOptions().map(function (_v) {
                return _v.value;
            });
        }

        /**
         * ## hasClass
         *
         * on the quest to nuke jquery, a wild helper function appears
         *
         * @param {DOMElement} _el target element
         * @param {String} _class class to check
         *
         * @return _Void_
         */
    }, {
        key: 'hasClass',
        value: function hasClass(_el, _class) {
            var _elClass = _el.className;
            var regex = new RegExp('(^' + _class + ' )|( ' + _class + '$)|( ' + _class + ' )|(^' + _class + '$)');
            return !!_elClass.match(regex);
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
    }, {
        key: 'hideElement',
        value: function hideElement(_el) {
            this.addClass(_el, _classes3['default'].HIDDEN);
        }

        /**
         * ## initialzeOptions
         *
         * inserts the initial options into the flounder object, setting defaults when necessary
         *
         * @return _Void_
         */
    }, {
        key: 'initialzeOptions',
        value: function initialzeOptions() {
            this.props = this.props || {};
            var props = this.props;

            for (var _o in _defaults2['default']) {
                if (_defaults2['default'].hasOwnProperty(_o) && _o !== 'classes') {
                    this[_o] = props[_o] !== undefined ? props[_o] : _defaults2['default'][_o];
                } else if (_o === 'classes') {
                    var _classes = _defaults2['default'][_o];
                    var propsClasses = props.classes;

                    for (var _c in _classes) {
                        this[_c + 'Class'] = propsClasses && propsClasses[_c] !== undefined ? propsClasses[_c] : _classes[_c];
                    }
                }
            }

            if (!this.multiple) {
                this.multipleTags = false;
            }

            if (this.multipleTags) {
                this.selectedClass += '  ' + _classes3['default'].SELECTED_HIDDEN;
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
    }, {
        key: 'initSelectBox',
        value: function initSelectBox(wrapper) {
            var _this6 = this;

            var target = this.target;
            var select = undefined;

            if (target.tagName === 'SELECT') {
                (function () {
                    _this6.addClass(target, _classes3['default'].SELECT_TAG);
                    _this6.addClass(target, _classes3['default'].HIDDEN);
                    _this6.refs.select = target;

                    var options = [],
                        selectOptions = [];
                    Array.prototype.slice.apply(target.children).forEach(function (optionEl) {
                        selectOptions.push(optionEl);
                        options.push({
                            text: optionEl.innerHTML,
                            value: optionEl.value
                        });
                    });

                    _this6.options = options;
                    _this6.target = target.parentNode;
                    _this6.refs.selectOptions = selectOptions;

                    select = _this6.refs.select;
                    _this6.addClass(select, _classes3['default'].HIDDEN);
                })();
            } else {
                select = this.constructElement({ tagname: 'select', className: _classes3['default'].SELECT_TAG + '  ' + _classes3['default'].HIDDEN });
                wrapper.appendChild(select);
            }

            return select;
        }

        /**
         * ## iosVersion
         *
         * checks and returns the ios version
         *
         * @return _Void_:
         */
    }, {
        key: 'iosVersion',
        value: function iosVersion() {

            if (/iPad|iPhone|iPod/.test(navigator.platform)) {
                if (!!window.indexedDB) {
                    return '8+';
                }
                if (!!window.SpeechSynthesisUtterance) {
                    return '7';
                }
                if (!!window.webkitAudioContext) {
                    return '6';
                }
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
    }, {
        key: 'onRender',
        value: function onRender() {
            var props = this.props;
            var refs = this.refs;
            var options = refs.options;

            if (!!this.isIos && (!this.multipleTags || !this.multiple)) {
                var sel = refs.select;
                this.removeClass(sel, _classes3['default'].HIDDEN);
                this.addClass(sel, _classes3['default'].HIDDEN_IOS);
            }

            var self = this;
            var _divertTarget = function _divertTarget(e) {
                var index = this.selectedIndex;
                var _e = {
                    target: refs.options[index]
                };

                self.setSelectValue(_e);

                if (!self.multiple) {
                    self.toggleList(e, 'close');
                }
            };

            refs.select.addEventListener('change', _divertTarget);

            this.addOptionsListeners();

            refs.flounder.addEventListener('keydown', this.checkFlounderKeypress);
            refs.selected.addEventListener('click', this.toggleList);

            if (props.search) {
                var search = refs.search;
                search.addEventListener('click', this.toggleList);
                search.addEventListener('keyup', this.fuzzySearch);
                search.addEventListener('focus', this.checkPlaceholder);
                search.addEventListener('blur', this.checkPlaceholder);
            }
        }

        /**
         * ## rebuildOptions
         *
         * after editing the options, this can be used to rebuild them
         *
         * @param {Array} _options array with optino information
         *
         * @return _Void_
         */
    }, {
        key: 'rebuildOptions',
        value: function rebuildOptions(_options) {
            var _this7 = this;

            var refs = this.refs;
            var selected = refs.select.selectedOptions;
            selected = Array.prototype.slice.call(selected).map(function (e) {
                return e.value;
            });
            this.removeOptionsListeners();

            refs.select.innerHTML = '';
            refs.optionsList.innerHTML = '';

            var _select = refs.select;
            refs.select = false;

            var _buildOptions3 = this.buildOptions(this.defaultValue, _options, refs.optionsList, _select);

            var _buildOptions32 = _slicedToArray(_buildOptions3, 2);

            refs.options = _buildOptions32[0];
            refs.selectOptions = _buildOptions32[1];

            refs.select = _select;

            this.removeSelectedValue();
            this.removeSelectedClass();

            refs.selectOptions.forEach(function (el, i) {
                var valuePosition = selected.indexOf(el.value);

                if (valuePosition !== -1) {
                    selected.splice(valuePosition, 1);
                    el.selected = true;
                    _this7.addClass(refs.options[i], _this7.selectedClass);
                }
            });

            this.addOptionsListeners();
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
    }, {
        key: 'removeClass',
        value: function removeClass(_el, _class) {
            var _elClass = _el.className;
            var _elClassLength = _elClass.length;
            var _classLength = _class.length;

            if (_elClass.slice(0, _classLength + 1) === _class + ' ') {
                _el.className = _elClass.slice(_classLength + 1, _elClassLength);
            }

            if (_elClass.slice(_elClassLength - _classLength - 1, _elClassLength) === ' ' + _class) {
                _el.className = _elClass.slice(0, _elClassLength - _classLength - 1);
            }

            _el.className = _el.className.trim();
        }

        /**
         * ## removeOptionsListeners
         *
         * removes event listeners on the options divs
         *
         * @return _Void_
         */
    }, {
        key: 'removeOptionsListeners',
        value: function removeOptionsListeners() {
            var _this8 = this;

            this.refs.options.forEach(function (_option) {
                if (_option.tagName === 'DIV') {
                    _option.removeEventListener('click', _this8.clickSet);
                }
            });
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
    }, {
        key: 'removeMultiTag',
        value: function removeMultiTag(e) {
            e.preventDefault();
            e.stopPropagation();

            var value = undefined;
            var index = undefined;
            var refs = this.refs;
            var select = refs.select;
            var selected = refs.selected;
            var target = e.target;
            var defaultValue = this.defaultValue;
            var targetIndex = target.getAttribute('data-index');
            select[targetIndex].selected = false;

            var selectedOptions = this.getSelectedOptions();

            this.removeClass(refs.options[targetIndex], _classes3['default'].SELECTED_HIDDEN);
            this.removeClass(refs.options[targetIndex], _classes3['default'].SELECTED);

            var span = target.parentNode;
            span.parentNode.removeChild(span);

            if (selectedOptions.length === 0) {
                index = defaultValue.index || -1;
                selected.innerHTML = defaultValue.text;
                value = defaultValue.value;
            } else {
                value = selectedOptions.map(function (option) {
                    return option.value;
                });

                index = selectedOptions.map(function (option) {
                    return option.index;
                });
            }

            this.setTextMultiTagIndent();

            selected.setAttribute('data-value', value);
            selected.setAttribute('data-index', index);

            this.onSelect(e, this.getSelectedValues());
        }

        /**
         * ## removeSelectKeyListener
         *
         * disables the event listener on the native select box
         *
         * @return _Void_
         */
    }, {
        key: 'removeSelectKeyListener',
        value: function removeSelectKeyListener() {
            var select = this.refs.select;
            select.removeEventListener('keyup', this.setSelectValue);
        }

        /**
         * ## removeSelectedClass
         *
         * removes the [[this.selectedClass]] from all options
         *
         * @return _Void_
         */
    }, {
        key: 'removeSelectedClass',
        value: function removeSelectedClass(options) {
            var _this9 = this;

            options = options || this.refs.options;

            options.forEach(function (_option, i) {
                _this9.removeClass(_option, _this9.selectedClass);
            });
        }

        /**
         * ## removeSelectedValue
         *
         * sets the selected property to false for all options
         *
         * @return _Void_
         */
    }, {
        key: 'removeSelectedValue',
        value: function removeSelectedValue(options) {
            var _this10 = this;

            options = options || this.refs.options;

            options.forEach(function (_option, i) {
                _this10.refs.select[i].selected = false;
            });
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
    }, {
        key: 'scrollTo',
        value: function scrollTo(element) {
            var parent = element.parentNode.parentNode;
            var elHeight = element.offsetHeight;
            var min = parent.scrollTop;
            var max = parent.scrollTop + parent.offsetHeight - element.offsetHeight;
            var pos = element.offsetTop;

            if (pos < min) {
                parent.scrollTop = pos - elHeight * 0.5;
            } else if (pos > max) {
                parent.scrollTop = pos - parent.offsetHeight + elHeight * 1.5;
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
    }, {
        key: 'setDefaultOption',
        value: function setDefaultOption(defaultProp, options) {
            var defaultValue = '';

            if (typeof defaultProp === 'number') {
                defaultValue = options[defaultProp];
                defaultValue.index = defaultProp;
            } else if (typeof defaultProp === 'string') {
                defaultValue = {
                    text: defaultProp,
                    value: defaultProp
                };
            }

            return defaultValue;
        }

        /**
         * ## setPlatform
         *
         * sets the platform to osx or not osx for the sake of the multi select key
         *
         * @return _Void_
         */
    }, {
        key: 'setPlatform',
        value: function setPlatform() {
            var _osx = this.isOsx = window.navigator.platform.indexOf('Mac') === -1 ? false : true;

            this.isIos = this.iosVersion();
            this.multiSelect = _osx ? 'metaKey' : 'ctrlKey';
        }

        /**
         * ## setKeypress
         *
         * handles arrow key selection
         *
         * @param {Object} e event object
         *
         * @return _Void_
         */
    }, {
        key: 'setKeypress',
        value: function setKeypress(e) {
            e.preventDefault();
            var increment = 0;
            var keyCode = e.keyCode;

            if (this.multipleTags) {
                return false;
            }

            if (keyCode === 13 || keyCode === 27 || keyCode === 32) {
                this.toggleList(e);
                return false;
            } else if (keyCode === 38) {
                e.preventDefault();
                increment--;
            } else if (keyCode === 40) {
                e.preventDefault();
                increment++;
            }

            if (!!window.sidebar) // ff
                {
                    increment = 0;
                }

            var refs = this.refs;
            var selectTag = refs.select;
            var options = refs.options;
            var optionsMaxIndex = options.length - 1;
            var index = selectTag.selectedIndex + increment;

            if (index > optionsMaxIndex) {
                index = 0;
            } else if (index < 0) {
                index = optionsMaxIndex;
            }

            selectTag.selectedIndex = index;
            var hasClass = this.hasClass;

            if (hasClass(options[index], _classes3['default'].HIDDEN) && hasClass(options[index], _classes3['default'].SELECTED_HIDDEN)) {
                this.setKeypress(e);
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
    }, {
        key: 'setSelectValue',
        value: function setSelectValue(obj, e) {
            var refs = this.refs;
            var selection = undefined;

            if (e) // click
                {
                    this.setSelectValueClick(e);
                    selection = true;
                } else // keypress
                {
                    if (this.multipleTags) {
                        obj.preventDefault();
                        obj.stopPropagation();

                        return false;
                    }

                    selection = this.checkSelect(e);

                    if (selection) {
                        this.setSelectValueButton(obj);
                    }
                }

            if (selection) {
                this.displaySelected(refs.selected, refs);

                this.onSelect(e, this.getSelectedValues());
            }
        }

        /**
         * ## setSelectValueButton
         *
         * processes the setting of a value after a keypress event
         *
         * @return _Void_
         */
    }, {
        key: 'setSelectValueButton',
        value: function setSelectValueButton() {
            var refs = this.refs;
            var options = refs.options;
            var select = refs.select;
            var selectedClass = this.selectedClass;

            var selectedOption = undefined;

            this.removeSelectedClass(options);

            var optionsArray = this.getSelectedOptions();
            var baseOption = optionsArray[0];

            if (baseOption) {
                selectedOption = options[baseOption.index];

                this.addClass(selectedOption, selectedClass);

                this.scrollTo(selectedOption);
            }
        }

        /**
         * ## setSelectValueClick
         *
         * processes the setting of a value after a click event
         *
         * @param {Object} e event object
         *
         * @return _Void_
         */
    }, {
        key: 'setSelectValueClick',
        value: function setSelectValueClick(e) {
            var _multiple = this.multiple;
            var refs = this.refs;
            var options = refs.options;
            var selectedClass = this.selectedClass;
            var index = undefined,
                selectedOption = undefined;

            if (!_multiple || _multiple && !this.multipleTags && !e[this.multiSelect]) {
                this.removeSelectedClass();
                this.removeSelectedValue();
            }

            var target = e.target;

            this.toggleClass(target, selectedClass);
            index = target.getAttribute('data-index');

            selectedOption = refs.selectOptions[index];

            selectedOption.selected = selectedOption.selected === true ? false : true;
        }

        /**
         * ## setTextMultiTagIndent
         *
         * sets the text-indent on the search field to go around selected tags
         *
         * @return _Void_
         */
    }, {
        key: 'setTextMultiTagIndent',
        value: function setTextMultiTagIndent() {
            var _this11 = this;

            var search = this.refs.search;
            var offset = this.defaultTextIndent;

            if (search) {
                var _els = document.getElementsByClassName(_classes3['default'].MULTIPLE_SELECT_TAG);
                _els.each(function (i, e) {
                    offset += _this11.getActualWidth(e);
                });

                search.style.textIndent = offset + 'px';
            }
        }

        /**
         * ## showElement
         *
         * remove classes.HIDDEN from a given element
         *
         * @param {Object} _el element to show
         *
         * @return _Void_
         */
    }, {
        key: 'showElement',
        value: function showElement(_el) {
            this.removeClass(_el, _classes3['default'].HIDDEN);
        }

        /**
         * ## setValue
         *
         * programatically sets the value by string or index.  If the value string
         * is not matched to an element, nothing will be selected
         *
         * @param {Mixed} value value to set flounder to.  _String, Number, or Array with either/both_
         *
         * return _Void_
         */
    }, {
        key: 'setValue',
        value: function setValue(value) {
            var refs = this.refs;

            if (typeof value !== 'string' && value.length) {
                var _setValue = this.setValue;
                value.forEach(_setValue);
            } else {
                if (typeof value === 'string') {
                    value = refs.select.querySelector('[value="' + value + '"]').index;
                }

                var el = refs.options[value];

                if (el) {
                    var isOpen = this.hasClass(refs.wrapper, 'open');
                    this.toggleList(isOpen ? 'close' : 'open');
                    el.click();
                }
            }
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
    }, {
        key: 'toggleClass',
        value: function toggleClass(_el, _class) {
            var _addClass = this.addClass;
            var _removeClass = this.removeClass;

            if (this.hasClass(_el, _class)) {
                _removeClass(_el, _class);
            } else {
                _addClass(_el, _class);
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
    }, {
        key: 'toggleList',
        value: function toggleList(e, force) {
            var refs = this.refs;
            var optionsList = refs.optionsListWrapper;
            var wrapper = refs.wrapper;
            var hasClass = this.hasClass;

            if (force === 'open' || force !== 'close' && hasClass(optionsList, _classes3['default'].HIDDEN)) {
                this.toggleList.justOpened = true;
                this.toggleOpen(e, optionsList, refs, wrapper);
            } else if (force === 'close' || !hasClass(optionsList, _classes3['default'].HIDDEN)) {
                this.toggleList.justOpened = false;
                this.toggleClosed(e, optionsList, refs, wrapper);
            }
        }

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
    }, {
        key: 'toggleOpen',
        value: function toggleOpen(e, optionsList, refs, wrapper) {
            this.addSelectKeyListener();

            if (!this.isIos || this.multipleTags === true && this.multiple === true) {
                this.showElement(optionsList);
                this.addClass(wrapper, 'open');

                document.querySelector('html').addEventListener('click', this.catchBodyClick);
                document.querySelector('html').addEventListener('touchend', this.catchBodyClick);
            }

            if (!this.multiple) {
                var index = refs.select.selectedIndex;
                var selectedDiv = refs.options[index];

                if (selectedDiv) {
                    this.scrollTo(selectedDiv);
                }
            }

            if (this.props.search) {
                refs.search.focus();
            }

            this.onOpen(e, this.getSelectedValues());
        }

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
    }, {
        key: 'toggleClosed',
        value: function toggleClosed(e, optionsList, refs, wrapper) {
            this.hideElement(optionsList);
            this.removeSelectKeyListener();
            this.removeClass(wrapper, 'open');

            var qsHTML = document.querySelector('html');
            qsHTML.removeEventListener('click', this.catchBodyClick);
            qsHTML.removeEventListener('touchend', this.catchBodyClick);

            if (this.props.search) {
                this.fuzzySearchReset();
            }

            refs.flounder.focus();

            this.onClose(e, this.getSelectedValues());
        }
    }]);

    return Flounder;
})();

exports['default'] = Flounder;
module.exports = exports['default'];

},{"./classes":1,"./defaults":2}],4:[function(require,module,exports){

/* jshint globalstrict: true */
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _coreFlounderJsx = require('../core/flounder.jsx');

var _coreFlounderJsx2 = _interopRequireDefault(_coreFlounderJsx);

(function (µ) {

    µ.core.flounder = function (options) {
        return new _coreFlounderJsx2['default'](this, options);
    };
})(µ);

},{"../core/flounder.jsx":3}]},{},[4]);
