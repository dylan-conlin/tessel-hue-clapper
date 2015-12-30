/*********************************************
 This ambient module example console.logs 
 ambient light and sound levels and whenever a 
 specified light or sound level trigger is met.
 *********************************************/

var tessel = require('tessel');
var ambientlib = require('ambient-attx4');
var ambient = ambientlib.use(tessel.port['B']);
var http = require('http');


ambient.on('ready', function () {
  // Get points of light and sound data.
  setInterval( function () {
    ambient.getLightLevel( function(err, ldata) {
      ambient.getSoundLevel( function(err, sdata) {
        console.log("Light level:", ldata.toFixed(8), " ", "Sound Level:", sdata.toFixed(8));
      });
    })}, 500); // The readings will happen every .5 seconds unless the trigger is hit

  // Set a sound level trigger
  // The trigger is a float between 0 and 1
  ambient.setSoundTrigger(0.1);

  ambient.on('sound-trigger', function(data) {
    console.log("Something happened with sound: ", data);
    

    turn_lights(false);
    
    // Clear it
    ambient.clearSoundTrigger();

    //After 1.5 seconds reset sound trigger
    setTimeout(function () { 

      ambient.setSoundTrigger(0.1);

    },1500);

  });
});

ambient.on('error', function (err) {
  console.log(err)
});


var toggle_lights = function(lights, state){
  for(var i = 0; i < lights.length; i++) {
    console.log("lights: ", lights)
    console.log("state: ", state)
    toggle_light(i, state)
  }
}

var toggle_light = function(light, state) {
  var lightPath = "/api/1d456a84386935a222fc058f36b3f57f/lights/" + light + "/state/";
  console.log(lightPath);
  var put_options = {
    host: '192.168.1.3',
    port: '80',
    path: lightPath,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  var req = http.request(put_options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (body) {
      console.log('BODY: ' + body);
    });
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  // write data to request body
  req.write('{"on": ' + state + '}');
  req.end();

}

var turn_lights = function(state){
  var get_options = {
    host: '192.168.1.3',
    port: '80',
    path: '/api/1d456a84386935a222fc058f36b3f57f/lights',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  var req = http.request(get_options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (body) {
      console.log(typeof body)
      var lights = Object.keys(JSON.parse(body))
      console.log("lights: ", lights)
      // console.log("state: ", state)
      toggle_lights(lights, state);
    });
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  // write data to request body
  // req.write('{"on": true}');
  req.end();

}
