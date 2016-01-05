var tessel = require('tessel');
var ambientlib = require('ambient-attx4');
var ambient = ambientlib.use(tessel.port['B']);
var http = require('http');
var hueApiKey = '1d456a84386935a222fc058f36b3f57f';
var TRIGGER_VALUE = 0.17;

function toggleLights(state, cb) {
  var req = http.request({
    host: '192.168.1.3',
    port: '80',
    path: "/api/" + hueApiKey + "/groups/0/action",
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    }
  }, function(res) {
    res.setEncoding('utf8');
    var str = '';
    res.on('data', function (chunk) {
      str += chunk;
      return str;
    });
    res.on('end', function(){
      ambient.setSoundTrigger(TRIGGER_VALUE)
      var lightIsOn = toBoolean(JSON.parse(str)[0]["success"]["/groups/0/action/on"]);
      console.log('light is on...', lightIsOn);
    });
  });
  req.write(JSON.stringify({"on": state }));
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });
  req.end();
}

function handleClap(data){
  console.log("sound level...", data);

  // Clear soundTrigger
  ambient.clearSoundTrigger();

  var get_options = {
    host: '192.168.1.3',
    port: '80',
    path: '/api/' + hueApiKey + '/lights',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  var req = http.request(get_options, function(res) {
    res.setEncoding('utf8');
    var str = '';
    res.on('data', function (chunk) {
      str += chunk;
      return str;
    });
    
    res.on('end', function(){
      var obj = JSON.parse(str);
      var lightsAreOn = toBoolean(obj[Object.keys(obj)[0]]["state"]["on"]);
      toggleLights(!lightsAreOn, function(body){
        console.log(body)
      })
    })

  });
  
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });
  
  req.end();
};

ambient.on('ready', function () {
  console.log('Listening...')
  
  // Set a sound level trigger
  // The trigger is a float between 0 and 1
  ambient.setSoundTrigger(TRIGGER_VALUE);
  ambient.on('sound-trigger', handleClap)
});

ambient.on('error', function (err) {
  console.log(err);
});


var toBoolean = function(value) {
  var strValue = String(value).toLowerCase();
  strValue = ((!isNaN(strValue) && strValue !== '0') &&
              strValue !== '' &&
              strValue !== 'null' &&
              strValue !== 'undefined') ? '1' : strValue;
  return strValue === 'true' || strValue === '1' ? true : false
};
