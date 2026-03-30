import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    details: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);
