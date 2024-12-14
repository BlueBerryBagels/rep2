const http = require('http');
const path = require("path");
const express = require("express");   
const app = express();  
const portNumber =  3000;
process.stdin.setEncoding("utf8"); 
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:false}));
const { resolve } = require('node:path');
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
/**/require("dotenv").config({ path: path.resolve(__dirname, 'credentials/.env') }) 
/**/const { MongoClient, ServerApiVersion } = require('mongodb');
app.use(express.static(__dirname + '/public'));


const username = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const db = process.env.MONGO_DB_NAME;
const collection = process.env.MONGO_COLLECTION;
const uri = `mongodb+srv://${username}:${password}@cluster0.jylho.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const databaseAndCollection = {db: db, collection: collection};

/*app.get("/", (request, response) => {
	response.render('index');
});*/
app.get("/", (req, res) => res.type('html').send(index));

app.get("/pageB",  (request, response) => {	
	response.render('tempB'); 	
}); 

app.get("/clear",(request,response)=>{
	response.render('tempClear');
});
app.get("/cats",(request,response)=>{
	response.render('tempCats');
});
app.post("/submission", async function(request, response){
   let {name,color} =  request.body;
   const variables = {name: name, color:color};
   response.render('submissionReport', variables); 
   /*************************************************/
	const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    try {
        await client.connect();
        console.log("***** Inserting one applicant *****");
		const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(variables);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
});
/*************************************************/
app.post("/lookup", async function(request,response){
	let {specificName} =  request.body;
	const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    try {
        await client.connect();
		let filter = {name: specificName};
    	const result = await client.db(databaseAndCollection.db)
                        .collection(databaseAndCollection.collection)
                        .findOne(filter);		
		if (result) {
			let {name,color}= result;
				let variables = {
					name: name,
					color: color
				};
			response.render('processLookup', variables); 
		} else {
		console.log(`No entry found with name ${name}`);
	}
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
});

app.get("/chart",async function(req,res){
	const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    try {
        await client.connect();
		let table = "<table border='1'><tr><th>Name</th><th>Color</th></tr>";
		const cursor = client.db(databaseAndCollection.db)
		.collection(databaseAndCollection.collection)
		.find();
		const result = await cursor.toArray();
		result.forEach(element => {
			table += `<tr><td>${element.name}</td><td>${element.color}</td></tr>`
		});
		table += "</table>";
		let variables = {theTable: table};
		res.render('tempChart',variables);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
});

app.post("/removeAll",async function(req,res){
	const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    try {
        await client.connect();
		console.log("HERE!!");
        console.log("***** Clearing Collection *****");
        const result = await client.db(databaseAndCollection.db)
        .collection(databaseAndCollection.collection)
        .deleteMany({});
		let variables = {number:result.deletedCount};
		res.render('removeAllReport', variables);
		console.log("HERE!!!!!");
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
});


app.listen(3000); 
/*
console.log(`Web server is running at http://localhost:${portNumber}`);
const prompt = "Type stop to shutdown the server: ";
console.log(prompt);

process.stdin.on('readable', ()=>{ 
	const dataInput = process.stdin.read();
	if (dataInput !== null) {
		const command = dataInput.trim();
		if (command === "stop") {
			console.log("Shutting down the server");
            process.exit(0);  
        } 
		process.stdout.write(prompt);
		process.stdin.resume();
    }
});*/
