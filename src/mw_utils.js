const axios = require( 'axios' ).default;

async function getIndexImageInfo( index, n, width ) {

	const params = {
		action: 'query',
		format: 'json',
		formatversion: 2,
		origin: '*',
		prop: 'imageinfo',
		titles: 'File:' + index,
		iiprop: 'url|dimensions',
		iiurlparam: `page${n}-${width}px`
	};

	return axios.get( 'https://en.wikisource.org/w/api.php', { params } )
		.then( ( data ) => {
			return data.data.query.pages[ 0 ];
		} );
}

async function getRecentIndexes() {
	const params = {
		action: 'query',
		format: 'json',
		formatversion: '2',
		origin: '*',
		list: 'recentchanges',
		rcnamespace: '106',
		rctoponly: 1,
		rcprop: 'title'
	};

	return axios.get( 'https://en.wikisource.org/w/api.php', { params } )
		.then( ( data ) => {
			return data.data.query.recentchanges || [];
		} );
}

async function getIndexesWithPrefix( prefix ) {

	if ( !prefix ) {
		return getRecentIndexes();
	}

	const params = {
		action: 'query',
		format: 'json',
		list: 'prefixsearch',
		formatversion: '2',
		origin: '*',
		pssearch: prefix,
		psnamespace: '106',
		psprofile: 'fuzzy-subphrases'
	};

	return axios.get( 'https://en.wikisource.org/w/api.php', { params } )
		.then( ( data ) => {
			return data.data.query.prefixsearch || [];
		} );
}

module.exports = {
	getIndexImageInfo,
	getIndexesWithPrefix,
	getRecentIndexes
};
