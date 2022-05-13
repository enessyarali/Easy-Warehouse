# `database_utilities` module

This module can be used to manage the interaction with the application database (`ezwh.db`).

The usage of the module is intended as follows:
- all __database__ consistency checks are automatically handled by this module (e.g., the insertion of a SKUitem referencing an unexisting SKU is blocked, as well as the update of a SKUitem RFID with an already-exixsting value).
- all __logical__ consistency checks should be done by the higher level (e.g., the module calling `skuDBU.insertPosition` should take care of passing a price which is greater than 0).