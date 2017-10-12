var app    		 = require('express')();
var bodyParser   = require('body-parser');
var config 		 = require('./config.js');

//app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var server = require('http').Server(app);
var io 	   = require('socket.io')(server);
var port   = config.port_app;
server.listen(port);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

var senhaDaAPI 		  = config.senha_api;
var sockets 		  = [];
var eventos 		  = [];
var ultimoEvento 	  = null;

var api 			  = config.api_gcm;

io.on('connection', function (socket) {
  socket.socketIndexFila = sockets.length;
  sockets.push(socket);
  console.log('Cliente conectado.');

  socket.on('enviaToken',function(data){
  	if(socket.socketIndexFila){
  		console.log('enviaToken',data);
  		console.log('socket.socketIndexFila',socket.socketIndexFila);
	  	sockets[socket.socketIndexFila].token_app = data.token;
	  	sockets[socket.socketIndexFila].cli_app   = data.cli;
	  	
  	}
  });

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
  		console.log("socket disconnect index: ",socket.socketIndexFila);
  		sockets.splice(socket.socketIndexFila,1);
  	}catch(ex){
  		console.log("disconnect error socket index bug",ex);
  	}
  });

  
  socket.emit("conectado",{conectado:true});
});

app.post('/pir', function (req, res) {
	//Api-Key:
	//console.log(senhaDaAPI , req.get('Api-Key'));
	if(senhaDaAPI != req.get('Api-Key')){
		res.send({error:"senha invalida."});
	}else{
		console.log('evento: /pir','-',req.body,req.get('Api-Key'));
	
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
	//console.log(senhaDaAPI , req.get('Api-Key'));
	if(senhaDaAPI != req.get('Api-Key')){
		res.send({error:"senha invalida."});
	}else{
		console.log('evento: /porta_aberta','-',req.body,req.get('Api-Key'));
	
		var data = new Date().toISOString();
		var json = req.body;
		json.date= data;

		eventos.push(json);
		ultimoEvento = json;

		emitEventsOnSockets();

		enviaPush(config.api_gcm,getAndroidToken());

		res.send({retorno:true});
	}
});


function emitEventsOnSockets(){
	console.log('emitEventsOnSockets');
	for(i=0;i<sockets.length;i++){
		var s = sockets[i];
		s.emit('statusSensoresAPP', { evento: ultimoEvento }); 	
	}
}

function getAndroidToken(){
	var tokens = [];
	for(i=0;i<sockets.length;i++){
		var s = sockets[i];
		console.log(s.cli_app);
		if(s.hasOwnProperty('cli_app')){
			console.log(s.cli_app);
			if(s.cli_app == "android"){
				tokens.push(s.token_app);
			}
		}
	}
	return tokens;
}

function enviaPush(api,tokens){
	var gcm    = require('node-gcm');
	var sender = new gcm.Sender(api);
	// Prepare a message to be sent
	var message = new gcm.Message({
		collapseKey: 'demo',
		priority: 'high',
		contentAvailable: true,
		delayWhileIdle: true,
		timeToLive: 3,
		restrictedPackageName: "somePackageName",
		dryRun: true,
		data: {
			key1: 'message1',
			key2: 'message2'
		},
		notification: {
			title: "Hello, World",
			icon: "ic_launcher",
			body: "This is a notification that will be displayed if your app is in the background."
		}
	});

	// array - tokens
	var regTokens = tokens; 
	console.log(regTokens);
	// Actually send the message
	sender.send(message, { registrationTokens: regTokens }, function (err, response) {
	    if (err){
	    	console.error('sender.send error',err);
	    }else{ 
	    	console.log('sender.send',response); 
	    }
	});
}