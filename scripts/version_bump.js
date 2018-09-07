/*
 * Copyright (c) 2016 dunnhumby Germany GmbH.
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found in the LICENSE file
 * in the root directory of this source tree.
 *
 */

/* globals process, console, require */
/**
 * ## version_bump.js
 *
 * Node script that bumps the version in the appropriate spots
 *
 * @author  Mouse Braun         <mouse@knoblau.ch>
 * @author  Nicolas Brugneaux   <nicolas.brugneaux@gmail.com>
 *
 * @package LayoutEngine
 */
const fs              = require( 'fs' );

/**
 * ## getResource
 *
 * reads and returns a url after decoding it
 *
 * @param {String} url target
 *
 * @return {String} decoded data
 */
function getResource( url )
{
    const d = fs.readFileSync( url );

    return d.toString( 'utf8', 0, d.length );
}


/**
 * ## setResource
 *
 * overwrites a resource
 *
 * @param {String} url target
 * @param {Array} data array of data objects
 *
 * @return {String} decoded data
 */
function setResource( url, data )
{
    fs.writeFile( url, data, err =>
    {
        if ( err )
        {
            console.error( err );
        }
    } );
}


/**
 * ## updateLine
 *
 * updates a specific line with the given replacement
 *
 * @param {String} url url to find the resource
 * @param {Number} ln line number
 * @param {String} replacement replacement text
 *
 * @return {Void} void
 */
function updateLine( url, ln, replacement )
{
    let data        = getResource( url );
    const dataSplit = data.split( '\n' );
    dataSplit[ ln ] = replacement;
    data            = dataSplit.join( '\n' );

    setResource( url, data );

    console.warn( `${url} successfully changed` );
}


/**
 * ## updateVersion
 *
 * grabs the version file, parses, and updates the minor version
 *
 * @return {String} updated version string
 */
function updateVersion()
{
    const version         = getResource( versionUrl );
    const versionSplit    = version.split( '.' );
    versionSplit.shift();
    versionSplit[ 0 ]     = parseInt( versionSplit[ 0 ].split( '\'' )[ 1 ] );

    const newVersion      = parseInt( versionSplit[ 2 ] ) + 1;
    versionSplit[ 2 ]   = newVersion;

    return versionSplit.join( '.' );
}


const readmeUrl       = './README.md';
const packageUrl      = './package.json';
const versionUrl      = './src/core/version.js';
const bowerUrl        = './bower.json';

const newVersion      = process.argv[ 2 ] || updateVersion( versionUrl );

updateLine( versionUrl, 2, `module.exports = \'${newVersion}\';` );
updateLine( readmeUrl, 0, `Flounder.js ${newVersion}` );
updateLine( packageUrl, 2, `  "version": "${newVersion}",` );
updateLine( bowerUrl, 2, `    "version": "${newVersion}",` );
