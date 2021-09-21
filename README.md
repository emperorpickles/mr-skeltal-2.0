# Mr. Skeltal 2.0
A rewrite of the original Mr. Skeltal discord bot to use the new Discord API changes.

## Features
Will randomly join any active voice channels and doot the members before leaving.

Accepts both prefix commands and interactions.

### Commands
`!doot` - Join the senders voice channel and doot on command.

`!spoopy` - Join the senders voice channel and do a spoopy dance. #TODO

## Setup
### Dependencies
- Node.js 16

### Environment Variables
Create environment variables or .env file with the following variables:
- BOT_TOKEN = "Your Bot Token"
- DOOT_CHANCE = "Value Between 0 and 1"
- DOOT_FREQ = "Time between doot rolls in mins"

## Usage
Run `node index.js` from the root directory to deploy the bot.

Should output confirmation into the console once the bot has successfully launched and logged in.