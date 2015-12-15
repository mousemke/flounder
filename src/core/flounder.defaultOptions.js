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
    onInit              : blankFunc,
    onOpen              : blankFunc,
    onSelect            : blankFunc,
    onClose             : blankFunc,
    onComponentDidMount : blankFunc,
    options             : []
};

export default defaultOptions;
