Older changes
=============

This is truncated from the readme file to keep down the size

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
+ changed the flounder class option from container to flounder
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