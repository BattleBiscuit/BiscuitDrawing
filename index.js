var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var userSocket = [];
var nicknames = [];

var pic = [];
var drawer;

var wordCollab = ['Kletteraffe', 'Blume', 'tanzen', 'Baum', 'Wald', 'Himmel', 'Buch', 'zeichnen'];

var word = 'Kletteraffe';
var wordArray = word.split('');
var dummyArray = new Array(wordArray.length).fill('_');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/');
});

io.on('connection', function(socket){
    console.log('user ' + socket.id + ' connected');
    pic.forEach(line => {
      io.to(socket.id).emit('draw', line);
    })
    // User-Management
    socket.on('disconnect', () => {
      console.log('user ' + nicknames[userSocket.indexOf(socket.id)] + ' disconnected');
      nicknames.splice( userSocket.indexOf(socket.id), 1 );
      userSocket.splice( userSocket.indexOf(socket.id), 1 );
    });
    socket.on('add user', (username) => {
      userSocket.push(socket.id);
      nicknames.push(username);
    });

    // Chat
    socket.on('chat message', (msg) => {
      if(msg.toLowerCase() == word.toLowerCase()) {
        let success = nicknames[userSocket.indexOf(socket.id)] + " : <font color='green'>" + word + '</font>';
        io.emit('chat message', success);
        io.to(drawer).emit('get player');
        drawer = socket.id;
        let wordList = new Array();
        for (let i=0; i<3;i++) {
          wordList.push(wordCollab[Math.floor(Math.random() * wordCollab.length)]);
        }
        io.to(socket.id).emit('get drawer', wordList);
        return;
      }
      let newMsg = "<font color='darkgrey'>" + nicknames[userSocket.indexOf(socket.id)] + ' :</font> ' + msg;
      io.emit('chat message', newMsg);
    });

    // Zeichenfläche
    socket.on('draw', (line) => {
      if(drawer == socket.id) {
        pic.push(line);
        io.emit('draw', line);  
      }
    });

    socket.on('del pic', () => {
      if(drawer == socket.id) {
        pic = [];
        io.emit('del pic');  
      }
    });

    // Wort-Management
    socket.on('new word', (newWord) => {
      word = newWord;
      wordArray = word.split('');
      dummyArray = new Array(wordArray.length).fill('_');
      io.emit('word update', dummyArray.join(''));
      pic = [];
      io.emit('del pic');
    })

  });

http.listen(3000, function(){
  console.log('listening on *:3000');
});


// Running on Server
setInterval(() => {
  let randomNumber = Math.floor(Math.random() * dummyArray.length);
  dummyArray[randomNumber] = wordArray[randomNumber];
  io.emit('word update', dummyArray.join(''));
}, 1000);