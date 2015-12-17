/*!
 * Flounder JavaScript Styleable Selectbox v0.2.1
 * https://github.com/sociomantic/flounder
 *
 * Copyright 2015 Sociomantic Labs and other contributors
 * Released under the MIT license
 * https://github.com/sociomantic/flounder/license
 *
 * Date: Thu Dec 17 2015
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _classes = require('./classes');

var _classes2 = _interopRequireDefault(_classes);

var api = {

    /**
     * ## destroy
     *
     * removes flounder and all it's events from the dom
     *
     * @return _Void_
     */
    destroy: function destroy() {
        this.componentWillUnmount();
        var originalTarget = this.originalTarget;

        if (originalTarget.tagName === 'INPUT' || originalTarget.tagName === 'SELECT') {
            var target = originalTarget.nextElementSibling;
            target.parentNode.removeChild(target);
            originalTarget.tabIndex = 0;
            this.removeClass(originalTarget, _classes2['default'].HIDDEN);
        } else {
            var target = this.target;
            target.innerHTML = '';
        }
    },

    /**
     * ## deselectAll
     *
     * deslects all data
     *
     * @return _Void_
     */
    deselectAll: function deselectAll() {
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
    disable: function disable(bool) {
        var refs = this.refs;
        var flounder = refs.flounder;
        var selected = refs.selected;

        if (bool) {
            refs.flounder.removeEventListener('keydown', this.checkFlounderKeypress);
            refs.selected.removeEventListener('click', this.toggleList);
            this.addClass(selected, _classes2['default'].DISABLED);
            this.addClass(flounder, _classes2['default'].DISABLED);
        } else {
            refs.flounder.addEventListener('keydown', this.checkFlounderKeypress);
            refs.selected.addEventListener('click', this.toggleList);
            this.removeClass(selected, _classes2['default'].DISABLED);
            this.removeClass(flounder, _classes2['default'].DISABLED);
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
    getOption: function getOption(_i) {
        var refs = this.refs;

        return { option: refs.selectOptions[_i], div: refs.data[_i] };
    },

    /**
     * ## getSelectedOptions
     *
     * returns the currently selected data of a SELECT box
     *
     * @return _Void_
     */
    getSelectedOptions: function getSelectedOptions() {
        var _el = this.refs.select;
        var opts = [],
            opt = undefined;
        var _data = _el.options;

        for (var i = 0, len = _data.length; i < len; i++) {
            opt = _data[i];

            if (opt.selected) {
                opts.push(opt);
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
    getSelectedValues: function getSelectedValues() {
        return this.getSelectedOptions().map(function (_v) {
            return _v.value;
        });
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
    rebuildSelect: function rebuildSelect(_data) {
        var _this = this;

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

        var _buildData = this.buildData(this._default, _data, refs.optionsList, _select);

        var _buildData2 = _slicedToArray(_buildData, 2);

        refs.data = _buildData2[0];
        refs.selectOptions = _buildData2[1];

        refs.select = _select;

        this.removeSelectedValue();
        this.removeSelectedClass();

        refs.selectOptions.forEach(function (el, i) {
            var valuePosition = selected.indexOf(el.value);

            if (valuePosition !== -1) {
                selected.splice(valuePosition, 1);
                el.selected = true;
                _this.addClass(refs.data[i], _this.selectedClass);
            }
        });

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
    setIndex: function setIndex(index, multiple) {
        var refs = this.refs;

        if (typeof index !== 'string' && index.length) {
            var _setIndex = this.setIndex;
            return index.map(_setIndex);
        } else {
            var el = refs.data[index];

            if (el) {
                var isOpen = this.hasClass(refs.wrapper, 'open');
                this.toggleList(isOpen ? 'close' : 'open');
                this.___forceMultiple = multiple;
                this.___programmaticClick = true;
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
    setValue: function setValue(value, multiple) {
        if (typeof value !== 'string' && value.length) {
            var _setValue = this.setValue;
            return value.map(_setValue);
        } else {
            value = this.refs.select.querySelector('[value="' + value + '"]');
            return value ? this.setIndex(value.index, multiple) : null;
        }
    }
};

exports['default'] = api;
module.exports = exports['default'];

},{"./classes":2}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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
    multiple: false,
    multipleTags: true,
    multipleMessage: '(Multiple Items Selected)',
    onClose: function onClose() {},
    onComponentDidMount: function onComponentDidMount() {},
    onInit: function onInit() {},
    onOpen: function onOpen() {},
    onSelect: function onSelect() {},
    options: [],
    placeholder: 'Please choose an option',
    search: false
};

exports['default'] = defaults;
module.exports = exports['default'];

},{}],4:[function(require,module,exports){

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

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _api = require('./api');

var _api2 = _interopRequireDefault(_api);

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

            target = target.nodeType === 1 ? target : document.querySelector(target);

            this.originalTarget = target;
            target.flounder = this;

            if (target.tagName === 'INPUT') {
                this.addClass(target, _classes3['default'].HIDDEN);
                target.setAttribute('aria-hidden', true);
                target.tabIndex = -1;
                target = target.parentNode;
            }

            this.target = target;

            this.props = props;
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
     * ## addOptionDescription
     *
     * adds a description to the option
     *
     * @param {DOMElement} _el option leement to add description to
     * @param {String} text description
     *
     * @return _Void_
     */

    _createClass(Flounder, [{
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

            this.refs.data.forEach(function (dataObj, i) {
                if (dataObj.tagName === 'DIV') {
                    dataObj.addEventListener('click', _this2.clickSet);
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
            this.setIndex = this.setIndex.bind(this);
            this.setKeypress = this.setKeypress.bind(this);
            this.setSelectValue = this.setSelectValue.bind(this);
            this.setValue = this.setValue.bind(this);
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
            var wrapper = this.constructElement({ className: this.wrapperClass ? wrapperClass + ' ' + this.wrapperClass : wrapperClass });
            var flounderClass = _classes3['default'].MAIN;
            var flounder = constructElement({ className: this.flounderClass ? flounderClass + '  ' + this.flounderClass : flounderClass });

            flounder.setAttribute('aria-hidden', true);
            flounder.tabIndex = 0;
            wrapper.appendChild(flounder);

            var select = this.initSelectBox(wrapper);
            select.tabIndex = -1;

            if (this.multiple === true) {
                select.setAttribute('multiple', '');
            }

            var data = this.data;

            var defaultValue = this._default = this.setDefaultOption(this.props, data);

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
            var selectOptions = undefined;

            var _buildData = this.buildData(defaultValue, data, optionsList, select);

            var _buildData2 = _slicedToArray(_buildData, 2);

            data = _buildData2[0];
            selectOptions = _buildData2[1];

            this.target.appendChild(wrapper);

            this.refs = { wrapper: wrapper, flounder: flounder, selected: selected, arrow: arrow, optionsListWrapper: optionsListWrapper,
                search: search, multiTagWrapper: multiTagWrapper, optionsList: optionsList, select: select, data: data, selectOptions: selectOptions };
        }

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
    }, {
        key: 'buildData',
        value: function buildData(defaultValue, _data, optionsList, select) {
            var _this3 = this;

            _data = _data || [];
            var data = [];
            var selectOptions = [];
            var constructElement = this.constructElement;
            var addOptionDescription = this.addOptionDescription;

            _data.forEach(function (dataObj, i) {
                if (typeof dataObj !== 'object') {
                    dataObj = {
                        text: dataObj,
                        value: dataObj
                    };
                }
                dataObj.index = i;

                var extraClass = i === defaultValue.index ? '  ' + _this3.selectedClass : '';

                var res = {
                    className: _classes3['default'].OPTION + extraClass,
                    'data-index': i
                };

                for (var _o in dataObj) {
                    if (_o !== 'text' && _o !== 'description') {
                        res[_o] = dataObj[_o];
                    }
                }

                data[i] = constructElement(res);
                var escapedText = _this3.escapeHTML(dataObj.text);
                data[i].innerHTML = escapedText;
                optionsList.appendChild(data[i]);

                if (dataObj.description) {
                    addOptionDescription(data[i], dataObj.description);
                }

                data[i].className += dataObj.extraClass ? '  ' + dataObj.extraClass : '';

                if (!_this3.refs.select) {
                    selectOptions[i] = constructElement({ tagname: 'option',
                        className: _classes3['default'].OPTION_TAG,
                        value: dataObj.value });
                    selectOptions[i].innerHTML = escapedText;
                    select.appendChild(selectOptions[i]);
                } else {
                    var selectChild = select.children[i];

                    selectOptions[i] = selectChild;
                    selectChild.setAttribute('value', selectChild.value);
                }

                if (i === defaultValue.index) {
                    selectOptions[i].selected = true;
                }

                if (selectOptions[i].getAttribute('disabled')) {
                    _this3.addClass(data[i], _classes3['default'].DISABLED_OPTION);
                }
            });

            return [data, selectOptions];
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
            target = target || this.refs.data[e.target.getAttribute('data-index')] || e.target;

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
                if (option.value !== '') {
                    _span = document.createElement('span');
                    _span.className = _classes3['default'].MULTIPLE_SELECT_TAG;

                    _a = document.createElement('a');
                    _a.className = _classes3['default'].MULTIPLE_TAG_CLOSE;
                    _a.setAttribute('data-index', option.index);

                    _span.appendChild(_a);

                    _span.innerHTML += option.innerHTML;

                    multiTagWrapper.appendChild(_span);
                } else {
                    option.selected = false;
                }
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
            var value = [];
            var index = -1;

            var selectedOption = this.getSelectedOptions();

            var selectedLength = selectedOption.length;

            if (!this.multiple || !this.multipleTags && selectedLength === 1) {
                index = selectedOption[0].index;
                selected.innerHTML = selectedOption[0].innerHTML;
                value = selectedOption[0].value;
            } else if (selectedLength === 0) {
                var defaultValue = this._default;

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

                    _this4.refs.data.forEach(function (dataObj) {
                        var text = dataObj.innerHTML.toLowerCase();

                        if (term !== '' && text.indexOf(term) === -1) {
                            _this4.addClass(dataObj, _classes3['default'].SEARCH_HIDDEN);
                        } else {
                            _this4.removeClass(dataObj, _classes3['default'].SEARCH_HIDDEN);
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

            this.refs.data.forEach(function (dataObj) {
                _this5.removeClass(dataObj, _classes3['default'].SEARCH_HIDDEN);
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

                    var data = [],
                        selectOptions = [];

                    Array.prototype.slice.apply(target.children).forEach(function (optionEl) {
                        selectOptions.push(optionEl);
                        data.push({
                            text: optionEl.innerHTML,
                            value: optionEl.value
                        });
                    });

                    _this6.data = data;
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
            var data = refs.data;

            if (!!this.isIos && (!this.multipleTags || !this.multiple)) {
                var sel = refs.select;
                this.removeClass(sel, _classes3['default'].HIDDEN);
                this.addClass(sel, _classes3['default'].HIDDEN_IOS);
            }

            var self = this;
            var _divertTarget = function _divertTarget(e) {
                var index = this.selectedIndex;

                var _e = {
                    target: data[index]
                };

                if (self.multipleTags) {
                    e.preventDefault();
                    e.stopPropagation();
                }

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
         * ## removeOptionsListeners
         *
         * removes event listeners on the data divs
         *
         * @return _Void_
         */
    }, {
        key: 'removeOptionsListeners',
        value: function removeOptionsListeners() {
            var _this7 = this;

            this.refs.data.forEach(function (dataObj) {
                if (dataObj.tagName === 'DIV') {
                    dataObj.removeEventListener('click', _this7.clickSet);
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
            var defaultValue = this._default;
            var data = this.refs.data;
            var targetIndex = target.getAttribute('data-index');
            select[targetIndex].selected = false;

            var selectedOptions = this.getSelectedOptions();

            this.removeClass(data[targetIndex], _classes3['default'].SELECTED_HIDDEN);
            this.removeClass(data[targetIndex], _classes3['default'].SELECTED);

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
         * removes the [[this.selectedClass]] from all data
         *
         * @return _Void_
         */
    }, {
        key: 'removeSelectedClass',
        value: function removeSelectedClass(data) {
            var _this8 = this;

            data = data || this.refs.data;

            data.forEach(function (dataObj, i) {
                _this8.removeClass(dataObj, _this8.selectedClass);
            });
        }

        /**
         * ## removeSelectedValue
         *
         * sets the selected property to false for all data
         *
         * @return _Void_
         */
    }, {
        key: 'removeSelectedValue',
        value: function removeSelectedValue(data) {
            var _this9 = this;

            data = data || this.refs.data;

            data.forEach(function (_d, i) {
                _this9.refs.select[i].selected = false;
            });
        }

        /**
         * ## setDefaultOption
         *
         * sets the initial default value
         *
         * @param {String or Number}    defaultProp         default passed from this.props
         * @param {Object}              data                this.props.data
         *
         * @return _Void_
         */
    }, {
        key: 'setDefaultOption',
        value: function setDefaultOption(configObj, data) {
            var self = this;

            /**
             * ## setPlaceholderDefault
             *
             * sets a placeholder as the default option.  This inserts an empty
             * option first and sets that as default
             *
             * @return {Object} default settings
             */
            var setPlaceholderDefault = function setPlaceholderDefault() {
                var refs = self.refs;
                var select = refs.select;

                var _default = {
                    text: configObj.placeholder,
                    value: '',
                    index: 0,
                    extraClass: _classes3['default'].HIDDEN
                };

                if (select) {
                    var escapedText = self.escapeHTML(_default.text);
                    var defaultOption = self.constructElement({ tagname: 'option',
                        className: _classes3['default'].OPTION_TAG,
                        value: _default.value });
                    defaultOption.innerHTML = escapedText;

                    select.insertBefore(defaultOption, select[0]);
                    self.refs.selectOptions.unshift(defaultOption);
                }

                data.unshift(_default);

                return _default;
            };

            /**
             * ## setIndexDefault
             *
             * sets a specified indexas the default option. This only works correctly
             * if it is a valid index, otherwise it returns null
             *
             * @return {Object} default settings
             */
            var setIndexDefault = function setIndexDefault(index) {
                var defaultIndex = index || index === 0 ? index : configObj.defaultIndex;
                var defaultOption = data[defaultIndex];

                if (defaultOption) {
                    defaultOption.index = defaultIndex;
                    return defaultOption;
                }

                return null;
            };

            /**
             * ## setValueDefault
             *
             * sets a specified index as the default. This only works correctly if
             * it is a valid value, otherwise it returns null
             *
             * @return {Object} default settings
             */
            var setValueDefault = function setValueDefault() {
                var defaultProp = configObj.defaultValue + '';
                var index = undefined;

                data.forEach(function (dataObj, i) {
                    if (dataObj.value === defaultProp) {
                        index = i;
                    }
                });

                var _default = index ? data[index] : null;

                if (_default) {
                    _default.index = index;
                    return _default;
                }

                return null;
            };

            var defaultObj = undefined;

            if (configObj.placeholder) {
                defaultObj = setPlaceholderDefault();
            } else if (configObj.defaultIndex) {
                defaultObj = setIndexDefault();
            } else if (configObj.defaultValue) {
                defaultObj = setValueDefault();
            }

            return defaultObj || setIndexDefault(0);
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
            var data = refs.data;
            var dataMaxIndex = data.length - 1;
            var index = selectTag.selectedIndex + increment;

            if (index > dataMaxIndex) {
                index = 0;
            } else if (index < 0) {
                index = dataMaxIndex;
            }

            selectTag.selectedIndex = index;
            var hasClass = this.hasClass;

            if (hasClass(data[index], _classes3['default'].HIDDEN) && hasClass(data[index], _classes3['default'].SELECTED_HIDDEN)) {
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
                    selection = this.checkSelect(obj);

                    if (selection) {
                        this.setSelectValueButton(obj);
                    }
                }

            if (selection) {
                this.displaySelected(refs.selected, refs);

                if (!this.___programmaticClick) {
                    this.onSelect(e, this.getSelectedValues());
                } else {
                    this.___programmaticClick = false;
                }
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
            var data = refs.data;
            var select = refs.select;
            var selectedClass = this.selectedClass;

            var selectedOption = undefined;

            this.removeSelectedClass(data);

            var dataArray = this.getSelectedOptions();
            var baseOption = dataArray[0];

            if (baseOption) {
                selectedOption = data[baseOption.index];

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
            var selectedClass = this.selectedClass;
            var index = undefined,
                selectedOption = undefined;

            if ((!_multiple || _multiple && !this.multipleTags && !e[this.multiSelect]) && !this.___forceMultiple) {
                this.deselectAll();
            }

            this.___forceMultiple = false;
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
            var _this10 = this;

            var search = this.refs.search;
            var offset = this.defaultTextIndent;

            if (search) {
                var _els = document.getElementsByClassName(_classes3['default'].MULTIPLE_SELECT_TAG);
                _els.each(function (i, e) {
                    offset += _this10.getActualWidth(e);
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
                var selectedDiv = refs.data[index];

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

_utils2['default'].extendClass(Flounder, _utils2['default'], _api2['default']);

exports['default'] = Flounder;
module.exports = exports['default'];

},{"./api":1,"./classes":2,"./defaults":3,"./utils":5}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var utils = {
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
    addClass: function addClass(_el, _class) {
        var _elClass = _el.className;
        var _elClassLength = _elClass.length;

        if (!utils.hasClass(_el, _class) && _elClass.slice(0, _class.length + 1) !== _class + ' ' && _elClass.slice(_elClassLength - _class.length - 1, _elClassLength) !== ' ' + _class) {
            _el.className += '  ' + _class;
        }
    },

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
    attachAttributes: function attachAttributes(_el, _elObj) {
        for (var att in _elObj) {
            if (att.indexOf('data-') !== -1) {
                _el.setAttribute(att, _elObj[att]);
            } else {
                _el[att] = _elObj[att];
            }
        }
    },

    /**
     * ## constructElement
     *
     * @param {Object} _elObj object carrying properties to transfer
     *
     * @return _Element_
     */
    constructElement: function constructElement(_elObj) {
        var _el = document.createElement(_elObj.tagname || 'div');

        utils.attachAttributes(_el, _elObj);

        return _el;
    },

    /**
     * ## extendClass
     *
     * extends a class from an object.  returns the original reference
     *
     * @param {Class} _extend class to be extended
     *
     * @return {Class} modified class object
     */
    extendClass: function extendClass(_extend) {
        _extend = _extend.prototype;

        var merge = function merge(obj) {
            for (var prop in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                    _extend[prop] = obj[prop];
                }
            }
        };

        for (var _len = arguments.length, objects = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            objects[_key - 1] = arguments[_key];
        }

        for (var i = 0, lenI = objects.length; i < lenI; i++) {
            var obj = objects[i];
            merge(obj);
        }

        return _extend;
    },

    /**
     * ## escapeHTML
     *
     * Escapes HTML in order to put correct elements in the DOM
     *
     * @param {String} string unescaped string
     *
     * @return _Void_
     */
    escapeHTML: function escapeHTML(string) {
        return String(string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },

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
    hasClass: function hasClass(_el, _class) {
        var _elClass = _el.className;
        var regex = new RegExp('(^' + _class + ' )|( ' + _class + '$)|( ' + _class + ' )|(^' + _class + '$)');
        return !!_elClass.match(regex);
    },

    /**
     * ## iosVersion
     *
     * checks and returns the ios version
     *
     * @return _Void_:
     */
    iosVersion: function iosVersion() {

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
    },

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
    removeClass: function removeClass(_el, _class) {
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
    },

    /**
     * ## scrollTo
     *
     * checks if an option is visible and, if it is not, scrolls it into view
     *
     * @param {DOMElement} element element to check
     *
     *@return _Void_
     */
    scrollTo: function scrollTo(element) {
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
    },

    /**
     * ## setPlatform
     *
     * sets the platform to osx or not osx for the sake of the multi select key
     *
     * @return _Void_
     */
    setPlatform: function setPlatform() {
        var _osx = this.isOsx = window.navigator.platform.indexOf('Mac') === -1 ? false : true;

        this.isIos = this.iosVersion();
        this.multiSelect = _osx ? 'metaKey' : 'ctrlKey';
    },

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
    toggleClass: function toggleClass(_el, _class) {
        var _addClass = utils.addClass;
        var _removeClass = utils.removeClass;

        if (utils.hasClass(_el, _class)) {
            _removeClass(_el, _class);
        } else {
            _addClass(_el, _class);
        }
    }
};

exports['default'] = utils;
module.exports = exports['default'];

},{}],6:[function(require,module,exports){

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

},{"../core/flounder.jsx":4}]},{},[6]);
