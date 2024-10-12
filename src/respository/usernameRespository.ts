import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { AttributeValue, ConditionalCheckFailedException, DynamoDBClient } from "@aws-sdk/client-dynamodb";
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
    try {
        await docClient.send(new PutCommand({
            TableName: tableName,
        Item: {
            username: user.username,
            name: user.name,
            email: user.email,
            age: user.age,
            subscriptionStatus: user.subscriptionStatus,
            preferences: user.preferences
        },
        ConditionExpression: 'attribute_not_exists(username)',
            ReturnValues: 'ALL_OLD'
        }));
        return { success: true, message: "User inserted successfully" };
    } catch (error) {
        if (error instanceof ConditionalCheckFailedException) {
            return { success: false, message: "User with this username already exists" };
        }
        throw error;
    }
}

//the DynamoDBDocumentClient infers the marshalling from the User type
export async function insertUserMarshalled(user: User) {
    try {
        await docClient.send(new PutCommand({
            TableName: tableName,
            Item: user,
            ConditionExpression: 'attribute_not_exists(username)',
            ReturnValues: 'ALL_OLD'
        }));
        return { success: true, message: "User inserted successfully" };
    } catch (error) {
        if (error instanceof ConditionalCheckFailedException) {
            return { success: false, message: "User with this username already exists" };
        }
        throw error;
    }
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
    try {
        const deleteCommand = new DeleteCommand({
            TableName: tableName,
            Key: { username: username }
        });
        const response = await docClient.send(deleteCommand);
        
        if (response.$metadata.httpStatusCode === 200) {
            return { success: true, message: "User deleted successfully" };
        } else {
            console.error(`Failed to delete user with username: ${username}`);
            return { success: false, message: "Failed to delete user" };
        }
    } catch (error) {
        console.error(`Error deleting user with username ${username}:`, error);
        throw error;
    }
}

