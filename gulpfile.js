var gulp            = require( 'gulp' );
var fs              = require( 'fs' );
var browserify      = require( 'browserify' );
var babelify        = require( 'babelify' );
var uglify          = require( 'gulp-uglify' );
var header          = require( 'gulp-header' );

var _package        = require( './package.json' );

var now             = new Date();
var year            = now.getUTCFullYear();

var liscenceLong    = '/*!\n' +
                      ' * Flounder JavaScript Styleable Selectbox v' + _package.version + '\n' +
                      ' * ' + _package.homepage + '\n' +
                      ' *\n' +
                      ' * Copyright ' + ( 2015 === year ? year : '2015-' + year ) + ' Sociomantic Labs and other contributors\n' +
                      ' * Released under the MIT license\n' +
                      ' * https://github.com/sociomantic/flounder/license\n' +
                      ' *\n' +
                      ' * Date: ' + now.toDateString() + '\n' +
                      ' */\n';

var liscenceShort   = '/*! Flounder v' + _package.version + ' | (c) ' + ( 2015 === year ? year : '2015-' + year ) + ' Sociomantic Labs | https://github.com/sociomantic/flounder/license */\n';


function build( folder, filename )
{
    browserifyFiles( folder, filename );
    min( folder, filename );
}


function browserifyFiles( folder, filename )
{
    browserify( './src/' + folder + '/' + filename + '.jsx' )
        .transform( babelify, { stage : 0 } )
        .bundle()
        .pipe( fs.createWriteStream( __dirname + '/dist/' + filename + '.js' ) )
        .on( 'finish', function()
        {
            gulp.src( './dist/' + filename + '.js' )
                .pipe( header( liscenceLong ) )
                .pipe( gulp.dest( './dist/' ) )
        } );
};


function min( folder, filename )
{
    browserify( './src/' + folder + '/' + filename + '.jsx' )
        .transform( babelify, { stage : 0 } )
        .bundle()
        .pipe( fs.createWriteStream( __dirname + '/dist/' + filename + '.min.js' ) )
        .on( 'finish', function()
        {
            gulp.src( './dist/' + filename + '.min.js' )
                .pipe( uglify() )
                .pipe( header( liscenceShort ) )
                .pipe( gulp.dest( './dist/' ) )
        } );
}


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
    build( 'wrappers', 'flounder.react' );
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
    gulp.start( [ 'vanilla', 'react', 'amd', 'jquery', 'microbe', 'demo' ] );
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

