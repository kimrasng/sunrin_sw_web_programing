const API_KEY = '18e41b5797f0b0eb0d6059dad5730fd5'
const button = document.querySelector('.button')
const temperature = document.querySelector('.temperature')
const place = document.querySelector('.place')
const description = document.querySelector('.description')


button.addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition(success, fail)
})

const success = (position) => {
  const { latitude, longitude } = position.coords
  getWeather(latitude, longitude)
}

const fail = () => {
  alert('위치 정보를 가져오는데 실패했습니다.')
}

const getWeather = (lat, lon) => {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`)
    .then((response) => response.json())
    .then((data) => {
      temperature.textContent = `${data.main.temp}°C`
      place.textContent = data.name
      description.textContent = data.weather[0].description
    })
    .catch((error) => {
      console.error('Error fetching weather data:', error)
    })
}
