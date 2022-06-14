# Estimation second round

On April 13 you estimated the effort to implement EZWH (Estimation.md) considering your requirements (RequirementsDocument.md)
At that time the productivity value used was 10 loc per person hour.   

Now, at project end, it is possible to repeat the 
estimation using the actual productivity of your team.


First we collect data from the past.   

We consider two phases in the project: <br>
-New development (release 1): From project start (march 22) to delivery of first version (code release v1, may 25) <br>
-Corrective Maintenance (release 2): fix of defects (if any)  (may 25 to june 8) with delivery of code release v2  <br>
Report effort figures from the timesheet, compute size from the source code.

## New development (release 1  -- march 22 to may 25)
| Measure| Value |
|---|---|
|effort E (report here effort in person hours, for all activities in the period, from your timesheet)  ||
|size S (report here size in LOC of all code written, excluding test cases)  ||
|productivity P = S/E ||
|defects before release D_before (number of defects found and fixed before may 25) ||



## Corrective Maintenance (release 2 -- may 26 to june 8)

| Measure | Value|
|---|---|
| effort for non-quality ENQ (effort for all activities in release 2, or effort to fix defects found when running official acceptance tests) ||
| effort for non quality, relative = ENQ / E ||
|defects after release D (number of defects found running official acceptance tests and  fixed in release 2) ||
| defects before release vs defects after release = D/D_before ||
|DD = defect density = D/S||
|D_fix = average effort to fix a defect = ENQ / D ||
|overall productivity OP = S/(E + ENQ)||

## Second estimation

Now it is possible to repeat the estimate using values from the past. We can also estimate (roughly) the number of defects and the effort to fix them.

|             | Estimate                        |             
| ----------- | ------------------------------- |  
| NC =  Estimated number of classes to be developed                 |                         |             
|  A = Estimated average size per class, in LOC                     |                            | 
| S_e = Estimated size of project, in LOC (= NC * A)                  |                                |
| E = Estimated effort, in person hours (here use overall productivity OP)  |                                  |   
| C = Estimated cost, in euro (here use 1 person hour cost = 30 euro)                   |         | 
| D_e = Estimated number of defects = DD * S_e||
| Estimated effort for non quality = D_e * D_fix ||
