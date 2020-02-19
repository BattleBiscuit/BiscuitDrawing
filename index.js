var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var user = [];
var nicknames = [];
var pic = [];
var drawer;

var words = ['Blume', 'Pflanze', 'Zaun', 'Auto'];
var wordcount = words.length;
var word;
var wordArray;
var placeholderWord;

word = words[(Math.floor(Math.random() * wordcount))];
wordArray = word.split('');
placeholderWord = new Array(word.length).fill('_');


app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/');
});

io.on('connection', function(socket){
  // Check if a Drawer is set, if not make the now connected play drawer
  if(drawer == undefined) {
    drawer = socket.id;
    io.to(`${socket.id}`).emit('drawer');
  }
  // push user in array
  user.push(socket.id);
  io.emit('get word', placeholderWord.join(''));

    pic.forEach(element => {
      io.emit('draw line', element);
    });
    
    console.log('a user connected');
    // Disconnect handler
    socket.on('disconnect', function(){
      console.log('user disconnected');
      user.splice( user.indexOf(socket.id), 1 );
      if(drawer == socket.id && user != []) {
        drawer = user[0];
      }
      drawer = undefined;
    });
    // Chat Message Handler
    socket.on('chat message', function(msg){
      console.log(msg + ' : ' + word)
      if(msg.toLowerCase() == word.toLowerCase() ) {
        console.log('Game End');
        word = words[(Math.floor(Math.random() * wordcount))];
        wordArray = word.split('');
        placeholderWord = new Array(word.length).fill('_');

        drawer = socket.id;
        pic = [];
        io.emit('delete pic');
        io.to(socket.id).emit('drawer');

        io.emit('get word', placeholderWord.join(''));
        return;
      }
      io.emit('chat message', msg);
    });
    // Drawing Handler
    socket.on('draw line', function(newLine) {
      if(socket.id == drawer) {
        pic.push(newLine);
        io.emit('draw line', newLine);
      }
    });

    socket.on('delete pic', function() {
      pic = [];
      io.emit('delete pic');
    })
  });

http.listen(3000, function(){
  console.log('listening on *:3000');
});


// Running on Server
setInterval(() => {
  console.log('placeholder: ' + placeholderWord + ' wordArray: ' + wordArray)
  let letterPos = Math.floor(Math.random() * word.length);
  placeholderWord[letterPos] = wordArray[letterPos];
  io.emit('get word', placeholderWord.join(''));
}, 10000);