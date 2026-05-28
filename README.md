# TofuPancake-TypeRacer
COVID-19 has isolated us all from our loved ones. Many of us turned to online video gamesto imitate the face-to-face interaction we lacked. Current type-racer games can get boringvery quickly because they lack complex game elementsand are also hard to bond over withas they lack multiplayer, interactive elements. Players do not truly interact with one another. We would like to build a light-weight browser game that can combine these “type-racer” and multiplayer elements to create something that people can not only have fun with, but can improve an essential skill with their beloved ones. We hope this will bring people a sense of fulfillment and connection over the internet.

## Project Overview and Features
![image](https://user-images.githubusercontent.com/1279011/117000498-43f60280-ad35-11eb-93c6-9b0edbeb6062.png)

The game is available online at: https://tofupancake.com/ (We are using a free tier Heroku server, this means that it could take a few minutes for the server to reboot when a user clicks the link.)

### Features
| Feature       | Description           |
| ------------- |-------------|
| Sabotages | Players are able to sabotage other players in the game upon typing more than half the text. Sabotages currently include Blind (players can only see text close to where they are currently typing), mixup (the next two words swap positions) and Confusion (some text is changed to special characters).|
| The base typing game | A competition between peers to see how fast each can type a prose of text.![image](https://user-images.githubusercontent.com/1279011/117001556-9e439300-ad36-11eb-899d-20b15f1747ec.png)|
| Real-time multiplayer | Reactive frontend with short response times, that enhance the competitive and interactive aspect between racers.![image](https://user-images.githubusercontent.com/1279011/117000831-c1ba0e00-ad35-11eb-9f11-e4578e0cdf42.png)|
| Help Dialogue | Tutorial and suggestions to help users learn the application. ![image](https://user-images.githubusercontent.com/1279011/117001034-f928ba80-ad35-11eb-821b-8632079eae95.png)|
| Leaderboard | Leaderboard to help players track themselves and also to compare to other players around the world. ![image](https://user-images.githubusercontent.com/1279011/117001068-00e85f00-ad36-11eb-9441-0e35f6d181f8.png)|
| Material UI | Engaging, fun and modern UI interface |
| Firebase login | User accounts to store match history and to associate leader boards with users. ![image](https://user-images.githubusercontent.com/1279011/117001153-18bfe300-ad36-11eb-996a-c7f543b02f87.png)|
| Match History | Registered users are able to view their most recent matches. ![image](https://user-images.githubusercontent.com/1279011/117001479-82d88800-ad36-11eb-8f7b-b5bbb36ee40b.png)|

## Technologies
We utilized the MERN stack along with a few other technologies to create a fun and interactive game.
* Mongoose: To interact with the MongoDB database.
* Express: To create an RESTful backend server to retrieve leaderboard and match history.
* React: To create an interactive frontend.
* NodeJS: To for the backend.
* Firebase: Used for authentication and authorization.
* SocketIO: Used for real-time communication between players.
* Material-UI: To create a beautiful and somewhat responsive user interface.

## Project Setup
### Prerequisites
Node Version: v14.16.0 <br>
NPM Version: 7.6.0 or 7.9.0

### Installing dependencies
With npm: <br>
Frontend:
```
cd frontend
npm ci
```
Backend:
```
cd backend
npm ci
```
Alternatively, ```npm i``` can be used instead of ```npm ci```.

### Running the project
Running the frontend:
```
cd frontend
npm start
```
Running the backend:
```
cd backend
npm run dev
```

### Testing the project
Before running any tests. Make sure the frontend and backend are <b>not</b> running locally. <br>
Testing the frontend:
```
cd frontend
npm test
```
Testing the backend:
```
cd backend
npm test
```

### Inserting Text
[How to insert text](/text/README.md)

## The Team
|Name|UPI|Github Username|
|:--:|:-:|:-------------:|
|David Xiao|dxia063|David-Xia0|
|Elisa Yansun|eyan868|Milk-Yan|
|Jennifer Lowe|jlow987|parfei|
|Tianren Shen|tshe695|Tianrens|

### Music
Royalty Free Music — Creative Commons - Mornings with u by Barradeen [ Hip-Hop / Rap ]: https://www.youtube.com/watch?v=6qy_1S3y8J0

## Deploy to Render with Neon Database

This repository includes a Blueprint configuration (`render.yaml`) to seamlessly deploy the application as a single unified service to Render connected to a serverless **Neon PostgreSQL** database.

### Setup Steps
1. **Provision a Neon Postgres Database:**
   - Log in to the [Neon Console](https://console.neon.tech/) and create a new project.
   - Copy your connection string from the Dashboard (e.g. `postgresql://user:pass@ep-hostname.region.pooler.neon.tech/neondb?sslmode=require`).
2. **Deploy via Render Blueprint:**
   - Go to your [Render Dashboard](https://dashboard.render.com/) and choose **New -> Blueprint**.
   - Connect your fork or clone of this repository.
3. **Set the Environment Variables:**
   - Render will identify the environment variable requirement for `DATABASE_URL` from the blueprint.
   - Securely paste your copied Neon connection string.
   - Submit and trigger the deploy. Render will automatically install dependencies, build the frontend React application, compile the backend with Babel, host the static SPA files under Express, and run the service.