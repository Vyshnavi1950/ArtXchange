import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Report", ReportSchema);
