const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.get('create-makerspace', async (req, res) => {
  try {
    const organizationId = "create-makerspace";
    const authToken = req.headers.authorization;

    if (!authToken) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    const response = await fetch(`https://www.amilia.com/api/v3/en/organizations/create-makerspace/activities`, {
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch activities: ${response.statusText}`);
    }

    const activities = await response.json();
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

module.exports = router;
