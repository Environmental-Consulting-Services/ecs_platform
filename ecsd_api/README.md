
# How to setup API service

### 1. Go to ecsd_api directory

### 2. Create a local MongoDB database, or a MongoDB deployment hosted in GCP

### 3. Create an .env file with:
DATABASE_URL= <the MongoDB database url>

JWT_SECRET=token

APP_URL_CLIENT=http://localhost:<the port you connect to>

APP_URL_API=http://localhost:<port>/api


### 4. Load data to the database
In the terminal use command: npm run seed

### 5. To run the server    
In the package.json file, remove line "type": "module"

For Windows:
In package.json, at "scripts" edit the line "start:dev" with "SET NODE_ENV=development & nodemon --exec babel-node --experimental-specifier-resolution=node src/server.js"

Then, use command npm run start:dev

If the code run successfully, it should print:

Server listening to <port>
DB connection
