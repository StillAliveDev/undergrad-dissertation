# Fitment Companion Proof or Concept
A proof of concept inventory management system with NFC tagging and real-time database capabilities for Android, intended to demonmstrate the possible use of Hybrid Applications, NFC/RFID tags, and Real-time communications in an industry based use case. 

-created as the practical side of my Computer Science Dissertation.

The main folders used in the final project are:
  - mobile_app
  - serverside
  - web_app
  
  
# Summary

This application comes in three parts, Fitment Companion Mobile, Fitment Companion Web and the application's accompanying serverside.

The mobile application is a hybrid application, written with AngularJS, Ionic, HTML and CSS. and makes use of the Telerik NFC plugin for Cordova to communicate directly with the device's NFC hardare to use NFC or RFID tags for data storage. The application is a vehicle repair/parts manaement system that allows a user to record repairs or alterations tha are being made to a vehicle. The user would scan an NFC tag that can accompany a vehicle's detail sheet to pull up information from a MySQL database about that vehicle, including any fitment operations that are required. This application also keeps track of a pseudo-inventory system, where tags can represent parts that are stored in a workshop's storage.

Copuled with the mobile app is a web application, also written with AngularJS that tracks in realtime users, parts or fitments statuses and alows for creation of new user, part, and fitment records which are reflected instantly in the mobile application.

The serverside is intended to communicate with a MySQL based database to store all infomration used by the application. The serverside communicates with the mobile and web applictions using Socket.IO so that realtime transmissions are possible.
