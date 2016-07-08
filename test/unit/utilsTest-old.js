/* global document, QUnit  */

let tests = function( Flounder, utils )
{
    QUnit.module( 'utils.js' );



    /*
     * ## http tests
     *
     * @test exists
     */
    QUnit.test( 'http', function( assert )
    {
        assert.ok( utils.http, 'exists' );

        var getTest      = assert.async();
        utils.http( { url: './httpTest.html', method: 'GET' } ).then( function( data )
        {
            assert.equal( data, 'moon', 'page correctly retrieved' );
            getTest();
        } );

        var parameterTest      = assert.async();
        utils.http( {
                    url         : './httpTest.html',
                    method      : 'GET',
                    headers     : {
                        Accept      : 'text/plain'
                    },
                    async       : true
                }
        ).then( function( data )
        {
            assert.equal( data, 'moon', 'parameters are recieved correctly' );
            parameterTest();
        } );

        var errorTest      = assert.async();
        utils.http( { url : './httpTest.hml' }
        ).catch( function( e )
        {
            e = ( e instanceof Error );
            assert.equal( e, true, 'errors are handled correctly' );
            errorTest();
        } );
    } );





export default tests;
