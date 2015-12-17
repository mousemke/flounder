import React, { Component }     from 'react';
import ReactDOM                 from 'react-dom';
import { FlounderReact }        from '../src/wrappers/flounder.react.jsx';
import Flounder                 from '../src/core/flounder.jsx';

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
    placeholder          : 'placeholders!',

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
        options.forEach( function( option, i )
        {
            res.push( {
                text        : option.text,
                value       : option.id,
                disabled    : i === 1 ? true : false
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
    defaultValue : 2,

    classes : {
        container   : 'moon',
        wrapper     : 'doge'
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
 * react multi-Flounder without tags attached to an div
 */
ReactDOM.render( React.createElement( FlounderReact, {
    defaultValue        : 'tag',

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
 * react multi-Flounder with description attached to div
 */
ReactDOM.render( React.createElement( FlounderReact, {
    defaultIndex        : 3,

    multiple            : true,

    multipleTags        : false,

    onInit              : function()
    {
        var res = [];
        options.forEach( function( option, i )
        {
            res.push( {
                text        : option.text,
                value       : option.id,
                description : option.id + ' - ' + option.text,
                disabled    : i === 1 ? true : false
            } );
        } );

        this.options = res;
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


µ( '.debug--mode' ).on( 'click', function()
{
    µ( '.flounder--select--tag' ).removeClass( 'flounder--hidden' );
    µ( '.flounder' ).css( 'display', 'inline-block' )
} );

export default { React, Component, ReactDOM, FlounderReact, Flounder };
