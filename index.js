const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const moment = require('moment-timezone');
const colors = require('colors');
const fs = require('fs');
const Versiculo = require('./functions/bible.js')


const client = new Client({
    restartOnAuthFail: true,
    puppeteer: {
        ignoreHTTPSErrors:true,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    },
    ffmpeg: './ffmpeg.exe',
    authStrategy: new LocalAuth({ clientId: "client" })
});
const config = require('./config/config.json');

client.on('qr', (qr) => {
    console.log(`[${moment().tz(config.timezone).format('HH:mm:ss')}] Scan the QR below : `);
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.clear();
    const consoleText = './config/console.txt';
    fs.readFile(consoleText, 'utf-8', (err, data) => {
        if (err) {
            console.log(`[${moment().tz(config.timezone).format('HH:mm:ss')}] Console Text not found!`.yellow);
            console.log(`[${moment().tz(config.timezone).format('HH:mm:ss')}] ${config.name} is Already!`.green);
        } else {
            console.log(data.green);
            console.log(`[${moment().tz(config.timezone).format('HH:mm:ss')}] ${config.name} is Already!`.green);
        }
    });
});

client.on('message', async (message) => {
    const numeroFormatado = await ((await message.getContact()).getFormattedNumber());
    const isGroups = message.from.endsWith('@g.us') ? true : false;
    // if(numeroFormatado!=config.numero_dono&&message.body.startsWith(config.prefix)){
    //     client.sendMessage(message.from, "EM MANUTENÇÃO, PORFAVOR AGUARDE.")
    //     return;
    // }
    if ((isGroups && config.groups) || !isGroups) {
        // Image to Sticker (Auto && Caption)
        if ((message.type == "image" || message.type == "video" || message.type == "gif") && (message._data.caption == `${config.prefix}f`)) {
            message.react("⏳");
            try {
                const media = await message.downloadMedia();
                client.sendMessage(message.from, media, {
                    sendMediaAsSticker: true,
                    stickerName: config.name, // Sticker Name = Edit in 'config/config.json'
                    stickerAuthor: config.author // Sticker Author = Edit in 'config/config.json'
                }).then(() => {
                    message.react("✅")
                });
            } catch {
                message.react("❌")
                client.sendMessage(message.from, "Erro ao fazer figurinha ☹");
            }

            // Image to Sticker (With Reply Image)
        } else if 
        (message.body.startsWith(`${config.prefix}reiniciar`)){
            if(numeroFormatado!=config.numero_dono){
                message.react("❓")
               await client.sendMessage(message.from,"Você não tem permissão para executar esse comando.") 
                return;
            }
            
            message.reply("Reiniciando bot...")
            message.react("🔄")
            console.log("Reiniciando bot");
            //aguardar 1 segundo e matar o próprio processo
            setTimeout(() => {
                process.exit(1);
            }, 1000); 
            

          
        }else if
        (message.body == `${config.prefix}f`) {
            const quotedMsg = await message.getQuotedMessage();
            if (message.hasQuotedMsg && quotedMsg.hasMedia) {
                message.react("⏳");
                try {
                    const media = await quotedMsg.downloadMedia();
                    client.sendMessage(message.from, media, {

                        sendMediaAsSticker: true,
                        stickerName: config.name, // Sticker Name = Edit in 'config/config.json'
                        stickerAuthor: config.author // Sticker Author = Edit in 'config/config.json'
                    }).then(() => {
                        message.react("✅");
                    });
                } catch {
                    client.sendMessage(message.from, "Erro ao fazer figurinha ☹");
                }
            } else {
                client.sendMessage(message.from, "Envie uma imagem primeiro!");
            }

            // Sticker to Image (Auto)
        }  else if (message.body == `${config.prefix}imagem`) {
            
            
            const quotedMsg = await message.getQuotedMessage();
            
            if (message.hasQuotedMsg && quotedMsg.hasMedia) {
           
                message.react("⏳");
                try {
                    let media = null;
                    try {
                        media = await quotedMsg.downloadMedia()
                    if(!media.mimetype.startsWith("image/webp")){
                        message.react("❌");
                        client.sendMessage(message.from,"Este comando serve apenas para figurinhas.");
                        return;
                    }
                        console.log(`Tipo de midia é ${media.mimetype}`)             
                    } catch (error) {
                        client.sendMessage(message.from, "Erro ao converter a mídia!");
                        message.react("❌");    
                    }
                    if (media!=null) {
                        client.sendMessage(message.from, media,{}).then(() => {
                            message.react("✅");
                          });
                    }
                   
                  } catch (error) {
                    client.sendMessage(message.from, "Erro ao converter a mídia!");
                    message.react("❌");
                  }
            } else {
                message.react("❓");
                client.sendMessage(message.from, "Responda a uma figurinha!");
            }
            
            // Claim or change sticker name and sticker author
        } else if (message.body.startsWith(`${config.prefix}change`)) {
            if (message.body.includes('|')) {
                let name = message.body.split('|')[0].replace(message.body.split(' ')[0], '').trim();
                let author = message.body.split('|')[1].trim();
                const quotedMsg = await message.getQuotedMessage();
                if (message.hasQuotedMsg && quotedMsg.hasMedia) {
                    message.react("⏳");
                    try {
                        const media = await quotedMsg.downloadMedia();
                        client.sendMessage(message.from, media, {
                            sendMediaAsSticker: true,
                            stickerName: name,
                            stickerAuthor: author
                        }).then(() => {
                            message.react("✅");
                        });
                    } catch {
                        message.react("❌");
                    }
                } else {
                    message.react("❓");
                }
            } else {
                client.sendMessage(message.from, `Use o comando deste jeito :\n*${config.prefix}change <nome> | <autor>*`);
            }
        } else if(message.body.startsWith(`${config.prefix}paz`)){
            const versiculo =await Versiculo.getVersiculo();
            client.sendMessage(message.from, versiculo);

        } else {
            client.getChatById(message.id.remote).then(async (chat) => {
                await chat.sendSeen();
            });
        }
    }
});

client.initialize();
