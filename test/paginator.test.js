const assert = require( 'assert' );
const { UncertainInterval } = require( '../src/paginator.js' );

const P = require( '../src/paginator.js' );

describe( 'Simple SureRange', () => {

	it( 'unincluded', function () {

		const ss = new P.SureSet();

		ss.addRange( new P.SureRange( 1, 1 ) );

		assert.equal( ss.nextUnincluded( 1 ), 2 );

		ss.addRange( new P.SureRange( 2, 2 ) );
		ss.addRange( new P.SureRange( 4, 5 ) );

		assert.equal( ss.nextUnincluded( 1 ), 3 );
		assert.equal( ss.nextUnincluded( 4 ), 6 );
		assert.equal( ss.nextUnincluded( 5 ), 6 );
		assert.equal( ss.nextUnincluded( 6 ), 6 );
		assert.equal( ss.nextUnincluded( 7 ), 7 );
	} );
} );

describe( 'Simple UncertainInterval', () => {

	const init = new P.UncertainInterval( 1, 100 );

	it( 'unincluded', function () {
		const res = init.split( 200, 100 );
		assert.deepEqual( [ new UncertainInterval( 1, 100 ) ], res );
	} );

	it( 'covering', function () {
		const res = init.split( 1, 100 );
		assert.deepEqual( [], res );
	} );

	it( 'left trim', function () {
		const res = init.split( 1, 20 );
		assert.deepEqual( [ new UncertainInterval( 21, 100 ) ], res );
	} );

	it( 'right trim', function () {
		const res = init.split( 80, 100 );
		assert.deepEqual( [ new UncertainInterval( 1, 79 ) ], res );
	} );

	it( 'split', function () {
		const res = init.split( 40, 60 );
		assert.deepEqual( [
			new UncertainInterval( 1, 39 ),
			new UncertainInterval( 61, 100 )
		], res );
	} );
} );

describe( 'Paginator', () => {

	const paginator = new P.Paginator( 10 );

	/* Simulate pagination of a work like this:
	 *
	 * 1  2  3  4  5  6  7  8  9 10
	 * C  -  -  1  2  3  4  5  -  C
	 */

	/*
	 * List of cases - we'll get the questions, check the pages match what we expect,
	 * then feed suitable responses.
	 */
	const testCase = {
		name: 'C--12345--C',
		qAndAns: [
			// The first several will just count though the front matter
			{
				position: 1,
				response: 'Cover'
			},
			{
				position: 2,
				response: '-'
			},
			{
				position: 3,
				response: '-'
			},
			{
				position: 4,
				response: '1'
			},
			// It will now try to jump forward to find the end of the range
			{
				position: 10,
				response: 'Cover'
			},
			// it's now going to try to count backwards from the end tto discover the end of the
			// numbered sequence
			{
				position: 9,
				response: '-'
			},
			{
				position: 8,
				response: '5'
			},
			// and now we have reached a consistent state with no uncertainty
			{
				position: null
			}
		]
	};

	describe( testCase.name, () => {

		function itTestQuestion( i, caseInfo, question ) {
			const desc = caseInfo.position ? ( caseInfo.position + '=' + caseInfo.response ) : 'null';

			it( `Get Question #${i} -> ${desc}`, () => {

				if ( caseInfo.position === null ) {
					assert.equal( question, null );
				} else {
					assert.equal( question.position, caseInfo.position );
				}
			} );
		}

		for ( let i = 0; i < testCase.qAndAns.length; ++i ) {
			const caseInfo = testCase.qAndAns[ i ];

			// Get the next question
			const question = paginator.nextQuestion();

			// Test that it is what we expect
			itTestQuestion( i, caseInfo, question );

			if ( question !== null ) {
				// Feed the canned response back
				paginator.addAnswer( question.position, caseInfo.response );
			}
		}

		it( 'Completeness', () => {
			// the should be no uncertainty left
			assert.equal( paginator.isComplete(), true );
		} );
	} );
} );
