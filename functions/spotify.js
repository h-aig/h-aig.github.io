const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

exports.handler = async (event, context) => {
  try {
    // Get the refresh token we stored as an environment variable
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

    // Do the base64 encoding we did earlier but with Node tools
    const auth = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');

    // Store the Spotify API endpoint for readability
    const tokenEndpoint = `https://accounts.spotify.com/api/token`;

    const options = {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: `grant_type=refresh_token&refresh_token=${refreshToken}&redirect_uri=${encodeURI(
        process.env.URL + '/.netlify/functions/callback'
      )}`,
    };

    // Get the access token
    const tokenResponse = await axios(tokenEndpoint, options);
    const accessToken = tokenResponse.data.access_token;

    // Request recently played songs
    const playerEndpoint = `https://api.spotify.com/v1/me/player/recently-played`;

    const playerResponse = await axios.get(playerEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Grab the most recent song from the response data (first item in the array)
    const mostRecentTrack = playerResponse.data.items[0];

    // Log and return only the most recent song
    console.log(mostRecentTrack);

    return {
      statusCode: 200,
      body: JSON.stringify(mostRecentTrack), // Send only the most recent track
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Something went wrong!' }),
    };
  }
};