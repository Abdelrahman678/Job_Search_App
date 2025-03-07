import { Company } from "../../DB/models/index.models.js";

/* === listAllCompanies === */
export const listAllCompaniesResolver = async () => {
  const companies = await Company.find({});
  return companies;
};

/* === banOrUnbanCompany === */
export const banOrUnbanCompanyResolver = async (args) => {
  const { companyId, isBanned } = args;
  const company = await Company.findById(companyId);
  if (!company) {
    return "Company not found";
  }
  if (isBanned === company.isBanned) {
    return `Company banned is already ${isBanned}`;
  }
  company.isBanned = isBanned;
  if (isBanned) {
    company.bannedAt = new Date();
    await company.save();
    return "Company banned successfully";
  } else {
    await Company.findByIdAndUpdate(companyId, {
      $unset: { bannedAt: "" },
    });
    await company.save();
    return "Company unbanned successfully";
  }
};

/* === approveCompany === */
export const approveCompanyResolver = async (args) => {
  const { companyId } = args;
  const company = await Company.findById(companyId);
  if (!company) {
    return "Company not found";
  }
  if (company.approvedByAdmin) {
    return "Company already approved";
  }
  company.approvedByAdmin = true;
  await company.save();
  return "Company approved successfully";
};
