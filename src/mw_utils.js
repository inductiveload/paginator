const axios = require( 'axios' ).default;

function getIndexNs( domain ) {

	const doms = {
		en: 106,
		mul: 106,
		ar: 106,
		as: 106,
		be: 106,
		bn: 102,
		br: 100,
		ca: 104,
		cy: 106,
		da: 106,
		de: 104,
		el: 102,
		eo: 106,
		es: 104,
		et: 104,
		fa: 106,
		fr: 112,
		gu: 106,
		he: 112,
		hr: 104,
		hu: 106,
		hy: 106,
		id: 102,
		it: 110,
		kn: 106,
		la: 106,
		ml: 104,
		mr: 106,
		nl: 106,
		no: 106,
		pl: 102,
		pms: 104,
		pt: 104,
		ro: 106,
		ru: 106,
		sa: 106,
		sl: 104,
		sv: 108,
		te: 106,
		vec: 104,
		vi: 106,
		zh: 106
	};

	const ns = doms[ domain ];
	return ns || 252;
}

function getIndexName( domain, index ) {
	let url;
	if ( domain === 'mul' ) {
		url = 'https://wikisource.org';
	} else {
		url = `https://${domain}.wikisource.org`;
	}
	url += '/wiki/Index:' + index;
	return url;
}

function getApiPath( domain ) {
	if ( domain === 'mul' ) {
		return 'https://wikisource.org/w/api.php';
	} else {
		return `https://${domain}.wikisource.org/w/api.php`;
	}
}

async function getIndexImageInfo( domain, index, n, width ) {

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

	return axios.get( getApiPath( domain ), { params } )
		.then( ( data ) => {
			const pageData = data.data.query.pages[ 0 ];

			if ( pageData.imageinfo ) {
				return pageData.imageinfo[ 0 ];
			}
			return null;
		} );
}

async function getRecentIndexes( domain ) {

	const indexNs = getIndexNs( domain );

	const params = {
		action: 'query',
		format: 'json',
		formatversion: '2',
		origin: '*',
		list: 'recentchanges',
		rcnamespace: indexNs,
		rctoponly: 1,
		rcprop: 'title'
	};

	return axios.get( getApiPath( domain ), { params } )
		.then( ( data ) => {
			return data.data.query.recentchanges || [];
		} );
}

async function getIndexesWithPrefix( domain, prefix ) {

	const indexNs = getIndexNs( domain );

	if ( !prefix ) {
		return getRecentIndexes( domain );
	}

	const params = {
		action: 'query',
		format: 'json',
		list: 'prefixsearch',
		formatversion: '2',
		origin: '*',
		pssearch: prefix,
		psnamespace: indexNs,
		psprofile: 'fuzzy-subphrases'
	};

	return axios.get( getApiPath( domain ), { params } )
		.then( ( data ) => {
			return data.data.query.prefixsearch || [];
		} );
}

module.exports = {
	getIndexImageInfo,
	getIndexesWithPrefix,
	getRecentIndexes,
	getIndexName
};
