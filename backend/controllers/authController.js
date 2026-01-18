const User = require('../models/User');
const { sendOTPEmail, verifyOTP } = require('../utils/emailService');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Only allow Participant role during public registration
    if (role && role !== 'Participant') {
      return res.status(400).json({
        success: false,
        message: 'Only Participant role is allowed for public registration. Admins and Team Heads are added by administrators.',
      });
    }

    // Create user (unverified)
    const user = await User.create({
      name,
      email,
      password,
      role: 'Participant',
      isVerified: false,
    });

    // Send OTP email
    try {
      await sendOTPEmail(email, name);
      console.log('OTP email sent to:', email);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError.message);
      // Delete user if email fails
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for OTP verification.',
      data: {
        email: user.email,
        requiresVerification: true,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error registering user',
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check for user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if user is verified (backward compatible - if isVerified is undefined, treat as verified)
    if (user.isVerified === false) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first. Check your inbox for the OTP.',
      });
    }

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP',
      });
    }

    const result = verifyOTP(email, otp);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    // Find user and mark as verified
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isVerified = true;
    await user.save();

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message,
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message,
    });
  }
};

// @desc    Get all Team Heads with their assigned query counts
// @route   GET /api/auth/team-heads
// @access  Private (Admin only)
exports.getTeamHeads = async (req, res) => {
  try {
    const Query = require('../models/Query');
    
    // Get all Team Heads
    const teamHeads = await User.find({ role: 'Team_Head' }).select('_id name email');

    // Get assigned unanswered query counts for each Team Head
    const teamHeadsWithCounts = await Promise.all(
      teamHeads.map(async (head) => {
        const assignedCount = await Query.countDocuments({
          assignedTo: head._id,
          status: 'ASSIGNED', // Only count unanswered queries
        });

        return {
          _id: head._id,
          name: head.name,
          email: head.email,
          assignedUnansweredCount: assignedCount,
        };
      })
    );

    // Sort by assigned count (ascending) so least busy Team Heads appear first
    teamHeadsWithCounts.sort((a, b) => a.assignedUnansweredCount - b.assignedUnansweredCount);

    res.status(200).json({
      success: true,
      count: teamHeadsWithCounts.length,
      data: { teamHeads: teamHeadsWithCounts },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching team heads',
      error: error.message,
    });
  }
};

// @desc    Get Team Head statistics for admin dashboard
// @route   GET /api/auth/team-heads/stats
// @access  Private (Admin only)
exports.getTeamHeadStats = async (req, res) => {
  try {
    const Query = require('../models/Query');
    
    // Get all Team Heads
    const teamHeads = await User.find({ role: 'Team_Head' }).select('_id name email');

    // Calculate statistics for each Team Head
    const teamHeadsStats = await Promise.all(
      teamHeads.map(async (head) => {
        // Total queries assigned
        const totalAssigned = await Query.countDocuments({
          assignedTo: head._id,
        });

        // Total queries resolved
        const totalResolved = await Query.countDocuments({
          assignedTo: head._id,
          status: 'RESOLVED',
        });

        // Currently active (assigned but not resolved)
        const activeQueries = await Query.countDocuments({
          assignedTo: head._id,
          status: 'ASSIGNED',
        });

        // Get resolved queries to calculate average time
        const resolvedQueries = await Query.find({
          assignedTo: head._id,
          status: 'RESOLVED',
        }).select('createdAt updatedAt');

        // Calculate average resolution time (in hours)
        let avgResolutionTime = 0;
        if (resolvedQueries.length > 0) {
          const totalTime = resolvedQueries.reduce((sum, query) => {
            const timeToResolve = (new Date(query.updatedAt) - new Date(query.createdAt)) / (1000 * 60 * 60); // in hours
            return sum + timeToResolve;
          }, 0);
          avgResolutionTime = totalTime / resolvedQueries.length;
        }

        // Resolution rate percentage
        const resolutionRate = totalAssigned > 0 ? ((totalResolved / totalAssigned) * 100).toFixed(1) : 0;

        return {
          _id: head._id,
          name: head.name,
          email: head.email,
          totalAssigned,
          totalResolved,
          activeQueries,
          avgResolutionTime: avgResolutionTime.toFixed(1),
          resolutionRate: parseFloat(resolutionRate),
        };
      })
    );

    // Sort by total resolved (descending)
    teamHeadsStats.sort((a, b) => b.totalResolved - a.totalResolved);

    res.status(200).json({
      success: true,
      count: teamHeadsStats.length,
      data: { teamHeads: teamHeadsStats },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching team head statistics',
      error: error.message,
    });
  }
};

// @desc    Create Admin or Team Head (Admin only)
// @route   POST /api/auth/users
// @access  Private (Admin only)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and role',
      });
    }

    // Only allow Admin and Team_Head roles
    if (role !== 'Admin' && role !== 'Team_Head') {
      return res.status(400).json({
        success: false,
        message: 'Only Admin and Team_Head roles can be created through this endpoint',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user (pre-verified since added by admin)
    const user = await User.create({
      name,
      email,
      password,
      role,
      isVerified: true,
    });

    res.status(201).json({
      success: true,
      message: `${role} created successfully`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating user',
      error: error.message,
    });
  }
};

// @desc    Get all Admins and Team Heads (Admin only)
// @route   GET /api/auth/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    
    let filter = {};
    if (role) {
      filter.role = role;
    } else {
      // Get only Admins and Team Heads by default
      filter.role = { $in: ['Admin', 'Team_Head'] };
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: { users },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    });
  }
};

// @desc    Delete User (Admin only - can delete Team Heads)
// @route   DELETE /api/auth/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    // Only allow deletion of Team Heads (Admins can only be deleted by other Admins, but we prevent deleting all admins)
    if (user.role !== 'Team_Head' && user.role !== 'Admin') {
      return res.status(400).json({
        success: false,
        message: 'Only Admin and Team_Head users can be deleted through this endpoint',
      });
    }

    // If trying to delete an Admin, check if there's at least one more Admin
    if (user.role === 'Admin') {
      const adminCount = await User.countDocuments({ role: 'Admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last admin user',
        });
      }
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `${user.role} deleted successfully`,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message,
    });
  }
};
