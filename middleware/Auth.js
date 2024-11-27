const jwt = require("jsonwebtoken");
const Agent = require("../models/agentModel");

const authenticateAgent = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from the Authorization header

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);

    // Find the agent by ID
    const agent = await Agent.findByPk(decoded.id);
    if (!agent) {
      return res.status(401).json({ error: "Agent not found. Unauthorized." });
    }

    // Attach agent details to the request object for further use
    req.agent = agent;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token." });
  }
};

module.exports = authenticateAgent;
