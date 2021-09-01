const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

require('dotenv').config();
const token = process.env.BOT_TOKEN;

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

(async function upload() {
    try {
        console.log('Started refreshing slash commands');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Successfully loaded slash commands');
    } catch (err) {
        console.error(err);
    }
})();