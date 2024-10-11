import { DeleteCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { tableName, docClient } from "../test/loadingItems.test";

export async function insertUsername(username: string) {
    return await docClient.send(new PutCommand({
        TableName: tableName,
        Item: {
            username: username
        }
    }));
}

export async function getByUsername(username: string) {
    return await docClient.send(new GetCommand({
        TableName: tableName,
        Key: { username: username }
    })
    );
}
export async function deleteUsernameRecords(username: string) {
    const deleteCommand = new DeleteCommand({
        TableName: tableName,
        Key: { username: username }
    });
    await docClient.send(deleteCommand);
}

