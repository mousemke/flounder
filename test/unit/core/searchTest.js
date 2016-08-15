
import Flounder     from '/core/flounder';
import { defaults } from '/core/search';

import assert       from 'assert';
import sinon        from 'sinon';



/**
 * search defaults
 *
 * @type {Object}
 */
describe( 'defaults', () =>
{
    it( 'should hve the correct defaults set', () =>
    {
        let {
            minimumValueLength,
            minimumScore,
            scoreProperties,
            startsWithProperties,
            weights
             } = defaults;

        assert.equal( minimumValueLength, 1 );
        assert.equal( minimumScore, 0 );
        assert.equal( startsWithProperties[ 0 ], `text` );
        assert.equal( startsWithProperties[ 1 ], `value` );

        assert.notEqual( scoreProperties.indexOf( `text` ), -1 );
        assert.notEqual( scoreProperties.indexOf( `textFlat` ), -1 );
        assert.notEqual( scoreProperties.indexOf( `textSplit` ), -1 );
        assert.notEqual( scoreProperties.indexOf( `value` ), -1 );
        assert.notEqual( scoreProperties.indexOf( `valueFlat` ), -1 );
        assert.notEqual( scoreProperties.indexOf( `valueSplit` ), -1 );
        assert.notEqual( scoreProperties.indexOf( `description` ), -1 );
        assert.notEqual( scoreProperties.indexOf( `descriptionSplit` ), -1 );


        assert.equal( weights.text, 30 );
        assert.equal( weights.textStartsWith, 50 );
        assert.equal( weights.textFlat, 10 );
        assert.equal( weights.textSplit, 10 );
        assert.equal( weights.value, 30 );
        assert.equal( weights.valueStartsWith, 50 );
        assert.equal( weights.valueFlat, 10 );
        assert.equal( weights.valueSplit, 10 );
        assert.equal( weights.description, 15 );
        assert.equal( weights.descriptionSplit, 30 );

    } );
} );


/**
 * ## Sole
 *
 * turns out there`s all kinds of flounders
 */
describe( 'Sole', () =>
{
    let data = [
        'doge',
        'moon',
        'moin',
        {
            text        : 'wow',
            value       : 'wow',
            description : 'such wow'
        }
    ];

    let flounder    = new Flounder( document.body, { data : data, search : true } );
    let search      = flounder.search;


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
        it( 'should be able to tell which number is higher', () =>
        {
            let a = { score : 20 };
            let b = { score : 200 };

            let res = search.compareScoreCards( a, b );
            assert.equal( res, -1 );

            b.score = 10;
            res     = search.compareScoreCards( a, b );
            assert.equal( res, 1 );

            b.score = 20;
            res     = search.compareScoreCards( a, b );
            assert.equal( res, 0 );

            res     = search.compareScoreCards( a );
            assert.equal( res, null );

            res     = search.compareScoreCards( a, null );
            assert.equal( res, null );
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
        it( 'should mount necessary functions', () =>
        {
            assert.equal( search.flounder instanceof Flounder, true );

            assert.equal( typeof search.getResultWeights, 'function' );
            assert.equal( search.getResultWeights.bound, true );

            assert.equal( typeof search.scoreThis, 'function' );
            assert.equal( search.scoreThis.bound, true );
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
        it( 'should properly escape a string', () =>
        {
            let str = search.escapeRegExp( 'http://www.moon+doge.dc/[someaddress]' );
            assert.equal( str, 'http:\\/\\/www\\.moon\\+doge\\.dc\\/\\[someaddress\\]' );
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
        it( 'run through the various weights and add them together', () =>
        {
            let data     =  {
                text        : 'wow',
                value       : 'wow',
                description : 'such wow',
                index       : 3
            };
            search.query = [ 'mo' ];

            assert.equal( search.getResultWeights( data, 0 ).score, -145 );


            data        =  {
                text        : 'wow',
                value       : 'wow',
                description : 'such wow',
                index       : 3
            };
            search.query = [ 'wow' ];

            assert.equal( search.getResultWeights( data, 0 ).score, 1450 );
        } );
    } );



    /**
     * ## removeItemUnderMinimum
     *
     * removes the items that have recieved a score lower than the set minimum
     *
     * @return _Boolean_ under the minimum or not
     */
    describe( 'isItemAboveMinimum', () =>
    {
        it( 'should return false if the number is under the minimum', () =>
        {
            let above   = search.isItemAboveMinimum( { score : 2 } );
            assert.equal( above, true );

            above       = search.isItemAboveMinimum( { score : -2 } );
            assert.equal( above, false );
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
        it( 'should return any and all matching results, or false', () =>
        {
            let res = search.isThereAnythingRelatedTo( 'doge' );

            assert.equal( res[0].i, 0 );
            assert.equal( res[0].d.text, 'doge' );

            res = search.isThereAnythingRelatedTo( 'mo' );
            assert.equal( res.length, 2 );
            assert.equal( res[0].d.text, 'moon' );
            assert.equal( res[1].d.value, 'moin' );

            res = search.isThereAnythingRelatedTo();
            assert.equal( res, false );
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
        it( 'should return the weight when a word starts with a specific query', () =>
        {
            let res = search.startsWith( 'moo', 'moon', 25 );
            assert.equal( res, 25 );

            res     = search.startsWith( '666', 'moon', 25 );
            assert.equal( res, 0 );
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
        it( 'should correctly calculate the score', () =>
        {
            assert.equal( search.scoreThis( 'mo', 10 ), 100 );
            assert.equal( search.scoreThis( 'moo', 10 ), 100 );
            assert.equal( search.scoreThis( 'd', 10, true ), 0 );
            assert.equal( search.scoreThis( 6, 10 ), 0 );
        } );
    } );
} );
