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
        const employeeList = document.getElementById('employeeList');
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
    const count = document.getElementById('randomCount').value || 1;
    for (let i = 0; i < count; i++) {
        const name = `RandomName ${Math.random().toString(36).substring(7)}`;
        const job = `RandomJob ${Math.random().toString(36).substring(7)}`;
        const employer = `RandomEmployer ${Math.random().toString(36).substring(7)}`;
        const salary = Math.floor(Math.random() * 100000) + 50000;
        addEmployee(name, job, employer, salary);
    }
}

function deleteAllEmployees() {
    const transaction = db.transaction(['employees'], 'readwrite');
    const store = transaction.objectStore('employees');
    // Clears all employees from the store.
    store.clear(); 

    transaction.oncomplete = function() {
        console.log('All employees deleted.');
        // Update the UI after deleting all employees.
        fetchEmployees(); 
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

function fetchEmployeesInRange() {
    const minKey = parseInt(document.getElementById('minKey').value);
    const maxKey = parseInt(document.getElementById('maxKey').value);

    const transaction = db.transaction(['employees'], 'readonly');
    const store = transaction.objectStore('employees');
    const request = store.openCursor();

    const employeesInRange = [];

    request.onsuccess = function(event) {
        const cursor = event.target.result;

        if (cursor) {
            const employee = cursor.value;
            const employeeKey = cursor.key;

            if (employeeKey >= minKey && employeeKey <= maxKey) {
                employeesInRange.push(employee);
                fetchEmployees(employeesInRange);

            } else if (employeeKey > maxKey) {
                // We've moved beyond the maxKey, so we can stop the iteration.
                fetchEmployees(employeesInRange);
                return;
                
            } else {

            // Move to the next record.
            cursor.continue();
            }

        } else {
            // Cursor reached the end, process the fetched records.
            fetchEmployees(employeesInRange);
        }

        transaction.oncomplete = function() {
            console.log('Employees in the specified range fetched.');
            // Update the UI after deleting employees in the range.
            fetchEmployees(employeesInRange);
        };
    };
    
    transaction.onerror = function(event) {
        console.error('Transaction error: ', event.target.error);
    };
}

function deleteEmployeesInRange() {
    const minKey = parseInt(document.getElementById('minKey').value);
    const maxKey = parseInt(document.getElementById('maxKey').value);

    const transaction = db.transaction(['employees'], 'readwrite');
    const store = transaction.objectStore('employees');
    const request = store.openCursor();

    request.onsuccess = function(event) {
        const cursor = event.target.result;

        if (cursor) {
            const employeeKey = cursor.key;

            if (employeeKey >= minKey && employeeKey <= maxKey) {
                cursor.delete();
            }

            cursor.continue();
        }
    };

    transaction.oncomplete = function() {
        console.log('Employees in the specified range deleted.');
        // Update the UI after deleting employees in the range.
        fetchEmployees();
    };

    transaction.onerror = function(event) {
        console.error('Transaction error: ', event.target.error);
    };
}

