var socket = io();

    $(function () {
        $('form').submit(function(e){
            e.preventDefault(); // prevents page reloading
            socket.emit('chat message', $('#m').val());
            $('#m').val('');
            return false;
        });
        socket.on('chat message', function(msg){
            $('#messages').append($('<li>').text(msg));
        });
        socket.on('draw line', function (newLine) {
            line(newLine[0], newLine[1], newLine[2], newLine[3]);
        })
    });

    function setup() {
        let canvas = createCanvas(800, 600);
        background(230);
        canvas.parent('drawBoard');
    }
    function draw() {

    }
    function mouseDragged() {
        let newline = [mouseX, mouseY, pmouseX, pmouseY]
        socket.emit('draw line', newline);
    }