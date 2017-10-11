var app    = require('express')();
var server = require('http').Server(app);
var io 	   = require('socket.io')(server);
var port   = 8000;
server.listen(port);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

var senhaDaAPI 		  = "teste";

var sensores 		  = {};
var sensoresHistorico = [];
var sockets 		  = [];
io.on('connection', function (socket) {
  socket.socketIndexFila = sockets.length;
  sockets.push(socket);
  
  console.log('Cliente conectado.');
  //QUANDO O APP PEDE O ESTADO DO SENSOR  
  socket.on('statusSensoresServer', function (data) {
  	
  	console.log('statusSensores',data);
  	//VERIFICA SE A SENHA ESTA CORRETA
  	if(!data.hasOwnProperty('senha')){
		socket.emit('statusSensoresAPP', { error: "senha em branco." });  		
	}else{
		if(data.senha != senhaDaAPI){
			socket.emit('statusSensoresAPP', { error: "senha invalida." });  		
		}else{
			socket.emit('statusSensoresAPP', { sensores: sensores }); 		
		}
	}
    
  });

  socket.on("disconnect",function(data){
  	try{
  		sockets.splice(socket.socketIndexFila,1);
  	}catch(ex){
  		console.log("disconnect error socket index bug",ex);
  	}
  })

  socket.emit("conectado",{conectado:true});
});