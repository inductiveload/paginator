<template>
  <el-menu
    class="banner-menu"
    mode="horizontal"
  >
    <el-menu-item index="1">
      <h1>
        <router-link to="/">{{ msg }}</router-link>
      </h1>
    </el-menu-item>
    <el-menu-item index="2">
      <router-link to="/about">About</router-link>
    </el-menu-item>
  </el-menu>
</template>

<script>
export default {
	name: 'TopMenu',
	props: {
		msg: String
	}
};
</script>

<style scoped>
h1 {
  font-size: 1rem;
}

.banner-menu {
  margin-bottom: 5px;
}

.banner-menu a {
  text-decoration: none;
}
</style>
