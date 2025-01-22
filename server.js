const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;


app.get('/', (req, res) => {
  res.send('Welcome to the API Test Case Generator!');
});


app.post('/generate-test-cases', async (req, res) => {
  const { method, url, headers, queryParams, successResponse, errorResponse } = req.body;
    console.log("Token: ",process.env.OPENAI_API_KEY);
  if (!method || !url || !successResponse) {
    return res.status(400).json({ error: 'Please provide method, url, and successResponse.' });
  }

  try {
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/completions',
      {
        model: 'gpt-3.5-turbo',
        prompt: generatePrompt(method, url, headers, queryParams, successResponse, errorResponse),
        max_tokens: 1000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const testCases = openaiResponse.data.choices[0].text.trim();
    res.status(200).json({ testCases });
  } catch (err) {
    console.error("Error: ",err.status);
    res.status(500).json({ error: 'Failed to generate test cases.' });
  }
});


function generatePrompt(method, url, headers, queryParams, successResponse, errorResponse) {
  return `
  Generate Mocha/Chai test cases for the following API:
  Method: ${method}
  URL: ${url}
  Headers: ${JSON.stringify(headers)}
  Query Parameters: ${JSON.stringify(queryParams)}
  Success Response: ${JSON.stringify(successResponse)}
  Error Response: ${JSON.stringify(errorResponse)}
  `;
}


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
