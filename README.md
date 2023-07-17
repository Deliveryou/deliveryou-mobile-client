## Graduation thesis project (2023)
This project is a part of the graduation project and acts as a product demo.
>The **Deliveryou** project consists of 3 separate repositories: [deliveryou-server](https://github.com/Deliveryou/deliveryou-server) for the server side and [deliveryou-mobile-manager](https://github.com/Deliveryou/deliveryou-mobile-manager)/[deliveyou-mobile-client](https://github.com/Deliveryou/deliveryou-mobile-client) for the client side.
## Deliveryou
The **Deliveryou** project consists of 3 separate repositories: [deliveryou-server](https://github.com/Deliveryou/deliveryou-server) for the server side and [deliveryou-mobile-manager](https://github.com/Deliveryou/deliveryou-mobile-manager)/[deliveyou-mobile-client](https://github.com/Deliveryou/deliveryou-mobile-client) for the client side.
## Features
-   **Server**: handles requests from the client apps and provides resources such as maps, routes, chat messages, etc.

-   **Client app**: allows clients to create delivery packages with detailed information, view the status and location of their packages, chat with the matched driver, rate and review the service, etc.

-   **Driver app**: allows drivers to view available delivery jobs, accept and complete them, chat with the client, view their income and performance, etc.

-   **Manager app**: allows managers to monitor and manage the delivery system, users and drivers, generate reports and statistics, etc.

## Technologies
- **Database**: MySQL.
- **Server side**: Spring boot with Java, Spring Data JPA `(database manipulation)`, LocationIQ `(geolocation processing)`, Sendbird `(real-time chat/voice call functionalities)`, Cloudinary `(media storage)`.
	>The server also supports **websocket** `(for bidirectional communication)` and **GraphQL**  `(fetching only required data with queries)` .
- **Client side** (mobile): React Native with Typescript, Javascript, Java and Google Firebase.

## Requisites
- **MySQL**: the default 3306 port must be used.
- **Spring Boot server**: should be built with Java 17 or newer, modify the `application.properties` file to fit your system configurations, the default server port is 8080 (http).
	>*Https is also supported but might not work as intended as this project is configured to run on virtual machines for demo purpose only.*
>
- **Mobile app**: only Android is supported at the moment, Android SDK level 23 or newer is required.

## Screenshots
### Client app:
![](https://i.imgur.com/ukAVYKu.png)
![](https://i.imgur.com/lm9W7Zj.png)
![](https://i.imgur.com/0eRV61G.png)
![](https://i.imgur.com/vuFSvUH.png)
![](https://i.imgur.com/rwmYmRM.png)
![](![](https://i.imgur.com/v96MWxx.png))
![](https://i.imgur.com/8S9NgZW.png)
![](https://i.imgur.com/eKOTqLd.png)
![](https://i.imgur.com/EaZI2bL.png)
![](https://i.imgur.com/ZtfvsAK.png)
![](https://i.imgur.com/1ugXECq.png)
<br/>
### Shipper app:
![](https://i.imgur.com/SywN7Wb.png)
![](https://i.imgur.com/Wazk7Rh.png)
![](https://i.imgur.com/XHRW1wR.png)
![](https://i.imgur.com/uFx7pcP.png)
![](https://i.imgur.com/6vyDxvn.png)
![](https://i.imgur.com/VCH0pN7.png)
![](https://i.imgur.com/bZ1fhGv.png)
![](https://i.imgur.com/rSQpcnr.png)
