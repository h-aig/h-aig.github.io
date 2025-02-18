exports.handler = (event, context, callback) => {
  const { client_id, response_type, redirect_uri, scope } = event.queryStringParameters;

  if (!client_id || !response_type || !redirect_uri || !scope) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required parameters" }),
    });
  }

  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=${response_type}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${encodeURIComponent(scope)}`;

  callback(null, {
    statusCode: 302, // Redirect response
    headers: {
      Location: spotifyAuthUrl, // Redirects the user to Spotify's auth page
    },
  });
};
