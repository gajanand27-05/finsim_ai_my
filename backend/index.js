require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

const app = express();
const port = process.env.PORT || 5000;

// Supabase and OpenAI config
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'placeholder-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-key',
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes Placeholder
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running' });
});

// Start Server
app.listen(port, () => {
  console.log(`FINSIM Backend listening on port ${port}`);
});
