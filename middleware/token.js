const jwt = require("jsonwebtoken");

 const createJwtToken = (payload) => {
  const token = jwt.sign(payload, process.env.TOKEN_KEY, { expiresIn: "1day" });
  return token;
};

const verifyAgentToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    if (!decoded.id) {
      throw new Error('Agent ID not found in token');
    }
    return decoded.id;
  } catch (error) {
    throw error; 
  }
};

module.exports={createJwtToken,verifyAgentToken};