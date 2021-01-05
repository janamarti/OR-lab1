const express = require('express');
const router = express.Router();
const db = require('../db');
var hateoasLinker = require('express-hateoas-links');
var bodyParser = require('body-parser');
var cors = require('cors'); 
router.use(cors());
router.use(hateoasLinker);   




router.get('/drzave', async function (req, res, next) {
 
    const sqlDrzave = `SELECT * FROM drzava;`;

    hateoasLinker.apply;
    try {
        const resultDrzave = (await db.query(sqlDrzave, [])).rows;

        res.status(200).json({
          status:"OK",
          message:"Drzave su uspjesno dohvacene",
          response:resultDrzave,
          links:[  
      { rel: "self", method: "GET", href: '/drzave' },
      { rel: "read", method: "GET", title: 'GET svi jezici', href: '/jezici' }
    ]});

    } catch (err) {
        console.log(err);
    }      
}); 



router.get('/jezici', async function (req, res, next) {
 
  const sqlJezici = `SELECT * FROM jezik;`;
  hateoasLinker.apply;
  try {
      const resultJezici = (await db.query(sqlJezici, [])).rows;
      res.status(200).json({
        status:"OK",
        message:"Jezici su uspjesno dohvaceni",
        response:resultJezici,
        links:[  
    { rel: "self", method: "GET", href: '/jezici' },
    { rel: "read", method: "GET", title: 'GET sve drzave', href: '/drzave' }
  ]});

  } catch (err) {
      console.log(err);
  }      
}); 

router.get('/drzave/:id', async function (req, res, next) {
 
  const sqlDrzavaId = `SELECT *  FROM drzava 
                      WHERE iso_3116_alpha_3 = '` + req.params.id + `'`;
  hateoasLinker.apply;
  try {
      const resultDrzavaId = (await db.query(sqlDrzavaId, [])).rows;

      if(resultDrzavaId.length){
        res.status(200).json({
          status:"OK",
          message:"Drzava je uspjesno dohvacena",
          response:resultDrzavaId,
          links:[  
      { rel: "read", method: "GET", title: 'GET sluzbeni jezici ove drzave', href: '/drzave/'+req.params.id+'/sluzbenijezici' },
      { rel: "read", method: "GET", title: 'GET sve drzave', href: '/drzave' }  
  ]})}
      else res.status(404).json({
        status:"NOT FOUND",
        message:"Drzava s oznakom " + req.params.id + " nije pronadena",
        response:resultDrzavaId,
        links:[  
    { rel: "read", method: "GET", title: 'GET sve drzave', href: '/drzave' }  
  ]})

} catch (err) {
  console.log(err);
}
});

router.get('/jezici/:id', async function (req, res, next) {
 
  const sqlJezikId = `SELECT *  FROM jezik 
                      WHERE ISO_639 = '` + req.params.id + `'`;
  hateoasLinker.apply;
  try {
      const resultJezikId = (await db.query(sqlJezikId, [])).rows;

      if(resultJezikId.length){
        res.status(200).json({
          status:"OK",
          message:"Jezik je uspjesno dohvacen",
          response:resultJezikId,
          links:[  
      { rel: "self", method: "GET", href: '/jezici' },
      { rel: "read", method: "GET", title: 'get all authors', href: '/api/authors' } 
  ]})}
      else res.status(404).json({
        status:"NOT FOUND",
        message:"Jezik s oznakom " + req.params.id + " nije pronaden",
        response:resultJezikId,
        links:[  
    { rel: "self", method: "GET", href: '/jezici' }
  ]})

} catch (err) {
  console.log(err);
}
});





  router.get('/drzave/:id/sluzbenijezici', async function (req, res, next) {
 
    const sqlSluzbeniJezikId = `SELECT jezik.*
                        FROM drzava LEFT JOIN sluzbeni_jezik NATURAL JOIN jezik
				                ON drzava.iso_3116_alpha_3 = sluzbeni_jezik.iso_3116_alpha_3
                        WHERE drzava.iso_3116_alpha_3 = '` + req.params.id + `'`;
    hateoasLinker.apply;
    try {
        const resultSluzbeniJezik = (await db.query(sqlSluzbeniJezikId, [])).rows;
  
        if(resultSluzbeniJezik.length){
          res.status(200).json({
            status:"OK",
            message:"Drzava i njeni sluzbeni jezici su uspjesno dohvaceni",
            response:resultSluzbeniJezik,
            links:[  
        { rel: "read", method: "GET", title: 'GET ovu drzavu', href: '/drzave/'+req.params.id }, 
        { rel: "read", method: "GET", title: 'GET sve drzave', href: '/drzave' }, 
        { rel: "read", method: "GET", title: 'GET sve jezike', href: '/jezici' }, 
    ]})}
        else res.status(404).json({
          status:"NOT FOUND",
          message:"Drzava s oznakom " + req.params.id + " nije pronadena",
          response:resultSluzbeniJezik,
          links:[  
      { rel: "read", method: "GET", title: 'GET sve drzave', href: '/drzave' } 
    ]})
  } catch (err) {
    console.log(err);
}      
}); 


router.delete('/drzave/:id', async function (req, res, next) {
 
 
  const sqlProvjera = `SELECT *  FROM drzava 
                      WHERE iso_3116_alpha_3 = '` + req.params.id + `'`;

  const sqlDrzavaId = `DELETE FROM sluzbeni_jezik 
                      WHERE iso_3116_alpha_3 = '` + req.params.id + `';`
                      +
                      `DELETE FROM drzava 
                      WHERE iso_3116_alpha_3 = '` + req.params.id + `'`;
  hateoasLinker.apply;
  try {
      const resultProvjera = (await db.query(sqlProvjera, [])).rows;
      const resultDrzavaId = (await db.query(sqlDrzavaId, [])).rows;

      if(resultProvjera.length){
        res.status(200).json({
          status:"OK",
          message:"Drzava je uspjesno obrisana",
          response:resultDrzavaId,
          links:[  
      { rel: "read", method: "GET", title: 'GET sve drzave', href: '/drzave' }  
  ]})}
      else res.status(404).json({
        status:"NOT FOUND",
        message:"Drzava s oznakom " + req.params.id + " nije pronadena; neuspjesno brisanje",
        response:resultDrzavaId,
        links:[  
    { rel: "read", method: "GET", title: 'GET sve drzave', href: '/drzave' }  
  ]})

} catch (err) {
  console.log(err);
}
});



router.post('/drzave/:id',bodyParser.json(), async function (req, res, next) {
 
  var body = JSON.stringify(req.body);
  body = JSON.parse(body);

  console.log(body);

  const values = "('" + req.params.id + "', '" + body.glavni_grad + "', '" + body.naziv + "', '" + body.valuta + "', '" + body.pozivni_broj + "', '" + 
                  body.top_level_domena + "', '" + body.naziv_himne + "', '" + body.povrsina + "', '" + body.strana_voznje + "', '" + body.wikipedia + "')"
 
  const sqlProvjera = `SELECT *  FROM drzava 
                      WHERE iso_3116_alpha_3 = '` + req.params.id + `'`;

                      //INSERT INTO public.drzava VALUES ('PLW', 'Ngerulmud', 'Palau', 'USD', '+680', '.pw', 'Belau rekid', 459, 'desna', 'Palau');
  const sqlDrzavaId = `INSERT INTO public.drzava VALUES` + values + `;`;

  console.log(sqlDrzavaId);
  console.log(sqlProvjera);
  
  
  hateoasLinker.apply;
  try {
      const resultProvjera = (await db.query(sqlProvjera, [])).rows;
      console.log("resultProvjera: " + resultProvjera);
      if(!resultProvjera.length){
        const resultDrzavaId = (await db.query(sqlDrzavaId, [])).rows;
        console.log("resultDrzavaId: " + resultDrzavaId);

        console.log(resultProvjera);

        res.status(200).json({
          status:"OK",
          message:"Drzava je uspjesno stvorena",
          response:resultDrzavaId,
          links:[  
      { rel: "read", method: "GET", title: 'GET sve drzave', href: '/drzave' }  
  ]})}
      else res.status(400).json({
        status:"BAD REQUEST",
        message:"Drzava s oznakom " + req.params.id + " vec postoji; neuspjesno stvaranje",
        response: null,
        links:[  
    { rel: "read", method: "GET", title: 'GET ovu drzavu', href: '/drzave/'+req.params.id }  
  ]})
} catch (err) {
  console.log(err);
}
});



router.put('/drzave/:id',bodyParser.json(), async function (req, res, next) {
 
  var body = JSON.stringify(req.body);
  body = JSON.parse(body);

  console.log(body);

  sqlDrzaveUpdate = "UPDATE drzava SET       glavni_grad = '" + body.glavni_grad + "'," + 
                    "naziv = '" + body.naziv + "', valuta = '" + body.valuta + "', pozivni_broj = '" + body.pozivni_broj + "', top_level_domena = '" + body.top_level_domena
                    + "', naziv_himne = '" + body.naziv_himne + "', povrsina = '" + body.povrsina + "', strana_voznje = '" + body.strana_voznje + "', wikipedia_handle = '" + body.wikipedia
                    + "' WHERE iso_3116_alpha_3 = '" + req.params.id + "';";
 
  const sqlProvjera = `SELECT *  FROM drzava 
                      WHERE iso_3116_alpha_3 = '` + req.params.id + `'`;


  console.log(sqlDrzaveUpdate);
  console.log(sqlProvjera);
  
  hateoasLinker.apply;
  try {
    const resultProvjera = (await db.query(sqlProvjera, [])).rows;

    if(resultProvjera.length){
      
      const resultDrzaveUpdate = (await db.query(sqlDrzaveUpdate, [])).rows;

      res.status(200).json({
        status:"OK",
        message:"Drzava je uspjesno updateana",
        response:resultDrzaveUpdate,
        links:[  
          { rel: "read", method: "GET", title: 'GET ovu drzavu', href: '/drzave/' + req.params.id },
    { rel: "read", method: "GET", title: 'GET sluzbeni jezici ove drzave', href: '/drzave/'+req.params.id+'/sluzbenijezici' },
    { rel: "read", method: "GET", title: 'GET sve drzave', href: '/drzave' }  
]})}
    else res.status(404).json({
      status:"NOT FOUND",
      message:"Drzava s oznakom " + req.params.id + " nije pronadena",
      response:null,
      links:[  
  { rel: "read", method: "GET", title: 'GET sve drzave', href: '/drzave' }  
]})
} catch (err) {
  console.log(err);
}
});


router.use(function(req,res){
  res.status(501).json({
        status:"Not Implemented",
        message:"Method not implemented for requested resource.",
        response:null
    });
    });


  
module.exports = router;

  