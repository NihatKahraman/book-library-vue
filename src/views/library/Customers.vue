<template>
    <h1 style="margin-right: 150px;">CUSTOMERS</h1>
    <div class="customers">
        <div class="data" style="display:block;">
            <table> 
                <thead>
                    <tr>
                        <th id="th1" style="margin:0px; height: 20px; width: 20px;"></th>
                        <th>Name</th>
                        <th>Surname</th>
                        <th>Gender</th>
                        <th>Phone Number</th>
                        <th>Age</th>
                    </tr>
                </thead>
                    <tbody>
                        <tr v-for="(row, index) in paginatedTableRows" :key="index">
                            <td><input id="cb1" type="checkbox" v-model="row.selected" @change="getSelectedRowData(row)" style="margin:0px; height: 20px; width: 20px;"  /></td>
                            <td>{{row.name}}</td>
                            <td>{{row.surname}}</td>
                            <td>{{row.gender}}</td>
                            <td>{{row.phoneNumber}}</td>
                            <td>{{row.age}}</td>
                        </tr>
                    </tbody>
            </table>
            <form class="paging">
                <button id="prevPage" type="button" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">Previous</button>
                    <span style="font-size: 11px; "> {{ currentPage }} / {{ totalPages }}</span>
                <button id="nextPage" type="button" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">Next</button>
            </form>
        </div>
        <div class="sidebar" style="text-align: left;">
            <form class="form1">
                <label for="Name">
                    Name <input type="text" name="Name" id="name" required v-model="name">
                </label>
                <label for="Surname">
                    Surname <input type="text" name="Surname" id="surname" required v-model="surname">
                </label>
                <label for="Gender">Gender</label>
                <select name="gender" id="gender" style="cursor: pointer;" required v-model="selectedGender">
                    <option v-for="gender in genders" :key="gender" style="cursor: pointer;">{{ gender }}</option>
                </select>
                <label for="Phone Number">
                    Phone Number <input type="number" name="PhoneNumber" id="phoneNumber" style="width: 110px;" maxlength="10" required v-model="phoneNumber">
                </label>
                <label for="Age">
                    Age <input type="number" name="number" id="number" maxlength="3" required v-model="age">
                </label>
            </form>
        </div>
        <div  class="buttons">
            <form class="form2" style="display:flex; align-items: center;">
                <button @click="addCustomer" type="button" style='margin-right:50px; height: 40px; width: 100px; font-size: 18px;'>Add</button>
                <button @click="deleteCustomers" type="button" style='margin-right:50px; height: 40px; width: 100px; font-size: 18px;'>Delete</button>
                <button @click="updateCustomers" type="button" style='margin-right:50px; height: 40px; width: 100px; font-size: 18px;'>Update</button>
                <button @click="searchCustomers" type="button" style='margin-right:50px; height: 40px; width: 100px; font-size: 18px;'>Search</button>
                <button @click="refreshCustomers" type="button" style='margin-right:50px; height: 40px; width: 100px; font-size: 18px;'>Refresh</button>
            </form>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, computed  } from "vue";
import getUseCollection from "@/composables/getUseCollection";
import {firestoreRef} from '@/firebase/config'
export default {
    setup() {
      const { collectionRef, addDoc, deleteDoc, updateDoc } = getUseCollection("customers");
      const db = firestoreRef;
      
      const name = ref("");
      const surname = ref("");
      const genders = ref(["Female", "Male"]);
      const selectedGender = ref("");
      const phoneNumber = ref("");
      const age = ref("");
      const tableRows = ref([]);

      const rowsPerPage = 7;
      const currentPage = ref(1)

	  const totalPages = computed(() => Math.ceil(tableRows.value.length / rowsPerPage));

      const paginatedTableRows = computed(() => {
        const start = (currentPage.value - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return tableRows.value.slice(start, end)
      })

      const goToPage = (page) => {
        if(page >= 1 && page <= totalPages.value) {
            currentPage.value = page;
        }
      }

      const addCustomer = async () => {
        if(name.value && surname.value && selectedGender.value && phoneNumber.value && age.value){
        const newCustomer = {
          name: name.value,
          surname: surname.value,
          gender: selectedGender.value,
          phoneNumber: phoneNumber.value,
          age: age.value,
          id: Math.floor(Math.random() * 1000000),
        };
        await addDoc(newCustomer)

        tableRows.value.push(newCustomer);
        
        } else {
            alert('Please fill in all fields');
        }
        
    };

    const fetchDataFromFirebase = async () => {
        try {
            const customers = await db.collection('customers').orderBy('name').get();

            tableRows.value = customers.docs.map(doc => doc.data());
        } catch (error) {
            console.error('Error fetching data from the Firebase:', error)
        }
    }

    const deleteCustomers = () => {
	    const selectedRows = tableRows.value.filter(row => row.selected)
	
	if(selectedRows.length > 0) {
		selectedRows.forEach(async (selectedRow) => {
		const doc = await collectionRef.value.where('id', '==', selectedRow.id).limit(1).get();
		doc.forEach(async (entry) => {
			await deleteDoc(entry.id);
			});
		});
		tableRows.value = tableRows.value.filter(row => !row.selected)

        if(paginatedTableRows.value.length === 0 && currentPage.value > 1) {
            goToPage(currentPage.value - 1)
        }
	} else { 
	    alert('Select a customer that you want to delete!')
	}
};

const updateCustomers = async () => {
	const selectedRows = tableRows.value.filter(row => row.selected);
	
	if(selectedRows.length > 0) {
		selectedRows.forEach(async (selectedRow) => {
			const doc = await collectionRef.value.where('id', '==', selectedRow.id).limit(1).get();
			doc.forEach(async (entry) => {
				const docId = entry.id;
				
				await updateDoc(docId, {
					name: name.value,
                    surname: surname.value,
                    gender: selectedGender.value,
                    phoneNumber: phoneNumber.value,
                    age: age.value,
				});
				tableRows.value.forEach(row => {
                    if(row.selected) {
                        row.selected = false;
                    }
                })
               
			});
		});
		
		
	} else {
        alert('Select a customer that you want to update!')
    }
}

    const getSelectedRowData = (selectedRow) => {
        if(selectedRow.selected) {
            name.value = selectedRow.name;
            surname.value = selectedRow.surname;
            selectedGender.value = selectedRow.gender;
            phoneNumber.value = selectedRow.phoneNumber;
            age.value = selectedRow.age;
        } else {
            name.value = '';
            surname.value = '';
            selectedGender.value = '';
            phoneNumber.value = '';
            age.value = '';
        }
        
    }

    const refreshCustomers = () => {
        fetchDataFromFirebase();

        name.value = '';
        surname.value = '';
        selectedGender.value = '';
        phoneNumber.value = '';
        age.value = '';
    }

    const filteredTableRows = computed(() => {
        const searchCustomer = name.value.toLowerCase() || surname.value.toLowerCase() || phoneNumber.value.toString() 
        || age.value.toString() || selectedGender.value;
        
        return tableRows.value.filter(row => 
        (row.name && row.name.toLowerCase().includes(searchCustomer)) ||
        (row.surname && row.surname.toLowerCase().includes(searchCustomer)) ||
        (row.gender && row.gender.includes(searchCustomer)) ||
        (row.phoneNumber && row.phoneNumber.toString().includes(searchCustomer)) ||
        (row.age && row.age.toString().includes(searchCustomer))
        )
    })

    const searchCustomers = () => {
        tableRows.value = filteredTableRows.value

        name.value = '';
        surname.value = '';
        selectedGender.value = '';
        phoneNumber.value = '';
        age.value = '';
    }

    onMounted(async () => {
        await fetchDataFromFirebase();
    currentPage.value = 1
    });
   
  
      return { name, surname, genders, selectedGender, phoneNumber, age, tableRows, 
        addCustomer, fetchDataFromFirebase, deleteCustomers, updateCustomers, getSelectedRowData, refreshCustomers, searchCustomers,
        rowsPerPage, currentPage, totalPages, paginatedTableRows, goToPage };
    },
}
</script>

<style scoped>
.customers {
    display: grid;

    grid-template-columns: 900px 300px;
    grid-template-rows: 440px 100px;
    gap: 0px 0px;
}
.customers > div {
    display: grid;
    grid-template-areas: 
    "data sidebar"
    "buttons sidebar";
}
input{
    width: 100px; 
    height: 10px;
    text-align: left;
    margin-bottom: 20px;
}

h1 {
    font-size: 72px;
}

label {
    margin-bottom: 20px;
    text-align: left;
}
select{
    margin-top: 20px;
    margin-bottom: 20px;
    color: black;
    
}
option{
    color: black;
}
.form1 {
    max-width: 100px;
    margin-right: 100px;
    padding: 30px;
    padding-bottom: 40px;
}
.form2 {
    margin-top: 25px;
    width: 400px;
    align-items: center;
    margin-left: 50px;
    padding-right: 310px;
    padding-left: 110px;
    padding-top: 5px;
    padding-bottom: 5px;
    
}
.buttons {
    margin-right: 50px;
    margin-left: 50px;
}
.paging {
    margin-top: 5px;
    width: 400px;
    align-items: center;
    margin-left: 100px;
    padding: 3px;
    padding-bottom: 8px;
    padding-right: 235px;
    padding-left: 185px;
   
}
#nextPage {
    padding: 3px 6px;
    cursor: pointer;
}
#prevPage {
    padding: 3px 6px;
    cursor: pointer;
}
span {
    margin: 10px;
}
.sidebar  {
    margin-top: 20px;
    display: flex;
    text-align: left;
    margin-left: 40px;
}

.data {
    margin-right: 20px;
    
}
table {
    height: 400px;
    margin-top: 20px;
    margin-bottom: 0;
    padding: 16px;
    margin-left: 100px;
    width: 820px;
    border-radius: 8px;
    box-shadow: 1px 2px 3px rgba(50,50,50,0.05);
    border: 1px solid var(--secondary);
    background:  rgb(23, 28, 31);
}
th {
    height: 30px;
    font-size: 20px;
    
}
tr {
    
    font-size: 14px;
    text-align: center;
    background-color:#3f4041;
    
}


#cb1 {
  accent-color: #f48b02;
}
  
#th1 {
    background-color: #f48b02;
}
</style>