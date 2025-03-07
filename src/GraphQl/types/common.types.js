import { GraphQLObjectType, GraphQLString } from "graphql";

/* === imageType === */
export const imageType = (name) => {
  return new GraphQLObjectType({
    name: name || "ImageType",
    description: "Image Type",
    fields: {
      folderId: {
        type: GraphQLString,
      },
      secure_url: {
        type: GraphQLString,
      },
      public_id: {
        type: GraphQLString,
      },
    },
  });
};
