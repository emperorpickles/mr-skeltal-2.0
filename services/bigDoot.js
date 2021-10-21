const { entersState, AudioPlayerStatus } = require('@discordjs/voice');
const voice = require('./voiceManager');

module.exports = {
    bigDoot: (client) => {
        console.log('\n---Big Doot Incoming---');
        var voiceChannels = [];
        const player = voice.createPlayer();
        player.setMaxListeners(20);
        const resource = voice.createResource('./media/doot.ogg');

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
                    // await voice.playFile(player);
                    player.play(resource);
                    await entersState(player, AudioPlayerStatus.Playing, 5e3);

                    // join voice channel and play audio file
                    const connection = await voice.connectToChannel(channel);
                    connection.subscribe(player);
                    await voice.playerEnd(player).then(() => {
                        try {
                            connection.destroy();
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