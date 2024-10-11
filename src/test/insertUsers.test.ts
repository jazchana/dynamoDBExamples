import { afterAll, afterEach, describe, expect, it, test } from "vitest";
import { deleteUsernameRecords, getByUsername, insertUser, insertUserMarshalled, User } from "../respository/usernameRespository";

const fs = require('fs');
const path = require('path');
const usersJsonData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../users.json'), 'utf8'));

describe('Basic Insert Operations', () => {
    const usernames = ["test-user-1", "test-user-2", "test-user-3"]

    it('Insert one item into the table', async () => { 
        //given a user
        const user = {
            username: "test-user-1",
        } as User;
        
        //when we insert the username into the table
        await insertUser(user); 

        //then the item is visible in the table
        expect((await getByUsername(user.username)).username).toEqual(user.username);

    });  

    it('Insert multiple items into the table', async () => {
        //given a list of usernames
        const usernameList = [
            { username: "test-user-1" }, 
            { username: "test-user-2" },
            { username: "test-user-3" }
        ] as User[];
        
        //when we insert each username into the table 
        for (const username of usernameList) {
            await insertUser(username); 
        }

        //then each username is visible in the table
        for (const username of usernameList) {
            expect((await getByUsername(username.username)).username).toEqual(username.username);
        }

        afterEach
    });

    it('Insert users from json file', async () => {
        //given a json file with users
        const usersData = usersJsonData;

        //when we insert each user into the table and marshall the data
        for (const user of usersData) {
            await insertUserMarshalled(user);
        }

        //then each user is visible in the table
        for (const username of usernames) {
            expect((await getByUsername(username)).username).toEqual(username);
        }
    }) 

    afterAll(async () => { 
        // Delete each user from the database
        for (const user of usersJsonData) {
            await deleteUsernameRecords(user.username);
        }
    });
    
});

