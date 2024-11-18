const express = require('express');
const router = express.Router();
const Agent = require('../models/agentModel'); // Sequelize model

// Route to handle form submission
router.post('/', async (req, res) => {
  const { firstName, lastName, email, phone, location, region, hearAboutUs, password, confirmPassword, agree } = req.body;

  // Validation for required fields
  if (!firstName || !lastName || !email || !phone || !location || !region || !hearAboutUs || !password || !confirmPassword || !agree) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Check if the agent already exists by email
    const existingAgent = await Agent.findOne({ where: { email } });
    if (existingAgent) {
      return res.status(400).json({ error: "Agent with this email already exists" });
    }

    // Create a new agent and save to the database
    const newAgent = await Agent.create({
      firstName,
      lastName,
      email,
      phone,
      location,
      region,
      hearAboutUs,
      password, // Assume password hashing is done in the model
      confirmPassword, // You can remove confirmPassword from the model once it's validated
      agree
    });

    res.status(201).json({ message: "Agent successfully registered!",newAgent });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server error" },error.message);
  }
});

// Route to fetch all agents
router.get('/agents', async (req, res) => {
  try {
    // Fetch all agents from the database
    const agents = await Agent.findAll();
    
    // Respond with the list of agents
    res.status(200).json(agents);
  } catch (error) {
    // Send an error response if something goes wrong
    res.status(500).json({ message: "An error occurred while fetching agents", error: error.message });
  }
});

module.exports = router;
