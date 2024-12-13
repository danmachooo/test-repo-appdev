const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const response = await axios.post('http://127.0.0.1:5001/api/chat', req.body);
    // return res.status(201).json({success: true, message: 'Request success!'}, response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error calling chatbot API:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

module.exports = router;