export const table = new sst.aws.Dynamo("Users", {
    fields: {
      username: "string",
    },
    primaryIndex: { hashKey: "username" }
  });