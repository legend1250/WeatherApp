const express = require('express');
const path = require('path');
const cluster = require('cluster');
const axios = require('axios');
const numCPUs = require('os').cpus().length;
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;

// Multi-process to utilize all CPU cores.
if (cluster.isMaster) {
  console.error(`Node cluster master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.error(`Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`);
  });

} else {
  const app = express();
  app.use(bodyParser.urlencoded({ extended: true }));
  // Priority serve any static files.
  app.use(express.static(path.resolve(__dirname, '../react-ui/build')));

  // Answer API requests.
  app.get('/api', function (req, res) {
    res.set('Content-Type', 'application/json');
    res.send({
      message: "Hello from the custom server!!!"
    });
  });

  app.get('/test', (req, res) => {
    res.set('Content-Type', 'application/json');
    console.log(req.query.location);
    res.send({
      name: 'Vinh'
    })
  })

  app.get('/weather', async (req, res) => {
    res.set('Content-Type', 'application/json');

    var location = req.query.location
  
    var encodedAddress = encodeURIComponent(location);
    //call google geometry API
    var geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyBNKIalPzMBTz1eawRt5Ep6f1ff3MVPMVA&address=${encodedAddress}`;
    var geocode;
  
    //result from google API
    try {
      geocode = await axios.get(geocodeUrl);
    } catch (error) {
      return res.send({
        error: true,
        error_msg: 'Truy vấn không hợp lệ'
      })
    }
    
    if(geocode.data.status == 'ZERO_RESULTS'){
      return res.send({
        error: true,
        error_msg: 'Không có dữ liệu phù hợp'
      })
    }
  
    var formatted_address = geocode.data.results[0].formatted_address;
    var lat = geocode.data.results[0].geometry.location.lat;
    var lng = geocode.data.results[0].geometry.location.lng;
    
    //call openweathermap API 
    // var apikey_openweathermap = '098b4a95dbb15115a320c6a64e3272be';
    // var weatherUrl = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apikey_openweathermap}&units=metric`;
    // var weather_result = await axios.get(weatherUrl);
    // //result from openweather API
    // let temp = weather_result.data.main.temp;
  
    // call openweather API forecast
    // var forecast = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&APPID=${apikey_openweathermap}&units=metric`;
    // var weather_forecast_result = await axios.get(forecast);
    // console.log(forecast);
    // //result of weather forecast
    // let nextWeather = weather_forecast_result.data.list;
  
    //call dark sky api
    var weatherUrl = `https://api.darksky.net/forecast/173f4a164eba7e06d2357ce1688945ba/${lat},${lng}?units=si`;
    var weather = await axios.get(weatherUrl);
    let current_temp = weather.data.currently.apparentTemperature;
    let nextWeather = weather.data.hourly.data;
  
    res.send({
      error: false,
      address: formatted_address,
      temp: current_temp,
      nextWeather: nextWeather
    })
  })

  // All remaining requests return the React app, so it can handle routing.
  app.get('*', function(request, response) {
    response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
  });

  app.listen(PORT, function () {
    console.error(`Node cluster worker ${process.pid}: listening on port ${PORT}`);
  });
}
