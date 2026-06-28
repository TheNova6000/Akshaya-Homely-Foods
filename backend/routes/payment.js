const express = require('express');
const router = express.Router();
const prisma = require('../db');

router.post('/create-order', async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({ error: 'Amount and Order ID are required' });
    }

    return res.json({
      razorpayOrderId: `dummy_${orderId}_${Date.now()}`,
      amount: Math.round(parseFloat(amount) * 100),
      currency: 'INR',
      keyId: 'dummy_key',
      mode: 'dummy'
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    return res.status(500).json({ error: 'Failed to create payment order' });
  }
});

router.patch('/order/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid Order ID format' });
    }

    if (!payment_status) {
      return res.status(400).json({ error: 'payment_status is required' });
    }

    const validStatuses = ['Pending', 'Paid', 'Failed'];
    if (!validStatuses.includes(payment_status)) {
      return res.status(400).json({ error: `Invalid payment status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { payment_status }
    });

    return res.json({
      message: `Payment status successfully updated to ${payment_status}`,
      orderId: updatedOrder.id,
      payment_status: updatedOrder.payment_status
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
