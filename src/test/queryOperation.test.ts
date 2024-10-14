import { Resource } from "sst";
import { describe, it,afterAll, beforeAll, expect } from "vitest";

const fs = require('fs');
const path = require('path');
const moveieRoleJsonData = JSON.parse(fs.readFileSync(path.join(__dirname, '../jsonTestData/movieroles.json'), 'utf8'));

beforeAll(async () => {
    const movieRoles = moveieRoleJsonData;

    const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
    const { DynamoDBDocumentClient, BatchWriteCommand } = require("@aws-sdk/lib-dynamodb");

    const client = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(client);

    const batchWriteItems = movieRoles.flatMap(actor => 
        actor.movies.map(movie => ({
            PutRequest: {
                Item: {
                    actor: actor.actor,
                    movie: movie.title,
                    role: movie.role,
                    year: movie.year,
                    genre: movie.genre
                }  
            }
        }))
    );
    
    const tableName = Resource.MovieRoles.tableName;
    const batchWriteCommand = new BatchWriteCommand({
        RequestItems: {
            [tableName]: batchWriteItems
        }
    });

    const batchWriteResult = await docClient.send(batchWriteCommand);
})

describe("Query Operations", () => {
    it("should be able to query for a specific actor", async () => {
        const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
        const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");

        const client = new DynamoDBClient({});
        const docClient = DynamoDBDocumentClient.from(client);

        // Define the actor to query for
        const actorToQuery = "Tom Hanks";

        // Define the table name
        const tableName = Resource.MovieRoles.tableName;

        // Create the query command
        const queryCommand = new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: "#actor = :actorName",
            ExpressionAttributeNames: {
                "#actor": "actor"
            },
            ExpressionAttributeValues: {
                ":actorName": actorToQuery
            }
        });

        // Execute the query
        const queryResult = await docClient.send(queryCommand);

        // Assert that we got some results
        expect(queryResult.Items).toBeDefined();
        expect(queryResult.Items.length).toBeGreaterThan(0);

        // Check that all returned items are for the queried actor
        queryResult.Items.forEach(item => {
            expect(item.actor).toBe(actorToQuery);
        });

        // Optionally, you can check for specific movies if you know them
        const expectedMovies = ["Forrest Gump", "Saving Private Ryan"];
        expectedMovies.forEach(movie => {
            const foundMovie = queryResult.Items.find(item => item.movie === movie);
            expect(foundMovie).toBeDefined();
        });
    })
})

afterAll(async () => {
    const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
    const { DynamoDBDocumentClient, BatchWriteCommand } = require("@aws-sdk/lib-dynamodb");

    const client = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(client);

    const tableName = "MovieRoles-08fcedb";
    const deleteRequests = moveieRoleJsonData.flatMap(actor =>
        actor.movies.map(movie => ({
            DeleteRequest: {
                Key: {
                    actor: actor.actor,
                    movie: movie.title
                }
            }
        }))
    );

    // Split deleteRequests into chunks of 25 (DynamoDB batch write limit)
    const chunks = [];
    for (let i = 0; i < deleteRequests.length; i += 25) {
        chunks.push(deleteRequests.slice(i, i + 25));
    }

    for (const chunk of chunks) {
        const batchWriteCommand = new BatchWriteCommand({
            RequestItems: {
                [tableName]: chunk
            }
        });

        await docClient.send(batchWriteCommand);
    }
});