# Mr. Skeltal 2.0

A modernised rewrite of the original Mr. Skeltal Discord bot that embraces slash commands, the latest Discord gateway intents, and reliable voice playback.

## Features
- Surprise “big doot” sweeps that periodically visit every populated voice channel.
- `/doot` and `/spoopy` slash commands (legacy prefix commands still work for nostalgia).
- Robust audio pipeline with format probing, jitter tolerance, and automatic cleanup.
- Local media assets so gifs and sound effects never depend on third‑party hosting.

## Commands
| Command | Type | Description |
| --- | --- | --- |
| `/doot` / `!doot` | Slash & Prefix | Joins the caller’s voice channel, plays the classic doot, then leaves. |
| `/spoopy` / `!spoopy` | Slash & Prefix | Plays a backing track while posting the dancing skeleton gif. |

## Requirements
- Node.js 24
- FFmpeg available on `PATH`
- Discord application with the following privileged intents enabled:
  - **Server Members** (for voice channel member counts)
  - **Presence** (optional, but useful for telemetry)
  - **Message Content** (only needed if you keep the legacy prefix commands)

## Configuration
Create a `.env` file (or set environment variables) with:

```
BOT_TOKEN=your_bot_token_here
DOOT_CHANCE=0.25       # Probability (0-1) a scheduled roll triggers a big doot
DOOT_FREQ=20           # Minutes between scheduled big doot rolls
```

## First Run
```bash
npm install
node index.js
```

You should see console output confirming login, guild count, and the active doot schedule. Trigger `/doot` in a voice-enabled guild to verify audio playback.

## Development Notes
- Voice playback uses the `GatewayIntentBits.GuildVoiceStates` intent; ensure it is toggled on in the Discord developer portal.
- Commands auto-register from `./commands`. Add a new file exporting `{ data, execute }`, then restart the bot to pick it up.
- Audio helpers live in `services/voiceManager.js` and centralise probing, volume control, and connection management for easy reuse.
