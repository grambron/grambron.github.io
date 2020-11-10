const apiKey = 'f0b947c783873ab1a7c905ad26e85162';

async function get_waiting(content) {
    let waiting = content.querySelector('.waiting');
    waiting.classList.remove('waiting_visible');
    waiting.classList.add('waiting_hidden');
    await sleep(300);
    return waiting;
}

function windSpeed(speed) {
    let windDescription;

    switch (true) {
        case(speed >= 0 && speed <= 0.5):
            windDescription = "Calm";
            break;
        case(speed > 0.5 && speed <= 1.5):
            windDescription = "Light air";
            break;
        case(speed > 1.5 && speed <= 3.3):
            windDescription = "Light breeze";
            break;
        case(speed > 3.3 && speed <= 5.5):
            windDescription = "Gentle breeze";
            break;
        case(speed > 5.5 && speed <= 7.9):
            windDescription = "Moderate breeze";
            break;
        case(speed > 7.9 && speed <= 10.7):
            windDescription = "Fresh breeze";
            break;
        case(speed > 10.7 && speed <= 13.8):
            windDescription = "Strong breeze";
            break;
        case(speed > 13.8 && speed <= 17.1):
            windDescription = "Moderate gale";
            break;
        case(speed > 17.1 && speed <= 20.7):
            windDescription = "Fresh gale";
            break;
        case(speed > 20.8 && speed <= 24.4):
            windDescription = "Strong gale";
            break;
        case(speed > 24.4 && speed <= 28.4):
            windDescription = "Whole gale";
            break;
        case(speed > 28.4 && speed <= 32.6):
            windDescription = "Storm";
            break;
        case(speed > 32.6):
            windDescription = "Hurricane over";
            break;
    }
    return windDescription;
}

function windDirection(degree) {
    let direction;
    switch (true) {
        case(degree >= 348.75 && degree < 11.25):
            direction = "North";
            break;
        case(degree >= 11.25 && degree < 33.75):
            direction = "North-northeast";
            break;
        case(degree >= 33.75 && degree < 56.25):
            direction = "Northeast";
            break;
        case(degree >= 56.25 && degree < 78.75):
            direction = "East-northeast";
            break;
        case(degree >= 78.75 && degree < 101.25):
            direction = "East";
            break;
        case(degree >= 101.25 && degree < 123.75):
            direction = "East-southeast";
            break;
        case(degree >= 123.75 && degree < 146.25):
            direction = "Southeast";
            break;
        case(degree >= 146.25 && degree < 168.75):
            direction = "South-southeast";
            break;
        case(degree >= 168.75 && degree < 191.25):
            direction = "South";
            break;
        case(degree >= 191.25 && degree < 213.75):
            direction = "South-southwest";
            break;
        case(degree >= 213.75 && degree < 236.25):
            direction = "Southwest";
            break;
        case(degree >= 236.25 && degree < 258.75):
            direction = "West-southwest";
            break;
        case(degree >= 258.75 && degree < 281.25):
            direction = "West";
            break;
        case(degree >= 281.25 && degree < 303.75):
            direction = "West-northwest";
            break;
        case(degree >= 303.75 && degree < 326.25):
            direction = "Northwest";
            break;
        case(degree >= 326.25 && degree < 348.75):
            direction = "North-northwest";
            break;
    }
    return direction
}

function cloudsType(percent) {
    let type;
    switch (true) {
        case(percent <= 10):
            type = 'Clear sky';
            break;
        case (percent > 10 && percent <= 50):
            type = 'Scattered clouds';
            break
        case (percent > 50 && percent <= 90):
            type = 'Broken clouds';
            break;
        case (percent > 90):
            type = 'Overcast';
            break;
    }
    return type;
}

window.onload = async function () {
    const name = "agree=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    let cookAgree = "";
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            cookAgree = c.substring(name.length, c.length);
        }
    }
    let agree = cookAgree ? true : confirm('Согласны ли вы предоставить данные о вашей геолокации?');
    if (agree) {
        setCookie('agree', true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            let response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?cnt=1&units=metric&lat=${position.coords.latitude}&lon=${position.coords.longitude}&APPID=${apiKey}`);
            if (response.ok) {
                let json = await response.json();
                await fillCurrent(json);
            } else {
                alert("Ошибка HTTP: " + response.status);
            }
        });
    } else {
        let response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?cnt=1&units=metric&q=Saint Petersburg,ru&APPID=${apiKey}`);
        if (response.ok) {
            let json = await response.json();
            await fillCurrent(json);
        }
    }

    await fillFavorites();

    let newTownButton = document.getElementById('add_new_town_button');
    let newTownInput = document.getElementById('add_new_town_input');
    newTownButton.onclick = (e) => {
        e.preventDefault();
        let flag = false;
        let towns = JSON.parse(localStorage.getItem('towns'));
        if (towns == null) {
            localStorage.setItem('towns', JSON.stringify([newTownInput.value]))
        }
        for (let i = 0; i < towns.length; i++) {
            if (towns[i].toLowerCase() === newTownInput.value.toLowerCase()) {
                flag = true;
                break;
            }
        }
        if (!flag) {
            towns.push(newTownInput.value);
            localStorage.setItem('towns', JSON.stringify(towns));
        }
        location.reload();
    };
    let reloadButton = document.getElementById('reload_geo');
    reloadButton.onclick = function () {
        setCookie('agree', true, -1);
        location.reload();
    }
};

async function fillCurrent(data) {
    let leftBlock = document.querySelector('#top_weather_left_block');
    let h3 = leftBlock.querySelector('h3');
    let img = leftBlock.querySelector('img');
    let degrees = leftBlock.querySelector('.big_degrees');
    h3.innerText = data.city.name;
    img.src = 'http://openweathermap.org/img/wn/' + data.list[0].weather[0].icon + '@4x.png';
    degrees.innerText = data.list[0].main.temp + '° C';

    let topRightBlock = document.querySelector("#top_weather_right_block");
    fillCityContent(topRightBlock, data);
    await get_waiting(document);
}

function fillCityContent(block, data) {
    let weather = data.list[0];
    let template = document.querySelector('#info_item_template');
    let name, value, clones = [];

    name = template.content.querySelector('.info_item_name');
    value = template.content.querySelector('.info_item_value');

    name.textContent = 'Ветер';
    value.textContent = windSpeed(weather.wind.speed) + `, ${weather.wind.speed} m/s, ` + windDirection(weather.wind.deg);
    clones.push(document.importNode(template.content, true));

    name.textContent = 'Облачность';
    value.textContent = cloudsType(weather.clouds.all);
    clones.push(document.importNode(template.content, true));

    name.textContent = 'Давление';
    value.textContent = `${weather.main.pressure} hpa`;
    clones.push(document.importNode(template.content, true));

    name.textContent = 'Влажность';
    value.textContent = `${weather.main.humidity}%`;
    clones.push(document.importNode(template.content, true));

    name.textContent = 'Координаты';
    value.textContent = `[${data.city.coord.lat}, ${data.city.coord.lon}]`;
    clones.push(document.importNode(template.content, true));

    clones.forEach((item) => block.appendChild(item));
}

function deletion(deleteButtons) {
    for (let j = 0; j < deleteButtons.length; j++) {
        deleteButtons[j].onclick = (e) => {
            let cityName = deleteButtons[j].previousElementSibling.previousElementSibling.previousElementSibling;
            e.preventDefault();
            let towns = JSON.parse(localStorage.getItem('towns'));
            let position = towns.indexOf(cityName.innerText);

            if (~position) towns.splice(position, 1);
            localStorage.setItem('towns', JSON.stringify(towns));
            location.reload();
        };
    }
}

async function fillFavorites() {
    let cities = JSON.parse(localStorage.getItem('towns'));
    if (cities == null) return;
    let favorites = document.querySelector('#favorite_towns');

    for (const city of cities) {
        let response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?cnt=1&units=metric&q=${city}&APPID=${apiKey}`);
        let townTemplate = document.querySelector('#city_weather_template');
        let emptyTown = townTemplate.cloneNode(true);
        let data, cityName, degrees, img, ul;

        if (response.ok) {
            data = await response.json();
            favorites.appendChild(document.importNode(emptyTown.content, true));
            cityName = townTemplate.content.querySelector('.top_block_city_name');
            degrees = townTemplate.content.querySelector('.degrees');
            img = townTemplate.content.querySelector('img');
            ul = townTemplate.content.querySelector('ul');
            ul.innerHTML = '';

            fillCityContent(ul, data);

            cityName.innerText = city;
            img.src = 'http://openweathermap.org/img/wn/' + data.list[0].weather[0].icon + '@2x.png';
            degrees.innerText = data.list[0].main.temp + '° C';
            let waiting = await get_waiting(townTemplate.content);

            favorites.removeChild(favorites.lastElementChild);
            favorites.appendChild(document.importNode(townTemplate.content, true));
            waiting.classList.add('waiting_visible');
            waiting.classList.remove('waiting_hidden');
        } else {
            favorites.appendChild(document.importNode(emptyTown.content, true));
            cityName = townTemplate.content.querySelector('.top_block_city_name');
            cityName.innerText = city;
            degrees = townTemplate.content.querySelector('.degrees');
            img = townTemplate.content.querySelector('img');
            ul = townTemplate.content.querySelector('ul');
            degrees.innerHTML = '';
            ul.innerHTML = '';
            img.src = '';

            let errorMessage = townTemplate.content.querySelector('.error_info');
            errorMessage.innerHTML = 'По данному городу не удалось загрузить данные';
            let waiting = await get_waiting(townTemplate.content);
            favorites.removeChild(favorites.lastElementChild);
            favorites.appendChild(document.importNode(townTemplate.content, true));
            errorMessage.innerHTML = '';
            waiting.classList.add('waiting_visible');
            waiting.classList.remove('waiting_hidden');
        }
    }

    let deleteButtons = document.getElementsByClassName('delete_button');
    deletion(deleteButtons);
}

function setCookie(cname, cvalue, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}


function sleep(ms) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < ms);
}