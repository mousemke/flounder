
import Flounder     from '/core/flounder';
import defaults     from '/core/defaults';

import utils        from '/core/utils';
import classes      from '/core/classes';

import assert       from 'assert';
import sinon        from 'sinon';


let div         = document.querySelector( 'div' );
let flounder    = new Flounder( div );


describe( 'defaultOptions', () =>
{
    let _d = defaults.defaultOptions;

    it( 'should be an object', () =>
    {
        assert.equal( typeof _d, 'object' );
    } );


    it( 'should have the correct default prop', () =>
    {
        let classes = {
                        flounder    : ``,
                        hidden      : `flounder--hidden`,
                        selected    : `flounder__option--selected`,
                        wrapper     : ``
                    };

        assert.equal( _d.allowHTML, false );
        assert.deepEqual( _d.classes, classes );
        assert.equal( _d.defaultEmpty, false );
        assert.equal( _d.defaultIndex, false );
        assert.equal( _d.defaultValue, false );
        assert.equal( _d.disableArrow, false );
        assert.equal( _d.keepChangesOnDestroy, false );
        assert.equal( _d.multiple, false );
        assert.equal( _d.multipleTags, false );
        assert.equal( _d.multipleMessage, `(Multiple Items Selected)` );
        assert.equal( typeof _d.onClose, 'function' );
        assert.equal( typeof _d.onComponentDidMount, 'function', false );
        assert.equal( typeof _d.onComponentWillUnmount, 'function' );
        assert.equal( typeof _d.onFirstTouch, 'function' );
        assert.equal( typeof _d.onInit, 'function' );
        assert.equal( typeof _d.onInputChange, 'function' );
        assert.equal( typeof _d.onOpen, 'function' );
        assert.equal( typeof _d.onSelect, 'function' );
        assert.equal( _d.openOnHover, false );
        assert.equal( _d.placeholder, `Please choose an option` );
        assert.equal( _d.search, false );
        assert.equal( _d.selectDataOverride, false );
    } );
} );



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
describe( 'setDefaultOption', () =>
{
    it( 'should return a placeholder on default everything', () =>
    {
        let _default = defaults.setDefaultOption( flounder );

        assert.equal( _default.index, 0 );
        assert.notEqual( _default.extraClass.indexOf( classes.PLACEHOLDER ), -1 );
        assert.equal( _default.value, '' );
    } );


    describe( 'setIndexDefault', () =>
    {
        it( 'should set an index as the default if passed', () =>
        {
            let configObj   = { defaultIndex : 2, data: [ 1, 2, 3 ] };

            let _default    = defaults.setDefaultOption( flounder, configObj );

            assert.equal( _default.index, 2 );
            assert.ok( !_default.extraClass || _default.extraClass.indexOf( classes.PLACEHOLDER ) === -1 );
            assert.equal( _default.value, 3 );
        } );


        it( 'should fall back if the given index doesnt exist', () =>
        {
            let configObj   = { defaultIndex : 200, data: [ 1, 2, 3 ] };

            let _default    = defaults.setDefaultOption( flounder, configObj );

            assert.equal( _default.index, 0 );
            assert.ok( !_default.extraClass );
            assert.equal( _default.value, 1 );
        } );
    } );


    describe( 'setPlaceholderDefault', () =>
    {
        it( 'should set a placeholder as the default if passed', () =>
        {
            let _data           = [ 1, 2, 3 ];
            let configObj       = { placeholder : 'moon!', data: _data };
            flounder.allowHTML  = true;
            let _default        = defaults.setDefaultOption( flounder, configObj );

            assert.equal( _default.index, 0 );
            assert.notEqual( _default.extraClass.indexOf( classes.PLACEHOLDER ), -1 );
            assert.equal( _default.value, '' );
            assert.equal( _data.length, 4 );
        } );
    } );


    describe( 'setValueDefault', () =>
    {
        it( 'should set a value as the default if passed', () =>
        {
            let configObj   = { defaultValue : 2, data: [ 1, 2, 3 ] };

            let _default    = defaults.setDefaultOption( flounder, configObj );

            assert.equal( _default.index, 1 );
            assert.ok( !_default.extraClass || _default.extraClass.indexOf( classes.PLACEHOLDER ) === -1 );
            assert.equal( _default.value, 2 );
        } );


        it( 'should fall back if the given index doesnt exist', () =>
        {
            let configObj   = { defaultValue: 200, data: [ 1, 2, 3 ] };

            let _default    = defaults.setDefaultOption( flounder, configObj );

            assert.equal( _default.index, 0 );
            assert.ok( !_default.extraClass );
            assert.equal( _default.value, 1 );
        } );
    } );



    describe( 'checkDefaultPriority', () =>
    {
        it( 'sort out the priority options and choose what should be gotten', () =>
        {
            let configObj   = { defaultValue : 2, defaultIndex: 0, placeholder: 'moon', data: [ 1, 2, 3 ] };

            let _default    = defaults.setDefaultOption( flounder, configObj );

            assert.notEqual( _default.extraClass.indexOf( classes.PLACEHOLDER ), -1 );
        } );


        it( 'should try to add the previous value in the case of a rebuild', () =>
        {
            let div         = document.querySelector( 'div' );
            let configObj   = { defaultIndex: 2, data: [ 1, 2, 3 ] };

            let flounder    = new Flounder( div, configObj );

            let _default    = defaults.setDefaultOption( flounder, configObj, flounder.data, true );

            assert.equal( _default.value, 3 );
        } );
    } );
} );


/**
 * ## sortData
 *
 * checks the data object for header options, and sorts it accordingly
 *
 * @return _Boolean_ hasHeaders
 */
describe( 'sortData', () =>
{
    it( 'should build objects out of simple data sets', () =>
    {
        let data = defaults.sortData( [ 1, 2, 3 ] );

        assert.equal( data[0].text, 1 );
        assert.equal( data[1].value, 2 );
        assert.equal( data[2].index, 2 );
    } );


    it( 'should add indexes to object data items', () =>
    {
        let data = defaults.sortData( [ {
            text    : 1,
            value   : 2
        } ], [], 0 );

        assert.equal( data[0].text, 1 );
        assert.equal( data[0].value, 2 );
        assert.equal( data[0].index, 0 );
    } );


    it( 'should recursively process headers', () =>
    {
        let data = defaults.sortData( [
            {
                header : 'top',
                data    : [ 1, 2, 3 ]
            },
            {
                header : 'bottom',
                data    : [ 4, 5, 6 ]
            }
        ] );

        assert.equal( data[0].text, 1 );
        assert.equal( data[2].value, 3 );
        assert.equal( data[5].value, 6 );
    } );
} );







