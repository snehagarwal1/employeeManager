// employeeManager.jssper

let db;
const request = indexedDB.open('employeeManagerDB', 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    let objectStore;
    if (!db.objectStoreNames.contains('employees')) {
        objectStore = db.createObjectStore('employees', {keyPath: 'id', 
        autoIncrement: true});
    } else {
        objectStore = request.transaction.objectStore('employees');
    }
    objectStore.createIndex('name', 'name', {unique: false});
    objectStore.createIndex('job', 'job', {unique: false});
    objectStore.createIndex('employer', 'employer', {unique: false});
    objectStore.createIndex('salary', 'salary', {unique: false});
};

request.onsuccess = function(event) {
    db = event.target.result;
    fetchEmployees();
};

request.onerror = function(event) {
    console.error('Database error: ', event.target.error);
};

function fetchEmployees() {
    const start = performance.now();
    const transaction = db.transaction(['employees'], 'readonly');
    const store = transaction.objectStore('employees');
    const request = store.getAll();

    request.onsuccess = function(event) {
        const employees = event.target.result;
        const employeeList = document.getElementById('allEmployees');
        // Clear the employee list before populating with new data
        employeeList.innerHTML = '';
        employees.forEach(employee => {
            const li = document.createElement('li');
            li.textContent = `${employee.id} -${employee.name} - 
            ${employee.job} - ${employee.employer} - ${employee.salary}`;
            employeeList.appendChild(li);
        });

        const end = performance.now();
        document.getElementById('performance').textContent = `employees loaded 
        in ${(end - start).toFixed(2)} milliseconds.`;

        request.onerror = function(event) {
            console.error('Fetch employees error: ', event.target.error);
    };
}
}

function generateRandomData(sizeInBytes) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomData = '';
    
    for (let i = 0; i < sizeInBytes; i++) {
        randomData += characters.charAt(Math.floor(Math.random() * 
        characters.length));
    }
    
    return randomData;
}

// Function to add records to the database based on user input of size in kb/ record and record number.
function addRandomEmployees() {
    const start = performance.now();
    const transaction = db.transaction(['employees'], 'readwrite');
    const objectStore = transaction.objectStore('employees');

    const randomCount = parseInt(document.getElementById('randomCount').value) 
    || 1;
    let recordSize = parseInt(document.getElementById('recordSize').value);
    // convert user input to KB
    recordSize = recordSize * 1024; // KB to bytes
    let totalRecordSize = 0;

    // Get the progress bar element
    const progressBar = document.getElementById('progressBar');

    for (let i = 0; i < randomCount; i++) {
        const randomData = generateRandomData(recordSize);
        const employee = {
            name: 'Random Name',
            job: 'Random Job',
            employer: 'Random Employer',
            salary: 50000, // Random salary or any default value
            data: randomData // This makes up for the record size input by the user.
        };
        objectStore.add(employee);
        totalRecordSize += recordSize; // Add the size of the current record to the total

        // Calculate total size in MB after transaction completes
        const totalRecordSizeMB = totalRecordSize / (1024 * 1024); // convert to MB
        document.getElementById('totalRecordSize').textContent = `Total size 
        of the DB using ${recordSize / 1024} KB per record is: 
        ${totalRecordSizeMB.toFixed(2)} MB`;
    }

    transaction.oncomplete = function() {
        console.log('Records added successfully.');
        console.log(`${randomCount} records added successfully.`);
        console.log(`Total database size: ${totalRecordSize * randomCount} bytes`);
        fetchEmployees();
    };

    const end = performance.now();
    document.getElementById('performance').textContent = `employees loaded 
    in ${(end - start).toFixed(2)} milliseconds.`;

    transaction.onerror = function(event) {
        console.error('Error adding records:', event.target.error);
    };
}

function clearPerformanceAndSizeData() {
    const performance= document.getElementById('performance');
    performance.innerHTML = ''; // Clear the performance list
    console.log('performance cleared.');

    const totalRecordSize= document.getElementById('totalRecordSize');
    totalRecordSize.innerHTML = ''; // Clear the totalRecordSize list
    console.log('totalRecordSize cleared.');
}

function deleteAllEmployees() {
    const start = performance.now();
    const transaction = db.transaction(['employees'], 'readwrite');
    const store = transaction.objectStore('employees');
    // Clears all employees from the store.
    store.clear(); 

    transaction.oncomplete = function() {
        console.log('All employees deleted.');
        // Update the UI after deleting all employees.
        fetchEmployees(); 

        const end = performance.now();
        document.getElementById('performance').textContent = `All employees 
        deleted in ${(end - start).toFixed(2)} milliseconds.`;
    };

    transaction.onerror = function(event) {
        console.error('Transaction error: ', event.target.error);
    };
}

function clearEmployeeList() {
    const employeeList = document.getElementById('employeeList');
    employeeList.innerHTML = ''; // Clear the employee list
    console.log('Employee list cleared.');
}

//-------GetAll() API for Batch retriving records in forward direction ----------
let keyRange = null;

function fetchMore(batchSize) {
    const records = event.target.result;
      if (records && records.length === batchSize) {
        keyRange = IDBKeyRange.lowerBound(records.at(-1).id, true);
        fetchEmployeesInBatch();
    }
};

function fetchEmployeesInBatch() {
    const start = performance.now();
    const batchSize = parseInt(document.getElementById('batchSize').value);
    const transaction = db.transaction(['employees'], 'readonly');
    const store = transaction.objectStore('employees');
    store.getAll(keyRange, batchSize).onsuccess = e => {
    const records = e.target.result;
    displayFetchedEmployeeRecords(records);
    fetchMore(batchSize);

    const end = performance.now();
    document.getElementById('performance').textContent = `Employees fetched
        in ${(end - start).toFixed(2)} milliseconds.`;
    }
}

function displayFetchedEmployeeRecords(employees) {
    const employeeList = document.getElementById('employeeList');
  
    employees.forEach(employee => {
      // Create a list item element
      const li = document.createElement('li');
  
      // Create a text node containing the employee details
      li.textContent = `${employee.id} -${employee.name} - ${employee.job} - ${employee.employer}`;
      employeeList.appendChild(li);
    });
  
    const li = document.createElement('li');
    li.textContent = "------------------ Batch End ------------------";;
  
    // Append the list item to the employee list container
    employeeList.appendChild(li);
}

// --------GetAllKeys() API fetch keys in forward direction in batch------------------
let keys, values = null;
let keyRange2 = null;

function triggerFetchEmployeesByKeysInBatch() {
    const keyStart = parseInt(document.getElementById('keyStart').value);
    keyRangeInitial = IDBKeyRange.lowerBound(keyStart, false);
    fetchEmployeesByKeysInBatch(keyRangeInitial);
}

function fetchMoreByKeys(batchSize) {
  // If there could be more results, fetch them
  if (keys && values && values.length === batchSize) {

    displayFetchedEmployeeByKeysRecords(values);
    // Find keys greater than the last key
    keyRange2 = IDBKeyRange.lowerBound(keys.at(-1), true);
    keys = values = undefined; // reset keys and values for next batch
    fetchEmployeesByKeysInBatch(keyRange2);
  }
}
 
function fetchEmployeesByKeysInBatch(keyRangeForBatch) {
    const start = performance.now();
    let batchSize = parseInt(document.getElementById('batchSize').value);
    
    const transaction = db.transaction(['employees'], 'readonly');
    const store = transaction.objectStore('employees');
    
    store.getAllKeys(keyRangeForBatch, batchSize).onsuccess = e => {
        keys = e.target.result;
        fetchMoreByKeys(batchSize);
  }
  // gets the records/values associated with the keys.
  store.getAll(keyRangeForBatch, batchSize).onsuccess = e => {
    values = e.target.result;
    fetchMoreByKeys(batchSize);

    const end = performance.now();
    document.getElementById('performance').textContent = `Employees fetched
        in ${(end - start).toFixed(2)} milliseconds.`;
  }
}

function displayFetchedEmployeeByKeysRecords(employees) {
    const employeeList = document.getElementById('employeeList');
    
    employees.forEach(employee => {
      // Create a list item element
      const li = document.createElement('li');
  
      // Create a text node containing the employee details
      const text = document.createTextNode(`${employee.id} - ${employee.name} - ${employee.job} - ${employee.employer}`);
      li.appendChild(text);
  
      // Append the list item to the employee list container
      employeeList.appendChild(li);
    });
  
    // Add batch end separator
    const batchEnd = document.createElement('li');
    batchEnd.textContent = "------------------ Batch End ------------------";
    employeeList.appendChild(batchEnd);
  }

//---------deleted employee records ------------------------------------------
function deleteEmployeeRecordsInBatch() {
    const start = performance.now();
    const batchSize = parseInt(document.getElementById('batchSize').value);
    const transaction = db.transaction(['employees'], 'readwrite');
    const store = transaction.objectStore('employees');

    const employeeList = document.getElementById('employeeList');
    const listItems = employeeList.getElementsByTagName('li');
    const recordIdsToDelete = [];

    // Extract record IDs from the displayed list items
    for (let i = 0; i < listItems.length; i++) {
        const text = listItems[i].textContent.trim();
        const recordId = parseInt(text.split('-')[0].trim());
        recordIdsToDelete.push(recordId);
    }

    // Delete records based on the extracted record IDs
    for (const recordId of recordIdsToDelete) {
        store.delete(recordId);
    }

    transaction.oncomplete = function(event) {
        // Update the performance metrics
        const end = performance.now();
        document.getElementById('performance').textContent = `Records deleted 
        in ${(end - start).toFixed(2)} milliseconds.`;

        // Clear the displayed records from the webpage
        employeeList.innerHTML = '';
    };

    transaction.onerror = function(event) {
        console.error('Error deleting records:', event.target.error);
    };
}

//-----USE openCursor() API to fetch records in batch in reverse ------------

let keyRangeReverse = null;

function fetchRecordsInBatchReverse() {
    const start = performance.now();
    const batchSize = parseInt(document.getElementById('batchSizeReverse').value);
    const transaction = db.transaction(['employees'], 'readonly');
    const store = transaction.objectStore('employees');

    let cursorRequest;
    let records = [];
    // Open a cursor with direction 'prev' to fetch records in reverse order
    cursorRequest = store.openCursor(keyRangeReverse, 'prev');

    cursorRequest.onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor && records.length < batchSize) {
            records.push(cursor.value);
            cursor.continue(); // Move to the previous record
        } else {
            // Display fetched records
            displayFetchedRecords(records);

            if (cursor) {
                // Update keyRangeReverse for the next batch
                keyRangeReverse = IDBKeyRange.upperBound(records.at(-1).id, true);
                // Fetch more records
                fetchRecordsInBatchReverse();
            } else {
                // No more records to fetch
                console.log('All records fetched in reverse order.');

                const end = performance.now();
                document.getElementById('performance').textContent = `Records 
                fetched in ${(end - start).toFixed(2)} milliseconds.`;
            }
        }
    };
}

function displayFetchedRecords(employees) {
    const employeeList = document.getElementById('employeeListReverse');
    employees.forEach(employee => {
        const li = document.createElement('li');
        li.textContent = `${employee.id} - ${employee.name} - ${employee.job} - ${employee.employer}`;
        employeeList.appendChild(li);
    });
    const li = document.createElement('li');
    li.textContent = "------------------ Batch End ------------------";;
    employeeList.appendChild(li);
}

function deleteRecordsInBatch() {
    const start = performance.now();
    const batchSize = parseInt(document.getElementById('batchSize').value);
    const transaction = db.transaction(['employees'], 'readwrite');
    const store = transaction.objectStore('employees');

    const employeeList = document.getElementById('employeeListReverse');
    const listItems = employeeList.getElementsByTagName('li');
    const recordIdsToDelete = [];

    // Extract record IDs from the displayed list items
    for (let i = 0; i < listItems.length; i++) {
        const text = listItems[i].textContent.trim();
        const recordId = parseInt(text.split('-')[0].trim());
        recordIdsToDelete.push(recordId);
    }

    // Delete records based on the extracted record IDs
    for (const recordId of recordIdsToDelete) {
        store.delete(recordId);
    }

    transaction.oncomplete = function(event) {
        // Update the performance metrics
        const end = performance.now();
        document.getElementById('performance').textContent = `Records deleted 
        in ${(end - start).toFixed(2)} milliseconds.`;

        // Clear the displayed records from the webpage
        employeeList.innerHTML = '';
    };

    transaction.onerror = function(event) {
        console.error('Error deleting records:', event.target.error);
    };
}

function clearEmployeeListReverse() {
    const employeeList = document.getElementById('employeeListReverse');
    employeeList.innerHTML = ''; // Clear the employee list
    console.log('Employee list cleared.');
}


//-----------Refresh and display all records.-----------------------------------
function refreshAndDisplayRecords() {
    const start = performance.now();
    const transaction = db.transaction(['employees'], 'readonly');
    const store = transaction.objectStore('employees');
    const request = store.getAll();

    request.onsuccess = function(event) {
        const employees = event.target.result;
        const employeeList = document.getElementById('allEmployees');
        
        // Clear the employee list before populating with new data
        employeeList.innerHTML = '';

        employees.forEach(employee => {
            // Create a list item element
            const li = document.createElement('li');

            // Create a text node containing the employee details
            const textNode = document.createTextNode(`${employee.id} - 
            ${employee.name} - ${employee.job} - ${employee.employer} - 
            ${employee.salary}`);

            // Append the text node to the list item
            li.appendChild(textNode);

            // Append the list item to the employee list container
            employeeList.appendChild(li);
        });

        const end = performance.now();
        document.getElementById('performance').textContent = `Records refreshed
         and displayed in ${(end - start).toFixed(2)} milliseconds.`;
    };

    request.onerror = function(event) {
        console.error('Error fetching records:', event.target.error);
    };
}

//---------Use openKeyCursor() API Used for iterating through the keys of 
// an object store with a cursor.---------------------------------------------

function fetchRecordsInBatchByKeysReverse() {
    const start = performance.now();
    const batchSize = parseInt(document.getElementById('batchSizeReverse').value);
    const keyStartReverse = parseInt(document.getElementById('keyStartReverse').value);
    const transaction = db.transaction(['employees'], 'readonly');
    const store = transaction.objectStore('employees');

    let cursorRequest;
    
    let keys = [];
    // Define the key range for the cursor
    const keyRange = IDBKeyRange.upperBound(keyStartReverse, false);

    // Open a cursor with direction 'prev' to fetch records in reverse order
    cursorRequest = store.openKeyCursor(keyRange, 'prev');

    cursorRequest.onsuccess = function(event) {

        const cursor = event.target.result;

        if (cursor) {
            if (keys.length < batchSize) {
                keys.push(cursor.key);
            } else {
                fetchAndDisplayRecordsByKeys(keys);
                keys = [];
            }
            cursor.continue(); // Move to the previous key
        } else {
            // No more records to fetch
            console.log('All records fetched in reverse order.');

            const end = performance.now();
            document.getElementById('performance').textContent = `Records 
            fetched in ${(end - start).toFixed(2)} milliseconds.`;
        }
    };
}

function fetchAndDisplayRecordsByKeys(keysBatch) {

    const transaction = db.transaction(['employees'], 'readonly');
    const store = transaction.objectStore('employees');
    let last = keysBatch[0];
    let first = keysBatch[keysBatch.length -1];
    let batchKeyRange = IDBKeyRange.bound(first, last);
    store.getAll(batchKeyRange).onsuccess = function(event){
        let values = event.target.result;
        displayFetchedReverseRecordsByKeys(values);
    }	
}

function displayFetchedReverseRecordsByKeys(employees) {
    const employeeList = document.getElementById('employeeListReverse');
    employees.forEach(employee => {
        const li = document.createElement('li');
        li.textContent = `${employee.id} - ${employee.name} - ${employee.job} - ${employee.employer}`;
        employeeList.appendChild(li);
    });
    const li = document.createElement('li');
    li.textContent = "------------------ Batch End ------------------";;
    employeeList.appendChild(li);
}

//-------------------------------NEW API---------------------------------------
// Forward direction with GetAllEntries() - takes only BatchSize as input
let keyRange4 = null;

function fetchMoreWithNewApi(batchSize) {
    const records = event.target.result;
      if (records && records.length === batchSize) {
        keyRange4 = IDBKeyRange.lowerBound(records.at(-1).key, true);
        fetchEmployeesInBatchWithNewApi();
    }
};

function fetchEmployeesInBatchWithNewApi() {
    const start = performance.now();
    const batchSize = parseInt(document.getElementById('batchSize').value);
    const keyStart = parseInt(document.getElementById('keyStart').value);
    const transaction = db.transaction(['employees'], 'readonly');
    const store = transaction.objectStore('employees');
    store.getAllEntries(keyRange4, batchSize, 'next').onsuccess = e => {
        const records = e.target.result;
        console.log(records);
        fetchMoreWithNewApi(batchSize);

        const end = performance.now();
        document.getElementById('performance').textContent = `Employees fetched
            in ${(end - start).toFixed(2)} milliseconds.`;

        displayEmployeeKeyRecords(records);
    }
}

function displayEmployeeKeyRecords(employees) {
    const employeeList = document.getElementById('employeeList');
  
    employees.forEach(employee => {
      // Create a list item element
      const li = document.createElement('li');
  
      // Create a text node containing the employee details
      li.textContent = `${employee.key} - ${employee.value.name} - ${employee.value.job} - ${employee.value.employer}`;
      console.log(employee.value.name);
      employeeList.appendChild(li);
    });
  
    const li = document.createElement('li');
    li.textContent = "------------------ Batch End ------------------";;
  
    // Append the list item to the employee list container
    employeeList.appendChild(li);
}

// USe GetAllEntries in Reverse dir to fetch all data, takes only batch size as input from the user. 

let keyRange5 = null;

function fetchMoreInReverseWithNewApi(batchSize) {
    const records = event.target.result;
      if (records && records.length === batchSize) {
        keyRange5 = IDBKeyRange.upperBound(records.at(-1).key, true);
        fetchRecordsInBatchWithNewApi();
    }
};

function fetchRecordsInBatchWithNewApi() {
    const start = performance.now();
    const batchSize = parseInt(document.getElementById('batchSizeReverse').value);
    const transaction = db.transaction(['employees'], 'readonly');
    const store = transaction.objectStore('employees');
    store.getAllEntries(keyRange5, batchSize, 'prev').onsuccess = e => {
        const records = e.target.result;
        console.log(records);
        fetchMoreInReverseWithNewApi(batchSize);

        const end = performance.now();
        document.getElementById('performance').textContent = `Employees fetched
            in ${(end - start).toFixed(2)} milliseconds.`;

        displayEmployeeKeyRecordsinReverse(records);
    }
}

function displayEmployeeKeyRecordsinReverse(employees) {
    const employeeList = document.getElementById('employeeListReverse');
  
    employees.forEach(employee => {
      // Create a list item element
      const li = document.createElement('li');
  
      // Create a text node containing the employee details
      li.textContent = `${employee.key} - ${employee.value.name} - ${employee.value.job} - ${employee.value.employer}`;
      console.log(employee.value.name);
      employeeList.appendChild(li);
    });
  
    const li = document.createElement('li');
    li.textContent = "------------------ Batch End ------------------";;
  
    // Append the list item to the employee list container
    employeeList.appendChild(li);
}
