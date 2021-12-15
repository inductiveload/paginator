<template>
	<div class="page-view-container">
		<div class="page-view-controls">
			<el-button
				id="zoom-in-btn"
				:icon="ZoomIn"
				title="Zoom in"
				size=mini>
			</el-button>
			<el-button
				id="zoom-out-btn"
				:icon="ZoomOut"
				title="Zoom out"
				size=mini>
			</el-button>
			<el-button
				id="zoom-reset-btn"
				:icon="ScaleToOriginal"
				title="Reset zoom"
				size=mini>
			</el-button>
				<el-button
					size=mini
					@click="prevPage"
				>
					&lt; Prev
				</el-button>
				<el-button
					size=mini
					@click="homePage"
				>
					Home
				</el-button>
				<el-button
					size=mini
					@click="nextPage"
				>
					Next >
				</el-button>
		</div>
		<div
			class="page-viewer"
			id="page-viewer"
		></div>
	</div>
</template>

<script>
const OpenSeadragon = require( 'openseadragon' );

import { ScaleToOriginal, ZoomIn, ZoomOut } from '@element-plus/icons-vue';
import { mapState } from 'vuex';
import { ref } from 'vue';

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
			this.resetZoomOnNextLoad = true;
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

			this.viewer.world.removeAll();

			const ii = await this.$store.getters.imageInfo( offset );

			if ( !ii ) {
				// maybe this is a completely busted index?
				return;
			}

			this.viewer.addSimpleImage( {
				url: ii.thumburl
			} );
		},
		nextPage() {
			this.$store.dispatch( 'setViewOffset',
				this.$store.state.paginationProcess.viewOffset + 1
			);
		},
		prevPage() {
			this.$store.dispatch( 'setViewOffset',
				this.$store.state.paginationProcess.viewOffset - 1
			);
		},
		homePage() {
			this.$store.dispatch( 'setViewOffset', 0 );
		}
	},
	mounted() {
		const osdParams = {
			id: 'page-viewer',
			showFullPageControl: false,
			preserveViewport: true,
			animationTime: 0.5,
			zoomInButton: 'zoom-in-btn',
			zoomOutButton: 'zoom-out-btn',
			homeButton: 'zoom-reset-btn',
			// showNavigator: 'true',
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

			if ( params !== undefined && !this.resetZoomOnNextLoad ) {
				this.viewer.viewport.setRotation( params.rotation );
				this.viewer.viewport.setRotation( params.zoom );
				this.viewer.viewport.panTo(
					new OpenSeadragon.Point( params.x, params.y ) );
			} else {
				this.viewer.viewport.goHome();
			}

			this.resetZoomOnNextLoad = false;
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
	},
	setup() {
		return {
			ScaleToOriginal,
			ZoomIn,
			ZoomOut,
			resetZoomOnNextLoad: ref( false )
		};
	}
};
</script>

<style>

.page-view-container {
	display: flex;
	flex-grow: 1;
	flex-direction: column;
	border-top: 1px solid grey;
	padding-top: 5px;
	/* min-height: 500px; */
}

.narrow .page-view-container {
	flex-direction: row;
  align-items: stretch;
}

.page-view-controls {
	display: flex;
	flex-direction: row;
	justify-content: center;
	margin-bottom: 5px;
}

.narrow .page-view-controls {
	flex-direction: column;
	justify-content: start;
}

.page-view-controls button {
	margin-left: 5px;
}

.narrow .page-view-controls button {
	margin-left: 0;
	margin-top: 5px;
}

.narrow .page-view-container {
	flex-direction: row;
}

.page-viewer {
	width:100%;
	display: flex;
	flex-grow: 1;
	flex-direction: column;
	min-height: 400px;
	margin-bottom: 10px;
}

.narrow .page-viewer {
	margin-left: 5px;
}

.openseadragon-container {
	background-color: #e8f2f8 !important;
	flex-grow: 1;
}
</style>
