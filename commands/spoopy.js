const { SlashCommandBuilder } = require('@discordjs/builders');
const voice = require('../services/voiceManager');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('spoopy')
        .setDescription('Lets get spoopy'),
    async execute(interaction) {
        //audio player setup
        const player = voice.createPlayer();
        const channel = interaction.member?.voice.channel;

        const skeltalGif = new MessageEmbed()
            .setImage('https://media1.tenor.com/images/a369655bae5b5f8e8de548e631e80d19/tenor.gif?itemid=14585469')

        if (channel) {
            try {
                //create audio player
                await voice.playFile(player, './media/spoopy.mp3', 0.2);
                // join voice channel and play audio file
                const connection = await voice.connectToChannel(channel);

                interaction.reply('Lets get spoopy ;)')
                    .then(async (msg) => {
                        await Promise.any([voice.playerEnd(player), voice.connectionEnd(connection)])
                            .then(() => {
                                msg.delete().catch((err) => { return; });
                            })
                            .catch((err) => { console.error(err) });
                    })
                    .catch(err => {
                        console.error(err);
                    })
                interaction.channel.send({ embeds: [skeltalGif] })
                    .then(async (msg) => {
                        await Promise.any([voice.playerEnd(player), voice.connectionEnd(connection)])
                            .then(() => {
                                msg.delete().catch((err) => { return; });
                            })
                            .catch((err) => { console.error(err) });
                    })
                    .catch(err => {
                        console.error(err);
                    })

                connection.subscribe(player);
                await voice.playerEnd(player).then(() => {
                    if (connection) connection.destroy();
                });
            } catch (err) {
                console.error(err);
            }
        } else {
            interaction.reply({ content: 'Need to be in voice channel', ephermal: true });
        }
    },
};
