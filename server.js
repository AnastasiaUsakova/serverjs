//-------------------------COMMON-----------------------------
var http = require("http");
var static = require('node-static');
var public = new static.Server('./public');

const port=3003;

//--------------------------DB--------------------------------

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

//https://github.com/typicode/lowdb/issues/37 (G3z commented on 16 Oct 2015)
db._.mixin({
  upsert: function(collection, obj, key) {
    key = key || 'id';
    for (var i = 0; i < collection.length; i++) {
      var el = collection[i];
      if(el[key] === obj[key]){
        collection[i] = obj;
        return collection;
      }
    };
    collection.push(obj);
  }
});

//--------------------CRUD----------------------------
var getText = function(id){
	console.log("Try get by id " + id);
	return db.get('form')
				.find({ id: id })
				.value();
	
}

var saveText = function(id, html, data){
	db.get('form').upsert({id: id, html: html, data: data})
		.write()
}

//-----------------------------------------------------

function save(req, res) {
	console.log(req.headers);
		console.log(req.url);
		var data = [];
		
		req.on('data', chunk => {
			data.push(chunk);
		})
		req.on('end', () => {
			var json = JSON.parse(data);
			console.log("GET JSON");
			console.log(json);
			
			saveText(json.id, json.html, json.data);
			
			
			res.end(json.id);
		})
}

function read(req, res) {
	console.log(req.headers);
	console.log(req.url);
	var data = [];
		
	req.on('data', chunk => {
		data.push(chunk);
	})
	req.on('end', () => {
		var json = JSON.parse(data);
		console.log(json);
			
		var result = getText(json.id);
		console.log("RESULT");
		console.log(result);
			
		res.end(JSON.stringify(result));
	})
}
//------------------------------------------------------------
http.createServer(function(req,res){
	console.log(req.url);
    if (req.url.match(/^\/index.html/)){
        public.serve(req,res);
    } else if (req.url.match(/^\/form1/)){ //save
		save(req, res);
    } else if (req.url.match(/^\/form2/)){ //read
		read(req, res);
	} else {
        res.end();
    }
	
}).listen(port);


console.log("Server is on port " + port);

