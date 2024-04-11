var express = require("express");
var router = express.Router();

router.get("/", function (req, res) {
res.render('pages/home-page')
});

router.get('/home-page',function(req,res){
    res.render('pages/home-page')
})

router.get('/ecopremium',function(req,res){
    res.render('pages/ecopremium')
})

module.exports = router;
