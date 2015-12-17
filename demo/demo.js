import React, { Component }     from 'react';
import ReactDOM                 from 'react-dom';
import { FlounderReact }        from '../src/wrappers/flounder.react.jsx';
import Flounder                 from '../src/core/flounder.jsx';

window.Flounder = Flounder;

var _slice = Array.prototype.slice;
/**
 * example data object
 *
 * @type {Array}
 */
var data = [
    {
        cssClass    : 'select-filters',
        id          : 'All',
        isTaxonomy  : true,
        text        : 'All'
    },
    {
        cssClass    : 'category',
        id          : 'category',
        isTaxonomy  : true,
        text        : 'Categories'
    },
    {
        cssClass    : 'tag',
        id          : 'tag',
        isTaxonomy  : true,
        text        : 'Tags'
    },
    {
        cssClass    : 'month',
        id          : 'month',
        isTaxonomy  : true,
        text        : 'Month'
    }
];


/**
 * vanilla multi-Flounder with tags attached to an input
 */
new Flounder( '.vanilla--input--tags', {
    placeholder          : 'placeholders!',

    onInit               : function()
    {
        var res = [];
        data.forEach( function( dataObj )
        {
            res.push( {
                text        : dataObj.text,
                value       : dataObj.id,
                extraClass  : 'vantar' + Math.ceil( Math.random() * 10 )
            } );
        } );

        this.data = res;
    },

    multiple            : true
} );


/**
 * vanilla Flounder attached to an input
 */
new Flounder( document.getElementById( 'vanilla--input' ), {
    defaultIndex         : 2,

    onInit               : function()
    {
        var res     = [];
        data.forEach( function( dataObj, i )
        {
            res.push( {
                text        : dataObj.text,
                value       : dataObj.id,
                disabled    : i === 1 ? true : false
            } );
        } );

        this.data = res;
    },

    multiple            : true,

    multipleTags        : false,

    onSelect            : function( e )
    {
        var selected    = _slice.call( this.refs.select.selectedOptions );
        selected        = selected.map( el => el.index );

        var rand = function( dataObj, i )
        {
            if ( selected.indexOf( i ) !== -1 )
            {
                return dataObj;
            }
            else
            {
                var value = Math.ceil( Math.random() * 10 );
                return { text : value, value : value, index : i };
            }
        };

        let _o       = this.data.map( rand );
        console.log( _o );
        this.data    = _o;
        this.rebuildSelect( _o );
    }
} );


/**
 * vanilla Flounder attached pre built select box
 */
new Flounder( document.getElementById( 'vanilla--select' ), {
    defaultValue : 2,

    classes : {
        flounder        : 'class--to--give--the--main--flounder--element',
        hidden          : 'class--to--denote--hidden',
        selected        : 'class--to--denote--selected--option',
        wrapper         : 'additional--class--to--give--the--wrapper'
    }
} );


/**
 * react multi-Flounder with tags attached to an div
 */
ReactDOM.render( React.createElement( FlounderReact, {
    placeholder         : 'placeholders!',

    multiple            : true,

    onInit              : function()
    {
        var res = [];
        data.forEach( function( dataObj )
        {
            res.push( {
                text        : dataObj.text,
                value       : dataObj.id
            } );
        } );

        this.data = res;
    } } ), document.getElementById( 'react--multiple--tags' )
);


/**
 * react multi-Flounder without tags attached to an div
 */
ReactDOM.render( React.createElement( FlounderReact, {
    defaultValue        : 'tag',

    onInit              : function()
    {
        var res = [];
        data.forEach( function( dataObj )
        {
            res.push( {
                text        : dataObj.text,
                value       : dataObj.id
            } );
        } );

        this.data = res;
    } } ), document.getElementById( 'react--multiple' )
);


/**
 * react multi-Flounder with description attached to div
 */
ReactDOM.render( React.createElement( FlounderReact, {
    defaultIndex        : 3,

    multiple            : true,

    multipleTags        : false,

    onInit              : function()
    {
        var res = [];
        data.forEach( function( dataObj, i )
        {
            res.push( {
                text        : dataObj.text,
                value       : dataObj.id,
                description : dataObj.id + ' - ' + dataObj.text,
                disabled    : i === 1 ? true : false
            } );
        } );

        this.data = res;
    } } ), document.getElementById( 'react--multiple--desc' )
);


requirejs.config( {
    paths : {
        flounder : '../dist/flounder.amd'
    }
} );

/**
 * vanilla Flounder with descriptions attached to a div
 */
requirejs( [ 'flounder' ], function( Flounder )
{
    new Flounder( document.getElementById( 'AMD--desc' ), {
        placeholder          : 'placeholders!',

        onInit               : function()
        {
            var res = [];
            data.forEach( function( dataObj )
            {
                res.push( {
                    text        : dataObj.text,
                    value       : dataObj.id,
                    description : dataObj.text + ' - ' + dataObj.text
                } );
            } );

            this.data = res;
        }
     } );
} );


µ( '.debug--mode' ).on( 'click', function()
{
    µ( '.flounder--select--tag' ).removeClass( 'flounder--hidden' );
    µ( '.flounder' ).css( 'display', 'inline-block' )
} );

export default { React, Component, ReactDOM, FlounderReact, Flounder };
