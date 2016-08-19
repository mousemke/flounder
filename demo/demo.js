import Flounder from '/core/flounder';

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
            description : `${dataObj.id} could be described as "${dataObj.text}"`
        } );
    } );

    return res;
};


/**
 * Vanilla from Input (sections, multiple tags, built from selector string)
 */
new Flounder( '.vanilla--input--tags', {

    multipleTags    : true,

    onInputChange   : function(){ console.log( 'moon' ); },

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
    },

    placeholder         : 'placeholder!!'
} );


/**
 * Vanilla from Input (multiple, no tags, dynamic options, default index, built from element)
 */
new Flounder( document.getElementById( 'vanilla--input' ), {
    defaultIndex         : 2,

    data                : data,

    multiple            : true,

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

        this.rebuild( this.data.map( rand ) );
    }
} );


/**
 * Vanilla from Select (default value, custom classes, built from element)
 */
new Flounder( document.getElementById( 'vanilla--select' ), {
    defaultValue    : '2',

    onSelect        : function(){ console.log( 'woot' ); },

    classes         : {
        flounder        : 'class--to--give--the--main--flounder--element',
        hidden          : 'class--to--denote--hidden',
        selected        : 'class--to--denote--selected--option',
        wrapper         : 'additional--class--to--give--the--wrapper'
    }
} );


/**
 * Vanilla from Div (multiple, tags, placeholder, built from element)
 */
new Flounder( document.getElementById( 'vanilla--multiple--tags' ), {

    defaultIndex        : 2,

    multipleTags        : true,

    onInit              : function(){ this.data = buildData(); },

} );


/**
 * Vanilla from Span (default value, built from element)
 */
new Flounder( document.getElementById( 'vanilla--span' ), {

    disableArrow        : true,

    defaultValue        : 'tag',

    onInit              : function(){ this.data = buildData(); },

    openOnHover         : true

} );


/**
 * Vanilla from Div (multiple, description, default index, elements disabled, built from element)
 */
new Flounder( document.getElementById( 'vanilla--multiple--desc' ), {
    defaultIndex        : 3,

    multiple            : true,

    onInit              : function()
    {
        let res = [];
        data.forEach( function( dataObj, i )
        {
            res.push( {
                text        : dataObj.text,
                value       : dataObj.id,
                description : `${dataObj.id} could be described as "${dataObj.text}"`,
                disabled    : i === 1 ? true : false
            } );
        } );

        this.data = res;
    }
} );


requirejs.config( {
    paths : {
        flounder : '../dist/flounder.amd'
    }
} );

/**
 * AMD required vanilla from Div (description, placeholder, built from string)
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
                    description : `${dataObj.id} could be described as "${dataObj.text}"`
                } );
            } );

            this.data = res;
        }
     } );
} );


/**
 * AMD required vanilla from select (loadFromUrl, placeholder, built from element)
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


µ( function()
    {
        /**
         * Microbe plugin from Div (multiple, microbe wrapper, loads JSON onFirstTouch)
         */
        µ( '#microbe--multiple--desc' ).flounder( {

            onFirstTouch : function()
            {
                var self = this;

                this.data = this.loadDataFromUrl( './dummyData.json', function( data )
                {
                    setTimeout( function(){ self.rebuild( data.dummyData ) }, 10000 );
                } );

                this.rebuild( this.data );
            },

            multiple            : true
         } );


        /**
         * jQuery plugin from Div (search, placeholder, jquery wrapper, loadData onInit)
         */
         $( '#jquery--div' ).flounder( {
            onInit               : function()
            {
                var self = this;

                this.data = this.buildFromUrl( './dummyData.json',
                                        function( _d ){ self.data =_d.dummyData } );
            },

            placeholder         : 'placeholders!',

            search              : true
        } );
    }
);


µ( '.debug--mode' ).on( 'click', function()
{
    µ( '.flounder--select--tag' ).removeClass( 'flounder--hidden' ).removeClass( 'flounder--hidden--ios' );
    µ( '.flounder' ).css( 'display', 'inline-block' )
} );


µ( '.destroy--all' ).on( 'click', function()
{
    µ( '.flounder' ).each( function( el )
    {
        el.flounder.destroy();
    } );
} );


export default Flounder;
