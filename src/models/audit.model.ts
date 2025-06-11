// audit.model.ts
import mongoose, { Document } from "mongoose";

export interface IAuditLog extends Document {
  action: string;
  actor: mongoose.Types.ObjectId;
  module: string;
  target?: string;
  description?: string;
  timestamp: Date;
}

const auditLogSchema = new mongoose.Schema<IAuditLog>(
  {
    action: { type: String, required: true },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    module: { type: String, required: true },
    target: { type: String },
    description: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export default mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
