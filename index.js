var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var user = [];

var pic = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/');
});

io.on('connection', function(socket){

    pic.forEach(element => {
      io.emit('draw line', element);
    })

    console.log('a user connected');

    socket.on('disconnect', function(){
      console.log('user disconnected');
    });

    socket.on('chat message', function(msg){
      io.emit('chat message', msg);
    });

    socket.on('draw line', function(newLine) {
        pic.push(newLine);
        io.emit('draw line', newLine);
    });

    socket.on('delete pic', function() {
      pic = [];
      io.emit('delete pic');
    })
  });

http.listen(3000, function(){
  console.log('listening on *:3000');
});