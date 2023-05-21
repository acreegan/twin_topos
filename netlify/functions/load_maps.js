const fetch = require('node-fetch');
const apiKey = process.env.MAPS_API_KEY;

exports.handler = async (event, context) => {


  const url = `https://maps.googleapis.com${event.path}&key=${apiKey}`; // Append the API key to the URL
  const response = await fetch(url);
  


//   if (!response.ok) {
//     return {
//       statusCode: response.status,
//       body: response.body
//     };
//   }

  return {
    statusCode: 200,
    body: response.body
  };

  const data = await response.text();

  return {
    statusCode: 200,
    body: data
  };
};