Flounder.js
===========

Flounder is a styled select box replacement aimed at being easily configurable while conforming to native functionality and accessibility standards.

```
// npm
require('flounder');

// es6
import Flounder from 'flounder';
```


Usage
=====

Flounder can be used in vanilla js or with react.

```
// vanilla
new Flounder( target, options );

// react
ReactDOM.render( React.createElement( FlounderReact, options ), target );

// react (JSX)
React.render( <FlounderReact option1="" option2="">, target );
```


###Available options


```
{
    _default            : defaultValue,
    cancel              : function( e ){},
    className           : 'extra--class',
    close               : function( e ){},
    componentDidMount   : function(){},
    hiddenClass         : 'class--to--denote--hidden',
    init                : function(){},
    multiple            : false,
    multipleTags        : true,
    multipleMessage     : '(Multiple Items Selected)',
    open                : function( e ){},
    options             : dataObject,
    search              : true,
    select              : function( e ){}
}
```


Building the select box
=======================

options must be passed as an array of objects

```
[
    {
        text        : 'probably the string you want to see',
        value       : 'return value',
        description : 'a longer description of this option' // optional
    }
]
```

all extra properties passed that are not shown here will be added as data attributes for the sake of reference later.  The options can be accessed in the init (before building) as this.options if they need reformatting or filtering.


Contributing
============

We gladly accept and review any pull-requests. Feel free! :heart:


This project adheres to the [Contributor Covenant](http://contributor-covenant.org/). By participating, you are expected to honor this code.

[Flounder - Code of Conduct](https://github.com/sociomantic/flounder/blob/master/CODE_OF_CONDUCT.md)

Need to report something? [hr@sociomantic.com](hr@sociomantic.com)


Example
========

Given the example options:

```

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
        }
    ];
```

a vanilla multi-flounder with tags

flounder can be attached to basically anything

```

    new flounder( document.getElementById( 'example' ), {
        default             : 'placeholders!',

        init                : function()
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

        multiple            : true } );
```

a react multi-flounder with tags

react flounder can only be attached to container elements (div, span, etc)


```

    ReactDOM.render( React.createElement( FlounderReact, {
        _default             : 'placeholders!',

        multiple            : true,

        init                : function()
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
        } } ), document.getElementById( 'example' )
    );
```


The result of either of these is shown here (only styled with the structural css)

![closed](https://d1ro8r1rbfn3jf.cloudfront.net/ms_16133/Vu591qbeROU9QezI1cXQ1XkYoQEkhP/Flounder%2Bdemo%2B2015-11-23%2B23-26-41.jpg?Expires=1448404005&Signature=Rj~Hm6GmMgBCFkwr4~BnhmYyrcHDzMYGS9GGIg4kPHgCc7GhMmIStXlFJouWAEny4BeMXKHMZu-ruXTQwRCeVeZf2oL098kTyScHEVLsyZr-JZ6z6mnPP-ikgMlvc78xZJcZsdIjDEihaVm3NmJWRmfq~kKH3BvVQaLgUt7NyZV6IxuRhYfxUFkBlHOg6moHTibrehy-Yvni8fllz8BekBX-oVibZ6ezgmBQvOrOOCGRjp39mn4-QJU8jpNO41RW3iG2osAXJMxlmJhG8cL6X7trpM1VWQP7M462PrtnGt6~j4BjammY8hldEaDp8LpjsCI-2AGOm48FqGH5VAVLPw__&Key-Pair-Id=APKAJHEJJBIZWFB73RSA)

![open menu](https://d1ro8r1rbfn3jf.cloudfront.net/ms_16133/MfbfkOAmsRGZHKfONjpntVYHRLzaUF/Flounder%2Bdemo%2B2015-11-23%2B23-26-20.jpg?Expires=1448403987&Signature=bxaazMlR6YnSqY4-mm8wZ5ZaeiiyHSIcYoptQLlk96DZB3cWM9JRUH6cuvVdbgEpuAwViJgBQPeeDyRBEfql5IS3WJXWPTlFCv-dOwvKT-7VboFDbjPv5-JD1TmBNr4ElcdWGTK8TsISv~8Bo0p35vnXnwUx7LBUTj86z3Z4hEP8-YMkU8vLVaYoqEDy6jSYDtptfTZvMxH3x4Nv2gNOeRLt-RYH9vhQtt1Vqv4YsOF29lNe2EmrvV5VDahdOviuPMwJ4K5HyggGZ4qsO84DM~~KhAS4ff50SCk069cfWRVARYwW1JGm71D-ccmPYQzM70pT1pAMIaqWkFjpFAy8CA__&Key-Pair-Id=APKAJHEJJBIZWFB73RSA)

![1 selected](https://d1ro8r1rbfn3jf.cloudfront.net/ms_16133/mL3upXVlwnB4pkC4jN5QCE4ZIdiQ8F/Flounder%2Bdemo%2B2015-11-23%2B23-26-57.jpg?Expires=1448404020&Signature=bWFxIgxc-0DQWqSAWXCNzGI5R9LiCho7EfuHgUp0wheeDl85cui3OcnOcw~HSYR6sSJ6XcQPHeVE5FAet1suEFR2q0fe9p--tuq8G9T0wK0Mp6fLYi49OGs6mTftFzQy3zgUVlPKY58nIejzAl6N-fT67NjUqKBhfUltjssc-OZvD3TZf7nAS0erQwuiM5QH6y9sFscavZWHDrsV1ReXkYqMbRXtbykM~JNPP-2Pr9ZvRwpcA7wdFpTpIF4OH0SsR-hem-xnnZ1ZHvJELARqzp2Q6OLWapRdaHHg~9OTnIDY7~lbz-2XcmrP6wMLJqZ6bqVuoWfCdtLk8VK6xQdIEg__&Key-Pair-Id=APKAJHEJJBIZWFB73RSA)

See more examples on the [demo page](./demo/index.html)
