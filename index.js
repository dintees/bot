var Discord = require('discord.js');
var bot = new Discord.Client();

var prefix = "!";

const ytdl = require('ytdl-core');
const search = require("yt-search");

var servers = {};

bot.on("ready", () => {
    console.log("I am online");
    bot.user.setActivity('Zenka Martyniuka', { type: "LISTENING" })
})

bot.on('guildMemberAdd', member => {
    const channel = member.guild.channels.cache.find(ch => ch.name === 'portiernia');
    if (!channel) return;
    setTimeout(() => {
        channel.send(`${member}, witaj na serwerze!\nCzuj się jak u siebie w domu ;-) Oczekuj na zaproszenie na kanale \`@REJESTRACJA\`. Pozdrawiam. Administrator B`);
    }, 1000)
});

bot.on("guildMemberRemove", member => {
    const channel = member.guild.channels.cache.find(ch => ch.name === 'portiernia');
    if (!channel) return;
    channel.send(`Do zobaczenia ${member}!`);
})

bot.on("guildMemberUpdate", (oldMember, newMember) => {
    var channel = oldMember.guild.channels.cache.find(r => r.name === 'ogólny');
    if (!channel) console.log("Channel doesn't exist");
    // console.log(newMember.roles.member._roles)

    if (oldMember.roles.member._roles.length < newMember.roles.member._roles.length) {
        let oldRoles = oldMember.roles.member._roles
        let newRoles = newMember.roles.member._roles

        for (let i = 0; i < newRoles.length; i++) {
            for (let j = 0; j < oldRoles.length; j++) {
                if (oldRoles[j] == newRoles[i]) {
                    newRoles.splice(i, 1);
                }
            }
        }

        let newRolesId = newRoles[0]
        let nameOfRole = newMember.roles.cache.find(r => r.id = newRolesId)

        if (nameOfRole.name == "Użytkownik")
            channel.send(`Cześć ${newMember}!\nTo jest Twój kanał. Rozgość się ;-). Znajduje się tu dużo ciekawych rzeczy ;-). Ta wiadomość zniknie za 10 minut, żeby nie zaśmiecać kanału.`);

        // const embed = new Discord.RichEmbed()
        // .setColor('ORANGE')
        // .setTimestamp()
        // .setAuthor('Bartłomiej')
        // .addField(`📎 Member:`, `${oldMember.user.tag} (${oldMember.id})`);
        // .setThumbnail(bot.user.avatarURL())
        // for (const role of newMember.roles.map(x => x.id)) {
        //     if (!oldMember.roles.has(role)) {
        //         embed.addField(`📥 Role(s):`, `${oldMember.guild.roles.get(role).name}`);
        //     }
        // }
        // messagechannel.send({
        //     embed
        // });
    }
})


bot.on("message", msg => {

    let args = msg.content.substring(prefix.length).split(" ");

    // if (msg.member.user.username == "Freeby") {
    //     msg.delete({ timeout: 100 })
    //     return;
    // }

    if (msg.member.user.username == "Frooby" && msg.content.search("To jest Twój kanał. Rozgość się.") != -1) {
        msg.delete({ timeout: 10 * 60 * 1000 })
        return;
    }

    if (msg.content[0] != prefix) return;

    switch (args[0]) {
        case "hello":
            msg.delete({ timeout: 3000 })
            msg.reply("Hello!").then(d => d.delete({ timeout: 3000 }));
            break;
        case "weather":
            msg.reply(":sunny: The weather is nice today. And you?");
            break;
        case "help":
            var e = new Discord.MessageEmbed();
            e.setTitle("Help box")
            e.addField("General", "`join` - use this command to attach this bot to a channel\n`leave` - use this command to get the bot out of the channel")
            e.addField("Music control", "`play` - use this command to play the music. Use the YouTube link or title as a second argument\n`stop` - use this command to stop music and clear playlist\n`pause` - use this command to pause the song\n`resume` - use this command to resume the song\n`skip` - use this command to skip the music\n`queue` - use this command to enable / disable queue\n`np` - use this command to list the queue\n`remove` - use this command with the song index you want to remove from the playlist\n`volume` - use this command to see volume level or set it");
            e.addField("Other", "`prefix` - use this command to see current prefix or to set it");
            e.setThumbnail(bot.user.avatarURL())
            e.setFooter("I wish you a pleasant use. Regards. Administrator B");
            e.setColor(0x339bff);
            msg.channel.send(e);
            break;
        case "join":
            if (msg.member.voice.channel.id !== msg.guild.me.voice.channelID && msg.guild.me.voice.channelID) {
                msg.react('❌');
                var e = new Discord.MessageEmbed();
                e.setColor(0xff0000);
                e.setDescription("I am already being used by another user")
                msg.channel.send(e);
                return;
            }
            if (msg.member.voice.channel) {
                if (!msg.guild.voiceConnection) {
                    msg.member.voice.channel.join().then(() => {
                        msg.channel.send("***:hand_splayed: Hello everyone!***")
                    })
                }
            }
            else {
                msg.channel.send("Error")
            }
            break;
        case "leave":
            if (msg.member.voice.channel.id !== msg.guild.me.voice.channelID && msg.guild.me.voice.channelID) {
                msg.react('❌');
                var e = new Discord.MessageEmbed();
                e.setColor(0xff0000);
                e.setDescription("I am already being used by another user")
                msg.channel.send(e);
                return;
            }
            if (!msg.guild.voiceConnection) {
                try {
                    msg.member.voice.channel.leave();
                    msg.channel.send("***:hand_splayed: Bye!***");
                } catch {
                    msg.channel.send(":exclamation: Something went wrong.");
                }
            }
            break;
        case "prefix":
            if (!args[1]) return msg.channel.send("Current prefix is: `" + prefix + "`")
            if (msg.member.hasPermission("ADMINISTRATOR")) {
                prefix = args[1][0];
                msg.channel.send("Set prefix: Currently is: `" + prefix + "`")
            } else {
                msg.reply(":exclamation: ***You don't have permiossion to change prefix.***")
            }
            break;
        case "queue":
            var server = servers[msg.guild.id];
            if (server && server.dispatcher) {
                server.queued = !server.queued
                var e = new Discord.MessageEmbed();
                e.setColor(0x339bff);
                e.setDescription("Looping is now " + (server.queued ? "**enabled**" : "**disabled**"));
                msg.channel.send(e)
            }
            break;
        case "play":
            if (!msg.member.roles.cache.find(r => r.name === 'DJ') && !msg.member.hasPermission("ADMINISTRATOR")) {
                var e = new Discord.MessageEmbed();
                msg.react('❌');
                e.setDescription("***:x: You don't have any permissions to do it.***")
                return msg.channel.send(e);
            }
            if (!args[1]) {
                msg.react('❌');
                msg.channel.send("***You didn't tell me what to play.***");
                return;
            }
            if (!msg.member.voice.channel) {
                msg.react('❌');
                msg.channel.send("***Please connect to a voice channel first***");
                return;
            }
            if (msg.member.voice.channel.id !== msg.guild.me.voice.channelID && msg.guild.me.voice.channelID) {
                msg.react('❌');
                var e = new Discord.MessageEmbed();
                e.setColor(0xff0000);
                e.setDescription("I am already being used by another user")
                msg.channel.send(e);
                return;
            }
            if (!servers[msg.guild.id]) {
                servers[msg.guild.id] = {
                    queue: [],
                    volume: 1,
                    queued: false
                }
            }
            var server = servers[msg.guild.id];

            let title = "";
            for (let i = 1; i < args.length; i++) {
                title += args[i] + " ";
            }

            search(title, function (err, res) {
                try {
                    let m = res.videos.slice(0, 1)[0];
                    // console.log(m);
                    msg.react('👍');
                    var e = new Discord.MessageEmbed();
                    e.setTitle(":play_pause: " + m.title + " / *" + m.timestamp + "*");
                    e.setColor(0xFF0000);
                    e.setDescription((m.url))
                    e.setFooter("Added by " + (msg.member.nickname == null ? msg.member.user.username : msg.member.nickname))
                    msg.channel.send(e);

                    if (ytdl.validateURL(m.url)) {
                        server.queue.push({ title: m.title, url: m.url });
                        if (server.dispatcher == null) {
                            if (!msg.guild.voiceConnection) {
                                msg.member.voice.channel.join().then(connection => {
                                    play(connection, msg);
                                })
                            }
                        } else {
                            msg.channel.send("Added to the playlist. All in all: ***" + server.queue.length + " songs***")
                        }

                    }
                } catch {
                    msg.channel.send("***:exclamation: No such song found***");
                }
            })
            break;
        case "stop":
            if (!msg.member.roles.cache.find(r => r.name === 'DJ') && !msg.member.hasPermission("ADMINISTRATOR")) {
                var e = new Discord.MessageEmbed();
                msg.react('❌');
                e.setDescription("***:x: You don't have any permissions to do it.***")
                return msg.channel.send(e);
            }
            if (msg.member.voice.channel.id !== msg.guild.me.voice.channelID && msg.guild.me.voice.channelID) {
                msg.react('❌');
                var e = new Discord.MessageEmbed();
                e.setColor(0xff0000);
                e.setDescription("I am already being used by another user")
                msg.channel.send(e);
                return;
            }
            var server = servers[msg.guild.id];
            if (server) {
                server.queue = []
                if (server && server.dispatcher) {
                    server.dispatcher.end();
                    delete (server.dispatcher)
                    msg.channel.send(":stop_button: ***Stopped!***");
                    if (msg.guild.connection) msg.guild.voiceConnection.disconnect();
                }
            } else {
                msg.channel.send("***:x: Currently no music is being played***");
            }
            break;
        case "pause":
            if (msg.member.voice.channel.id !== msg.guild.me.voice.channelID && msg.guild.me.voice.channelID) {
                msg.react('❌');
                var e = new Discord.MessageEmbed();
                e.setColor(0xff0000);
                e.setDescription("I am already being used by another user")
                msg.channel.send(e);
                return;
            }
            var server = servers[msg.guild.id];
            if (server && server.dispatcher) {
                if (!server.dispatcher.paused) {
                    server.dispatcher.pause();
                    msg.react('👌')
                } else {
                    var e = new Discord.MessageEmbed();
                    e.setDescription("The music is already paused");
                    e.setColor(0xff0000)
                    msg.channel.send(e)
                }
            }
            break;
        case "resume":
            if (msg.member.voice.channel.id !== msg.guild.me.voice.channelID && msg.guild.me.voice.channelID) {
                msg.react('❌');
                var e = new Discord.MessageEmbed();
                e.setColor(0xff0000);
                e.setDescription("I am already being used by another user")
                msg.channel.send(e);
                return;
            }
            var server = servers[msg.guild.id];
            if (server && server.dispatcher) {
                if (server.dispatcher.paused) {
                    server.dispatcher.resume();
                    msg.react('👌')
                }
                else {
                    var e = new Discord.MessageEmbed();
                    e.setDescription("The music is already resumed");
                    e.setColor(0xff0000)
                    msg.channel.send(e)
                }
            }
            break;
        case "skip":
            if (msg.member.voice.channel.id !== msg.guild.me.voice.channelID && msg.guild.me.voice.channelID) {
                msg.react('❌');
                var e = new Discord.MessageEmbed();
                e.setColor(0xff0000);
                e.setDescription("I am already being used by another user")
                msg.channel.send(e);
                return;
            }
            if (!msg.member.roles.cache.find(r => r.name === 'DJ') && !msg.member.hasPermission("ADMINISTRATOR")) {
                var e = new Discord.MessageEmbed();
                msg.react('❌');
                e.setDescription("***:x: You don't have any permissions to do it.***")
                return msg.channel.send(e);
            }
            // if (!msg.member.roles.cache.find(r => r.name === "Der Verwalter")) return msg.channel.send("You don't have any permissions to do it");
            var server = servers[msg.guild.id];
            if (server && server.dispatcher) {
                if (server.queued) server.queue.shift();
                server.dispatcher.end();
            }
            msg.channel.send("***:fast_forward: Skipped!***");
            break;
        case "np":
            if (msg.member.voice.channel.id !== msg.guild.me.voice.channelID && msg.guild.me.voice.channelID) {
                msg.react('❌');
                var e = new Discord.MessageEmbed();
                e.setColor(0xff0000);
                e.setDescription("I am already being used by another user")
                msg.channel.send(e);
                return;
            }
            var server = servers[msg.guild.id];
            if (server && server.queue.length > 0) {
                var e = new Discord.MessageEmbed();
                e.setTitle("Queue list")
                let str = "";
                for (let i = 1; i < server.queue.length; i++) {
                    str += `#${i} - ${server.queue[i].title}\n`;
                }
                e.setDescription(str);
                msg.channel.send(e)
            } else {
                var e = new Discord.MessageEmbed();
                e.setColor(0xff0000)
                e.setDescription(":exclamation: There is no song in the queue");
                msg.channel.send(e)
            }
            break;
        case "remove":
            if (msg.member.voice.channel.id !== msg.guild.me.voice.channelID && msg.guild.me.voice.channelID) {
                msg.react('❌');
                var e = new Discord.MessageEmbed();
                e.setColor(0xff0000);
                e.setDescription("I am already being used by another user")
                msg.channel.send(e);
                return;
            }
            if (!msg.member.roles.cache.find(r => r.name === 'DJ') && !msg.member.hasPermission("ADMINISTRATOR")) {
                var e = new Discord.MessageEmbed();
                msg.react('❌');
                e.setDescription("***:x: You don't have any permissions to do it.***")
                return msg.channel.send(e);
            }
            if (!args[1]) {
                var e = new Discord.MessageEmbed();
                e.setDescription(":exclamation: This command requires a second argument");
                return msg.channel.send(e);
            }
            var server = servers[msg.guild.id];
            if (!isNaN(parseInt(args[1]))) {
                if (server && server.queue.length > parseInt(args[1]) && parseInt(args[1]) > 0) {
                    server.queue.splice(parseInt(args[1]), 1);
                    msg.react('👌')
                } else {
                    var e = new Discord.MessageEmbed();
                    e.setColor(0xff0000)
                    e.setDescription(":exclamation: Wrong number");
                    msg.channel.send(e)
                }
            } else {
                var e = new Discord.MessageEmbed();
                e.setColor(0xff0000)
                e.setDescription(":exclamation: Wrong number");
                msg.channel.send(e)
            }
            break;
        case "checkRole":
            var e = new Discord.MessageEmbed();
            if (!msg.member.hasPermission("ADMINISTRATOR")) {
                msg.react('❌');
                e.setDescription("***:x: You don't have any permissions to do it.***")
                return msg.channel.send(e);
            }
            let role = msg.guild.roles.cache.find(r => r.name == args[1])
            if (role) {
                let usersWithRole = role.members.map(m => m.user.username)
                let str = '';
                e.setTitle("Users with role " + args[1])
                e.setTimestamp();
                e.setColor(0x339bff)
                for (let i = 0; i < usersWithRole.length; i++) {
                    str += ` - ${usersWithRole[i]}\n`;
                }
                e.setDescription(str);
                msg.channel.send(e);
            }
            break;
        case "volume":
            if (msg.member.voice.channel.id !== msg.guild.me.voice.channelID && msg.guild.me.voice.channelID) {
                msg.react('❌');
                var e = new Discord.MessageEmbed();
                e.setColor(0xff0000);
                e.setDescription("I am already being used by another user")
                msg.channel.send(e);
                return;
            }
            if (!msg.member.roles.cache.find(r => r.name === 'DJ') && !msg.member.hasPermission("ADMINISTRATOR")) {
                var e = new Discord.MessageEmbed();
                msg.react('❌');
                e.setDescription("***:x: You don't have any permissions to do it.***")
                return msg.channel.send(e);
            }
            var server = servers[msg.guild.id];
            if (server) {
                if (!args[1]) msg.channel.send("Current volume: ***" + server.volume * 100 + "%***");
                else {
                    if (isNaN(Number(args[1]))) {
                        msg.channel.send(":thinking: ***You thought you were smarter than me!***");
                        return;
                    }
                    if (Number(args[1]) < 0 || Number(args[1] > 200)) msg.channel.send(":exclamation: ***Bad volume. Use the numbers between 0 and 200***");
                    else {
                        server.volume = parseInt(args[1]) / 100;
                        server.dispatcher.setVolume(parseInt(args[1]) / 100);
                        msg.channel.send("Changed volume to ***" + parseInt(args[1]) + "%***");
                    }
                }
            }
            else {
                msg.react('❌');
                msg.channel.send("***Music is not currently playing.***");
            }
            break;
        case "restartServer":
            var embed = new Discord.MessageEmbed();
            if (!msg.member.hasPermission("ADMINISTRATOR")) {
                msg.react('❌');
                embed.setDescription("***:x: You don't have any permissions to do it.***")
                return msg.channel.send(embed);
            }
            msg.delete();
            servers = {};
            embed.setDescription(":white_check_mark: Server has been restarted!")
            embed.setColor("green");
            msg.channel.send(embed)
            break;
    }
})

function play(connection, message) {
    var server = servers[message.guild.id];
    var stream = ytdl(server.queue[0].url, { filter: 'audioonly' })
    server.dispatcher = connection.play(stream)
        .on("finish", () => {
            if (server.queued == false)
                server.queue.shift();
            if (server.queue[0]) {
                play(connection, message);
            } else {
                connection.disconnect();
                delete (server.dispatcher)
                // message.member.voice.channel.leave()
            }
        })
}

bot.login(process.env.BOT_TOKEN);
