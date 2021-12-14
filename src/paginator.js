const Pagelist = require( './pagelist.js' );
const roman = require( './roman.js' );

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
		this.numPages = numPages;

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

		let proposals = [];
		let queriedPosition;

		// List of further positions that might be wanted
		// for example (but not neccesarily) if the user chooses one of the propoals
		let suggestedPositions = [];

		const nextRange = this.pagelist.getNextRangeAfter( uc.to );
		const lastRange = this.pagelist.getLastRangeBefore( uc.from );

		if ( lastRange !== null && nextRange !== null ) {
			// We are between two ranges. They must be inconsistent, or they'd already
			// be merged.
			// If both ranges are "long-range consistent", we will
			// try to meet in the middle, which should result in a binary search for the join
			if ( lastRange.longRangeConsistent() && nextRange.longRangeConsistent() ) {

				// First - try to extend the right-side (next) range left if it looks like a
				// much lower range than expected, indicating that it might be a completely
				// different pagination. Wwe might expect a small difference due to plates, etc,
				// but not a vastly smaller page number than expect

				// Also, a change in format implies a numbering re-start somewhere

				const lastRangeExtendedTo = lastRange.startValue +
					( nextRange.from - lastRange.to );
				const nextRangeExtendedDown = nextRange.from - ( nextRange.startValue - 1 );
				// the factor of two here is heuristic, it is not a specific value
				const nextRangeLooksRestarted =
					nextRange.startValue < ( lastRangeExtendedTo / 2 ) ||
					( lastRange.format !== nextRange.format );

				if ( nextRangeLooksRestarted &&
					nextRangeExtendedDown > lastRange.to &&
					nextRangeExtendedDown < nextRange.from ) {
					// if:
					//  - "next" looks like it could be a completely different restarted range and
					//  - the start of that range would be somewhere in the gap:
					// then query the start since there's probably a dicontinuity near there
					queriedPosition = nextRangeExtendedDown;
				} else if ( nextRangeLooksRestarted && nextRange.startValue === 1 ) {
					// if:
					//  - "next" looks like it could be a completely different restarted range and
					//  - it starts at 1
					// then: work back from just before it to pin down the end of the previous range
					queriedPosition = nextRange.from - 1;
				} else {
					// probably just some discontinuities in a single range
					// just bisect the gap to close in on the discontinuities
					queriedPosition = Math.round( ( lastRange.to + nextRange.from ) / 2 );
				}
			}
		}

		// Then, see if there's a range AFTER us that we can provide a start for
		// (for example, we have a confirmed page 10 @ pos 20, we will
		// check pos 11 to see if it starts at 1)

		if ( queriedPosition === undefined && nextRange !== null ) {
			const cand = nextRange.getFirstPossiblePriorConsistentPos();
			if ( cand ) {
				// extend the next range only as far as won't collide with an existing range
				let minPos = 1;
				if ( lastRange !== null ) {
					minPos = lastRange.to + 1;
				}
				queriedPosition = Math.max( minPos, cand );
			}
		}

		if ( queriedPosition === undefined && lastRange !== null ) {
			// there's a range before us, so see if we can join it up

			// If the range is long-range consistent, go as far as we can
			if ( lastRange.longRangeConsistent() ) {
				queriedPosition = uc.to;
			} else {
				// otherwise, just nibble at it the front
				queriedPosition = uc.from;
			}
		}

		if ( queriedPosition === undefined ) {
			// no useful range before us, so all we can do is try to start a new range here
			// we can only really ask about the first uncertain page
			queriedPosition = uc.from;

			// We have no idea about plausible numbering, so nothing to do here
		}

		// The proposals could be consistent with either end of the range
		// (or maybe neither)
		const lastVal = lastRange && lastRange.formatPosition( queriedPosition );
		const nextVal = nextRange && nextRange.formatPosition( queriedPosition );

		if ( lastVal ) {
			proposals.push( lastVal );
		}

		if ( nextVal ) {
			proposals.push( nextVal );
		}

		if ( nextVal && lastVal ) {
			// It's common that we're spearated from the actual range by one or more
			// image-blank pairs.
			// Because we're doing a binary search or something like it, there's
			// usually the same number of plates on each side, so suggest an average
			if ( Number.isInteger( lastVal ) && Number.isInteger( nextVal ) &&
				( lastVal - nextVal ) > 2 ) {

				if ( ( lastVal - nextVal ) % 4 === 0 ) {
					proposals.push( ( lastVal + nextVal ) / 2 );
				} else if ( ( lastVal - nextVal ) % 2 === 0 ) {
					proposals.push( ( lastVal + nextVal - 2 ) / 2 );
					proposals.push( ( lastVal + nextVal + 2 ) / 2 );
				}
			} else {
				// one side is not a number, so possibly we're right on an image-blank pair edge
				if ( lastVal && Number.isInteger( lastVal ) ) {
					proposals.push( lastVal - 2 );
				}

				if ( nextVal && Number.isInteger( nextVal ) ) {
					proposals.push( nextVal + 2 );
				}
			}
		}

		// These proposals are usually plausible
		proposals.push( '–', '?', 'Img', 'Adv', 'ToC', 'Title', 'Cover' );

		// Filter out dupes
		proposals = [ ...new Set( proposals ) ];
		proposals.sort( this.pageNumberSorter.bind( this ) );

		if ( queriedPosition > 1 ) {
			suggestedPositions.push( queriedPosition - 1 );
		}
		if ( queriedPosition < this.numPages ) {
			suggestedPositions.push( queriedPosition + 1 );
		}

		suggestedPositions = [ ...new Set( suggestedPositions ) ];

		return {
			position: queriedPosition,
			proposals,
			suggestedPositions
		};
	}

	pageNumberTypeCode( a ) {
		if ( [ '–', '?' ].indexOf( a ) !== -1 ) {
			return 0;
		}
		if ( /^[0-9]+$/.test( a ) ) {
			return 1;
		}
		if ( /^[ivxlcdm]+$/.test( a ) ) {
			return 2;
		}
		if ( /^[IVXLCDM]+$/.test( a ) ) {
			return 3;
		}
		return 4;
	}

	pageNumberSorter( a, b ) {

		const aCode = this.pageNumberTypeCode( a );
		const bCode = this.pageNumberTypeCode( b );

		if ( aCode !== bCode ) {
			return aCode - bCode;
		}

		if ( aCode === 1 ) {
			return a - b;
		}

		if ( aCode === 2 || aCode === 3 ) {
			return roman.romanToInt( a ) - roman.romanToInt( b );
		}

		return ( String( a ) ).localeCompare( b );
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

		// Pre-process the text
		if ( value === '-' ) {
			value = '–';
		}

		if ( this.pagelist.ranges.length === 0 ) {
			// no page ranges, so create one

			const newRange = Pagelist.createPageRange( position, position, value );
			this.pagelist.addRange( newRange );

			// console.log( `1 Added range @${position} = ${value}` );
			this.handleNewPageRange( newRange );
		} else {
			// we have some page ranges in the list already - see if the answer fits with
			// any of them
			console.log( `Finding consistency for @${position} = ${value}` );
			// const consistentRange = this.pagelist.findFirstConsistentRangeFor( position, value );

			const consistentRange = this.pagelist.findConsistentRangeFor( position, value );

			if ( consistentRange ) {
				// Integrate the answer into the range
				console.log( `2 Consistent range: @${consistentRange.from} = ${consistentRange.to}` );
				consistentRange.integrate( position, value );
				this.handleNewPageRange( consistentRange );
			} else {
				// Start a new range at this point
				const newRange = Pagelist.createPageRange( position, position, value );
				this.pagelist.addRange( newRange );

				console.log( `3: Inconsistency: added range @${position} = ${value}` );
				this.handleNewPageRange( newRange );
			}
		}

		this.printUncertainties();
		for ( const pr of this.pagelist.ranges ) {
			console.log( pr );
		}

		this.pagelist.mergeRanges();
	}
}

module.exports = {
	Paginator: Paginator,
	UncertainInterval: UncertainInterval
};
