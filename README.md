Flounder.js 0.2.3
=================

(for modern browsers and ie9+)

Flounder is a styled select box replacement aimed at being easily configurable while conforming to native functionality and accessibility standards.

```
// npm
require('flounder');

// es6
import Flounder from 'flounder';
```


Usage
=====

Flounder can be used in vanilla js or with react, requirejs, jquery, and microbe

```
// vanilla
new Flounder( target, configOptions );

// react
ReactDOM.render( React.createElement( FlounderReact, configOptions ), target );

// react (JSX)
React.render( <FlounderReact option1="" option2="">, target );

// requirejs
requirejs( [ 'flounder' ], function( Flounder )
{
    new Flounder( target, configOptions );
} );

// jQuery plugin
$( '.example--class' ).flounder( configOptions );

// microbe plugin
µ( '.example--class' ).flounder( configOptions )
```

Flounder also saves a copy of itself to its target element.  So if you lose the reference, you can just grab it from the element again
```
document.querySelector( '#vanilla--select' ).flounder.destroy()
```


###Available config options

```
{
    classes             : {
        flounder        : 'class--to--give--the--main--flounder--element',
        hidden          : 'class--to--denote--hidden',
        selected        : 'class--to--denote--selected--option',
        wrapper         : 'additional--class--to--give--the--wrapper'
    },
    data                : dataObject,
    defaultValue        : defaultValue,
    defaultIndex        : defaultIndex,
    multiple            : false,
    multipleTags        : true,
    multipleMessage     : '(Multiple Items Selected)',
    onClose             : function( e, valueArray ){},
    onComponentDidMount : function(){},
    onInit              : function(){},
    onOpen              : function( e, valueArray ){},
    onSelect            : function( e, valueArray ){}
    placeholder         : 'Please choose an option',
    search              : true
}
```

`classes`- (object) Contains configurable classes for various elements.  The are additional classes, not replacement classes.

`data` - (array) select box options to build in the select box.  Can be organized various ways

`defaultValue` - (string) Sets the default value to the passed value but only if it matches one of the select box options. Multi-tag select boxes only support placeholders

`defaultIndex` - (number) Sets the default option to the passed index but only if it exists.  This overrides defaultValue. Multi-tag select boxes only support placeholders.

`multiple` - (boolean) Determines whether it is a multi-select box or single

`multipleTags` - (boolean) Determines how a multi-select box is displayed

`multipleMessage` - (string) If there are no tags, this is the message that will be displayed in the selected area when there are multiple options selected

`onClose` - (function) Triggered when the selectbox is closed

`onComponentDidMount` - (function) Triggered when the selectbox is finished building

`onInit` - (function) Triggered when the selectbox is initiated, but before it's built

`onOpen` - (function) Triggered when the selectbox is opened

`onSelect` - (function) Triggered when an option selectbox is closed

`placeholder` - (string) Builds a blank option with the placeholder text that is selected by default.  This overrides defaultIndex

`search` - (boolean) Determines whether the select box is searchable



Building the select box
=======================

selectbox data must be passed as an array of objects

```
[
    {
        text        : 'probably the string you want to see',
        value       : 'return value',
        description : 'a longer description of this element', // optional, string
        extraClass  : 'extra--classname',                   // optional, string
        disabled    : false                                 // optional, boolean
    },
    ...
]
```
 
or a simple array of strings. The passed text will be both the text and the value.  There would be no description in this case

```
[
    'value 1',
    'value 2',
    'value 3',
    ...
]
```

or, if you want section headers.  You can even add uncatagorized things intermingled

```
[
    {
        header : header1,
        data : [ option1, option2, ... ]
    },
    {
        text        : 'probably the string you want to see',
        value       : 'return value',
        description : 'a longer description of this element'
    },
    {
        header : header2,
        data : [ option1, option2, ... ]
    },
    ...
]

```

all extra properties passed in an option that are not shown here will be added as data attributes for the sake of reference later.  The data can be accessed in the init (before building) as this.data if they need reformatting or filtering.


API
===

These functions are intended for use in the user provided event callbacks

```
this.deselectAll()
this.destroy()
this.disable( bool )
this.getOption( num )
this.getSelectedOptions()
this.getSelectedValues()
this.rebuildSelect( data )
this.refs
this.setIndex( index, multiple )
this.setValue( value, multiple )
```

`deselectAll()` deselects all options

`destroy()` removes event listeners, then flounder

`disable( bool )` disables or reenables flounder

`getOption( num )` returns the option element and the div element at a specified index as an object `{ option : option element, div : div element }`

`getSelectedOptions()` returns the currently selected option tags in an array

`getSelectedValues()` returns the currently selected values in an array
 
 `rebuildOptions( options )` completely rebuilds the select boxes with new or altered options
 
`refs` contains references to all flounder elements

`setIndex( index, multiple )` sets the item with the passed index as selected.  If multiple is true and it is a multi-select box, it is selected additionally.  Otherwise it's selected instead.  This accepts arrays as well.  Without multiple equaling true it will only select the last option.
 
`setValue( value, multiple )` sets the item with the passed value as selected.  If multiple is true and it is a multi-select box, it is selected additionally.  Otherwise it's selected instead. This accepts arrays as well.  Without multiple equaling true it will only select the last option.


Contributing
============

We gladly accept and review any pull-requests. Feel free! :heart:


This project adheres to the [Contributor Covenant](http://contributor-covenant.org/). By participating, you are expected to honor this code.

[Flounder - Code of Conduct](https://github.com/sociomantic/flounder/blob/master/CODE_OF_CONDUCT.md)

Need to report something? [hr@sociomantic.com](hr@sociomantic.com)


Example
========

Given the example data:

```

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
        }
    ];
```

a vanilla flounder

flounder can be attached to basically anything

```

    new flounder( document.getElementById( 'example' ), {
        placeholder         : 'placeholders!',

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
        } 
    } );
```

a react flounder

react flounder can only be attached to container elements (div, span, etc)


```

    ReactDOM.render( React.createElement( FlounderReact, {
        defaultValue        : 'placeholders!',

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
        } } ), document.getElementById( 'example' )
    );
```


The result of either of these is shown here (only styled with the structural css)

closed

![closed](https://cloud.githubusercontent.com/assets/4903570/11898709/4ee0059a-a59a-11e5-83e9-d1d2e0dbe46e.png)

open menu

![open menu](https://cloud.githubusercontent.com/assets/4903570/11898721/629c0cbe-a59a-11e5-95ed-82f0ff557bde.png)

1 selected

![1 selected](https://cloud.githubusercontent.com/assets/4903570/11898730/708eaa02-a59a-11e5-930a-cccbc22f0401.png)

See more examples on the [demo page](./demo/index.html)


Change Log
==========

0.2.3
-----

+ simplified how keypresses are handled
+ fixed first keypress bug (#23)
+ updated examples and example pics
+ updated default css
+ added additional package keywords
+ updates to readme
+ fixed a bug based on select tags NOT being arrays
+ fixed a bug that stopped data from being passed from the config object
+ brought back _slice and the constructor position


0.2.2
-----

+ improvements in defaults
+ react improvements
+ debug mode added to demo page
+ added better aria support
+ programmatically setting value or index no longer triggers onSelect
+ changed rebuildOptions to rebuildSelect for clarity
+ changed this.options to this.data for clarity
+ added the ability to build sections with headers
+ refactored some build functions


0.2.1
-----

+ added setValue to API
+ added disable classes to the css
+ internal fixes
+ added hasClass
+ changed setValueClick
+ added disable to API
+ added classes config object
+ broke up the main flounder file
+ readme updates


0.2.0
-----

+ user callbacks now keep their name internally for dynamic changes
+ some users callback now give the array of selected values (see examples)
+ _default is now defaultValue
+ the constructor now accepts µ and $ objects and returns an array of flounders
+ a call to the constructor without and arguments now returns the constructor
+ added getSelectedValues() to API
+ added the ability to give options unique classes
+ added wrapper to the class options
+ changed the flounder class optoin from container to flounder
+ restructured folders and files


0.1.5
-----

+ added rebuildOption and getOptions
+ added dynamic options
+ added getSelected
+ fixes in keypress handlers
+ added support for AMD loaders
+ added a jquery plugin wrapper
+ added a microbe plugin wrapper
+ fixed multi-select with dynamic options


0.1.4
-----

+ flounder now detroys itself properly


0.1.3
-----

+ fresh opening a menu now scrolls to selected (non-multiple)
+ events in setValue are now normalized


0.1.0
-----

+ all callback functions all start with `on` for clarity (`init` becomes `onInit`)
