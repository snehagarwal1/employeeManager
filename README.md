
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

3. You can use the "delete all Employees" button to delete the DB and start a fresh one. 

4. Refresh button is a no op right now ( it can be removed or modified to clear Employee list).

5. Add the batch size you wish to fetch - All APIs need the batch size to be populated. Only the getAllKeys() API requires the starting key value. This could be reset to null in the code to default to the first record. 

6. The time taken to display the results is displayed along with the size of the record.
