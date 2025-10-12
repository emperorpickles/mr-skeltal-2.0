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
		await interaction.deferReply();
                // play audio file
                voice.playFile(player, './media/doot.ogg');
                // join voice channel and play audio file
                await voice.connectToChannel(channel).catch(err => console.error(err));
                const connection = voice.getVoiceConnection(channel.guildId);
                connection.subscribe(player);

		player.on('error', (error) => {
		    console.error('Error:', error.message, 'with track', error.resource.metadata.title);
		});

                await voice.playerEnd(player).then(() => {
		    console.debug('Player ended!')
                    if (connection) connection.destroy();
                });
                interaction.editReply('DOOT DOOT');
            } catch (err) {
                console.error(err);
            }
        } else {
            interaction.reply({ content: 'Need to be in voice channel', ephermal: true });
        }
    },
};
