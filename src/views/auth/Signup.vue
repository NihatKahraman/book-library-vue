<template>
    <form @submit.prevent="handleSubmit">
        <h3>Signup</h3>
        <input type="text" placeholder="Display Name" v-model="displayName" />
        <input type="email" placeholder="Email" v-model="email" />
        <input type="password" placeholder="Password" v-model="password" />
        <div v-if="error" class="error">{{ error }}</div>
        <button v-if="!isPending">Signup</button>
        <button v-if="isPending">Loading</button>
    </form>
</template>

<script>
import useSignup from '@/composables/useSignup'
import { ref } from 'vue'
import {useRouter} from 'vue-router'

export default{
    setup(props) {
        const {error, signup, isPending} = useSignup()

        const email = ref('')
        const password = ref('')
        const displayName = ref('')
        const router = useRouter()

        const handleSubmit = async () => {
        const res = await signup(email.value, password.value, displayName.value)
        if(!error.value) {
        console.log('user signed up')
        router.push({name: "login"})
        }
    }
    return{email, password, displayName, handleSubmit, error, isPending}
    }
}

</script>

<style>

</style>