import cron from "node-cron";
import { User } from "../DB/models/index.models.js";

/* start the job */
export const startOtpCleanupJob = () => {
  /* Schedule the job to run every 6 hours */
  const otpCleanupJob = cron.schedule("0 */6 * * *", async () => {
    try {
      /* Get current date */
      const currentDate = new Date();
      /* Find users with expired OTPs and update their OTP array */
      await User.updateMany(
        { "OTP.expiresIn": { $lt: currentDate } },
        { $pull: { OTP: { expiresIn: { $lt: currentDate } } } }
      );

      console.log("Expired OTPs deleted successfully.");
    } catch (error) {
      console.error("Error deleting expired OTPs:", error);
    }
  });
};
