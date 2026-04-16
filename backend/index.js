require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Main Router Module Hook
app.use('/api', apiRoutes);

// Start Server
app.listen(port, () => {
  console.log(`FINSIM Hybrid MVC Backend listening on port ${port}`);
});
