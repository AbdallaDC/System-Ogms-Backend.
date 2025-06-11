// logAudit.util.ts
import AuditLog from "../models/audit.model";
import mongoose from "mongoose";

interface LogAuditInput {
  action: string;
  actor: mongoose.Types.ObjectId;
  module: string;
  target?: string;
  description?: string;
}

export const logAudit = async ({
  action,
  actor,
  module,
  target,
  description,
}: LogAuditInput) => {
  try {
    await AuditLog.create({
      action,
      actor,
      module,
      target,
      description,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Audit log failed:", error);
  }
};
