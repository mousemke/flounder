var gulp            = require( 'gulp' );
var fs              = require( 'fs' );
var browserify      = require( 'browserify' );
var babelify        = require( 'babelify' );
var uglify          = require( 'gulp-uglify' );
var header          = require( 'gulp-header' );

var _package        = require( './package.json' );

var now             = new Date();
var year            = now.getUTCFullYear();

var licenceLong     = '/*!\n' +
                      ' * Flounder JavaScript Stylable Selectbox v' + _package.version + '\n' +
                      ' * ' + _package.homepage + '\n' +
                      ' *\n' +
                      ' * Copyright ' + ( 2015 === year ? year : '2015-' + year ) + ' Sociomantic Labs and other contributors\n' +
                      ' * Released under the MIT license\n' +
                      ' * https://github.com/sociomantic-tsunami/flounder/license\n' +
                      ' *\n' +
                      ' * Date: ' + now.toDateString() + '\n' +
                      ' * "This, so far, is the best Flounder ever"\n' +
                      ' */\n';

var licenceShort    = '/*! Flounder v' + _package.version + ' | (c) ' + ( 2015 === year ? year : '2015-' + year ) + ' Sociomantic Labs | https://github.com/sociomantic-tsunami/flounder/license */\n';


function build( folder, filename, ext )
{
    browserifyFiles( folder, filename, ext );
    min( folder, filename, ext );
}


function browserifyFiles( folder, filename, ext )
{
    ext = ext || '.js';

    browserify( './src/' + folder + '/' + filename + ext )
        .transform( babelify, { stage : 0 } )
        .bundle()
        .pipe( fs.createWriteStream( __dirname + '/dist/' + filename + ext ) )
        .on( 'finish', function()
        {
            gulp.src( './dist/' + filename + ext )
                .pipe( header( licenceLong ) )
                .pipe( gulp.dest( './dist/' ) )
        } );
};


function min( folder, filename, ext )
{
    ext = ext || '.js';

    browserify( './src/' + folder + '/' + filename + ext )
        .transform( babelify, { stage : 0 } )
        .bundle()
        .pipe( fs.createWriteStream( __dirname + '/dist/' + filename + '.min' + ext ) )
        .on( 'finish', function()
        {
            gulp.src( './dist/' + filename + '.min' + ext )
                .pipe( uglify() )
                .pipe( header( licenceShort ) )
                .pipe( gulp.dest( './dist/' ) )
        } );
}


gulp.task( 'buildTests', function()
{
    browserify( './tests/tests.js' )
        .transform( babelify, { stage : 0 } )
        .bundle()
        .pipe( fs.createWriteStream( __dirname + '/tests/tests.dist.js' ) )
} );


gulp.task( 'demo', function()
{
    browserify( './demo/demo.js' )
        .transform( babelify, { stage : 0 } )
        .bundle()
        .pipe( fs.createWriteStream( __dirname + '/demo/demoDist.js' ) );
} );


gulp.task( 'vanilla', function()
{
    build( 'core', 'flounder' );
} );


gulp.task( 'react', function()
{
    build( 'wrappers', 'flounder.react', '.jsx' );
} );


gulp.task( 'amd', function()
{
    build( 'wrappers', 'flounder.amd' );
} );


gulp.task( 'jquery', function()
{
    build( 'wrappers', 'flounder.jquery' );
} );


gulp.task( 'microbe', function()
{
    build( 'wrappers', 'flounder.microbe' );
} );


gulp.task( 'default', [], function()
{
    gulp.start( [ 'vanilla', 'react', 'amd', 'jquery', 'microbe', 'demo', 'buildTests' ] );
} );


gulp.task( 'compile', [], function()
{
        browserifyFiles( 'core', 'flounder' );
        browserifyFiles( 'wrappers', 'flounder.react' );
        browserifyFiles( 'wrappers', 'flounder.amd' );
        browserifyFiles( 'wrappers', 'flounder.jquery' );
        browserifyFiles( 'wrappers', 'flounder.microbe' );
} );


gulp.task( 'min', [], function()
{
        min( 'core', 'flounder' );
        min( 'wrappers', 'flounder.react' );
        min( 'wrappers', 'flounder.amd' );
        min( 'wrappers', 'flounder.jquery' );
        min( 'wrappers', 'flounder.microbe' );
} );

