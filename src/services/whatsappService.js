import axios from "axios";
import config from "../config/env.js";

class WhatsAppService {
    async sendMessage (to, body, messageId){
        try {
            await axios({
                method: "POST",
                url: `https://graph.facebook.com/${config.API_VERSION}/${config.BUSINESS_PHONE}/messages`,
                headers: {
                    Authorization: `Bearer ${config.API_TOKEN}`,
                },
                data: {
                    messaging_product: "whatsapp",
                    to,
                    text: { body },
                    
                },
            });
        } catch (error){
            console.error("Error sending message:", error);
        }
    }

    async markAsRead (messageId){
        try {
            await axios({
                method: "POST",
                url: `https://graph.facebook.com/${config.API_VERSION}/${config.BUSINESS_PHONE}/messages`,
                headers: {
                    Authorization: `Bearer ${config.API_TOKEN}`,
                },
                data: {
                    messaging_product: "whatsapp",
                    status: "read",
                    message_id: messageId,
                },
            });
        } catch (error){
            console.error("Error marking message as read:", error);
        }
    }

    async sendInteractiveButtons(to, bodyText, buttons){
        try {
            await axios({
                method: "POST",
                url: `https://graph.facebook.com/${config.API_VERSION}/${config.BUSINESS_PHONE}/messages`,
                headers: {
                    Authorization: `Bearer ${config.API_TOKEN}`,
                },
                data: {
                    messaging_product: "whatsapp",
                    to,
                    type: "interactive",
                    interactive: {
                        type: "button",
                        body: { text: bodyText },
                        action: {
                            buttons:buttons,
                        },
                    },
                },
            });
        } catch (error){
            console.log(error);
            
        }
    }

    async sendMideaMessage(to, type, mediaUrl, caption){
        try{
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

            await axios({
                method: "POST",
                url: `https://graph.facebook.com/${config.API_VERSION}/${config.BUSINESS_PHONE}/messages`,
                headers: {
                    Authorization: `Bearer ${config.API_TOKEN}`,
                },
                data: {
                    messaging_product: "whatsapp",
                    to,
                    type: type,
                    ...mediaObject
                },
            });

        } catch (error){
            console.error("Error sending media message:", error);
        }
    }
}

export default new WhatsAppService();
// Compare this snippet from src/services/messageHandler.js:
