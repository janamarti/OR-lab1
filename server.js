//uvoz modula
const express = require('express');
const app = express();
const path = require('path');
const pg = require('pg');
const db = require('./db');

//uvoz modula s definiranom funkcionalnosti ruta
const datatableRouter = require('./routes/datatable.routes');
//const janaRouter = require('./routes/jana.routes'); 

//middleware - predlošci (ejs)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//middleware - statički resursi
app.use(express.static(path.join(__dirname, 'public')));

//middleware - dekodiranje parametara
app.use(express.urlencoded({extended: true}));


app.use((req, res, next) => {
    next();
});

//definicija ruta
app.use('/', datatableRouter);
//app.use('/', janaRouter);


//pokretanje poslužitelja na portu 3000
app.listen(3000);