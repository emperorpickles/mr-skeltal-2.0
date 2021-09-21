const { Client, Collection, VoiceChannel, Intents } = require('discord.js');
const { bigDoot } = require('./services/bigDoot');
const voice = require('./services/voiceManager');

const fs = require('fs');
require('dotenv').config();

// client creation
const token = process.env.BOT_TOKEN;
const client = new Client({ intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES'] });

const dootChance = process.env.DOOT_CHANCE || 0.25;
const dootFreq = process.env.DOOT_FREQ || 20;

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
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(err);
        await interaction.reply({ content: 'Error executing this command!', ephemeral: true });
    }
});

// on client message
client.on('messageCreate', async (message) => {
    if (!message.guild) return;
    if (!client.application?.owner) await client.application?.fetch();

    // deploy new commands as interactions
    if (message.content.toLowerCase() === '!deploy' && message.author.id === client.application?.owner?.id) {
        let commands = [];
        console.log('Deploying Commands:')
        client.commands.forEach((v, k) => {
            console.log(v.data);
            commands.push(v.data);
        });
        await message.guild.commands.set(commands);
        await message.reply({ content: 'Deployed', ephemeral: true });
    }

    // join voice channel and doot
    if (message.content === '!doot') {
        const channel = message.member?.voice.channel;
        if (channel) {
            const player = voice.createPlayer();
            try {
                await voice.playFile(player);

                // join voice channel and play audio file
                const connection = await voice.connectToChannel(channel);
                connection.subscribe(player);
                await voice.playerEnd(player, connection);
            } catch (err) {
                console.error(err);
            }
        } else {
            await message.reply({ content: 'Join a voice channel', ephemeral: true });
        }
    }
});

client.login(token);