let searchEntry = document.getElementById('search');
let searchResults = document.getElementById('results');
let cityName = document.getElementById('city-name');
let chosenCity;
let weatherData;

let convertTime = function(unix){
    let millis = unix * 1000;
    let dateObject = new Date(millis);
    return dateObject.toLocaleDateString();
};



let getCities = function(searchEntry) {
    let apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${searchEntry}&limit=5&appid=feb08a39587f398b12842fe3303816d6`;
    // console.log(apiUrl);   
    fetch(apiUrl)
        .then(function(response){
            if (!response.ok) {
                alert('Error: ' + response.statusText);
                } 
            return response.json();    
        })
        .then(function (data){
            renderResults(data);
            })
        .catch(function (error) {
            alert('Unable to connect to OpenWeatherMap.org');
        });
    };

let getWeather = function() {
    console.log(chosenCity);
    cityName.textContent = chosenCity.textContent;
    let apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${chosenCity.dataset.lat}&lon=${chosenCity.dataset.long}&units=imperial&exclude=minutely,hourly,alerts&appid=feb08a39587f398b12842fe3303816d6`;
    fetch(apiUrl)
        .then(function(response){
            if (!response.ok){
                alert('Error: ' + response.statusText);
                } 
        return response.json();    
    })
    .then(function (data){
        console.log(data);
        renderWeather(data);
        weatherData = data;
        renderForecast(data);
        })
    .catch(function (error) {
        alert('Unable to connect to OpenWeatherMap.org');
    });
};

let renderResults = function(data){
    let str = '';
    if (data.length === 0) {
        document.getElementById('no-results').setAttribute('style', 'display: block;');
        return;
    }
    for (i=0; i < data.length; i++) {
        let listEL = `<li class="results-list cities" data-lat="${data[i].lat}" data-long="${data[i].lon}">${data[i].name}, ${data[i].state} (${data[i].country})</li>`;
        str += listEL;
    };
    searchResults.innerHTML += str;
    citySelect();
};

let renderWeather = function(data) {
    //main weather icons and description
    let icon = data.current.weather[0].icon;
    document.getElementById('icon-main').src = `https://openweathermap.org/img/wn/${icon}.png`;
    document.getElementById('desc-main').textContent = data.current.weather[0].description;
    document.getElementById('icon-main').alt = data.current.weather[0].main;
};

let renderForecast = function(data) {
    // other 4 day forcast
    for (i = 0; i < 5; i++) {
        let date = convertTime(data.daily[i].dt);
        document.getElementById('date'+i).textContent = date;
    };
    for (i = 1; i < 5; i++) {
        let icon = data.daily[i].weather[0].icon;
        document.getElementById('icon'+i).src = `https://openweathermap.org/img/wn/${icon}.png`;
        document.getElementById('icon'+i).alt = data.daily[i].weather[0].main;
    };    
    for (i = 0; i < 5; i++) {
        document.getElementById('temp'+i).textContent = data.daily[i].temp.day + 'F';
    };    
    for (i = 0; i < 5; i++) {
        document.getElementById('wind'+i).textContent = data.daily[i].wind_speed + 'mph';
    };    
    for (i = 0; i < 5; i++) {
        document.getElementById('humidity'+i).textContent = data.daily[i].humidity + '%';
    };    
    for (i = 0; i < 5; i++) {
        document.getElementById('UV'+i).textContent = data.daily[i].uvi;
    };    
};

document.getElementById('submit').addEventListener('click', function(event){
    event.preventDefault();
    getCities(searchEntry.value);

});

document.getElementById('test').addEventListener('click', function(event){
    event.preventDefault();
    console.log(weatherData);
    renderForecast(weatherData);
});

let citySelect = function(){
    let cities = document.querySelectorAll('.cities')

    cities.forEach(function(city){
        city.addEventListener('click', function(){
        chosenCity = city;
        getWeather();
        });
    });
};