import { React, Component, ReactDOM, FlounderReact, Flounder }  from '../src/wrappers/flounder.react.jsx';

window.Flounder = Flounder;

let _slice = Array.prototype.slice;
/**
 * example data object
 *
 * @type {Array}
 */
let data = [
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


let buildData = function()
{
    let res = [];
    data.forEach( function( dataObj )
    {
        res.push( {
            text        : dataObj.text,
            value       : dataObj.id,
            description : dataObj.id + ' could be described as "' + dataObj.text + '"'
        } );
    } );

    return res;
};


/**
 * vanilla multi-Flounder with tags attached to an input
 */
new Flounder( '.vanilla--input--tags', {

    onInit          : function()
    {
        let res = [];

        let top = {
            header : 'top',
            data    : []
        };

        let bottom = {
            header : 'bottom',
            data    : []
        };

        data.forEach( function( dataObj, i )
        {
            res = {
                text        : dataObj.text,
                value       : dataObj.id,
                extraClass  : 'vantar' + Math.ceil( Math.random() * 10 )
            };

            if ( i % 2 === 0 )
            {
                top.data.push( res );
            }
            else
            {
                bottom.data.push( res );
            }
        } );

        this.data = [ top, bottom ];
    }
} );


/**
 * vanilla Flounder attached to an input
 */
new Flounder( document.getElementById( 'vanilla--input' ), {
    defaultIndex         : 2,

    data                : data,

    multiple            : true,

    multipleTags        : false,

    onInit              : function(){ this.data = buildData(); },

    onSelect            : function( e )
    {
        let selected    = _slice.call( this.refs.select.selectedOptions );
        selected        = selected.map( el => el.index );

        let rand = function( dataObj, i )
        {
            if ( selected.indexOf( i ) !== -1 )
            {
                return dataObj;
            }
            else
            {
                let value = Math.ceil( Math.random() * 10 );
                return { text : value, value : value, index : i };
            }
        };

        let _o       = this.data.map( rand );

        this.data    = _o;
        this.rebuild( _o );
    }
} );


/**
 * vanilla Flounder attached pre built select box
 */
new Flounder( document.getElementById( 'vanilla--select' ), {
    defaultValue    : '1',

    classes         : {
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

    multipleTags        : true,

    onInit              : function(){ this.data = buildData(); },

    } ), document.getElementById( 'react--multiple--tags' )
);


/**
 * react Flounder attached to an div
 */
ReactDOM.render( React.createElement( FlounderReact, {
    defaultValue        : 'tag',

    onInit              : function(){ this.data = buildData(); },

    } ), document.getElementById( 'react--span' )
);


/**
 * react multi-Flounder with description attached to div
 */
ReactDOM.render( React.createElement( FlounderReact, {
    defaultIndex        : 3,

    multiple            : true,

    multipleTags        : false,

    onSelect            : function()
    {
        console.log( this.setByIndex( 0 ) );
    },

    onInit              : function()
    {
        let res = [];
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
 * AMD Flounder with descriptions attached to a div
 */
requirejs( [ 'flounder' ], function( Flounder )
{
    new Flounder( '#AMD--desc', {
        placeholder          : 'placeholders!',

        onInit               : function()
        {
            let res = [];
            data.forEach( function( dataObj )
            {
                res.push( {
                    text        : dataObj.text,
                    value       : dataObj.id,
                    description : dataObj.id + ' could be described as "' + dataObj.text + '"'
                } );
            } );

            this.data = res;
        }
     } );
} );


/**
 * AMD Flounder with descriptions attached to a select
 */
requirejs( [ 'flounder' ], function( Flounder )
{
    new Flounder( document.getElementById( 'AMD--select' ), {

        placeholder          : 'placeholders!',

        onInit               : function()
        {
            this.data = this.loadDataFromUrl( './dummData.json', function( data )
            {
                setTimeout( function(){ self.rebuild( data.dummyData ) }, 10000 );
            } );
        }
     } );
} );


µ( '.debug--mode' ).on( 'click', function()
{
    µ( '.flounder--select--tag' ).removeClass( 'flounder--hidden' );
    µ( '.flounder' ).css( 'display', 'inline-block' )
} );


µ( '.destroy--all' ).on( 'click', function()
{
    µ( '.flounder' ).each( function( el )
    {
        el.flounder.destroy();
    } );
} );

export default { React, Component, ReactDOM, FlounderReact, Flounder };
