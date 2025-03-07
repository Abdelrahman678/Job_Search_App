import {
  banOrUnbanUserResolver,
  listAllUsersResolver,
} from "../resolvers/user.resolver.js";
import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from "graphql";
import { userType } from "../types/user.type.js";

/* === usersFields === */
export const usersFields = {
  Query: {
    listUsers: {
      type: new GraphQLList(userType),
      description: "List all users",
      resolve: listAllUsersResolver,
    },
  },
  Mutation: {
    banOrUnbanUser: {
      type: GraphQLString,
      description: "Ban or unban user",
      args: {
        userId: { type: new GraphQLNonNull(GraphQLID) },
        isBanned: { type: new GraphQLNonNull(GraphQLBoolean) },
      },
      resolve: (__, args) => banOrUnbanUserResolver(args),
    },
  },
};
