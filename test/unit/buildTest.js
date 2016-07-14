
import Flounder     from '/core/flounder';
import defaults     from '/core/defaults';

import classes      from '/core/classes';
import search       from '/core/search';
import utils        from '/core/utils';
import keycodes     from '/core/keycodes';

import assert       from 'assert';
import sinon        from 'sinon';



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
describe( 'addOptionDescription', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## addSearch
 *
 * checks if a search box is required and attaches it or not
 *
 * @param {Object} flounder main element reference
 *
 * @return _Mixed_ search node or false
 */
describe( 'addSearch', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## bindThis
 *
 * binds this to whatever functions need it.  Arrow functions cannot be used
 * here due to the react extension needing them as well;
 *
 * @return _Void_
 */
describe( 'bindThis', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## buildArrow
 *
 * builds the arrow and the
 *
 * @param {Object} props property object
 * @param {Function} constructElement ref to this.constructElement
 *
 * @return {DOMElement} arrow
 */
describe( 'buildArrow', () =>
{
    it( 'should', () =>
    {

    } );
} );



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
describe( 'buildData', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## buildDom
 *
 * builds flounder
 *
 * @return _Void_
 */
describe( 'buildDom', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## buildMultiTag
 *
 * builds and returns a single multiTag
 *
 * @param {String} optionText text to add to the tag and role
 *
 * @return _DOMElement_ option tag
 */
describe( 'buildMultiTag', () =>
{
    it( 'should', () =>
    {

    } );
} );



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
describe( 'initSelectBox', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## popInSelectElements
 *
 * pops the previously saves elements back into a select tag, restoring the
 * original state
 *
 * @param {DOMElement} select select element
 *
 * @return _Void_
 */
describe( 'popInSelectElements', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## popOutSelectElements
 *
 * pops out all the options of a select box, clones them, then appends the
 * clones.  This gives us the ability to restore the original tag
 *
 * @param {DOMElement} select select element
 *
 * @return _Void_
 */
describe( 'popOutSelectElements', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## reconfigure
 *
 * after editing the data, this can be used to rebuild them
 *
 * @param {Object} props object containing config options
 *
 * @return _Object_ rebuilt flounder object
 */
describe( 'reconfigure', () =>
{
    it( 'should', () =>
    {

    } );
} );



/**
 * ## setTarget
 *
 * sets the target related
 *
 * @param {DOMElement} target  the actual to-be-flounderized element
 *
 * @return _Void_
 */
describe( 'setTarget', () =>
{
    it( 'should', () =>
    {

    } );
} );
