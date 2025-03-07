import {
  approveCompanyResolver,
  banOrUnbanCompanyResolver,
  listAllCompaniesResolver,
} from "../resolvers/company.resolver.js";
import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
} from "graphql";
import { companyType } from "../types/company.type.js";

/* === companiesFields === */
export const companiesFields = {
  Query: {
    listCompanies: {
      type: new GraphQLList(companyType),
      description: "List all companies",
      resolve: listAllCompaniesResolver,
    },
  },
  Mutation: {
    banOrUnbanCompany: {
      type: GraphQLString,
      description: "Ban or unban company",
      args: {
        companyId: { type: new GraphQLNonNull(GraphQLID) },
        isBanned: { type: new GraphQLNonNull(GraphQLBoolean) },
      },
      resolve: (__, args) => banOrUnbanCompanyResolver(args),
    },
    approveCompany: {
      type: GraphQLString,
      description: "Approve company",
      args: {
        companyId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: (__, args) => approveCompanyResolver(args),
    },
  },
};
