import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { imageType } from "./common.types.js";

/* === companyType === */
export const companyType = new GraphQLObjectType({
  name: "CompanyType",
  description: "This is Company Type",
  fields: {
    _id: {
      type: GraphQLID,
    },
    companyName: {
      type: GraphQLString,
    },
    description: {
      type: GraphQLString,
    },
    industry: {
      type: GraphQLString,
    },
    address: {
      type: GraphQLString,
    },
    numberOfEmployees: {
      type: GraphQLInt,
    },
    companyEmail: {
      type: GraphQLString,
    },
    createdBy: {
      type: GraphQLID,
    },
    logo: {
      type: imageType("logo"),
    },
    coverPic: {
      type: imageType("cover"),
    },
    HRs: {
      type: new GraphQLList(GraphQLID),
    },
    approvedByAdmin: {
      type: GraphQLBoolean,
    },
    isBanned: {
      type: GraphQLBoolean,
    },
    bannedAt: {
      type: GraphQLString,
    },
  },
});
