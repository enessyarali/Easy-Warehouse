# `unit_test`  module

This module is used to test the interaction with the application database (`ezwh.db`).

Jest, by default, executes in parallel tests in different files. This can lead to major synchronization issues in the interaction with the database.  
To avoid such issues, tests **must** be run by explicitly enforcing serial execution. This can be done with the following command:  

```npm run test -- --runInBand```