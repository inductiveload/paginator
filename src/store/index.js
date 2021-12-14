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
			viewOffset: 0,
			totalPages: 0,
			currentImageInfo: undefined,
			complete: false,
			numQuestions: 0,
			startTime: null
		},
		settings: {
			resolution: 1024
		},
		window: {
			width: 0
		},
		wikisource: ''
	},
	getters: {
		imageInfo: ( state ) => ( page ) => {
			return imageInfoCache.getImageInfo(
				state.wikisource,
				state.index.name,
				page,
				state.settings.resolution );
		},
		isNarrow: ( state ) => {
			return state.window.width < 500;
		}
	},
	mutations: {
		CHANGE_IMAGE_INFO( state, { indexName, info } ) {

			if ( indexName !== undefined ) {
				state.index.name = indexName;

				// reset game state
				state.paginationProcess.currentPage = 1;
				state.paginationProcess.complete = false;
				state.paginationProcess.viewOffset = 0;
				state.paginationProcess.numQuestions = 0;
				state.paginationProcess.startTime = Date.now();
			}

			if ( info !== undefined ) {
				state.paginationProcess.currentImageInfo = info;
				state.paginationProcess.totalPages = info ? info.pagecount : 0;
			}
		},
		CHANGE_CURRENT_PAGE( state, newPage ) {
			state.paginationProcess.currentPage = newPage;
		},
		CHANGE_COMPLETE( state, complete ) {
			state.paginationProcess.complete = complete;
		},
		CHANGE_VIEW_OFFSET( state, viewOffset ) {
			state.paginationProcess.viewOffset = viewOffset;
		},
		CHANGE_WIKISOURCE( state, newWS ) {
			state.wikisource = newWS;
		},
		INC_QUESTIONS( state ) {
			state.paginationProcess.numQuestions++;
		},
		SET_WINDOW( state, params ) {
			if ( params.width ) {
				state.window.width = params.width;
			}
		}
	},
	actions: {
		async changeIndex( { commit, state }, indexName ) {
			console.log( 'index change: ' + indexName );

			if ( !indexName ) {
				commit( 'CHANGE_IMAGE_INFO', {
					indexName: null,
					info: undefined
				} );
				return;
			}

			const newImageData = await imageInfoCache.getImageInfo(
				state.wikisource,
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
			commit( 'CHANGE_VIEW_OFFSET', 0 );

			const newImageData = await imageInfoCache.getImageInfo(
				state.wikisource,
				state.index.name,
				newPage,
				state.settings.resolution );

			commit( 'CHANGE_IMAGE_INFO', { info: newImageData } );
		},
		setComplete( { commit }, complete ) {
			commit( 'CHANGE_COMPLETE', complete );
		},
		setViewOffset( { commit }, viewOffset ) {
			commit( 'CHANGE_VIEW_OFFSET', viewOffset );
		},
		setWikisource( { commit }, value ) {
			commit( 'CHANGE_WIKISOURCE', value );
		},
		incQuestions( { commit } ) {
			commit( 'INC_QUESTIONS' );
		},
		setWindowParams( { commit }, params ) {
			commit( 'SET_WINDOW', params );
		},
		async suggestPageLoads( { state }, suggestedPositions ) {
			for ( const pos of suggestedPositions ) {
				imageInfoCache.getImageInfo(
					state.wikisource,
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
