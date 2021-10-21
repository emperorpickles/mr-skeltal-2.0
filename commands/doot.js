const { SlashCommandBuilder } = require('@discordjs/builders');
const voice = require('../services/voiceManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('doot')
        .setDescription('doot doot'),
    async execute(interaction) {
        // audio player setup
        const player = voice.createPlayer();

        const channel = interaction.member?.voice.channel;
        if (channel) {
            console.log('dooting');
            try {
                // create audio player
                await voice.playFile(player);
                // join voice channel and play audio file
                const connection = await voice.connectToChannel(channel);
                interaction.reply('DOOT DOOT');
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