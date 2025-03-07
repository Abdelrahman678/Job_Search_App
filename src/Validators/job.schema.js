import Joi from "joi";

/* add job schema */
const addJobSchema = {
  body: Joi.object({
    jobTitle: Joi.string().required().messages({
      "any.required": "Job Title is required",
      "string.base": "Job Title must be a string",
    }),
    jobLocation: Joi.string().required().messages({
      "any.required": "Job Location is required",
      "string.base": "Job Location must be a string",
    }),
    workingTime: Joi.string()
      .required()
      .valid("full-time", "part-time")
      .messages({
        "any.required": "Working Time is required",
        "string.base": "Working Time must be a string",
        "any.valid": "Working Time must be full-time or part-time",
      }),
    seniorityLevel: Joi.string()
      .required()
      .valid("fresh", "junior", "mid-level", "senior", "team-lead", "cto")
      .messages({
        "any.required": "Seniority Level is required",
        "string.base": "Seniority Level must be a string",
        "any.valid":
          "Seniority Level must be fresh, junior, mid-level, senior, team-lead, cto",
      }),
    jobDescription: Joi.string().required().messages({
      "any.required": "Job Description is required",
      "string.base": "Job Description must be a string",
    }),
    technicalSkills: Joi.array().items(Joi.string()).required().messages({
      "any.required": "Technical Skills is required",
      "string.base": "Technical Skills must be a string",
    }),
    softSkills: Joi.array().items(Joi.string()).required().messages({
      "any.required": "Soft Skills is required",
      "string.base": "Soft Skills must be a string",
    }),
    companyId: Joi.string().hex().required().messages({
      "any.required": "Company ID is required",
      "string.base": "Company ID must be a string",
      "string.hex": "Company ID must be a hex string",
    }),
  }),
};
/* update job schema */
const updateJobSchema = {
  body: Joi.object({
    jobTitle: Joi.string().messages({
      "string.base": "Job Title must be a string",
    }),
    jobLocation: Joi.string().messages({
      "string.base": "Job Location must be a string",
    }),
    workingTime: Joi.string().valid("full-time", "part-time").messages({
      "string.base": "Working Time must be a string",
      "any.valid": "Working Time must be full-time or part-time",
    }),
    seniorityLevel: Joi.string()
      .valid("fresh", "junior", "mid-level", "senior", "team-lead", "cto")
      .messages({
        "string.base": "Seniority Level must be a string",
        "any.valid":
          "Seniority Level must be fresh, junior, mid-level, senior, team-lead, cto",
      }),
    jobDescription: Joi.string().messages({
      "string.base": "Job Description must be a string",
    }),
    technicalSkills: Joi.array().items(Joi.string()).messages({
      "string.base": "Technical Skills must be a string",
    }),
    softSkills: Joi.array().items(Joi.string()).messages({
      "string.base": "Soft Skills must be a string",
    }),
  }),
  params: Joi.object({
    id: Joi.string().hex().required().messages({
      "string.base": "Job ID must be a string",
      "string.hex": "Job ID must be a hex string",
      "any.required": "Job ID is required",
    }),
  }),
};
/* delete job schema */
const deleteJobSchema = {
  params: Joi.object({
    id: Joi.string().hex().required().messages({
      "any.required": "Job ID is required",
      "string.base": "Job ID must be a string",
      "string.hex": "Job ID must be a hex string",
    }),
  }),
};
/* getJobs */
const getJobsSchema = {
  params: Joi.object({
    jobId: Joi.string().hex().required().messages({
      "any.required": "Job ID is required",
      "string.base": "Job ID must be a string",
      "string.hex": "Job ID must be a hex string",
    }),
  }),
  query: Joi.object({
    companyName: Joi.string().messages({
      "string.base": "Company Name must be a string",
    }),
  }),
};
/* getFilteredJobsService */
const getFilteredJobsSchema = {
  query: Joi.object({
    workingTime: Joi.string().valid("full-time", "part-time").messages({
      "string.base": "Working Time must be a string",
      "any.valid": "Working Time must be full-time or part-time",
    }),
    jobLocation: Joi.string().valid("remotely", "hybrid", "onSite").messages({
      "string.base": "Job Location must be a string",
      "any.valid": "Job Location must be remotely, hybrid, or onSite",
    }),
    seniorityLevel: Joi.string()
      .valid("fresh", "junior", "mid-level", "senior", "team-lead", "cto")
      .messages({
        "string.base": "Seniority Level must be a string",
        "any.valid":
          "Seniority Level must be fresh, junior, mid-level, senior, team-lead, cto",
      }),
    jobTitle: Joi.string().messages({
      "string.base": "Job Title must be a string",
    }),
    technicalSkills: Joi.string().messages({
      "string.base": "Technical Skills must be a string",
    }),
  }),
};
/* getAllApplicationsForJob */
const getAllApplicationsForJobSchema = {
  params: Joi.object({
    jobId: Joi.string().hex().required().messages({
      "any.required": "Job ID is required",
      "string.base": "Job ID must be a string",
      "string.hex": "Job ID must be a hex string",
    }),
  }),
};
/* applyToJob */
const applyToJobSchema = {
  params: Joi.object({
    jobId: Joi.string().hex().required().messages({
      "any.required": "Job ID is required",
      "string.base": "Job ID must be a string",
      "string.hex": "Job ID must be a hex string",
    }),
  }),
};
/* accept or reject application status */
const acceptOrRejectApplicationSchema = {
  params: Joi.object({
    id: Joi.string().hex().required().messages({
      "any.required": "Application ID is required",
      "string.base": "Application ID must be a string",
      "string.hex": "Application ID must be a hex string",
    }),
  }),
  body: Joi.object({
    status: Joi.string().valid("accepted", "rejected").required().messages({
      "any.required": "Status is required",
      "string.base": "Status must be a string",
      "any.valid": "Status must be accepted or rejected",
    }),
  }),
};
export {
  addJobSchema,
  updateJobSchema,
  deleteJobSchema,
  getJobsSchema,
  getFilteredJobsSchema,
  getAllApplicationsForJobSchema,
  applyToJobSchema,
  acceptOrRejectApplicationSchema,
};
