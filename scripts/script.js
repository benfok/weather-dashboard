let searchEntry = document.getElementById('search');
let searchResults = document.getElementById('results');
let cityName = document.getElementById('city-name');
let chosenCity;
let savedCities = [];

let convertTime = function(unix){
    let millis = unix * 1000;
    let dateObject = new Date(millis);
    return dateObject.toLocaleDateString();
};

let displayWeather = function() {
    document.querySelector('.main-weather').style.display = 'flex';
    document.querySelector('.card-container').style.display = 'flex';
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
    // console.log(chosenCity);
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
        renderWeather(data);
        renderForecast(data);
        displayWeather();
        })
    .catch(function (error) {
        alert('Unable to connect to OpenWeatherMap.org');
    });
};

let renderResults = function(data){
    // clear the search results
    searchResults.innerHTML = '';
    // if no results returned displaty a message
    let str = '';
    if (data.length === 0) {
        let listEl = `<li class="results-list cities">No Results - Please Search Again</li>`;
        str += listEl;
    // if results are displayed render them to the page and include the lat and long data to pass into the weather API call
    } else {
        for (i=0; i < data.length; i++) {
            let listEL = `<li class="results-list cities" data-lat="${data[i].lat}" data-long="${data[i].lon}">${data[i].name}, ${data[i].state} (${data[i].country})</li>`;
            str += listEL;
        };
    }
    searchResults.innerHTML += str;
    citySelect();
};

let renderWeather = function(data) {
    //main weather icons and description
    let date = convertTime(data.current.dt);
    document.getElementById('date0').textContent = date;
    document.getElementById('temp0').textContent = data.current.temp + '°F';
    document.getElementById('wind0').textContent = data.current.wind_speed + 'mph';
    document.getElementById('humidity0').textContent = data.current.humidity + '%';
    let value = document.getElementById('UV0');
    let uvi = data.current.uvi;
    value.textContent = uvi;
    if (uvi < 3) {
            value.className += ' uv-low';
    } else if (uvi >= 3 && uvi < 6) {
            value.className += ' uv-mod';
    } else {
            value.className += ' uv-high';
    }
    let icon = data.current.weather[0].icon;
    document.getElementById('icon-main').src = `https://openweathermap.org/img/wn/${icon}.png`;
    document.getElementById('desc-main').textContent = data.current.weather[0].description;
    document.getElementById('icon-main').alt = data.current.weather[0].main;
    document.querySelector('.weather-section').style.backgroundImage = '';
};

let renderForecast = function(data) {
    // other 4 day forcast from daily array in the API object
    for (i = 1; i < 5; i++) {
        let date = convertTime(data.daily[i].dt);
        document.getElementById('date'+i).textContent = date;
    };
    for (i = 1; i < 5; i++) {
        let icon = data.daily[i].weather[0].icon;
        document.getElementById('icon'+i).src = `https://openweathermap.org/img/wn/${icon}.png`;
        document.getElementById('icon'+i).alt = data.daily[i].weather[0].main;
    };    
    for (i = 1; i < 5; i++) {
        document.getElementById('temp'+i).textContent = data.daily[i].temp.day + '°F';
    };    
    for (i = 1; i < 5; i++) {
        document.getElementById('wind'+i).textContent = data.daily[i].wind_speed + 'mph';
    };    
    for (i = 1; i < 5; i++) {
        document.getElementById('humidity'+i).textContent = data.daily[i].humidity + '%';
    };    
    for (i = 1; i < 5; i++) {
        let value = document.getElementById('UV'+i);
        let uvi = data.daily[i].uvi;
        value.textContent = uvi;
        if (uvi < 3) {
                value.className += ' uv-low';
        } else if (uvi >= 3 && uvi < 6) {
                value.className += ' uv-mod';
        } else {
                value.className += ' uv-high';
        }
    };    
};

document.getElementById('submit').addEventListener('click', function(event){
    event.preventDefault();
    if (searchEntry.value === '') {
        alert('Please enter a city name into the search box');
    } else {
    getCities(searchEntry.value);
    }
});

// retrieve recent searches from storage
let getSavedCities = function() {
    if (!localStorage.getItem('savedCities')) {
        document.getElementById('saved-cities').innerHTML = `<li class="recent-list">No Saved Data</li>`;
        return;
    }
    let data = localStorage.getItem('savedCities');
    savedCities = JSON.parse(data);
    renderSavedList();
};

// add the selected city to local storage
let addCityToStorage = function (city) {
    let str = (city.outerHTML);
    for (i=0; i<savedCities.length; i++) {
        if (str === savedCities[i]){
            return;
        }
    }
    savedCities.push(str);
    localStorage.setItem('savedCities', JSON.stringify(savedCities));
    renderSavedList();
};

let renderSavedList = function (){
    document.getElementById('saved-cities').innerHTML = '';
    let str = savedCities.join('');
    document.getElementById('saved-cities').innerHTML = str;
    citySelect();
}

let citySelect = function(){
    let cities = document.querySelectorAll('.cities')

    cities.forEach(function(city){
        city.addEventListener('click', function(){
        chosenCity = city;
        addCityToStorage(city);
        getWeather();
        });
    });
};

// clear search history
document.getElementById('clear').addEventListener('click', function(){
    localStorage.clear();
    savedCities = [];
    getSavedCities();
});

window.addEventListener('load', function() {
    getSavedCities();
});
