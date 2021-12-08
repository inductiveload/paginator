const Pagelist = require( './pagelist.js' );

function insertSorted( array, element, comparator ) {
	let i = 0;
	while ( i < array.length && comparator( array[ i ], element ) < 0 ) {
		++i;
	}
	array.splice( i, 0, element );
}

class SureRange {
	constructor( from, to ) {
		this.from = from;
		this.to = to;
	}

	length() {
		return this.to - this.from + 1;
	}

	extendToInclude( n ) {
		if ( n < this.from ) {
			this.from = n;
		} else if ( n > this.to ) {
			this.to = n;
		}
	}

	includes( n ) {
		return n >= this.from && n <= this.to;
	}
}

class SureSet {
	constructor() {
		this.ranges = [];
	}

	addRange( r ) {
		insertSorted( this.ranges, r, ( a, b ) => a.from - b.from );
	}

	/**
	 * @param {int} n
	 * @returns if any current range contains n
	 */
	includes( n ) {
		for ( const r of this.ranges ) {
			if ( r.includes( n ) ) {
				return true;
			}
		}
		return false;
	}

	nextUnincluded( n ) {
		for ( const r of this.ranges ) {
			// skip ranges behind the value
			if ( r.to < n ) {
				continue;
			}

			// N is not in this range
			if ( r.from > n ) {
				return n;
			}

			n = r.to + 1;
		}
		return n;
	}
}

/**
 * Represents an interval of uncertainty
 *
 * Such intervals can ve "trimmed" by nibbling away at the front or back,
 * or "split" by declaring something in the middle is known
 */
class UncertainInterval {
	constructor( from, to ) {
		this.from = from;
		this.to = to;
	}

	/**
	 * Split or trim this range, returning zero, one or two new ranges
	 * as an array
	 *
	 * @param {int} knownFrom
	 * @param {int} knownTo
	 * @return {array}
	 */
	split( knownFrom, knownTo ) {
		// doesn't affect this uncertainly
		if ( knownTo < this.from || knownFrom > this.to ) {
			return [ this ];
		}

		//  Complete removal
		if ( knownFrom <= this.from && knownTo >= this.to ) {
			return [];
		}

		// We're trimming on the left
		if ( knownTo < this.to && knownFrom <= this.from ) {
			return [ new UncertainInterval( knownTo + 1, this.to ) ];
		}

		// Trimming on the right
		if ( knownFrom > this.from && knownTo >= this.to ) {
			return [ new UncertainInterval( this.from, knownFrom - 1 ) ];
		}

		// Splitting in the middle
		return [
			new UncertainInterval( this.from, knownFrom - 1 ),
			new UncertainInterval( knownTo + 1, this.to )
		];
	}
}

class Paginator {

	constructor( numPages ) {

		if ( !numPages ) {
			throw new Error( 'Need at least one page' );
		}

		// Start with the whole range as unknown
		this.uncertainties = [
			new UncertainInterval( 1, numPages )
		];

		// Empty page list
		this.pagelist = new Pagelist.Pagelist();

		this.cursor = 1;
	}

	/**
	 * Figure out a question to ask that can reduce our uncertainty
	 */
	nextQuestion() {
		// no uncertainty left
		if ( this.uncertainties.length === 0 ) {
			return null;
		}

		// Choose the first uncertainty area, and see what we can do with it
		const uc = this.uncertainties[ 0 ];

		// now, find if the page list has a range that might extend into this
		// uncertainty range
		const lastRange = this.pagelist.getLastRangeBefore( uc.from );

		const proposals = [];
		let queriedPosition;

		if ( lastRange !== null ) {
			// there's a range before us, so see if we can join it up

			// TODO: we can propose consistent options here

			// If the
			if ( lastRange.longRangeConsistent() ) {
				queriedPosition = uc.to;
			} else {
				queriedPosition = uc.from;
			}
		} else {
			// no useful range before us, so all we can do is try to start a new range here

			// TODO: it is possible to provide some useful guesses as to possible answers
			proposals.push( '–', 'Img' );
			proposals.push( 'Title' );
			proposals.push( 'Cover' );

			// we can only really ask about the first uncertain page
			queriedPosition = uc.from;
		}

		return {
			position: queriedPosition,
			proposals: proposals
		};
	}

	/**
	 * Update the uncertainties for an added range
	 * @param {PageRange} newRange
	 */
	handleNewPageRange( newRange ) {
		const newUncertainties = [];

		// this is crude, but it'll do: for every uncertainty, split if needed
		// and the new uncertainities become _the_ uncertainties
		for ( const uc of this.uncertainties ) {
			newUncertainties.push( ...uc.split( newRange.from, newRange.to ) );
		}

		this.uncertainties = newUncertainties;
	}

	isComplete() {
		return this.uncertainties.length === 0;
	}

	printUncertainties() {
		for ( const uc of this.uncertainties ) {
			console.log( `UC: ${uc.from} -> ${uc.to}` );
		}
	}

	/**
	 * Receive an answer for a given page position and try to slot it in
	 */
	addAnswer( position, value ) {
		if ( this.pagelist.ranges.length === 0 ) {
			// no page ranges, so create one

			const newRange = Pagelist.createPageRange( position, position, value );
			this.pagelist.addRange( newRange );

			// console.log( `1 Added range @${position} = ${value}` );
			this.handleNewPageRange( newRange );
		} else {
			// we have some page ranges in the list already - see if the answer fits with
			// any of them
			const consistentRange = this.pagelist.findFirstConsistentRangeFor( position, value );

			if ( consistentRange ) {
				// Integrate the answer into the range
				consistentRange.integrate( position, value );

				// console.log( `2 Updated range @${position} = ${value}` );
				this.handleNewPageRange( consistentRange );
			} else {
				// Start a new range at this point
				const newRange = Pagelist.createPageRange( position, position, value );
				this.pagelist.addRange( newRange );

				// console.log( `3 Added range @${position} = ${value}` );
				this.handleNewPageRange( newRange );
			}
		}
		// this.printUncertainties();
	}
}

module.exports = {
	Paginator: Paginator,
	SureSet: SureSet,
	SureRange: SureRange,
	UncertainInterval: UncertainInterval
};
