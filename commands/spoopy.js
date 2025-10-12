const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');
const path = require('node:path');
const voice = require('../services/voiceManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('spoopy')
        .setDescription('Lets get spoopy'),
    async execute(interaction) {
        const player = voice.createPlayer();
        const channel = interaction.member?.voice.channel;

        if (!channel) {
            await interaction.reply({ content: 'Need to be in voice channel', ephemeral: true });
            return;
        }

        const skeletonGifPath = path.join(__dirname, '../media/skeleton-dancing.gif');
        const skeletonEmbed = new EmbedBuilder().setImage('attachment://skeleton-dancing.gif');
        const skeletonAttachment = new AttachmentBuilder(skeletonGifPath, { name: 'skeleton-dancing.gif' });

        console.log('spoopy dance');

        try {
            const connection = await voice.connectToChannel(channel);
            connection.subscribe(player);

            const track = await voice.playFile(player, './media/spoopy.ogg', 0.2);
            track.metadata = { title: 'Spoopy' };

            const playerEndedPromise = voice.playerEnd(player);
            const connectionEndedPromise = voice.connectionEnd(connection);
            const cleanupPromise = Promise.any([playerEndedPromise, connectionEndedPromise]);

            const replyMessage = await interaction.reply({
                content: 'Lets get spoopy ;)',
                fetchReply: true,
            });

            const embedMessage = await interaction.followUp({
                embeds: [skeletonEmbed],
                files: [skeletonAttachment],
                fetchReply: true,
            });

            cleanupPromise
                .then(() => {
                    replyMessage.delete?.().catch(() => {});
                    embedMessage.delete?.().catch(() => {});
                })
                .catch(console.error);

            await playerEndedPromise;

            const activePlayer = connection.state.subscription?.player;
            if (activePlayer === player) {
                connection.destroy();
            }

            if (player.state.status !== AudioPlayerStatus.Idle) {
                player.stop(true);
            }
        } catch (error) {
            console.error(error);

            const errorPayload = { content: 'Unexpected error occurred!', ephemeral: true };

            if (interaction.deferred || interaction.replied) {
                await interaction.followUp(errorPayload).catch(() => {});
            } else {
                await interaction.reply(errorPayload).catch(() => {});
            }
        }
    },
};
