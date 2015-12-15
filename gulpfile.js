var gulp            = require('gulp');
var fs              = require('fs');
var browserify      = require('browserify');
var babelify        = require('babelify');
var header          = require( 'gulp-header' );

var _package        = require( './package.json' );

var now             = new Date();
var liscenceLong    = '/*!\n' +
                      ' * Flounder JavaScript Styled Selectbox v' + _package.version + '\n' +
                      ' * ' + _package.homepage + '\n' +
                      ' *\n' +
                      ' * Copyright 2015-' + now.getUTCFullYear() + ' Sociomantic Labs and other contributors\n' +
                      ' * Released under the MIT license\n' +
                      ' * https://github.com/sociomantic/flounder/license\n' +
                      ' *\n' +
                      ' * Date: ' + now.toDateString() + '\n' +
                      ' */\n';

var liscenceShort   = '/*! Flounder v' + _package.version + ' | (c) 2015-' + now.getUTCFullYear() + ' Sociomantic Labs | https://github.com/sociomantic/flounder/license */\n';

gulp.task( 'demo', function()
{
    browserify( './demo/demo.js' )
        .transform( babelify, { stage : 0 } )
        .bundle()
        .pipe( fs.createWriteStream( __dirname + '/demo/demoDist.js' ) );
} );


gulp.task( 'vanilla', function()
{
    browserify( './src/core/flounder.jsx' )
        .transform( babelify, { stage : 0 } )
        .bundle()
        .pipe( fs.createWriteStream( __dirname + '/dist/flounder.js' ) )
        .on( 'finish', function()
        {
            gulp.src( './dist/flounder.js' )
                .pipe( header( liscenceLong ) )
                .pipe( gulp.dest( './dist/' ) )
        } );
} );


gulp.task( 'react', function()
{
    browserify( './src/wrappers/flounder.react.jsx' )
        .transform( babelify, { stage : 0 } )
        .bundle()
        .pipe( fs.createWriteStream( __dirname + '/dist/flounder.react.jsx' ) )
        .on( 'finish', function()
        {
            gulp.src( './dist/flounder.react.js' )
                .pipe( header( liscenceLong ) )
                .pipe( gulp.dest( './dist/' ) )
        } );
} );


gulp.task( 'amd', function()
{
    browserify( './src/wrappers/flounder.amd.jsx' )
        .transform( babelify, { stage : 0 } )
        .bundle()
        .pipe( fs.createWriteStream( __dirname + '/dist/flounder.amd.js' ) )
        .on( 'finish', function()
        {
            gulp.src( './dist/flounder.amd.js' )
                .pipe( header( liscenceLong ) )
                .pipe( gulp.dest( './dist/' ) )
        } );
} );


gulp.task( 'jquery', function()
{
    browserify( './src/wrappers/flounder.jquery.jsx' )
        .transform( babelify, { stage : 0 } )
        .bundle()
        .pipe( fs.createWriteStream( __dirname + '/dist/flounder.jquery.js' ) )
        .on( 'finish', function()
        {
            gulp.src( './dist/flounder.jquery.js' )
                .pipe( header( liscenceLong ) )
                .pipe( gulp.dest( './dist/' ) )
        } );
} );


gulp.task( 'microbe', function()
{
    browserify( './src/wrappers/flounder.microbe.jsx' )
        .transform( babelify, { stage : 0 } )
        .bundle()
        .pipe( fs.createWriteStream( __dirname + '/dist/flounder.microbe.js' ) )
        .on( 'finish', function()
        {
            gulp.src( './dist/flounder.microbe.js' )
                .pipe( header( liscenceLong ) )
                .pipe( gulp.dest( './dist/' ) )
        } );
} );


gulp.task( 'default', [], function()
{
    gulp.start( [ 'vanilla', 'react', 'amd', 'jquery', 'microbe', 'demo' ] );
} );
