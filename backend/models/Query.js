const mongoose = require('mongoose');

const querySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['UNASSIGNED', 'REQUESTED', 'ASSIGNED', 'RESOLVED', 'DISMANTLED'],
        message: 'Status must be UNASSIGNED, REQUESTED, ASSIGNED, RESOLVED, or DISMANTLED',
      },
      default: 'UNASSIGNED',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    answer: {
      type: String,
      default: null,
      maxlength: [2000, 'Answer cannot exceed 2000 characters'],
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    dismantledReason: {
      type: String,
      default: null,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
querySchema.index({ status: 1, createdBy: 1 });
querySchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Query', querySchema);
