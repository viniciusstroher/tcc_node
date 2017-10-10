var childProcess = require('child_process');

var scriptPort 	 = 9000;
var wsSocketPort = 9001;
var scriptSecret = "1234";

var paramsProcess = [scriptSecret,scriptPort,wsSocketPort];
var scriptProcess = null;
var scriptStatus  = false;
var scriptPath 	  = "./jsmpeg-master/websocket-relay.js";

scriptProcess 	  = startScript(scriptPath,paramsProcess);

scriptProcess.on('error', function (err) {
    scriptStatus = false;
    console.log('Script process error :',err);
});

scriptProcess.on('exit', function (err) {
    scriptStatus = false;
    console.log('Script process exit :',err);
});
/*
scriptProcess.stdout.on('data', function(data) {
    console.log('scriptProcess data: ',data);
});

scriptProcess.stderr.on('data', function(data) {
   console.log('scriptProcess stderr fechando script: ',data);
});

scriptProcess.on('close', function() {
    console.log('scriptProcess fechando script.');
});
*/
console.log("INICINADO SERVIDOR");


function startScript(scriptPath,params){
	var proc = childProcess.fork(scriptPath,params);
	return proc;
}