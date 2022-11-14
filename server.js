const express = require('express');
const dotenv = require('dotenv');//for env file
const path = require('path');
const cookieParser = require('cookie-parser')

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

dotenv.config({ path: 'config.env' });

const PORT = process.env.PORT;

// set view engine
app.set("view engine", "ejs");

// load assets
app.use('/css', express.static(path.resolve(__dirname, "assets/css")));
app.use('/js', express.static(path.resolve(__dirname, "assets/js")));

//load routers
app.use('/', require('./routes/routes'));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
});
