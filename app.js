var childProcess = require('child_process');
var config 		 = require('./config.js');

//PROCESSO DE ABERTURA DO RELAY
var scriptPort 	 = config.scriptPort;
var wsSocketPort = config.wsSocketPort;
var scriptSecret = config.scriptSecret;

var paramsProcess = [scriptSecret,scriptPort,wsSocketPort];
var scriptProcess = null;
var scriptStatus  = false;
var scriptPath 	  = "./jsmpeg-master/websocket-relay.js";

function startRelay(){
	scriptProcess 	  = startScript(scriptPath,paramsProcess);

	scriptProcess.on('error', function (err) {
	    scriptStatus = false;
	    console.log('Script process error :',err);
	});

	scriptProcess.on('exit', function (err) {
	    scriptStatus = false;
	    console.log('Script process exit :',err);
	});
	startEncode();
}

var rtsp 		   = config.rtsp;
var paramsSocket   = config.paramsSocket;
var socketProcess  = null;
var socketStatus   = false;
var socketPath 	   = "ffmpeg";

function startEncode(){
	socketProcess = startSocket(socketPath,paramsSocket);

	socketProcess.stdout.on('data', function(data) {
	    console.log('socketPath data',data);
	});

	socketProcess.on('error', function (err) {
	    socketStatus = false;
	    console.log('socketPath error :',err);
	});

	socketProcess.stderr.on('data', function(data) {
	   console.log('socketPath stderr : ',data);
	   //startEncode();
	});
	socketProcess.on('close', function(data) {
	   console.log('socketPath close : ',data);
	   startEncode();
	});
}

function startScript(scriptPath,params){
	return childProcess.fork(scriptPath,params);
}

function startSocket(scriptPath,params){
	return childProcess.execFile(scriptPath,params);
}


console.log("INICINADO SERVIDOR");
startRelay();
