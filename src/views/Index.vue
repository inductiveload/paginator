<template>
	<SetupForm />
	<Paginator
	/>
	<PageViewer
	/>
</template>

<script>
import PageViewer from '@/components/PageViewer.vue';
import SetupForm from '@/components/SetupForm.vue';
import Paginator from '@/components/Paginator.vue';

export default {
	name: 'Index',
	components: {
		PageViewer,
		SetupForm,
		Paginator
	},
	data() {
		return {
		};
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
	}
};
</script>

<style>

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
}
</style>
