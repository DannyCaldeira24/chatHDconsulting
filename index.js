'use strict'

var mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

let express = require('express');
let app = express();

let http = require('http');
let server = http.Server(app);

let socketIO = require('socket.io');
let io = socketIO(server);

io.on('connection', (socket) => {
    console.log('user connected');
    socket.on('join', function(data){
        //joining
        socket.join(data.room);
        console.log(data.user + ' joined the room: ' + data.room);
        socket.broadcast.to(data.room).emit('new user joined', {user:data.user, message:'has joined this room. '});
    });
    socket.on('leave', function(data){
        //leaving
        console.log(data.user + ' left the room: ' + data.room);
        socket.broadcast.to(data.room).emit('left room', {user:data.user, message:'has left this room. '});
        socket.leave(data.room);
    });
    socket.on('send', function(data){
        //leaving
        io.in(data.room).emit('new message', {user:data.user, message:data.message});
    });
});

if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}
  
const DB_URI = process.env.DB_URI || 'mongodb://danny:d123123@ds117866.mlab.com:17866/hd_db';
app.set('port', process.env.PORT || 3100);

mongoose.Promise = global.Promise;
mongoose.connect(DB_URI, { useNewUrlParser: true })
		.then(()=>{
			console.log('La conexión a la base de datos HD_DB se ha realizado correctamente..');
			server.listen(app.get('port'), () => {
				console.log(`started on port: ${server.address().port}`);
			
			});
		})
		.catch(err => console.log(err));
