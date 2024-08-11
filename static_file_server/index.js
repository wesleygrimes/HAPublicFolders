var express = require("express");
var serveStatic = require("serve-static");

const config = require("./data/options.json");

const PORT = process.env.PORT || 8080; //Math.ceil(8000 + (Math.random() * 1000));

var app = express();

app.use(serveStatic("/media", {}));
app.listen(PORT);
