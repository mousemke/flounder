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
    browserify( './src/flounder.jsx' )
        .transform( babelify, { stage : 0 } )
        .bundle()
        .pipe( fs.createWriteStream( __dirname + '/dist/flounder.js' ) );
} );


gulp.task( 'react', function()
{
    browserify( './src/reactFlounder.jsx' )
        .transform( babelify, { stage : 0 } )
        .bundle()
        .pipe( fs.createWriteStream( __dirname + '/dist/reactFlounder.js' ) );
} );


gulp.task( 'amd', function()
{
    browserify( './src/amdFlounder.jsx' )
        .transform( babelify, { stage : 0 } )
        .bundle()
        .pipe( fs.createWriteStream( __dirname + '/dist/amdFlounder.js' ) );
} );


gulp.task( 'jquery', function()
{
    browserify( './src/jqueryFlounder.jsx' )
        .transform( babelify, { stage : 0 } )
        .bundle()
        .pipe( fs.createWriteStream( __dirname + '/dist/jqueryFlounder.js' ) );
} );


gulp.task( 'microbe', function()
{
    browserify( './src/microbeFlounder.jsx' )
        .transform( babelify, { stage : 0 } )
        .bundle()
        .pipe( fs.createWriteStream( __dirname + '/dist/microbeFlounder.js' ) );
} );


gulp.task( 'default', [], function()
{
    gulp.start( [ 'vanilla', 'react', 'amd', 'jquery', 'microbe', 'demo' ] );
} );