/*
 * Server-related tasks
 *
 */

 // Dependencies
 var http = require('http');
 var https = require('https');
 var url = require('url');
 var StringDecoder = require('string_decoder').StringDecoder;
 var config = require('./config');
 var fs = require('fs');
 var handlers = require('./handlers');
 var helpers = require('./helpers');
 var path = require('path');
 var util = require('util');
 var debug = util.debuglog('server');


// Instantiate the server module object
var server = {};

 // Instantiate the HTTP server
server.httpServer = http.createServer(function(req,res){
   server.unifiedServer(req,res);
 });

 // Instantiate the HTTPS server
server.httpsServerOptions = {
   'key': fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
   'cert': fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
 };
 server.httpsServer = https.createServer(server.httpsServerOptions,function(req,res){
   server.unifiedServer(req,res);
 });

 // All the server logic for both the http and https server
server.unifiedServer = function(req,res){

// Parse the url [after ew call url.parse, parsedUrl will be object that contain all metadata about the url]
var parsedUrl = url.parse(req.url, true);// the true is for tell the parse function to use querystring modules


  // Get the path
  var path = parsedUrl.pathname; // for example if the request is http://www.example.com/foo/ the path var contain the "/foo/" string
                                 // ther for we trim it below 
   var trimmedPath = path.replace(/^\/+|\/+$/g, '');// now if the request is http://www.example.com/foo/bar/ trimmedPath will contain the string "foo/bar"

   // Get the query string as an object
   var queryStringObject = parsedUrl.query;

   // Get the HTTP method
   var method = req.method.toLowerCase(); // this help us with our up CRAD operation

   //Get the headers as an object
   var headers = req.headers;

   // Get the payload,if any
   var decoder = new StringDecoder('utf-8');
   var buffer = '';
  // nodejs receives its payload (e.g. the body sent as part of a form) in the form of a stream
  // (i.e. a little bit each time), and we need to group this information into one unit
  // The req parameter fires the event data every time a cunck of information arrives
  // so we can bind everything to a buffer variable
   req.on('data', function(data) {
       buffer += decoder.write(data);
   });
   req.on('end', function() {
       buffer += decoder.end();// this 'end' event go to be called even if no payload

       // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
       // here we check if the router that the user ask for is exist in our predefined respons handler 
       // function in routr object (for example = localhost:3000/sample), if so the chosenHandler 
       // will be  handlers.trimmedPath in our case handlers.sample other wise it will be handlers.notFound
       var chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

       // Construct the data object to send to the handler
       var data = {
         'trimmedPath' : trimmedPath,
         'queryStringObject' : queryStringObject,
         'method' : method,
         'headers' : headers,
         'payload' : helpers.parseJsonToObject(buffer)
       };

       // Route the request to the handler specified in the router
       chosenHandler(data,function(statusCode,payload){

         // Use the status code returned from the handler, or set the default status code to 200
         statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

         // Use the payload returned from the handler, or set the default payload to an empty object
         payload = typeof(payload) == 'object'? payload : {};

         // Convert the payload to a string
         var payloadString = JSON.stringify(payload);

         // Return the response
         res.setHeader('Content-Type', 'application/json');
         res.writeHead(statusCode);
         res.end(payloadString);

         // If the response is 200, print green, otherwise print red
         if(statusCode == 200){
           debug('\x1b[32m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
         } else {
           debug('\x1b[31m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
         }
       });

   });
 };

 // Define the request router
server.router = { // This means that if the user will be make a request to
                  // localhost:3000/ping The function that is activated in response 
                  // will be handlers.ping If the path that the user asks not part 
                  // of what we set up in router the function that will respond 
                  // will be handlers.notFound
   'ping' : handlers.ping,
   'users' : handlers.users,
   'tokens' : handlers.tokens,
   'checks' : handlers.checks
 };

 // Init script
server.init = function(){
  // Start the HTTP server
  server.httpServer.listen(config.httpPort,function(){
    console.log('\x1b[36m%s\x1b[0m','The HTTP server is running on port '+config.httpPort);
  });

  // Start the HTTPS server
  server.httpsServer.listen(config.httpsPort,function(){
    console.log('\x1b[35m%s\x1b[0m','The HTTPS server is running on port '+config.httpsPort);
  });
};


 // Export the module
 module.exports = server;
