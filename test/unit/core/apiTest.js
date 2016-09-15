/* globals describe, it, document, console */
import Flounder     from '/core/flounder';
import utils        from '/core/utils';
import classes      from '/core/classes';

import assert       from 'assert';
import sinon        from 'sinon';

const noop = () =>
{};

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
    const flounder = new Flounder( document.querySelector( 'SELECT' ), {} );

    it( 'should work with and without a callback added', () =>
    {
        sinon.stub( flounder, 'rebuild', _r => _r );
        sinon.stub( flounder, 'loadDataFromUrl', ( _r, cb ) => cb( [ 1, 2 ] ) );

        flounder.buildFromUrl( 'http://www.com' );

        assert.equal( flounder.rebuild.callCount, 1 );
        assert.equal( flounder.loadDataFromUrl.callCount, 1 );

        const cb = sinon.spy();
        flounder.buildFromUrl( 'http://www.com', cb );

        assert.equal( cb.callCount, 1 );
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
        const flounder = new Flounder( document.querySelector( 'SELECT' ), {} );
        sinon.stub( flounder, 'setByIndex', ( _r, _s ) => [ _r, _s ] );

        const res = flounder.clickByIndex( 1, false );
        assert.equal( flounder.setByIndex.callCount, 1 );
        assert.equal( res[ 0 ], 1 );
        assert.equal( res[ 1 ], false );
    } );
} );


/**
 * ## clickByText
 *
 * programatically sets selected by text string.  If the text string
 * is not matched to an element, nothing will be selected. Fires the
 * onClick event
 *
 * @param {Mixed} text text to set flounder to.  _String, or Array of strings_
 *
 * return {Void} void
 */
describe( 'clickByText', () =>
{
    it( 'should pass on it\'s params to it\'s internal function', () =>
    {
        const flounder = new Flounder( document.querySelector( 'SELECT' ), {} );
        sinon.stub( flounder, 'setByText', ( _r, _s ) => [ _r, _s ] );

        const res = flounder.clickByText( 1, false );
        assert.equal( flounder.setByText.callCount, 1 );
        assert.equal( res[ 0 ], 1 );
        assert.equal( res[ 1 ], false );
    } );
} );


/**
 * ## clickByValue
 *
 * programatically sets selected by value string.  If the value string
 * is not matched to an element, nothing will be selected. Fires
 * the onClick event
 *
 * @param {Mixed} value value to set flounder to.  _String, or Array of strings_
 *
 * return _Void_
 */
describe( 'clickByValue', () =>
{
    it( 'should pass on it\'s params to it\'s internal function', () =>
    {
        const flounder = new Flounder( document.querySelector( 'SELECT' ), {} );
        sinon.stub( flounder, 'setByValue', ( _r, _s ) => [ _r, _s ] );

        const res = flounder.clickByValue( 1, false );
        assert.equal( flounder.setByValue.callCount, 1 );
        assert.equal( res[ 0 ], 1 );
        assert.equal( res[ 1 ], false );
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
    let flounder = new Flounder( document.querySelector( 'SELECT' ), {
        placeholder : 'moon!',
        data        : [ 1, 2, 3 ]
    } );

    it( 'should destroy all it\'s refs', () =>
    {
        flounder.destroy();
        const ref     = flounder.refs.flounder.flounder instanceof Flounder;
        const oTarget = flounder.originalTarget.flounder instanceof Flounder;
        const target  = flounder.target.flounder instanceof Flounder;

        assert.ok( !ref && !oTarget && !target, 'and removes them all' );
    } );


    it( 'should choose it\'s remaining element carefully', () =>
    {
        const input   = document.querySelector( 'INPUT' );
        const select  = document.querySelector( 'SELECT' );

        flounder    = new Flounder( input,  {
            placeholder : 'moon!',
            data        : [ 1, 2, 3 ]
        } );
        flounder.destroy();

        assert.ok( input.parentNode );


        flounder    = new Flounder( select,  {
            placeholder : 'moon!',
            data        : [ 1, 2, 3 ]
        } );

        flounder.originalTarget[ 0 ] = {
            className : classes.PLACEHOLDER
        };

        sinon.stub( flounder.originalTarget, 'removeChild', noop );
        flounder.destroy();

        assert.equal( flounder.originalTarget.removeChild.callCount, 5 );
        flounder.originalTarget.removeChild.restore();
        assert.ok( select.parentNode );
    } );


    it( 'should detect that an input/select has already been removed', () =>
    {
        flounder    = new Flounder( document.querySelector( 'INPUT' ), {} );
        const wrapper = flounder.refs.wrapper;

        wrapper.parentNode.removeChild( wrapper );

        assert.throws( flounder.destroy.bind( flounder ),
                        /: this flounder may have already been removed/ );
    } );


    it( 'should detect that a non input/select has already been removed', () =>
    {
        document.body.flounder = null;
        flounder    = new Flounder( document.body, {} );
        const wrapper = flounder.refs.wrapper;

        wrapper.parentNode.removeChild( wrapper );

        assert.throws( flounder.destroy.bind( flounder ),
                        /: this flounder may have already been removed/ );
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
    const div = document.querySelector( 'div' );

    it( 'should deselect all options', () =>
    {
        const flounder = new Flounder( div, {
            multiple : true,
            data     : [ 1, 2, 3 ]
        } );

        flounder.setByIndex( 1, true );
        flounder.setByIndex( 2, true );

        assert.equal( flounder.getSelected().length, 2 );

        flounder.deselectAll();
        assert.equal( flounder.getSelected().length, 0 );

        flounder.destroy();
    } );


    it( 'should remove all multipleTags', () =>
    {
        const flounder = new Flounder( div, {
            multipleTags : true,
            data         : [ 1, 2, 3 ]
        } );

        flounder.clickByIndex( 1, true );
        flounder.clickByIndex( 2, true );

        assert.equal( flounder.getSelected().length, 2 );

        flounder.deselectAll();
        assert.equal( flounder.getSelected().length, 0 );

        flounder.destroy();
    } );
} );


/**
 * ## disable
 *
 * disables flounder by adjusting listeners and classes
 *
 * @param {Boolean} bool disable or enable
 *
 * @return _Void_
 */
describe( 'disable', () =>
{
    const div = document.querySelector( 'div' );

    const flounder    = new Flounder( div, {
        data : [ 1, 2, 3 ]
    } );
    const refs        = flounder.refs;
    const selected    = refs.selected;
    const flounderEl  = refs.flounder;

    it( 'should disable flounder', () =>
    {
        flounder.disable( true );
        assert.ok( utils.hasClass( selected, classes.DISABLED ) );
        assert.ok( utils.hasClass( flounderEl, classes.DISABLED ) );
    } );


    it( 'should enable flounder', () =>
    {
        flounder.disable();
        assert.ok( !utils.hasClass( selected, classes.DISABLED ) );
        assert.ok( !utils.hasClass( flounderEl, classes.DISABLED ) );
    } );
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
    const div         = document.querySelector( 'div' );
    const flounder    = new Flounder( div, {
        data : [ 1, 2, 3 ]
    } );
    let arrayRes;
    let singleRes;

    it( 'should be able to handle an array of indexes to disable', () =>
    {
        arrayRes    = flounder.disableByIndex( [ 1, 2 ] );
        assert.equal( flounder.refs.select.children[ 1 ].disabled, true );
        assert.equal( utils.hasClass( flounder.refs.data[ 2 ],
                                                    classes.DISABLED ), true );
    } );


    it( 'should be able to re-enable things as well', () =>
    {
        flounder.disableByIndex( 2, true );
        assert.equal( flounder.refs.select.children[ 2 ].disabled, false );
        assert.equal( utils.hasClass( flounder.refs.data[ 2 ],
                                                    classes.DISABLED ), false );
    } );


    it( 'should be able to start with negative numbers', () =>
    {
        singleRes = flounder.disableByIndex( -1 );
        assert.equal( flounder.refs.select.children[ 2 ].disabled, true );
        assert.equal( utils.hasClass( flounder.refs.data[ 2 ],
                                                    classes.DISABLED ), true );
    } );


    it( 'should skip and warn when there was no match', () =>
    {
        sinon.stub( console, 'warn', noop );
        flounder.disableByIndex( 15 );

        assert.equal( console.warn.callCount, 1 );
        console.warn.restore();
        assert.equal( flounder.refs.select.children[ 2 ].disabled, true );
        assert.equal( utils.hasClass( flounder.refs.data[ 2 ],
                                                    classes.DISABLED ), true );
    } );


    it( 'should return the affected elements', () =>
    {
        assert.equal( arrayRes.length, 2 );
        assert.equal( arrayRes[ 0 ].length, 2 );
        assert.equal( arrayRes[ 0 ][ 1 ].nodeType, 1 );

        assert.equal( singleRes[ 1 ].nodeType, 1 );
    } );
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
    const div         = document.querySelector( 'div' );
    const flounder    = new Flounder( div, {
        data : [ 1, 2, 3 ]
    } );
    let arrayRes;
    let singleRes;

    it( 'should be able to handle an array of text to disable', () =>
    {
        arrayRes = flounder.disableByText( [ '1', '2' ] );
        assert.equal( flounder.refs.select.children[ 0 ].disabled, true );
        assert.equal( utils.hasClass( flounder.refs.data[ 1 ],
                                                    classes.DISABLED ), true );
    } );

    it( 'should be able to re-enable things as well', () =>
    {
        singleRes = flounder.disableByText( [ '2' ], true );
        assert.equal( flounder.refs.select.children[ 2 ].disabled, false );
        assert.equal( utils.hasClass( flounder.refs.data[ 2 ],
                                                    classes.DISABLED ), false );
    } );


    it( 'should skip and warn when there was no match', () =>
    {
        sinon.stub( console, 'warn', noop );
        flounder.disableByText( '15' );

        assert.equal( console.warn.callCount, 1 );
        console.warn.restore();
        assert.equal( flounder.refs.select.children[ 2 ].disabled, false );
        assert.equal( utils.hasClass( flounder.refs.data[ 2 ],
                                                    classes.DISABLED ), false );
    } );


    it( 'should return the affected elements', () =>
    {
        assert.equal( arrayRes.length, 2 );
        assert.equal( arrayRes[ 0 ].length, 2 );
        assert.equal( arrayRes[ 0 ][ 1 ].nodeType, 1 );

        assert.equal( singleRes[ 0 ].nodeType, 1 );
    } );
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
    const div         = document.querySelector( 'div' );
    const flounder    = new Flounder( div, {
        data : [ 1, 2, 3 ]
    } );
    let arrayRes;
    let singleRes;

    it( 'should be able to handle an array of values to disable', () =>
    {
        arrayRes = flounder.disableByValue( [ '1', 2 ] );
        assert.equal( flounder.refs.select.children[ 0 ].disabled, true );
        assert.equal( utils.hasClass( flounder.refs.data[ 1 ],
            classes.DISABLED ), true );
    } );


    it( 'should be able to re-enable things as well', () =>
    {
        singleRes = flounder.disableByValue( [ '2' ], true );
        assert.equal( flounder.refs.select.children[ 2 ].disabled, false );
        assert.equal( utils.hasClass( flounder.refs.data[ 2 ],
                                                classes.DISABLED ), false );
    } );


    it( 'should skip and warn when there was no match', () =>
    {
        sinon.stub( console, 'warn', noop );
        flounder.disableByValue( '15' );

        assert.equal( console.warn.callCount, 1 );
        console.warn.restore();
        assert.equal( flounder.refs.select.children[ 2 ].disabled, false );
        assert.equal( utils.hasClass( flounder.refs.data[ 2 ],
                                                classes.DISABLED ), false );
    } );


    it( 'should return the affected elements', () =>
    {
        assert.equal( arrayRes.length, 2 );
        assert.equal( arrayRes[ 0 ].length, 2 );
        assert.equal( arrayRes[ 0 ][ 1 ].nodeType, 1 );

        assert.equal( singleRes[ 0 ].nodeType, 1 );
    } );
} );



/**
 * ## enableByIndex
 *
 * shortcut syntax to enable an index
 *
 * @param {Mixed} index index of the option to enable
 *
 * @return _Object_ affected DOMElements
 */
describe( 'enableByIndex', () =>
{
    it( 'should be a shortcut to disableByIndex served with true', () =>
    {
        const div         = document.querySelector( 'div' );
        const flounder    = new Flounder( div, {
            data : [ 1, 2, 3 ]
        } );

        sinon.stub( flounder, 'disableByIndex', ( a, b ) => assert.ok( b ) );

        flounder.enableByIndex( 1 );

        assert.equal( flounder.disableByIndex.callCount, 1 );
        flounder.disableByIndex.restore();
    } );
} );


/**
 * ## enableByText
 *
 * shortcut syntax to enable by text
 *
 * @param {Mixed} text text of the option to enable
 *
 * @return _Object_ affected DOMElements
 */
describe( 'enableByText', () =>
{
    it( 'should be a shortcut to disableByText served with true', () =>
    {
        const div         = document.querySelector( 'div' );
        const flounder    = new Flounder( div, {
            data : [ 1, 2, 3 ]
        } );

        sinon.stub( flounder, 'disableByText', ( a, b ) => assert.ok( b ) );

        flounder.enableByText( '1' );

        assert.equal( flounder.disableByText.callCount, 1 );
        flounder.disableByText.restore();
    } );
} );


/**
 * ## enableByValue
 *
 * shortcut syntax to enable a value
 *
 * @param {Mixed} value value of the option to enable
 *
 * @return _Object_ affected DOMElements
 */
describe( 'enableByValue', () =>
{
    it( 'should be a shortcut to disableByValue served with true', () =>
    {
        const div         = document.querySelector( 'div' );
        const flounder    = new Flounder( div, {
            data : [ 1, 2, 3 ]
        } );

        sinon.stub( flounder, 'disableByValue', ( a, b ) => assert.ok( b ) );

        flounder.enableByValue( '1' );

        assert.equal( flounder.disableByValue.callCount, 1 );
        flounder.disableByValue.restore();
    } );
} );


/**
 * ## getData
 *
 * returns the option and div tags related to an option
 *
 * @param {Number} _i index to return
 *
 * @return _Object_ option and div tag
 */
describe( 'getData', () =>
{
    const div         = document.querySelector( 'div' );
    const flounder    = new Flounder( div, {
        data : [ 1, 2, 3 ]
    } );
    const refs        = flounder.refs;

    it( 'should serve simple numbers', () =>
    {
        const res = flounder.getData( 1 );
        assert.deepEqual( res.option, refs.selectOptions[ 1 ] );
        assert.deepEqual( res.div, refs.data[ 1 ] );
    } );


    it( 'should serve arrays of numbers', () =>
    {
        const res = flounder.getData( [ 1, 2 ] );
        assert.deepEqual( res[ 0 ].option, refs.selectOptions[ 1 ] );
        assert.deepEqual( res[ 1 ].div, refs.data[ 2 ] );
        assert.equal( res.length, 2 );
    } );


    it( 'should serve all data if no params are passed', () =>
    {
        const res = flounder.getData();
        assert.deepEqual( res[ 0 ].option, refs.selectOptions[ 1 ] );
        assert.deepEqual( res[ 1 ].div, refs.data[ 1 ] );
        assert.equal( res.length, 3 );
    } );


    it( 'should warn if an illegal parameter is added', () =>
    {
        sinon.stub( console, 'warn', noop );
        flounder.getData( 'khxjhvac' );
        assert.equal( console.warn.callCount, 1 );
        console.warn.restore();
    } );
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
    const div         = document.querySelector( 'div' );
    const flounder    = new Flounder( div, {
        multiple    : true,
        placeholder : 'moon',
        data        : [ 1, 2, 3 ]
    } );

    it( 'should return the selected elements excluding placeholders', () =>
    {
        const el         = flounder.refs.select;
        const data       = el.options;

        data[ 0 ].selected = true;
        data[ 1 ].selected = true;
        data[ 2 ].selected = true;

        const selected = flounder.getSelected();

        assert.equal( selected.length, 2 );
        assert.equal( selected[ 0 ].nodeType, 1 );
    } );
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
    const div         = document.querySelector( 'div' );
    const flounder    = new Flounder( div, {
        multiple    : true,
        placeholder : 'moon',
        data        : [ 1, 2, 3 ]
    } );

    it( 'should return the selected values excluding placeholders', () =>
    {
        const el         = flounder.refs.select;
        const data       = el.options;

        data[ 0 ].selected = true;
        data[ 1 ].selected = true;
        data[ 2 ].selected = true;

        const selected = flounder.getSelectedValues();

        assert.equal( selected.length, 2 );
        assert.equal( selected[ 0 ], 1 );
    } );
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
    const div         = document.querySelector( 'div' );
    const flounder    = new Flounder( div, {
        placeholder : 'moon',
        data        : []
    } );

    const getStub = res =>
    {
        return {
            then    : func =>
            {
                try
                {
                    res = func( res );

                    return {
                        catch : () => res
                    };
                }
                catch ( e )
                {
                    return {
                        catch : func => func( e )
                    };
                }
            },
            catch   : noop
        };
    };

    sinon.stub( utils.http, 'get', getStub );



    it( 'should return a loading value while loading', () =>
    {
        const cb = sinon.spy();
        const res = flounder.loadDataFromUrl( '["1" ,"3"]', cb );

        assert.equal( res[ 0 ].extraClass, 'flounder__loading' );
        assert.equal( cb.callCount, 1 );

        flounder.loadDataFromUrl( '["1" ,"moon"]' );

        assert.equal( flounder.data[ 1 ], 'moon' );
    } );


    it( 'should give a warning when it recieves no data', () =>
    {
        sinon.stub( console, 'warn', noop );
        flounder.loadDataFromUrl( false );

        assert.equal( console.warn.callCount, 1 );
        console.warn.restore();
    } );


    it( 'should report something if the callback goes wrong', () =>
    {
        sinon.stub( console, 'warn', noop );

        flounder.loadDataFromUrl( '["1","2","3"]', () =>
        {
            a + b; // eslint-disable-line
        } );

        assert.equal( console.warn.callCount, 1 );
        console.warn.restore();
    } );
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
    const div         = document.querySelector( 'div' );
    const flounder    = new Flounder( div, {
        data : [ 1, 2, 3 ]
    } );

    it( 'should dump to reconfigure if only props are passed', () =>
    {
        sinon.stub( flounder, 'reconfigure', noop );

        flounder.rebuild( [ 1, 2, 3 ], {} );
        flounder.rebuild( {} );
        flounder.rebuild( 'moon' );

        assert.equal( flounder.reconfigure.callCount, 3 );
        flounder.reconfigure.restore();
    } );


    it( 'should use this.data if no data is passed', () =>
    {
        flounder.data   = [
            {
                text    : 1,
                value   : 2
            }
        ];
        const data        = flounder.data[ 0 ].value;
        flounder.rebuild();

        assert.equal( flounder.data[ 0 ].value, data );
    } );


    it( 'should rebuild flounder with new data', () =>
    {
        flounder.rebuild( [ 4, 5, 6 ] );

        assert.equal( flounder.data[ 0 ].value, 4 );
    } );
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
    const div         = document.querySelector( 'div' );
    const flounder    = new Flounder( div, {
        multiple    : true,
        data        : [ 1, 2, 3 ]
    } );
    const refs        = flounder.refs;
    let res;

    it( 'should set a selection by either index or array of indexes', () =>
    {
        sinon.stub( refs.data[ 2 ], 'click', noop );
        res = flounder.setByIndex( 2 );
        assert.equal( refs.data[ 2 ].click.callCount, 1 );
        assert.equal( res.nodeType, 1 );

        flounder.setByIndex( [ 1, 2, 3 ], true, true );
        assert.equal( refs.data[ 2 ].click.callCount, 2 );

        refs.data[ 2 ].click.restore();
    } );


    it( 'should set a selection starting from the back', () =>
    {
        sinon.stub( refs.data[ 2 ], 'click', noop );
        res = flounder.setByIndex( -2 );
        assert.equal( refs.data[ 2 ].click.callCount, 1 );
        assert.equal( res.nodeType, 1 );

        flounder.setByIndex( [ 1, -2, 3 ], true, true );
        assert.equal( refs.data[ 2 ].click.callCount, 2 );

        refs.data[ 2 ].click.restore();
    } );


    it( 'should return null if there is no element on that index', () =>
    {
        res = flounder.setByIndex( -200 );
        assert.equal( res, null );

        res = flounder.setByIndex( 200 );
        assert.equal( res, null );
    } );
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
    const div         = document.querySelector( 'div' );
    const flounder    = new Flounder( div, {
        multiple : true,
        data     : [ 1, 2, 3 ]
    } );
    const refs        = flounder.refs;

    it( 'should set a selection by either text or array of text values', () =>
    {
        sinon.stub( refs.data[ 2 ], 'click', noop );
        flounder.setByText( '2' );
        assert.equal( refs.data[ 2 ].click.callCount, 1 );

        flounder.setByText( [ '1', 2, '3' ], true, true );
        assert.equal( refs.data[ 2 ].click.callCount, 2 );

        refs.data[ 2 ].click.restore();
        flounder.deselectAll();
    } );
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
    const div         = document.querySelector( 'div' );
    const flounder    = new Flounder( div, {
        multiple    : true,
        data        : [ 1, 2, 3 ]
    } );
    const refs        = flounder.refs;

    it( 'should set a selection by either value or array of values', () =>
    {
        sinon.stub( refs.data[ 2 ], 'click', noop );
        flounder.setByValue( '2' );
        assert.equal( refs.data[ 2 ].click.callCount, 1 );

        flounder.setByValue( [ '1', 2, '3' ], true, true );
        assert.equal( refs.data[ 2 ].click.callCount, 2 );

        refs.data[ 2 ].click.restore();
        flounder.deselectAll();
    } );
} );
