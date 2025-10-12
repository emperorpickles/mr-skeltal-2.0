const voice = require('@discordjs/voice');
const { createReadStream } = require('node:fs');

// Default fallbacks so any caller can omit audio args.
const DEFAULT_PATH = './media/doot.ogg';
const DEFAULT_VOLUME = 1;
const MAX_MISSED_FRAMES = Math.round(2_000 / 20); // tolerate ~2s of jitter without disconnecting listeners

/**
 * createPlayer
 * Builds a pre-configured audio player that can withstand network hiccups and stops cleanly
 * when nothing is subscribed. Centralising the constructor keeps everyone on the same settings.
 */
const createPlayer = () =>
    voice.createAudioPlayer({
        behaviors: {
            maxMissedFrames: MAX_MISSED_FRAMES,
            noSubscriber: voice.NoSubscriberBehavior.Stop,
        },
    });

/**
 * createResource
 * Turns a file path into an AudioResource with inline volume control. demuxProbe inspects the stream
 * so we only pipe compatible data (Opus/Vorbis/etc.) to Discord. Callers can override the file path
 * and volume to reuse the same player with different tracks.
 */
const createResource = async (file, vol) => {
    const targetPath = file || DEFAULT_PATH;
    const baseVolume = vol ?? DEFAULT_VOLUME;

    try {
        const stream = createReadStream(targetPath);
        const { stream: probedStream, type } = await voice.demuxProbe(stream);
        const resource = voice.createAudioResource(probedStream, {
            inputType: type,
            inlineVolume: true,
        });

        if (resource.volume) {
            resource.volume.setVolume(baseVolume);
        }

        return resource;
    } catch (error) {
        console.error(`Failed to create audio resource for "${targetPath}"`, error);
        throw error;
    }
};

/**
 * waitForPlayerStart
 * Optionally await the AudioPlayer hitting the Playing state. This helps differentiate between
 * streamer issues and connection issues when debugging, without forcing every caller to wait.
 */
const waitForPlayerStart = async (player) => {
    try {
        await voice.entersState(player, voice.AudioPlayerStatus.Playing, 5e3);
    } catch (error) {
        console.warn('Audio player failed to enter Playing state in time', error);
    }
};

/**
 * playFile
 * Loads the requested track onto the provided player, applies volume overrides, and starts playback.
 * Set waitForStart to true when the caller needs to confirm the player transitioned into Playing
 * (for example, before destroying competing subscriptions).
 */
const playFile = async (player, file, vol, waitForStart = false) => {
    console.debug('Playing a file...');
    const resource = await createResource(file, vol);
    player.play(resource);

    if (waitForStart) {
        await waitForPlayerStart(player);
    }

    return resource;
};

/**
 * playerEnd
 * Returns a promise that resolves the first time a player transitions from Playing to Idle.
 * Useful for awaiting the end of a single track without attaching multiple listeners downstream.
 */
const playerEnd = async (player) => {
    const awaitEnd = new Promise((resolve) => {
        player.once(voice.AudioPlayerStatus.Idle, (oldState, newState) => {
            if (oldState.status === voice.AudioPlayerStatus.Playing && newState.status === voice.AudioPlayerStatus.Idle) {
                resolve();
            }
        });
    });
    return awaitEnd;
};

/**
 * connectToChannel
 * Creates (or replaces) a voice connection to the provided channel and waits for the Ready state
 * so callers can immediately subscribe and start streaming. Half-open connections are destroyed
 * to prevent lingering zombie sessions.
 */
const connectToChannel = async (channel) => {
    const connection = voice.joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });

    try {
        await voice.entersState(connection, voice.VoiceConnectionStatus.Ready, 30e3);
        return connection;
    } catch (error) {
        connection.destroy();
        console.error(`Failed to establish voice connection for guild ${channel.guild.id}`, error);
        throw error;
    }
};

/**
 * connectionEnd
 * Resolves when a connection transitions to the destroyed state. This lets commands race voice
 * teardown against other async events without manually wiring listeners every time.
 */
const connectionEnd = (connection) => {
    const awaitEnd = new Promise((resolve) => {
        connection.on('stateChange', (oldState, newState) => {
            if (newState.status === 'destroyed') {
                resolve('destroyed');
            }
        });
    });
    return awaitEnd;
};

/**
 * getVoiceConnection
 * Convenience wrapper around @discordjs/voice's getVoiceConnection for ease of mocking/testing.
 */
const getVoiceConnection = (guildId) => voice.getVoiceConnection(guildId);

module.exports = {
    createPlayer,
    createResource,
    createOggResource: createResource,
    playFile,
    playerEnd,
    connectToChannel,
    connectionEnd,
    getVoiceConnection,
};
