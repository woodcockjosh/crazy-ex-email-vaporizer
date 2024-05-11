# Crazy Ex Email Vaporizer

Do you have a crazy ex that keeps emailing you? Did you block them but the email just goes to trash? Is your curiosity too much to keep you from digging in the trash? 

No problem. This app will permanently delete emails from that pesky crazy ex, so you don't have to worry about your curiosity getting the best of you.

# How to use

### 1. 
Follow steps here to generate a `credentials.json` file https://developers.google.com/gmail/api/quickstart/nodejs 

### 2

Copy `crazy-ex-emails.example.json` to `crazy-ex-emails.json` 

```shell
cp `crazy-ex-emails.example.json` `crazy-ex-emails.json` 
````

And update the email(s) your crazy ex uses to email you. Add new emails as necessary if they use new email accounts to harass you.

### 3.
Install the application
```shell
yarn install
```

### 4.
Run the program manually the first time

```shell
yarn start
```

Follow the steps in the web browser to authorize access to your email

### 5.
Create a cron job
```shell
crontab -e
```

Cron file should look something like this: 

```text
*/5 * * * * /usr/local/bin/ts-node /Users/josh/Projects/Personal/crazy-ex-email-vaporizer/index.ts
```

This will run the program every 5 minutes to look for emails in your trash and permanently delete them. You can adjust to less frequently if you like. 





