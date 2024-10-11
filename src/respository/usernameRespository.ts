import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { AttributeValue, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Resource } from "sst";

export type User = {
    username: string;
    name: string;
    email: string;
    age: number;
    subscriptionStatus: string;
    preferences: {
        newsletter: boolean;
        notifications: boolean;
    };
}

const client = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(client, { 
    marshallOptions: { 
        removeUndefinedValues: true,
        convertClassInstanceToMap: true,
    }
});

export const tableName = Resource.Users.name;

export async function insertUser(user: User) {
    return await docClient.send(new PutCommand({
        TableName: tableName,
        Item: {
            username: user.username,
            name: user.name,
            email: user.email,
            age: user.age,
            subscriptionStatus: user.subscriptionStatus,
            preferences: user.preferences
        }
    }));
}

//the DynamoDBDocumentClient infers the marshalling from the User type
export async function insertUserMarshalled(user: User) {
    return await docClient.send(new PutCommand({
        TableName: tableName,
        Item: user
    }));
}

export async function getByUsername(username: string): Promise<User> {
    const response = await docClient.send(new GetCommand({
        TableName: tableName,
        Key: { username: username }
    }));
    if (!response.Item) {
        throw new Error(`User with username ${username} not found`);
    }
    return response.Item as User;
}

export async function deleteUsernameRecords(username: string) {
    const deleteCommand = new DeleteCommand({
        TableName: tableName,
        Key: { username: username }
    });
    await docClient.send(deleteCommand);
}

