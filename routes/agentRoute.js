const express = require('express');
const router = express.Router();
const Agent = require('../models/agentModel'); // Sequelize model

// Route to handle form submission
router.post('/', async (req, res) => {
  const { 
    firstName, 
    lastName, 
    email, 
    phone, 
    location, 
    region, 
    hearAboutUs, 
    password, 
    confirmPassword, 
    agree 
  } = req.body;

  // Detailed validation for each field
  const errors = {};

  if (!firstName) errors.firstName = "First name is required";
  if (!lastName) errors.lastName = "Last name is required";
  if (!email) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Invalid email format";

  if (!phone) errors.phone = "Phone number is required";
  else if (!/^\+233\d{9}$/.test(phone)) errors.phone = "Phone number must start with +233 and have 9 digits";

  if (!location) errors.location = "Location is required";
  if (!region) errors.region = "Region is required";
  if (!hearAboutUs) errors.hearAboutUs = "How did you hear about us is required";

  if (!password) errors.password = "Password is required";
  else if (password.length < 6) errors.password = "Password must be at least 6 characters long";

  if (password && password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (!agree) errors.agree = "You must agree to the terms and conditions";

  // Return errors if any
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase();

    // Check if the agent already exists by email
    const existingAgent = await Agent.findOne({ where: { email: normalizedEmail } });
    if (existingAgent) {
      return res.status(400).json({ errors: { email: "Agent with this email already exists" } });
    }

    

    // Create a new agent and save to the database
    const newAgent = await Agent.create({
      firstName,
      lastName,
      email: normalizedEmail,
      phone,
      location,
      region,
      hearAboutUs,
      password, // Save the hashed password
      agree
    });

    res.status(201).json({ message: "Agent successfully registered!", newAgent });
  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).json({ error: "An internal server error occurred. Please try again later." });
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
