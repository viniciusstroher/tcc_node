var childProcess = require('child_process');


//PROCESSO DE ABERTURA DO RELAY
var scriptPort 	 = 9000;
var wsSocketPort = 9001;
var scriptSecret = "1234";

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

var rtsp 		   = '192.168.0.28:554/onvif1'
var paramsSocket   = ['-i', 'rtsp://'+rtsp,  
				    '-codec:v','mpeg1video',
				    '-b','64k',
				    '-s', '340x340', 
				    '-r', '24', 
				    '-f','mpegts', /*ou mpegts*/
				    'http://localhost:'+scriptPort+'/'+scriptSecret
 				  ];

var socketProcess = null;
var socketStatus  = false;
var socketPath 	  = "ffmpeg";


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

//ffmpeg  -i rtsp://192.168.0.19:554/onvif1 -codec:v mpeg1video -b 64k -s 340x340 -r 24 -f mpegts http://localhost:9000/1234