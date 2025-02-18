const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

exports.handler = async (event, context) => {
  // 1. Fetch Spotify Access Token Using Refresh Token Grant

  // Get the refresh token from the environment variables.
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  // Encode the client ID and secret in base64.
  const auth = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  // Spotify API token endpoint.
  const tokenEndpoint = "https://accounts.spotify.com/api/token";

  // Prepare options for the POST request.
  const options = {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=refresh_token&refresh_token=${refreshToken}&redirect_uri=${encodeURI(
      process.env.URL + "/.netlify/functions/callback"
    )}`,
  };

  // Retrieve the access token.
  const accessToken = await fetch(tokenEndpoint, options)
    .then((res) => res.json())
    .then((json) => {
      return json.access_token;
    })
    .catch((err) => {
      console.error("Error fetching access token:", err);
    });

  // 2. Fetch The Most Recent Song

  // Define the endpoint for the recently played songs.
  const playerEndpoint = "https://api.spotify.com/v1/me/player/recently-played";

  // Make a GET request to the Spotify API (limit=1 returns the most recent song).
  return fetch(`${playerEndpoint}?limit=1`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((res) => res.json())
    .then((json) => {
      // Optionally log the response.
      console.log("Spotify response:", json);
      // Return a valid Netlify function response.
      return {
        statusCode: 200,
        body: JSON.stringify(json),
      };
    })
    .catch((err) => {
      console.error("Error fetching song:", err);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Error fetching song" }),
      };
    });
};
