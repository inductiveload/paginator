<template>
	<div
		:class="{ outer: true, narrow: narrow }"
	>
    <TopMenu msg="The Wikisource Page Game"/>
    <router-view />
  </div>
</template>

<script>
import TopMenu from '@/components/TopMenu.vue';

import { mapGetters } from 'vuex';

export default {
	name: 'PageGameApp',
	components: {
		TopMenu
	},
	computed: {
		...mapGetters( {
			narrow: 'isNarrow'
		} )
	},
	mounted() {
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

html,body {
  box-sizing: border-box;
}
</style>
