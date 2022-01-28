let searchEntry = document.getElementById('search');
let searchResults = document.getElementById('results');
let cityName = document.getElementById('city-name');

let chosenCity;
let savedCities = [];

// convert unix time from API to readable date format
let convertTime = function(unix){
    let millis = unix * 1000;
    let dateObject = new Date(millis);
    return dateObject.toLocaleDateString();
};

// weather cards are hidden by default. Display upon location selection
let displayWeather = function() {
    document.querySelector('.main-weather').style.display = 'flex';
    document.querySelector('.card-container').style.display = 'flex';
};

// function API call to return 5 search results for location
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

// function API call using lat and long coordinates from chosen location to pull back weather. API actually provides 7 day forecast.
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
    // after receiving the data, render the weather forecast and display the cards
    .then(function (data){
        renderWeather(data);
        renderForecast(data);
        console.log(data);
        displayWeather();
        })
    .catch(function (error) {
        alert('Unable to connect to OpenWeatherMap.org');
    });
};

let renderResults = function(data){
    // clear the search results
    searchResults.innerHTML = '';
    // if no results returned display a message
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
    // add cities as a list
    searchResults.innerHTML += str;
    // activate event listeners on the newly created <li>s
    citySelect();
};

let renderWeather = function(data) {
    // main weather icon and description
    let icon = data.current.weather[0].icon;
    document.getElementById('icon-main').src = `https://openweathermap.org/img/wn/${icon}.png`;
    document.getElementById('desc-main').textContent = data.current.weather[0].description;
    document.getElementById('icon-main').alt = data.current.weather[0].main;
    // remove background placeholder image when weather is displayed
    document.querySelector('.weather-section').style.backgroundImage = '';
};

let renderForecast = function(data) {
    // 5 day forecast from daily array in the API object. Loop through the data array to populate the values
    for (i = 0; i < 6; i++) {
        let date = convertTime(data.daily[i].dt);
        document.getElementById('date'+i).textContent = date;
    };
    for (i = 1; i < 6; i++) {
        let icon = data.daily[i].weather[0].icon;
        document.getElementById('icon'+i).src = `https://openweathermap.org/img/wn/${icon}.png`;
        document.getElementById('icon'+i).alt = data.daily[i].weather[0].main;
    };    
    for (i = 0; i < 6; i++) {
        document.getElementById('temp'+i).textContent = data.daily[i].temp.day + '°F';
    };    
    for (i = 0; i < 6; i++) {
        document.getElementById('wind'+i).textContent = data.daily[i].wind_speed + 'mph';
    };    
    for (i = 0; i < 6; i++) {
        document.getElementById('humidity'+i).textContent = data.daily[i].humidity + '%';
    };    
    // UV formatting. Could have possibly been combined in a function to avoid repeating from main-weather rendering
    for (i = 0; i < 6; i++) {
        let value = document.getElementById('UV'+i);
        let uvi = data.daily[i].uvi;
        value.textContent = uvi;
        // supporting all browsers
        if (uvi < 3 || uvi === 0) {
                value.className = 'uvi uv-low';
        } else if (uvi >= 3 && uvi < 6) {
                value.className = 'uvi uv-mod';
        } else {
                value.className = 'uvi uv-high';
        }
    };    
};

// event listener for search function
document.getElementById('submit').addEventListener('click', function(event){
    event.preventDefault();
    // handle blank search
    if (searchEntry.value === '') {
        alert('Please enter a city name into the search box');
    } else {
    // run API to return results
    getCities(searchEntry.value);
    }
});

// retrieve recent searches from storage
let getSavedCities = function() {
    // check that localStorage exists and if not show message to user within Search History section
    if (!localStorage.getItem('savedCities')) {
        document.getElementById('saved-cities').innerHTML = `<li class="recent-list">No Saved Data</li>`;
        return;
    }
    // retrieve and parse data into savedCities array
    let data = localStorage.getItem('savedCities');
    savedCities = JSON.parse(data);
    // render search history
    renderSavedList();
};

// add the selected city to local storage by first adding to savedCities variable then pushing that to localStorage as a string
let addCityToStorage = function (city) {
    let str = (city.outerHTML);
    for (i=0; i<savedCities.length; i++) {
        if (str === savedCities[i]){
            return;
        }
    };
    savedCities.unshift(str);
    // retain array format for parsing later
    localStorage.setItem('savedCities', JSON.stringify(savedCities));
    renderSavedList();
};

// renders the search history to the page
let renderSavedList = function (){
    document.getElementById('saved-cities').innerHTML = '';
    let str = savedCities.join('');
    document.getElementById('saved-cities').innerHTML = str;
    // calls this function to ensure addeventlistener is active on the search history items
    citySelect();
};

// loops through all items in search results and history to activate event listener so clicking will pull up weather
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

// get search history upon page load
window.addEventListener('load', function() {
    getSavedCities();
});
