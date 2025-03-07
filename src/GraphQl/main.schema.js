import { GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
import { usersFields } from "./fields/user.fields.js";
import { companiesFields } from "./fields/company.field.js";

export const mainSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "MainQuerySchema",
    description: "This is Main Query Schema",
    fields: {
      ...usersFields.Query,
      ...companiesFields.Query,
    },
  }),
  mutation: new GraphQLObjectType({
    name: "MainMutationSchema",
    description: "This is Main Mutation Schema",
    fields: {
      ...usersFields.Mutation,
      ...companiesFields.Mutation,
    },
  }),
});
