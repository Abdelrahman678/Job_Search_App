import { Router } from "express";
import {
  authenticationMiddleware,
  authorizationMiddleware,
  errorHandlerMiddleware,
  MulterHost,
  validationMiddleware,
} from "../../Middleware/index.middleware.js";
import {
  acceptOrRejectApplicationService,
  addJobService,
  applyToJobService,
  deleteJobService,
  getAllApplicationsForJobService,
  getFilteredJobsService,
  getJobsService,
  updateJobService,
} from "./services/job.service.js";
import {
  acceptOrRejectApplicationSchema,
  addJobSchema,
  applyToJobSchema,
  deleteJobSchema,
  getAllApplicationsForJobSchema,
  getFilteredJobsSchema,
  getJobsSchema,
  updateJobSchema,
} from "../../Validators/job.schema.js";
import { imageExtensions, systemRoles } from "../../Constants/constants.js";

const jobController = Router();
jobController.use(authenticationMiddleware());
/* add job */
jobController.post(
  "/add-job",
  validationMiddleware(addJobSchema),
  errorHandlerMiddleware(addJobService)
);
/* update job */
jobController.put(
  "/update-job/:id",
  validationMiddleware(updateJobSchema),
  errorHandlerMiddleware(updateJobService)
);
/* delete job */
jobController.delete(
  "/delete-job/:id",
  validationMiddleware(deleteJobSchema),
  errorHandlerMiddleware(deleteJobService)
);
/* get jobs */
jobController.get(
  "/get-jobs/:jobId?",
  validationMiddleware(getJobsSchema),
  errorHandlerMiddleware(getJobsService)
);
/* get filtered jobs */
jobController.get(
  "/get-filtered-jobs",
  validationMiddleware(getFilteredJobsSchema),
  errorHandlerMiddleware(getFilteredJobsService)
);
/* get all applications for specific job */
jobController.get(
  "/get-all-applications-for-job/:jobId",
  validationMiddleware(getAllApplicationsForJobSchema),
  errorHandlerMiddleware(getAllApplicationsForJobService)
);
/* apply to job */
jobController.post(
  "/apply-to-job/:jobId",
  MulterHost(imageExtensions).single("cv"),
  validationMiddleware(applyToJobSchema),
  authorizationMiddleware([systemRoles.USER]),
  errorHandlerMiddleware(applyToJobService)
);
/* accept or reject application status */
jobController.patch(
  "/accept-reject-application-status/:id",
  validationMiddleware(acceptOrRejectApplicationSchema),
  errorHandlerMiddleware(acceptOrRejectApplicationService)
);
export { jobController };
