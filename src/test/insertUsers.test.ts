import { afterAll, afterEach, describe, expect, it, test } from "vitest";
import { deleteUsernameRecords, getByUsername, insertUser, insertUserMarshalled, User } from "../respository/usernameRespository";

const fs = require('fs');
const path = require('path');
const usersJsonData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../users.json'), 'utf8'));
const usernames = ["test-user-1", "test-user-2", "test-user-3"]


describe('Basic Insert Operations', () => {
    it('Insert one item into the table', async () => { 
        //given a user
        const user = {
            username: usernames[0],
        } as User;
        
        //when we insert the username into the table
        await insertUser(user); 

        //then the item is visible in the table
        expect((await getByUsername(user.username)).username).toEqual(user.username);
    });  

    it('Insert multiple items into the table', async () => {
        //given a list of usernames
        const usernameList = [
            { username: usernames[0] },
            { username: usernames[1] },
            { username: usernames[2] }
        ] as User[];
        
        //when we insert each username into the table 
        for (const username of usernameList) {
            const result = await insertUser(username); 
            expect(result.success).toBe(true);
            expect(result.message).toBe("User inserted successfully");
        }

        //then each username is visible in the table
        for (const username of usernameList) {
            expect((await getByUsername(username.username)).username).toEqual(username.username);
        }
    }); 

    it('Insert users from json file', async () => {
        //given a json file with users
        const usersData = usersJsonData;

        //when we insert each user into the table and marshall the data
        for (const user of usersData) {
            const result = await insertUserMarshalled(user);
            expect(result.success).toBe(true);
            expect(result.message).toBe("User inserted successfully");
        }

        //then each user is visible in the table
        for (const username of usersData) {
            expect((await getByUsername(username.username)).username).toEqual(username.username);
        }
    }) 

    it('insert existing user', async () => {
        //given an existing user
        const user = usersJsonData[0];
        await insertUserMarshalled(user);

        //when we insert the user into the table again
        const result = await insertUserMarshalled(user);
        
        //then the user is not duplicated
        expect(result.success).toBe(false);
        expect(result.message).toBe("User with this username already exists");
    })

    afterEach(async () => {
        console.log("Deleting users after tests");
        for (const username of usernames) {
            const result = await deleteUsernameRecords(username);
            expect(result.success).toBe(true);
            expect(result.message).toBe("User deleted successfully");
        }
    });

    afterAll(async () => { 
        // Delete each user from the database
        for (const user of usersJsonData) {
            await deleteUsernameRecords(user.username);
        }
    });
     
});

