import sendToWhatsapp from "../services/httpRequest/sendToWhatsApp.js"

class WhatsAppService {
    async sendMessage (to, body, messageId){
        const data ={
            messaging_product: "whatsapp",
            to,
            text: {
                body,
            },
        }
        await sendToWhatsapp(data);
    }

    async markAsRead (messageId){
        const data ={
            messaging_product: "whatsapp",
            status: "read",
            message_id: messageId,
        }
        await sendToWhatsapp(data);
    }

    async sendInteractiveButtons(to, bodyText, buttons){
        const data={
            messaging_product: "whatsapp",
            to,
            type: "interactive",
            interactive: {
                type: "button",
                body: { text: bodyText },
                action: {
                    buttons: buttons,
                },
            },
        }

        await sendToWhatsapp(data);  
    }

    async sendMideaMessage(to, type, mediaUrl, caption){
            const mediaObject = {};

            switch (type) {
                case "image":
                    mediaObject.image = { link: mediaUrl, caption: caption };
                    break;
                case "audio":
                    mediaObject.audio = { link: mediaUrl };
                    break;
                case "video":
                    mediaObject.video = { link: mediaUrl, caption: caption };
                    break;
                case "document":
                    mediaObject.document = { link: mediaUrl, caption: caption, fileName: "merapets.pdf" };
                    break;
                default:
                    throw new Error("Unsupported media type");
            }

            const data = {
                messaging_product: "whatsapp",
                to,
                type: type,
                ...mediaObject
            }
            
            await sendToWhatsapp(data); 
    }

    async sendContactMessage(to, contact){
        const data = {
            messaging_product: "whatsapp",
            to,
            type: "contacts",
            contacts: [contact],
        };
        
        await sendToWhatsapp(data);
         
    }

    async sendLocationMessage(to, location){
       const data ={
        messaging_product: "whatsapp",
        to,
        type: "location",
        location: location
       }
    
       await sendToWhatsapp(data);
    }

}

export default new WhatsAppService();
// Compare this snippet from src/services/messageHandler.js:
