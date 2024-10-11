import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { Resource } from "sst";
import { afterAll, describe, expect, it, test } from "vitest";
import { deleteUsernameRecords, getByUsername, insertUsername } from "../respository/usernameRespository";

const client = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(client);
export const tableName = Resource.Users.name;


describe('Basic Insert Operations', () => {
    const usernames = ["test-user-1", "test-user-2", "test-user-3"]

    it('Insert one item into the table', async () => { 
        //given a username
        const username = "test-user-1";
        
        //when we insert the username into the table
        await insertUsername(username);

        //then the item is visible in the table
        expect((await getByUsername(username)).Item?.username).toEqual(username);

    });  

    it('Insert multiple items into the table', async () => {
        //given a list of usernames
        const usernameList = usernames;
        
        //when we insert each username into the table
        for (const username of usernameList) {
            await insertUsername(username);
        }

        //then each username is visible in the table
        for (const username of usernameList) {
            expect((await getByUsername(username)).Item?.username).toEqual(username);
        }
    });

    afterAll(async () => {
        //delete all items from the table
        for (const username of usernames) {
            await deleteUsernameRecords(username);
        }
    });
    
});
