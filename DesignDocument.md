# Design Document 


Authors: 

Date:

Version:


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

![Package diagram](./package-diagram.png "Package diagram")

## Front End
The front end, which contains the GUI, is externally provided.  
Hence, we will not focus on it.

## Back End
The back end is further divided into 3 different packages:
- `warehouse`, which is used as a façade by the front end
- `model`, containing all classes needed to manage and process data
- `exceptions`, to handle any incorrect action triggered either by a user or the system itself

# Low level design



## Exceptions



## Warehouse & Model

Apart from the listed methods, all classes have:
- a personalized constructor to initialize (part of) its attributes
- getters for all attributes  
...............

which have been omitted for the sake of brevity.

### EzWhInterface & EzWh
The `EzWhInterface` interface, which in our case is implemented by the `EzWh` class, is the façade used by the front end to interact with the back end.  
Its role is mainly _translational_, since every function
1. Possibly converts from JSON to custom classes
2. Interacts with the database by calling the proper low-level functions
3. Possibly converts the result from custom classes to JSON  

```
************************* SKU *************************

    Array<String> getAllSKUs()
Returns a list of all the SKUs in the database, by calling db.loadSKU(null).

    String getSKUbyId(skuId :Integer)
Searches in the database the SKU whose id matches the one in input, by calling db.loadSKU(skuId).
Returns the requested SKU.

    void addSKU (description :String, weight :Integer, volume :Integer, notes :String, price :Float, availableQuantity :Integer)
Creates a new SKU by calling its constructor, then adds it in the database by calling db.intertSKU().

    void modifySKU (skuId :Integer, newDescription :String, newWeight :Integer, newVolume :Integer, newNotes :String, newPrice :Float, newAvailableQuantity :Integer)
Fetches the SKU from the database by calling sku = db.loadSKU(skuId), then calls sku.modify(...). Finally, if no exceptions have been raised, the changes are made persistent by calling db.updateSKU(sku).

    void setSKUposition(skuId :Integer, newPosition :String)
Fetches the SKU and the position from the database by calling sku = db.loadSKU(skuId) and p = db.loadPosition(newPosition), then calls sku.setPosition(p). Finally, if no exceptions have been raised, the changes are made persistent by calling db.updateSKU(sku) and db.updatePosition(p).

    void deleteSKU(skuId :Integer)
Fetches the SKU and its assigned position - if any - from the database by calling first sku = db.loadSKU(skuId) and then p = db.loadPosition(sku.getPosition()). Then, it possibly calls p.setSKU(null). Finally, if no exceptions have been raised, the changes are made persistent by calling db.updatePosition(p) and the SKU is deleted by calling db.deleteSKU(sku.getId()). 

************************* SKUitem *************************

    Array<String> getAllSKUitems()
Returns a list of all the SKUitems in the database, by calling db.loadSKUitem(null).

    Array<String> getSKUbySKUItemId(skuId :Integer)
Searches in the database all SKUitems whose skuId matches the one in input, by calling db.loadSKUitem(skuId).
Returns the requested SKUitems.

    String getSKUitemByRfid(rfid :String)
Searches in the database the SKUitem whose rfid matches the one in input, by calling db.loadSKUitem(rfid).
Returns the requested SKUitem.

    void addSKUitem(rfid :String, skuId :Integer, dateOfStock :Date)
Creates a new SKUitem by calling its constructor, then adds it in the database by calling db.intertSKUitem().

    void modifySKUitem(rfid :String, newRfid :String, newAvailable :Boolean, newDateOfStock :Date)
Fetches the SKUitem from the database by calling skuItem = db.loadSKUitem(rfid), then calls skuItem.modify(...). Finally, if no exceptions have been raised, the changes are made persistent by calling db.updateSKUitem(skuItem).

    void deleteSKUitem(rfid :String)
To keep the order history clear, SKUitems are never deleted: their isAvailable flag is simply put to false. Hence, this function fetches the SKUitem from the database by calling skuItem = db.loadSKUitem(rfid), then calls skuItem.setIsAvailable(false). Finally, if no exceptions have been raised, the changes are made persistent by calling db.updateSKUitem(skuItem).


************************* Position *************************

    Array<String> getAllPositions()
Returns a list of all the positions in the database, by calling db.loadPosition(null).

    void addPosition(positionId :String, aisleId :String, row :String, col :String, maxWeight :Integer, maxVolume :Integer, occupiedWieght :Integer, occupiedVolume :Integer)
Creates a new position by calling its constructor, then adds it in the database by calling db.intertPosition().

    void modifyPosition(oldPositionId :String, newAisleId :String, newRow :String, newCol :String, newMaxWeight :Integer, newMaxVolume :Integer, newOccupiedWieght :Integer, newOccupiedVolume :Integer)
Fetches the position from the database by calling p = db.loadPosition(oldPositionId), then calls p.modify(...). Finally, if no exceptions have been raised, the changes are made persistent by calling db.updatePosition(p).

    void modifyPosition(oldPositionId :String, newPositionId :String)
Fetches the position from the database by calling p = db.loadPosition(oldPositionId), then calls p.modify(newPositionId). Finally, if no exceptions have been raised, the changes are made persistent by calling db.updatePosition(p).

    void deleteSKUitemFromPosition(positionId :String)
Removes a SKUitem from the position identified by positionId. In particular, the SKUitem with the lowest date of stock must be selected, to apply a FIFO-like criteria. To do so, db.fifoPopSKUitemFromPosition(positionId) is called.

************************* TestDescriptor *************************

    Array<String> getAllTestDescriptors()
Returns a list of all the test descriptors in the database, by calling db.loadTestDescriptor(null).

    String getTestDescriptorbyId(testId :Integer)
Searches in the database the test descriptor whose id matches the one in input, by calling db.loadTestDescriptor(testId).
Returns the requested TestDescriptor.
   
    void addTestDescriptor (name :String, procedureDescription :String, skuId :Integer)
Fetches from the database the SKU whose id matches the one in input by calling sku = db.loadSKU(skuId), and creates a new test descriptor by calling its constructor. Finally, if no exceptions have been raised, the descriptor is added in the database by calling db.insertTestDescriptor().

    void modifyTestDescriptor (testId :Integer, newName :String, newProcedureDescription :String, newSKUId :Integer)
Fetches from the database the test descriptor and SKU whose ids match the ones in input by calling test = db.loadTestDescriptor(testId) and sku = db.loadSKU(newSkuId). Then, it calls test.modify(...). Finally, if no exceptions have been raised, the changes are made persistent by calling db.updateTestDescriptor(test).

    void deleteTestDescriptor(testId :Integer)
Simply calls db.deleteTestDescriptor(testId). 

************************* TestResult *************************

    Array<String> getTestResultsByRfid(rfid :String):
Returns a list of all the test results in the database correspondent to a SKUitem whose rfid matches the one in input, by calling db.loadTestResult(rfid).

    String getTestResultbyId(rfid :String, resultId :Integer):
Searches in the database the test result whose pair (rfid, id) matches the one in input, by calling db.loadTestResult(rfid, resultId).
Returns the requested TestResult.

    void addTestResult (rfid :String, testId :Integer, testDescription :String, date :Date, result :Boolean):
Fetches from the database the SKUitem whose rfid matches the one in input by calling skuItem = db.loadSKUitem(rfid) and the descriptor whose id matches the one in input by calling test = db.loadTestDescriptor(testId). Then, creates a new TestResult object by calling its constructor [the constructor will take care of checking the test.getSkuId() == skuItem.getSkuId()]. Finally, if no exceptions have been raised, the descriptor is added in the database by calling db.intertTestDescriptor().

    void modifyTestResult (rfid :String, resultId :Integer, newTestDescription :String, newDate :Date, newResult :Boolean)
Creates a new test result object by calling the unsafe constructor (which performs no checks), then calls db.updateTestResult().

    void deleteTestResult(rfid :String, resultId :Integer)
Simply calls db.deleteTestResult(rfid, resultId).

************************* User *************************

    String getUserInfo()
Returns the content of currentlyLoggedUser. If no user is logged in, it throws ------------------------.

    Array<String> getAllSuppliers()
Returns a list of all the suppliers in the database by calling db.loadUser(type = SUPPLIER).

    Array<String> getAllUsers()
Returns a list of all the users in the database by calling db.loadUser().

    void addUser(username :String, name :String, surname :String, password :String, type :String)
Creates a new user object by calling its constructor, then calls db.insertUser(). If type = MANAGER, ------------------ is raised.

    void login(username :String, password :String, type :String)
Fetches from the the database usr = db.loadUser(username, type), then compares the password. If they are different, ------------------- is raised. Otherwise, currentlyLoggedUser is set to usr.

    void logout()
Sets currentlyLoggedUser to null. If it is already null, ---------------- is thrown.

    void modifyUserRole(username :String, oldType :String, newType :String)
Fetches from the the database usr = db.loadUser(username, oldType), then calls usr.setType(newType). If type = MANAGER, ------------------ is raised. Finally, if no exceptions have been raised, the changes are made persistent by calling db.updateUser(usr). 

    void deleteUser(username :String, type :String)
Calls db.deleteUser(username, type). If type = MANAGER, ------------------ is raised. 

************************* RestockOrder *************************

    Array<String> getAllRestockOrders()
Returns a list of all the restock orders in the database by calling db.loadRestockOrder().

    Array<String> getRestockOrdersIssued()
Returns a list of all the restock orders in the database in the ISSUED state by calling db.loadRestockOrder(state = ISSUED).

    String getRestockOrderById(orderId :Integer)
Searches in the database the restock order whose id matches the one in input, by calling db.loadRestockOrder(orderId).
Returns the requested RestockOrder.

    Array<String> getRestockOrderReturnItems(orderId :Integer)
Calls db.selectReturnItems(orderId). This function is done at a lower level to avoid many unnecessary loads from the database.

    void addRestockOrder(issueDate :Date, products :Array<String>, supplierId :Integer)
Fetches from the database the supplier whose id matches the one in input by calling usr = db.loadUser(supplierId, type = SUPPLIER).
Then, creates a new RestockOrder object by calling its constructor [the constructor will take care of checking that we are not ordering more items than what the warehouse is capable of storing]. Finally, if no exceptions have been raised, the order is added in the database by calling db.insertRestockOrder().

    void modifyRestockOrderState(orderId :Integer, newState :String)
Fetches from the the database the requested restock order restock = db.loadRestockOrder(orderId). Then, calls restock.setState(newState). Finally, if no exceptions have been raised, the order is updated by calling db.updateRestockOrder(restock).

    void modifyRestockOrderSKUitems(orderId :Integer, skuItems :Array<String>)
Fetches from the the database the requested restock order restock = db.loadRestockOrder(orderId). If restock.getState() != DELIVERED, throw 
-------------------------. Then, calls restock.addSKUitems(skuItems). Finally, if no exceptions have been raised, the order is updated by calling db.updateRestockOrder(restock).

    void modifyRestockOrderTransportNote(orderId :Integer, transportNote :String)
Fetches from the the database the requested restock order restock = db.loadRestockOrder(orderId). Then, calls restock.setTransportNote(transportNote). Finally, if no exceptions have been raised, the order is updated by calling db.updateRestockOrder(restock).

    void deleteRestockOrder(orderId :Integer)
Calls db.deleteRestockOrder(orderId).
To keep the order history explicit, we do not automatically delete return orders referencing to deleted restock orders.
More in general, when treating orders, we never perform automatic deletion (e.g., if an item is deleted, all orders referencing that item are still kept in the database).

************************* ReturnOrder *************************




************************* InternalOrder *************************

    Array<String> getAllInternalOrders()
Returns a list of all the internal orders in the database by calling db.loadInternalOrder().

    Array<String> getInternalOrdersIssued()
Returns a list of all the internal orders in the database in the ISSUED state by calling db.loadInternalOrder(state = ISSUED).

    Array<String> getInternalOrdersAccepted()
Returns a list of all the internal orders in the database in the ACCEPTED state by calling db.loadInternalOrder(state = ACCEPTED).

    String getInternalOrderById(orderId :Integer)
Searches in the database the internal order whose id matches the one in input, by calling db.loadInternalOrder(orderId).
Returns the requested InternalOrder.

    void addInternalOrder (issueDate :Date, products: Array<String>, customerId :Integer):
Fetches from the database the customer whose id matches the one in input by calling usr = db.loadUser(customerId, type = CUSTOMER).
Then, creates a new InternalOrder object by calling its constructor. Finally, if no exceptions have been raised, the order is added in the database by calling db.insertInternalOrder().

    void modifyInternalOrderState(orderId :Integer, newState :String, products :Array<String>)
Fetches from the the database the requested internal order internal = db.loadInternalOrder(orderId). Then, calls internal.setState(newState, products). Finally, if no exceptions have been raised, the order is updated by calling db.updateRestockOrder(internal).

    void deleteInternalOrder(orderId :Integer)
Calls db.deleteInternalOrder(orderId).

************************* Item *************************

    Array<String> getAllItems()
Returns a list of all the items in the database by calling db.loadItem(null).

    String getItemById(itemId :Integer)
Searches in the database the item whose id matches the one in input, by calling db.loadItem(itemId).
Returns the requested Item.

    void addItem (description :String, price :Float, skuId :Integr, supplierId :Integer):
Fetches from the database the SKU and the supplier whose ids match the ones in input by calling sku = db.loadSKU(skuId) and usr = db.loadUser(supplierId, type = SUPPLIER). Then, creates a new Item object by calling its constructor. Finally, if no exceptions have been raised, the item is added in the database by calling db.insertItem().

    void modifyItem (itemId :Integr, newDescription :String, newPrice :Float):
Fetches from the database the item whose id matches the one in input by calling item = db.loadItem(itemId). Then, calls item.modify(...). Finally, if no exceptions have been raised, the item is updated by calling db.updateItem(item).

    void deleteItem(itemId :Integer)
Simply calls db.deleteItem(itemId).

```


### DatabaseUtilities
This class will be used as an interface towards the database storing information needed by the application. All functions are generally simple and low-level, except for few cases. For each function, we will specify the query on the database.

```







    SKUitem fifoPopSKUitemFromPosition(positionId :String)
SELECT skuId INTO skuIdVar
FROM POSITIONS P
WHERE P.positionId = positionId
If skuIdVar is empty, raise ------------------------------------.
SELECT (rfid, skuId, isAvailable, dateOfStock) INTO skuVar
FROM SKU-ITEMS SI
WHERE SI.isAvailable = true AND SI.dateOfStock = (
    SELECT MIN(dateOfStock)
    FROM SKU-ITEMS SI
    WHERE SI.isAvailable = true
)
If skuVar contains more than 1 element, choose a random one.
UPDATE SKU-ITEMS
SET isAvailable = false
WHERE rfid = skuVar.rfid

    SKUitem selectReturnItems(orderId :Integer)
SELECT order INTO orderVar
FROM RESTOCK-ORDERS RO
WHERE RO.id = orderId
If orderVar is empty, raise ------------------------------------.
If orderVar.state != COMPLETEDRETURN, raise ------------------------------------.
SELECT skuItem INTO skuItemsArray
FROM SKU-ITEMS SI
WHERE SI.rfid 

```



If there is not an SKU with an id matching the input, the system throws the UnexistingSKUException.


### SKU

```
    void modify(newDescription :String, newWeight :Integer, newVolume :Integer, newNotes :String, newPrice :Float, newAvailableQuantity :Integer, db :DatabaseUtility)
Changes the value of attributes. If either weight, volume or availableQuantity are modified and the SKU is assigned to a position, that position is fetched from the database by calling p = db.loadPosition(positionId) and p.updateOccupiedWeightAndVolume() is called. Finally, if no exceptions have been raised, the changes are made persistent by calling db.updatePosition(p). 

    void setPosition(p :Position)
Calls p.setSKU() and, if no exceptions have been raised, sets sku.positoinId = p.getId().
    
```
### SKUitem

```
    void modify(newRfid :String, newAvailable :Boolean, newDateOfStock :Date)
Changes the value of attributes.

    void setIsAvailable(isAvailable :Boolean)
Changes the value of isAvailable.

```

### Item

```
    void modify(newDescription :String, newPrice :Float)
Changes the value of attributes.

```

### Position
```
    void modify(newAisleId :String, newRow :String, newCol :String, newMaxWeight :Integer, newMaxVolume :Integer, newOccupiedWeight :Integer, newOccupiedVolume :Integer, db :DatabaseUtilities)
Changes the value of attributes. If the position is assigned to a SKU, that SKU is fetched from the database by calling sku = db.loadSKU(skuId). If newOccupiedWieght > newMaxWeight or newOccupiedVolume > newMaxVolume, ----------------------- is raised.
Finally, the new value for the id is computed by calling computePositionId(), and then set, and sku.setPosition(this) is possibly called.    
    
    void modify(newPositionId :String)
Changes the value of attributes. The new values for aisleId, row and column are computed and set by calling computeAndSetPositionCoordinates(). If the position is assigned to a SKU, that SKU is fetched from the database by calling sku = db.loadSKU(skuId), and sku.setPosition(this) is called.

    void updateOccupiedWeightAndVolume(weightOffset :Integer, volumeOffset :Integer)
Computes new, temporary values for p.occupiedWeight and p.occupiedVolume.If they are still lower than the respective maximum values, they are modified. Otherwise, -------------------------- is raised.

    setSKU(sku :SKU)
> if sku!=null
First, checks if it is already assigned to a different SKU. If yes, --------------- is raised. If no, checks if it is able to store the available SKU in terms of weight and volume. If yes, the SKU is set. If no, ----------------- is raised.
> if sku==null
Resets the position to its initial state.

    void computeAndSetPositionCoordinates()
Reads the current value of this.id and splits it to compute and set aisleId, row and column attributes.

    String computePositionId()
Reads the current values of this.aisleId, this.row and this.column, and concatenates them to compute and return the id attribute.

```

### Test Descriptor
```
       void modify (newName :String, newProcedureDescription :String, newSKUid :Integer)
Changes the value of attributes.

```

### Test Result
```
       void setSkuItemRfid(rfid :String)
Changes the value of the skuItemRfid attribute.

```

### Restock Order
```
    void setState(state :RestockOrderState)
Changes the value of the state attribute.

    void addSKUitems(skuItems :Array<String>)
Merges the content of skuItems with the one of this.skuItems. This function should make sure that all skuItems are existing and corresponds to items actually present in the products attribute.

    void setTransportNote(transportNote :String)
Changes the value of the transportNote attribute.

```

### Internal Order
```
       void setState(state :InternalOrderState, products :Array<String>)
Changes the value of the attributes.
If state == COMPLETED, products are updated by adding the rfid information, otherwise they are ignored.

```




# Verification traceability matrix

\<for each functional requirement from the requirement document, list which classes concur to implement it>











# Verification sequence diagrams 
\<select key scenarios from the requirement document. For each of them define a sequence diagram showing that the scenario can be implemented by the classes and methods in the design>



```