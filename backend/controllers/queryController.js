const Query = require('../models/Query');
const User = require('../models/User');
const { sendQueryAnswerEmail, sendQueryDismantledEmail } = require('../utils/emailService');

// @desc    Create a new query
// @route   POST /api/queries
// @access  Private (Participant)
exports.createQuery = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and description',
      });
    }

    const query = await Query.create({
      title,
      description,
      createdBy: req.user.id,
      status: 'UNASSIGNED',
    });

    await query.populate('createdBy', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Query created successfully',
      data: { query },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating query',
      error: error.message,
    });
  }
};

// @desc    Get all queries (filtered by role)
// @route   GET /api/queries
// @access  Private
exports.getQueries = async (req, res) => {
  try {
    // All users see all queries now
    const queries = await Query.find({})
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('resolvedBy', 'name email role')
      .populate('requestedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: queries.length,
      data: { queries },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching queries',
      error: error.message,
    });
  }
};

// @desc    Get single query by ID
// @route   GET /api/queries/:id
// @access  Private
exports.getQueryById = async (req, res) => {
  try {
    const query = await Query.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('resolvedBy', 'name email role');

    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found',
      });
    }

    // Check authorization based on role
    if (req.user.role === 'Participant') {
      // Participants can only view their own queries
      if (query.createdBy._id.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this query',
        });
      }
    }
    // Team Heads and Admin can view all queries

    res.status(200).json({
      success: true,
      data: { query },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching query',
      error: error.message,
    });
  }
};

// @desc    Request query assignment (Team Head requests to be assigned)
// @route   PATCH /api/queries/:id/request
// @access  Private (Team_Head)
exports.requestQuery = async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);

    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found',
      });
    }

    // Check if query is unassigned
    if (query.status !== 'UNASSIGNED' && query.status !== 'REQUESTED') {
      return res.status(400).json({
        success: false,
        message: 'Query is already assigned or resolved',
      });
    }

    // Auto-assign to the requesting Team Head
    query.assignedTo = req.user.id;
    query.status = 'ASSIGNED';
    await query.save();

    await query.populate('createdBy', 'name email role');
    await query.populate('assignedTo', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Query assigned to you successfully',
      data: { query },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error requesting query',
      error: error.message,
    });
  }
};

// @desc    Assign query to Team Head
// @route   PATCH /api/queries/:id/assign
// @access  Private (Admin only)
exports.assignQuery = async (req, res) => {
  try {
    const { teamHeadId } = req.body;

    if (!teamHeadId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide teamHeadId',
      });
    }

    // Verify the team head exists and has the correct role
    const teamHead = await User.findById(teamHeadId);
    if (!teamHead) {
      return res.status(404).json({
        success: false,
        message: 'Team Head not found',
      });
    }

    if (teamHead.role !== 'Team_Head') {
      return res.status(400).json({
        success: false,
        message: 'User is not a Team Head',
      });
    }

    // Find the query
    const query = await Query.findById(req.params.id);
    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found',
      });
    }

    // Check if query is in UNASSIGNED or REQUESTED state
    if (query.status !== 'UNASSIGNED' && query.status !== 'REQUESTED') {
      return res.status(400).json({
        success: false,
        message: `Cannot assign query with status ${query.status}. Only UNASSIGNED or REQUESTED queries can be assigned.`,
      });
    }

    // Update query
    query.assignedTo = teamHeadId;
    query.status = 'ASSIGNED';
    await query.save();

    await query.populate('createdBy', 'name email role');
    await query.populate('assignedTo', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Query assigned successfully',
      data: { query },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning query',
      error: error.message,
    });
  }
};

// @desc    Answer query (Resolve)
// @route   PATCH /api/queries/:id/answer
// @access  Private (Team Head assigned OR Admin)
exports.answerQuery = async (req, res) => {
  try {
    const { answer } = req.body;

    if (!answer) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an answer',
      });
    }

    // Find the query
    const query = await Query.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('resolvedBy', 'name email role');

    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found',
      });
    }

    // Check authorization - Admin can resolve any assigned query, Team Head only their own
    if (req.user.role !== 'Admin') {
      if (!query.assignedTo || query.assignedTo._id.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized. Query is not assigned to you.',
        });
      }
    }

    // Check if query is in ASSIGNED state
    if (query.status !== 'ASSIGNED') {
      return res.status(400).json({
        success: false,
        message: `Cannot answer query with status ${query.status}. Only ASSIGNED queries can be answered.`,
      });
    }

    // Update query with resolver info
    query.answer = answer;
    query.status = 'RESOLVED';
    query.resolvedBy = req.user.id;
    await query.save();

    // Send email notification to the participant
    try {
      await sendQueryAnswerEmail(query);
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
      // Continue even if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Query answered successfully',
      data: { query },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error answering query',
      error: error.message,
    });
  }
};

// @desc    Dismantle query (Delete/Reject)
// @route   PATCH /api/queries/:id/dismantle
// @access  Private (Admin or assigned Team Head)
exports.dismantleQuery = async (req, res) => {
  try {
    const { reason } = req.body;

    // Reason is required
    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reason for dismantling this query',
      });
    }

    // Find the query
    const query = await Query.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role');

    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found',
      });
    }

    // Authorization check - Admin can dismantle any, Team Head only their assigned
    let authorized = false;

    if (req.user.role === 'Admin') {
      authorized = true;
    } else if (req.user.role === 'Team_Head') {
      // Team Head can only dismantle queries assigned to them
      if (query.assignedTo && query.assignedTo._id.toString() === req.user.id) {
        authorized = true;
      }
    }

    if (!authorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to dismantle this query',
      });
    }

    // Check if query is already dismantled or resolved
    if (query.status === 'DISMANTLED') {
      return res.status(400).json({
        success: false,
        message: 'Query is already dismantled',
      });
    }

    if (query.status === 'RESOLVED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot dismantle a resolved query',
      });
    }

    // Update query
    query.status = 'DISMANTLED';
    query.dismantledReason = reason;
    await query.save();

    // Send email notification to the participant
    try {
      await sendQueryDismantledEmail(query, req.user);
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
      // Continue even if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Query dismantled successfully',
      data: { query },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error dismantling query',
      error: error.message,
    });
  }
};

// @desc    Reassign query (Admin only)
// @route   PATCH /api/queries/:id/reassign
// @access  Private (Admin only)
exports.reassignQuery = async (req, res) => {
  try {
    const { teamHeadId } = req.body;

    if (!teamHeadId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide teamHeadId',
      });
    }

    // Verify the team head exists and has the correct role
    const teamHead = await User.findById(teamHeadId);
    if (!teamHead) {
      return res.status(404).json({
        success: false,
        message: 'Team Head not found',
      });
    }

    if (teamHead.role !== 'Team_Head') {
      return res.status(400).json({
        success: false,
        message: 'User is not a Team Head',
      });
    }

    // Find the query
    const query = await Query.findById(req.params.id);
    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found',
      });
    }

    // Can only reassign ASSIGNED queries
    if (query.status !== 'ASSIGNED') {
      return res.status(400).json({
        success: false,
        message: `Cannot reassign query with status ${query.status}. Only ASSIGNED queries can be reassigned.`,
      });
    }

    // Update query with new assignment
    query.assignedTo = teamHeadId;
    await query.save();

    await query.populate('createdBy', 'name email role');
    await query.populate('assignedTo', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Query reassigned successfully',
      data: { query },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error reassigning query',
      error: error.message,
    });
  }
};
