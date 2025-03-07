import Joi from "joi";

/* number of employees Validation */
const numberOfEmployeesRule = (value, helper) => {
  if (value >= 11 && value <= 20) {
    return value;
  }
  return helper.error(
    "any.invalid",
    "Number of employees must be between 11 and 20"
  );
};
/* Add Company Schema */
export const addCompanySchema = {
  body: Joi.object({
    companyName: Joi.string().required().messages({
      "any.required": "Company Name is required",
      "string.base": "Company Name must be a string",
    }),
    description: Joi.string().required().messages({
      "any.required": "Description is required",
      "string.base": "Description must be a string",
    }),
    industry: Joi.string().required().messages({
      "any.required": "Industry is required",
      "string.base": "Industry must be a string",
    }),
    address: Joi.string().required().messages({
      "any.required": "Address is required",
      "string.base": "Address must be a string",
    }),
    numberOfEmployees: Joi.number()
      .custom(numberOfEmployeesRule)
      .required()
      .messages({
        "any.required": "Number of Employees is required",
        "string.base": "Number of Employees must be a string",
      }),
    companyEmail: Joi.string().email().required().messages({
      "any.required": "Company Email is required",
      "string.base": "Company Email must be a string",
      "string.email": "Company Email must be valid",
    }),
  }),
};
/* Update Company Schema */
export const updateCompanySchema = {
  body: Joi.object({
    companyName: Joi.string().messages({
      "string.base": "Company Name must be a string",
    }),
    description: Joi.string().messages({
      "string.base": "Description must be a string",
    }),
    industry: Joi.string().messages({
      "string.base": "Industry must be a string",
    }),
    address: Joi.string().messages({
      "string.base": "Address must be a string",
    }),
    numberOfEmployees: Joi.number().custom(numberOfEmployeesRule).messages({
      "string.base": "Number of Employees must be a string",
    }),
    companyEmail: Joi.string().email().messages({
      "string.base": "Company Email must be a string",
      "string.email": "Company Email must be valid",
    }),
    HRs: Joi.array().items(Joi.string().hex()).messages({
      "string.base": "HRs must be a string",
      "string.hex": "HRs must be a hex string",
    }),
  }),
  params: Joi.object({
    id: Joi.string().hex().required().messages({
      "any.required": "Company ID is required",
      "string.base": "Company ID must be a string",
      "string.hex": "Company ID must be a hex string",
    }),
  }),
};
/* soft delete company schema */
export const softDeleteCompanySchema = {
  params: Joi.object({
    id: Joi.string().hex().required().messages({
      "any.required": "Company ID is required",
      "string.base": "Company ID must be a string",
      "string.hex": "Company ID must be a hex string",
    }),
  }),
};
/* get specific company schema */
export const getSpecificCompanySchema = {
  params: Joi.object({
    id: Joi.string().hex().required().messages({
      "any.required": "Company ID is required",
      "string.base": "Company ID must be a string",
      "string.hex": "Company ID must be a hex string",
    }),
  }),
};
/* search company by name schema */
export const searchCompanyByNameSchema = {
  body: Joi.object({
    companyName: Joi.string().required().messages({
      "any.required": "Company Name is required",
      "string.base": "Company Name must be a string",
    }),
  }),
};
/* upload or delete company logo and cover schema */
export const uploadOrDeleteSchema = {
  params: Joi.object({
    id: Joi.string().hex().required().messages({
      "any.required": "Company ID is required",
      "string.base": "Company ID must be a string",
      "string.hex": "Company ID must be a hex string",
    }),
  }),
};
