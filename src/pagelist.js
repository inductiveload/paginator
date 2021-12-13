const Roman = require( './roman.js' );

class PageRange {
	constructor( from, to ) {
		this.from = from;
		this.to = to;
	}

	/**
	 * See if a proposed new position could be consistent with this range
	 */
	isConsistent() {
		return false;
	}

	length() {
		return this.to - this.from + 1;
	}

	/**
	 * Can this range provide a long range consistency check (e.g. a numeric
	 * range can check offset + value)
	 */
	longRangeConsistent() {
		return false;
	}

	canBeMergedOver() {
		return false;
	}

	getAttrStrings() {
		throw new Error( 'Not implemented' );
	}
}

class NumericRange extends PageRange {
	constructor( from, to, startValue, format ) {
		super( from, to );

		this.format = format || 'arabic';
		this.startValue = this.getNumericValue( startValue );
	}

	getNumericValue( value ) {
		if ( Number.isInteger( value ) ) {
			return value;
		}

		if ( this.format === 'arabic' && /^[0-9]+$/.test( value ) ) {
			return parseInt( value );
		}

		if ( this.format === 'roman' || this.format === 'highroman' ) {
			const romanValue = Roman.romanToInt( value );
			if ( romanValue ) {
				return romanValue;
			}
		}

		return null;
	}

	/**
	 * @param {int} position
	 * @param {string} value
	 * @returns if the given value at the given position would fit into this range
	 */
	isConsistent( position, value ) {
		const numericValue = this.getNumericValue( value );

		// not a number we can handle
		if ( numericValue === null ) {
			return false;
		}

		const offset = position - this.from;
		const newValue = this.startValue + offset;

		// too far in front of the range
		if ( newValue <= 0 ) {
			return false;
		}

		return newValue === numericValue;
	}

	longRangeConsistent() {
		return true;
	}

	getFirstPossiblePriorConsistentPos() {
		if ( this.startValue > 1 ) {
			console.log( this );
			// this is the position that 1 should be in
			return Math.max( 1, this.from - ( this.startValue - 1 ) );
		}
		// already starts at 1
		return null;
	}

	getAttrStrings() {
		const strs = [ `${this.from}=${this.startValue}` ];
		if ( this.format !== 'arabic' ) {
			const format = this.format;
			strs.push( `${this.from}to${this.to}="${format}"` );
		}
		return strs;
	}

	formatPosition( position ) {
		const positionWithOffset = this.startValue + ( position - this.from );

		if ( positionWithOffset <= 0 ) {
			return null;
		}

		if ( this.format === 'arabic' ) {
			return positionWithOffset;
		}

		if ( this.format === 'roman' ) {
			return Roman.intToRoman( positionWithOffset ).toLowerCase();
		}

		if ( this.format === 'highroman' ) {
			return Roman.intToRoman( positionWithOffset ).toUpperCase();
		}

		throw new Error( `Unkwown format: ${this.format} (to format ${positionWithOffset})` );
	}

	/**
	 * Integrate a new position/value into the range.
	 * Should be consistent (so the value doesn't matter, because
	 * it should already implied by the range)
	 *
	 * @param {int} position
	 */
	integrate( position ) {
		const offset = position - this.from;

		if ( position < this.from ) {
			// move the start and re-root the number
			this.from = position;
			this.startValue += offset;
		} else {
			// just moving the end point
			this.to = position;
		}
	}
}

class LiteralRange extends PageRange {
	constructor( from, to, value ) {
		super( from, to );
		this.value = value;
	}

	/**
	 * @param {int} position
	 * @param {string} value
	 * @returns if the given value at the given position would fit into this range
	 */
	isConsistent( position, value ) {
		// Must be the same literal value
		if ( value !== this.value ) {
			return false;
		}
		return ( position >= this.from - 1 ) && ( position <= this.to + 1 );
	}

	getFirstPossiblePriorConsistentPos() {
		if ( this.from > 1 ) {
			// best we can do is suggest the previous page
			return this.from - 1;
		}
		return null;
	}

	getAttrStrings() {

		if ( this.from === this.to ) {
			return [ `${this.from}="${this.value}"` ];
		}
		return [ `${this.from}to${this.to}="${this.value}"` ];
	}

	formatPosition() {
		return this.value;
	}

	canBeMergedOver() {
		return this.value === '?';
	}

	/**
	 * Integrate a new position/value into the range.
	 *
	 * @param {int} position
	 */
	integrate( position ) {
		if ( position < this.from ) {
			this.from = position;
		} else {
			this.to = position;
		}
	}
}

function createPageRange( from, to, value ) {

	if ( /^[1-9][0-9]*$/.test( value ) ) {
		// easy: it's a normal int
		const num = parseInt( value );
		console.log( num );
		return new NumericRange( from, to, num );
	}

	if ( /^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/i.test( value ) ) {
		const lower = value.toLowerCase() === value;
		const upper = value.toUpperCase() === value;
		const num = Roman.romanToInt( value );

		if ( lower ) {
			return new NumericRange( from, to, num, 'roman' );
		}

		if ( upper ) {
			return new NumericRange( from, to, num, 'highroman' );
		}
		// mixed case? treat as literal then
	}

	// No idea: must be literal
	return new LiteralRange( from, to, value );
}

function insertSorted( array, element, comparator ) {
	let i = 0;
	while ( i < array.length && comparator( array[ i ], element ) < 0 ) {
		++i;
	}
	array.splice( i, 0, element );
}

class Pagelist {
	constructor() {
		this.ranges = [];
	}

	addRange( range ) {
		insertSorted( this.ranges, range, ( a, b ) => a.from - b.from );
	}

	/**
	 * Get the last range that _Starts_ before the given point (even it ends after)
	 * @param {int} point
	 * @returns {PageRange|null}
	 */
	getLastRangeBefore( point ) {
		if ( this.ranges.length === 0 ) {
			return null;
		}

		let last = this.ranges[ 0 ];

		// There is no range before the given point
		if ( last.from >= point ) {
			return null;
		}

		for ( const r of this.ranges ) {
			if ( r.from >= point ) {
				break;
			}
			last = r;
		}

		return last;
	}

	/**
	 * Get the next range that _Starts_ after the given point
	 * @param {int} point
	 * @returns {PageRange|null}
	 */
	getNextRangeAfter( point ) {
		if ( this.ranges.length === 0 ) {
			return null;
		}

		let next = null;

		for ( let i = this.ranges.length - 1; i >= 0; --i ) {
			const pr = this.ranges[ i ];
			if ( pr.from <= point ) {
				break;
			}
			next = pr;
		}

		return next;
	}

	findFirstConsistentRangeFor( position, value ) {
		for ( const pr of this.ranges ) {
			if ( pr.isConsistent( position, value ) ) {
				return pr;
			}
		}
		return null;
	}

	findConsistentRangeFor( position, value ) {

		let lastRange = this.getLastRangeBefore( position );
		let nextRange = this.getNextRangeAfter( position );

		if ( lastRange ) {
			lastRange = lastRange.isConsistent( position, value ) ? lastRange : null;
		}
		if ( nextRange ) {
			nextRange = nextRange.isConsistent( position, value ) ? nextRange : null;
		}

		if ( lastRange && !nextRange ) {
			return lastRange;
		}
		if ( nextRange && !lastRange ) {
			return nextRange;
		}

		if ( nextRange && lastRange ) {
			// they're both consistent, which is is weird sicne how did we get inside
			// an existing consistent range
			// anyway,just choose the furthest one, as that will close down more uncertainty
			const distanceToRight = nextRange.from - position;
			const distanceToLeft = position - lastRange.to;

			return ( distanceToLeft > distanceToRight ) ? lastRange : nextRange;
		}
		return null;
	}

	mergeRanges() {
		// Merge ranges _left_
		for ( let i = this.ranges.length - 1; i > 0; --i ) {
			const thisRange = this.ranges[ i - 1 ];
			const nextRange = this.ranges[ i ];

			// meregable abutting ranges
			if (
				thisRange.to + 1 === nextRange.from &&
				thisRange.canBeMergedOver() &&
				nextRange.longRangeConsistent() ) {
				const mergeLength = Math.min( nextRange.startValue - 1, thisRange.length() );

				nextRange.startValue -= mergeLength;
				nextRange.from -= mergeLength;
				thisRange.to -= mergeLength;

				if ( thisRange.to <= thisRange.from ) {
					this.ranges.splice( i - 1, 1 );
				}
			}
		}
	}

	toTag() {
		let s = '<pagelist\n';

		for ( const pr of this.ranges ) {
			s += pr.getAttrStrings().join( '\n' ) + '\n';
		}

		s += '/>';
		return s;
	}
}

module.exports = {
	PageRange: PageRange,
	Pagelist: Pagelist,
	NumericRange: NumericRange,
	LiteralRange: LiteralRange,
	createPageRange: createPageRange
};
