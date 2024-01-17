import { ref } from 'vue'
import {firestoreRef} from '../firebase/config'

const getCollection = (collection) => {
    const documents = ref(null)
    const error = ref(null)

    let collectionRef = firestoreRef.collection(collection);

    collectionRef.onSnapshot((snap) => {
        let result = []
        snap.docs.forEach(doc => {
            doc.data() && result.push({...doc.data(), id:doc.id})
        })
        documents.value = result
        error.value = null
    }, (err) => {
        console.log(err.message)
        documents.value = null
        error.value = 'could not fetch data'
    })
    return {documents, error}
}

export default getCollection;