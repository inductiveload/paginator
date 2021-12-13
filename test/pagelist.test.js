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

describe( 'next range after', () => {

	const pl = new PL.Pagelist();

	const r20to30 = new PL.NumericRange( 20, 30, 100 );

	pl.addRange( r20to30 );

	assert.deepEqual(
		pl.getNextRangeAfter( 1 ),
		r20to30
	);

	assert.deepEqual(
		pl.getNextRangeAfter( 20 ),
		null
	);

	assert.deepEqual(
		pl.getNextRangeAfter( 30 ),
		null
	);

	assert.deepEqual(
		pl.getNextRangeAfter( 31 ),
		null
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

describe( 'Pagelist format', () => {

	it( 'arabic', function () {
		const pr = new PL.NumericRange( 100, 200, 10, 'arabic' );

		// < 1
		assert.equal( pr.formatPosition( 50 ), null );

		// these are all possible
		assert.equal( pr.formatPosition( 95 ), 5 );
		assert.equal( pr.formatPosition( 100 ), 10 );
		assert.equal( pr.formatPosition( 110 ), 20 );
		assert.equal( pr.formatPosition( 200 ), 110 );
		assert.equal( pr.formatPosition( 210 ), 120 );
	} );

	it( 'roman', function () {
		const pr = new PL.NumericRange( 100, 200, 10, 'roman' );

		// < 1
		assert.equal( pr.formatPosition( 50 ), null );

		// these are all possible
		assert.equal( pr.formatPosition( 95 ), 'v' );
		assert.equal( pr.formatPosition( 100 ), 'x' );
		assert.equal( pr.formatPosition( 110 ), 'xx' );
		assert.equal( pr.formatPosition( 200 ), 'cx' );
		assert.equal( pr.formatPosition( 210 ), 'cxx' );
	} );
} );
