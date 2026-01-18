const express = require('express');
const router = express.Router();
const {
  createQuery,
  getQueries,
  getQueryById,
  assignQuery,
  answerQuery,
  dismantleQuery,
  requestQuery,
  reassignQuery,
} = require('../controllers/queryController');
const { protect } = require('../middlewares/auth');
const { roleCheck } = require('../middlewares/roleCheck');

// All routes require authentication
router.use(protect);

// Create query - Only Participants can create
router.post('/', roleCheck('Participant'), createQuery);

// Get all queries - Role-based filtering applied in controller
router.get('/', getQueries);

// Get single query by ID
router.get('/:id', getQueryById);

// Assign query - Only Admin
router.patch('/:id/assign', roleCheck('Admin'), assignQuery);

// Reassign query - Only Admin
router.patch('/:id/reassign', roleCheck('Admin'), reassignQuery);

// Request query assignment - Only Team Head
router.patch('/:id/request', roleCheck('Team_Head'), requestQuery);

// Answer query - Team Head (assigned) or Admin
router.patch('/:id/answer', roleCheck('Team_Head', 'Admin'), answerQuery);

// Dismantle query - Admin or Team Head (assigned)
router.patch('/:id/dismantle', roleCheck('Admin', 'Team_Head'), dismantleQuery);

module.exports = router;
