const { Client, Collection } = require('discord.js');
const { AutoPoster } = require('topgg-autoposter');
const { bigDoot } = require('./services/bigDoot');

const fs = require('fs');
require('dotenv').config();

// client creation
const token = process.env.BOT_TOKEN;
const client = new Client({ intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES'] });

const dootChance = process.env.DOOT_CHANCE || 0.25;
const dootFreq = process.env.DOOT_FREQ || 20;

// top.gg integration
if (process.env.TOPGG_TOKEN) {
    const ap = AutoPoster(process.env.TOPGG_TOKEN, client);

    ap.on('posted', () => {
        console.log('---Posted Stats to Top.GG---');
    });
}

// command registration
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// on client login
client.on('ready', async () => {
    console.log(`Logged in as "${client.user.username}"`);
    console.log(`Connected to ${client.guilds.cache.size} server(s)`);
    console.log(`Current Doot Chance = ${dootChance * 100}%\nCurrent Doot Freq = ${dootFreq}min`);

    setInterval(() => {
        let rand = Math.random();
        console.log('Doot Roll: ' + rand);
        if (rand >= (1 - dootChance)) bigDoot(client);
    }, 1e3 * 60 * dootFreq);
});

// on client interaction
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (command) {
        try {
            await command.execute(interaction);
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: 'Error executing this command!', ephemeral: true });
        }
    }
});

// on client message
client.on('messageCreate', async (message) => {
    if (!message.guild) return;
    if (!client.application?.owner) await client.application?.fetch();

    let args = message.content.slice(1).split(/ +/);
    let commandName = args.shift().toLowerCase();
    let command = client.commands.get(commandName);

    if (command) {
        try {
            await command.execute(message);
        } catch (err) {
            console.error(err);
            await message.reply({ content: 'Error executing this command!', ephemeral: true });
        }
    }

    // deploy new commands as interactions
    if (commandName === 'deploy' && message.author.id === client.application?.owner?.id) {
        let commands = [];
        console.log('Deploying Commands:')
        client.commands.forEach((v, k) => {
            console.log(v.data);
            commands.push(v.data);
        });
        await client.application.commands.set(commands);
        await message.reply({ content: 'Deployed', ephemeral: true });
    }
    // print out registered commands
    if (commandName === 'commands') {
        await client.application.commands.fetch()
            .then(commands => {
                commands.forEach((command) => {
                    console.log(command.name);
                });
            })
            .catch(console.error);
    }
});

client.login(token);