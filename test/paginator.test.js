const assert = require( 'assert' );
const { UncertainInterval } = require( '../src/paginator.js' );

const P = require( '../src/paginator.js' );

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

	/*
	* Process a case:
	*  * Set up paginator
	*  * get the questions, check the pages match what we expect,
	*  * then feed suitable responses
	*  * Finally, check completion
	*/
	function itTestCase( testCase ) {
		describe( testCase.name, function () {

			const paginator = new P.Paginator( testCase.length );

			function itTestQuestion( i, qaInfo, question, complete ) {
				const desc = qaInfo.position ? ( qaInfo.position + '=' + qaInfo.response ) : 'null';

				it( `Get Question #${i} -> ${desc}`, function () {
					if ( qaInfo.position === null ) {
						assert.equal( question, null );
					} else {
						assert.notEqual( question, null );
						assert.equal( complete, false );
						assert.equal( question.position, qaInfo.position );
					}
				} );
			}

			describe( 'Question/answers', function () {

				for ( let i = 0; i < testCase.qAndAns.length; ++i ) {
					const qaInfo = testCase.qAndAns[ i ];

					// Get the next question
					const question = paginator.nextQuestion();
					const complete = paginator.isComplete();

					// console.log(paginator.pagelist);
					// Test that it is what we expect
					itTestQuestion( i, qaInfo, question, complete );

					if ( question !== null ) {
						// Feed the canned response back
						paginator.addAnswer( question.position, qaInfo.response );
					}
				}
			} );

			it( 'Completeness', () => {
				// the should be no uncertainty left
				assert.equal( paginator.isComplete(), true );
			} );

			if ( testCase.tag ) {

				const normaliseTag = function ( t ) {
					return t.replace( /\s+/g, ' ' );
				};

				const tag = normaliseTag( paginator.pagelist.toTag() );
				const expected = normaliseTag( testCase.tag );

				it( `Tag: ${expected}`, () => {
					assert.equal( tag, expected );
				} );
			}
		} );
	}

	/* Simulate pagination of a work like this:
	 *
	 * 1  2  3  4  5  6  7  8  9 10
	 * C  -  -  1  2  3  4  5  -  C
	 */
	const testCaseBasic = {
		name: 'C--12345--C',
		length: 10,
		tag: '<pagelist 1="Cover" 2to3="–" 4=1 9="–" 10="Cover" />',
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

	itTestCase( testCaseBasic );

	/* Simulate pagination of a work like this:
	 *
	 * 1  2  3   4   5  6  7  8  9 10
	 * C  T  ii iii iv  1  2  3  4  C
	 */
	const testCaseRomArabic = {
		name: 'Roman and Arabic: CT,ii,iii,iv,1234C',
		length: 10,
		tag: '<pagelist 1="Cover" 2="Title" 3=2 3to5="roman" 6=1 10="Cover" />',
		qAndAns: [
			// The first several will just count though the front matter
			{
				position: 1,
				response: 'Cover'
			},
			{
				position: 2,
				response: 'Title'
			},
			{
				position: 3,
				response: 'ii'
			},
			// It will now look for the end of the sequence
			{
				position: 10,
				response: 'Cover'
			},
			{
				position: 9,
				response: '4'
			},
			// There is now a numerical range ahead (4 @ pos 9) and a numerical range
			// behind (ii @ pos 3)

			// First, we expect to look for the hypothetical start of the following range
			// (the arabic one 1-4)
			{
				position: 6,
				response: '1'
			},

			// That should have settled the main page range, so now we will be looking
			// to settle the roman range (ii - iv)
			{
				position: 5,
				response: 'iv'
			}
		]
	};

	itTestCase( testCaseRomArabic );

	/* Handle a discontinuous page range
	 *            V
	 * 1  2  3  4  5  6  7  8  9 10
	 * 1  2  3  4  7  8  9 10 11 12
	 */
	const testCaseDiscontinuousMissing = {
		name: 'Dicontinuity (missing pages)',
		length: 10,
		tag: '<pagelist 1=1 5=7 />',
		qAndAns: [
			{
				position: 1,
				response: '1'
			},
			{
				position: 10,
				response: '12'
			},
			// We are now between two ranges, so we'll try to
			// search for the split
			{
				position: 6,
				response: '8'
			},
			// Again, splitting the first range
			{
				position: 4,
				response: '4'
			},
			{
				position: 5,
				response: '7'
			}
		]
	};

	itTestCase( testCaseDiscontinuousMissing );

	/* Handle a discontinuous page range
	 *             V  V
	 * 1  2  3  4  5  6  7  8  9 10
	 * 1  2  3  4  3  4  5  6  7  8
	 */
	const testCaseDiscontinuousDuplicate = {
		name: 'Dicontinuity (duplicate pages)',
		length: 10,
		tag: '<pagelist 1=1 5=3 />',
		qAndAns: [
			{
				position: 1,
				response: '1'
			},
			{
				position: 10,
				response: '8'
			},
			// We are now between two ranges, so we'll try to
			// search for the split
			{
				position: 6,
				response: '4'
			},
			// Again, splitting the first range
			{
				position: 4,
				response: '4'
			},
			{
				position: 5,
				response: '3'
			}
		]
	};

	itTestCase( testCaseDiscontinuousDuplicate );

	/* Handle non-numbered inserts
	 *
	 * 1  2  3  4  5   6  7  8  9 10
	 * 1  2  3  4  Img -  5  6  7  8
	 */
	const testCaseDiscontinuousPlates = {
		name: 'Dicontinuity (plate pages breaking up numbering',
		length: 10,
		tag: '<pagelist 1=1 5="Img" 6="–" 7=5 />',
		qAndAns: [
			{
				position: 1,
				response: '1'
			},
			{
				position: 10,
				response: '8'
			},
			// We are now between two ranges, so we'll try to
			// search for the split
			// but we land on a non numbered page
			{
				position: 6,
				response: '-'
			},
			{
				position: 5,
				response: 'Img'
			},
			{
				position: 4,
				response: '4'
			},
			{
				position: 7,
				response: '5'
			}
		]
	};

	itTestCase( testCaseDiscontinuousPlates );

	/* Handle dual ranges
	 * This allows slightly faster finding of "secondary ranges" that would
	 * otherwise cause a binary search from a distant point
	 *
	 * 1  2  3  4  5  6  7  8  9 10
	 * 1  2  3  4  5  6  7  8  1  2
	 */
	const testCaseDiscontinuousRestarted = {
		name: 'Disconstinuity (restarted range)',
		length: 10,
		tag: '<pagelist 1=1 9=1 />',
		qAndAns: [
			{
				position: 1,
				response: '1'
			},
			// Report a range that "looks restarted"
			{
				position: 10,
				response: '2'
			},
			// Locate the start of the range
			{
				position: 9,
				response: '1'
			},
			// Now the second range is complete
			{
				position: 8,
				response: '8'
			}
		]
	};

	itTestCase( testCaseDiscontinuousRestarted );

	/* Handle dual ranges with an "early" restart signalled by a change in format
	 * This allows slightly faster finding of "secondary ranges" that would
	 * otherwise cause a binary search from a distant point
	 *
	 * 1  2  3  4  5  6  7  8  9 10
	 * i ii  1  2  3  4  5  6  7  8
	 */
	const testCaseDiscontinuousRestartedFormat = {
		name: 'Disconstinuity (restarted range, new format)',
		length: 10,
		tag: '<pagelist 1=1 1to2="roman" 3=1 />',
		qAndAns: [
			{
				position: 1,
				response: 'i'
			},
			// Report a range that "looks restarted"
			{
				position: 10,
				response: '8'
			},
			// Locate the start of the range
			{
				position: 3,
				response: '1'
			},
			// Now the second range is complete
			{
				position: 2,
				response: 'ii'
			}
		]
	};

	itTestCase( testCaseDiscontinuousRestartedFormat );

	/* Handle nested range inserts
	 * Rare in real books, but can cause a nasty logical trip
   *
	 * This also hits the range restart logic
	 *
	 *             V  V
	 * 1  2  3  4  5  6  7  8  9 10
	 * 1  2  3  4  1  -  3  4  7  8
	 */
	const testCaseDiscontinuousNested = {
		name: 'Dicontinuity (nested range)',
		length: 10,
		tag: '<pagelist 1=1 5=1 6="–" 7=3 9=7 />',
		qAndAns: [
			{
				position: 1,
				response: '1'
			},
			{
				position: 10,
				response: '8'
			},
			{
				position: 6,
				response: '-'
			},
			{
				position: 5,
				response: '1'
			},
			{
				position: 4,
				response: '4'
			},
			{
				position: 7,
				response: '3'
			},
			{
				position: 9,
				response: '7'
			},
			{
				position: 8,
				response: '4'
			}
		]
	};

	itTestCase( testCaseDiscontinuousNested );
} );
