require('dotenv').config();
const { REST, Routes } = require('discord.js');

const commands = [
    {
        name: 'startserver',
        description: 'Will try to start the server remotely',
    },
    {
        name: 'statusserver',
        description: 'Check if the server is up or not',
    },
    {
        name: 'restartserver',
        description: 'Restarts The Server',
    },
]

const rest = new REST ({ version: '10'}).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Registering slash commands...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, 
                process.env.GUILD_ID),
            { body: commands }
        )

        console.log('Slash Commands Registered Successful');
    } catch (error) {
        console.log('There was an error: ${error');
    }
})