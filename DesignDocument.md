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
get-----
------
    modifySKU()
Fetches the SKU from the database by calling db.loadSKU(), then calls sku.modify(). Finally, if no exceptions have been raised, the changes are made persistent by calling db.updateSKU(sku).

    setSKUPostion()
Fetches the SKU and the position from the database by calling db.loadSKU() and db.loadPosition(), then calls sku.setPosition(). Finally, if no exceptions have been raised, the changes are made persistent by calling db.updateSKU(sku) and db.updatePosition(p).

    deleteSKU()
Fetches the SKU and its assigned position - if any - from the database by calling db.loadSKU() and db.loadPosition(). Then, it possibly calls p.setSKU(null). Finally, if no exceptions have been raised, the changes are made persistent by calling db.updatePosition(p) and the SKU is deleted by calling db.deleteSKU(sku.id).

---------



    deletePosition()
Fetches the position and its assigned SKU - if any - from the database by calling db.loadPosition() and db.loadSKU(). Then, it possibly calls sku.setPosition(null). Finally, if no exceptions have been raised, the changes are made persistent by calling db.updateSKU(sku) and the position is deleted by calling db.deletePosition(p.id).


```





### SKU

```
    modify()
Changes the value of attributes. If either weight, volume or availableQuantity are modified and the SKU is assigned to a position, that position is fetched from the database by calling db.loadPosition() and p.updateOccupiedWeightAndVolume() is called. Finally, if no exceptions have been raised, the changes are made persistent by calling db.updatePosition(p). 

    setPosition()
> if p!=null
Calls p.setSKU() and, if no exceptions have been raised, sets sku.positoinId = p.getId().
> if p==null
Simply sets sku.positionId = p.getId()
    
  

```
### Position
```
    modify()
Changes the value of attributes. ---------------

    updateOccupiedWeightAndVolume()
Computes new, temporary values for p.occupiedWeight and p.occupiedVolume.If they are still lower than the respective maximum values, they are modified. Otherwise, -------------------------- is raised.

    setSKU()
> if sku!=null
First, checks if it is already assigned to another SKU. If yes, --------------- is raised. If no, checks if it is able to store the available SKU in terms of weight and volume. If yes, the SKU is set. If no, ----------------- is raised.
> if sku==null
Resets the position to its initial state, that is p.sku = null, occupiedWeight = 0 and occupiedVolume = 0.

```

# Verification traceability matrix

\<for each functional requirement from the requirement document, list which classes concur to implement it>











# Verification sequence diagrams 
\<select key scenarios from the requirement document. For each of them define a sequence diagram showing that the scenario can be implemented by the classes and methods in the design>



```