const express = require('express');
const router = express.Router();
const PreOrder = require('../models/preOrderModel'); // Sequelize model
const Agent = require('../models/agentModel');
const authenticateAgent = require('../middleware/Auth');

router.post("/pre-order", async (req, res) => {
  const {
    fullName,
    email,
    phoneNumber,
    location,
    homeType,
    gpsAddress,
    installationDate,
    agentName,
    package // The package object contains title, monthlyPrice, and yearlyPrice
  } = req.body;

  // Initialize an errors object to collect validation errors
  const errors = {};

  // Validate the data
  if (!fullName) errors.fullName = "Full name is required";
  if (!email) errors.email = "Email is required";
  if (!phoneNumber) errors.phoneNumber = "Phone number is required";
  else if (!/^\+233\d{9}$/.test(phoneNumber)) {
    errors.phoneNumber = "Phone number must start with +233 and have 9 digits";
  }
  if (!location) errors.location = "Location is required";
  if (!homeType) errors.homeType = "Home type is required";
  if (!gpsAddress) errors.gpsAddress = "GPS address is required";
  if (!installationDate) errors.installationDate = "Installation date is required";
  if (!agentName) errors.agentName = "Agent name is required";
  if (!package) errors.package = "Package is required";
  
  // If there are validation errors, return them in the response
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  // Custom validation for price (either monthlyPrice or yearlyPrice should be provided, but not both)
  if ((package.monthlyPrice && package.yearlyPrice) || (!package.monthlyPrice && !package.yearlyPrice)) {
    return res.status(400).json({
      message: "Either monthlyPrice or yearlyPrice must be provided, but not both.",
    });
  }

  try {
    // Check if the order already exists by email
    const existingOrder = await PreOrder.findOne({ where: { email } });
    if (existingOrder) {
      return res.status(400).json({ message: `Order with ${email} already exists` });
    }

    // Find the agent by name
    const agent = await Agent.findOne({ where: { firstName: agentName.split(" ")[0], lastName: agentName.split(" ")[1] } });

    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    // Create a new PreOrder record using Sequelize
    const newPreOrder = await PreOrder.create({
      fullName,
      email,
      phoneNumber,
      location,
      homeType,
      gpsAddress,
      installationDate,
      package,
      agentId: agent.id, // Save the agentId, not agentName
    });

    // Send a success response
    res.status(201).json({ message: "Pre-order submitted successfully", preOrder: newPreOrder });
  } catch (error) {
    console.error("Error submitting pre-order:", error);
    res.status(500).json({ message: "There was an error submitting the pre-order. Please try again." });
  }
});



//Get all preOrder pertaining to a particular agent
router.get("/preorders", authenticateAgent, async (req, res) => {
  try {
    const agentId = req.agent.id; // Extract agent ID from the authenticated request

    // Fetch all pre-orders associated with the logged-in agent, including agent details
    const preOrders = await PreOrder.findAll({
      where: { agentId },
      include: {
        model: Agent, // Include the Agent model to retrieve the agent's details
        as: 'agent',
        attributes: ['firstName', 'lastName'], // Only fetch the agent's firstName and lastName
      },
    });

    // Remove agentId from the preOrder object before sending the response
    const preOrdersWithAgentDetails = preOrders.map(preOrder => {
      const preOrderData = preOrder.toJSON(); // Convert Sequelize object to plain object
      delete preOrderData.agentId; // Remove the agentId field
      delete preOrderData.agent;
      delete preOrderData.id;
      delete preOrderData.createdAt;
      delete preOrderData.updatedAt;
      return preOrderData;
    });

    res.status(200).json({
      message: `Pre-orders associated with agent ${req.agent.firstName} ${req.agent.lastName}`, // Use first and last name
      preOrders: preOrdersWithAgentDetails, // Return pre-orders without agentId
    });
  } catch (error) {
    console.error("Error fetching pre-orders:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});



module.exports = router;
