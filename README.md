 <picture>
  <source srcset="https://cdn2.steamgriddb.com/icon/9ce60c64ac4510df68537de96631261f.ico">
</picture>
# A DISCORD BOT FOR PALWORLD DEDICATED SERVER BUILT USING DISCORD.JS
***NOTE: ONLY RUNS ON WINDOWS SERVER ITSELF AS THE SERVER IM USING IS CURRENTLY RUNNING ON WINDOWS***

<picture>
  <source srcset="https://gaming-cdn.com/images/products/8982/616x353/palworld-pc-game-steam-cover.jpg?v=1705942170">
</picture>
FEATURES:
1. Start Server (/startserver) - can start your server by using this slash command (Can't start the server if the server is already running)
2. Status Server (/statusserver) (need help, the rcon to get the playerinfo on the server is not working) - get the player status and others (if i figure out how to fix rcon)
3. Restart Server (/restartserver) - restarts server with 60 seconds and broadcasting it so the players inside the server knows that the server will be restarted
4. Send Message (/sendmessage MESSAGE) - sends message to the server

**USES RCON FOR BROADCAST**

Instructions to run:
1. change the line 41, 57 and 89 according to the location and the IP of your server (including your AdminPassword)
2. change the line 119 and 141 according to your Discord Bot Token and ServerID 
3. run "node main.js"