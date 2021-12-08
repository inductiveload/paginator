const MwUtils = require( './mw_utils.js' );
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
			const pageData = data.data.query.pages[ 0 ];

			if ( pageData.imageinfo ) {
				return pageData.imageinfo[ 0 ];
			}
			return null;
		} );
}

class PageImageProvider {

	constructor() {
		this.defaultResolution = 1024;
		this.iinfoCache = {};
	}

	fpCacheKey( file, page ) {
		return `${file}/${page}`;
	}

	async getImageInfo( file, page, options ) {
		const resolution = options.resolution || this.defaultResolution;
		const fpCacheKey = this.fpCacheKey( file, page );

		let info = this.iinfoCache[ fpCacheKey ];
		if ( !info ) {
			// Not cached, go and get it
			info = await getIndexImageInfo( file, page, resolution );

			if ( info ) {
				this.iinfoCache[ fpCacheKey ] = info;
			}
		}

		// warm the server thumbnail cache
		if ( options.prefetch && info.thumburl ) {
			// could actually get this, it at least seems that
			// the response doesn't havea cache-control set
			// so it wouldn't be used anyway
			axios.head( info.thumburl );
		}

		// return the actual info
		return info;
	}
}

module.exports = {
	PageImageProvider
};
