const EventEmitter = require('events');

const chatEmitter = new EventEmitter();
const express = require('express');
const { get } = require('http');
const port = process.env.PORT || 3000;
const app = express();
const path=require('path')

// Function to return a plain text response
function respondText(req, res) {
  res.end('hi');
}

// Function to return JSON data
function respondJson(req, res) {
  res.json({ text: 'hi', numbers: [1, 2, 3] });
}

// Function to handle 404 responses
function respondNotFound(req, res) {
  res.status(404).send('Not Found');
}

// Function to return dynamic response based on query parameters
function respondEcho(req, res) {
  const { input = '' } = req.query;
  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    charCount: input.length,
    backwards: input.split('').reverse().join(''),
  });
}

function chatApp(req, res) {
    res.sendFile(path.join(__dirname, '/chat.html'));
  }
  
  // register the endpoint with the app (make sure to remove the old binding to the `/` route)
  app.use(express.static(__dirname + '/public'));
  app.get('/', chatApp);
  function respondChat (req, res) {
    const { message } = req.query;
  
    chatEmitter.emit('message', message);
    res.end();
  }

  function respondSSE (req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
    });
  
    const onMessage = message => res.write(`data: ${message}\n\n`); // use res.write to keep the connection open, so the client is listening for new messages
    chatEmitter.on('message', onMessage);
  
    res.on('close', () => {
      chatEmitter.off('message', onMessage);
    });
  }
// Define routes for handling requests
app.get('/', respondText);  // Respond with 'hi'
app.get('/json', respondJson);  // Respond with JSON data
app.get('/echo', respondEcho);  // Respond with transformed input
app.get('/chat', respondChat);
app.get('/sse', respondSSE);
// Handle 404 for any undefined routes
app.use(respondNotFound);

// Start the server using Express
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
