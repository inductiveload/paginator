<template>
	<div
		class="outer"
	>
		<HelloWorld msg="Welcome to The Page Game"/>
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
import HelloWorld from './components/HelloWorld.vue';
import PageViewer from './components/PageViewer.vue';
import SetupForm from './components/SetupForm.vue';
import Paginator from './components/Paginator.vue';

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
	}
};
</script>

<style>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	height: 100vh;
}

.outer {
	display: flex;
	flex-direction: column;
	height: 100%;
}

html {
  /* body will set it's height based on its parent, which is html */
  height: 100%;

  /* set full width as well */
  width: 100%;
}

html,body {
  box-sizing: border-box;
}
</style>
