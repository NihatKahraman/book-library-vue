<template>
    <h1 style="margin-right: 150px;">BOOKS</h1>
    <div class="books" >
        <div class="data" style="display:block;">
            <table >
                <thead>
                    <tr>
                        <th id="th1" style="margin:0px; height: 20px; width: 20px;"></th>
                        <th>Name</th>
                        <th>Writer</th>
                        <th>Genre</th>
                        <th>Page Number</th>
                        <th>Record Date</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in paginatedTableRows" :key="index">
                        <td><input id="cb1" type="checkbox" v-model="row.selected" @change="getSelectedRowData(row)" style="margin:0px; height: 20px; width: 20px;"/></td>
                        <td>{{row.name}}</td>
                        <td>{{row.writer}}</td>
                        <td style="width: 100px;">{{row.genre}}</td>
                        <td style="width: 160px;">{{row.pageNumber}}</td>
                        <td style="width: 160px;">{{row.recordDate}}</td>
                    </tr>
                </tbody>
            </table>
            <form class="paging" style="display: inline-block;">
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
                <label for="Writer">
                    Writer <input type="text" name="Writer" id="writer" required v-model="writer">
                </label>
                <label for="Genre">
                    Genre <select name="genre" id="genre" aria-placeholder="Select a genre" required v-model="selectedGenre">
                    <option v-for="genre in genres" :key="genre" style="cursor: pointer;">{{ genre }}</option>
                    </select>
                </label>
                <label for="PageNumber">
                    Page Number <input type="number" name="number" id="number" maxlength="3" v-model="pageNumber">
                </label>
                <label for="Record Date" style="">
                    Record Date <input type="date" name="Record Date" id="recordDate" style="width: 110px;" v-model="recordDate">
                </label>
            </form>
        </div>
    <div  class="buttons">
        
        <form class="form2" style="display: flex; align-items: center;">
            <button @click="addBook" type="button" style='margin-right:50px; height: 40px; width: 100px; font-size: 18px;'>Add</button>
            <button @click="deleteBooks" type="button" style='margin-right:50px; height: 40px; width: 100px; font-size: 18px;'>Delete</button>
            <button @click="updateBooks" type="button" style='margin-right:50px; height: 40px; width: 100px; font-size: 18px;'>Update</button>
            <button @click="searchBooks" type="button" style='margin-right:50px; height: 40px; width: 100px; font-size: 18px;'>Search</button>
            <button @click="refreshBooks" type="button" style='margin-right:50px; height: 40px; width: 100px; font-size: 18px;'>Refresh</button>
        </form>
    </div>
</div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import getUseCollection from "@/composables/getUseCollection";
import {firestoreRef} from '@/firebase/config'
export default {
    setup() {
     const { collectionRef, addDoc, deleteDoc, updateDoc} = getUseCollection("books");
     const db = firestoreRef;

     
     
      const name = ref("");
      const writer = ref("");
      const genres = ref(["Adventure", "Sci-Fi", "Horror","Comic Book","History","Poetry","Fantasy","Mystery"]);
      const selectedGenre = ref("");
      const pageNumber = ref("");
      const currentDate = new Date().toISOString().split('T')[0];
      const recordDate = ref(currentDate);
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



    const addBook = async () => {
        if(name.value && writer.value && selectedGenre.value && pageNumber.value && recordDate.value) { 
            const newBook = {
                name: name.value,
                writer: writer.value,
                genre: selectedGenre.value,
                pageNumber: pageNumber.value,
                recordDate: recordDate.value,
                id: Math.floor(Math.random() * 1000000),
    };
                
            await addDoc(newBook);
            tableRows.value.push(newBook);
            
            name.value = '';
            writer.value = '';
            selectedGenre.value = '';
            pageNumber.value = '';
            recordDate.value = currentDate; 

        } else {
            alert('Please fill in all fields');
        }
    }     

    const fetchDataFromFirebase = async () => {
        try {
            const books = await db.collection('books').orderBy('name').get();

            tableRows.value = books.docs.map(doc => doc.data());
        } catch (error) {
            console.error('Error fetching data from the Firebase:', error)
        }
    }

    const deleteBooks = () => {
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
            alert('Select a book that you want to delete!')
        }
    };
        
    const updateBooks = async () => {
        const selectedRows = tableRows.value.filter(row => row.selected);
        
        if(selectedRows.length > 0) {
            
            if(!(name.value && writer.value && selectedGenre.value && pageNumber.value && recordDate.value)) {
                alert('Please fill in all fields');
            } else {
                selectedRows.forEach(async (selectedRow) => {
                const doc = await collectionRef.value.where('id', '==', selectedRow.id).limit(1).get();
                doc.forEach(async (entry) => {
                    const docId = entry.id;
                    
                    await updateDoc(docId, {
                        name: name.value,
                        writer: writer.value,
                        genre: selectedGenre.value,
                        pageNumber: pageNumber.value,
                        recordDate: recordDate.value,
                    });
                    tableRows.value.forEach(row => {
                        if(row.selected) {
                            row.selected = false;
                        }
                    })
                
                });
            });
            
            }
            
        } else {
            alert('Select a book that you want to update!')
        }
    }

    const getSelectedRowData = (selectedRow) => {
        if(selectedRow.selected) {
            name.value = selectedRow.name;
            writer.value = selectedRow.writer;
            selectedGenre.value = selectedRow.genre;
            pageNumber.value = selectedRow.pageNumber;
            recordDate.value = selectedRow.recordDate;
        } else {
            name.value = '';
            writer.value = '';
            selectedGenre.value = '';
            pageNumber.value = '';
            recordDate.value = currentDate;
        }
        
    }

    
    const filteredTableRows = computed(() => {
        const searchBook = name.value.toLowerCase() || writer.value.toLowerCase() || selectedGenre.value.toLowerCase() 
        || pageNumber.value.toString() || recordDate.value;

        return tableRows.value.filter(row => 
        (row.name && row.name.toLowerCase().includes(searchBook)) ||
        (row.writer && row.writer.toLowerCase().includes(searchBook)) ||
        (row.genre && row.genre.toLowerCase().includes(searchBook)) ||
        (row.pageNumber && row.pageNumber.toString().includes(searchBook)) ||
        (row.recordDate && row.recordDate.toLowerCase().includes(searchBook))
        )
    })

    const searchBooks = () => {
        tableRows.value = filteredTableRows.value

        name.value = '';
        writer.value = '';
        selectedGenre.value = '';
        pageNumber.value = '';
        recordDate.value = currentDate;
    }

    const refreshBooks = () => {
        fetchDataFromFirebase();

        name.value = '';
        writer.value = '';
        selectedGenre.value = '';
        pageNumber.value = '';
        recordDate.value = currentDate;
    }

    onMounted( async () => {
        await fetchDataFromFirebase();
        
        currentPage.value = 1
    });

    return { name, writer, genres, selectedGenre, tableRows, pageNumber, recordDate, currentDate,
    addBook, fetchDataFromFirebase, deleteBooks, updateBooks, getSelectedRowData, refreshBooks, searchBooks, filteredTableRows,
    rowsPerPage, currentPage, totalPages, paginatedTableRows, goToPage,
    };

    },
};
</script>

<style scoped>
.books {
    display: grid;

    grid-template-columns: 900px 350px;
    grid-template-rows: 440px 100px;
    gap: 0px 0px;
}
.books > div {
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
    height: 100px;
    margin-top: 20px;
    margin-bottom: 20px;
    color: black;
    width: 100%;
    box-sizing: border-box;
}
option{
    color: black;
}
.form1 {
    max-width: 100px;
    margin-right: 110px;
    padding: 30px;
    padding-top: 20px;
    padding-bottom: 28px;

}
.form2 {
    margin-top: 23px;
    width: 400px;
    align-items: center;
    margin-left: 50px;
    padding-right: 310px;
    padding-left: 110px;
    padding-top: 5px;
    padding-bottom: 5px;
    
}
.buttons {
    margin-top: 5px;
    margin-left: 50px;
}
.paging {
    margin-top: 5px;
    width: 400px;
    margin-left: 100px;
    padding: 3px;
    padding-bottom: 8px;
    padding-right: 235px;
    padding-left: 185px;
   
}
#nextPage {
    padding: 3px 6px;
    cursor: pointer;
    display: inline-block;
}
#prevPage {
    padding: 3px 6px;
    cursor: pointer;
    display: inline-block;
}
span {
    margin: 10px;
}
.sidebar  {
    margin-top: 20px;
    display: flex;
    text-align: left;
}

.data {
    
    margin-bottom: 100px;
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
    padding-bottom: 20px;
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