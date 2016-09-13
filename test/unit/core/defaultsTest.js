/* globals describe, it, document */
import Flounder     from '/core/flounder';
import defaults     from '/core/defaults';

import classes      from '/core/classes';
import assert       from 'assert';


const div         = document.querySelector( 'div' );
const flounder    = new Flounder( div );


describe( 'defaultOptions', () =>
{
    const dVal = defaults.defaultOptions;

    it( 'should be an object', () =>
    {
        assert.equal( typeof dVal, 'object' );
    } );


    it( 'should have the correct default prop', () =>
    {
        assert.equal( dVal.allowHTML, false );
        assert.deepEqual( dVal.classes, classes );
        assert.equal( dVal.defaultEmpty, false );
        assert.equal( dVal.defaultIndex, false );
        assert.equal( dVal.defaultValue, false );
        assert.equal( dVal.disableArrow, false );
        assert.equal( dVal.keepChangesOnDestroy, false );
        assert.equal( dVal.multiple, false );
        assert.equal( dVal.multipleTags, false );
        assert.equal( dVal.multipleMessage, '(Multiple Items Selected)' );
        assert.equal( typeof dVal.onClose, 'function' );
        assert.equal( typeof dVal.onComponentDidMount, 'function', false );
        assert.equal( typeof dVal.onComponentWillUnmount, 'function' );
        assert.equal( typeof dVal.onFirstTouch, 'function' );
        assert.equal( typeof dVal.onInit, 'function' );
        assert.equal( typeof dVal.onInputChange, 'function' );
        assert.equal( typeof dVal.onOpen, 'function' );
        assert.equal( typeof dVal.onChange, 'function' );
        assert.equal( dVal.openOnHover, false );
        assert.equal( dVal.placeholder, 'Please choose an option' );
        assert.equal( dVal.search, false );
        assert.equal( dVal.selectDataOverride, false );
    } );
} );



/**
 * ## setDefaultOption
 *
 * sets the initial default value
 *
 * @param {String or Number}    defaultProp         default passed from
 *                                                                   this.props
 * @param {Object}              data                this.props.data
 *
 * @return _Void_
 */
describe( 'setDefaultOption', () =>
{
    it( 'should return a placeholder on default everything', () =>
    {
        const defaultVal = defaults.setDefaultOption( flounder );

        assert.equal( defaultVal.index, 0 );
        assert.notEqual( defaultVal.extraClass.indexOf( classes.PLACEHOLDER ),
                                                                        -1 );
        assert.equal( defaultVal.value, '' );
    } );


    describe( 'setIndexDefault', () =>
    {
        it( 'should set an index as the default if passed', () =>
        {
            const configObj   = {
                defaultIndex    : 2,
                data            : [ 1, 2, 3 ]
            };

            const defaultVal = defaults.setDefaultOption( flounder, configObj );

            assert.equal( defaultVal.index, 2 );
            assert.ok( !defaultVal.extraClass ||
                defaultVal.extraClass.indexOf( classes.PLACEHOLDER ) === -1 );
            assert.equal( defaultVal.value, 3 );
        } );


        it( 'should fall back if the given index doesnt exist', () =>
        {
            const configObj     = {
                defaultIndex    : 200,
                data            : [ 1, 2, 3 ]
            };

            const defaultVal = defaults.setDefaultOption( flounder, configObj );

            assert.equal( defaultVal.index, 0 );
            assert.ok( !defaultVal.extraClass );
            assert.equal( defaultVal.value, 1 );
        } );
    } );


    describe( 'setPlaceholderDefault', () =>
    {
        it( 'should set a placeholder as the default if passed', () =>
        {
            const dataVal       = [ 1, 2, 3 ];
            const configObj     = {
                placeholder : 'moon!',
                data        : dataVal
            };
            flounder.allowHTML  = true;
            const defaultVal = defaults.setDefaultOption( flounder, configObj );

            assert.equal( defaultVal.index, 0 );
            assert.notEqual(
                    defaultVal.extraClass.indexOf( classes.PLACEHOLDER ), -1 );
            assert.equal( defaultVal.value, '' );
            assert.equal( dataVal.length, 4 );
        } );
    } );


    describe( 'setValueDefault', () =>
    {
        it( 'should set a value as the default if passed', () =>
        {
            const configObj  = {
                defaultValue    : 2,
                data            : [ 1, 2, 3 ]
            };

            const defaultVal = defaults.setDefaultOption( flounder, configObj );

            assert.equal( defaultVal.index, 1 );
            assert.ok( !defaultVal.extraClass ||
                defaultVal.extraClass.indexOf( classes.PLACEHOLDER ) === -1 );
            assert.equal( defaultVal.value, 2 );
        } );


        it( 'should fall back if the given index doesnt exist', () =>
        {
            const configObj   = {
                defaultValue    : 200,
                data            : [ 1, 2, 3 ]
            };

            const defaultVal = defaults.setDefaultOption( flounder, configObj );

            assert.equal( defaultVal.index, 0 );
            assert.ok( !defaultVal.extraClass );
            assert.equal( defaultVal.value, 1 );
        } );
    } );



    describe( 'checkDefaultPriority', () =>
    {
        it( 'sort out the priority options', () =>
        {
            const configObj   = {
                defaultValue : 2,
                defaultIndex : 0,
                placeholder  : 'moon',
                data         : [ 1, 2, 3 ]
            };

            const defaultVal = defaults.setDefaultOption( flounder, configObj );

            assert.notEqual(
                    defaultVal.extraClass.indexOf( classes.PLACEHOLDER ), -1 );
        } );


        it( 'should try to add the previous value for a rebuild', () =>
        {
            const div         = document.querySelector( 'div' );
            const configObj   = {
                defaultIndex    : 2,
                data            : [ 1, 2, 3 ]
            };

            const flounder    = new Flounder( div, configObj );

            const defaultVal    = defaults.setDefaultOption( flounder,
                                            configObj, flounder.data, true );

            assert.equal( defaultVal.value, 3 );
        } );
    } );
} );
