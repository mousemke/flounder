Flounder.js 1.0.0
=================

[![Flounder build status](https://travis-ci.org/sociomantic-tsunami/flounder.svg)](https://travis-ci.org)

(for modern browsers and ie10+)

Flounder is a styled select box replacement aimed at being easily configurable while conforming to native functionality and accessibility standards.

```js
// npm
require('flounder');

// es6
import Flounder from 'flounder';
```


Usage
=====

Flounder can be used in vanilla js, [requirejs](http://requirejs.org/), [jquery](http://jquery.com/), and [microbe](https://github.com/sociomantic-tsunami/microbe).

Flounder can also be used in react, however there is a [seperate repo](https://github.com/sociomantic-tsunami/flounder-react) for that

```js
// vanilla
new Flounder( target, configOptions );

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

Flounder also adds a reference of itself to its target element.  So if you lose the reference, you can just grab it from the element again
```js
document.querySelector( '#vanilla--select' ).flounder.destroy()
```


###Target options

Flounder's target is quite flexible, however it will only build on the first element it finds.

* if you would like to build multiple flounders from an array or selector, use `Flounder.find( <selector or array-like object>, [configOptions] )`

you can give it an element:

```js
new Flounder( document.getElementsByTagName( 'input--el' )[0], configOptions );
```

an HTML collection:

```js
new Flounder( document.getElementsByTagName( 'input' ), configOptions );
```

a jQuery object:

```js
new Flounder( $( 'input' ), configOptions );
```

a microbe:

```js
new Flounder( µ( 'input' ), configOptions );
```

or, just a selector string:

```js
new Flounder( 'input', configOptions );
```

If flounder is fed an element that already has a flounder, it will destroy it and re initialize it with the new config options.


###Available config options

```js
{
    allowHTML               : false,
    classes                 : {
        flounder    : 'class--to--give--the--main--flounder--element',
        hidden      : 'class--to--denote--hidden',
        selected    : 'class--to--denote--selected--option',
        wrapper     : 'additional--class--to--give--the--wrapper'
    },
    data                    : dataObject,
    defaultEmpty            : true,
    defaultValue            : defaultValue,
    defaultIndex            : defaultIndex,
    disableArrow            : false,
    keepChangesOnDestroy    : false,
    multiple                : false,
    multipleTags            : false,
    multipleMessage         : '(Multiple Items Selected)',
    onClose                 : function( e, valueArray ){},
    onComponentDidMount     : function(){},
    onComponentWillUnmount  : function(){},
    onFirstTouch            : function( e ){},
    onInit                  : function(){},
    onInputChange           : function( e ){},
    onOpen                  : function( e, valueArray ){},
    onSelect                : function( e, valueArray ){}
    openOnHover             : false,
    placeholder             : 'Please choose an option',
    search                  : false,
    selectDataOverride      : false
}
```

+ `allowHTML`- (boolean) Renders the data text as HTML.  With this option enabled, any api call that must compare text will need the exact html in order to be a match

+ `classes`- (object) Contains configurable classes for various elements.  The are additional classes, not replacement classes.

+ `data` - (array) select box options to build in the select box.  Can be organized various ways

+ `defaultEmpty`- (boolean) first in priority, this makes the flounder start with a blank valueless option

+ `defaultValue` - (string) Sets the default value to the passed value but only if it matches one of the select box options. Multi-tag select boxes only support placeholders

+ `defaultIndex` - (number) Sets the default option to the passed index but only if it exists.  This overrides defaultValue. Multi-tag select boxes only support placeholders.

+ `disableArrow` - (boolean) does not add the dropdown arrow element

+ `keepChangesOnDestroy` - (boolean) Determines whether on destroy the old element is restored, or the flounder changes to the select box are kept.  This only applies when the initial element for flounder is a select box

+ `multiple` - (boolean) Determines whether it is a multi-select box or single

+ `multipleTags` - (boolean) Determines how a multi-select box is displayed

+ `multipleMessage` - (string) If there are no tags, this is the message that will be displayed in the selected area when there are multiple options selected

+ `onClose` - (function) Triggered when the selectbox is closed

+ `onComponentDidMount` - (function) Triggered when the selectbox is finished building

+ `onComponentWillUnmount` - (function) Triggered right before flounder is removed from the dom

+ `onFirstTouch` - (function) Triggered the first time flounder is interacted with. An example usage would be calling an api for a list of data to populate a drop down, but waiting to see if the user interacts with it

+ `onInit` - (function) Triggered when the selectbox is initiated, but before it's built

+ `onInputChange` - (function) Triggered when someone types in a search box.  note: this will do nothing if search is not enabled.

+ `onOpen` - (function) Triggered when the selectbox is opened

+ `onSelect` - (function) Triggered when an option is selected

+ `openOnHover` - (boolean) replaces click to open action with hover

+ `placeholder` - (string) Builds a blank option with the placeholder text that is selected by default.  This overrides defaultIndex

+ `search` - (boolean) Determines whether the select box is searchable

+ `selectDataOverride` - (boolean) If this is true, flounder will ignore sleect box options tags and just apply the passed data

*IMPORTANT DEFAULT PRIORITY*
```
1 ) placeholder
2 ) defaultIndex
3 ) defaultValue
4 ) whatever is at index 0
```

Building the select box
=======================

selectbox data must be passed as an array of objects

```js
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

```js
[
    'value 1',
    'value 2',
    'value 3',
    ...
]
```

or, if you want section headers.  You can even add uncatagorized things intermingled

```js
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

```js
this.buildFromUrl( url, callback )
this.clickByIndex( index, multiple* )
this.clickByText( text, multiple* )
this.clickByValue( value, multiple* )
this.deselectAll()
this.destroy()
this.disable( bool* )
this.disableByIndex( index )
this.disableByText( text )
this.disableByValue( value )
this.enableByIndex( index )
this.enableByText( text )
this.enableByValue( value )
this.getData( num* )
this.getSelected()
this.getSelectedValues()
this.loadDataFromUrl( url, callback )
this.props
this.rebuild( data*, props*  )
this.refs
this.setByIndex( index, multiple* )
this.setByText( text, multiple* )
this.setByValue( value, multiple* )

*optional
```

+ `buildFromUrl( url, callback )` loads data from a remote address, passes it to a callback, then builds the flounder object

+ `clickByIndex( index, multiple )` sets the item with the passed index as selected.  If multiple is true and it is a multi-select box, it is selected additionally.  Otherwise it's selected instead.  This accepts arrays as well.  Without multiple equaling true it will only select the last option. This fires the onClick event.  A negative index will start counting from the end.

+ `clickByText( text, multiple )` sets the item with the passed text as selected.  If multiple is true and it is a multi-select box, it is selected additionally.  Otherwise it's selected instead. This accepts arrays as well.  Without multiple equaling true it will only select the last option. This fires the onClick event

+ `clickByValue( value, multiple )` sets the item with the passed value as selected.  If multiple is true and it is a multi-select box, it is selected additionally.  Otherwise it's selected instead. This accepts arrays as well.  Without multiple equaling true it will only select the last option. This fires the onClick event

+ `deselectAll()` deselects all data

+ `destroy()` removes event listeners, then flounder.  this will return the element to it's original state

+ `disable( bool )` disables or reenables flounder

+ `disableByIndex( index )` disables a flounder option by index.  A negative index will start counting from the end.

+ `disableByText( text )` disables a flounder option by text

+ `disableByValue( value )` disables a flounder option by value

+ `enableByIndex( index )` enables a flounder option by index. A negative index will start counting from the end.

+ `enableByText( text )` enables a flounder option by text

+ `enableByValue( value )` enables a flounder option by value

+ `getData( num )` returns the option element and the div element at a specified index as an object `{ option : option element, div : div element }`. If no number is given, it will return all data.

+ `getSelected()` returns the currently selected option tags in an array

+ `getSelectedValues()` returns the currently selected values in an array

+ `loadDataFromUrl( url, callback )` loads data from a remote address and returns it to a passed callback.

+ `props` the props set in the initial constructor

+ `rebuild( data, props )` rebuilds the select box options with new or altered data.  If props are set, this completely rebuilds flounder. Here, props do not necessarily need to include data. If props include data, the data argument can be omitted. Both data and props are optional (rebuild w/ current options).

+ `refs` contains references to all flounder elements

+ `setByIndex( index, multiple )` sets the item with the passed index as selected.  If multiple is true and it is a multi-select box, it is selected additionally.  Otherwise it's selected instead.  This accepts arrays as well.  Without multiple equaling true it will only select the last option. This does not fire the onClick event.  A negative index will start counting from the end.

+ `setByText( text, multiple )` sets the item with the passed text as selected.  If multiple is true and it is a multi-select box, it is selected additionally.  Otherwise it's selected instead. This accepts arrays as well.  Without multiple equaling true it will only select the last option. This does not fire the onClick event.

+ `setByValue( value, multiple )` sets the item with the passed value as selected.  If multiple is true and it is a multi-select box, it is selected additionally.  Otherwise it's selected instead. This accepts arrays as well.  Without multiple equaling true it will only select the last option. This does not fire the onClick event.


npm scripts
===========

+ `bash` creates the `dist` folder and copies `flounder-structure.css` to it

+ `build` runs `bash`, `gulp` and `test:unit:coverage:cli`

+ `demo` builds the demo

+ `gulp` runs bash and compiles flounder

+ `test` runs the `nyan` tests

+ `test:unit:coverage` runs the `istanbul` tests and opens the browser report

+ `test:unit:coverage:cli` runs the `istanbul` tests on the command line

+ `versionBump` bumps the version by 0.0.1


Contributing
============

Development of Flounder requires node '4.3.1' or higher.

Flounder's **branch structure** goes as follows:

+ `release` - contains stavle including the dist files.  this is the branch that is used to make the npm and git releases

+ `master` - latest stable git repo. This is like release but without the noise of the dist files

+ `dev` - current development branch.  This is where feature branches should branch from

+ feature branches - these branches come from `dev`, are branched for a specific geature or bug, then get merged back into `dev`


Releasing
--------

When you release a new verion, commit it to master, then commit it to release. It must be released from the `release` branch.  It is the *only* branch that commits the dist files



We gladly accept and review any pull-requests into the current `dev` branch. Feel free! :heart:

Otherwise, if you just want to talk, we are very easy to get a hold of!

+ Slack:          [flounder.slack.com](https://flounder.slack.com)
+ Email:          [flounder@knoblau.ch](mailto:flounder@knoblau.ch)
+ Web:            <a href="http://flounderjs.com/" target="_blank">http://flounderjs.com/</a>
+ Git:            <a href="https://github.com/sociomantic-tsunami/flounder/" target="_blank">https://github.com/sociomantic-tsunami/flounder/</a>


This project adheres to the [Contributor Covenant](http://contributor-covenant.org/). By participating, you are expected to honor this code.

[Flounder - Code of Conduct](https://github.com/sociomantic-tsunami/flounder/blob/master/CODE_OF_CONDUCT.md)

Need to report something? [flounder@knoblau.ch](mailto:flounder@knoblau.ch)


Example
========

Given the example data:

```js

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

```js

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


The result of these is shown here (only styled with the structural css)

closed

![closed](https://cloud.githubusercontent.com/assets/4903570/11898709/4ee0059a-a59a-11e5-83e9-d1d2e0dbe46e.png)

open menu

![open menu](https://cloud.githubusercontent.com/assets/4903570/11898721/629c0cbe-a59a-11e5-95ed-82f0ff557bde.png)

1 selected

![1 selected](https://cloud.githubusercontent.com/assets/4903570/11898730/708eaa02-a59a-11e5-930a-cccbc22f0401.png)

See more examples on the [demo page](./demo/index.html)



Change Log
==========

1.0.1
-----

+ just a readme fix


1.0.0
-----

+ Flounder
    + branch structure reorganized
    + Flounder now only handles one element
    + new Flounder _always_ returns a instance of Flounder
    + Flounder will warn if it drops elements
    + some methods moved to events.js because that's obviously where they live
    + Flounder now gets Flounder.find() to apply build multiples.  This accepts anything array-like, elements, and selector strings
    + internal refactoring
    + dropped support for node 4.1

+ events
    + multiTags now support aria
    + multiTags now support keyboard navigation
    + keyboard navigation flow / tag selection optimized
    + fixed focus toggleOpen from multipleTags to search box
    + tabbing away now closes the menu
    + fixed multitag focus
    + fixed multitag search with empty results

+ api
    + buildFromUrl now returns a placeholder array

+ build
    + multiTag construction added to build
    + changed build order of DOM elements to fix multiTag tab order
    + fixed a selectOption class bug
    + adjusted default search indent settings

+ search
    + improved imteraction between tags and search box

+ readme
    + npm scripts added

+ tests
    + removed qunit
    + added mocha
    + added istanbul




Older Changes
=============

To keep the length of this file down, [older changes are here](./older_changes.md)
