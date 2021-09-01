const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnectionStatus } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('doot')
        .setDescription('doot doot'),
    async execute(interaction) {
        // create connection and join voice channel
        const channel = interaction.member.voice.channel;
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
        
        // create audio player
        // const audioPlayer = createAudioPlayer();
        // const resource = createAudioResource('/Users/caleb/Projects/mr-skeltal-2.0/doot.ogg');

        connection.on(VoiceConnectionStatus.Ready, () => {
            console.log('Voice connection is ready');
            // audioPlayer.play(resource);
            // subscribe to audio player and play audio on voice connection
            // const subscription = connection.subscribe(audioPlayer);
            setTimeout(() => connection.destroy(), 5000);
        })

    },
};