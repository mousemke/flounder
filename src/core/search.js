let defaults = {
    /*
     * minimum value length to search
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
     * params to test for score
     *
     * called as:
     * score += this.scoreThis( search[ param ], weights[ param ] );
     */
    scoreProperties     : [ 'text', 'textFlat', 'textSplit', 'value', 'valueFlat',
                                    'valueSplit', 'description', 'descriptionSplit' ],

    /*
     * params to test with startsWith
     *
     * called as:
     * score += startsWith( query, search[ param ], weights[ param + 'StartsWith' ] );
     */
    startsWithProperties : [ 'text', 'value' ],

    /*
     * scoring weight
     */
    weights             : {
        text                : 30,
        textStartsWith      : 50,
        textFlat            : 10,
        textSplit           : 10,

        value               : 30,
        valueStartsWith     : 50,
        valueFlat           : 10,
        valueSplit          : 10,

        description         : 15,
        descriptionSplit    : 30
    }
};


/**
 * ## Sole
 *
 * turns out there's all kinds of flounders
 */
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
     * initial setup of Sole object
     *
     * @param {Object} options option object
     *
     * @return _Object_ this
     */
    constructor( flounder )
    {
        this.flounder = flounder;
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
        let ratedResults;

        if ( query.length >= defaults.minimumValueLength )
        {
            this.query          = query.toLowerCase().split( ' ' );

            let scoreThis       = this.scoreThis;
            let startsWith      = this.startsWith;
            let data            = this.flounder.data;
                data            = this.flounder.sortData( data );

            ratedResults    = this.ratedResults = data.map( function( d, i )
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

                defaults.scoreProperties.forEach( function( param )
                {
                    score += scoreThis( search[ param ], weights[ param ] );
                } );

                defaults.startsWithProperties.forEach( function( param )
                {
                    score += startsWith( query, search[ param ], weights[ param + 'StartsWith' ] );
                } );

                res.score = score;

                return res;
            } );
        }
        else
        {
            return false;
        }

        ratedResults.sort( this.compareScoreCards );
        ratedResults = ratedResults.filter( this.removeItemsUnderMinimum );

        return ( this.ratedResults = ratedResults );
    }


    /**
     * ## startsWith
     *
     * checks the beginning of the given text to see if the query matches exactly
     *
     * @param {String} query string to search for
     * @param {String} value string to search in
     * @param {Integer} weight amount of points to give an exact match
     *
     * @return {Integer} points to award
     */
    startsWith( query, value, weight )
    {
        let valLength   = value.length;
        let queryLength = query.length;

        if ( queryLength <= valLength )
        {
            let valStr = value.toLowerCase().slice( 0, valLength );

            if ( valStr === query )
            {
                return weight;
            }
        }

        return 0;
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
