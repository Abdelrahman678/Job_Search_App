import { nanoid } from "nanoid";
import { Company, User } from "../../../DB/models/index.models.js";
import { cloudinary } from "../../../Config/cloudinary.config.js";
import { systemRoles } from "../../../Constants/constants.js";

/* === addCompany === */
export const addCompanyService = async (req, res) => {
  /* get user id from request */
  const { _id: createdBy } = req.loggedInUser;
  /* destructure request body */
  const {
    companyName,
    description,
    industry,
    address,
    numberOfEmployees,
    companyEmail,
  } = req.body;
  const { file } = req;
  if (!file) {
    return res.status(400).json({
      message: "No file uploaded",
    });
  }
  /* generate a random id for the folder */
  const folderId = nanoid(4);
  /* upload file to cloudinary */
  const { secure_url, public_id } = await cloudinary().uploader.upload(
    file.path,
    {
      folder: `${process.env.CLOUDINARY_FOLDER}/Company/legalAttatchment/${folderId}`,
    }
  );

  /* find company */
  const isCompanyExists = await Company.findOne({
    $or: [{ companyName }, { companyEmail }],
  });
  /* company already exists Error */
  if (isCompanyExists) {
    return res.status(400).json({
      message: "Company already exists",
    });
  }
  /* create company */
  const company = await Company.create({
    companyName,
    description,
    industry,
    address,
    numberOfEmployees,
    companyEmail,
    createdBy,
    legalAttachment: { secure_url, public_id, folderId },
  });
  /* company not created Error */
  if (!company) {
    return res.status(400).json({
      message: "Company can not be created",
    });
  }
  /* return response */
  return res.status(201).json({
    message: "Company added successfully",
    company,
  });
};

/* === updateCompany === */
export const updateCompanyService = async (req, res) => {
  /* get loggedIn user */
  const { _id } = req.loggedInUser;
  /* get company id from request */
  const { id } = req.params;
  /* get company data from request */
  const {
    companyName,
    description,
    industry,
    address,
    numberOfEmployees,
    companyEmail,
    HRs,
  } = req.body;
  /* get company */
  const company = await Company.findById(id);
  /* company not found Error */
  if (!company) {
    return res.status(404).json({
      message: "Company not found",
    });
  }
  /* check if company owner */
  if (company.createdBy.toString() !== _id.toString()) {
    return res.status(403).json({
      message: "You can not update this company",
    });
  }
  /* validate the HRs */
  if (HRs && HRs.length > 0) {
    /* get users with same ids from HRs */
    const validUsersHRs = await User.find({ _id: { $in: HRs } }, "_id");
    /* convert all Ids from ObjectIds to strings */
    const validUsersHRsIds = validUsersHRs.map((user) => user._id.toString());
    /* get invalid HRs */
    const invalidUserHRsIds = HRs.filter(
      (id) => !validUsersHRsIds.includes(id)
    );
    /* return error if invalid HRs */
    if (invalidUserHRsIds.length > 0) {
      return res.status(400).json({
        message: "Some HRs are not valid",
      });
    }
    /* add new HRs to company */
    company.HRs = [...new Set([...company.HRs, ...validUsersHRsIds])];
  }

  if (companyName) company.companyName = companyName;
  if (description) company.description = description;
  if (industry) company.industry = industry;
  if (address) company.address = address;
  if (numberOfEmployees) company.numberOfEmployees = numberOfEmployees;
  if (companyEmail) company.companyEmail = companyEmail;

  await company.save();
  return res.status(200).json({
    message: "Company updated successfully",
    company,
  });
};

/* === softDeleteCompanyService === */
export const softDeleteCompanyService = async (req, res) => {
  /* get user id from request */
  const { _id, role } = req.loggedInUser;

  const { id } = req.params;
  /* find company */
  const company = await Company.findById(id);
  /* company not found Error */
  if (!company) {
    return res.status(404).json({
      message: "Company not found",
    });
  }
  /* if already deleted */
  if (company.isDeleted) {
    return res.status(400).json({
      message: "Company already deleted",
    });
  }
  /* check if company owner */
  if (
    company.createdBy.toString() !== _id.toString() &&
    role !== systemRoles.ADMIN
  ) {
    return res.status(403).json({
      message: "You cannot delete this company",
    });
  }
  /* soft delete company */
  company.isDeleted = true;
  company.deletedAt = new Date();
  /* save company */
  await company.save();
  /* return response */
  return res.status(200).json({
    message: "Company deleted successfully",
  });
};

/* === getSpecificCompany === */
export const getSpecificCompanyService = async (req, res) => {
  const { id } = req.params;
  /* find company */
  const company = await Company.findById(id).populate('jobs');
  /* company not found Error */
  if (!company) {
    return res.status(404).json({
      message: "Company not found",
    });
  }
  /* return response */
  return res.status(200).json({
    message: "Company found successfully",
    company,
  });
};
/* === searchCompanyWithName === */
export const searchCompanyWithNameService = async (req, res) => {
  const { companyName } = req.body;
  /* find company */
  const company = await Company.findOne({ companyName });
  /* company not found Error */
  if (!company) {
    return res.status(404).json({
      message: "Company not found",
    });
  }
  /* return response */
  return res.status(200).json({
    message: "Company found successfully",
    company,
  });
};

/* === uploadLogoCloudinary === */
export const uploadLogoCloudinaryService = async (req, res) => {
  /* get loggedIn user */
  const { _id } = req.loggedInUser;
  /* get company id from request */
  const { id } = req.params;
  /* get file from request */
  const { file } = req;
  /* return error if no file uploaded */
  if (!file) {
    return res.status(400).json({
      message: "No file uploaded",
    });
  }
  /* get company */
  const company = await Company.findById(id);
  /* company not found Error */
  if (!company) {
    return res.status(404).json({
      message: "Company not found",
    });
  }
  /* check if company owner */
  if (company.createdBy.toString() !== _id.toString()) {
    return res.status(403).json({
      message: "You can not upload logo for this company",
    });
  }
  /* generate a random id for the folder */
  const folderId = nanoid(4);
  /* upload file to cloudinary */
  const { secure_url, public_id } = await cloudinary().uploader.upload(
    file.path,
    {
      folder: `${process.env.CLOUDINARY_FOLDER}/Company/Logo/${folderId}`,
    }
  );
  /* update company */
  company.logo = { secure_url, public_id, folderId };
  /* save company */
  await company.save();
  /* return response */
  res.status(200).json({
    message: "Logo uploaded successfully",
    company,
  });
};

/* === uploadCoverCloudinary === */
export const uploadCoverCloudinaryService = async (req, res) => {
  /* get loggedIn user */
  const { _id } = req.loggedInUser;
  /* get company id from request */
  const { id } = req.params;
  /* get file from request */
  const { file } = req;
  /* return error if no file uploaded */
  if (!file) {
    return res.status(400).json({
      message: "No file uploaded",
    });
  }
  /* find company */
  const company = await Company.findById(id);
  /* return error if company not found */
  if (!company) {
    return res.status(404).json({
      message: "Company not found",
    });
  }
  /* check if company owner */
  if (company.createdBy.toString() !== _id.toString()) {
    return res.status(403).json({
      message: "You can not upload cover picture for this company",
    });
  }
  /* generate a random id for the folder */
  const folderId = nanoid(4);
  /* upload file to cloudinary */
  const { secure_url, public_id } = await cloudinary().uploader.upload(
    file.path,
    {
      folder: `${process.env.CLOUDINARY_FOLDER}/Company/Cover/${folderId}`,
    }
  );
  /* update company */
  company.coverPic = { secure_url, public_id, folderId };
  /* save company */
  await company.save();
  /* return response */
  res.status(200).json({
    message: "Cover picture uploaded successfully",
    company,
  });
};

/* === deleteLogoCloudinary === */
export const deleteLogoCloudinaryService = async (req, res) => {
  /* get loggedIn user */
  const { _id } = req.loggedInUser;
  /* get company id from request */
  const { id } = req.params;
  /* find company */
  const company = await Company.findById(id);
  /* return error if company not found */
  if (!company) {
    return res.status(404).json({
      message: "Company not found",
    });
  }
  /* check if company owner */
  if (company.createdBy.toString() !== _id.toString()) {
    return res.status(403).json({
      message: "You can not delete logo for this company",
    });
  }
  /* check if logo exists */
  if (company.logo && company.logo.public_id) {
    /* delete logo from cloudinary */
    await cloudinary().uploader.destroy(company.logo.public_id);
    /* delete folder from cloudinary */
    await cloudinary().api.delete_folder(
      `${process.env.CLOUDINARY_FOLDER}/Company/Logo/${company.logo.folderId}`
    );
    /* find and update company */
    await Company.findByIdAndUpdate(
      id,
      { $unset: { logo: "" } },
      { new: true }
    );
    /* return response */
    return res.status(200).json({
      message: "Logo deleted successfully",
    });
  }
  /* return no logo to delete */
  return res.status(200).json({
    message: "No logo to delete",
  });
};

/* === deleteCoverCloudinary === */
export const deleteCoverCloudinaryService = async (req, res) => {
  /* get loggedIn user */
  const { _id } = req.loggedInUser;
  /* get company id from request */
  const { id } = req.params;
  /* find company */
  const company = await Company.findById(id);
  /* return error if company not found */
  if (!company) {
    return res.status(404).json({
      message: "Company not found",
    });
  }
  /* check if company owner */
  if (company.createdBy.toString() !== _id.toString()) {
    return res.status(403).json({
      message: "You can not delete cover picture for this company",
    });
  }
  /* check if cover picture exists */
  if (company.coverPic && company.coverPic.public_id) {
    /* delete cover picture from cloudinary */
    await cloudinary().uploader.destroy(company.coverPic.public_id);
    /* delete folder from cloudinary */
    await cloudinary().api.delete_folder(
      `${process.env.CLOUDINARY_FOLDER}/Company/Cover/${company.coverPic.folderId}`
    );
    /* find and update company */
    await Company.findByIdAndUpdate(
      id,
      { $unset: { coverPic: "" } },
      { new: true }
    );
    /* return response */
    return res.status(200).json({
      message: "Cover picture deleted successfully",
    });
  }
  /* return no cover picture to delete */
  return res.status(200).json({
    message: "No cover picture to delete",
  });
};
