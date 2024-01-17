<template>
    <div class="navbar">
        <nav>
            <router-link :to="{name: 'home'}"><img class="image" src="@/assets/book-orange.png" alt=""></router-link>
            <h1><router-link :to="{name: 'home'}">Book Library</router-link></h1>
            <div class="links">
                <div v-if="user">
                    <span>Hi, {{ user.displayName }}</span> 
                    <router-link class="btn" :to="{name: 'about'}">About</router-link>
                    <button @click="handleClick">Logout</button>
                </div>
                <div v-else>
                    <router-link class="btn" :to="{name: 'signup'}">Signup</router-link>
                    <router-link class="btn" :to="{name: 'login'}">Login</router-link>
                </div>
            </div>
        </nav>
    </div>
</template>

<script>
import useLogout from '@/composables/useLogout';
import getUser from '@/composables/getUser';
import {useRouter} from 'vue-router';

export default {
    setup() {
        const {user} = getUser();
        const { logout } = useLogout();
        const router = useRouter()
        
        const handleClick = async () => {
            await logout();
            console.log('user logged out')
            router.push({name: "login"})
        }
        return { handleClick, user }
    }
}
</script>

<style scoped>
.navbar{
    padding: 16px 10px;
    margin-bottom: 20px;
    color: rgb(245, 179, 1);
}
nav {
    display: flex;
    align-items: center;
    max-width: 1000px;
    margin: 0 auto;
    
}
nav h1 {
    text-decoration: none;
    margin-left: 20px;
}
nav .links{
    text-decoration: none;
    color: rgb(245, 179, 1);
    margin-left: auto;
}
nav .links a,
button {
    margin-left: 16px;
    font-size: 14px;
    
}
nav img {
    max-height: 60px;
}
span {
  font-size: 14px;
  display: inline-block;
  margin-right: 16px;
  padding-right: 16px;
  border-right: 1px solid #ccc;
}

</style>