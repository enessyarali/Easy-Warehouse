# Integration and API Test Report

Date: 23/05/2022

Version: 1.0

# Contents

- [Dependency graph](#dependency-graph)

- [Integration approach](#integration)

- [Tests](#tests)

- [Scenarios](#scenarios)

- [Coverage of scenarios and FR](#scenario-coverage)
- [Coverage of non-functional requirements](#nfr-coverage)



# Dependency graph 

![Dependency graph](./Test-diagrams/dependency-graph.svg "Dependency graph")
     
# Integration approach

    <Write here the integration sequence you adopted, in general terms (top down, bottom up, mixed) and as sequence
    (ex: step1: class A, step 2: class A+B, step 3: class A+B+C, etc)> 
    <Some steps may correspond to unit testing (ex step1 in ex above), presented in other document UnitTestReport.md>
    <One step will correspond to API testing>

  Since all `model` classes have few to none logic, we never test them explicitly - except `SKU` and `Position`. We simply check their behaviour is correct by source code inspection.
  Moreover, we decided not to use mock-ups, since by design 
  # --------supercazzola per farlo sembrare clever--------------
  Overall, we use a bottom-up approach:

  |Stack|Step 1|Step 2|Step 3|Step 4|Step 5|
  |-----|------|------|------|------|------|
  |**SKU + Position**|Position | Position + PositionDBU | Position + PositionDBU + SKU| Position + PositionDBU + SKU + skuDBU | Position + PositionDBU + SKU + skuDBU + SkuApi|
  |                  |         |                        | Position + PositionDBU + PositionApi |||
  |**SKUitem**|SKUitem + SkuItemDBU|SKUitem + SkuItemDBU + SkuItemApi||||
  |**TestDescriptor**|TestDescriptor + TestDescriptorDBU | TestDescriptor + TestDescriptorDBU + TestDescriptorApi ||||
  |**TestResult**|TestResult + TestResultDBU | TestResult + TestResultDBU + TestResultApi |
  |**User**|User + UserDBU | User + UserDBU + UserApi ||||
  |**RestockOrder**|RestockOrder + RestockOrderDBU | RestockOrder + RestockOrderDBU + RestockOrderApi ||||
  |**ReturnOrder**|ReturnOrder + ReturnOrderDBU | ReturnOrder + ReturnOrderDBU + ReturnOrderApi ||||
  |**InternalOrder**|InternalOrder + InternalOrderDBU | InternalOrder + InternalOrderDBU + InternalOrderApi ||||
  |**Item**|Item + ItemDBU|Item + ItemDBU + ItemApi||||
    

#  Integration Tests

   <define below a table for each integration step. For each integration step report the group of classes under test, and the names of
     Jest test cases applied to them, and the mock ups used, if any> Jest test cases should be here code/server/unit_test

## Step 1
Step1 actually corresponds to unit testing.
For further information, please refer to [UnitTestReport.md](UnitTestReport.md).

| Classes |Jest test cases |
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


## Step 2
Step2 is API testing for all stacks but `SKU` and `Position` ---------------

| Classes |Jest test cases |
|--|--|
|Position + PositionDBU|[positionDBU.test.js](./code/server/unit_test/positionDBU.test.js)|
|SKUitem + SKUitemDBU + SkuItemApi|[testSkuItemRouter.js](./code/server/test/testSkuItemRouter.js)|
|TestDescriptor + TestDescriptorDBU + TestDescriptorApi|[testTestDescriptorRouter.js](./code/server/test/testTestDescriptorRouter.js)|
|TestResult + TestResultDBU + TestResultApi|[testTestResultRouter.js](./code/server/test/testTestResultRouter.js)|
|User + UserDBU + UserApi|[testUserRouter.js](./code/server/test/testUserRouter.js)|
|RestockOrder + RestockOrderDBU + RestockOrderApi|[testRestockOrderRouter.js](./code/server/test/testRestockOrderRouter.js)|
|ReturnOrder + ReturnOrderDBU + ReturnOrderApi|[testReturnOrderRouter.js](./code/server/test/testReturnOrderRouter.js)|
|InternalOrder + InteralOrderDBU + InternalOrderApi|[testInternalOrderRouter.js](./code/server/test/testInternalOrderRouter.js)|
|Item + ItemDBU + ItemApi|[testItemRouter.js](./code/server/test/testItemRouter.js)|


## Step 3
Step3 is API testing for`Position` and model testing for  `SKU`
  
| Classes  |Jest test cases |
|--|--|
|Position + PositionDBU + PositionAPi|[testPositionRouter.js](./code/server/test/testPositionRouter.js)|
|Position + PositionDBU + SKU|[sku.test.js](./code/server/unit_test/sku.test.js)|

## Step 4
Step4 is Unit testing for `SKU`
  
| Classes  |Jest test cases |
|--|--|
|Position + PositionDBU + SKU + SkuDBU|[skuDBU.test.js](./code/server/unit_test/skuDBU.test.js)|

## Step 5
Step4 is Api testing for `SKU`
  
| Classes  |Jest test cases |
|--|--|
|Position + PositionDBU + SKU + SkuDBU + SkuApi|[testSkuRouter.js](./code/server/test/testSkuRouter.js)|

# API testing - Scenarios


<If needed, define here additional scenarios for the application. Scenarios should be named
 referring the UC in the OfficialRequirements that they detail>

## Scenario UCx.y

| Scenario |  name |
| ------------- |:-------------:| 
|  Precondition     |  |
|  Post condition     |   |
| Step#        | Description  |
|  1     |  ... |  
|  2     |  ... |



# Coverage of Scenarios and FR


<Report in the following table the coverage of  scenarios (from official requirements and from above) vs FR. 
Report also for each of the scenarios the (one or more) API Mocha tests that cover it. >  Mocha test cases should be here code/server/test


| Scenario ID | Functional Requirements covered | Mocha  Test(s) | 
| ----------- | ------------------------------- | ----------- | 
|  Scenario 1-1 | FR2.1 | Mocha Test Here |
|  Scenario 1-2 | FR2.4, FR2.1, FR3.1.1 | |
|  Scenario 1-3 | FR2.4, FR2.1 | |
|  Scenario 2-1 | FR3.1.1 | |
|  Scenario 2-2 | FR3.1.1 | |
|  Scenario 2-3 | FR3.1.4 | |
|  Scenario 2-4 | FR3.1.4 | |
|  Scenario 2-5 | FR3.1.2 | |
|  Scenario 3-1 | FR5.1, FR5.3, FR5.5, FR5.6 | |
|  Scenario 3-2 | FR5.1, FR5.5, FR5.3, FR5.6 | |
|  Scenario 4-1 | FR1.1 | |
|  Scenario 4-2 | FR1.1, FR1.5 | |
|  Scenario 4-3 | FR1.4, FR1.2 | |
|  Scenario 5-1-1 | FR3.2.1, FR5.8.1, FR5.7 | |
|  Scenario 5-2-1 | FR3.2.1, FR5.8.2, FR5.7 | |
|  Scenario 5-2-2 | FR3.2.1, FR5.8.2, FR5.7 | |
|  Scenario 5-2-3 | FR3.2.1, FR5.8.2, FR5.7 | |
|  Scenario 5-3-1 | FR5.8.3, FR3.1.4, FR2.4, FR2.1 FR5.7 | |
|  Scenario 5-3-2 | FR5.7 | |
|  Scenario 5-3-3 | FR5.8.3, FR3.1.4, FR2.4, FR2.1 FR5.7 | |
|  Scenario 6-1 | FR5.9, FR5.10, FR5.11 | |
|  Scenario 6-2 | FR5.9, FR5.10, FR3.1.4, FR2.4, FR2.1, FR5.11 | |
|  Scenario 7-1 | FR1.4 | |
|  Scenario 7-2 | FR1.5 | |
|  Scenario 9-1 | FR6.1, FR6.2, FR6.3, FR3.1.4, FR2.4, FR2.1, FR6.6, FR6.7  | |
|  Scenario 9-2 | FR6.1, FR6.2, FR6.3, FR3.1.4, FR2.4, FR2.1, FR6.6, FR6.7  | |
|  Scenario 9-3 | FR6.1, FR6.2, FR6.3, FR3.1.4, FR2.4, FR2.1, FR6.6, FR6.7  | |
|  Scenario 10-1 | FR5.10, FR6.10, FR6.8, FR6.7 | |
|  Scenario 11-1 | FR7, FR2.4 | |
|  Scenario 11-2 | FR7 | |
|  Scenario 12-1 | FR3.2.1, FR2.4 | |
|  Scenario 12-2 | FR3.2.2 | |
|  Scenario 12-3 | FR3.2.3 | |


# Coverage of Non Functional Requirements


<Report in the following table the coverage of the Non Functional Requirements of the application - only those that can be tested with automated testing frameworks.>


### 

| Non Functional Requirement | Test name |
| -------------------------- | --------- |
|                            |           |

## Every test in the Apı measure the tıme needed to perform the operatıons and it checks if it is less than 500ms 
