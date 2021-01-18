const express = require('express');
const router = express.Router();
const db = require('../db');
var hateoasLinker = require('express-hateoas-links');
var bodyParser = require('body-parser');
var cors = require('cors'); 
router.use(cors());
router.use(hateoasLinker);   

const request = require('request')
const fetch = require('node-fetch');
var fs = require('fs');



router.get('/drzave', async function (req, res, next) {

    const sqlDrzave = `SELECT * FROM drzava;`;
    hateoasLinker.apply;
    try {
        const resultDrzave = (await db.query(sqlDrzave, [])).rows;
        for (let drzava of resultDrzave){
          drzava.slika = "localhost:3000/drzave/" + drzava.iso_3116_alpha_3 + "/slike";
        }
        res.status(200).json({
          status:"OK",
          message:"Drzave su uspjesno dohvacene",
          response:{"@context": {
            "glavni_grad": "https://schema.org/City",
            "valuta": "https://schema.org/currency"
          }, resultDrzave},
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
      
      resultDrzavaId[0].slika  = "localhost:3000/drzave/" + req.params.id + "/slike";

      if(resultDrzavaId.length){
        res.status(200).json({
          status:"OK",
          message:"Drzava je uspjesno dohvacena",
          response:{"@context": {
            "glavni_grad": "https://schema.org/City",
            "valuta": "https://schema.org/currency"
          }, resultDrzavaId},
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
          response:{"@context": {
            "glavni_grad": "https://schema.org/City",
            "valuta": "https://schema.org/currency"
          }, resultProvjera},
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
                  body.top_level_domena + "', '" + body.naziv_himne + "', '" + body.povrsina + "', '" + body.strana_voznje + "', '" + body.wikipedia_handle + "')"
 
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
        const resultProvjera = (await db.query(sqlProvjera, [])).rows;

        const sqlProvjera2 = `SELECT *  FROM drzava 
      WHERE iso_3116_alpha_3 = '` + req.params.id + `'`;

        console.log(resultProvjera);

        res.status(200).json({
          status:"OK",
          message:"Drzava je uspjesno stvorena",
          response:{"@context": {
            "glavni_grad": "https://schema.org/City",
            "valuta": "https://schema.org/currency"
          }, resultProvjera},
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
                    + "', naziv_himne = '" + body.naziv_himne + "', povrsina = '" + body.povrsina + "', strana_voznje = '" + body.strana_voznje + "', wikipedia_handle = '" + body.wikipedia_handle
                    + "' WHERE iso_3116_alpha_3 = '" + req.params.id + "';"

 
  const sqlProvjera = `SELECT *  FROM drzava 
                      WHERE iso_3116_alpha_3 = '` + req.params.id + `'`;


  console.log(sqlDrzaveUpdate);
  console.log(sqlProvjera);
  
  hateoasLinker.apply;
  try {
    const resultProvjera = (await db.query(sqlProvjera, [])).rows;
    console.log("PROVJERA:" + resultProvjera);

    if(resultProvjera.length){
      
      const resultDrzaveUpdate = (await db.query(sqlDrzaveUpdate, [])).rows;
      const resultUpdateanaDrzava = (await db.query(sqlProvjera, [])).rows;
      console.log("RESULT:" + resultUpdateanaDrzava);

      res.status(200).json({
        status:"OK",
        message:"Drzava je uspjesno updateana",
        response:{"@context": {
          "glavni_grad": "https://schema.org/City",
          "valuta": "https://schema.org/currency"
        }, resultUpdateanaDrzava},
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


router.get('/drzave/:id/slike', async function (req, res, next) {
  res.header("Content-Type","image/png")

  const sqlSlike = `SELECT * FROM slika
                      WHERE iso_3116_alpha_3 ='` + req.params.id + `'`;
  const sqlDrzave = `SELECT * FROM drzava
                      WHERE iso_3116_alpha_3 = '` + req.params.id + "'"; 
  hateoasLinker.apply;
  try {
      const resultSlike = (await db.query(sqlSlike, [])).rows;
      const resultDrzave = (await db.query(sqlDrzave, [])).rows;

      let slika = resultSlike[0];
      var novo_vrijeme = new Date();
      var staro_vrijeme = new Date(slika.vrijeme);
      let limit = 10800000 //3h u milisekundama
      limit = 10;


      console.log(slika.vrijeme);
      console.log(novo_vrijeme);
      
      let razlika = novo_vrijeme - staro_vrijeme;
      console.log("razlika: " + razlika + "limit: " + limit);

      console.log(razlika > limit);



      if(razlika > limit){
        for (drzava of resultDrzave){

          let uri = "https://en.wikipedia.org/api/rest_v1/page/summary/" + drzava.wikipedia_handle
          let pic = await (await fetch(uri)).json();
          pic = JSON.parse(JSON.stringify(pic));

          let source = pic.originalimage.source;
          let new_path = 'C:/Users/marti/OneDrive/Desktop/drzave/drzave/local_images/' + drzava.iso_3116_alpha_3 + '.png';
          
          download(source, new_path, () => {
            console.log(new_path);
            res.sendFile(new_path);
          })

          let sqlUpdateSlike = `UPDATE slika SET put='` + new_path + `', vrijeme=CURRENT_TIMESTAMP WHERE iso_3116_alpha_3='` + drzava.iso_3116_alpha_3 +`';`;
            console.log(sqlUpdateSlike);
            const updateSlike = (await db.query(sqlUpdateSlike, [])).rows;
        }
      }
      else{
        res.sendFile(slika.put);
      } 

      
  
} catch (err) {
  console.log(err);
}
});


const download = (url, path, callback) => {
  request.head(url, (err, res, body) => {
    request(url)
      .pipe(fs.createWriteStream(path))
      .on('close', callback)
  })
}


router.use(function(req,res){
  res.status(501).json({
        status:"Not Implemented",
        message:"Method not implemented for requested resource.",
        response:null
    });
    });



  
module.exports = router;

  