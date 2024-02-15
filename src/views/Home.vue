<template>
  <div class="home">
    <h3>{{ msg }}</h3>
    <div class="tabs">
      <h1><router-link :to="{name: 'books'}">Books</router-link></h1>
      <h1><router-link :to="{name: 'customers'}">Customers</router-link></h1>
      <h1><router-link :to="{name: 'reservations'}">Reservations</router-link></h1>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Home',
 setup() {
  const msg = "Welcome to the Book Library"

  return {msg}
 }
}
</script>

<style scoped>
.tabs h1 {
  font-size: 48 px;
  display: block ;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 20px;
  max-width: 300px;
  margin: 60px auto;
  background: #343434;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 1px 3px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  line-height: 1.5em;
  text-transform: capitalize;
    
}


</style>
