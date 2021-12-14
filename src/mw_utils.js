const axios = require( 'axios' ).default;

import { indexToCheckCategoryByDomain } from '@/index_cats.js';
import { getIndexNs } from '@/index_ns.js';

const limit = 50;

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

	const cat = indexToCheckCategoryByDomain[ domain ];
	const apiPath = getApiPath( domain );

	if ( cat !== undefined ) {
		const params = {
			action: 'query',
			format: 'json',
			formatversion: 2,
			list: 'categorymembers',
			cmtitle: 'Category:' + cat,
			cmlimit: limit,
			cmsort: 'timestamp',
			cmdir: 'descending',
			cmnamespace: indexNs,
			cmprop: 'ids|title',
			origin: '*'
		};

		return axios.get( apiPath, { params } )
			.then( ( data ) => {
				return data.data.query.categorymembers || [];
			} );
	} else {
		// just use recent changes
		const params = {
			action: 'query',
			format: 'json',
			formatversion: '2',
			origin: '*',
			list: 'recentchanges',
			rcnamespace: indexNs,
			rclimit: limit,
			rctoponly: 1,
			rcprop: 'title'
		};

		return axios.get( apiPath, { params } )
			.then( ( data ) => {
				return data.data.query.recentchanges || [];
			} );
	}
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

export {
	getIndexImageInfo,
	getIndexesWithPrefix,
	getRecentIndexes,
	getIndexName
};
