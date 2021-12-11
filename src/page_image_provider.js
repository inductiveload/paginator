const MwUtils = require( './mw_utils.js' );
const axios = require( 'axios' ).default;

class PageImageProvider {

	constructor() {
		this.defaultResolution = 1024;
		this.iinfoCache = {};
	}

	fpCacheKey( file, page ) {
		return `${file}/${page}`;
	}

	async getImageInfo( domain, file, page, options ) {
		const resolution = options.resolution || this.defaultResolution;
		const fpCacheKey = this.fpCacheKey( file, page );

		let info = this.iinfoCache[ fpCacheKey ];
		if ( !info ) {
			// Not cached, go and get it
			info = await MwUtils.getIndexImageInfo( domain, file, page, resolution );

			if ( info ) {
				this.iinfoCache[ fpCacheKey ] = info;
			}
		}

		// warm the server thumbnail cache
		if ( info && options.prefetch && info.thumburl ) {
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
