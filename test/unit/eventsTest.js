
import Flounder     from '/core/flounder';
import defaults     from '/core/defaults';

import classes      from '/core/classes';
import search       from '/core/search';
import utils        from '/core/utils';
import keycodes     from '/core/keycodes';

import assert       from 'assert';
import sinon        from 'sinon';



/**
 * ## addFirstTouchListeners
 *
 * adds the listeners for onFirstTouch
 *
 * @return _Void_
 */
describe( 'addFirstTouchListeners', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## addHoverClass
 *
 * adds a hover class to an element
 *
 * @return Void_
 */
describe( 'addHoverClass', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## addListeners
 *
 * adds listeners on render
 *
 * @return _Void_
 */
describe( 'addListeners', () =>
{
    it( 'should', () =>
    {

    } );
} );



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
describe( 'addMultipleTags', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## addOptionsListeners
 *
 * adds listeners to the options
 *
 * @return _Void_
 */
describe( 'addOptionsListeners', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## addPlaceholder
 *
 * called on body click, this determines what (if anything) should be
 * refilled into the the placeholder position
 *
 * @return _Void_
 */
describe( 'addPlaceholder', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## addSearchListeners
 *
 * adds listeners to the search box
 *
 * @return _Void_
 */
describe( 'addSearchListeners', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## addSelectKeyListener
 *
 * adds a listener to the selectbox to allow for seeking through the native
 * selectbox on keypress
 *
 * @return _Void_
 */
describe( 'addSelectKeyListener', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## catchBodyClick
 *
 * checks if a click is on the menu and, if it isnt, closes the menu
 *
 * @param  {Object} e event object
 *
 * @return _Void_
 */
describe( 'catchBodyClick', () =>
{
    it( 'should', () =>
    {

    } );
} );



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
describe( 'checkClickTarget', () =>
{
    it( 'should', () =>
    {

    } );
} );



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
describe( 'checkEnterOnSearch', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## checkFlounderKeypress
 *
 * checks flounder focused keypresses and filters all but space and enter
 *
 * @return _Void_
 */
describe( 'checkFlounderKeypress', () =>
{
    it( 'should', () =>
    {

    } );
} );



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
describe( 'checkMultiTagKeydown', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## checkPlaceholder
 *
 * clears or re-adds the placeholder
 *
 * @param {Object} e event object
 *
 * @return _Void_
 */
describe( 'checkPlaceholder', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## clickSet
 *
 * when a flounder option is clicked on it needs to set the option as selected
 *
 * @param {Object} e event object
 *
 * @return _Void_
 */
describe( 'clickSet', () =>
{
    it( 'should', () =>
    {

    } );
} );



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
describe( 'displayMultipleTags', () =>
{
    it( 'should', () =>
    {

    } );
} );



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
describe( 'displaySelected', () =>
{
    it( 'should', () =>
    {

    } );
} );



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
describe( 'divertTarget', () =>
{
    it( 'should', () =>
    {

    } );
} );



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
describe( 'firstTouchController', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## removeHoverClass
 *
 * removes a hover class from an element
 *
 * @return Void_
 */
describe( 'removeHoverClass', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## removeListeners
 *
 * removes event listeners from flounder.  normally pre unload
 *
 * @return _Void_
 */
describe( 'removeListeners', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## removeMultiTag
 *
 * removes a multi selection tag on click; fixes all references to value and state
 *
 * @param  {Object} e event object
 *
 * @return _Void_
 */
describe( 'removeMultiTag', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## removeOptionsListeners
 *
 * removes event listeners on the data divs
 *
 * @return _Void_
 */
describe( 'removeOptionsListeners', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## removeSearchListeners
 *
 * removes the listeners from the search input
 *
 * @return _Void_
 */
describe( 'removeSearchListeners', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## removeSelectedClass
 *
 * removes the [[this.selectedClass]] from all data
 *
 * @return _Void_
 */
describe( 'removeSelectedClass', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## removeSelectedValue
 *
 * sets the selected property to false for all data
 *
 * @return _Void_
 */
describe( 'removeSelectedValue', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## removeSelectKeyListener
 *
 * disables the event listener on the native select box
 *
 * @return _Void_
 */
describe( 'removeSelectKeyListener', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## setKeypress
 *
 * handles arrow key selection
 *
 * @param {Object} e event object
 *
 * @return _Void_
 */
describe( 'setKeypress', () =>
{
    it( 'should', () =>
    {

    } );
} );



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
describe( 'setSelectValue', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## setSelectValueButton
 *
 * processes the setting of a value after a keypress event
 *
 * @return _Void_
 */
describe( 'setSelectValueButton', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## setSelectValueClick
 *
 * processes the setting of a value after a click event
 *
 * @param {Object} e event object
 *
 * @return _Void_
 */
describe( 'setSelectValueClick', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## setTextMultiTagIndent
 *
 * sets the text-indent on the search field to go around selected tags
 *
 * @return _Void_
 */
describe( 'setTextMultiTagIndent', () =>
{
    it( 'should', () =>
    {

    } );
} );



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

describe( 'toggleClosed', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## toggleList
 *
 * on click of flounder--selected, this shows or hides the options list
 *
 * @param {String} force toggle can be forced by passing 'open' or 'close'
 *
 * @return _Void_
 */
describe( 'toggleList', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## toggleListSearchClick
 *
 * toggleList wrapper for search.  only triggered if flounder is closed
 *
 * @return _Void_
 */
describe( 'toggleListSearchClick', () =>
{
    it( 'should', () =>
    {

    } );
} );



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
describe( 'toggleOpen', () =>
{
    it( 'should', () =>
    {

    } );
} );
