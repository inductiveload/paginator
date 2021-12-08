import { createStore } from 'vuex';
import { PageImageProvider } from '../page_image_provider.js';

const imageInfoCache = new PageImageProvider();

export default createStore( {
	strict: process.env.NODE_ENV !== 'production',
	state: {
		index: {
			name: null
		},
		paginationProcess: {
			currentPage: 1,
			totalPages: 1,
			currentImageInfo: undefined,
			complete: false
		},
		settings: {
			resolution: 1024
		}
	},
	getters: {},
	mutations: {
		CHANGE_IMAGE_INFO( state, { indexName, info } ) {

			if ( indexName ) {
				state.index.name = indexName;
			}
			if ( info ) {
				state.paginationProcess.currentImageInfo = info;
				state.paginationProcess.totalPages = info.pagecount;
			}
		},
		CHANGE_CURRENT_PAGE( state, newPage ) {
			state.paginationProcess.currentPage = newPage;
		},
		CHANGE_COMPLETE( state, complete ) {
			state.paginationProcess.complete = complete;
		}
	},
	actions: {
		async changeIndex( { commit, state }, indexName ) {
			console.log( 'index change: ' + indexName );

			if ( !indexName ) {
				return;
			}

			const newImageData = await imageInfoCache.getImageInfo(
				indexName,
				state.paginationProcess.currentPage,
				state.settings.resolution );

			commit( 'CHANGE_IMAGE_INFO', {
				indexName,
				info: newImageData
			} );
		},
		async changeCurrentPage( { commit, state }, newPage ) {
			commit( 'CHANGE_CURRENT_PAGE', newPage );

			const newImageData = await imageInfoCache.getImageInfo(
				state.index.name,
				newPage,
				state.settings.resolution );

			commit( 'CHANGE_IMAGE_INFO', { info: newImageData } );
		},
		setComplete( { commit }, complete ) {
			commit( 'CHANGE_COMPLETE', complete );
		},
		async suggestPageLoads( { state }, suggestedPositions ) {
			for ( const pos of suggestedPositions ) {
				imageInfoCache.getImageInfo(
					state.index.name,
					pos,
					{
						resolution: state.settings.resolution,
						prefetch: true
					} );
			}
		}
	}
} );
