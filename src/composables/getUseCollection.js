import { ref } from 'vue'
import {firestoreRef} from '../firebase/config'

const useCollection = (collectionName) => {
    const collectionRef = ref(firestoreRef.collection(collectionName));

    const addDoc = async (data) => {
        await firestoreRef.collection(collectionName).add(data)
    }

    const deleteDoc = async (docId) => {
        await firestoreRef.collection(collectionName).doc(docId).delete();
    }

    const updateDoc = async (docId, data) => {
        await collectionRef.value.doc(docId).update(data);
    }

    const getCollection = async () => {
        const snaphot = await collectionRef.value.get();
        return snaphot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    }
    
    return {collectionRef, addDoc, deleteDoc, updateDoc, getCollection};
};

export default useCollection;