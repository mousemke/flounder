
import Flounder     from '/core/flounder';
import search       from '/core/search';

import assert       from 'assert';
import sinon        from 'sinon';



/**
 * search defaults
 *
 * @type {Object}
 */
describe( 'defaults', () =>
{
    it( 'should', () =>
    {

    } );
} );


describe( 'Sole', () =>
{

    /**
     * ## compareScoreCards
     *
     * Sorts out results by the score
     *
     * @param {Object} a result
     * @param {Object} b result to compare with
     *
     * @return _Number_ comparison result
     */
    describe( 'compareScoreCards', () =>
    {
        it( 'should', () =>
        {

        } );
    } );



    /**
     * ## constructor
     *
     * initial setup of Sole object
     *
     * @param {Object} options option object
     *
     * @return _Object_ this
     */
    describe( 'constructor', () =>
    {
        it( 'should', () =>
        {

        } );
    } );



    /**
     * ## escapeRegExp
     *
     * escapes a string to be compatible with regex
     *
     * @param {String} string string to be escaped
     *
     * return _String_ escaped string
     */
    describe( 'escapeRegExp', () =>
    {
        it( 'should', () =>
        {

        } );
    } );



    /**
     * ## getResultWeights
     *
     * after the data is prepared this is mapped through the data to get weighted results
     *
     * @param  {Object} data object
     * @param  {Number} i index
     *
     * @return _Object_ res weighted results
     */
    describe( 'getResultWeights', () =>
    {
        it( 'should', () =>
        {

        } );
    } );



    /**
     * ## isThereAnythingRelatedTo
     *
     * Check our search content for related query words,
     * here it applies the various weightings to the portions of the search
     * content.  Triggers show results
     *
     * @param {Array} query  array of words to search the content for
     *
     * @return _Array_ results returns array of relevant search results
     */
    describe( 'isThereAnythingRelatedTo', () =>
    {
        it( 'should', () =>
        {

        } );
    } );



    /**
     * ## startsWith
     *
     * checks the beginning of the given text to see if the query matches exactly
     *
     * @param {String} query string to search for
     * @param {String} value string to search in
     * @param {Integer} weight amount of points to give an exact match
     *
     * @return _Integer_ points to award
     */
    describe( 'startsWith', () =>
    {
        it( 'should', () =>
        {

        } );
    } );



    /**
     * ## removeItemsUnderMinimum
     *
     * removes the items that have recieved a score lower than the set minimum
     *
     * @return _Boolean_ under the minimum or not
     */
    describe( 'removeItemsUnderMinimum', () =>
    {
        it( 'should', () =>
        {

        } );
    } );



    /**
     * ## scoreThis
     *
     * Queries a string or array for a set of search options and assigns a
     * weighted score.
     *
     * @param {String} target string to be search
     * @param {Integer} weight weighting of importance for this target.
     *                   higher is more important
     * @param {Boolean} noPunishment when passed true, this does not give
     *                               negative points for non-matches
     *
     * @return _Integer_ the final weight adjusted score
     */
    describe( 'scoreThis', () =>
    {
        it( 'should', () =>
        {

        } );
    } );
} );