
/* jshint globalstrict: true */
'use strict';

import Flounder from '../src/core/flounder';
import utils    from '../src/core/utils';

import constructorTest  from './unit/constructorTest';
import flounderTest     from './unit/flounderTest';
import utilsTest        from './unit/utilsTest';
import versionTest      from './unit/versionTest';

class Tests
{
    constructor()
    {
        window.Flounder = Flounder;

        return this;
    }
};


utils.extendClass( Tests, utils );
let tests = new Tests;

constructorTest( Flounder );
flounderTest( Flounder );
utilsTest( Flounder, utils );
versionTest( Flounder );

export default tests;