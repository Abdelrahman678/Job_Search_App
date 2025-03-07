import { nanoid } from "nanoid";
import {
  Application,
  Company,
  JobOpportunity,
  User,
} from "../../../DB/models/index.models.js";
import { cloudinary } from "../../../Config/cloudinary.config.js";
import { statusEnum, systemRoles } from "../../../Constants/constants.js";
import { emailEventEmitter } from "../../../Services/send-email.service.js";
import { socketConnection } from "../../../utils/socket.utils.js";

/* === addJobService === */
export const addJobService = async (req, res) => {
  /* get user data from request */
  const { _id } = req.loggedInUser;
  /* get company data from request */
  const {
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
    companyId,
  } = req.body;
  /* check if company exists */
  const company = await Company.findById(companyId);
  if (!company) {
    return res.status(404).json({ message: "Company not found" });
  }
  /* check if user is authorized to add job */
  if (
    !company.HRs.includes(_id) &&
    company.createdBy.toString() !== _id.toString()
  ) {
    return res.status(403).json({ message: "Not authorized to add job" });
  }
  /* check if job already exists */
  const existingJob = await JobOpportunity.findOne({ jobTitle, companyId });
  if (existingJob) {
    return res.status(400).json({ message: "Job already exists" });
  }

  const job = new JobOpportunity({
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
    companyId,
    addedBy: _id,
  });
  await job.save();
  return res.status(201).json({ message: "Job added successfully", job });
};

/* === updateJobService === */
export const updateJobService = async (req, res) => {
  /* get user data from request */
  const { _id } = req.loggedInUser;
  /* get job data from request */
  const { id } = req.params;
  /* get company data from request */
  const {
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
  } = req.body;
  /* check if job exists */
  const job = await JobOpportunity.findById(id);
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }
  /* check if the one added the job want to update it */
  if (job.addedBy.toString() !== _id.toString()) {
    return res.status(403).json({
      message: "Not authorized only the one who added the job can update it",
    });
  }
  /* update job */
  if (jobTitle) job.jobTitle = jobTitle;
  if (jobLocation) job.jobLocation = jobLocation;
  if (workingTime) job.workingTime = workingTime;
  if (seniorityLevel) job.seniorityLevel = seniorityLevel;
  if (jobDescription) job.jobDescription = jobDescription;
  if (technicalSkills) job.technicalSkills = technicalSkills;
  if (softSkills) job.softSkills = softSkills;
  await job.save();
  /* return the updated job */
  return res.status(200).json({ message: "Job updated successfully", job });
};

/* === deleteJobService === */
export const deleteJobService = async (req, res) => {
  /* get user data from request */
  const { _id } = req.loggedInUser;
  /* get job data from request */
  const { id } = req.params;
  /* check if job exists */
  const job = await JobOpportunity.findById(id);
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }
  /* get company data from request */
  const company = await Company.findById(job.companyId);
  /* check if the user is in HRs of the Company */
  if (!company.HRs.includes(_id)) {
    return res.status(403).json({ message: "Not authorized to delete job" });
  }
  /* delete job */
  await JobOpportunity.findByIdAndDelete(id);
  /* return success message */
  return res.status(200).json({ message: "Job deleted successfully" });
};

/* === getJobsService === */
export const getJobsService = async (req, res) => {
  let { page, limit } = req.query;
  if (!page || page < 1) page = 1;
  if (!limit || limit < 1) limit = 3;
  const skip = (page - 1) * limit;

  const { jobId } = req.params;
  const { companyName } = req.query;

  if (jobId) {
    /* check if job exists */
    const job = await JobOpportunity.findById(jobId).populate({
      path: "company",
      select: "companyName",
    });
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    return res.status(200).json({ job });
  }
  if (companyName) {
    /* check if company exists */
    const company = await Company.findOne({ companyName });
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    /* get jobs by company */
    const jobs = await JobOpportunity.find({ companyId: company._id })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate({
        path: "company",
        select: "companyName",
      });
    /* get total count of jobs */
    const totalJobs = await JobOpportunity.countDocuments({
      companyId: company._id,
    });
    if (!jobs.length) {
      return res.status(404).json({ message: "No jobs found" });
    }
    return res.status(200).json({ total: totalJobs, jobs });
  }
  return res.status(400).json({ message: "Invalid request" });
};

/* === getFilteredJobsService === */
export const getFilteredJobsService = async (req, res) => {
  let { page, limit } = req.query;
  if (!page || page < 1) page = 1;
  if (!limit || limit < 1) limit = 3;
  const skip = (page - 1) * limit;

  // Extract filter parameters from the request body or query
  const {
    workingTime,
    jobLocation,
    seniorityLevel,
    jobTitle,
    technicalSkills,
  } = req.query;

  /* create query object */
  let query = {};

  /* apply filters to the query */
  if (workingTime) {
    query.workingTime = workingTime;
  }
  if (jobLocation) {
    query.jobLocation = jobLocation;
  }
  if (seniorityLevel) {
    query.seniorityLevel = seniorityLevel;
  }
  if (jobTitle) {
    query.jobTitle = jobTitle;
  }
  if (technicalSkills) {
    query.technicalSkills = technicalSkills;
  }

  /* fetch jobs */
  const jobs = await JobOpportunity.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  /* get total count of jobs */
  const totalCount = await JobOpportunity.countDocuments(query);
  if (!jobs.length) {
    return res.status(404).json({ message: "No jobs found" });
  }

  return res.status(200).json({ totalCount, jobs });
};

/* === Get all applications for specific Job === */
export const getAllApplicationsForJobService = async (req, res) => {
  /* get user id from request */
  const { _id } = req.loggedInUser;
  let { page, limit } = req.query;
  if (!page || page < 1) page = 1;
  if (!limit || limit < 1) limit = 3;
  const skip = (page - 1) * limit;
  /* get job id from request */
  const { jobId } = req.params;

  const jobOpportunity = await JobOpportunity.findById(jobId);
  if (!jobOpportunity) {
    return res.status(404).json({ message: "Job not found" });
  }
  const company = await Company.findById(jobOpportunity.companyId);
  if (!company) {
    return res.status(404).json({ message: "Company not found" });
  }
  if (
    !company.HRs.includes(_id) &&
    company.createdBy.toString() !== _id.toString()
  ) {
    return res
      .status(403)
      .json({ message: "Not authorized to view applications" });
  }
  /* get applications */
  const applications = await Application.find({ jobId: jobId })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate({
      path: "userId",
      select: "firstName lastName email",
    })
    .populate({
      path: "jobOpportunity",
      select: "jobTitle",
    });

  if (!applications.length) {
    return res.status(404).json({ message: "No applications found" });
  }
  const totalCount = await Application.countDocuments({ jobId: jobId });
  return res.status(200).json({ totalCount, applications });
};

/* === applyToJobService === */
export const applyToJobService = async (req, res) => {
  /* get job id from request */
  const { jobId } = req.params;
  /* get user id from request */
  const { _id } = req.loggedInUser;
  /* get file from request */
  const { file } = req;
  /* check if file is uploaded */
  if (!file) {
    return res.status(400).json({
      message: "No file uploaded",
    });
  }
  /* check if user role is user 'already checked with authorizationMiddleware' */
  if (req.loggedInUser.role !== systemRoles.USER) {
    return res.status(403).json({ message: "Not authorized" });
  }
  /* checkk if user already applied to this job */
  const existingApplication = await Application.findOne({
    jobId: jobId,
    userId: _id,
  });
  if (existingApplication) {
    return res
      .status(400)
      .json({ message: "You have already applied to this job" });
  }
  /* get job data from request */
  const job = await JobOpportunity.findById(jobId);
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }
  /* generate a random id for the folder */
  const folderId = nanoid(4);
  /* upload file to cloudinary */
  const { secure_url, public_id } = await cloudinary().uploader.upload(
    file.path,
    {
      folder: `${process.env.CLOUDINARY_FOLDER}/Job/Application/${job.companyId}/${job.jobTitle}/${folderId}`,
    }
  );
  /* create application */
  const application = new Application({
    jobId: jobId,
    userId: _id,
    userCV: {
      secure_url,
      public_id,
      folderId,
    },
  });
  await application.save();

  /*
   *=== Emit socket event to notify HR ===
   *=== commented as couldn't test ===
   */

  /*   const company = await Company.findById(job.companyId);
  if (company && company.HRs) {
    company.HRs.forEach(hrId => {
      const hrSocket = socketConnection.get(hrId.toString());
      if (hrSocket) {
        hrSocket.emit("newApplication", {
          message: "A new application has been submitted.",
          application,
        });
      }
    });
  } */

  /* return success message */
  return res.status(201).json({ message: "Application sent successfully" });
};

/* === acceptOrRejectApplicationService === */
export const acceptOrRejectApplicationService = async (req, res) => {
  /* get application id from request */
  const { id } = req.params;
  /* get user id from request */
  const { _id } = req.loggedInUser;
  /* get status from request */
  const { status } = req.body;
  /* get application data from request */
  const application = await Application.findById(id);
  if (!application) {
    return res.status(404).json({ message: "Application not found" });
  }
  /* get job data from request */
  const job = await JobOpportunity.findById(application.jobId);
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }
  if (job.closed) {
    return res.status(400).json({ message: "Job is closed" });
  }
  /* check if the user is in HRs of the Company */
  const company = await Company.findById(job.companyId);
  if (!company.HRs.includes(_id)) {
    return res.status(403).json({ message: "Not authorized" });
  }
  /* check if status is valid */
  if (
    status &&
    (status === statusEnum.ACCEPTED || status === statusEnum.REJECTED)
  ) {
    /* update application status */
    application.status = status;
    await application.save();
    /* get user data from request */
    const user = await User.findById(application.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    /* check if status Accepted or Rejected to send email */
    if (status === statusEnum.ACCEPTED) {
      /* send email to user */
      emailEventEmitter.emit("SendEmail", {
        subject: "Job Application Accepted",
        html: `
          <div style=" height: 100vh; background-color: #f2f2f2; font-family: Arial, sans-serif; line-height: 1.5; text-align: center;">
              <h1 style="color: #4CAF50;">Job Application Accepted</h1>
              <p>Hello,</p>
              <p>Your application for the job ${job.jobTitle} has been accepted.</p>
              <p>Congratulations!</p>
              <p>Best regards,<br>The Job Search App Team</p>
          </div>
          `,
        to: user.email,
      });
      /* return success message */
      return res
        .status(200)
        .json({ message: "Application status Accepted successfully" });
    } else if (status === statusEnum.REJECTED) {
      /* send email to user */
      emailEventEmitter.emit("SendEmail", {
        subject: "Job Application Rejected",
        html: `
          <div style="height: 100vh; background-color: #f2f2f2; font-family: Arial, sans-serif; line-height: 1.5; text-align: center;">
              <h1 style="color: red;">Job Application Rejected</h1>
              <p>Hello, we are sorry to inform you that</p>
              <p>Your application for the job ${job.jobTitle} has been rejected.</p>
              <p>Thank you for your consideration.</p>
              <p>Best regards,<br>The Job Search App Team</p>
          </div>
          `,
        to: user.email,
      });
      /* return success message */
      return res
        .status(200)
        .json({ message: "Application status Rejected successfully" });
    }
  }
  /* return error message */
  return res.status(400).json({ message: "Invalid status" });
};
