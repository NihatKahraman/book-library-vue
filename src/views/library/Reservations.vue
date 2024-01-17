<template>
    <h1 style="margin-right: 150px;">RESERVATIONS</h1>
    <div class="reservations">
        <div class="data" style="display:block;">
            <table>
                <thead>
                    <tr>
                        <th id="th1" style="margin:0px; height: 20px; width: 20px;"></th>
                        <th>Book</th>
                        <th>Customer</th>
                        <th>Borrow Date</th>
                        <th>Borrow End Date</th>
                    </tr>
                </thead>
                    <tbody>
                        <tr v-for="(row, index) in paginatedTableRows" :key="index"> 
                            <td><input id="cb1" type="checkbox" v-model="row.selected" @change="getSelectedRowData(row)"  style="margin:0px; height: 20px; width: 20px;"/></td>
                            <td>{{row.book}}</td>
                            <td>{{row.customer}}</td>
                            <td>{{row.borrowDate}}</td>
                            <td>{{row.borrowEndDate}}</td>
                        </tr>
                    </tbody>
            </table>
            <form class="paging">
                <button id="prevPage" type="button"  @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">Previous</button>
                    <span style="font-size: 11px; "> {{ currentPage }} / {{ totalPages }}</span>
                <button id="nextPage" type="button" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">Next</button>
            </form>
        </div>
        <div class="sidebar" style="text-align: left;">
            <form class="form1">
                <label for="book">
                    Book <select name="book" id="book" aria-placeholder="Select a book" 
                    style="margin-right:50px; margin-bottom: 30px; margin-top: 10px; width: 100px; cursor: pointer;" v-model="selectedBook">
                        <option v-for="book in books" :key="book" style="cursor: pointer;">{{ book }}</option>
                    </select>
                </label>
                <label for="customer">
                    Customer <select name="customer" id="customer" aria-placeholder="Select a customer" 
                    style="margin-right:50px; margin-bottom: 30px; margin-top: 10px; width: 100px; cursor: pointer;" v-model="selectedCustomer">
                        <option v-for="customer in customers" :key="customer" style="cursor: pointer;">{{ customer }}</option>
                    </select>
                </label>
                <label for="Borrow Date" style="margin-bottom: 50px;">
                    Borrow Date <input type="date" name="BorrowDate" id="borrowDate" style="cursor: pointer;" v-model="borrowDate">
                </label>
                <label for="Borrow End Date" style="margin-bottom: 50px;">
                    Borrow End Date <input type="date" name="BorrowEndDate" id="borrowEndDate" style="cursor: pointer;" v-model="borrowEndDate">
                </label>
            </form>
        </div>
        <div class="buttons">
            <form class="form2" style="display: flex; align-items: left;">
                <button @click="addReservation" type="button" style='margin-right:50px; margin-left:25px; height: 40px; width: 100px; font-size: 18px; '>Add</button>
                <button @click="deleteReservation" type="button" style='margin-right:50px; height: 40px; width: 100px; font-size: 18px; '>Delete</button>
                <button @click="updateReservation" type="button" style='margin-right:50px; height: 40px; width: 100px; font-size: 18px; '>Update</button>
                <button @click="searchReservation" type="button" style='margin-right:50px; height: 40px; width: 100px; font-size: 18px; '>Search</button>
                <button @click="refreshReservation" type="button" style='margin-right:50px; height: 40px; width: 100px; font-size: 18px;'>Refresh</button>
            </form>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import getUseCollection from "@/composables/getUseCollection";
import {firestoreRef} from '@/firebase/config'
import Books from '@/views/library/Books.vue';
import Customers from '@/views/library/Customers.vue';
export default {
    setup() {
     const { collectionRef, addDoc, deleteDoc, updateDoc } = getUseCollection("reservations");
     const db = firestoreRef;

      const books = ref(["White Fang", "1984"]);
      const selectedBook = ref("")
      const customers = ref(["Nihat", "Cenk"]);
      const selectedCustomer = ref("")
      const currentDate = new Date().toISOString().split('T')[0];
      const borrowDate = ref(currentDate);
      const borrowEndDate = ref(currentDate);
      const tableRows = ref([]);

      const rowsPerPage = 1;
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



      const addReservation = async () => {
        if(selectedBook.value && selectedCustomer.value && borrowDate.value && borrowEndDate.value){
        const newReservation = {
          book: selectedBook.value,
          customer: selectedCustomer.value,
          borrowDate: borrowDate.value,
          borrowEndDate: borrowEndDate.value,
          id: Math.floor(Math.random() * 1000000),
        };
        await addDoc(newReservation)

        tableRows.value.push(newReservation);
        
        } else {
            alert('Please fill in all fields');
        }
    };  

    const fetchDataFromFirebase = async () => {
        try {
            const reservations = await db.collection('reservations').get();

            tableRows.value = reservations.docs.map(doc => doc.data());
        } catch (error) {
            console.error('Error fetching data from the Firebase:', error)
        }
    }

    const deleteReservation = () => {
	    const selectedRows = tableRows.value.filter(row => row.selected)
	
	if(selectedRows.length > 0) {
		selectedRows.forEach(async (selectedRow) => {
		const doc = await collectionRef.value.where('book', '==', selectedRow.book).limit(1).get();
		doc.forEach(async (entry) => {
			await deleteDoc(entry.id);
			});
		});
		tableRows.value = tableRows.value.filter(row => !row.selected)

        if(paginatedTableRows.value.length === 0 && currentPage.value > 1) {
            goToPage(currentPage.value - 1)
        }
	} else { 
	    alert('Select a book that you want to delete!')
	}
};

const updateReservation = async () => {
	const selectedRows = tableRows.value.filter(row => row.selected);
	
	if(selectedRows.length > 0) {
		selectedRows.forEach(async (selectedRow) => {
			const doc = await collectionRef.value.where('id', '==', selectedRow.id).limit(1).get();
			doc.forEach(async (entry) => {
				const docId = entry.id;
				
				await updateDoc(docId, {
					book: selectedBook.value,
                    customer: selectedCustomer.value,
                    borrowDate: borrowDate.value,
                    borrowEndDate: borrowEndDate.value,
				});
				tableRows.value.forEach(row => {
                    if(row.selected) {
                        row.selected = false;
                    }
                })
               
			});
		});
		
		
	} else {
        alert('Select a book that you want to update!')
    }
}
    const checkDate = () => {
        if (borrowDate.value > borrowEndDate.value)
    {
        alert("Borrow Date can not be greater than Borrow End Date!");
        borrowDate.value = borrowEndDate.value;
    }
}
       

    const getSelectedRowData = (selectedRow) => {
        if(selectedRow.selected) {
            selectedBook.value = selectedRow.book;
            selectedCustomer.value = selectedRow.customer;
            borrowDate.value = selectedRow.borrowDate;
            borrowEndDate.value = selectedRow.borrowEndDate;
        } else {
            selectedBook.value = '';
            selectedCustomer.value = '';
            borrowDate.value = currentDate;
            borrowEndDate.value = currentDate;
        }
        
    }

    const refreshReservation = () => {
        fetchDataFromFirebase();

        selectedBook.value = '';
        selectedCustomer.value = '';
        borrowDate.value = currentDate;
        borrowEndDate.value = currentDate;
    }

    const filteredTableRows = computed(() => {
        const searchQuery = selectedBook.value.toLowerCase() || selectedCustomer.value.toLowerCase() 
        || borrowDate.value.toString() || borrowEndDate.value.toString();
        
        return tableRows.value.filter(row => 
        (row.book && row.book.toLowerCase().includes(searchQuery)) ||
        (row.customer && row.customer.toLowerCase().includes(searchQuery)) ||
        (row.borrowDate && row.borrowDate.includes(searchQuery)) ||
        (row.borrowEndDate && row.borrowEndDate.toString().includes(searchQuery))
        )
    })

    const searchReservation = () => {
        tableRows.value = filteredTableRows.value

        selectedBook.value = '';
        selectedCustomer.value = '';
        borrowDate.value = '';
        borrowEndDate.value = '';
    }

    onMounted(fetchDataFromFirebase);
  
      return { books, selectedBook, customers, selectedCustomer, currentDate, borrowDate, borrowEndDate, tableRows,
         addReservation, fetchDataFromFirebase, deleteReservation, updateReservation, getSelectedRowData, refreshReservation, checkDate, searchReservation,
         rowsPerPage, currentPage, totalPages, paginatedTableRows, goToPage };
    },
}
</script>

<style scoped>
.reservations {
    display: grid;

    grid-template-columns: 900px 300px;
    grid-template-rows: 440px 100px;
    gap: 0px 0px;
}
.reservations > div {
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
    position: left;
    color: black;
    
}
option{
    color: black;
}
.form1 {
    height: 400px;
    max-width: 100px;
    margin-right: 100px;
    padding: 30px;
    padding-top: 60px;
    padding-bottom: 45px;
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
.columns {
    text-decoration: none;
}
.buttons {
    padding-right: 250px;
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
    margin-bottom: 0;
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
    padding-bottom: 50px;
}
th {
    height: 30px;
    font-size: 20px;
}
tr {
    
    font-size: 14px;
    text-align: center;
    background-color:#3f4041;
    min-width: 20px;
    box-sizing: border-box;
}
td {
    
    min-width: 20px;
    box-sizing: border-box;
}
.cells  {
    text-align: left;
}

#cb1 {
  accent-color: #f48b02;
}
#th1 {
    background-color: #f48b02;
}

</style>