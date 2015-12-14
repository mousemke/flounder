var gulp        = require('gulp');
var fs          = require('fs');
var browserify  = require('browserify');
var babelify    = require('babelify');


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
        .pipe( fs.createWriteStream( __dirname + '/dist/flounder.js' ) );
} );


gulp.task( 'react', function()
{
    browserify( './src/wrappers/flounder.react.jsx' )
        .transform( babelify, { stage : 0 } )
        .bundle()
        .pipe( fs.createWriteStream( __dirname + '/dist/flounder.react.jsx' ) );
} );


gulp.task( 'amd', function()
{
    browserify( './src/wrappers/flounder.amd.jsx' )
        .transform( babelify, { stage : 0 } )
        .bundle()
        .pipe( fs.createWriteStream( __dirname + '/dist/flounder.amd.js' ) );
} );


gulp.task( 'jquery', function()
{
    browserify( './src/wrappers/flounder.jquery.jsx' )
        .transform( babelify, { stage : 0 } )
        .bundle()
        .pipe( fs.createWriteStream( __dirname + '/dist/flounder.jquery.js' ) );
} );


gulp.task( 'microbe', function()
{
    browserify( './src/wrappers/flounder.microbe.jsx' )
        .transform( babelify, { stage : 0 } )
        .bundle()
        .pipe( fs.createWriteStream( __dirname + '/dist/flounder.microbe.js' ) );
} );


gulp.task( 'default', [], function()
{
    gulp.start( [ 'vanilla', 'react', 'amd', 'jquery', 'microbe', 'demo' ] );
} );
