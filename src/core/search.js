/* global µ, window */
/*jshint globalstrict: true*/
'use strict';

/**
 * ROVer - fuzzy search
 */
let defaults = {
    /*
     * minimum input value to search with
     *
     * _Number_
     */
    minimumValueLength  : 1,

    /*
     * minimum score to display
     *
     * _Number_
     */
    minimumScore        : 0,

    /*
     * scoring weight
     */
    weights             : {
        text                : 30, // score for matches in the text
        textFlatCase        : 15, // score for matches in the text with flattened case
        textSplit           : 10, // score for each instance of an exact word (including spaces)

        value               : 30,
        valueFlat           : 15,
        valueSplit          : 10,

        description         : 5,
        descriptionSplit    : 10
    }
};



export class Sole
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
    compareScoreCards( a, b )
    {
        a = a.score;
        b = b.score;

        if ( a && b )
        {
            if ( a > b )
            {
                return 1;
            }
            else if ( a < b )
            {
                return -1;
            }

            return 0;
        }
    }


    /**
     * ## constructor
     *
     * initial setup of ROVer object
     *
     * @param {Object} options option object
     *
     * @return _Object_ this
     */
    constructor( flounder )
    {
        this.flounder = flounder;
        this.defaults = defaults;

        return this;
    }


    /**
     * ## escapeRegExp
     *
     * escapes a string to be compatible with regex
     *
     * @param {String} string string to be escaped
     *
     * return _String_ escaped string
     */
    escapeRegExp( string )
    {
        return string.replace( /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&' );
    }


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
    isThereAnythingRelatedTo( query )
    {
        this.query          = query.toLowerCase().split( ' ' );

        let scoreThis       = this.scoreThis;

        let ratedResults    = this.ratedResults = this.flounder.data.map( function( d, i )
        {
            let score   = 0 ;
            let res     = { i : i, d : d };
            let search  = d.search  = d.search || {};
            let weights = defaults.weights;

            search.text             = d.text;
            search.textFlat         = d.text.toLowerCase();
            search.textSplit        = search.textFlat.split( ' ' );

            search.value            = d.value;
            search.valueFlat        = d.value.toLowerCase();
            search.valueSplit       = search.valueFlat.split( ' ' );

            search.description      = d.description ? d.description.toLowerCase() : null;
            search.descriptionSplit = d.description ? search.description.split( ' ' ) : null;

            score += scoreThis( search.text,        weights.text );
            score += scoreThis( search.textFlat,    weights.textFlatCase );
            score += scoreThis( search.textSplit,   weights.textSplit );

            score += scoreThis( search.value, weights.value );
            score += scoreThis( search.valueFlat, weights.valueFlat );
            score += scoreThis( search.valueSplit, weights.valueSplit );

            score += scoreThis( search.description,  weights.description );
            score += scoreThis( search.descriptionSplit, weights.descriptionSplit );

            res.score = score;

            return res;
        } );

        ratedResults.sort( this.compareScoreCards );
        ratedResults = ratedResults.filter( this.removeItemsUnderMinimum );

        return ( this.ratedResults = ratedResults );
    }


    /**
     * ## removeItemsUnderMinimum
     *
     * removes the items that have recieved a score lower than the set minimum
     *
     * @return _Boolean_ under the minimum or not
     */
    removeItemsUnderMinimum( d )
    {
        return d.score >= defaults.minimumScore ? true : false;
    }


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
    scoreThis = ( target, weight, noPunishment ) =>
    {
        let score = 0;

        if ( target )
        {
            this.query.forEach( queryWord =>
            {
                queryWord = this.escapeRegExp( queryWord );
                let count = 0;

                if ( typeof target === 'string' )
                {
                    queryWord   = new RegExp( queryWord, 'g' );
                    count       = ( target.match( queryWord ) || [] ).length;
                }
                else if ( target[ 0 ] ) // array.  what if the words obj has the word length?
                {
                    target.forEach( word =>
                    {
                        count = word.indexOf( queryWord ) !== -1 ? 1 : 0;
                    } );
                }
                else
                {
                    count       = target[ queryWord ] || 0.000001;
                }

                if ( count && count > 0 )
                {
                    score += weight * count * 10;
                }
                else if ( noPunishment !== true )
                {
                    score = -weight;
                }
            } );
        }

        return Math.floor( score );
    }
}

export default Sole;
