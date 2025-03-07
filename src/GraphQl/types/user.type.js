import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { imageType } from "./common.types.js";

/* === userType === */
export const userType = new GraphQLObjectType({
  name: "UserType",
  description: "This is User Type",
  fields: {
    _id: {
      type: GraphQLID,
    },
    firstName: {
      type: GraphQLString,
    },
    lastName: {
      type: GraphQLString,
    },
    email: {
      type: GraphQLString,
    },
    provider: {
      type: GraphQLString,
    },
    gender: {
      type: GraphQLString,
    },
    profilePic: {
      type: imageType("profilePic"),
    },
    coverPic: {
      type: imageType("coverPic"),
    },
    isBanned: {
      type: GraphQLBoolean,
    },
    bannedAt: {
      type: GraphQLString,
    },
  },
});
