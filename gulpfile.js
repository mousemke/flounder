var gulp        = require('gulp');
var fs          = require('fs');
var browserify  = require('browserify');
var babelify    = require('babelify');


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


gulp.task( 'default', [], function()
{
    gulp.start( [ 'vanilla', 'react' ] );
} );