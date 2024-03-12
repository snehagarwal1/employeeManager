// employeeManager.jssper

let db;
const request = indexedDB.open('employeeManagerDB', 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    let objectStore;
    if (!db.objectStoreNames.contains('employees')) {
        objectStore = db.createObjectStore('employees', {keyPath: 'id', autoIncrement: true});
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

function addEmployee(name = '', job = '', employer = '', salary = '') {
    const transaction = db.transaction(['employees'], 'readwrite');
    const store = transaction.objectStore('employees');
    const employee = {
        name: name || document.getElementById('name').value,
        job: job || document.getElementById('job').value,
        employer: employer || document.getElementById('employer').value,
        salary: salary || document.getElementById('salary').value,
    };
    store.add(employee);

    transaction.oncomplete = function() {
        fetchEmployees();
    };
}

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
            li.textContent = `${employee.id} -${employee.name} - ${employee.job} - ${employee.employer} - ${employee.salary}`;
            employeeList.appendChild(li);
        });

        const end = performance.now();
        document.getElementById('performance').textContent = `employees loaded in ${(end - start).toFixed(2)} milliseconds.`;

        request.onerror = function(event) {
            console.error('Fetch employees error: ', event.target.error);
    };
}
}

function generateRandomEmployees() {
    const start = performance.now();
    const count = document.getElementById('randomCount').value || 1;
    for (let i = 0; i < count; i++) {
        const name = `RandomName ${Math.random().toString(36).substring(7)}`;
        const job = `RandomJob ${Math.random().toString(36).substring(7)}`;
        const employer = `RandomEmployer ${Math.random().toString(36).substring(7)}`;
        const salary = Math.floor(Math.random() * 100000) + 50000;
        addEmployee(name, job, employer, salary);
    }
    const end = performance.now();
        document.getElementById('performance').textContent = `All employees loaded in ${(end - start).toFixed(2)} milliseconds.`;
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
        document.getElementById('performance').textContent = `All employees deleted in ${(end - start).toFixed(2)} milliseconds.`;
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


// Batch retrival of employees in forward direction
// Batch retrival of employees in forward direction
function fetchEmployeesInBatch() {
    const start = performance.now();
    const batchSize = document.getElementById('batchSize').value;
    const transaction = db.transaction(['employees'], 'readonly');
    const store = transaction.objectStore('employees');

    let cursorRequest;
    let records = [];

    // Open a cursor with direction 'prev' to fetch records in reverse order
    cursorRequest = store.openCursor(null, 'next');

    cursorRequest.onsuccess = function(event) {
        const cursor = event.target.result;

        if (cursor && records.length < batchSize) {
            records.push(cursor.value);
            cursor.continue(); // Move to the previous record
        } else {
            // Process the fetched records or do something else with them
            console.log('Fetched Records:', records);

            // Display the fetched records on the webpage
            displayFetchedEmployeeRecords(records);

            // Check if there are more records to fetch
            if (cursor && records.length === batchSize) {
                // If more records available, fetch next batch
                records = [];
                cursor.continue();
            } else {
                // No more records available or fetched enough records
                console.log('No more records to fetch or fetched enough records.');
            }  
        }
        const end = performance.now();
        document.getElementById('performance').textContent = `All employees retrieved in ${(end - start).toFixed(2)} milliseconds.`;
    };

    cursorRequest.onerror = function(event) {
        console.error('Error fetching records:', event.target.error);
    };
}

function displayFetchedEmployeeRecords(records) {
    const employeeList = document.getElementById('employeeList');
    
    // Clear the employee list before populating with new data
    employeeList.innerHTML = '';

    records.forEach(employee => {
        // Create a list item element
        const li = document.createElement('li');

        // Create a text node containing the employee details
        const textNode = document.createTextNode(`${employee.id} - ${employee.name} - ${employee.job} - ${employee.employer} - ${employee.salary}`);

        // Append the text node to the list item
        li.appendChild(textNode);

        // Append the list item to the employee list container
        employeeList.appendChild(li);
    });
}

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
        const recordId = parseInt(text.split('-')[0].trim()); // Assuming record ID is at the beginning of the text
        recordIdsToDelete.push(recordId);
    }

    // Delete records based on the extracted record IDs
    for (const recordId of recordIdsToDelete) {
        store.delete(recordId);
    }

    transaction.oncomplete = function(event) {
        // Update the performance metrics
        const end = performance.now();
        document.getElementById('performance').textContent = `Records deleted in ${(end - start).toFixed(2)} milliseconds.`;

        // Clear the displayed records from the webpage
        employeeList.innerHTML = '';
    };

    transaction.onerror = function(event) {
        console.error('Error deleting records:', event.target.error);
    };
}

// Reverse Direction Batch Retrieval and Deletion
function fetchRecordsInBatch() {
    const start = performance.now();
    const batchSize = document.getElementById('batchSizeReverse').value;
    const transaction = db.transaction(['employees'], 'readonly');
    const store = transaction.objectStore('employees');

    let cursorRequest;
    let records = [];

    // Open a cursor with direction 'prev' to fetch records in reverse order
    cursorRequest = store.openCursor(null, 'prev');

    cursorRequest.onsuccess = function(event) {
        const cursor = event.target.result;

        if (cursor && records.length < batchSize) {
            records.push(cursor.value);
            cursor.continue(); // Move to the previous record
        } else {
            // Process the fetched records or do something else with them.
            console.log('Fetched Records:', records);

            // Display the fetched records on the webpage
            displayFetchedRecords(records);

            // Check if there are more records to fetch
            if (cursor && records.length === batchSize) {
                // If more records available, fetch next batch
                records = [];
                cursor.continue();
            } else {
                // No more records available or fetched enough records
                console.log('No more records to fetch or fetched enough records.');

                const end = performance.now();
                document.getElementById('performance').textContent = `Records deleted in ${(end - start).toFixed(2)} milliseconds.`;
            }
        }
    };

    cursorRequest.onerror = function(event) {
        console.error('Error fetching records:', event.target.error);
    };
}

function displayFetchedRecords(records) {
    const employeeList = document.getElementById('employeeListReverse');
    
    // Clear the employee list before populating with new data
    employeeList.innerHTML = '';

    records.forEach(employee => {
        // Create a list item element
        const li = document.createElement('li');

        // Create a text node containing the employee details
        const textNode = document.createTextNode(`${employee.id} - ${employee.name} - ${employee.job} - ${employee.employer} - ${employee.salary}`);

        // Append the text node to the list item
        li.appendChild(textNode);

        // Append the list item to the employee list container
        employeeList.appendChild(li);
    });
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
        const recordId = parseInt(text.split('-')[0].trim()); // Assuming record ID is at the beginning of the text
        recordIdsToDelete.push(recordId);
    }

    // Delete records based on the extracted record IDs
    for (const recordId of recordIdsToDelete) {
        store.delete(recordId);
    }

    transaction.oncomplete = function(event) {
        // Update the performance metrics
        const end = performance.now();
        document.getElementById('performance').textContent = `Records deleted in ${(end - start).toFixed(2)} milliseconds.`;

        // Clear the displayed records from the webpage
        employeeList.innerHTML = '';
    };

    transaction.onerror = function(event) {
        console.error('Error deleting records:', event.target.error);
    };
}

// Refresh and display records 

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
            const textNode = document.createTextNode(`${employee.id} - ${employee.name} - ${employee.job} - ${employee.employer} - ${employee.salary}`);

            // Append the text node to the list item
            li.appendChild(textNode);

            // Append the list item to the employee list container
            employeeList.appendChild(li);
        });

        const end = performance.now();
        document.getElementById('performance').textContent = `Records refreshed and displayed in ${(end - start).toFixed(2)} milliseconds.`;
    };

    request.onerror = function(event) {
        console.error('Error fetching records:', event.target.error);
    };
}
