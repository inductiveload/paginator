<template>
  <!--<div id="nav">
      <router-link to="/">Index</router-link>
  </div>-->
  <router-view />
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent( {
	setup() {
		document.title = 'Page Game';
	}
} );
</script>
