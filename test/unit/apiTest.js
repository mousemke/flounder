
import Flounder     from '/core/flounder';
import utils        from '/core/utils';
import api          from '/core/api';
import classes      from '/core/classes';

import assert       from 'assert';
import sinon        from 'sinon';



/**
 * ## buildFromUrl
 *
 * uses loadDataFromUrl and completes the entire build with the new data
 *
 * @param {String} url address to get the data from
 * @param {Function} callback function to run after getting the data
 *
 * @return _Void_
 */
describe( 'buildFromUrl', () =>
{
    let flounder = new Flounder( document.querySelector( 'SELECT' ), {} );

    it( 'should work with and without a callback added', () =>
    {
        sinon.stub( flounder, 'rebuild', _r => _r );
        sinon.stub( flounder, 'loadDataFromUrl', ( _r, cb ) => cb( [ 1, 2, 3 ] ) );

        flounder.buildFromUrl( 'http://www.com' );

        assert.equal( flounder.rebuild.callCount, 1 );
        assert.equal( flounder.loadDataFromUrl.callCount, 1 );

        let _cb = sinon.spy();
        flounder.buildFromUrl( 'http://www.com', _cb );

        assert.equal( _cb.callCount, 1 );
        flounder.rebuild.restore();
        flounder.loadDataFromUrl.restore();
    } );
} );


/**
 * ## clickByIndex
 *
 * programatically sets selected by index.  If there are not enough elements
 * to match the index, then nothing is selected. Fires the onClick event
 *
 * @param {Mixed} index index to set flounder to.  _Number, or Array of numbers_
 *
 * return _Void_
 */
describe( 'clickByIndex', () =>
{
    it( 'should pass on it\'s params to it\'s internal function', () =>
    {
        let flounder = new Flounder( document.querySelector( 'SELECT' ), {} );
        sinon.stub( flounder, 'setByIndex', ( _r, _s ) => [ _r, _s ] );

        let res = flounder.clickByIndex( 1, false );
        assert.equal( flounder.setByIndex.callCount, 1 );
        assert.equal( res[0], 1 );
        assert.equal( res[1], false );
    } );
} );


/**
 * ## clickByText
 *
 * programatically sets selected by text string.  If the text string
 * is not matched to an element, nothing will be selected. Fires the onClick event
 *
 * @param {Mixed} text text to set flounder to.  _String, or Array of strings_
 *
 * return _Void_
 */
describe( 'clickByText', () =>
{
    it( 'should pass on it\'s params to it\'s internal function', () =>
    {
        let flounder = new Flounder( document.querySelector( 'SELECT' ), {} );
        sinon.stub( flounder, 'setByText', ( _r, _s ) => [ _r, _s ] );

        let res = flounder.clickByText( 1, false );
        assert.equal( flounder.setByText.callCount, 1 );
        assert.equal( res[0], 1 );
        assert.equal( res[1], false );
    } );
} );


/**
 * ## clickByValue
 *
 * programatically sets selected by value string.  If the value string
 * is not matched to an element, nothing will be selected. Fires the onClick event
 *
 * @param {Mixed} value value to set flounder to.  _String, or Array of strings_
 *
 * return _Void_
 */
describe( 'clickByValue', () =>
{
    it( 'should pass on it\'s params to it\'s internal function', () =>
    {
        let flounder = new Flounder( document.querySelector( 'SELECT' ), {} );
        sinon.stub( flounder, 'setByValue', ( _r, _s ) => [ _r, _s ] );

        let res = flounder.clickByValue( 1, false );
        assert.equal( flounder.setByValue.callCount, 1 );
        assert.equal( res[0], 1 );
        assert.equal( res[1], false );
    } );
} );


/**
 * ## destroy
 *
 * removes flounder and all it`s events from the dom
 *
 * @return _Void_
 */
describe( 'destroy', () =>
{
    let flounder = new Flounder( document.querySelector( 'SELECT' ), { placeholder: 'moon!', data: [1,2,3] } );

    it( 'should destroy all it\'s refs', () =>
    {
        flounder.destroy();
        let ref     = flounder.refs.flounder.flounder instanceof Flounder;
        let oTarget = flounder.originalTarget.flounder instanceof Flounder;
        let target  = flounder.target.flounder instanceof Flounder;

        assert.ok( ( !ref && !oTarget && !target ), 'and removes them all' );
    } );


    it( 'should detect that it has already been reemoved', () =>
    {
        flounder = new Flounder( document.querySelector( 'DIV' ), {} );
        let wrapper = flounder.refs.wrapper;

        wrapper.parentNode.removeChild( wrapper );

        assert.throws( flounder.destroy, ' : this flounder may have already been removed' );
    } );
} );


/**
 * ## deselectAll
 *
 * deslects all data
 *
 * @return _Void_
 */
describe( 'deselectAll', () =>
{

} );


/**
 * ## disable
 *
 * disables flounder by adjusting listeners and classes
 *
 * @param {Boolean} bool dsable or enable
 *
 * @return _Void_
 */
describe( 'disable', () =>
{

} );


/**
 * ## disableByIndex
 *
 * disables the options with the given index
 *
 * @param {Mixed} i index of the option
 * @param {Boolean} reenable enables the option instead
 *
 * return _Void_
 */
describe( 'disableByIndex', () =>
{

} );


/**
 * ## disableByText
 *
 * disables THE FIRST option that has the given value
 *
 * @param {Mixed} value value of the option
 * @param {Boolean} reenable enables the option instead
 *
 * return _Void_
 */
describe( 'disableByText', () =>
{

} );


/**
 * ## disableByValue
 *
 * disables THE FIRST option that has the given value
 *
 * @param {Mixed} value value of the option
 * @param {Boolean} reenable enables the option instead
 *
 * return _Void_
 */
describe( 'disableByValue', () =>
{

} );



/**
 * ## enableByIndex
 *
 * shortcut syntax to enable an index
 *
 * @param {Mixed} index index of the option to enable
 *
 * @return {Object} flounder(s)
 */
describe( 'enableByIndex', () =>
{

} );


/**
 * ## enableByText
 *
 * shortcut syntax to enable by text
 *
 * @param {Mixed} text text of the option to enable
 *
 * @return {Object} flounder(s)
 */
describe( 'enableByText', () =>
{

} );


/**
 * ## enableByValue
 *
 * shortcut syntax to enable a value
 *
 * @param {Mixed} value value of the option to enable
 *
 * @return {Object} flounder(s)
 */
describe( 'enableByValue', () =>
{

} );


/**
 * ## getData
 *
 * returns the option and div tags related to an option
 *
 * @param {Number} _i index to return
 *
 * @return _Object_ option and div tage
 */
describe( 'getData', () =>
{

} );


/**
 * ## getSelected
 *
 * returns the currently selected data of a SELECT box
 *
 * @return _Void_
 */
describe( 'getSelected', () =>
{

} );


/**
 * ## getSelectedValues
 *
 * returns the values of the currently selected data
 *
 * @return _Void_
 */
describe( 'getSelectedValues', () =>
{

} );


/**
 * ## loadDataFromUrl
 *
 * loads data from a passed url
 *
 * @param {String} url address to get the data from
 * @param {Function} callback function to run after getting the data
 *
 * @return _Void_
 */
describe( 'loadDataFromUrl', () =>
{

} );


/**
 * ## rebuild
 *
 * after editing the data, this can be used to rebuild them
 *
 * @param {Array} data array with option information
 *
 * @return _Object_ rebuilt flounder object
 */
describe( 'rebuild', () =>
{

} );


/**
 * ## setByIndex
 *
 * programatically sets the value by index.  If there are not enough elements
 * to match the index, then nothing is selected.
 *
 * @param {Mixed} index index to set flounder to.  _Number, or Array of numbers_
 *
 * return _Void_
 */
describe( 'setByIndex', () =>
{

} );


/**
 * ## setByText
 *
 * programatically sets the text by string.  If the text string
 * is not matched to an element, nothing will be selected
 *
 * @param {Mixed} text text to set flounder to.  _String, or Array of strings_
 *
 * return _Void_
 */
describe( 'setByText', () =>
{

} );


/**
 * ## setByValue
 *
 * programatically sets the value by string.  If the value string
 * is not matched to an element, nothing will be selected
 *
 * @param {Mixed} value value to set flounder to.  _String, or Array of strings_
 *
 * return _Void_
 */
describe( 'setByValue', () =>
{

} );
