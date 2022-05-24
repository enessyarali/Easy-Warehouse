# Unit Testing Report

Date: 24/05/2022

Version: 1.2

# Contents 

- [Note about unit testing](#note-about-unit-testing)
- [Black Box Unit Tests](#black-box-unit-tests)
- [White Box Unit Tests](#white-box-unit-tests)

# Note about unit testing
Since all `model` classes have few to none logic, we never test them explicitly - except `SKU` and `Position`. We simply check their behaviour is correct by source code inspection.  
For this reason, we consider as "independent units" - although they are not actually independent - `Position` and all `database_utilities` classes **but** `SkuDBU` and `PositionDBU`.

# Black Box Unit Tests
We report here the criteria we followed to perform black box testing on `database_utilities` classes (since `model` classes have no logic, as already noticed).  
Since all `database_utilities` classes have basically the same internal structure (a load, an insert, an update and a delete), we decided to report here a single analysis for each category, for the sake of brevity.  
In particular, we tried to focus on some special cases, characterized by a slightly more complex logic with respect to the other ones.

 ### **Class *SkuItemDBU* - method *loadSKUitem***

**Criteria for method *loadSKUitem*:**

 - RFID
 - skuId
 - The requested SKUitems are in the database

**Predicates for method *loadSKUitem*:**

| Criteria                        | Predicate |
|---------------------------------|-----------|
| RFID                            | Is undefined   |
|                                 | Is not undefined   |
| skuId                           | Is undefined   |
|                                 | Is not undefined   |
| Requested SKUitems are in database | Yes |
|                                            | No  |

**Combination of predicates**:

| RFID | skuId | Requested SKUitems are in database| Valid / Invalid | Description of the test case | Jest test case       |
|----|----|----|----|-----|-----|
| Is undefined |  Is undefined | Yes | Valid | T1( ) -> true | `Retrieve all SkuItems` |
| Is not undefined |  Is undefined | Yes | Valid | T2(existingRFIDinDB, undefined) -> true | `Retrieve SkuItem by rfid` |
| Is undefined |  Is not undefined | Yes | Valid | T3(undefined, existingSkuIdInDB) -> true | `Retrieve SkuItem by SKUid` |
| Is not undefined |  Is not undefined | Yes | Valid | T4(existingRFIDinDB, notCare) -> true | `Try the load with both parameters` |
| Is undefined |  Is undefined | No | Valid | T5( ) -> true | `Retrieve all SkuItems - not found` |
| Is not undefined |  Is undefined | No | Valid | T6(existingRFIDinDB, undefined) -> true | `Retrieve SkuItem by rfid - not found` |
| Is undefined |  Is not undefined | No | Invalid | T7(undefined, existingSkuIdInDB) -> false | `Retrieve SkuItem by SKUid - not found` |
| Is not undefined |  Is not undefined | No | Valid | T8(existingRFIDinDB, notCare) -> true | `Try the load with both parameters - not found` |

Notice that case 4 behaves exactly as case 2: the RFID is more important than the skuId, which in this case is simply ignored.


### **Class *UserDBU* - method *insertUser***

**Criteria for method *insertUser*:**

 - User with unique pair (username, type) in database

**Predicates for method *insertUser*:**

| Criteria                        | Predicate |
|---------------------------------|-----------|
| User with unique pair (username, type) is in database         | Yes       |
|                                 | No        |

**Combination of predicates**:

| User with unique pair (username, type) is in database | Valid / Invalid | Description of the test case  | Jest test case            |
|-------------------------|---------------------------------|-----------------|-------------------------------|
| Yes | Valid | T1(validUser) -> true |`Insert user`|
| No | Invalid | T2(invalidUser) -> false |`Insert user - already present`|


### **Class *TestResultDBU* - method *updateTestResult***

**Criteria for method *updateTestResult*:**

 - SKUitem TestResult refers to is in database
 - TestResult to be modified is in database
 - TestDescriptor is in database

**Predicates for method *updateTestResult*:**

| Criteria                        | Predicate |
|---------------------------------|-----------|
| SKUitem TestResult refers to is in database | Yes |
| | No |
| TestResult to be modified is in database | Yes |
|  | No |
| TestDescriptor is in database | Yes |
| | No |

**Combination of predicates**:

| SKUitem TestResult refers to is in database | TestResult to be modified is in database | TestDescriptor is in database | Valid / Invalid | Description of the test case  | Jest test case            |
|-----------|--------------|----------------|-----------------|-----------------|-------------------------------|
| Yes | Yes | Yes | Valid | T1(validResult) -> true | `Update an existing Test Result` |
| Yes | Yes | No | Invalid | T2(invalidResult) -> false | `Update an existing Test Result - testDescriptor not found` |
| No | No | Not Care | Invalid | T3(invalidResult) -> false | `Update an existing Test Result - RFID not found` |
| Yes | No | Yes | Valid | T4(validResult) -> true | `Update an existing Test Result - testResult not found` |

### **Class *TestDescriptorDBU* - method *deleteTestDescriptor***

**Criteria for method *deleteTestDescriptor*:**

 - TestDescriptor is in database
 - No other entries depend on TestDescriptor


**Predicates for method *deleteTestDescriptor*:**

| Criteria                        | Predicate |
|---------------------------------|-----------|
| TestDescriptor is in database | Yes |
| | No |
| No other entries depend on TestDescriptor | Yes |
|  | No |


**Combination of predicates**:

| TestDescriptor is in database | No other entries depend on TestDescriptor | Valid / Invalid | Description of the test case  | Jest test case            |
|-----------|--------------|----------------|-----------------|-----------------|
| Yes | Yes | Valid | T1(validTest) -> true | `Delete Test Descriptor` |
| Yes | No | Invalid | T2(invalidTest) -> false | `Delete Test Descriptor - dependency detected` |
| No | Yes | Valid | T3(validTest) -> true | `Delete Test Descriptor - descriptor not found` |

# White Box Unit Tests

### Test cases definition

| Unit name | Jest test case |
|--|--|
|Position|[position.test.js](./code/server/unit_test/position.test.js)|
|SKUitem + SKUitemDBU |[skuItemDBU.test.js](./code/server/unit_test/skuItemDBU.test.js)|
|TestDescriptor + TestDescriptorDBU|[testDescriptorDBU.test.js](./code/server/unit_test/testDescriptorDBU.test.js)|
|TestResult + TestResultDBU|[testResultDBU.test.js](./code/server/unit_test/testResultDBU.test.js)|
|User + UserDBU|[userDBU.test.js](./code/server/unit_test/userDBU.test.js)|
|RestockOrder + RestockOrderDBU|[restockOrderDBU.test.js](./code/server/unit_test/restockOrderDBU.test.js)|
|ReturnOrder + ReturnOrderDBU|[returnOrderDBU.test.js](./code/server/unit_test/returnOrderDBU.test.js)|
|InternalOrder + InteralOrderDBU|[internalOrderDBU.test.js](./code/server/unit_test/internalOrderDBU.test.js)|
|Item + ItemDBU|[itemDBU.test.js](./code/server/unit_test/itemDBU.test.js)|

### Code coverage report

![Coverage](./Test-diagrams/coverage.png "coverage.png")

Notice that almost all uncovered lines are safety checks on possible exceptions thrown by `sqlite3` APIs. For this reason, we were not able to directly test them. 

### Loop coverage analysis

Our units include very few loops, with almost no logic. Such loops are all written with a forEach-like structure, hence they are automatically handled by JavaScript, without the need for explicit checks by hand.