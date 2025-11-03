import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true,
      index: true, // fast lookups by program
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // many lookups by student
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true, // optional but helps for filtering parent info
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
      index: true, // helps for filtering active enrollments
    },
    paymentId: {
      type: String,
      trim: true,
      index: true, // often used in reconciliation
      validate: {
        validator: (v) => /^[a-zA-Z0-9_\-]+$/.test(v),
        message: "Invalid payment ID format",
      },
    },
  },
  {
    timestamps: true, // auto adds createdAt, updatedAt
  }
);

// 🔍 Compound indexes for efficient querying
// Helps when filtering by program + status (like listing active enrollments in a program)
enrollmentSchema.index({ programId: 1, status: 1 });

// Helps in retrieving all enrollments for a specific student
enrollmentSchema.index({ studentId: 1, status: 1 });

// 🧹 Data sanitization middleware
enrollmentSchema.pre("save", function (next) {
  if (this.paymentId) this.paymentId = this.paymentId.trim();
  next();
});

// 🔒 Optional: Prevent duplicate enrollment for same student in same program
enrollmentSchema.index({ programId: 1, studentId: 1 }, { unique: true });

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;
