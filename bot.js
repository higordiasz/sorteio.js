const Discord = require('discord.js');
const config = require('./json/config.json')
const token = require('./json/token.json')
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Conectado como: ${client.user.tag}`);
})

client.on('message', async msg => {
    if (msg.author.bot) return;
    if (msg.channel.type == 'dm') return;
    if (!msg.content.startsWith(config.prefix)) return;
    const args = msg.content.slice(config.prefix.length).trim().split(/ +/g);
    const comando = args.shift().toLowerCase();

    if (comando == 'sorteio') {
        if (!msg.member.hasPermission('ADMINISTRATOR')) return;
        var regra = /^[0-9]+$/;
        if (!args[0].match(regra)) return;
        if (args[0] < 1) return;
        let owner = msg.author;
        let timer = args[0]
        args.shift()
        let premio = args.join(" ")
        if (premio == "") return;
        let embed = new Discord.MessageEmbed()
            .setAuthor(owner.tag, owner.displayAvatarURL({ format: 'png' }))
            .setColor('#ff0000')
            .setDescription(`Reaja a essa mensagem com 🎁 para participar do sorteio!!`)
            .addFields(
                { name: "Autor", value: `${owner}`, inline: true },
                { name: "Prêmio", value: `${premio}`, inline: true },
                { name: "Tempo", value: `${timer}min`, inline: true }
            )
            .setThumbnail(owner.displayAvatarURL({ format: 'png' }))
            .setTitle('Sorteio!!')
            .setFooter(`Sorteio oferecido pelo usuário: ${owner.tag}`);
        let message = await msg.channel.send(embed)
        let reactions = ['🎁']
        let participantes = []
        await message.react(reactions[0])
        const filter = (reaction) => reactions.includes(reaction.emoji.name);
        const collector = message.createReactionCollector(filter, { time: timer * 1000 * 60, dispose: true })

        collector.on('collect', async (emoji, user) => {
            switch (emoji._emoji.name) {
                case reactions[0]:
                    participantes.push(user.id)
                    break;
                default:
                    break;
            }
        })

        collector.on('dispose', async (emoji, user) => {
            switch (emoji._emoji.name) {
                case reactions[0]:
                    let index = participantes.indexOf(user.id)
                    if (index > -1) {
                        participantes.splice(index, 1)
                    }
                    break;
                default:
                    break;
            }
        })

        collector.on('end', async (emoji, user) => {
            if (!participantes.length == 0) {
                let n = Math.floor(Math.random() * (participantes.length))
                let winnerID = participantes[n];
                let winner = await msg.guild.members.fetch(winnerID)
                let endmessage = new Discord.MessageEmbed()
                    .setAuthor(winner.user.tag, winner.user.displayAvatarURL({ format: 'png' }))
                    .setColor('#ff0000')
                    .setDescription(`Vencedor do sorteio: ${winner.user.tag}`)
                    .addFields(
                        { name: "Autor", value: `${owner}`, inline: true },
                        { name: "Prêmio", value: `${premio}`, inline: true },
                        { name: "Ganhador", value: `${winner.user}`, inline: true }
                    )
                    .setThumbnail(winner.user.displayAvatarURL({ format: 'png' }))
                    .setTitle('Sorteio Encerrado!!')
                    .setFooter(`Sorteio oferecido pelo usuário: ${owner.tag}`);
                await msg.channel.send(winner.user, endmessage)
                message.delete();
            } else {
                let endmessage = new Discord.MessageEmbed()
                    .setAuthor(owner.tag, owner.displayAvatarURL({ format: 'png' }))
                    .setColor('#ff0000')
                    .setDescription(`Nâo teve participantes no torneio.`)
                    .addFields(
                        { name: "Autor", value: `${owner}`, inline: true },
                        { name: "Prêmio", value: `${premio}`, inline: true },
                        { name: "Ganhador", value: `Não Teve`, inline: true }
                    )
                    .setThumbnail(owner.displayAvatarURL({ format: 'png' }))
                    .setTitle('Sorteio Encerrado!!')
                    .setFooter(`Sorteio oferecido pelo usuário: ${owner.tag}`);
                await msg.channel.send(endmessage)
                message.delete();
            }
        })
    }

})

client.login(token.token);