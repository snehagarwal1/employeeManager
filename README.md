
The goal of the demo is to test the performance (measured in time)  of the old and new APIs when the UI thread is NOT busy.  
We want to determine the performance of the old APIs against the new one (getAllEntries()) 

The APIs used to fetch the records from the indexDB in the forward direction are
	1. getAll() 
	2. getAllKeys()
	3. getAllEntries()

The APIs used to fetch the records from the indexDB in the reverse direction are
	1. openCursor()
	2. openKeyCursor()
	3. getAllEntries() 

HOW TO USE THE DEMO

1. Before beginning any fetching of records we need to first create the DB. Use the form provided to add the total
   number of employees/ records and the size of each record in kb. Select "Add Random Employees" .
   This should initialize the IDB.
   <img width="798" alt="Screenshot 2024-03-29 at 3 40 27 PM" src="https://github.com/snehagarwal1/employeeManager/assets/103469166/894b9ef4-bdb8-45f1-9204-e25a6c831b69">


3. You can use the "delete all Employees" button to delete the DB and start a fresh one. 

4. Refresh button is a no op right now ( it can be removed or modified to clear Employee list).

5. Add the batch size you wish to fetch - All APIs need the batch size to be populated. Only the getAllKeys() API requires the starting key value.
   This could be reset to null in the code to default to the first record.
   <img width="1451" alt="Screenshot 2024-03-29 at 3 40 18 PM" src="https://github.com/snehagarwal1/employeeManager/assets/103469166/edcb2044-fcdc-4b51-a9b5-4adae3ae6c25">


7. The time taken to display the results is displayed along with the size of the record. This needs to be adjusted to show the time required to only process the batches and not include the
   time taken to also display them. 
   <img width="500" alt="Screenshot 2024-03-29 at 3 40 08 PM" src="https://github.com/snehagarwal1/employeeManager/assets/103469166/5a6685fe-e7e7-4b2e-aadb-2b1c73b112dd">

