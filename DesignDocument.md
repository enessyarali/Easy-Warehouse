# Design Document 


Authors: Ilaria Pilo, Marco Sacchet, Luca Scibetta, Enes Yarali

Date: 27 April 2022

Version: 1.7


# Contents

- [High level design](#package-diagram)
- [Low level design](#class-diagram)
- [Verification traceability matrix](#verification-traceability-matrix)
- [Verification sequence diagrams](#verification-sequence-diagrams)

# Instructions

The design must satisfy the Official Requirements document, notably functional and non functional requirements, and be consistent with the APIs.

# High level design 

For our design, we have adopted a layered, model-view architectural style.  
In particular, we have a front end, taking care of the presentational aspect, which interacts with a back end, managing the application logic and data.  
The back end is then further logically split into two parts, one taking care of the model and its logic, and another one which is used as an interface with the database. 

## Package diagram

![Package diagram](./Design-diagrams/package-diagram.png "Package diagram")

## Front End
The front end, which contains the GUI, is externally provided.  
Hence, we will not focus on it.

## Back End
The back end is further divided into 3 different packages:
- `api`, containing apis used to handle interactions between front end and the database.
- `model`, containing all classes needed to manage and to represent data, included errors.
- `database_utilities`, containing functions to interact with the db. 

# Low level design

## Model
![Design class diagram](./Design-diagrams/Class-diagram-design.svg "Design class diagram")

Apart from the listed methods, all classes have:
- one / many personalized constructors to initialize (part of) its attributes and, when needed, directly performing some consistency checks. 
- getters and setters for some attributes when needed. 

which have been omitted for the sake of brevity.  

Notice that all classes in `model` have few to none methods, except for `sku`, that is more complex.
This is a direct consequence of the fact that every change made on an Sku, has to be propagated in the rest of the system in order to keep consistency.
`error` class define an object used to propagate errors betweeen database_utilities' functions and api.

On the other hand, classes in `api` and `database_utilities` are, as expected, longer, due to the fact that every action of the application is handled by these.

### Api
The `api` interface is used by the front end to interact with the back end.  
Its roles are:
1. Checking correctness of the parameters received from the front end
2. Interact with the database by calling the proper low-level functions
3. Respond to the front end's request with the data provided by database_utilities classes.
4. Convert potential errors in corresponding HTTP codes.

### Database Utilities
The `database_utilities` interface is used by the Api to interact with the database.
Its roles are:
1. Checking consistency of the parameters received from the front-end
2. Interact with the database by executing the proper SQL-queries
3. Respond to Api's calls with the data provided by the database.
4. Convert potential database's errors in api's manageable errors.
------------------------------------------------------------
## Model 
**SKU**  
`void modify(openDB, newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity)`
Apply modification at an object of type `sku` and propagate it with `#propapagatePosition`.

`void #propagatePosition(openDB, position, occupiedWeight=0, occupiedVolume=0)`
Propagate the changes of Sku to the database, in order to mantain consistency.

## Api
**skuApi**  
`.get('/api/skus')`  
Returns a list of all the SKUs in the database, by calling db.loadSKU(null).

`.get('/api/skus/:id')`  
Return a single SKU identified by its Id, by calling db.loadSKU(skuId).

`.post('/api/sku')`  
Create a new SKU by calling db.insertSKU() with the parameters fetched from the request's body.

`.put('/api/sku/:id')`
Fetches the SKU from the database by calling db.loadSKU(skuId), then calls sku.modify(...). Finally, if no exceptions have been raised, the changes are made persistent by calling db.updateSKU(sku).

`.put('/api/sku/:id/position')`  
Fetches the SKU from the database by calling db.loadSKU(skuId), then calls sku.setPosition(p). Finally, if no exceptions have been raised, the changes are made persistent by calling db.updateSKU(sku) and db.updatePosition(p).

`.delete('/api/skus/:id')`  
Fetches the SKU from the database by calling db.loadSKU(skuId), then delete it by calling db.deleteSKU(sku)

**SkuitemApi**  
`.get('/api/skuitems')`  
Returns a list of all the SKUitems in the database, by calling db.loadSKUitem(null).

`.get('/api/skuitems/sku/:id)`  
Searches in the database all SKUitems whose skuId matches the one in input, by calling db.loadSKUitem(skuId).
Returns the requested SKUitems.

`.get('/api/skuitems/sku/:rfid)`  
Searches in the database the SKUitem whose rfid matches the one in input, by calling db.loadSKUitem(rfid).
Returns the requested SKUitem.

`.post('/api/skuitem')`
Create a new SKUitem by calling db.insertSKUitem() with the parameters fetched from the request's body.

`.put('/api/skuitems/:rfid')`  
The changes are propagated by calling db.updateSKUitem(skuItem).

`.delete('/api/skuitems/:rfid')`  
Delete it by calling db.deleteSKUitem(rfid).

**positionApi**
`.get('/api/positions')`
Returns a list of all the positions in the database, by calling db.loadPosition(null).

`.post('/api/position')`  
Create a new Position by calling db.insertPosition() with the parameters fetched from the request's body.

`.put('/api/position/:positionID')`  
Check if the positionID is valid.
The changes are propagated by calling db.updatePosition(...).


`.put('/api/position/:positionI/changeID')`  
Check if the positionID is valid.
The changes are propagated by calling db.updatePosition(...).

`.delete('/api/position/:positionID')`  
Check if the positionID is valid.
Delete it by calling db.deletePosition(positionID).

**testDescriptorApi**  
`.get('/api/testDescriptors')`  
Returns a list of all the test descriptors in the database, by calling db.loadTestDescriptor(null).

`.get('/api/testDescriptors/:id')`  
Check if the id is valid.
Searches in the database the test descriptor whose id matches the one in input, by calling db.loadTestDescriptor(testId).
Returns the requested TestDescriptor.

`.post('/api/testDescriptors')`  
Create a new TestDescriptor by calling db.insertTestDescriptor() with the parameters fetched from the request's body.

`.put('/api/testDescriptors/:id')`  
Fetches from the database the test descriptor which id match the one in input by calling test = db.loadTestDescriptor(testId. Then the changes are made persistent by calling db.updateTestDescriptor(test).

`.delete('/api/testDescriptors/:id')`  
Check if the positionID is valid.
Delete it by calling db.deletePosition(positionID).

**testResultApi**





# VECCHIE INTERFACCE
 **SKU**  
**SkuItemApi**
**Position**
**TestDescriptor**
**TestResult**

`  Array<String> getTestResultsByRfid(rfid :String)`  
Returns a list of all the test results in the database correspondent to a SKUitem whose rfid matches the one in input, by calling db.loadTestResult(rfid).

`  String getTestResultbyId(rfid :String, resultId :Integer)`  
Searches in the database the test result whose pair (rfid, id) matches the one in input, by calling db.loadTestResult(rfid, resultId).
Returns the requested TestResult.

`  void addTestResult (rfid :String, testId :Integer, testDescription :String, date :Date, result :Boolean)`  
Fetches from the database the SKUitem whose rfid matches the one in input by calling skuItem = db.loadSKUitem(rfid) and the descriptor whose id matches the one in input by calling test = db.loadTestDescriptor(testId). Then, checks whether test.getSkuId() == skuItem.getSkuId() and creates a new TestResult object by calling its constructor. Finally, if no exceptions have been raised, the descriptor is added in the database by calling db.intertTestDescriptor().

`  void modifyTestResult (rfid :String, resultId :Integer, newTestDescription :String, newDate :Date, newResult :Boolean)`  
Creates a new test result, then calls db.updateTestResult().

`  void deleteTestResult(rfid :String, resultId :Integer)`  
Simply calls db.deleteTestResult(rfid, resultId).

------------------------------------------------------------
**User**

`  String getUserInfo()`  
Returns the content of currentlyLoggedUser. If no user is logged in, it throws NotLoggedInException.

`  Array<String> getAllSuppliers()`  
Returns a list of all the suppliers in the database by calling db.loadUser(type = SUPPLIER).

`  Array<String> getAllUsers()`  
Returns a list of all the users in the database by calling db.loadUser().

`  void addUser(username :String, name :String, surname :String, password :String, type :String)`  
Creates a new user object by calling its constructor, then calls db.insertUser(). If type = MANAGER, ManagerException is raised.

`  void login(username :String, password :String, type :String)`  
Fetches from the the database usr = db.loadUser(username, type), then compares the password. If they are different, WrongPasswordException is raised. Otherwise, currentlyLoggedUser is set to usr.

`  void logout()`  
Sets currentlyLoggedUser to null. If it is already null, AlreadyLoggedoutException is thrown.

`  void modifyUserRole(username :String, oldType :String, newType :String)`  
Fetches from the the database usr = db.loadUser(username, oldType), then calls usr.setType(newType). If type = MANAGER, ManagerException is raised. Finally, if no exceptions have been raised, the changes are made persistent by calling db.updateUser(usr). 

`  void deleteUser(username :String, type :String)`  
Calls db.deleteUser(username, type). If type = MANAGER, ManagerException is raised. 

------------------------------------------------------------
**RestockOrder**

`  Array<String> getAllRestockOrders()`  
Returns a list of all the restock orders in the database by calling db.loadRestockOrder().

`  Array<String> getRestockOrdersIssued()`  
Returns a list of all the restock orders in the database in the ISSUED state by calling db.loadRestockOrder(state = ISSUED).

`  String getRestockOrderById(orderId :Integer)`  
Searches in the database the restock order whose id matches the one in input, by calling db.loadRestockOrder(orderId).
Returns the requested RestockOrder.

`  Array<String> getRestockOrderReturnItems(orderId :Integer)`  
Calls db.selectReturnItems(orderId). This function is done at a lower level to avoid many unnecessary loads from the database.

`  void addRestockOrder(issueDate :Date, products :Array<String>, supplierId :Integer)`  
Fetches from the database the supplier whose id matches the one in input by calling usr = db.loadUser(supplierId, type = SUPPLIER). It checks we are not ordering more items than what the warehouse is capable of storing, by calling modify(+qty) for each item.SKU, and that all selected items are provided by the same supplier. Then, it creates a new RestockOrder object by calling its constructor. Finally, if no exceptions have been raised, the order is added in the database by calling db.insertRestockOrder().

`  void modifyRestockOrderState(orderId :Integer, newState :String)`  
Fetches from the the database the requested restock order restock = db.loadRestockOrder(orderId). Then, calls restock.setState(newState). Finally, if no exceptions have been raised, the order is updated by calling db.updateRestockOrder(restock).

`  void modifyRestockOrderSKUitems(orderId :Integer, skuItems :Array<String>)`  
Fetches from the the database the requested restock order restock = db.loadRestockOrder(orderId). If restock.getState() != DELIVERED, throw WrongOrderStateException. Then, calls restock.addSKUitems(skuItems). Finally, if no exceptions have been raised, the order is updated by calling db.updateRestockOrder(restock).

`  void modifyRestockOrderTransportNote(orderId :Integer, transportNote :String)`  
Fetches from the the database the requested restock order restock = db.loadRestockOrder(orderId). Then, calls restock.setTransportNote(transportNote). Finally, if no exceptions have been raised, the order is updated by calling db.updateRestockOrder(restock).

`  void deleteRestockOrder(orderId :Integer)`  
Calls db.deleteRestockOrder(orderId).

------------------------------------------------------------
**ReturnOrder**

`  Array<String> getAllReturnOrders()`  
Returns a list of all the return orders in the database by calling db.loadReturnOrder(null).

`  String getReturnOrderById(orderId :Integer)`  
Searches in the database the return order whose id matches the one in input, by calling db.loadReturnOrder(orderId).
Returns the requested ReturnOrder.

`  void addReturnOrder(returnDate :Date, products :Array<String>, restockOrderId :Integer)`  
Fetches from the database the restock order whose id matches the one in input by calling db.loadRestockOrder(restockOrderId).
Then, checks the consistency between the products to be returned and the one which have been received, and creates a new ReturnOrder object by calling its constructor. Then, it deletes each SKUitem by calling this.deleteSKUitem(rfid). Finally, if no exceptions have been raised, the order is added in the database by calling db.insertReturnOrder().

`  void deleteReturnOrder(orderId :Integer)`  
Calls db.deleteReturnOrder(orderId).

------------------------------------------------------------
**InternalOrder**

`  Array<String> getAllInternalOrders()`  
Returns a list of all the internal orders in the database by calling db.loadInternalOrder().

`  Array<String> getInternalOrdersIssued()`  
Returns a list of all the internal orders in the database in the ISSUED state by calling db.loadInternalOrder(state = ISSUED).

`  Array<String> getInternalOrdersAccepted()`  
Returns a list of all the internal orders in the database in the ACCEPTED state by calling db.loadInternalOrder(state = ACCEPTED).

`  String getInternalOrderById(orderId :Integer)`  
Searches in the database the internal order whose id matches the one in input, by calling db.loadInternalOrder(orderId).
Returns the requested InternalOrder.

`  void addInternalOrder (issueDate :Date, products: Array<String>, customerId :Integer)`  
Fetches from the database the customer whose id matches the one in input by calling usr = db.loadUser(customerId, type = CUSTOMER).
Then, it asserts there are enough SKUs by calling modify(-qty) for each SKU, and creates a new InternalOrder object by calling its constructor. Finally, if no exceptions have been raised, the order is added in the database by calling db.insertInternalOrder().

`  void modifyInternalOrderState(orderId :Integer, newState :String, products :Array<String>)`  
Fetches from the the database the requested internal order internal = db.loadInternalOrder(orderId). Then, calls internal.setState(newState, products). If newState == CANCELED || REFUSED, call modify(+qty) for each SKU.Finally, if no exceptions have been raised, the order is updated by calling db.updateRestockOrder(internal).

`  void deleteInternalOrder(orderId :Integer)`  
Calls db.deleteInternalOrder(orderId).

------------------------------------------------------------
**Item**

`  Array<String> getAllItems()`  
Returns a list of all the items in the database by calling db.loadItem(null).

`  String getItemById(itemId :Integer)`  
Searches in the database the item whose id matches the one in input, by calling db.loadItem(itemId).
Returns the requested Item.

`  void addItem (description :String, price :Float, skuId :Integr, supplierId :Integer)`  
Fetches from the database the SKU and the supplier whose ids match the ones in input by calling sku = db.loadSKU(skuId) and usr = db.loadUser(supplierId, type = SUPPLIER). Then, creates a new Item object by calling its constructor. Finally, if no exceptions have been raised, the item is added in the database by calling db.insertItem().

`  void modifyItem (itemId :Integr, newDescription :String, newPrice :Float)`  
Fetches from the database the item whose id matches the one in input by calling item = db.loadItem(itemId). Then, calls item.modify(...). Finally, if no exceptions have been raised, the item is updated by calling db.updateItem(item).

`  void deleteItem(itemId :Integer)`  
Simply calls db.deleteItem(itemId).


### DatabaseUtilities

This class will be used as an interface towards the database storing information needed by the application. All functions are generally simple and low-level, except for few cases. Given that, pseudo-code is explicitly written just for most complex queries.  
Given the possibility to modify SKUitem RFID, a fixed Id is provided to maintain database's internal consistency.  
For delete functions, additional parameters are provided to delete entries according to object they reference, to be used for maintaining consistency. However, since such behaviours have not been specified in the official requirements, they will not be explicitly used in the design.

`  void createConnection ()`  
Establish a connection between database and the program.

`  void closeConnection ()`  
Close the connection between database and the program.

`  Array<SKU> loadSKU (skuId :Integer=null)`  
Select all SKU with the given skuId. If no skuId is provided, it returns all skus in the database.
For every SKU selected, all testDescriptor ids with matching skuId are returned.

`  Array<SKUitem> loadSKUitem (rfid :String=null, skuId :Integer=null)`  
Select all SKUitem with the given skuId and rfId. If no id is provided, it returns all SKUitems in the database with Available equals to true.

`  Array<Position> loadPosition(positionId :String=null, skuId :Integer=null)`  
Select the Position with the given positionId.
Select the Position storing the SKU with the given skuId.
If no positionId / skuId is provided, it returns all Positions in the database.

`  Array<TestDescriptor> loadTestDescriptor (testId :Integer=null)`  
Select all TestDescriptor with the given testId. If no testId is provided, it returns all TestDescriptor in the database.

`  Array<TestResult> loadTestResult (rfid :String, resultId :Integer=null)`  
Select all TestResult with the given rfid and resultId. If no resultId is provided, it returns all TestResult with the given rfid.

`  Array<User> loadUser (username :String=null, type :Role=null, userId :Integer=null)`  
Select all User with the given username, type and userId. If one or more parameters are missing, it returns all Users in the database matching parameters provided. If all parameters are missing, it returns all the Users in the database excluding Managers.

`  Array<RestockOrder> loadRestockOrder (orderId :Interger=null, state :RestockOrderdState=null)`  
Select all RestockOrder with the given orderId and state.. If no orderId is provided, it returns all RestockOrders in the database with a matching state. If no state is provided, it returns all RestockOrders in the database with a matching orderId.  If all parameters are missing, it returns all the RestockOrders in the database.

`  Array<ReturnOrder> loadReturnOrder (orderId :Integer=null)`  
Select all ReturnOrder with the given orderId. If no orderdId is provided, it returns all ReturnOrders in the database.

`  Array<InternalOrder> loadInternalOrder (orderId :Integer=null, state :InternalOrderState=null) `  
Select all InternalOrder with the given orderId. If no orderdId is provided, it returns all internalOrders in the database with a matching state. If no state is provided, it returns all InternalOrder in the database with a matching orderId. If all paramters are missing, it returns all the InternalOrders in the database.

`  Array<Item> loadItem (itemId :Itenger=null)`  
Select all Item with the given itemId. If no itemId is provided, it returns all Items in the database.

`  void insertSKU (sku :SKU)`  
Insert a new SKU in the database.

`  void insertSKUitem (skuitem :SKUitem)`  
Insert a new SKUitem in the database with Available equals to false.

`  void insertPosition (position :Position)`  
Insert a new Position in the database.

`  void insertTestDescriptor (testDescriptor :TestDescriptor)`  
Insert a new TestDescriptor in the database.

`  void insertTestResult (testresult :TestResult)`  
Insert a new TestResult in the database.

`  void insertUser (user :User)`  
Insert a new User in the database.

`  void insertRestockOrder (restockorder :RestockOrder)`  
Insert a new RestockOrder in the database.

`  void insertReturnOrder (returnorder :ReturnOrder)`  
Insert a new ReturnOrder in the database.

`  void insertInternalOrder (internalOrder :InternalOrder)`  
Insert a new InternalOrder in the database.

`  void insertItem (item :Item)`  
Insert a new Item in the database.

`  void updateSKU (sku :SKU)`  
Update information of an existing SKU in the database.

`  void updateSKUitem (oldRfId :String, skuItem :SKUitem)`  
Update information of an existing SKUitem in the database.

`  void updatePosition (oldPositionId :String, position :Position)`  
Update information of an existing Position in the database.

`  void updateTestDescriptor (testDescriptor :TestDescriptor)`  
Update information of an existing TestDescriptor in the database.

`  void updateTestResult (testresult :TestResult)`  
Update information of an existing TestResult in the database.

`  void updateUser (oldType :Role, user :User)`  
Update information of an existing User in the database.

`  void updateRestockOrder (restockOrder :RestockOrder)`  
Update information of an existing RestockOrder in the database.
    
`  void updateInternalOrder (internalOrder :InternalOrder)`  
Update information of an existing InternalOrder in the database.

`  void updateItem (item :Item)`  
Update information of an existing Item in the database.

`  void deleteSKU (skuId :Integer)`  
Delete from the database the SKU with matching skuId.

`  void deleteSKUitem (rfId :String=null, skuId :Integer=null)`  
Delete from the database the SKUitem with matching skuId.
Delete from the database the SKUitem with matching rfId. 
Notice we don't have a literal deletion since, to keep the order history clear, SKUitems are never deleted: their isAvailable flag is simply put to false (meaning this function is actually an update).

`  void deletePosition (positionId :String)`  
Delete from the database the Position with matching PositionId.

`  void deleteTestDescriptor (testId :Integer=null, skuid :Integer=null)`  
Delete from the database the TestDescriptor with matching skuId.
Delete from the database the TestDescriptor with matching testId.

`  void deleteTestResult (rfId :String=null, resultId :Integer=null,testId :Integer=null)`  
Delete from the database the TestResult with matching rfId.
Delete from the database the TestResult with matching resultId.
Delete from the database the TestResult with matching testId.

`  void deleteUser (username :String, type :Role)`  
Delete from the database the User with matching username and type.

`  void deleteRestockOrder (orderId :Integer)`  
Delete from the database the RestockOrder with matching orderId.

`  void deleteReturnOrder (orderId :Integer)`  
Delete from the database the ReturnOrder with matching orderId.

`  void deleteInternalOrder (orderId :Integer)`  
Delete from the database the InternalOrder with matching orderId.

`  void deleteItem (itemId :Integer=null, supplierId :Integer=null, skuId :Integer=null)`  
Delete from the database the Item with matching itemId.
Delete from the database the Item with matching supplierId.
Delete from the database the Item with matching skuId.

`  SKUitem fifoPopSKUitemFromPosition(positionId :String)`  
SELECT skuId INTO skuIdVar  
FROM POSITIONS P  
WHERE P.positionId = positionId  
If skuIdVar is empty, raise UndefinedSKUException.  
SELECT (rfid, skuId, isAvailable, dateOfStock) INTO skuVar  
FROM SKU-ITEMS SI  
WHERE SI.isAvailable = true AND SI.dateOfStock = (  
&ensp;SELECT MIN(dateOfStock)  
&ensp;FROM SKU-ITEMS SI  
&ensp;WHERE SI.isAvailable = true  
)  
If skuVar contains more than 1 element, choose a random one.  
UPDATE SKU-ITEMS  
SET isAvailable = false  
WHERE rfid = skuVar.rfid  

`  SKUitem selectReturnItems(orderId :Integer)`  
SELECT order INTO orderVar  
FROM RESTOCK-ORDERS RO  
WHERE RO.id = orderId  
If orderVar is empty, raise UndefinedRestockOrderException.  
If orderVar.state != COMPLETEDRETURN, raise  WrongOrderStateException.  
SELECT skuItem INTO skuItemsArray  
FROM SKU-ITEMS SI  
WHERE orderVar.skuItems.contains(SI.rfid) AND NOT EXISTS (  
&ensp;SELECT TR.id  
&ensp;FROM TEST-RESULTS TR  
&ensp;WHERE SI.rfid = TR.rfid AND TR.result = true  
)  

### SKU

`  void modify(newDescription :String, newWeight :Integer, newVolume :Integer, newNotes :String, newPrice :Float, newAvailableQuantity :Integer, db :DatabaseUtility)`  
Changes the value of attributes. If newAvailableQuantity < 0, throws NotEnoughItemsException. If either weight, volume or availableQuantity are modified and the SKU is assigned to a position, that position is fetched from the database by calling p = db.loadPosition(positionId) and p.updateOccupiedWeightAndVolume() is called. Finally, if no exceptions have been raised, the changes are made persistent by calling db.updatePosition(p). 

`  void modify(qtyOffset :Integer, db :DatabaseUtility)`  
Calls standard modify with current values but newAvailableQuantity = availableQuantity + qtyOffset.

`  void setPosition(p :Position)`  
Calls p.setSKU() and, if no exceptions have been raised, sets sku.positoinId = p.getId().  

### SKUitem

`  void modify(newRfid :String, newAvailable :Boolean, newDateOfStock :Date)`  
Changes the value of attributes.

`  void setIsAvailable(isAvailable :Boolean)`  
Changes the value of isAvailable.

`  void updateAvailableQuantity(qtyOffset :Integer, db :DatabaseUtility)`  
Fetches the correspondent SKU from the database by calling sku = db.loadSKU(skuId) and sku.modify(qtyOffset) is called. Finally, if no exceptions have been raised, the changes are made persistent by calling db.updateSku(sku). 

### Item

`  void modify(newDescription :String, newPrice :Float)`  
Changes the value of attributes.


### Position
`  void modify(newAisleId :String, newRow :String, newCol :String, newMaxWeight :Integer, newMaxVolume :Integer, newOccupiedWeight :Integer, newOccupiedVolume :Integer, db :DatabaseUtilities)`  
Changes the value of attributes. If the position is assigned to a SKU, that SKU is fetched from the database by calling sku = db.loadSKU(skuId). If newOccupiedWieght > newMaxWeight or newOccupiedVolume > newMaxVolume, VolumeWeightException is raised.
Finally, the new value for the id is computed by calling computePositionId(), and then set, and sku.setPosition(this) is possibly called.    
    
`  void modify(newPositionId :String)`  
Changes the value of attributes. The new values for aisleId, row and column are computed and set by calling computeAndSetPositionCoordinates(). If the position is assigned to a SKU, that SKU is fetched from the database by calling sku = db.loadSKU(skuId), and sku.setPosition(this) is called.

`  void updateOccupiedWeightAndVolume(weightOffset :Integer, volumeOffset :Integer)`  
Computes new, temporary values for p.occupiedWeight and p.occupiedVolume.If they are still lower than the respective maximum values, they are modified. Otherwise, VolumeWeightException is raised.

`  setSKU(sku :SKU)`  
**if sku!=null**  
First, checks if it is already assigned to a different SKU. If yes, PositionAlreadyAssignedException is raised. If no, checks if it is able to store the available SKU in terms of weight and volume. If yes, the SKU is set. If no, OutOfSpaceException is raised.  
**if sku==null**  
Resets the position to its initial state.

`  void computeAndSetPositionCoordinates()`  
Reads the current value of this.id and splits it to compute and set aisleId, row and column attributes.

`  String computePositionId()`  
Reads the current values of this.aisleId, this.row and this.column, and concatenates them to compute and return the id attribute.

### Test Descriptor

`  void modify (newName :String, newProcedureDescription :String, newSKUid :Integer)`  
Changes the value of attributes.

### Test Result

`  void setSkuItemRfid(rfid :String)`  
Changes the value of the skuItemRfid attribute.

### Restock Order
`  void setState(state :RestockOrderState)`  
Changes the value of the state attribute.

`  void addSKUitems(skuItems :Array<String>)`  
Merges the content of skuItems with the one of this.skuItems. This function should make sure that all skuItems are existing and corresponds to items actually present in the products attribute.

`  void setTransportNote(transportNote :String)`  
Changes the value of the transportNote attribute.

### Internal Order

`  void setState(state :InternalOrderState, products :Array<String>)`  
Changes the value of the attributes.
If state == COMPLETED, products are updated by adding the rfid information, otherwise they are ignored.

### User
`  void setType(type :Role)`  
Changes the value of the type attributes.

# Verification traceability matrix

|  | EzWh | DatabaseUtilities | User | SKU | SKUitem | Item | Position | TestDescriptor | TestResult | RestockOrder | ReturnOrder | InternalOrder | _any class in the exceptions package_|
| ------------- |:-------------:| :-----:| :-----:| :-----:| :-----:| :-----:| :-----:| :-----:| :-----:| :-----: | :-----: | :-----: | :-----: |
| FR1  | X | X | X | | | | | | | | |  | X |
| FR2  | X | X | | X | | | | | | | |  | X |
| FR3  | X | X | | X |  |  | X | | X | | | | X |
| FR4  | X | X | X | | | | | | | | || X |
| FR5  | X | X | X | | X | X | | | X | X | X | | X |
| FR6  | X | X | X | | | X | | | | |  | X | X |
| FR7  | X | X | X | X | | X | | |  | | |  | X |

# Verification sequence diagrams
For our sequence diagrams, we have focused on different scenarios, to show various functionalities of our application.

## Scenario 1-1, create SKU
![Scenario 1-1](./Design-diagrams/scenario1-1.svg "Scenario 1-1")

## Scenario 1-3, modify SKU weight and volume
We are assuming that the SKU is already associated to a position, hence the system should also automatically updates the occupied weight and volume of such position.

![Scenario 1-3](./Design-diagrams/scenario1-3.svg "Scenario 1-3")

## Scenario 5-2-1, record positive test results of all SKU items of a RestockOrder
![Scenario 5-2-1](./Design-diagrams/scenario5-2-1.svg "Scenario 5-2-1")

## Scenario 6-1, return order of SKUitems which did not pass any quality test
![Scenario 6-1](./Design-diagrams/scenario6-1.svg "Scenario 6-1")

## Scenario 9-2, internal order refused
![Scenario 9-2](./Design-diagrams/scenario9-2.svg "Scenario 9-2")

## Scenario 12-3, delete test descriptor
![Scenario 12-3](./Design-diagrams/scenario12-3.svg "Scenario 12-3")