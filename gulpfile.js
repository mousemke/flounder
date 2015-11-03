var gulp        = require('gulp');
var fs          = require('fs');
var browserify  = require('browserify');
var babelify    = require('babelify');


gulp.task( 'default', function()
{
    browserify( './src/flounder.jsx' )
        .transform( babelify, { stage : 0 } )
        .bundle()
        .pipe( fs.createWriteStream( __dirname + '/dist/flounder.js' ) );
} );