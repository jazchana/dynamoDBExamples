export const table = new sst.aws.Dynamo("Users", {
    fields: {
      username: "string",
    },
    primaryIndex: { hashKey: "username" }
  });


//using pulumi to create a dynamodb table for testing purposes
export const movieRolesTable = new aws.dynamodb.Table("MovieRoles", {
    attributes: [
      {
        name: "actor",
        type: "S"
      },
      {
        name: "movie",
        type: "S"
      }
    ],
    hashKey: "actor",
    rangeKey: "movie",
    billingMode: "PROVISIONED",
    readCapacity: 5,
    writeCapacity: 5,
  });
