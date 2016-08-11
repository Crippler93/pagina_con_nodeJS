var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var multer = require('multer');
var path = require('path');
var cloudinary = require('cloudinary');
var password = "qwerty";
var methodOverride = require('method-override')

cloudinary.config({
	cloud_name: "dmzll3igd",
	api_key: "556111552638337",
	api_secret: "meHafHwcCCzKTDPzi9bx91nrLMA"
});

var app = express();

mongoose.connect("mongodb://localhost/primera_pagina");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'))

// Definir esquema de nuestros productos
var productSchema = {
	title:String,
	description:String,
	imageUrl:String,
	pricing:Number
};

var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './uploads/')
        },
        filename: function (req, file, cb) {

            var getFileExt = function(fileName){
                var fileExt = fileName.split(".");
                if( fileExt.length === 1 || ( fileExt[0] === "" && fileExt.length === 2 ) ) {
                    return "";
                }
                return fileExt.pop();
            }
            cb(null, Date.now() + '.' + getFileExt(file.originalname))
        }
    });

var multerUpload = multer({ storage: storage });

var Product = mongoose.model("Product",productSchema);

app.set("view engine","jade");

app.use(express.static("public"));

app.get("/",function(req,res){
	res.render("index");
});

app.get("/admin",function(req,res){
	res.render("admin/index")
});

app.post("/admin",function(req,res){
	if (req.body.password == password) {
		Product.find(function(error,documento){
		if (error) {console.log(error)}
		res.render("admin/productos",{products: documento})
	});
	}else{
		res.redirect("/");
	}
});

app.get("/contacto",function(req,res){
	res.render("contacto")
});

app.post("/productos",multerUpload.single('photo'), function(req,res){

	if (req.body.password == password){
		
		var data = {
			title: req.body.title,
			description: req.body.description,
			imageUrl:"data.png",
			pricing: req.body.pricing
		};
	
		var product = new Product(data);
		
		if (req.file != null){
			cloudinary.uploader.upload(req.file.path, 
				function(result) { 
					product.imageUrl = result.url;
					product.save(function(err){
						res.render("index")			
					});
				}
			)}else{
				product.save(function(err){
						res.render("index")			
					});
			};

		
	}else{
		res.render("productos/new");
	}

});

app.get("/productos/new",function(req,res){

	res.render("productos/new")
});

app.get("/productos",function(req,res){
	Product.find(function(error,documento){
		if (error) {console.log(error)}
		res.render("productos/index",{products: documento})
	});
});

app.get("/productos/edit/:id",function(req,res){
	var id_producto = req.params.id
	Product.findOne({_id: id_producto},function(error,producto){
			console.log(producto);
			res.render("productos/edit",{product:producto})
	});
});

app.put("/productos/:id",multerUpload.single('photo'),function(req,res){
	if (req.body.password == password) {
		var data = {
			title: req.body.title,
			description: req.body.description,
			pricing: req.body.pricing
		};

		console.log(req)
		if(req.file != null){

			cloudinary.uploader.upload(req.file.path, 
				function(result) { 
					data.imageUrl = result.url;
					Product.update({"_id": req.params.id},data,function(product){
						res.redirect("/productos");
					});
				}
			);

		}else{
			Product.update({"_id": req.params.id},data,function(product){
				res.redirect("/productos");
		})
		}
		

	}else{
		
	}
});

app.get("/productos/delete/:id",function(req,res){
	var id = req.params.id;
	Product.findOne({_id:id},function(error,producto){
		res.render("productos/delete",{producto:producto});
	});
});

app.delete("/productos/:id",function(req,res){
	if (req.body.password == password) {
		var id = req.params.id;
		Product.remove({"_id":id},function(error){
			res.redirect("/productos")
		});
	}
});

app.listen(8080);