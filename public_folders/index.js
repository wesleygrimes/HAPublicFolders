//Modules
const fs = require('fs');
const http = require('http');
const path = require('path');

//Config
const PORT = process.env.PORT;
const FOLDERS = process.env.FOLDERS;
const LISTDIRS = process.env.DIRECTORYLISTING;

//Directory Mappings
const directories = { };

for (let str of FOLDERS.split("\n"))
{
	let split = str.split(":");
	directories[split[0]] = split[1];
	console.log(`Serving ${split[1]} on ${split[0]}`);
}

//Error Handler
const error = (req, res, code) => {
	res.writeHead(200);
    res.end(code, 'utf-8');
};

//Handler:
const handler = (req, res) => {
	
	console.log("URL:", req.url);

	let parts = req.url.split("/");
	if (parts[0] == "") parts.shift();

	let location = parts.shift();
	if (!location) return error(req, res, "404");

	let base = directories[location];
	if (!base) return error(req, res, "404");

	let filepath = path.join(location, ...parts);
	
	fs.lstat(filepath, (err, stat) => {
		if (err) return error(req, res, "401");
		
		if (stat.isFile()) {
			return fs.readFile(filepath, (err, data) => {
				if (err && err.code == 'ENOENT') return error(req, res, "404")
				if (err) return error(req, res, "401");

				res.writeHead(200);
				res.end(data, 'utf-8');
			});
		}
		
		if (stat.isDirectory()) {
			if (!LISTDIRS) return error(req, res, "403");
			
			fs.readdir(filepath, (err, files) => {
				if (err) return error(req, res, "401");
				
				res.writeHead(200);
				res.write(`<a href="${path.join(location, [...parts].splice(0, parts.length-1))}">../</a>`);
					  
				for (let file of files) {
					res.write(`<br/><a href="${path.join(filepath, file)}">${file}</a>`);
				}
				
				res.end();
			});
		}
		
		return error(req, res, "404");
	});
};

//Create http server.
console.log(`Starting HTTP server on port ${PORT}`);

http.createServer(handler).listen(PORT, () => {
	console.log(`HTTP server started.`);
});



