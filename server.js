const express = require('express');
// let ejs = require('ejs');
const path = require('path');
const axios = require('axios');
const app = express();

const port = process.env.PORT || 5000;

const publicDirectory = path.join(__dirname, '/public');

app.use(express.static(publicDirectory));

const viewsPath = path.join(__dirname + '/views');

app.set('view engine', 'hbs');

// app.use(express.urlencoded());
app.use(express.urlencoded({ extended: true }))

app.use(express.json());

app.get('/', async (req, res) => {

res.render('index', {
    weatherDisc: '',
    tempC:  '',
    srcLogo: "http://openweathermap.org/img/w/04d.png"
  });
});

app.post('/', async (req, res) => {
    try{
        const city = req.body.theCity
        const countCode = req.body.theCountry
        const apiKey = 'dd956bf8419d0456adb3ff56d7ad1041';
        const cityUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city},${countCode}&appid=${apiKey}`;
        const apiResponse = await axios.get(cityUrl);
        let iconUrl = "http://openweathermap.org/img/w/" + apiResponse.data.weather[0].icon + ".png";

        let tempC = (apiResponse.data.main.temp - 273.15).toFixed(2)
  
      res.render('index', {
        cityName: city,
        weatherDisc: apiResponse.data.weather[0].description,
        tempC:  tempC,
        srcLogo: iconUrl,
        });
    }catch (error) {
        console.error(error.response);
        res.render('index',{
            msg: error.response.data.message,
            srcLogo: '/images/e1.png'
        });
    }
})


// 7 days forecast
app.get('/weather', async (req, res) => {
    const apiKey = 'dd956bf8419d0456adb3ff56d7ad1041';
    const urlForecast = `https://api.openweathermap.org/data/2.5/onecall?lat=51.509865&lon=-0.118092&
    exclude=hourly,minutely&appid=${apiKey}&units=metric`
    const apiRespForecast = await axios.get(urlForecast)
    let uniDt = apiRespForecast.data.daily
    const dateArray = uniDt.map( dta => new Date(dta.dt*1000).toDateString('en-GB'))  
    const dailyResp = apiRespForecast.data.daily
    const src1 = 'http://openweathermap.org/img/wn/'+ apiRespForecast.data.daily[0].weather[0].icon +'@2x.png'

   res.render('weather',{
      dateArray: dateConv.toDateString('en-GB'),
       temp1: apiRespForecast.data.daily[0].temp.day + 'ºC',
       min1: apiRespForecast.data.daily[0].temp.min + '/'+ apiRespForecast.data.daily[0].temp.max + 'ºC',
       desc1:apiRespForecast.data.daily[0].weather[0].description,
       src1: src1
   }) 
}
)

app.get('/forecast', async (req, res)=>{
    const apiKey = 'dd956bf8419d0456adb3ff56d7ad1041';
    const urlForecast = `https://api.openweathermap.org/data/2.5/onecall?lat=51.509865&lon=-0.118092&
    exclude=hourly,minutely&appid=${apiKey}&units=metric`
    const apiRespForecast = await axios.get(urlForecast)

    const uniDt = apiRespForecast.data.daily
    const dateArray = uniDt.map( dta => new Date(dta.dt*1000).toDateString('en-GB'))
    const srcArr = uniDt.map(src => 'http://openweathermap.org/img/wn/'+ src.weather[0].icon +'.png')
    const descArr = uniDt.map( des => des.weather[0].description)
    const minMax = uniDt.map(tem => `Min: ${tem.temp.min} ºC / Max: ${tem.temp.max} ºC` )

    res.render('forecast',{
        dataArray: apiRespForecast.data.daily,
        dates:dateArray,
        desc: descArr,
        src: srcArr,
        minMax: minMax
    })
})

app.listen(port, () => {
  console.log('Server is up and running');
});
