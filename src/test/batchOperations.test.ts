import { Resource } from "sst";
import { describe, it, expect, afterAll } from "vitest";

const fs = require('fs');
const path = require('path');
const moveieRoleJsonData = JSON.parse(fs.readFileSync(path.join(__dirname, '../jsonTestData/movieroles.json'), 'utf8'));

describe("Batch Operations", () => {

    it("should be able to put multiple items", async () => {
        //given a file of actors and movies
        const movieRoles = moveieRoleJsonData;

        //when we put the items in batch
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

        //then the items are added to the table
        expect(batchWriteResult.UnprocessedItems).toEqual({});
    });

    it("should be able to get multiple items", async () => {
        const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
        const { DynamoDBDocumentClient, BatchGetCommand } = require("@aws-sdk/lib-dynamodb");

        const client = new DynamoDBClient({});
        const docClient = DynamoDBDocumentClient.from(client);
        
        //given a list of of actors and movies
        const actorsAndMovies = [
            { actor: "Robert Downey Jr.", movie: "Avengers: Endgame" },
            { actor: "Leonardo DiCaprio", movie: "Inception" },
            { actor: "Meryl Streep", movie: "The Devil Wears Prada" }
        ];

        //when we get the items in batch
        const tableName = Resource.MovieRoles.tableName;
        const batchGetCommand = new BatchGetCommand({
            RequestItems: {
                [tableName]: {
                    Keys: actorsAndMovies.map(item => ({
                        actor: item.actor,
                        movie: item.movie
                    }))
                }
            }
        });

        const batchGetResult = await docClient.send(batchGetCommand);

        //then the items are returned should include
        const retrievedItems = batchGetResult.Responses[tableName];

        // Iterate through the responses and check for Robert Downey Jr.
        const robertDowneyJrItem = retrievedItems.find(item => item.actor === "Robert Downey Jr.");
        
        // Assertions for Robert Downey Jr.'s item
        expect(robertDowneyJrItem).toBeDefined();
        expect(robertDowneyJrItem.movie).toEqual("Avengers: Endgame");
        expect(robertDowneyJrItem.role).toEqual("Tony Stark / Iron Man");
        expect(robertDowneyJrItem.year).toEqual(2019);
        expect(robertDowneyJrItem.genre).toEqual("Action, Sci-Fi"); 
    });

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
});

