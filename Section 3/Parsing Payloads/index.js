/*
 * Primary file for API
 *
 */

// Dependencies
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

 // Configure the server to respond to all requests with a string
var server = http.createServer(function(req,res){

  // Parse the url
  var parsedUrl = url.parse(req.url, true);

  // Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  var queryStringObject = parsedUrl.query;

  // Get the HTTP method
  var method = req.method.toLowerCase();

  //Get the headers as an object
  var headers = req.headers;

  // Get the payload,if any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';
  // nodejs receives its payload (e.g. the body sent as part of a form) in the form of a stream i.e. a little bit each time, and we need to group this information into one unit
  // The req parameter fires the event data every time a cunck of information arrives so we can bind everything to a buffer variable
  req.on('data', function(data) {
    buffer += decoder.write(data);
  });
  req.on('end', function() {
      buffer += decoder.end();// this 'end' event go to be called even if no payload

      // Send the response
      res.end('Hello World!\n');

      // Log the request/response
      console.log('Request received with this payload: ',buffer);
  });
});

// Start the server
server.listen(3000,function(){
  console.log('The server is up and running now');
});
