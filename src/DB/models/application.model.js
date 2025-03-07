import mongoose from "mongoose";
import { statusEnum } from "../../Constants/constants.js";
const { Schema } = mongoose;

const applicationSchema = new Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "JobOpportunity",
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userCV: {
      secure_url: String,
      public_id: String,
      folderId: String,
    },
    status: {
      type: String,
      enum: Object.values(statusEnum),
      default: statusEnum.PENDING,
    },
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
applicationSchema.virtual("jobOpportunity", {
  ref: "JobOpportunity",
  localField: "jobId",
  foreignField: "_id",
});

export const Application =
  mongoose.models.Application ||
  mongoose.model("Application", applicationSchema);
