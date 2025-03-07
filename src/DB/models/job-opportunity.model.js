import mongoose from "mongoose";
import {
  jobLocationEnum,
  seniorityLevelEnum,
  workTimeEnum,
} from "../../Constants/constants.js";
const { Schema } = mongoose;

const jobOpportunitySchema = new Schema(
  {
    jobTitle: { type: String, required: true },
    jobLocation: {
      type: String,
      enum: Object.values(jobLocationEnum),
      required: true,
    },
    workingTime: {
      type: String,
      enum: Object.values(workTimeEnum),
      required: true,
    },
    seniorityLevel: {
      type: String,
      enum: Object.values(seniorityLevelEnum),
      required: true,
    },
    jobDescription: { type: String, required: true },
    technicalSkills: { type: [String], required: true },
    softSkills: { type: [String], required: true },
    addedBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    closed: { type: Boolean, default: false },
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

jobOpportunitySchema.virtual("company", {
  ref: "Company",
  localField: "companyId",
  foreignField: "_id",
});

export const JobOpportunity =
  mongoose.models.JobOpportunity ||
  mongoose.model("JobOpportunity", jobOpportunitySchema);
