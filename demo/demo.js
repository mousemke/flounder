import React, { Component }     from 'react';
import ReactDOM                 from 'react-dom';
import { FlounderReact }        from '../src/reactFlounder.jsx';
import Flounder                 from '../src/flounder.jsx';

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
 * vanilla amulti-Flounder with tags attached to an input
 */
new Flounder( document.getElementById( 'vanilla--input--tags' ), {
    _default             : 'placeholders!',

    onInit               : function()
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
    },

    multiple            : true
} );


/**
 * vanilla Flounder attached to an input
 */
new Flounder( document.getElementById( 'vanilla--input' ), {
    _default             : 2,

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
        var rand = function()
        {
            return Math.ceil( Math.random() * 10 );
        };

        var _o  = new Array( 5 ).fill( 0 );
        _o      = _o.map( rand );

        this.rebuildOptions( _o );
    }
} );


/**
 * vanilla Flounder attached pre built select box
 */
new Flounder( document.getElementById( 'vanilla--select' ), {
    _default             : 'placeholders!'
} );


/**
 * vanilla amulti-Flounder with descriptions attached to an input
 */
new Flounder( document.getElementById( 'vanilla--multiple--desc' ), {
    _default             : 'placeholders!',

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
    },

    multiple            : true,
    multipleTags        : false
 } );


/**
 * react Flounder attached to a div
 */
ReactDOM.render( React.createElement( FlounderReact, {
    _default             : 'placeholders!',

    onInit               : function()
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
    } } ), document.getElementById( 'react--div' )
);


/**
 * react amulti-Flounder with tags attached to an div
 */
ReactDOM.render( React.createElement( FlounderReact, {
    _default            : 'placeholders!',

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
    _default            : 'placeholders!',

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
    _default            : 'placeholders!',

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
        _default             : 'placeholders!',

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
