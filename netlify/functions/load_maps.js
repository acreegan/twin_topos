const fetch = require('node-fetch');
require('dotenv').config();
const apiKey = process.env.MAPS_API_KEY;

exports.handler = async (event, context) => {

  const url = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMaps`; // Append the API key to the URL
  const response = await fetch(url);
  body = response.body
  
  if (!response.ok) {
    return {
      statusCode: response.status,
      body: JSON.stringify({ message: "Hello World" ,  code:response.statusText, response: body})
    };
  }

  const data = await response.text();

  return {
    statusCode: 200,
    body: data
  };
};