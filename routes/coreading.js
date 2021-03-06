var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Coreading' });
});

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');
var users = [];
var usernames = [];
var group_users = [];

io.set('authorization', function (handshakeData, callback) {
  // findDatabyip is an async example function

  var token = handshakeData._query.token;
  var group_id = handshakeData._query.group;

  request('http://localhost:3001/api/v1/groups/' + group_id + '?auth_token=' + token, function (error, response, body) {
    if (JSON.parse(body)) {
      console.log('success group');
      group_users = JSON.parse(body)
      callback(null, true);
    } else {
      console.log('failed');
      callback(null, false);
    }
  });
});

io.of('/annotations').on('connection', function(socket){
  var cookie_string = socket.request.headers.cookie;
  var sid = cookie_string.split('=')[1];
  var user = {sid: sid};
  var token = socket.handshake.query.token;
  request('http://localhost:3001/api/v1/user?auth_token=' + token, function (error, response, body) {
    if (JSON.parse(body).username) {
      console.log('success username');
      user.username = JSON.parse(body).username;

      socket.on('change annotation', function(msg){
        var address = socket.handshake.address;
        var data = JSON.parse(msg);
        console.log(data);

        io.of('/annotations').emit('change annotation message', JSON.stringify(data));
      });

      socket.on('add chart', function (msg) {
        var address = socket.handshake.address;
        var data = JSON.parse(msg);
        data.ip = address;

        io.of('/annotations').emit('chart message', JSON.stringify(data));
      });
    }
  });
});

http.listen(3003, function(){
console.log('listening on *:3003');
});

module.exports = router;
