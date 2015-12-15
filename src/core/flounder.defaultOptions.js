const blankFunc = function(){};

const defaultOptions = {
    classes : {
        flounder    : '',
        hidden      : 'flounder--hidden',
        selected    : 'flounder__option--selected',
        wrapper     : ''
    },
    defaultTextIndent   : 0,
    defaultValue        : '',
    multiple            : false,
    multipleTags        : true,
    multipleMessage     : '(Multiple Items Selected)',
    onClose             : blankFunc,
    onInit              : blankFunc,
    onOpen              : blankFunc,
    onSelect            : blankFunc,
    onComponentDidMount : blankFunc,
    options             : [],
    search              : false
};

export default defaultOptions;
