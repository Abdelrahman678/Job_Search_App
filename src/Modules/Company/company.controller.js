import { Router } from "express";

import {
  authenticationMiddleware,
  errorHandlerMiddleware,
  MulterHost,
  validationMiddleware,
} from "../../Middleware/index.middleware.js";
import {
  addCompanyService,
  deleteCoverCloudinaryService,
  deleteLogoCloudinaryService,
  getSpecificCompanyService,
  searchCompanyWithNameService,
  softDeleteCompanyService,
  updateCompanyService,
  uploadCoverCloudinaryService,
  uploadLogoCloudinaryService,
} from "./services/company.service.js";
import {
  documentExtensions,
  imageExtensions,
} from "../../Constants/constants.js";
import {
  addCompanySchema,
  getSpecificCompanySchema,
  searchCompanyByNameSchema,
  softDeleteCompanySchema,
  updateCompanySchema,
  uploadOrDeleteSchema,
} from "../../Validators/company.schema.js";

const companyController = Router();
companyController.use(authenticationMiddleware());

/* add company */
companyController.post(
  "/add-company",
  //   validationMiddleware(addCompanySchema),
  MulterHost(documentExtensions).single("legalAttatchment"),
  validationMiddleware(addCompanySchema),
  errorHandlerMiddleware(addCompanyService)
);
/* updateCompany */
companyController.put(
  "/update-company/:id",
  validationMiddleware(updateCompanySchema),
  errorHandlerMiddleware(updateCompanyService)
);
/* softDeleteCompany */
companyController.delete(
  "/soft-delete-company/:id",
  validationMiddleware(softDeleteCompanySchema),
  errorHandlerMiddleware(softDeleteCompanyService)
);
/* getSpecificCompany */
companyController.get(
  "/get-specific-company/:id",
  validationMiddleware(getSpecificCompanySchema),
  errorHandlerMiddleware(getSpecificCompanyService)
);
/* searchCompanyWithNameService */
companyController.get(
  "/search-company-with-name",
  validationMiddleware(searchCompanyByNameSchema),
  errorHandlerMiddleware(searchCompanyWithNameService)
);
/* uploadLogoCloudinary */
companyController.patch(
  "/upload-logo/:id",
  validationMiddleware(uploadOrDeleteSchema),
  MulterHost(imageExtensions).single("logo"),
  errorHandlerMiddleware(uploadLogoCloudinaryService)
);
/* uploadCoverCloudinary */
companyController.patch(
  "/upload-cover/:id",
  validationMiddleware(uploadOrDeleteSchema),
  MulterHost(imageExtensions).single("cover"),
  errorHandlerMiddleware(uploadCoverCloudinaryService)
);
/* deleteLogoCloudinary */
companyController.delete(
  "/delete-logo/:id",
  validationMiddleware(uploadOrDeleteSchema),
  errorHandlerMiddleware(deleteLogoCloudinaryService)
);
/* deleteCoverCloudinary */
companyController.delete(
  "/delete-cover/:id",
  validationMiddleware(uploadOrDeleteSchema),
  errorHandlerMiddleware(deleteCoverCloudinaryService)
);

export { companyController };
