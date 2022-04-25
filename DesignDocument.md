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

Apart from the listed methods, all classes have:
- a personalized constructor to initialize (part of) its attributes
- getters for all attributes  
...............

which have been omitted for the sake of brevity.



### DatabaseUtilities
This class will be used as an interface towards the database storing information needed by the application. All functions are extremely simple and low-level.





### EzWhInterface & EzWh
The `EzWhInterface` interface, which in our case is implemented by the `EzWh` class, is the façade used by the front end to interact with the back end.  
Its role is mainly _translational_, since every function
1. Possibly converts from JSON to custom Java classes
2. Interacts with the database by calling the proper low-level functions
3. Possibly converts the result from custom Java classes to JSON  

```
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
Fetches the SKU and its assigned position - if any - from the database by calling first sku = db.loadSKU(skuId) and then p = db.loadPosition(sku.getPosition()). Then, it possibly calls p.setSKU(null). Finally, if no exceptions have been raised, the changes are made persistent by calling db.updatePosition(p) and the SKU is deleted by calling db.deleteSKU(sku.getId()). To ensure consistency, all SKUitems, test descriptors --------------------------------- referring to that SKU are also deleted by calling db.deleteSKUitem(skuId), db.deleteTestDescriptor(skuId).

    Array<String> getAllSKUitems()
Returns a list of all the SKUitems in the database, by calling db.loadSKUitem(null).

    Array<String> getSKUbySKUItemId(skuId :Integer)
Searches in the database all SKUitems whose skuId matches the one in input, by calling db.loadSKUitemBySKU(skuId).
Returns the requested SKUitems.

    String getSKUitemByRfid(rfid :String)
Searches in the database the SKUitem whose rfid matches the one in input, by calling db.loadSKUitem(rfid).
Returns the requested SKUitem.

    void addSKUitem(rfid :String, skuId :Integer, dateOfStock :Date)
Creates a new SKUitem by calling its constructor, then adds it in the database by calling db.intertSKUitem().

    void modifySKUitem(rfid :String, newRfid :String, newAvailable :Boolean, newDateOfStock :Date)
Fetches the SKUitem from the database by calling skuItem = db.loadSKUitem(rfid), then calls skuItem.modify(...). Finally, if no exceptions have been raised, the changes are made persistent by calling db.updateSKUitem(skuItem).

    void deleteSKUItem(rfid :String)
Removes the SKUitem from the database by calling db.deleteSKUitem(rfid).

    Array<String> getAllPositions()
Returns a list of all the positions in the database, by calling db.loadPosition(null).

    void addPosition(positionId :String, aisleId :String, row :String, col :String, maxWeight :Integer, maxVolume :Integer, occupiedWieght :Integer, occupiedVolume :Integer)
Creates a new position by calling its constructor, then adds it in the database by calling db.intertPosition().

    void modifyPosition(oldPositionId :String, newAisleId :String, newRow :String, newCol :String, newMaxWeight :Integer, newMaxVolume :Integer, newOccupiedWieght :Integer, newOccupiedVolume :Integer)
Fetches the position from the database by calling p = db.loadPosition(oldPositionId), then calls p.modify(...). Finally, if no exceptions have been raised, the changes are made persistent by calling db.updatePosition(p).

    void modifyPosition(oldPositionId :String, newPositionId :String)
Fetches the position from the database by calling p = db.loadPosition(oldPositionId), then calls p.modify(newPositionId). Finally, if no exceptions have been raised, the changes are made persistent by calling db.updatePosition(p).

    void deletePosition(positionId :String)
Fetches the position and its assigned SKU - if any - from the database by calling p = db.loadPosition(positionId) and sku = db.loadSKU(p.getSkuId()). Then, it possibly calls sku.setPosition(null). Finally, if no exceptions have been raised, the changes are made persistent by calling db.updateSKU(sku) and the position is deleted by calling db.deletePosition(positionId).

    Array<String> getAllTestDescriptors()
Returns a list of all the test descriptors in the database, by calling db.loadTestDescriptor(null).

    String getTestDescriptorbyId(testId :Integer)
Searches in the database the test descriptor whose id matches the one in input, by calling db.loadTestDescriptor(testId).
Returns the requested TestDescriptor.
   
    void addTestDescriptor (name :String, procedureDescription :String, skuId :Integer)
Fetches from the database the SKU whose id matches the one in input by calling sku = db.loadSKU(skuId), and creates a new test descriptor by calling its constructor [the constructor will take care of adding the test descriptor to the SKU by calling sku.addTestDescriptor()]. Finally, if no exceptions have been raised, the changes are made persistent by calling db.updateSKU(sku), and the descriptor is added in the database by calling db.intertTestDescriptor().

    void modifyTestDescriptor (testId :Integer, newName :String, newProcedureDescription :String, newSKUId :Integer)
Fetches from the database the test descriptor and SKU whose ids match the ones in input by calling test = db.loadTestDescriptor(testId) and sku = db.loadSKU(newSkuId). Then, it calls test.modify(...). Finally, if no exceptions have been raised, the changes are made persistent by calling db.updateSKU(sku) and db.updateTestDescriptor(test).

    void deleteTestDescriptor(testId :Integer)
Fetches from the database the test descriptor whose id matches the one in input by calling test = db.loadTestDescriptor(testId). Then, it calls test.clean(). Finally, if no exceptions have been raised, the descriptor is deleted by calling db.deleteTestDescriptor(testId).

    Array<String> getTestResultsByRfid(rfid :String):
Returns a list of all the test results in the database correspondent to a SKUitem whose rfid matches the one in input, by calling db.loadTestResult(rfid).

    String getTestResultbyId(rfid :String, resultId :Integer):
Searches in the database the test result whose pair (rfid, id) matches the one in input, by calling db.loadTestResult(rfid, resultId).
Returns the requested TestResult.

    void addTestResult (rfid :String, testId :Integer, testDescription :String, date :Date, result :Boolean):
Fetches from the database the SKUitem whose rfid matches the one in input by calling skuItem = db.loadSKUitem(rfid) and the descriptor whose id matches the one in input by calling test = db.loadTestDescriptor(testId). Then, creates a new test result by calling its constructor [the constructor will take care of checking the test.getSkuId() == skuItem.getSkuId()]. Finally, if no exceptions have been raised, the changes are made persistent by calling db.updateSKU(sku), and the descriptor is added in the database by calling db.intertTestDescriptor().

    void modifyTestResult (rfid :String, resultId :Integer, newTestDescription :String, newDate :Date, newResult :Boolean)
Creates a new test result object by calling the unsafe constructor (which performs no checks), then calls db.updateTestResult().

    void deleteTesResult(rfid :String, resultId :Integer)
Simply calls db.deleteTestResult(rfid, resultId).












---------






```





### SKU

```
    void modify(newDescription :String, newWeight :Integer, newVolume :Integer, newNotes :String, newPrice :Float, newAvailableQuantity :Integer, db :DatabaseUtility)
Changes the value of attributes. If either weight, volume or availableQuantity are modified and the SKU is assigned to a position, that position is fetched from the database by calling p = db.loadPosition(positionId) and p.updateOccupiedWeightAndVolume() is called. Finally, if no exceptions have been raised, the changes are made persistent by calling db.updatePosition(p). 

    void setPosition(p :Position)
> if p!=null
Calls p.setSKU() and, if no exceptions have been raised, sets sku.positoinId = p.getId().
> if p==null
Simply sets sku.positionId = p.getId().

    void addtestDescriptor(testId: Integer, toBeAdded :Boolean)
If toBeAdded == true, testId is added to the list of test descriptors. Otherwise, it is removed.

    Integer getMinOccupiedWeight()
Returns weight*availableQuantity.

    Integer getMinOccupiedVolume()
Returns volume*availableQuantity.
    
  

```
### SKU

```
    void modify(newRfid :String, newAvailable :Boolean, newDateOfStock :Date)
Changes the value of attributes.

```


### Position
```
    
    void modify(newAisleId :String, newRow :String, newCol :String, newMaxWeight :Integer, newMaxVolume :Integer, newOccupiedWeight :Integer, newOccupiedVolume :Integer, db :DatabaseUtilities)
Changes the value of attributes. If the position is assigned to a SKU, that SKU is fetched from the database by calling sku = db.loadSKU(skuId). If either newOccupiedWeight or newOccupiedVolume are modified and the position is assigned to a SKU, minW = sku.getMinOccupiedWeight() and minV = sku.getMinOccupiedVolume() are computed. 
Then, if minW > newOccupiedWeight or minV > newOccupiedVolume, -------------------- is raised.
Moreover, if newOccupiedWieght > newMaxWeight or newOccupiedVolume > newMaxVolume, ----------------------- is raised.
Finally, the new value for the id is computed by calling computePositionId(), and then set, and sku.setPosition(this) is possibly called.    
    
    void modify(newPositionId :String)
Changes the value of attributes. The new values for aisleId, row and column are computed and set by calling computeAndSetPositionCoordinates(). If the position is assigned to a SKU, that SKU is fetched from the database by calling sku = db.loadSKU(skuId), and sku.setPosition(this) is called.

    void updateOccupiedWeightAndVolume(weightOffset :Integer, volumeOffset :Integer)
Computes new, temporary values for p.occupiedWeight and p.occupiedVolume.If they are still lower than the respective maximum values, they are modified. Otherwise, -------------------------- is raised.

    setSKU(sku :SKU)
> if sku!=null
First, checks if it is already assigned to a different SKU. If yes, --------------- is raised. If no, checks if it is able to store the available SKU in terms of weight and volume. If yes, the SKU is set. If no, ----------------- is raised.
> if sku==null
Resets the position to its initial state, that is p.sku = null, occupiedWeight = 0 and occupiedVolume = 0.

    void computeAndSetPositionCoordinates()
Reads the current value of this.id and splits it to compute and set aisleId, row and column attributes.

    String computePositionId()
Reads the current values of this.aisleId, this.row and this.column, and concatenates them to compute and return the id attribute.

```
### Test Descriptor
```
       void modify (newName :String, newProcedureDescription :String, newSKU :SKU)
If newSKU is different from the old one, fetches from the database the old SKU by calling oldSku = db.loadSKU(this.skuId), removes the test descriptor by calling oldSku.addTestDescriptor(this.id, false) and makes everything persistent by calling db.updateSKU(oldSku).
Changes the value of attributes, and calls newSKU.addTestDescriptor(this.id).

    void clean()
Simply call modify() with newSKU = null.
  

```

### database 

If there is not an SKU with an id matching the input, the system throws the UnexistingSKUException.

# Verification traceability matrix

\<for each functional requirement from the requirement document, list which classes concur to implement it>











# Verification sequence diagrams 
\<select key scenarios from the requirement document. For each of them define a sequence diagram showing that the scenario can be implemented by the classes and methods in the design>



```