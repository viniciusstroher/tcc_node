var app    = require('express')();
var bodyParser = require('body-parser');

//app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var server = require('http').Server(app);
var io 	   = require('socket.io')(server);
var port   = 10000;
server.listen(port);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

var senhaDaAPI 		  = "teste";


var sockets 		  = [];
var eventos 		  = [];
var ultimoEvento 	  = null;

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
			socket.emit('statusSensoresAPP', { evento: ultimoEvento }); 		
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

function emitEventsOnSockets(){
	for(i=0;i<sockets.length;i++){
		var s = sockets[i];
		s.emit('statusSensoresAPP', { evento: ultimoEvento }); 	
	}
}

app.post('/pir', function (req, res) {
	//Api-Key:
	if(senhaDaAPI != req.get('Api-Key')){
		res.send({error:"senha invalida."});
	}else{
		var data = new Date().toISOString();
		var json = req.body;
		json.date= data;

		eventos.push(json);
		ultimoEvento = json;

		emitEventsOnSockets();
		res.send({retorno:true});
	}
});

app.post('/porta_aberta', function (req, res) {
	//Api-Key:
	if(senhaDaAPI != req.get('Api-Key')){
		res.send({error:"senha invalida."});
	}else{
		var data = new Date().toISOString();
		var json = req.body;
		console.log(json);
		json.date= data;

		eventos.push(json);
		ultimoEvento = json;

		emitEventsOnSockets();
		res.send({retorno:true});
	}
});