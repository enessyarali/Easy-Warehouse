# `unit_test`  module

This module is used to test the interaction with the application database (`ezwh.db`).

Jest, by default, makes every test run in parallel. This can lead to major synchronization issues in the interaction with the database. To avoid these issues it is strongly recommended to run one test file at a time, otherwise it is not guaranteed the accuracy of the suite test.
