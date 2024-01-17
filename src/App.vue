<template>
  <Navbar />
  <div class="content">
      <router-view />
    </div>
</template>

<script>
import Navbar from './components/Navbar.vue';
export default{
  components: {Navbar}
}


</script>

<style>
body {
  font-family: Sylfaen, Helvetica, Arial, sans-serif;
  font-weight: 900;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: rgb(245, 179, 1);
  background: rgb(30, 35, 40);
  
}
.content{
margin: 0 auto;
max-width: 1200px;
padding: 0 20px;
  
}
nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: rgb(245, 179, 1)

}

nav a.router-link-exact-active {
  color: rgb(245, 179, 1);
}
</style>
