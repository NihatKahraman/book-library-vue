import { ref } from 'vue';
import { authRef } from '../firebase/config';

const error = ref(null)
const isPending = ref(false)

const login = async (email, password) => {
    error.value = null;
    isPending.value = true;
    try {
        const res = await authRef.signInWithEmailAndPassword(email,password);
        error.value = null;
        isPending.value = false;
        return res;
    } catch (err) {
        console.log(err.console)
        error.value ='Incorrect login credentails'
        isPending.value = true;
    }
};

const useLogin = () => {
    return { error, login, isPending};
};

export default useLogin;