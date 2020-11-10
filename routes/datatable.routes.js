const express = require('express');
const router = express.Router();
const db = require('../db');
var fs = require('fs');
//ovdje ostavljam sve konvertere koje sam (bezuspješno) isprobala, ukoliko mi zatrebaju u budućnosti
//const { parse } = require('json2csv');
//const ObjectsToCsv = require('objects-to-csv');
//const { convertArrayToCSV } = require('convert-array-to-csv'); 
//const converter = require('convert-array-to-csv');
const converter = require('json-2-csv');

router.get('/', async function (req, res, next) {
    const sqlDrzave = `SELECT * FROM drzava;`;
    const sqlJezici = `SELECT * FROM sluzbeni_jezik NATURAL JOIN jezik;`;
    try {
        const resultDrzave = (await db.query(sqlDrzave, [])).rows;
        const resultJezici = (await db.query(sqlJezici, [])).rows;
        console.log(resultDrzave);
        console.log(resultJezici);

        res.render('datatable', {
            drzave: resultDrzave,
            jezici: resultJezici,
            filter: "vaš_budući_podniz",
            atribut: "vaš_budući_atribut"
            });
    } catch (err) {
        console.log(err);
    }
});

router.post('/', async function (req, res, next) {
    const sqlDrzave = `SELECT * FROM drzava;`;
    const sqlJezici = `SELECT * FROM sluzbeni_jezik NATURAL JOIN jezik;`;
    try {
        const resultDrzave = (await db.query(sqlDrzave, [])).rows;
        const resultJezici = (await db.query(sqlJezici, [])).rows;
        console.log(resultDrzave);
        console.log(resultJezici);

        res.render('datatable', {
            drzave: resultDrzave,
            jezici: resultJezici,
            filter: req.body.filter,
            atribut: req.body.atribut, 
            });

        var filtriraneDrzave = [];

        filter = req.body.filter;
        filter = filter.toLowerCase();

        atribut = req.body.atribut;

        var drzave = fs.readFileSync('drzave.json');
        drzave = JSON.parse(drzave);
        
       for (let drzava of drzave){
       
           switch(atribut){
               case "wildcard": {
                   if(drzava.naziv.toLowerCase().includes(filter) || drzava.iso_3116_alpha_3.toLowerCase().includes(filter) || drzava.glavni_grad.toLowerCase().includes(filter) 
                   || drzava.valuta.toLowerCase().includes(filter) || drzava.pozivni_broj.toLowerCase().includes(filter) || drzava.top_level_domena.toLowerCase().includes(filter) 
                   || drzava.naziv_himne.toLowerCase().includes(filter) || drzava.povrsina.toString().includes(filter) || drzava.strana_voznje.toLowerCase().includes(filter))
                       filtriraneDrzave.push(drzava);
                   else{
                       for (jezik of resultJezici){
                           if (jezik.iso_3116_alpha_3 == drzava.iso_3116_alpha_3 && (jezik.naziv.toLowerCase().includes(filter) || jezik.iso_639.toLowerCase().includes(filter)))
                               filtriraneDrzave.push(drzava);
                       }
                   }
                   break;
               }
               case "drzava.naziv":{
                   if(drzava.naziv.toLowerCase().includes(filter))
                       filtriraneDrzave.push(drzava);
                   break;
               }
   
               case "iso_3116_alpha_3":{
                   if(drzava.iso_3116_alpha_3.toLowerCase().includes(filter))
                       filtriraneDrzave.push(drzava);   
                   break;
               }
   
               case "glavni_grad":{
                   if(drzava.glavni_grad.toLowerCase().includes(filter))
                       filtriraneDrzave.push(drzava);  
                   break;
               }
               
               case "Oznaka valute":
               case "valuta":{
                   if(drzava.valuta.toLowerCase().includes(filter))
                       filtriraneDrzave.push(drzava);
                   break;
               }
   
               case "pozivni_broj":{
                   if(drzava.pozivni_broj.toLowerCase().includes(filter))
                       filtriraneDrzave.push(drzava);
                   break;
               }
   
               case "top_level_domena":{
                   if(drzava.top_level_domena.toLowerCase().includes(filter))
                       filtriraneDrzave.push(drzava);
                   break;
               }
   
               case "naziv_himne":{
                   if(drzava.naziv_himne.toLowerCase().includes(filter))
                       filtriraneDrzave.push(drzava);
                   break;
               }
   
               case "povrsina":{
                   if(drzava.povrsina.toString().includes(filter))
                       filtriraneDrzave.push(drzava);
                   break;
               }
   
               case "strana_voznje":{
                   if(drzava.strana_voznje.toLowerCase().includes(filter))
                       filtriraneDrzave.push(drzava);
                   break;
               }
   
               case "jezik.naziv":{
                   for (jezik of resultJezici){
                       console.log(jezik);
                       if (jezik.iso_3116_alpha_3 == drzava.iso_3116_alpha_3 && jezik.naziv.toLowerCase().includes(filter)
                       && !filtriraneDrzave.includes(drzava))
                           filtriraneDrzave.push(drzava);
                   }
                   break;
               }
   
               case "iso_639":{
                   for (jezik of resultJezici){
                       if (jezik.iso_3116_alpha_3 == drzava.iso_3116_alpha_3 && jezik.iso_639.toLowerCase().includes(filter)
                       && !filtriraneDrzave.includes(drzava))
                           filtriraneDrzave.push(drzava);
                   }
                   break;
               }
           }
       }

       /*
        const csv = new ObjectsToCsv(filtriraneDrzave);
       */
    
        /*
    const csvFiltriraneDrzave = convertArrayToCSV(filtriraneDrzave, {
        separator: ';'
      }); */

      /*
      try {
        const csv = parse(csv, JSON.stringify(filtriraneDrzave, null, 2));
        console.log(csv);
      } catch (err) {
        console.error(err);
      }
      */

      
     // console.log(filtriraneDrzave);

      var filtriraneDrzaveCSV;

     converter.json2csv(filtriraneDrzave, (err, filtriraneDrzaveCSV) => {
        if (err) {
            throw err;
        }
    
         // console.log(csv);
         fs.writeFileSync('filtriraneDrzave.csv', filtriraneDrzaveCSV); 
    });


    fs.writeFileSync('filtriraneDrzave.json', JSON.stringify(filtriraneDrzave, null, 2)); 
    } catch (err) {
        console.log(err);
    }

});
module.exports = router;