const { Client, Collection, Intents } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const token = process.env.BOT_TOKEN;
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.once('ready', () => {
    console.log(`Logged in as "${client.user.username}"`);
    console.log(`Connected to ${client.guilds.cache.size} server(s)`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(err);
        await interaction.reply({ content: 'Error executing this command!', ephemeral: true });
    }
});

client.login(token);