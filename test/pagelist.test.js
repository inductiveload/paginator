const assert = require( 'assert' );
const PL = require( '../src/pagelist.js' );

describe( 'Arabic page ranges', () => {

	it( 'basic', function () {
		const pr = new PL.NumericRange( 1, 3, 1, 'arabic' );

		assert.equal( pr.from, 1 );
		assert.equal( pr.to, 3 );
		assert.equal( pr.length(), 3 );
	} );
} );

describe( 'Roman page ranges', () => {

	it( 'low roman', function () {
		const pr = new PL.NumericRange( 1, 3, 'i', 'roman' );

		assert.equal( pr.from, 1 );
		assert.equal( pr.to, 3 );
		assert.equal( pr.length(), 3 );
	} );

	it( 'high roman', function () {
		const pr = new PL.NumericRange( 1, 3, 'I', 'highroman' );

		assert.equal( pr.from, 1 );
		assert.equal( pr.to, 3 );
		assert.equal( pr.length(), 3 );
		assert.equal( pr.startValue, 1 );

		// check consistencies
		assert.equal( pr.isConsistent( 4, 4 ), false );
		assert.equal( pr.isConsistent( 4, 'IV' ), true );
		assert.equal( pr.isConsistent( 4, 'iv' ), false );
	} );

	it( 'high roman start=4', function () {
		const pr = new PL.NumericRange( 4, 6, 'IV', 'highroman' );

		assert.equal( pr.from, 4 );
		assert.equal( pr.to, 6 );
		assert.equal( pr.length(), 3 );
		assert.equal( pr.startValue, 4 );

		// check consistencies
		assert.equal( pr.isConsistent( 1, 1 ), false );
		assert.equal( pr.isConsistent( 1, 'I' ), true );
	} );
} );

describe( 'Page range length', () => {

	it( 'length 1', function () {
		const pr = new PL.LiteralRange( 1, 1, '-' );
		assert.equal( pr.length(), 1 );
	} );

	it( 'length 10', function () {
		const pr = new PL.LiteralRange( 1, 10, '-' );
		assert.equal( pr.length(), 10 );
	} );
} );

describe( 'Page range abutting', () => {

	it( 'abuts', function () {
		const pr1 = new PL.LiteralRange( 1, 1, '-' );
		const pr2 = new PL.LiteralRange( 2, 2, '-' );
		const pr3 = new PL.LiteralRange( 3, 3, '-' );

		// you can only extend by one at at time
		assert.equal( pr1.immediatelyPrecedes( pr2 ), true );
		assert.equal( pr1.immediatelyPrecedes( pr3 ), false );

		assert.equal( pr2.immediatelyPrecedes( pr3 ), true );
		assert.equal( pr2.immediatelyPrecedes( pr1 ), false );

		assert.equal( pr3.immediatelyPrecedes( pr2 ), false );
		assert.equal( pr3.immediatelyPrecedes( pr2 ), false );
	} );
} );

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

describe( 'Page range merge right over left', () => {

	it( 'merge completely', function () {
		const pl = new PL.Pagelist();
		pl.addRange( new PL.LiteralRange( 1, 2, '?' ) );
		pl.addRange( new PL.NumericRange( 3, 3, 3, 'arabic' ) );

		pl.mergeRanges();

		assert.equal( pl.rangeCount(), 1 );
		assert.deepEqual( pl.ranges[ 0 ], new PL.NumericRange( 1, 3, 1, 'arabic' ) );
	} );

	it( 'merge partially', function () {
		const pl = new PL.Pagelist();
		pl.addRange( new PL.LiteralRange( 1, 2, '?' ) );
		pl.addRange( new PL.NumericRange( 3, 3, 2, 'arabic' ) );

		pl.mergeRanges();

		assert.equal( pl.rangeCount(), 2 );
		assert.deepEqual( pl.ranges[ 0 ], new PL.LiteralRange( 1, 1, '?' ) );
		assert.deepEqual( pl.ranges[ 1 ], new PL.NumericRange( 2, 3, 1, 'arabic' ) );
	} );
} );

describe( 'Page range merge left over right', () => {

	it( 'merge', function () {
		const pl = new PL.Pagelist();
		pl.addRange( new PL.NumericRange( 1, 3, 1, 'arabic' ) );
		pl.addRange( new PL.LiteralRange( 4, 5, '?' ) );

		pl.mergeRanges();

		assert.equal( pl.rangeCount(), 1 );
		assert.deepEqual( pl.ranges[ 0 ], new PL.NumericRange( 1, 5, 1, 'arabic' ) );
	} );
} );

describe( 'Page range numerically consistent, but different formats', () => {

	it( 'merge', function () {
		const pl = new PL.Pagelist();
		pl.addRange( new PL.NumericRange( 1, 3, 1, 'arabic' ) );
		pl.addRange( new PL.NumericRange( 4, 5, 'iv', 'roman' ) );

		pl.mergeRanges();

		// should NOT merge these
		assert.equal( pl.rangeCount(), 2 );
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
		const pr = new PL.NumericRange( 100, 200, 'x', 'roman' );

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
