const { entersState, AudioPlayerStatus } = require('@discordjs/voice');
const voice = require('./voiceManager');

module.exports = {
    bigDoot: (client) => {
        console.log('\n---Big Doot Incoming---');
        var voiceChannels = [];

        client.channels.cache.forEach((channel) => {
            if (channel.isVoice() && channel.members.size > 0) {
                voiceChannels.push(channel);
            }
        });
        console.log(`Hitting ${voiceChannels.length} channels`);

        voiceChannels.forEach(async (channel, i) => {
            var permissions = channel.permissionsFor(client.user);
            if (permissions.has('CONNECT') && permissions.has('SPEAK')) {
                console.log(`(${i + 1}/${voiceChannels.length}) dooting ${channel.members.size} nerd(s)`);
                try {
                    // setup audio player
                    const player = voice.createPlayer();
                    const resource = voice.createOggResource('./media/doot.ogg');
                    player.play(resource);

                    // join voice channel and play audio file
                    await voice.connectToChannel(channel).catch(err => console.error(err));
                    const connection = voice.getVoiceConnection(channel.guildId);
                    connection.subscribe(player);
                    await voice.playerEnd(player).then(() => {
                        try {
                            connection.destroy();
                            player.stop();
                            resource = null;
                        } catch (err) { return; }
                    }).catch(err => {
                        console.error(err);
                    });
                } catch (err) {
                    console.error(err);
                }
            } else {
                console.log('lack permissions to join channel :(');
            }
        });
        console.log('---Doots Doot Dooted---\n');
    }
}