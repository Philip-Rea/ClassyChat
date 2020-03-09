// JavaScript source code
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var userInt = 1;
var colors = ["INDIANRED", "LIGHTCORAL", "SALMON", "DARKSALMON", "LIGHTSALMON", "CRIMSON", "RED", "FIREBRICK", "DARKRED", "PINK", "LIGHTPINK", "HOTPINK", "DEEPPINK", "MEDIUMVIOLETRED", "PALEVIOLETRED", "LIGHTSALMON", "CORAL", "TOMATO", "ORANGERED", "DARKORANGE", "ORANGE", "GOLD", "YELLOW", "LIGHTYELLOW", "LEMONCHIFFON", "LIGHTGOLDENRODYELLOW", "PAPAYAWHIP", "MOCCASIN", "PEACHPUFF", "PALEGOLDENROD", "KHAKI", "DARKKHAKI", "LAVENDER", "THISTLE", "PLUM", "VIOLET", "ORCHID", "FUCHSIA", "MAGENTA", "MEDIUMORCHID", "MEDIUMPURPLE", "REBECCAPURPLE", "BLUEVIOLET", "DARKVIOLET", "DARKORCHID", "DARKMAGENTA", "PURPLE", "INDIGO", "SLATEBLUE", "DARKSLATEBLUE", "MEDIUMSLATEBLUE", "GREENYELLOW", "CHARTREUSE", "LAWNGREEN", "LIME", "LIMEGREEN", "PALEGREEN", "LIGHTGREEN", "MEDIUMSPRINGGREEN", "SPRINGGREEN", "MEDIUMSEAGREEN", "SEAGREEN", "FORESTGREEN", "GREEN", "DARKGREEN", "YELLOWGREEN", "OLIVEDRAB", "OLIVE", "DARKOLIVEGREEN", "MEDIUMAQUAMARINE", "DARKSEAGREEN", "LIGHTSEAGREEN", "DARKCYAN", "TEAL", "AQUA", "CYAN", "LIGHTCYAN", "PALETURQUOISE", "AQUAMARINE", "TURQUOISE", "MEDIUMTURQUOISE", "DARKTURQUOISE", "CADETBLUE", "STEELBLUE", "LIGHTSTEELBLUE", "POWDERBLUE", "LIGHTBLUE", "SKYBLUE", "LIGHTSKYBLUE", "DEEPSKYBLUE", "DODGERBLUE", "CORNFLOWERBLUE", "MEDIUMSLATEBLUE", "ROYALBLUE", "BLUE", "MEDIUMBLUE", "DARKBLUE", "NAVY", "MIDNIGHTBLUE", "CORNSILK", "BLANCHEDALMOND", "BISQUE", "NAVAJOWHITE", "WHEAT", "BURLYWOOD", "TAN", "ROSYBROWN", "SANDYBROWN", "GOLDENROD", "DARKGOLDENROD", "PERU", "CHOCOLATE", "SADDLEBROWN", "SIENNA", "BROWN", "MAROON", "WHITE", "SNOW", "HONEYDEW", "MINTCREAM", "AZURE", "ALICEBLUE", "GHOSTWHITE", "WHITESMOKE", "SEASHELL", "BEIGE", "OLDLACE", "FLORALWHITE", "IVORY", "ANTIQUEWHITE", "LINEN", "LAVENDERBLUSH", "MISTYROSE", "GAINSBORO", "LIGHTGRAY", "SILVER", "DARKGRAY", "GRAY", "DIMGRAY", "LIGHTSLATEGRAY", "SLATEGRAY", "DARKSLATEGRAY", "BLACK"];
var history = [];
var clients = [];
var date = new Date();

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    clients.push({ "ID": socket.id, "nickname": "User" + userInt, "colour": "#000"});
    userInt += 1;
    var name = "";

    for (var i = 0; i < clients.length; i++) {
        if (clients[i].ID === socket.id) name = clients[i].nickname;
    }

    socket.emit('updateUsername', name, history);
    io.emit('newuser', clients);

    socket.on('chat message', function (msg) {
        var command = msg.split(" ");
        var n = 0;
        for (n; n < clients.length; n++) {
            if (clients[n].ID === socket.id) break;
        }
        var min = date.getMinutes();
        if (min < 10) min = '0' + min;
        var time = date.getHours() + ':' + min + ' ';

        if (command[0] === "/nick") {
            var unique = true;
            for (var i = 0; i < clients.length; i++) {
                if (clients[i].nickname === command[1]) unique = false;
            }
            if (unique) {
                clients[n].nickname = command[1];
                socket.emit('updateUsername', command[1]);
                io.emit('newuser', clients);
            } else socket.emit('nametaken', time, command[1]);
        } else if (command[0] === "/nickcolor") {
            if (isColor(command[1])) clients[n].colour = command[1];
            else {
                msg += " <-- Unknown Color";
                socket.emit('errorMessage', time, msg);
            }
        } else if (command[0].startsWith("/")) {
            socket.emit('errorMessage', time, msg);
        } else if (msg.includes("<script>")) {
            msg += " <-- no messages conatining <script> are allowed!";
            socket.emit('errorMessage', time, msg);
        } else {
            if (history.length > 200) history.shift();
            history.push({ "Time": time, "Client": clients[n], "Message": msg })
            io.emit('chat message', time, clients[n], msg);
        }
        
    });

    socket.on('disconnect', function () {
        for(var i = 0; i < clients.length; i++) {
            if (clients[i].ID === socket.id) clients.splice(i, 1);
        }
        io.emit('userDisconnect', clients);
        console.log("user disconnected")
    });
});

http.listen(3000, function () {
    console.log('Listening on *:3000');
});

function isColor(strColor) {
    var test1 = false;
    for (var i = 0; i < colors.length; i++) {
        if (strColor.toLowerCase() === colors[i].toLowerCase()) {
            test1 = true;
            break;
        }
    }
    var test2 = /^#[0-9A-F]{6}$/i.test(strColor);
    var test3 = /^#([0-9A-F]{3}){1,2}$/i.test(strColor)
    if (test1 == true || test2 == true || test3 == true) {
        return true;
    } else {
        return false;
    }
}

