const defaults = {
    classes : {
        flounder    : '',
        hidden      : 'flounder--hidden',
        selected    : 'flounder__option--selected',
        wrapper     : ''
    },
    defaultTextIndent   : 0,
    multiple            : false,
    multipleTags        : true,
    multipleMessage     : '(Multiple Items Selected)',
    onClose             : function(){ },
    onComponentDidMount : function(){ },
    onInit              : function(){ },
    onOpen              : function(){ },
    onSelect            : function(){ },
    options             : [],
    placeholder         : 'Please choose an option',
    search              : false
};

export default defaults;
