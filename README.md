Flounder.js
===========

require('flounder');

or

import Flounder from 'flounder';


available options
=================
 
```
new Flounder( elementJqueryObjectOrMicrobe, {
    _default            : defaultValue,
    cancel              : function(){},
    className           : 'extra--class',
    close               : function(){},
    componentDidMount   : function(){},
    hiddenClass         : 'class--to--denote--hidden',
    init                : function(){},
    multiple            : false,
    multipleTags        : true,
    multipleMessage     : '(Multiple Items Selected)',
    open                : function(){},
    options             : dataObject,
    search              : true,
    select              : function(){}
} );
```


options
=======

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