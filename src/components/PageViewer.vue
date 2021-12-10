<template>
	<div
		class="page-viewer"
		id="page-viewer"
	></div>
</template>

<script>
const OpenSeadragon = require( 'openseadragon' );

import { mapState } from 'vuex';

export default {
	name: 'PageViewer',
	computed: {
		...mapState( {
			currentPage: ( state ) => state.paginationProcess.currentPage,
			viewOffset: ( state ) => state.paginationProcess.viewOffset,
			changeIndex: ( state ) => state.index.name
		} )
	},
	watch: {
		changeIndex() {
			this.reload();
		},
		currentPage() {
			this.reload();
		},
		viewOffset() {
			this.reload();
		}
	},
	methods: {
		reload: async function () {

			const offset = Math.max(
				1,
				this.$store.state.paginationProcess.currentPage +
				this.$store.state.paginationProcess.viewOffset
			);

			const ii = await this.$store.getters.imageInfo( offset );

			this.viewer.world.removeAll();
			this.viewer.addSimpleImage( {
				url: ii.thumburl
			} );
		}
	},
	mounted() {
		const osdParams = {
			id: 'page-viewer',
			showFullPageControl: false,
			preserveViewport: true,
			animationTime: 0.5,
			prefixUrl: '//openseadragon.github.io/openseadragon/images/',
			gestureSettingsMouse: {
				clickToZoom: false
			}
		};

		this.viewer = OpenSeadragon( osdParams );

		this.viewer.world.addHandler( 'add-item', () => {
			console.log( 'Open' );
			this.viewer.viewport.goHome();
		} );

		if ( this.filePageUrl ) {
			this.viewer.addSimpleImage( {
				url: this.filePageUrl
			} );
		}
	}
};
</script>

<style>

.page-viewer {
	margin-top: 5px;
	border-top: 1px solid grey;
	flex-grow: 1;
}

.openseadragon-canvas {
    background-color: #e8f2f8 !important;
}
</style>
