// index.js (or your Express server setup file)

import express from 'express';
import axios from 'axios';
import path from 'path';
import bodyParser from 'body-parser';

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Route to render the weather form
app.get('/', (req, res) => {
  res.render('weather.ejs', { weather: null, error: null });
});

// Route to handle weather data request
app.get('/weather', async (req, res) => {
  const { city, date } = req.query;
  const apiKey = 'eb709e7547d9358c9828f47536781dd6'; // Replace with your OpenWeatherMap API key
  const units = 'metric'; // or 'imperial' for Fahrenheit

  // Construct the API URL for weather forecast
  const url = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${units}&appid=${apiKey}`;

  try {
    // Fetch weather data from OpenWeatherMap API
    const response = await axios.get(url);
    const weatherDataList = response.data.list;

    if (!weatherDataList || weatherDataList.length === 0) {
      throw new Error('Weather data list is empty or undefined.');
    }

    // Find the forecast for the specified date
    const forecast = weatherDataList.find(item => item.dt_txt.includes(date));

    if (!forecast) {
      throw new Error('Weather data not found for specified date.');
    }

    // Format the date in the desired format (e.g., "10th of April, 2024")
    const formattedDate = formatDate(forecast.dt_txt);

    // Extract relevant weather information from the forecast
    const weather = {
      city: response.data.city.name,
      country: response.data.city.country,
      date: formattedDate,
      description: forecast.weather[0].description,
      icon: forecast.weather[0].icon,
      temperature: forecast.main.temp,
      feelsLike: forecast.main.feels_like,
      humidity: forecast.main.humidity,
      windSpeed: forecast.wind.speed,
      isCloudy: forecast.weather[0].main.toLowerCase().includes('cloud'),
    };

    // Render weather.ejs template with weather data
    res.render('weather.ejs', { weather, error: null });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Render weather.ejs template with error message
    res.render('weather.ejs', { weather: null, error: 'Error fetching weather data. Please try again.' });
  }
});

// Function to format date as "10th of April, 2024"
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = {month: 'long', year: 'numeric' };
  const formattedDate = date.toLocaleDateString('en-GB', options);

  // Add ordinal suffix to day (e.g., 1st, 2nd, 3rd, 4th)
  const day = date.getDate();
  const suffix = getDaySuffix(day);
  return `${day}${suffix} of ${formattedDate}`;
}

// Function to get ordinal suffix for day (e.g., 1st, 2nd, 3rd)
function getDaySuffix(day) {
  if (day >= 11 && day <= 13) {
    return 'th';
  }
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
