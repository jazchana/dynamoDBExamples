import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { insertUser, deleteUsernameRecords, getByUsername, User } from "../respository/usernameRespository";


describe('Basic get operations', () => {
    beforeAll(async () => {
        const fs = require('fs');
        const path = require('path');

        // Read the users.json file
        const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../users.json'), 'utf8'));

        // Insert each user into the database
        for (const user of usersData) {
            await insertUser(user);
        } 
    })
    
    it('Get a user by username', async () => {
        //given a username
        const username = "charlie_adams41";

        //when we get the user by username 
        const user:User = await getByUsername(username);

        //it should have the email 
        expect(user.username).toEqual(username); 
        expect(user.email).toEqual("charlie.adams@example.com");
    }) 
 
    afterAll(async () => {
        //delete all items from the table
        const fs = require('fs');
        const path = require('path');

        // Read the users.json file
        const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../users.json'), 'utf8'));

        // Delete each user from the database
        for (const user of usersData) {
            await deleteUsernameRecords(user.username);
        }
    })
})