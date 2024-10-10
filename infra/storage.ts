export const table = new sst.aws.Dynamo("MyTable", {
    fields: {
      userId: "string",
      noteId: "string"
    },
    primaryIndex: { hashKey: "userId", rangeKey: "noteId" }
  });