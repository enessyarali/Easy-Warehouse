# Graphical User Interface Prototype  

Authors: Ilaria Pilo, Marco Sacchet, Luca Scibetta, Enes Yarali

Date: 08 April 2022

Version: 1.0

For our prototype, we imagined the usage of EzWh in a medium size company designing and building movie and theatre sets (for this reason, the warehouse mainly stores furniture).

## Login page

![Login page](./GUI/Login-page.png "Login page")

All employees can log in from the same, common page. The application then loads and makes available different functionalities according to the privilege of the employee.

## Home page

![Warehouse manager home page](./GUI/Home-page.png "Warehouse manager home page")

The home page provides a quick and intuitive access to all functionalities for a given profile.  
In this example, we are showing the home page of a Warehouse Manager.

## Searching the warehouse

![Search page](./GUI/Search-page.png "Search page")

Searching the catalogue of the warehouse is the basic functionality of the application, to which all users have access.
A handy sidebar provides different types of filters, to ensure each employee can find the fittest item descriptor in the shortest time.  

![Search page (profile pop-up detail)](./GUI/Search-page-profile.png "Search page (profile pop-up detail)")

All pages are characterized by the same navigation bar. A user button on the right side shows a quick-access profile menu.

## Orders history

![Orders history page](./GUI/My-orders.png "Orders history page")

Both Warehouse Manager (for external orders) and Unit Supervisor (for internal orders) have access to an apposite page providing an overview on the orders history. They can then click on the single order to inspect its details. All orders whose status is *In progress* have also a trash icon button, to be used for fast deletion.  
In this example, we are showing the orders history of a Warehouse Manager.

## Adding a new item

![Add new item form](./GUI/Add-new-item.png "Add new item form")

Whenever a new item descriptor is added to the catalogue, the Warehouse Manager needs to manually insert it in the application database. However, thanks to the provided form, such task becomes easy and intuitive.  
A dual approach is used to handle the insertion of a new supplier.

## Tracking positions

![Pop-up for positions tracking](./GUI/Track-position.png "Pop-up for positions tracking")

After selecting a given item descriptor, all users having Warehouse Worker's privileges can click on the <u>See position</u> label to retrieve the physical position of all items inside the warehouse.  
They can also add new position by clicking on the proper button.

## Short supply and external orders

![Pop-up for external orders management](./GUI/Short-supply.png "Pop-up for external orders management")

Whenever the Warehouse Manager receives a notification for a short supply, he/she can click on it to be conveniently redirected to the external order page. The same page can be manually reached by querying the catalogue in the proper search bar with the item name, and then clicking on the <u>Short supply!</u> danger button.  
The page shows a list of supplier for the item, sorted by increasing price. It is also possible to order from many different suppliers in one shot.

## Quality tests management

All users having Quality Officer's privileges have access to additional functionalities to support tests management.  

![Add new test form](./GUI/Add-new-test.png "Add new test form")

Through their home page, Quality Officers can open a form to easily record information about a given test.  
Whenever the result of the test is marked as *Rejected*, a pop-up is shown, leading to some pre-compiled documents to support the rejection procedure.

![Pop-up for tests management](./GUI/Tests-history.png "Pop-up for tests management")

Moreover, after selecting a given item descriptor, they can click on the <u>Tests history</u> label to quickly access all tests on that item descriptor.

## Internal orders

![Unit Supervisor internal order page](./GUI/Internal-order.png "Unit Supervisor internal order page")

Unit Supervisors have limited access to warehouse information, hence they can simply query the catalogue and place internal orders. All internal and *physical* information are hidden to them.
