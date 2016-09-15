/**
 * search defaults
 *
 * @type {Object}
 */
export const defaults = {
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
     * score += this.scoreThis( search[ param ], weights[ param ] );
     */
    scoreProperties     : [ 'text', 'textFlat', 'textSplit', 'value',
                                    'valueFlat', 'valueSplit', 'description',
                                    'descriptionSplit' ],

    /*
     * params to test with startsWith
     *
     * called as:
     * startsWith( query, search[ param ], weights[ param + 'StartsWith' ] );
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
 * turns out there`s all kinds of flounders
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
     * @return {Number} comparison result
     */
    compareScoreCards( a, b )
    {
        if ( a && a.score && b && b.score )
        {
            a = a.score;
            b = b.score;

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

        return null;
    }


    /**
     * ## constructor
     *
     * initial setup of Sole object
     *
     * @param {Object} flounder option object
     *
     * @return {Object} this
     */
    constructor( flounder )
    {
        this.flounder               = flounder;

        this.getResultWeights       = this.getResultWeights.bind( this );
        this.getResultWeights.bound = true;

        this.scoreThis              = this.scoreThis.bind( this );
        this.scoreThis.bound        = true;

        return this;
    }


    /**
     * ## escapeRegExp
     *
     * escapes a string to be compatible with regex
     *
     * @param {String} string string to be escaped
     *
     * @return {String} escaped string
     */
    escapeRegExp( string )
    {
        return string.replace( /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&' );
    }


    /**
     * ## getResultWeights
     *
     * after the data is prepared this is mapped through the data to get
     * weighted results
     *
     * @param  {Object} d object
     * @param  {Number} i index
     *
     * @return {Object} res weighted results
     */
    getResultWeights( d, i )
    {
        let score   = 0;
        const res     = {
            i : i,
            d : d
        };

        const search  = d.search  = d.search || {};
        const weights = defaults.weights;
        const dText   = `${d.text}`;
        const dValue  = `${d.value}`;

        search.text             = dText;
        search.textFlat         = dText.toLowerCase();
        search.textSplit        = search.textFlat.split( ' ' );

        search.value            = dValue;
        search.valueFlat        = dValue.toLowerCase();
        search.valueSplit       = search.valueFlat.split( ' ' );

        search.description      = d.description ?
                                            d.description.toLowerCase() : null;
        search.descriptionSplit = d.description ?
                                        search.description.split( ' ' ) : null;


        defaults.scoreProperties.forEach( param =>
        {
            score += this.scoreThis( search[ param ], weights[ param ] );
        } );

        defaults.startsWithProperties.forEach( param =>
        {
            score += this.startsWith( this.query, search[ param ],
                                            weights[ `${param}StartsWith` ] );
        } );

        res.score = score;

        return res;
    }


    /**
     * ## isItemAboveMinimum
     *
     * removes the items that have recieved a score lower than the set minimum
     *
     * @param {Object} d score object
     *
     * @return {Boolean} the minimum or not
     */
    isItemAboveMinimum( d )
    {
        return d.score >= defaults.minimumScore;
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
     * @return {Array} results returns array of relevant search results
     */
    isThereAnythingRelatedTo( query = '' )
    {
        let ratedRes;

        query = query.length ? query : `${query}`;

        if ( query.length >= defaults.minimumValueLength )
        {
            this.query  = query.toLowerCase().split( ' ' );

            let data    = this.flounder.data;
            data        = this.flounder.sortData( data );

            ratedRes    = this.ratedRes = data.map( this.getResultWeights );
        }
        else
        {
            return false;
        }

        ratedRes.sort( this.compareScoreCards );
        ratedRes = ratedRes.filter( this.isItemAboveMinimum );

        return this.ratedRes = ratedRes;
    }


    /**
     * ## startsWith
     *
     * checks the beginning of the given text to see if the query matches
     * exactly
     *
     * @param {String} query string to search for
     * @param {String} value string to search in
     * @param {Integer} weight amount of points to give an exact match
     *
     * @return {Integer} points to award
     */
    startsWith( query, value, weight )
    {
        const valLength   = value.length;
        const queryLength = query.length;

        if ( queryLength <= valLength )
        {
            const valStr = value.toLowerCase().slice( 0, queryLength );

            if ( valStr === query )
            {
                return weight;
            }
        }

        return 0;
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
     * @return {Integer} the final weight adjusted score
     */
    scoreThis( target, weight, noPunishment )
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
                else if ( target[ 0 ] )
                {
                    target.forEach( word =>
                    {
                        count = word.indexOf( queryWord ) !== -1 ? 1 : 0;
                    } );
                }
                else
                {
                    count = target[ queryWord ] || 0.000001;
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
