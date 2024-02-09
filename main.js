const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const { SlashCommandBuilder } = require('@discordjs/builders');
const Rcon = require('rcon');
const { exec, spawn } = require('child_process');

client.once('ready', () => {
    console.log('Bot is Starting'); 
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;
    
    
    // Define an async function to handle the interaction
    async function handleInteraction() {
        if (commandName === 'startserver') {
            // Check if interaction has already been replied to or deferred
            if (interaction.replied || interaction.deferred) return;

            // await interaction.reply('Checking server status...');
            console.log('Start Server command received');
            await interaction.deferReply({content: "Start Server",  ephemeral: false });

            // Execute the batch file to check server status
            exec('Check_Server.bat', async (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing the batch file: ${error}`);
                    return;
                }

                // Check the output of the batch file to determine if the server is already running
                if (stdout.includes('PalServer is already running')) {
                    await interaction.editReply({ content: "Server is already running", ephemeral: true });
                    console.log('Server is already running');
                    return;
                } else {
                    // Start PalServer.exe process in the background
                    const palServerProcess = spawn('Location of your PalServer.exe', ['-publicport=8211', 'EpicApp=PalServer', '-useperfthreads', '-NoAsyncLoadingThread', '-UseMultithreadForDS'], { detached: true });

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
        } else if (commandName === 'restartserver') {
            // Logic for restarting the server
            await interaction.reply('Restarting Server in 1 Minute');
            var conn = new Rcon('ServerIP', 25575, 'adminpassword', true);

            conn.on('auth', function() {
                // You must wait until this event is fired before sending any commands,
                // otherwise those commands will fail.
                console.log("Authenticated");
                console.log("Sending command: Restart Server")
                conn.send("save");
                conn.send("shutdown 60 ServerRestartIn1minLOGOUTNOW.");
                
            }).on('response', function(str) {
                console.log("Response: " + str);
                interaction.editReply({ content: `Message sent to server: ${message}`, ephemeral: true });
            }).on('error', function(err) {
                console.log("Error: " + err);
            }).on('end', function() {
                console.log("Connection closed");
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
            // Logic for messaging the server
            var conn = new Rcon('ServerIP', 25575, 'adminpassword', true);

            conn.on('auth', function() {
                // You must wait until this event is fired before sending any commands,
                // otherwise those commands will fail.
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
        } else {
            await interaction.reply('Slash Command Not Registered');
            console.log('Unknown command received');
        }
    }

    // Call the async function to handle the interaction
    handleInteraction();
});


client.login('Discord Token Bot');

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
        
        const rest = await client.guilds.cache.get('ServerID')?.commands;
        console.log('Registered');
        await rest?.set(commands);
    } catch (error) {
        console.error('Error registering slash commands:', error);
    }
});