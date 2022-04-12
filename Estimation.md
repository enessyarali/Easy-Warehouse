# Project Estimation
Authors: Ilaria Pilo, Marco Sacchet, Luca Scibetta, Enes Yarali

Date: 12 April 2022

Version: 1.2


# Estimation approach
All estimations are based on our judgment and slightly supported by previous projects.

## Estimate by size
### 
|             | Estimate                        |             
| ----------- | ------------------------------- |  
| NC =  Estimated number of classes to be developed   |       50 classes                     |             
|  A = Estimated average size per class, in LOC       |         200 LOC/class                  | 
| S = Estimated size of project, in LOC (= NC * A) | 10,000 LOC|
| E = Estimated effort, in person hours (here use productivity 10 LOC per person hour)  |             1,000 ph                         |   
| C = Estimated cost, in euro (here use 1 person hour cost = 30 euro) | € 30,000| 
| Estimated calendar time, in calendar weeks (Assume team of 4 people, 8 hours per day, 5 days per week ) |     6.25 calendar weeks               |               

## Estimate by product decomposition
### 
|         Component name    | Estimated effort (person hours)   |             
| ----------- | ------------------------------- | 
|Requirement document    | 130 ph |
| GUI prototype | 70 ph|
|Design document | 100 ph|
|Code |350 ph|
| Unit tests |200 ph|
| API tests |150 ph|
| Management documents  |70 ph|



## Estimate by activity decomposition
### 
|         Activity name    | Estimated effort (person hours)   |             
| ----------- | ------------------------------- | 
| Inception ||
| Perform word analysis | 32 |
| Identify basic requirements | 32 |
| Requirement Engineering ||
| Collect informal requirements | 96 |
| All stakeholders have been contacted | 0 |
| Formalize requirements | 160 |
| Perform consistency verification | 32 |
| Document is consistent | 0 |
| GUI Prototyping ||
| Sketch GUI | 64 |
| Create computer mock-up | 96 |
| Perform consistency verification | 32 |
| Prototype is consistent with requirements | 0 |
| Collect in-vitro feedback | 96 |
| Feedback is positive | 0 |
| Designing ||
| Perform analysis | 160 |
| Formalize design | 96 |
| Perform consistency verification | 32 |
| Document is consisten | 0 |
| Coding ||
| Code back-end modules | 256 |
| Code front-end modules | 256 |
| Manage modules interaction | 160 |
| Unit Tests ||
| Prepare and run Unit tests | 160 |
| Tests are passed | 0 |
| API Tests ||
| Prepare and run API tests | 160 |
| Tests are passed | 0 |
| Management Documents ||
| Write README file | 16 |
| Produce user documentation | 128 |
| Deployment ||
| Deploy whole system | 0 |

###
![Gantt activity diagram](gantt_diagram.jpg "Gantt activity diagram")

## Summary

Report here the results of the three estimation approaches. The  estimates may differ. Discuss here the possible reasons for the difference

|             | Estimated effort                        |   Estimated duration |          
| ----------- | ------------------------------- | ---------------|
| Estimate by size |1,000 ph| 6.25 calendar weeks |
| Estimate by product decomposition | 1,070 ph | 6.8 calendar weeks |
| Estimate by activity decomposition |1,952 ph| 12.2 calendar weeks |




