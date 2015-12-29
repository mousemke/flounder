/*!
 * Flounder JavaScript Styleable Selectbox v0.2.5
 * https://github.com/sociomantic/flounder
 *
 * Copyright 2015 Sociomantic Labs and other contributors
 * Released under the MIT license
 * https://github.com/sociomantic/flounder/license
 *
 * Date: Tue Dec 29 2015
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
        originalTarget.flounder = this.refs.flounder = null;

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

},{"./classes":3}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _classes = require('./classes');

var _classes2 = _interopRequireDefault(_classes);

var build = {

    /**
     * ## addOptionDescription
     *
     * adds a description to the option
     *
     * @param {DOMElement} el option leement to add description to
     * @param {String} text description
     *
     * @return _Void_
     */
    addOptionDescription: function addOptionDescription(el, text) {
        var div = document.createElement('div');
        div.innerHTML = text;
        div.className = _classes2['default'].DESCRIPTION;
        el.appendChild(div);
    },

    /**
     * ## addSearch
     *
     * checks if a search box is required and attaches it or not
     *
     * @param {Object} flounder main element reference
     *
     * @return _Mixed_ search node or false
     */
    addSearch: function addSearch(flounder) {
        if (this.props.search) {
            var search = this.constructElement({
                tagname: 'input',
                type: 'text',
                className: _classes2['default'].SEARCH
            });
            flounder.appendChild(search);

            return search;
        }

        return false;
    },

    /**
     * ## bindThis
     *
     * binds this to whatever functions need it.  Arrow functions cannot be used
     * here due to the react extension needing them as well;
     *
     * @return _Void_
     */
    bindThis: function bindThis() {
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
    },

    /**
     * ## buildDom
     *
     * builds flounder
     *
     * @return _Void_
     */
    buildDom: function buildDom() {
        this.refs = {};

        var constructElement = this.constructElement;

        var wrapperClass = _classes2['default'].MAIN_WRAPPER;
        var wrapper = this.constructElement({ className: this.wrapperClass ? wrapperClass + ' ' + this.wrapperClass : wrapperClass });
        var flounderClass = _classes2['default'].MAIN;
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

        var selected = constructElement({ className: _classes2['default'].SELECTED_DISPLAYED,
            'data-value': defaultValue.value, 'data-index': defaultValue.index || -1 });
        selected.innerHTML = defaultValue.text;

        var multiTagWrapper = this.props.multiple ? constructElement({ className: _classes2['default'].MULTI_TAG_LIST }) : null;

        if (multiTagWrapper) {
            multiTagWrapper.style.textIndent = this.defaultTextIndent + 'px';
        }

        var arrow = constructElement({ className: _classes2['default'].ARROW });
        var optionsListWrapper = constructElement({ className: _classes2['default'].OPTIONS_WRAPPER + '  ' + _classes2['default'].HIDDEN });
        var optionsList = constructElement({ className: _classes2['default'].LIST });
        optionsListWrapper.appendChild(optionsList);

        [selected, multiTagWrapper, arrow, optionsListWrapper].forEach(function (el) {
            if (el) {
                flounder.appendChild(el);
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
    },

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
    buildData: function buildData(defaultValue, originalData, optionsList, select) {
        originalData = originalData || [];
        var index = 0;
        var data = [];
        var selectOptions = [];
        var constructElement = this.constructElement;
        var addOptionDescription = this.addOptionDescription;
        var selectedClass = this.selectedClass;
        var escapeHTML = this.escapeHTML;
        var addClass = this.addClass;
        var selectRef = this.refs.select;

        /**
         * ## buildDiv
         *
         * builds an individual div tag for a flounder dropdown
         *
         * @param {Object} dataObj [description]
         * @param {Number} i index
         *
         * @return {DOMElement}
         */
        var buildDiv = function buildDiv(dataObj, i) {
            if (typeof dataObj !== 'object') {
                dataObj = {
                    text: dataObj,
                    value: dataObj
                };
            }
            dataObj.index = i;

            var extraClass = i === defaultValue.index ? '  ' + selectedClass : '';

            var res = {
                className: _classes2['default'].OPTION + extraClass,
                'data-index': i
            };

            for (var o in dataObj) {
                if (o !== 'text' && o !== 'description') {
                    res[o] = dataObj[o];
                }
            }

            var data = constructElement(res);
            var escapedText = escapeHTML(dataObj.text);
            data.innerHTML = escapedText;

            if (dataObj.description) {
                addOptionDescription(data, dataObj.description);
            }

            data.className += dataObj.extraClass ? '  ' + dataObj.extraClass : '';

            return data;
        };

        /**
         * ## buildOption
         *
         * builds an individual option tag for a flounder dropdown
         *
         * @param {Object} dataObj [description]
         * @param {Number} i index
         *
         * @return {DOMElement}
         */
        var buildOption = function buildOption(dataObj, i) {
            var selectOption = undefined;

            if (!selectRef) {
                selectOption = constructElement({ tagname: 'option',
                    className: _classes2['default'].OPTION_TAG,
                    value: dataObj.value });
                var escapedText = escapeHTML(dataObj.text);
                selectOption.innerHTML = escapedText;
                select.appendChild(selectOption);
            } else {
                var selectChild = select.children[i];
                selectOption = selectChild;
                selectChild.setAttribute('value', selectChild.value);
            }

            if (i === defaultValue.index) {
                selectOption.selected = true;
            }

            if (selectOption.getAttribute('disabled')) {
                addClass(data[i], _classes2['default'].DISABLED_OPTION);
            }

            return selectOption;
        };

        originalData.forEach(function (dataObj) {
            if (dataObj.header) {
                (function () {
                    var section = constructElement({ tagname: 'div',
                        className: _classes2['default'].SECTION });
                    var header = constructElement({ tagname: 'div',
                        className: _classes2['default'].HEADER });
                    header.textContent = dataObj.header;
                    section.appendChild(header);
                    optionsList.appendChild(section);

                    dataObj.data.forEach(function (d) {
                        data[index] = buildDiv(d, index);
                        section.appendChild(data[index]);
                        selectOptions[index] = buildOption(d, index);
                        index++;
                    });
                })();
            } else {
                data[index] = buildDiv(dataObj, index);
                optionsList.appendChild(data[index]);
                selectOptions[index] = buildOption(dataObj, index);
                index++;
            }
        });

        return [data, selectOptions];
    },

    /**
     * ## Set Target
     *
     * sets the target related
     *
     * @param {DOMElement} target  the actual to-be-flounderized element
     *
     * @return _Void_
     */
    setTarget: function setTarget(target) {
        target = target.nodeType === 1 ? target : document.querySelector(target);

        this.originalTarget = target;
        target.flounder = this;

        if (target.tagName === 'INPUT') {
            this.addClass(target, _classes2['default'].HIDDEN);
            target.setAttribute('aria-hidden', true);
            target.tabIndex = -1;
            target = target.parentNode;
        }

        this.target = target;
    }
};

exports['default'] = build;
module.exports = exports['default'];

},{"./classes":3}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var classes = {
    ARROW: 'flounder__arrow',
    DESCRIPTION: 'flounder__option--description',
    DISABLED: 'flounder__disabled',
    DISABLED_OPTION: 'flounder__disabled--option',
    HEADER: 'flounder__header',
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
    SECTION: 'flounder__section',
    SELECTED: 'flounder__option--selected',
    SELECTED_HIDDEN: 'flounder__option--selected--hidden',
    SELECTED_DISPLAYED: 'flounder__option--selected--displayed',
    SEARCH: 'flounder__input--search',
    SEARCH_HIDDEN: 'flounder--search--hidden',
    SELECT_TAG: 'flounder--select--tag'
};

exports['default'] = classes;
module.exports = exports['default'];

},{}],4:[function(require,module,exports){
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
    data: [],
    defaultTextIndent: 0,
    multiple: false,
    multipleTags: true,
    multipleMessage: '(Multiple Items Selected)',
    onClose: function onClose() {},
    onComponentDidMount: function onComponentDidMount() {},
    onInit: function onInit() {},
    onOpen: function onOpen() {},
    onSelect: function onSelect() {},
    placeholder: 'Please choose an option',
    search: false
};

exports['default'] = defaults;
module.exports = exports['default'];

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _classes = require('./classes');

var _classes2 = _interopRequireDefault(_classes);

var events = {

    /**
     * ## addListeners
     *
     * adds listeners on render
     *
     * @return _Void_
     */
    addListeners: function addListeners(refs, props) {
        var self = this;
        var divertTarget = function divertTarget(e) {
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

        refs.select.addEventListener('change', divertTarget);

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
    },

    /**
     * ## addOptionsListeners
     *
     * adds listeners to the options
     *
     * @return _Void_
     */
    addOptionsListeners: function addOptionsListeners() {
        var _this = this;

        this.refs.data.forEach(function (dataObj, i) {
            if (dataObj.tagName === 'DIV') {
                dataObj.addEventListener('click', _this.clickSet);
            }
        });
    },

    /**
     * ## addSelectKeyListener
     *
     * adds a listener to the selectbox to allow for seeking through the native
     * selectbox on keypress
     *
     * @return _Void_
     */
    addSelectKeyListener: function addSelectKeyListener() {
        var select = this.refs.select;
        select.addEventListener('keyup', this.setSelectValue);
        select.addEventListener('keydown', this.setKeypress);
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
    catchBodyClick: function catchBodyClick(e) {
        if (!this.checkClickTarget(e)) {
            this.toggleList(e);
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
    checkClickTarget: function checkClickTarget(e, target) {
        target = target || this.refs.data[e.target.getAttribute('data-index')] || e.target;

        if (target === document) {
            return false;
        } else if (target === this.refs.flounder) {
            return true;
        }

        return this.checkClickTarget(e, target.parentNode);
    },

    /**
     * ## checkFlounderKeypress
     *
     * checks flounder focused keypresses and filters all but space and enter
     *
     * @return _Void_
     */
    checkFlounderKeypress: function checkFlounderKeypress(e) {
        var keyCode = e.keyCode;

        if (keyCode === 13 || keyCode === 32 && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            this.toggleList(e);
        } else if (keyCode >= 48 && keyCode <= 57 || keyCode >= 65 && keyCode <= 90) // letters - allows native behavior
            {
                var refs = this.refs;

                if (refs.search && e.target.tagName === 'INPUT') {
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
    checkPlaceholder: function checkPlaceholder(e) {
        var type = e.type;
        var refs = this.refs;

        if (type === 'focus') {
            refs.selected.innerHTML = '';
        } else {
            if (refs.multiTagWrapper && refs.multiTagWrapper.children.length === 0) {
                this.refs.selected.innerHTML = this._default.text;
            }
        }
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
    clickSet: function clickSet(e) {
        this.setSelectValue({}, e);

        if (!this.multiple || !e[this.multiSelect]) {
            this.toggleList(e);
        }
    },

    /**
     * ## removeOptionsListeners
     *
     * removes event listeners on the data divs
     *
     * @return _Void_
     */
    removeOptionsListeners: function removeOptionsListeners() {
        var _this2 = this;

        this.refs.data.forEach(function (dataObj) {
            if (dataObj.tagName === 'DIV') {
                dataObj.removeEventListener('click', _this2.clickSet);
            }
        });
    },

    /**
     * ## removeSelectKeyListener
     *
     * disables the event listener on the native select box
     *
     * @return _Void_
     */
    removeSelectKeyListener: function removeSelectKeyListener() {
        var select = this.refs.select;
        select.removeEventListener('keyup', this.setSelectValue);
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
    setKeypress: function setKeypress(e) {
        var refs = this.refs;

        var increment = 0;
        var keyCode = e.keyCode;

        if (this.multipleTags) {
            e.preventDefault();
            return false;
        }

        if (keyCode === 13 || keyCode === 27 || keyCode === 32) // space enter escape
            {
                this.toggleList(e);
                return false;
            } else if (!window.sidebar && keyCode === 38 || keyCode === 40) // up and down
            {
                e.preventDefault();
                var search = refs.search;

                if (search) {
                    search.value = '';
                }

                increment = keyCode - 39;
            } else if (keyCode >= 48 && keyCode <= 57 || keyCode >= 65 && keyCode <= 90) // letters - allows native behavior
            {
                return true;
            }

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
        var dataAtIndex = data[index];

        if (hasClass(dataAtIndex, _classes2['default'].HIDDEN) || hasClass(dataAtIndex, _classes2['default'].SELECTED_HIDDEN) || hasClass(dataAtIndex, _classes2['default'].SEARCH_HIDDEN) || hasClass(dataAtIndex, _classes2['default'].DISABLED)) {
            this.setKeypress(e);
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
    setSelectValue: function setSelectValue(obj, e) {
        var refs = this.refs;
        var keyCode = undefined;

        if (e) // click
            {
                this.setSelectValueClick(e);
            } else // keypress
            {
                keyCode = obj.keyCode;
                this.setSelectValueButton(obj);
            }

        this.displaySelected(refs.selected, refs);

        if (!this.___programmaticClick) {
            // tab, shift, ctrl, alt, caps, cmd
            var nonKeys = [9, 16, 17, 18, 20, 91];

            if (e || keyCode && nonKeys.indexOf(keyCode) === -1) {
                if (this.toggleList.justOpened && !e) {
                    this.toggleList.justOpened = false;
                } else {
                    this.onSelect(e, this.getSelectedValues());
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
    setSelectValueButton: function setSelectValueButton() {
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
    setSelectValueClick: function setSelectValueClick(e) {
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
    toggleList: function toggleList(e, force) {
        var refs = this.refs;
        var optionsList = refs.optionsListWrapper;
        var wrapper = refs.wrapper;
        var hasClass = this.hasClass;

        if (force === 'open' || force !== 'close' && hasClass(optionsList, _classes2['default'].HIDDEN)) {
            if (e.type === 'keydown') {
                this.toggleList.justOpened = true;
            }

            this.toggleOpen(e, optionsList, refs, wrapper);
        } else if (force === 'close' || !hasClass(optionsList, _classes2['default'].HIDDEN)) {
            this.toggleList.justOpened = false;
            this.toggleClosed(e, optionsList, refs, wrapper);
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
    toggleOpen: function toggleOpen(e, optionsList, refs, wrapper) {
        this.addSelectKeyListener();

        if (!this.isIos || this.multipleTags === true && this.multiple === true) {
            this.showElement(optionsList);
            this.addClass(wrapper, 'open');

            var qsHTML = document.querySelector('html');

            qsHTML.addEventListener('click', this.catchBodyClick);
            qsHTML.addEventListener('touchend', this.catchBodyClick);
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
    toggleClosed: function toggleClosed(e, optionsList, refs, wrapper) {
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
};

exports['default'] = events;
module.exports = exports['default'];

},{"./classes":3}],6:[function(require,module,exports){

/* jshint globalstrict: true */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _defaults = require('./defaults');

var _defaults2 = _interopRequireDefault(_defaults);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _api = require('./api');

var _api2 = _interopRequireDefault(_api);

var _build = require('./build');

var _build2 = _interopRequireDefault(_build);

var _events = require('./events');

var _events2 = _interopRequireDefault(_events);

var _classes2 = require('./classes');

var _classes3 = _interopRequireDefault(_classes2);

var nativeSlice = Array.prototype.slice;

var Flounder = (function () {
    _createClass(Flounder, [{
        key: 'arrayOfFlounders',

        /**
         * ## arrayOfFlounders
         *
         * called when a jquery object, microbe, or array is fed into flounder
         * as a target
         *
         * @param {DOMElement} target flounder mount point
         * @param {Object} props passed options
         *
         * @return {Array} array of flounders
         */
        value: function arrayOfFlounders(targets, props) {
            var _this = this;

            targets = nativeSlice.call(targets);

            return targets.map(function (el, i) {
                return new _this.constructor(el, props);
            });
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

            var events = props.events;
            var div = refs.flounder;

            for (var _event in events) {
                div.removeEventListener(_event, events[_event]);
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
         * ## constructor
         *
         * main constuctor
         *
         * @param {DOMElement} target flounder mount point
         * @param {Object} props passed options
         *
         * @return _Object_ new flounder object
         */
    }]);

    function Flounder(target, props) {
        _classCallCheck(this, Flounder);

        if (!target && !props) {
            return this.constructor;
        }

        if (target.length && typeof target !== 'string' && target.tagName !== 'SELECT') {
            return this.arrayOfFlounders(target, props);
        } else if (target.length === 0) {
            throw ': target length cannot equal 0. Flounder cannot continue';
        }

        this.props = props;
        this.setTarget(target);
        this.bindThis();
        this.initialzeOptions();
        this.onInit();
        this.buildDom();
        this.setPlatform();
        this.onRender();
        this.onComponentDidMount();

        return this.refs.flounder.flounder = this.originalTarget.flounder = this;
    }

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

    _createClass(Flounder, [{
        key: 'displayMultipleTags',
        value: function displayMultipleTags(selectedOptions, multiTagWrapper) {
            var span = undefined,
                a = undefined;

            var removeMultiTag = this.removeMultiTag;

            nativeSlice.call(multiTagWrapper.children).forEach(function (el) {
                el.firstChild.removeEventListener('click', removeMultiTag);
            });

            multiTagWrapper.innerHTML = '';

            selectedOptions.forEach(function (option) {
                if (option.value !== '') {
                    span = document.createElement('span');
                    span.className = _classes3['default'].MULTIPLE_SELECT_TAG;

                    a = document.createElement('a');
                    a.className = _classes3['default'].MULTIPLE_TAG_CLOSE;
                    a.setAttribute('data-index', option.index);

                    span.appendChild(a);

                    span.innerHTML += option.innerHTML;

                    multiTagWrapper.appendChild(span);
                } else {
                    option.selected = false;
                }
            });

            this.setTextMultiTagIndent();

            nativeSlice.call(multiTagWrapper.children).forEach(function (el) {
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
            var _this2 = this;

            var refs = this.refs;

            if (!this.toggleList.justOpened) {
                e.preventDefault();
                var keyCode = e.keyCode;

                if (keyCode !== 38 && keyCode !== 40 && keyCode !== 13 && keyCode !== 27) {
                    (function () {
                        var term = e.target.value.toLowerCase();

                        refs.data.forEach(function (dataObj) {
                            var text = dataObj.innerHTML.toLowerCase();

                            if (term !== '' && text.indexOf(term) === -1) {
                                _this2.addClass(dataObj, _classes3['default'].SEARCH_HIDDEN);
                            } else {
                                _this2.removeClass(dataObj, _classes3['default'].SEARCH_HIDDEN);
                            }
                        });
                    })();
                } else {
                    this.setKeypress(e);
                    this.setSelectValue(e);
                }
            } else {
                this.toggleList.justOpened = false;
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
            var _this3 = this;

            var refs = this.refs;

            refs.data.forEach(function (dataObj) {
                _this3.removeClass(dataObj, _classes3['default'].SEARCH_HIDDEN);
            });

            refs.search.value = '';
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

            for (var opt in _defaults2['default']) {
                if (_defaults2['default'].hasOwnProperty(opt) && opt !== 'classes') {
                    this[opt] = props[opt] !== undefined ? props[opt] : _defaults2['default'][opt];
                } else if (opt === 'classes') {
                    var _classes = _defaults2['default'][opt];
                    var propsClasses = props.classes;

                    for (var clss in _classes) {
                        this[clss + 'Class'] = propsClasses && propsClasses[clss] !== undefined ? propsClasses[clss] : _classes[clss];
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
            var _this4 = this;

            var target = this.target;
            var select = undefined;

            if (target.tagName === 'SELECT') {
                (function () {
                    _this4.addClass(target, _classes3['default'].SELECT_TAG);
                    _this4.addClass(target, _classes3['default'].HIDDEN);
                    _this4.refs.select = target;

                    var data = [],
                        selectOptions = [];

                    nativeSlice.apply(target.children).forEach(function (optionEl) {
                        selectOptions.push(optionEl);
                        data.push({
                            text: optionEl.innerHTML,
                            value: optionEl.value
                        });
                    });

                    _this4.data = data;
                    _this4.target = target.parentNode;
                    _this4.refs.selectOptions = selectOptions;

                    select = _this4.refs.select;
                    _this4.addClass(select, _classes3['default'].HIDDEN);
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

            this.addListeners(refs, props);
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
         * ## removeSelectedClass
         *
         * removes the [[this.selectedClass]] from all data
         *
         * @return _Void_
         */
    }, {
        key: 'removeSelectedClass',
        value: function removeSelectedClass(data) {
            var _this5 = this;

            data = data || this.refs.data;

            data.forEach(function (dataObj, i) {
                _this5.removeClass(dataObj, _this5.selectedClass);
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
            var _this6 = this;

            data = data || this.refs.data;

            data.forEach(function (d, i) {
                _this6.refs.select[i].selected = false;
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
            var defaultObj = undefined;
            var self = this;
            var _data = undefined; // internally reorganized data options

            /**
             * ## setIndexDefault
             *
             * sets a specified indexas the default option. This only works correctly
             * if it is a valid index, otherwise it returns null
             *
             * @return {Object} default settings
             */
            var setIndexDefault = function setIndexDefault(_data, index) {
                var defaultIndex = index || index === 0 ? index : configObj.defaultIndex;
                var defaultOption = _data[defaultIndex];

                if (defaultOption) {
                    defaultOption.index = defaultIndex;
                    return defaultOption;
                }

                return null;
            };

            /**
             * ## setPlaceholderDefault
             *
             * sets a placeholder as the default option.  This inserts an empty
             * option first and sets that as default
             *
             * @return {Object} default settings
             */
            var setPlaceholderDefault = function setPlaceholderDefault(_data) {
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
             * ## setValueDefault
             *
             * sets a specified index as the default. This only works correctly if
             * it is a valid value, otherwise it returns null
             *
             * @return {Object} default settings
             */
            var setValueDefault = function setValueDefault(_data) {
                var defaultProp = configObj.defaultValue + '';
                var index = undefined;

                _data.forEach(function (dataObj, i) {
                    if (dataObj.value === defaultProp) {
                        index = i;
                    }
                });

                var defaultValue = index ? data[index] : null;

                if (defaultValue) {
                    defaultValue.index = index;
                    return defaultValue;
                }

                return null;
            };

            /**
             * ## detectHeaders
             *
             * checks the data object for header options, and sorts it accordingly
             *
             * @return _Boolean_ hasHeaders
             */
            var sortData = function sortData(data) {
                var res = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
                var i = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

                data.forEach(function (d) {
                    if (d.header) {
                        res = sortData(d.data, res, i);
                    } else {
                        d.index = i;
                        res.push(d);
                        i++;
                    }
                });

                return res;
            };

            _data = sortData(data);

            if (configObj.placeholder) {
                defaultObj = setPlaceholderDefault(_data);
            } else if (configObj.defaultIndex) {
                defaultObj = setIndexDefault(_data);
            } else if (configObj.defaultValue) {
                defaultObj = setValueDefault(_data);
            }

            return defaultObj || setIndexDefault(_data, 0) || setPlaceholderDefault();
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
            var _this7 = this;

            var search = this.refs.search;
            var offset = this.defaultTextIndent;

            if (search) {
                var _els = document.getElementsByClassName(_classes3['default'].MULTIPLE_SELECT_TAG);
                _els.each(function (i, e) {
                    offset += _this7.getElWidth(e);
                });

                search.style.textIndent = offset + 'px';
            }
        }
    }]);

    return Flounder;
})();

_utils2['default'].extendClass(Flounder, _utils2['default'], _api2['default'], _build2['default'], _events2['default']);

exports['default'] = Flounder;
module.exports = exports['default'];

},{"./api":1,"./build":2,"./classes":3,"./defaults":4,"./events":5,"./utils":7}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _classes = require('./classes');

var _classes2 = _interopRequireDefault(_classes);

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
     * ## getElWidth
     *
     * gets the width adjusted for margins
     *
     * @param {DOMElement} el target element
     *
     * @return _Integer_ adjusted width
     */
    getElWidth: function getElWidth(el) {
        var style = getComputedStyle(el);

        if (el.offsetWidth === 0) {
            if (this.__checkWidthAgain !== true) {
                setTimeout(this.setTextMultiTagIndent.bind(this), 1500);
                this.__checkWidthAgain === true;
            }
        } else {
            this.__checkWidthAgain !== false;
        }

        return el.offsetWidth + parseInt(style['margin-left']) + parseInt(style['margin-right']);
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
     * hideElement
     *
     * hides an element offscreen
     *
     * @param {Object} el element to hide
     *
     * @return _Void_
     */
    hideElement: function hideElement(el) {
        this.addClass(el, _classes2['default'].HIDDEN);
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
    removeClass: function removeClass(el, _class) {
        var baseClass = el.className;
        var baseClassLength = baseClass.length;
        var classLength = _class.length;

        if (baseClass.slice(0, classLength + 1) === _class + ' ') {
            baseClass = baseClass.slice(classLength + 1, baseClassLength);
        } else if (baseClass.slice(baseClassLength - classLength - 1, baseClassLength) === ' ' + _class) {
            baseClass = baseClass.slice(0, baseClassLength - classLength - 1);
        } else if (baseClass.indexOf(' ' + _class + ' ') !== -1) {
            baseClass = baseClass.replace(' ' + _class + ' ', ' ');
        }

        el.className = baseClass.trim();
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
     * ## showElement
     *
     * remove classes.HIDDEN from a given element
     *
     * @param {Object} _el element to show
     *
     * @return _Void_
     */
    showElement: function showElement(_el) {
        this.removeClass(_el, _classes2['default'].HIDDEN);
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

},{"./classes":3}]},{},[6]);
