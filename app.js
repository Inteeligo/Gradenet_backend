require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const syncDatabase = require("./models/index");
 
// Initialize Express app
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const corsOptions = {
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Define the port
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Define routes
app.use("/api/agents", require("./routes/agentRoute"));
app.use("/api", require("./routes/preOrderRoute"));

app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource ${req.originalUrl} was not found on this server.`,
  });
});
app.post("/api/contact", (req, res) => {
  const { name, email, phone, message } = req.body;

  // Example: send an email notification (using Nodemailer)
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465, // Use 465 for SSL/TLS or 587 for STARTTLS
    secure: true,
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: "Admin@gradenetgh.com", // Replace with the actual support team email address
    subject: "New Customer Inquiry from Website Contact Form",
    text: `
        Hello Support Team,

        A new inquiry has been submitted through the Gradenet website contact form. Below are the details provided by the customer:

        Customer Details
        - Name: ${name}
        - Email: ${email}
        - Phone: ${phone}

        Inquiry Message
        ${message}

        Please reach out to the customer at your earliest convenience to assist them with their questions about services, packages, or the pre-order process.

        Thank you,
        Gradenet Contact Form System
      `,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Email error:", err.message);
      return res.status(500).json({ message: "Error sending message" });
    }
    console.log(
      `${new Date().toLocaleString()} - Email sent successfully: ${
        info.response
      }`
    );
    return res
      .status(200)
      .json({ message: "Message sent successfully", mailOptions });
  });
});

// Synchronize the database and start the server once successful
syncDatabase()
  .then(() => {
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to sync database:", error);
    // Optionally handle the failure by shutting down the server or taking other actions.
    process.exit(1); // Exit the process with a non-zero code to indicate failure
  });
  
 


