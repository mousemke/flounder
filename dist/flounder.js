(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/* jshint globalstrict: true */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _slice = Array.prototype.slice;

var Flounder = (function () {
    _createClass(Flounder, [{
        key: 'addClass',

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
        value: function addClass(_el, _class) {
            var _elClass = _el.className;
            var _elClassLength = _elClass.length;

            if (_elClass.indexOf(' ' + _class + ' ') === -1 && _elClass.slice(0, _class.length + 1) !== _class + ' ' && _elClass.slice(_elClassLength - _class.length - 1, _elClassLength) !== ' ' + _class) {
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
            _e.className = 'flounder__option--description';
            _el.appendChild(_e);
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
                    className: 'flounder__input--search'
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

            var wrapper = constructElement({ className: 'flounder-wrapper  flounder__input--select' });

            var flounderClass = 'flounder' + (this.props.className ? '  ' + this.props.className : '');
            var flounder = constructElement({ className: flounderClass });
            flounder.tabIndex = 0;
            wrapper.appendChild(flounder);

            var select = this.initSelectBox(wrapper);
            select.tabIndex = -1;

            if (this.multiple === true) {
                select.setAttribute('multiple', '');
            }

            var _options = this.options;

            var _default = this._default = this.setDefaultOption(this._default, _options);

            var selected = constructElement({ className: 'flounder__option--selected--displayed',
                'data-value': _default.value });
            selected.innerHTML = _default.text;

            var multiTagWrapper = this.props.multiple ? constructElement({ className: 'multi--tag--list' }) : null;

            if (multiTagWrapper !== null) {
                multiTagWrapper.style.textIndent = this.defaultTextIndent + 'px';
            }

            var arrow = constructElement({ className: 'flounder__arrow' });
            var optionsListWrapper = constructElement({ className: 'flounder__list-wrapper  flounder--hidden' });
            var optionsList = constructElement({ className: 'flounder__list' });
            optionsListWrapper.appendChild(optionsList);

            [selected, multiTagWrapper, arrow, optionsListWrapper].forEach(function (_el) {
                if (_el) {
                    flounder.appendChild(_el);
                }
            });

            var search = this.addSearch(flounder);

            var _buildOptions = this.buildOptions(_default, _options, optionsList, select);

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
         * @param {Mixed} _default default entry (string or number)
         * @param {Array} _options array with optino information
         * @param {Object} optionsList reference to the div option wrapper
         * @param {Object} select reference to the select box
         *
         * @return _Array_ refs to both container elements
         */
    }, {
        key: 'buildOptions',
        value: function buildOptions(_default, _options, optionsList, select) {
            var _this = this;

            var options = [];
            var selectOptions = [];
            var constructElement = this.constructElement;
            var addOptionDescription = this.addOptionDescription;

            _options.forEach(function (_option, i) {
                if (typeof _option === 'string') {
                    _option = {
                        text: _option,
                        value: _option
                    };
                }

                var escapedText = _this.escapeHTML(_option.text);
                var extraClass = i === _default.index ? '  ' + _this.selectedClass : '';

                var res = {
                    className: 'flounder__option' + extraClass,
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

                if (!_this.refs.select) {
                    selectOptions[i] = constructElement({ tagname: 'option',
                        className: 'flounder--option--tag',
                        value: _option.value });
                    selectOptions[i].innerHTML = escapedText;
                    select.appendChild(selectOptions[i]);

                    if (i === _default.index) {
                        selectOptions[i].selected = true;
                    }
                } else {
                    selectOptions[i] = select.children[i];
                }

                if (selectOptions[i].getAttribute('disabled')) {
                    _this.addClass(options[i], 'flounder--disabled');
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
                if (this.cancelFunc) {
                    this.cancelFunc(e);
                }
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
            target = target || e.target;

            if (target === document) {
                return false;
            } else if (target === this.refs.flounder) {
                return true;
            }

            return this.checkClickTarget(e, target.parentNode);
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
            var _this2 = this;

            var props = this.props;
            var refs = this.refs;

            var _events = props.events;
            var _div = refs.flounder;

            for (var _event in _events) {
                _div.removeEventListener(_event, _events[_event]);
            }

            refs.options.forEach(function (_option) {
                if (_option.tagName === 'DIV') {
                    _option.removeEventListener('click', _this2.clickSet);
                }
            });

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
    }]);

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
        var _this3 = this;

        _classCallCheck(this, Flounder);

        this.constructElement = function (_elObj) {
            var _el = document.createElement(_elObj.tagname || 'div');

            _this3.attachAttributes(_el, _elObj);

            return _el;
        };

        if (target && target.length !== 0) {
            this.props = props;
            target = target.jquery ? target[0] : target;
            target = target.nodeType === 1 ? target : document.querySelector(target);

            if (target.tagName === 'INPUT') {
                this.addClass(target, 'flounder--hidden');
                target.tabIndex = -1;
                target = target.parentNode;
            }

            this.target = target;

            this.bindThis();

            this.initialzeOptions();

            if (this.initFunc) {
                this.initFunc();
            }

            this.buildDom();

            this.setPlatform();

            this.onRender();

            if (this.componentDidMountFunc) {
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

    _createClass(Flounder, [{
        key: 'destroy',
        value: function destroy() {
            this.componentWillUnmount();
            var target = this.target;
            target.parentNode.removeChild(target);
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
                _a = undefined,
                refs = this.refs;

            var removeMultiTag = this.removeMultiTag;

            _slice.call(multiTagWrapper.children).forEach(function (el) {
                el.firstChild.removeEventListener('click', removeMultiTag);
            });

            multiTagWrapper.innerHTML = '';

            selectedOptions.forEach(function (option) {
                _span = document.createElement('span');
                _span.className = 'flounder__multiple--select--tag';

                _a = document.createElement('a');
                _a.className = 'flounder__multiple__tag__close';
                _a.setAttribute('data-index', option.index);

                _span.appendChild(_a);

                _span.innerHTML += option.innerHTML;

                multiTagWrapper.appendChild(_span);
            });

            this.setTextMultiTagIndent();

            _slice.call(multiTagWrapper.children).forEach(function (el) {
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

            var selectedOption = _slice.call(this.getSelectedOptions(refs.select));
            var selectedLength = selectedOption.length;
            var multiple = this.multiple;

            if (!multiple || !this.multipleTags && selectedLength === 1) {
                selected.innerHTML = selectedOption[0].innerHTML;
                value = selectedOption[0].value;
            } else if (selectedLength === 0) {
                var _default = this._default;

                selected.innerHTML = _default.text;
                value = _default.value;
            } else {
                if (this.multipleTags) {
                    selected.innerHTML = '';
                    this.displayMultipleTags(selectedOption, this.refs.multiTagWrapper);
                } else {
                    selected.innerHTML = this.multipleMessage;
                }

                value = selectedOption.map(function (option) {
                    return option.value;
                });
            }

            selected.setAttribute('data-value', value);
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
                            _this4.addClass(_option, 'flounder--search--hidden');
                        } else {
                            _this4.removeClass(_option, 'flounder--search--hidden');
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
                _this5.removeClass(_option, 'flounder--search--hidden');
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
         * ## getSelectedOptions
         *
         * returns the currently selected otions of a SELECT box
         *
         * @param {Object} _el select box
         */
    }, {
        key: 'getSelectedOptions',
        value: function getSelectedOptions(_el) {
            if (_el.selectedOptions) {
                return _el.selectedOptions;
            } else {
                var opts = [],
                    opt;
                var _options = _el.options;

                for (var i = 0, len = _options.length; i < len; i++) {
                    opt = _options[i];

                    if (opt.selected) {
                        opts.push(opt);
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
    }, {
        key: 'hideElement',
        value: function hideElement(_el) {
            this.addClass(_el, 'flounder--hidden');
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
            this.initFunc = props.init !== undefined ? props.init : false;
            this.openFunc = props.open !== undefined ? props.open : false;
            this.selectFunc = props.select !== undefined ? props.select : false;
            this.cancelFunc = props.cancel !== undefined ? props.cancel : false;
            this.closeFunc = props.close !== undefined ? props.close : false;
            this.componentDidMountFunc = props.componentDidMount !== undefined ? props.componentDidMount : false;
            this.multiple = props.multiple !== undefined ? props.multiple : false;
            this.multipleTags = props.multipleTags !== undefined ? props.multipleTags : true;

            if (!this.multiple) {
                this.multipleTags = false;
            }

            this.multipleMessage = props.multipleMessage !== undefined ? props.multipleMessage : '(Multiple Items Selected)';
            this.hiddenClass = props.hiddenClass !== undefined ? props.hiddenClass : 'flounder--hidden';
            this.defaultTextIndent = props.defaultTextIndent !== undefined ? props.defaultTextIndent : 0;
            this.options = props.options !== undefined ? props.options : [];
            this.selectedClass = props.selectedClass !== undefined ? props.selectedClass : 'flounder__option--selected';

            if (this.multipleTags) {
                this.selectedClass += '  flounder__option--selected--hidden';
            }

            this._default = '';
            if (props._default || props._default === 0) {
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
    }, {
        key: 'initSelectBox',
        value: function initSelectBox(wrapper) {
            var _this6 = this;

            var target = this.target;
            var select = undefined;

            if (target.tagName === 'SELECT') {
                (function () {
                    _this6.addClass(target, 'flounder--select--tag');
                    _this6.addClass(target, 'flounder--hidden');
                    _this6.refs.select = target;

                    var options = [],
                        selectOptions = [];
                    _slice.apply(target.children).forEach(function (optionEl) {
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
                    _this6.addClass(select, 'flounder--hidden');
                })();
            } else {
                select = this.constructElement({ tagname: 'select', className: 'flounder--select--tag  flounder--hidden' });
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
            var _this7 = this;

            var props = this.props;
            var refs = this.refs;
            var options = refs.options;

            if (!!this.isIos && (!this.multipleTags || !this.multiple)) {
                var sel = refs.select;
                this.removeClass(sel, 'flounder--hidden');
                this.addClass(sel, 'flounder--hidden--ios');
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

            options.forEach(function (option, i) {
                if (option.tagName === 'DIV') {
                    option.addEventListener('click', _this7.clickSet);
                }
            });

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
            var refs = this.refs;
            var select = refs.select;
            var selected = refs.selected;
            var target = e.target;
            var index = target.getAttribute('data-index');
            select[index].selected = false;

            var selectedOptions = _slice.call(this.getSelectedOptions(select));

            this.removeClass(refs.options[index], 'flounder__option--selected--hidden');
            this.removeClass(refs.options[index], 'flounder__option--selected');

            var span = target.parentNode;
            span.parentNode.removeChild(span);

            if (selectedOptions.length === 0) {
                selected.innerHTML = this._default.text;
                value = this._default.value;
            } else {
                value = selectedOptions.map(function (option) {
                    return option.value;
                });
            }

            this.setTextMultiTagIndent();

            selected.setAttribute('data-value', value);

            if (this.selectFunc) {
                this.selectFunc(e);
            }
        }
    }, {
        key: 'removeSelectKeyListener',

        /**
         * ## removeSelectKeyListener
         *
         * disables the event listener on the native select box
         *
         * @return _Void_
         */
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
            var _this8 = this;

            options.forEach(function (_option, i) {
                _this8.removeClass(_option, _this8.selectedClass);
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
            var _this9 = this;

            options.forEach(function (_option, i) {
                _this9.refs.select[i].selected = false;
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
            var _default = '';

            if (typeof defaultProp === 'number') {
                _default = options[defaultProp];
                _default.index = defaultProp;
            } else if (typeof defaultProp === 'string') {
                _default = {
                    text: defaultProp,
                    value: defaultProp
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
                return;
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

            var optionClassName = options[index].className;

            if (optionClassName.indexOf('flounder--hidden') !== -1 && optionClassName.indexOf('flounder__option--selected--hidden') !== -1) {
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

            if (e) // click
                {
                    this.setSelectValueClick(e);
                } else // keypress
                {
                    if (this.multipleTags) {
                        obj.preventDefault();
                        obj.stopPropagation();

                        return false;
                    }

                    this.setSelectValueButton(obj);
                }

            this.displaySelected(refs.selected, refs);

            if (this.selectFunc) {
                this.selectFunc(e);
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

            var optionsArray = this.getSelectedOptions(select);
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
                this.removeSelectedClass(options);
                this.removeSelectedValue(options);
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
            var _this10 = this;

            var search = this.refs.search;
            var offset = this.defaultTextIndent;

            if (search) {
                $('.flounder__multiple--select--tag').each(function (i, e) {
                    offset += _this10.getActualWidth(e);
                });

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
    }, {
        key: 'showElement',
        value: function showElement(_el) {
            this.removeClass(_el, 'flounder--hidden');
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

            if (_el.className.indexOf(_class) !== -1) {
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
            var isIos = this.isIos;

            if (force === 'open' || force !== 'close' && optionsList.className.indexOf('flounder--hidden') !== -1) {
                this.addSelectKeyListener();

                if (!isIos || this.multipleTags === true && this.multiple === true) {
                    this.showElement(optionsList);
                    this.addClass(wrapper, 'open');

                    document.querySelector('html').addEventListener('click', this.catchBodyClick);
                    document.querySelector('html').addEventListener('touchend', this.catchBodyClick);
                }

                if (this.props.search) {
                    refs.search.focus();
                }

                if (this.openFunc) {
                    this.openFunc(e);
                }
            } else if (force === 'close' || optionsList.className.indexOf('flounder--hidden') === -1) {
                this.hideElement(optionsList);
                this.removeSelectKeyListener();
                this.removeClass(wrapper, 'open');

                document.querySelector('html').removeEventListener('click', this.catchBodyClick);
                document.querySelector('html').removeEventListener('touchend', this.catchBodyClick);

                if (this.props.search) {
                    this.fuzzySearchReset();
                }

                refs.flounder.focus();

                if (this.closeFunc) {
                    this.closeFunc(e);
                }
            }
        }
    }]);

    return Flounder;
})();

if (window) {
    window.Flounder = Flounder;
}

exports['default'] = Flounder;
module.exports = exports['default'];

},{}]},{},[1]);
