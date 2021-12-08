<template>
	<div class="page-viewer" id="pageviewer"></div>
</template>

<script>
const OpenSeadragon = require( 'openseadragon' );

export default {
	name: 'PageViewer',
	props: {
		imageUrl: String
	},
	watch: {
		imageUrl: function ( newVal ) {
			// this.viewer.addTiledImage( constructImagePyramid( newVal ) );
		}
	},
	mounted() {
		const osdParams = {
			id: 'pageviewer',
			showFullPageControl: false,
			preserveViewport: true,
			animationTime: 0.5
		};

		this.viewer = OpenSeadragon( osdParams );

		this.viewer.addSimpleImage( {
			url: this.imageUrl
		} );
	}
};
</script>

<style>

.page-viewer {
	border: 1px solid grey;
	height: 500px;
}

</style>
