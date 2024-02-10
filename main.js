// Changes: added /killserver and fixes for restarting the server where it doesn't restart as intended.
// Changes: added a permanent var conn as it will be used to connect and send command to the RCON, its not efficient to put it every statement
// Changes: added variable to PalServerLocation, PalServerIP, PalServerPass, ServerID and DiscordToken on top so you can just change the variable there
// Changes: added /hello for the details of slash commands 
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const { SlashCommandBuilder } = require('@discordjs/builders');
const Rcon = require('rcon');
const { exec, spawn } = require('child_process');
const PalServerLocation = ""; //use double backslash for every backslash
const PalServerIP = ''; // can be 127.0.0.1 (recommended to run this on another server so that you know whether your server is acting something up or not)
const PalServerPass = ''; // admin password to connect to your server using rcon
const ServerID = ''; // can be found at your server
const DiscordToken = ""; // Your Discord Token

client.once('ready', () => {
    console.log('Bot is Starting'); 
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    var conn = new Rcon(PalServerIP, 25575, PalServerPass, true);
    const { commandName, options } = interaction;
    
    // Define an async function to handle the interaction
    async function handleInteraction() {
        if (commandName === 'startserver') {
            // Check if interaction has already been replied to or deferred
            if (interaction.replied || interaction.deferred) return;

            console.log('Start Server command received');
            await interaction.deferReply({content: "Starting Server",  ephemeral: false });
            await interaction.editReply({content: "Checking server status...", ephemeral: true});

            // Execute the batch file to check server status
            exec('Check_Server.bat', async (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing the batch file: ${error}`);
                    await interaction.editReply({content: "Check Server failed", ephemeral: false});
                    return;
                }

                // Check the output of the batch file to determine if the server is already running
                if (stdout.includes('PalServer is already running')) {
                    await interaction.editReply({ content: "Server is already running", ephemeral: true });
                    console.log('Server is already running');
                    return;
                } else {
                    // Start PalServer.exe process in the background
                    const palServerProcess = spawn(PalServerLocation, ['-publicport=8211', 'EpicApp=PalServer', '-useperfthreads', '-NoAsyncLoadingThread', '-UseMultithreadForDS'], { detached: true });
                    palServerProcess.unref(); // Detach the child process from the parent
                    await interaction.editReply({ content: "Server started successfully", ephemeral: true });
                    console.log('Server started successfully');
                    return;
                }
            });
            return;
        } else if (commandName === 'statusserver') {
            // Logic for checking server status
            await interaction.reply('Server Status not implemented yet');
            console.log("Server Status not implemented yet");
        } else if (commandName === 'restartserver') {
            // Logic for restarting the server
            await interaction.reply('Restarting Server in 1 Minute');

            conn.on('auth', function() {
                // You must wait until this event is fired before sending any commands,
                // otherwise those commands will fail.
                console.log("Authenticated");
                console.log("Sending command: Restart Server")
                conn.send("save");
                conn.send("shutdown 60 ServerRestartIn1minLOGOUTNOW.");
                // CHANGE: Added here to be executed along the save and shutdown command
                interaction.editReply({ content: `Restart Server sent to server: ${message}`, ephemeral: true });
                
            }).on('response', function(str) {
                console.log("Response: " + str);
            }).on('error', function(err) {
                console.log("Error: " + err);
            }).on('end', function() {
                // CHANGE: Added Server Startup when the connection has been close with the RCON 
                console.log("Connection closed, Starting Server");
                const palServerProcess = spawn(PalServerLocation, ['-publicport=8211', 'EpicApp=PalServer', '-useperfthreads', '-NoAsyncLoadingThread', '-UseMultithreadForDS'], { detached: true });
                palServerProcess.unref(); // Detach the child process from the parent
                console.log('Server started successfully');
            });

            conn.connect();
        } else if (commandName === 'sendmessage') {
            // Check if interaction has already been replied to or deferred
            if (interaction.replied || interaction.deferred) return;
            const message = options.getString('message');

            if (!message) {
                await interaction.reply({ content: "Please provide a message to send.", ephemeral: true });
                return;
            }
            await interaction.deferReply({ content: "Sending message to server...", ephemeral: true });
            
            conn.on('auth', function() {
                console.log("Authenticated");
                console.log("Sending command: Broadcast")
                conn.send(`broadcast ${message}`);
            }).on('response', function(str) {
                console.log("Response: " + str);
                interaction.editReply({ content: `Message sent to server: ${message}`, ephemeral: true });
            }).on('error', function(err) {
                console.log("Error: " + err);
            }).on('end', function() {
                console.log("Connection closed");
            });

            conn.connect();
            await interaction.editReply('Message Sent to the server');
        } else if (commandName === 'killserver') {
            if (interaction.replied || interaction.deferred) return;
            await interaction.deferReply({ content: "Shutting down Server...", ephemeral: true });

            conn.on('auth', function() {
                // You must wait until this event is fired before sending any commands,
                // otherwise those commands will fail.
                console.log("Authenticated");
                console.log("Sending command: Kill Server")
                conn.send(`save`);
                conn.send(`shutdown 60 ServerRestartIn1minLOGOUTNOW.`);
            }).on('response', function(str) {
                console.log("Response: " + str);
                interaction.editReply({ content: `Message sent to server: ${message}`, ephemeral: true });
            }).on('error', function(err) {
                console.log("Error: " + err);
            }).on('end', function() {
                console.log("Connection closed");
            });
            await interaction.editReply({content: "Server has been shut down successfully", ephemeral: true});
        } else if (commandName === 'hello') {
            await interaction.reply("This bot serves as the remote control of the Palworld Server. This includes /startserver, /statusserver (currently not working), /restartserver, /sendmessage and /killserver");
            await interaction.followUp("/startserver - can start or check the server status if its up or not");
            await interaction.followUp("/statusserver - not currently working but this should get all the player name thats currently on the server");
            await interaction.followUp("/restartserver - will restart the server with 1 minute delay and will broadcast the shutdownin1min message to the server");
            await interaction.followUp("/sendmessage {message} - will send the message to the player inside the server");
            await interaction.followUp("/killserver - will kill the server within 30 secs and broadcast it to the server ");
        } else {
            await interaction.reply('Slash Command Not Registered');
            console.log('Unknown command received');
        }
    }

    // Call the async function to handle the interaction
    handleInteraction();
});


client.login(DiscordToken);

// Register slash commands
client.once('ready', async () => {
    try {
        console.log('Registering Commands');
        const commands = [
            new SlashCommandBuilder()
                .setName('startserver')
                .setDescription('Start the server'),
            new SlashCommandBuilder()
                .setName('statusserver')
                .setDescription('Check server status'),
            new SlashCommandBuilder()
                .setName('restartserver')
                .setDescription('Restart the server'),
            new SlashCommandBuilder()
                .setName('sendmessage')
                .setDescription('Send a message to the server')
                .addStringOption(option => option.setName('message').setDescription('Message that you want to send to the server, NO SPACE ONLY UNDERSCORE').setRequired(true))
        ];
        
        const rest = await client.guilds.cache.get(ServerID)?.commands;
        console.log('Registered');
        await rest?.set(commands);
    } catch (error) {
        console.error('Error registering slash commands:', error);
    }
});