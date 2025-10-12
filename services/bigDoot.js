const { ChannelType, PermissionsBitField } = require('discord.js');
const voice = require('./voiceManager');

module.exports = {
    bigDoot: (client) => {
        console.log('\n---Big Doot Incoming---');
        const voiceChannels = [];

        client.channels.cache.forEach((channel) => {
            if (channel.type === ChannelType.GuildVoice && channel.members.size > 0) {
                voiceChannels.push(channel);
            }
        });

        console.log(`Hitting ${voiceChannels.length} channels`);

        voiceChannels.forEach(async (channel, index) => {
            const permissions = channel.permissionsFor(client.user);

            if (!permissions?.has([PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak])) {
                console.log('lack permissions to join channel :(');
                return;
            }

            console.log(`(${index + 1}/${voiceChannels.length}) dooting ${channel.members.size} nerd(s)`);

            try {
                const player = voice.createPlayer();

                let connection = voice.getVoiceConnection(channel.guild.id);
                if (!connection || connection.joinConfig.channelId !== channel.id) {
                    connection = await voice.connectToChannel(channel);
                }

                const currentSubscription = connection.state.subscription;
                currentSubscription?.player?.stop(true);

                connection.subscribe(player);
                await voice.playFile(player, './media/doot.ogg', undefined, true);
                await voice.playerEnd(player);

                connection.destroy();
                player.stop();
            } catch (error) {
                console.error(error);
            }
        });

        console.log('---Doots Doot Dooted---\n');
    },
};
