const assert = require( 'assert' );
const PL = require( '../src/pagelist.js' );

describe( 'Simple Pagelist', () => {
	const pl = new PL.Pagelist();
	pl.addRange( new PL.NumericRange( 10, 10, 1 ) );
} );

describe( 'last range before', () => {

	const pl = new PL.Pagelist();
	pl.addRange( new PL.NumericRange( 10, 10, 1 ) );
	pl.addRange( new PL.NumericRange( 20, 20, 100 ) );

	assert.deepEqual(
		pl.getLastRangeBefore( 1 ),
		null
	);

	assert.deepEqual(
		pl.getLastRangeBefore( 10 ),
		null
	);

	assert.deepEqual(
		pl.getLastRangeBefore( 15 ),
		new PL.NumericRange( 10, 10, 1 )
	);

	assert.deepEqual(
		pl.getLastRangeBefore( 20 ),
		new PL.NumericRange( 10, 10, 1 )
	);

	assert.deepEqual(
		pl.getLastRangeBefore( 21 ),
		new PL.NumericRange( 20, 20, 100 )
	);

	assert.deepEqual(
		pl.getLastRangeBefore( 51 ),
		new PL.NumericRange( 20, 20, 100 )
	);
} );

describe( 'Page range consistency', () => {

	it( 'literal', function () {
		const pr = new PL.LiteralRange( 1, 1, '-' );

		// you can only extend by one at at time
		assert.equal( pr.isConsistent( 2, '-' ), true );
		assert.equal( pr.isConsistent( 3, '-' ), false );
	} );
} );
