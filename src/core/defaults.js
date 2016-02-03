const defaults = {
    classes                 : {
        flounder    : '',
        hidden      : 'flounder--hidden',
        selected    : 'flounder__option--selected',
        wrapper     : ''
    },
    data                    : [],
    keepChanges             : false,
    multiple                : false,
    multipleTags            : false,
    multipleMessage         : '(Multiple Items Selected)',
    onClose                 : function( e, selectedValues ){},
    onComponentDidMount     : function(){},
    onComponentWillUnmount  : function(){},
    onFirstTouch            : function( e ){},
    onInit                  : function(){},
    onOpen                  : function( e, selectedValues ){},
    onSelect                : function( e, selectedValues ){},
    placeholder             : 'Please choose an option',
    search                  : false,
    selectDataOverride      : false
};

export default defaults;
