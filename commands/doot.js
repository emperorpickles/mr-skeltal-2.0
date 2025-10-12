const { SlashCommandBuilder } = require('@discordjs/builders');
const voice = require('../services/voiceManager');

/**
 * Slash command: /doot
 * Joins the user's voice channel, plays the classic doot, then leaves once playback ends.
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('doot')
        .setDescription('doot doot'),
    async execute(interaction) {
        const player = voice.createPlayer();
        const channel = interaction.member?.voice.channel;

        if (!channel) {
            await interaction.reply({ content: 'Need to be in voice channel', ephemeral: true });
            return;
        }

        console.log('dooting');

        try {
            // Defer the response so we can finish the voice handshake before answering.
            await interaction.deferReply();

            // Establish the voice link, queue the track, and start piping it into the channel.
            const connection = await voice.connectToChannel(channel);
            const resource = await voice.playFile(player, './media/doot.ogg');
            connection.subscribe(player);

            // Log player issues up front; without this the Discord library swallows errors silently.
            player.on('error', (error) => {
                const title = error.resource?.metadata?.title || resource?.metadata?.title || 'unknown';
                console.error('Error:', error.message, 'with track', title);
            });

            await voice.playerEnd(player);

            if (connection) {
                connection.destroy();
            }

            await interaction.editReply('DOOT DOOT');
        } catch (err) {
            console.error('Error!', err);
            await interaction.editReply({ content: 'Unexpected error occurred!', ephemeral: true });
        }
    },
};
