Flounder.js 0.4.3
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

// react has some caveats.  If you want to use react flounder, you should
// build it from the source file.  ./dist/flounder.react.js is so 
// large because it already has a copy of react included.  Additionally, 
// react flounder can only be attached to a container, and not an 
// INPUT or SELECT

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


###Target options

Flounder's target is quite flexible.  

you can give it an element:

```
new Flounder( document.getElementsByTagName( 'input--el' )[0], options );
```

an array:

```
new Flounder( [ el1, el2, el3 ], options );
```

an HTML collection:

```
new Flounder( document.getElementsByTagName( 'input' ), options );
```

a jQuery object:

```
new Flounder( $( 'input' ), options );
```

a microbe:

```
new Flounder( µ( 'input' ), options );
```

or, just a selector string:

```
new Flounder( 'input', options );
```

If flounder is fed an element that already has a flounder, it will destroy it and re initialize it with the new options.


###Available config options
 
```
{
    classes                 : {
        flounder    : 'class--to--give--the--main--flounder--element',
        hidden      : 'class--to--denote--hidden',
        selected    : 'class--to--denote--selected--option',
        wrapper     : 'additional--class--to--give--the--wrapper'
    },
    data                    : dataObject,
    defaultValue            : defaultValue,
    defaultIndex            : defaultIndex,
    multiple                : false,
    multipleTags            : true,
    multipleMessage         : '(Multiple Items Selected)',
    onClose                 : function( e, valueArray ){},
    onComponentDidMount     : function(){},
    onComponentWillUnmount  : function(){},
    onFirstTouch            : function( e ){},
    onInit                  : function(){},
    onOpen                  : function( e, valueArray ){},
    onSelect                : function( e, valueArray ){}
    placeholder             : 'Please choose an option',
    search                  : false,
    selectDataOverride      : false
}
```

+ `classes`- (object) Contains configurable classes for various elements.  The are additional classes, not replacement classes.

+ `data` - (array) select box options to build in the select box.  Can be organized various ways

+ `defaultValue` - (string) Sets the default value to the passed value but only if it matches one of the select box options. Multi-tag select boxes only support placeholders

+ `defaultIndex` - (number) Sets the default option to the passed index but only if it exists.  This overrides defaultValue. Multi-tag select boxes only support placeholders.

+ `multiple` - (boolean) Determines whether it is a multi-select box or single

+ `multipleTags` - (boolean) Determines how a multi-select box is displayed

+ `multipleMessage` - (string) If there are no tags, this is the message that will be displayed in the selected area when there are multiple options selected

+ `onClose` - (function) Triggered when the selectbox is closed

+ `onComponentDidMount` - (function) Triggered when the selectbox is finished building

+ `onComponentWillUnmount` - (function) Triggered right before flounder is removed from the dom

+ `onFirstTouch` - (function) Triggered the first time flounder is interacted with. An example usage would be calling an api for a list of data to populate a drop down, but waiting to see if the user interacts with it

+ `onInit` - (function) Triggered when the selectbox is initiated, but before it's built

+ `onOpen` - (function) Triggered when the selectbox is opened

+ `onSelect` - (function) Triggered when an option selectbox is closed

+ `placeholder` - (string) Builds a blank option with the placeholder text that is selected by default.  This overrides defaultIndex

+ `search` - (boolean) Determines whether the select box is searchable

+ `selectDataOverride` - (boolean) If this is true, flounder will ignore sleect box options tags and just apply the passed data



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
this.buildFromUrl( url, callback )
this.clickByIndex( index, multiple )
this.clickByText( text, multiple )
this.clickByValue( value, multiple )
this.deselectAll()
this.destroy()
this.disable( bool )
this.disableByIndex( index )
this.disableByText( text )
this.disableByValue( value )
this.enableByIndex( index )
this.enableByText( text )
this.enableByValue( value )
this.getData( [ num ] )
this.getSelected()
this.getSelectedValues()
this.loadDataFromUrl( url, callback )
this.props
this.rebuild( data )
this.reconfigure( props )
this.refs
this.setByIndex( index, multiple )
this.setByText( text, multiple )
this.setByValue( value, multiple )
```

+ `buildFromUrl( url, callback )` loads data from a remote address, passes it to a callback, then builds the flounder object

+ `clickByIndex( index, multiple )` sets the item with the passed index as selected.  If multiple is true and it is a multi-select box, it is selected additionally.  Otherwise it's selected instead.  This accepts arrays as well.  Without multiple equaling true it will only select the last option. This fires the onClick event
 
+ `clickByText( text, multiple )` sets the item with the passed text as selected.  If multiple is true and it is a multi-select box, it is selected additionally.  Otherwise it's selected instead. This accepts arrays as well.  Without multiple equaling true it will only select the last option. This fires the onClick event

+ `clickByValue( value, multiple )` sets the item with the passed value as selected.  If multiple is true and it is a multi-select box, it is selected additionally.  Otherwise it's selected instead. This accepts arrays as well.  Without multiple equaling true it will only select the last option. This fires the onClick event

+ `deselectAll()` deselects all data

+ `destroy()` removes event listeners, then flounder

+ `disable( bool )` disables or reenables flounder

+ `disableByIndex( index )` disables a flounder option by index

+ `disableByText( text )` disables a flounder option by text

+ `disableByValue( value )` disables a flounder option by value

+ `enableByIndex( index )` enables a flounder option by index

+ `enableByText( text )` enables a flounder option by text 

+ `enableByValue( value )` enables a flounder option by value

+ `getData( [ num ] )` returns the option element and the div element at a specified index as an object `{ option : option element, div : div element }`. If no number is given, it will return all data.

+ `getSelected()` returns the currently selected option tags in an array

+ `getSelectedValues()` returns the currently selected values in an array
 
+ `loadDataFromUrl( url, callback )` loads data from a remote address and returns it to a passed callback. 

+ `props` the props set in the initial constructor

+ `rebuild( data )` completely rebuilds the select boxes with new or altered data
 
+ `reconfigure( props )` rebuilds the flounder object with new options

+ `refs` contains references to all flounder elements

+ `setByIndex( index, multiple )` sets the item with the passed index as selected.  If multiple is true and it is a multi-select box, it is selected additionally.  Otherwise it's selected instead.  This accepts arrays as well.  Without multiple equaling true it will only select the last option. This does not fire the onClick event
 
+ setByText( text, multiple )` sets the item with the passed text as selected.  If multiple is true and it is a multi-select box, it is selected additionally.  Otherwise it's selected instead. This accepts arrays as well.  Without multiple equaling true it will only select the last option. This does not fire the onClick event

+ `setByValue( value, multiple )` sets the item with the passed value as selected.  If multiple is true and it is a multi-select box, it is selected additionally.  Otherwise it's selected instead. This accepts arrays as well.  Without multiple equaling true it will only select the last option. This does not fire the onClick event


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

0.4.3
-----

+ [flounder] added read-only version number
+ [version] added src/core/version.js
+ [version] added scripts/version_bump.js


0.4.2
-----

+ [api] added buildFromUrl
+ [api] added loadDataFromUrl
+ [api] added onFirstTouch
+ [build] select boxes that have no options as targets now use data
+ [build] the default option when not specified if the data set is empty is the default placeholder
+ [build] changed the default value priority
+ [flounder] changed sortData to not break with strings
+ [flounder] microbe and promise now required to build 
+ [config] added selectDataOverride for empty select boxes


0.4.1
-----

+ [build] setSelectValue is now bound to flounder again


0.4.0
-----

+ [api] changed language of all contextual statements `setIndex` becomes `setByIndex`, etc
+ [config] added onComponentWillUnmount()
+ [config] added try/catch to all config functions
+ [build] placeholder will only be added to selectboxes that do not have a first option with '' as a value.  otherwise the text will be changed to the new placeholder value.
+ [build] fixed bugs in construction when using a selectbox as a target
+ [utils] tweaked addClass


0.3.2
-----

+ [api] added clickText, disableText, enableText, and setText
+ [api] correctly bound this to mapped set and click functions


0.3.1
-----

+ [search] fixed a bug in value length detection
+ [defaults] removed defaultTextIndent.  this can be handled by css
+ [api] added disableIndex and disableValue
+ [api] added enableIndex and enableValue


0.3.0
-----

+ [api] getOption is now getData
+ [api] getData now provides all data when no number is given
+ [api] getSelectedOptions is now getSelected
+ [api] rebuildSelect is now rebuild
+ [api] added clickIndex and clickValue
+ [api] added props
+ [api] added reconfigure
+ [default] multipleTags is now false by default
+ [search] added Sole (a ROVer derivitive) for fuzzy search


0.2.9
-----

+ checkClickTarget now fails better


0.2.8
-----

+ structure style tweaked
+ internal abstractions
+ fixed a multi-tag event leak


Older Changes
=============

To keep the length of this file down, [older changes are here](./older_changes.md)
