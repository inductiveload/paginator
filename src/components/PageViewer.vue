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

			if ( !ii ) {
				// maybe this is a completely busted index?
				return;
			}

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
			// prefixUrl: '//openseadragon.github.io/openseadragon/images/',
			showZoomControl: false,
			showHomeControl: false,
			gestureSettingsMouse: {
				clickToZoom: false
			}
		};

		this.viewer = OpenSeadragon( osdParams );

		this.viewer.world.addHandler( 'add-item', () => {
			const data = window.localStorage.getItem( 'main-viewer-position' );
			let params;
			if ( data ) {
				try {
					params = JSON.parse( data );
				} catch ( e ) {
				}
			}

			if ( params !== undefined ) {
				this.viewer.viewport.setRotation( params.rotation );
				this.viewer.viewport.setRotation( params.zoom );
				this.viewer.viewport.panTo(
					new OpenSeadragon.Point( params.x, params.y ) );
			} else {
				this.viewer.viewport.goHome();
			}
		} );

		this.viewer.addHandler( 'viewport-change', () => {

			var center = this.viewer.viewport.getCenter();

			const params = {
				rotation: this.viewer.viewport.getRotation(),
				zoom: this.viewer.viewport.getZoom(),
				x: center.x,
				y: center.y
			};

			window.localStorage.setItem( 'main-viewer-position', JSON.stringify( params ) );
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
