/*
 * Primary file for API
 *
 */

// Dependencies
var http = require('http');
var url = require('url');

 // Configure the server to respond to all requests with a string
var server = http.createServer(function(req,res){

  // Parse the url [after ew call url.parse, parsedUrl will be object that contain all metadata about the url]
  var parsedUrl = url.parse(req.url, true);// the true is for tell the parse function to use querystring modules

  // Get the path
  var path = parsedUrl.pathname; // for example if the request is http://www.example.com/foo/ the path var contain the "/foo/" string
                                 // ther for we trim it below 
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Send the response
  res.end('Hello World!\n');

  // Log the request/response
  console.log('Request received on path: '+trimmedPath);
});

// Start the server
server.listen(3000,function(){
  console.log('The server is up and running now');
});
