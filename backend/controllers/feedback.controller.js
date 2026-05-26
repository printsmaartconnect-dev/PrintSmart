const prisma = require('../config/db');

/**
 * Submit feedback/support ticket
 */
exports.submitFeedback = async (req, res) => {
  try {
    const { userId, subject, message, rating } = req.body;

    if (!userId || !subject || !message) {
      return res.status(400).json({ 
        message: 'Please provide userId, subject, and message' 
      });
    }

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        userId,
        subject,
        message,
        rating: rating ? Math.min(Math.max(rating, 1), 5) : null, // 1-5 stars
        status: 'OPEN'
      }
    });

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: {
        id: feedback.id,
        subject: feedback.subject,
        status: feedback.status,
        createdAt: feedback.createdAt
      }
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ 
      message: 'Failed to submit feedback',
      error: error.message 
    });
  }
};

/**
 * Get user's feedback history
 */
exports.getUserFeedback = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, limit = 10, offset = 0 } = req.query;

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Build where clause
    const where = { userId };
    if (status) {
      where.status = status;
    }

    // Fetch feedback
    const [feedback, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      prisma.feedback.count({ where })
    ]);

    res.json({
      feedback,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: parseInt(offset) + parseInt(limit) < total
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ 
      message: 'Failed to fetch feedback',
      error: error.message 
    });
  }
};

/**
 * Get all feedback (admin only)
 */
exports.getAllFeedback = async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }

    const [feedback, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      prisma.feedback.count({ where })
    ]);

    res.json({
      feedback,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: parseInt(offset) + parseInt(limit) < total
    });
  } catch (error) {
    console.error('Error fetching all feedback:', error);
    res.status(500).json({ 
      message: 'Failed to fetch feedback',
      error: error.message 
    });
  }
};

/**
 * Update feedback status (admin only)
 */
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { status } = req.body;

    if (!status || !['OPEN', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be OPEN, IN_PROGRESS, or RESOLVED' 
      });
    }

    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId }
    });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    const updated = await prisma.feedback.update({
      where: { id: feedbackId },
      data: { status }
    });

    res.json({
      message: 'Feedback status updated',
      feedback: updated
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ 
      message: 'Failed to update feedback',
      error: error.message 
    });
  }
};

/**
 * Delete feedback (admin only)
 */
exports.deleteFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;

    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId }
    });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    await prisma.feedback.delete({
      where: { id: feedbackId }
    });

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ 
      message: 'Failed to delete feedback',
      error: error.message 
    });
  }
};
