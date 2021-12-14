<template>
	<div
		:class="{ outer: true, narrow: narrow }"
	>
		<HelloWorld msg="The Wikisource Page Game"/>
		<SetupForm
			@indexChanged="indexChanged($event)"
		/>
		<Paginator
		/>
		<PageViewer
		/>
	</div>
</template>

<script>
import HelloWorld from '@/components/HelloWorld.vue';
import PageViewer from '@/components/PageViewer.vue';
import SetupForm from '@/components/SetupForm.vue';
import Paginator from '@/components/Paginator.vue';

import { mapGetters } from 'vuex';

export default {
	name: 'PaginatorApp',
	components: {
		HelloWorld,
		PageViewer,
		SetupForm,
		Paginator
	},
	data() {
		return {
		};
	},
	computed: {
		...mapGetters( {
			narrow: 'isNarrow'
		} )
	},
	watch: {
	},
	mounted() {
		let index = this.$route.query.index;

		let ws = this.$route.query.wikisource || 'en';
		ws = ws.replace( /\.?wikisource(\.org)?$/, '' );
		this.$store.dispatch( 'setWikisource', ws );

		if ( index ) {
			index = index.replace( /^[\s]+:/, '' );
			this.$store.dispatch( 'changeIndex', index );
		}

		this.handleResize();
	},
	methods: {
		handleResize() {
			this.$store.dispatch( 'setWindowParams', {
				width: window.innerWidth
			} );
		}
	},
	created: function () {
		window.addEventListener( 'resize', this.handleResize );
	},
	unmounted() {
		window.removeEventListener( 'resize', this.handleResize );
	}
};
</script>

<style>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	color: #2c3e50;
}

.outer {
	margin: 0 10px;
	display: flex;
	flex-direction: column;
	min-height: 100vh;
}

html {
  /* body will set it's height based on its parent, which is html */
	height: 100%;
  /* set full width as well */
  width: 100%;
}

html,body {
	margin: 0;
  box-sizing: border-box;
}
</style>
