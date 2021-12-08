<template>
	<div
		class="page-viewer"
		id="page-viewer"
	></div>
</template>

<script>
const OpenSeadragon = require( 'openseadragon' );

const zoomIn = require( '@/assets/zoomIn.svg' );

export default {
	name: 'PageViewer',
	computed: {
		filePageUrl() {
			const ii = this.$store.state.paginationProcess.currentImageInfo;
			if ( ii ) {
				// de-proxifiy or something IDK lol
				return JSON.parse( JSON.stringify( ii ) ).thumburl;
			}
			return null;
		}
	},
	watch: {
		filePageUrl: function ( newVal ) {
			if ( !newVal ) {
				return;
			}
			this.viewer.world.removeAll();
			this.viewer.addSimpleImage( {
				url: newVal
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
