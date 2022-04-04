
 #Requirements Document 

Date: 22 march 2022

Version: 1.1

 
| Version number | Change |
| ----------------- |:-----------|
| 1.1 |  | 


# Contents

- [Informal description](#informal-description)
- [Stakeholders](#stakeholders)
- [Context Diagram and interfaces](#context-diagram-and-interfaces)
	+ [Context Diagram](#context-diagram)
	+ [Interfaces](#interfaces) 
	
- [Stories and personas](#stories-and-personas)
- [Functional and non functional requirements](#functional-and-non-functional-requirements)
	+ [Functional Requirements](#functional-requirements)
	+ [Non functional requirements](#non-functional-requirements)
- [Use case diagram and use cases](#use-case-diagram-and-use-cases)
	+ [Use case diagram](#use-case-diagram)
	+ [Use cases](#use-cases)
    	+ [Relevant scenarios](#relevant-scenarios)
- [Glossary](#glossary)
- [System design](#system-design)
- [Deployment diagram](#deployment-diagram)

# Informal description
Medium companies and retailers need a simple application to manage the relationship with suppliers and the inventory of physical items stocked in a physical warehouse. 
The warehouse is supervised by a manager, who supervises the availability of items. When a certain item is in short supply, the manager issues an order to a supplier. In general the same item can be purchased by many suppliers. The warehouse keeps a list of possible suppliers per item. 

After some time the items ordered to a supplier are received. The items must be quality checked and stored in specific positions in the warehouse. The quality check is performed by specific roles (quality office), who apply specific tests for item (different items are tested differently). Possibly the tests are not made at all, or made randomly on some of the items received. If an item does not pass a quality test it may be rejected and sent back to the supplier. 

Storage of items in the warehouse must take into account the availability of physical space in the warehouse. Further the position of items must be traced to guide later recollection of them.

The warehouse is part of a company. Other organizational units (OU) of the company may ask for items in the warehouse. This is implemented via internal orders, received by the warehouse. Upon reception of an internal order the warehouse must collect the requested item(s), prepare them and deliver them to a pick up area. When the item is collected by the other OU the internal order is completed. 

EZWH (EaSy WareHouse) is a software application to support the management of a warehouse.



# Stakeholders


| Stakeholder category | Subcategory |Name  | Description | 
| -----|-----|------- |:-----------:|
| COMPANY ||| Commercial business employing the EZWH application|
||CEO||Chief Executive Officer, buys the software to manage the company warehouse|
||IT Department||Department in charge of establishing, monitoring and maintaining IT systems and services|
|||IT administrator|Manages the application and its functionalities|
|||Security manager|Assesses and possibly enhances policies to protect confidential information|
|||DB administrator|Manages the interaction with the company database|
||Warehouse (WH)||Building storing manufactured goods prior to their distribution| 
|||Warehouse worker|Works *inside* the warehouse, physically interacts with items|
|||Warehouse manager| Supervises the availability of items in the warehouse|
|||Quality officer| Is responsible for testing items quality|
||Organizational Unit (OU)||Part of the company focused on a particular task|
|||Unit supervisor|Manages the OU requests for items in the warehouse|
||Financial Department||Unit responsible for handling company funds|
||Database || Pre-existing database, keeping track of the warehouse content|
|SOFTWARE HOUSE|||Company in charge of designing and developing the EZWH application|
||CEO||Chief Executive Officer, responsible for taking managerial decision|
|||Project manager|Plans and executes the EZWH project|
|||Developer|Writes, debugs and executes the software source code|
|||Analyst|Defines requirements for the application|
|||Tester|Checks whether the application is compliant with the requirements|
|COMPETITOR|||Software already on the market offering the same or similar services as EZWH|
|SUPPLIER|||Organization providing items to the company|
|COURIER|||Company transporting commercial packages and documents|



# Context Diagram and interfaces

## Context Diagram
\<Define here Context diagram using UML use case diagram>

\<actors are a subset of stakeholders>

## Interfaces

| Actor | Logical Interface | Physical Interface  |
|-------|-------------------|---------------------|
|Warehouse manager |Landscape desktop GUI |Screen, keyboard, mouse |
|Unit supervisor |Landscape desktop GUI |Screen, keyboard, mouse |
|IT administrator |Landscape desktop GUI, command line interface |Screen, keyboard, mouse |
|Quality officer |Landscape desktop GUI |Screen, keyboard, mouse |
|Warehouse worker |Landscape desktop GUI |Tablet |
|Database |APIs| Internet Connection |


# Stories and personas
\<A Persona is a realistic impersonation of an actor. Define here a few personas and describe in plain text how a persona interacts with the system>

\<Persona is-an-instance-of actor>

\<stories will be formalized later as scenarios in use cases>


# Functional and non functional requirements

## Functional Requirements

\<In the form DO SOMETHING, or VERB NOUN, describe high level capabilities of the system>

\<they match to high level use cases>

| ID        | Description  |
| ------------- |:-------------:| 
|  FR1     |  |
|  FR2     |   |
| FRx..  | | 

## Non Functional Requirements

\<Describe constraints on functional requirements>

| ID        | Type (efficiency, reliability, ..)           | Description  | Refers to |
| ------------- |:-------------:| :-----:| -----:|
|  NFR1     |   |  | |
|  NFR2     | |  | |
|  NFR3     | | | |
| NFRx .. | | | | 


# Use case diagram and use cases


## Use case diagram
\<define here UML Use case diagram UCD summarizing all use cases, and their relationships>


\<next describe here each use case in the UCD>
### Use case 1, UC1
| Actors Involved        |  |
| ------------- |:-------------:| 
|  Precondition     | \<Boolean expression, must evaluate to true before the UC can start> |
|  Post condition     | \<Boolean expression, must evaluate to true after UC is finished> |
|  Nominal Scenario     | \<Textual description of actions executed by the UC> |
|  Variants     | \<other normal executions> |
|  Exceptions     | \<exceptions, errors > |

##### Scenario 1.1 

\<describe here scenarios instances of UC1>

\<a scenario is a sequence of steps that corresponds to a particular execution of one use case>

\<a scenario is a more formal description of a story>

\<only relevant scenarios should be described>

| Scenario 1.1 | |
| ------------- |:-------------:| 
|  Precondition     | \<Boolean expression, must evaluate to true before the scenario can start> |
|  Post condition     | \<Boolean expression, must evaluate to true after scenario is finished> |
| Step#        | Description  |
|  1     |  |  
|  2     |  |
|  ...     |  |

##### Scenario 1.2

##### Scenario 1.x

### Use case 2, UC2
..

### Use case x, UCx
..



# Glossary

\<use UML class diagram to define important terms, or concepts in the domain of the system, and their relationships> 

\<concepts are used consistently all over the document, ex in use cases, requirements etc>

# System Design
\<describe here system design>

\<must be consistent with Context diagram>

# Deployment Diagram 

\<describe here deployment diagram >




