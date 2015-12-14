import React, { Component }     from 'react';
import ReactDOM                 from 'react-dom';
import { FlounderReact }        from '../src/reactFlounder.jsx';
import Flounder                 from '../src/flounder.jsx';
window.Flounder = Flounder;


window.Flounder = Flounder;

var _slice = Array.prototype.slice;
/**
 * example options object
 *
 * @type {Array}
 */
var options = [
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
    defaultValue         : 'placeholders!',

    onInit               : function()
    {
        var res = [];
        options.forEach( function( option )
        {
            res.push( {
                text        : option.text,
                value       : option.id,
                extraClass  : 'vantar' + Math.ceil( Math.random() * 10 )
            } );
        } );

        this.options = res;
        console.log( this );
    },

    multiple            : true
} );


/**
 * vanilla Flounder attached to an input
 */
new Flounder( document.getElementById( 'vanilla--input' ), {
    defaultValue         : 2,

    onInit               : function()
    {
        var res     = [];
        options.forEach( function( option )
        {
            res.push( {
                text        : option.text,
                value       : option.id
            } );
        } );

        this.options = res;
    },

    multiple            : true,

    multipleTags        : false,

    onSelect            : function( e )
    {
        var selected    = _slice.call( this.refs.select.selectedOptions );
        selected        = selected.map( el => el.index );

        var rand = function( option, i )
        {
            if ( selected.indexOf( i ) !== -1 )
            {
                return option;
            }
            else
            {
                var value = Math.ceil( Math.random() * 10 );
                return { text : value, value : value, index : i };
            }
        };

        let _o          = this.options.map( rand );
        this.options    = _o;
        this.rebuildOptions( _o );
    }
} );


/**
 * vanilla Flounder attached pre built select box
 */
new Flounder( document.getElementById( 'vanilla--select' ), {
    defaultValue         : 'placeholders!'
} );


/**
 * react amulti-Flounder with tags attached to an div
 */
ReactDOM.render( React.createElement( FlounderReact, {
    defaultValue        : 'placeholders!',

    multiple            : true,

    onInit              : function()
    {
        var res = [];
        options.forEach( function( option )
        {
            res.push( {
                text        : option.text,
                value       : option.id
            } );
        } );

        this.options = res;
    } } ), document.getElementById( 'react--multiple--tags' )
);


/**
 * react amulti-Flounder without tags attached to an div
 */
ReactDOM.render( React.createElement( FlounderReact, {
    defaultValue        : 'placeholders!',

    multiple            : true,

    multipleTags        : false,

    onInit              : function()
    {
        var res = [];
        options.forEach( function( option )
        {
            res.push( {
                text        : option.text,
                value       : option.id
            } );
        } );

        this.options = res;
    } } ), document.getElementById( 'react--multiple' )
);


/**
 * react amulti-Flounder with description attached to div
 */
ReactDOM.render( React.createElement( FlounderReact, {
    defaultValue        : 'placeholders!',

    multiple            : true,

    multipleTags        : false,

    onInit              : function()
    {
        var res = [];
        options.forEach( function( option )
        {
            res.push( {
                text        : option.text,
                value       : option.id,
                description : option.id + ' - ' + option.text
            } );
        } );

        this.options = res;
    } } ), document.getElementById( 'react--multiple--desc' )
);


requirejs.config( {
    paths : {
        flounder : '../dist/amdFlounder'
    }
} );

/**
 * vanilla Flounder with descriptions attached to a div
 */
requirejs( [ 'flounder' ], function( Flounder )
{
    new Flounder( document.getElementById( 'AMD--desc' ), {
        defaultValue         : 'placeholders!',

        onInit               : function()
        {
            var res = [];
            options.forEach( function( option )
            {
                res.push( {
                    text        : option.text,
                    value       : option.id,
                    description : option.text + ' - ' + option.text
                } );
            } );

            this.options = res;
        }
     } );
} );


export default { React, Component, ReactDOM, FlounderReact, Flounder };
