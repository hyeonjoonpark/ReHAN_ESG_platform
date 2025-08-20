import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { latitude, longitude } = req.query;

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json`,
      {
        params: {
          units: 'metric',
          origins: `${latitude},${longitude}`,
          destinations: '37.4842,126.7994',
          key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        }
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data from Google Maps API', error: error.message });
  }
}