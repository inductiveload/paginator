<template>
	<img alt="Vue logo" src="./assets/logo.png">
	<HelloWorld msg="Welcome to Your Vue.js App"/>
	<PageViewer
		:image-url='url'
	/>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue';
import PageViewer from './components/PageViewer.vue';

export default {
	name: 'Paginator',
	components: {
		HelloWorld,
		PageViewer
	},
	data() {
		return {
			url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Blackwood%27s_Magazine_volume_039.djvu/page89-1838px-Blackwood%27s_Magazine_volume_039.djvu.jpg'
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
	margin-top: 60px;
}
</style>
