import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";
import { afterAll, describe, expect, it, test } from "vitest";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const tableName = Resource.Users.name;


describe('Basic Insert Operations', () => {
    const username = "test-user-1";
    const usernames = ["test-user-1", "test-user-2", "test-user-3"];

    it('Insert one item into the table', async () => { 
        const item = {
            username: username
        };

        //when we insert the username into the table
        const command = new PutCommand({
            TableName: tableName,
            Item: item
        });

        await expect(docClient.send(command)).resolves.not.toThrow();

        //then the item is visible in the table
        const getCommand = new GetCommand({
            TableName: tableName,
            Key: { username: username }
        });

        const result = await docClient.send(getCommand);
        expect(result.Item).toEqual(item);

    });  

    it('Insert multiple items into the table', async () => {
        //given a list of usernames
        
        //when we insert each username into the table
        for (const username of usernames) {
            const item = { username: username };

            const command = new PutCommand({
                TableName: tableName,
                Item: item
            });
            await expect(docClient.send(command)).resolves.not.toThrow();
        }

        //then each username is visible in the table
        for (const username of usernames) {
            const getCommand = new GetCommand({
                TableName: tableName,
                Key: { username: username }
            });

            const result = await docClient.send(getCommand);
            expect(result.Item).toEqual({ username: username });
        }
    });

    afterAll(async () => {
        //delete all items from the table
        for (const username of usernames) {
            const deleteCommand = new DeleteCommand({
                TableName: tableName,
                Key: { username: username }
            });
            await docClient.send(deleteCommand);
        }
    });
});