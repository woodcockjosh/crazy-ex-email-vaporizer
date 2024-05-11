#!/usr/bin/env ts-node

import 'dotenv/config';

const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
import {gmail} from "@googleapis/gmail";

// If modifying these scopes, delete token.json.
const SCOPES = [
    'https://mail.google.com',
];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const CRAZY_EX_EMAILS_PATH = path.join(process.cwd(), 'crazy-ex-emails.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
    try {
        const content = (await fs.readFile(TOKEN_PATH)).toString();
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
    const content = (await fs.readFile(CREDENTIALS_PATH)).toString();
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    console.log(`TOKEN_PATH`, TOKEN_PATH);
    await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    client = (await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    }) as any);
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}

const getSenderFromPayload = (headers: {name: string, value: string}[]) => {
    for(const header of headers){
        if(header.name === "From"){
            return header.value;
        }
    }

    return null;
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function deleteCrazyExEmails(auth) {
    const gmailClient = gmail({
        version: "v1",
        auth
    })

    const content = (await fs.readFile(CRAZY_EX_EMAILS_PATH)).toString();
    const crazyExEmails = JSON.parse(content);

    const res = await gmailClient.users.messages.list({ userId: 'me', labelIds: ['TRASH']});

    for(const message of res.data.messages){
        const messageMeta = await gmailClient.users.messages.get({id: message.id, userId: 'me'});

        const sender = getSenderFromPayload(messageMeta.data.payload.headers as any);

        for(const crazyExEmail of crazyExEmails){
            if(sender.toLowerCase().includes(crazyExEmail.toLowerCase())){
                console.log(`Crazy ex is trying to email you from '${sender}'`);
                await gmailClient.users.messages.delete({id: message.id, userId: 'me'});

                console.log('message vaporized');
            }
        }
    }
}

authorize().then(deleteCrazyExEmails).catch(console.error);