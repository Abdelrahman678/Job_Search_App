import { User } from "../../DB/models/index.models.js";

/* === listAllUsers === */
export const listAllUsersResolver = async () => {
  const users = await User.find({});
  return users;
};

/* === banOrUnbanUser === */
export const banOrUnbanUserResolver = async (args) => {
  const { userId, isBanned } = args;
  const user = await User.findById(userId);
  if (!user) {
    return "User not found";
  }
  if (isBanned === user.isBanned) {
    return `User banned is already ${isBanned}`;
  }
  user.isBanned = isBanned;
  if (isBanned) {
    user.bannedAt = new Date();
    await user.save();
    return "User banned successfully";
  } else {
    await User.findByIdAndUpdate(userId, {
      $unset: { bannedAt: "" },
    });
    await user.save();
    return "User unbanned successfully";
  }
};
