var config 			  = {};

config.scriptPort 	  = 9000;
config.wsSocketPort   = 9001;
config.scriptSecret   = "1234";

config.rtsp 		  = '192.168.0.28:554/onvif1'
config.paramsSocket   = ['-i', 'rtsp://'+config.rtsp,  
				    '-codec:v','mpeg1video',
				    '-b','64k',
				    '-s', '340x340', 
				    '-r', '24', 
				    '-f','mpegts', /*ou mpegts*/
				    'http://localhost:'+config.scriptPort+'/'+config.scriptSecret
 				  	];


config.port_app   = 10000;
config.senhaDaApi = "teste";


module.exports = config;
