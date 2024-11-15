const express = require('express');
const router = express.Router();
const PreOrder = require('../models/preOrderModel'); // Sequelize model

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

  // Validate the data
  if (!fullName || !email || !phoneNumber || !location || !homeType || !gpsAddress || !installationDate || !agentName || !package) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Custom validation for price (either monthlyPrice or yearlyPrice should be provided, but not both)
  if ((package.monthlyPrice && package.yearlyPrice) || (!package.monthlyPrice && !package.yearlyPrice)) {
    return res.status(400).json({ message: "Either monthlyPrice or yearlyPrice must be provided, but not both." });
  }

  try {
    // Check if the order already exists by email
    const existingOrder = await PreOrder.findOne({ where: { email } });
    if (existingOrder) {
      return res.status(400).json({ message: `Order with ${email} already exists` });
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
      agentName,
      package // Pass the entire package object
    });

    // Send a success response
    res.status(201).json({ message: "Pre-order submitted successfully", preOrder: newPreOrder });
  } catch (error) {
    console.error("Error submitting pre-order:", error);
    res.status(500).json({ message: "There was an error submitting the pre-order. Please try again." });
  }
});


module.exports = router;
