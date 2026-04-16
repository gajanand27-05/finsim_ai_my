const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

router.get('/health', apiController.healthCheck);
router.get('/transactions', apiController.getTransactions);
router.get('/budgets', apiController.getBudgets);

// Core Hybrid API Routes
router.post('/load-demo-sms', apiController.loadDemoSms);
router.get('/dashboard', apiController.getDashboard);
router.post('/ask-ai', apiController.askAi);

module.exports = router;
