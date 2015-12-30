/*********************************************
 This ambient module example console.logs 
 ambient light and sound levels and whenever a 
 specified light or sound level trigger is met.
 *********************************************/

var tessel = require('tessel');
var ambientlib = require('ambient-attx4');
var ambient = ambientlib.use(tessel.port['B']);
var http = require('http');
var hueApiKey = '1d456a84386935a222fc058f36b3f57f';
var togglingLights = false;

function toggleLights(state, cb) {
  var put_options = {
    host: '192.168.1.3',
    port: '80',
    path: "/api/1d456a84386935a222fc058f36b3f57f/groups/0/action",
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  var req = http.request(put_options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (body) {
      cb(body)
    });
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  req.write('{"on":' + state + '}');
  req.end(function(){ambient.setSoundTrigger(0.1)});
}

function handleClap(data){
  console.log("Something happened with sound: ", data);

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
    res.on('data', function (body) {
      // JSON.parse doesnt work on tessel for some reason.
      var lightsAreOn = body.indexOf('{"on":true,') > -1 ? false : true
      console.log(lightsAreOn)
      toggleLights(lightsAreOn, function(body){
        console.log(body)
      })
    });
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
  
  ambient.setSoundTrigger(0.1);

  ambient.on('sound-trigger', handleClap)
});

ambient.on('error', function (err) {
  console.log(err);
});



