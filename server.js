var http = require('http');
var url = require('url');
var querystring = require('querystring');
var static = require('node-static');
var file = new static.Server('.', {
  cache: 0
});


http.createServer(function(req, res) {
  file.serve(req, res);
}).listen(8080);

// ------ запустить сервер -------
console.log('Server running on port 8080');