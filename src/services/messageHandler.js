import whatsappService from "./whatsappService.js";

class MessageHandler {
    async handleIncomingMessage(message, senderInfo) {
        if(message?.type === 'text') {
            const incomingMessage = message.text.body.toLowerCase().trim();

            if (this.isGreeting(incomingMessage)) {
                await this.sendWellcomeMessage(message.from, message.id, senderInfo);
                await this.sendWellcomeMenu(message.from);
                return;
            } else if(incomingMessage === 'media'){
                await this.sendMedia(message.from);
                return;

            } else{
                const response = `echo ${message.text.body}`;
                await whatsappService.sendMessage(message.from, response, message.id);
                await whatsappService.markAsRead(message.id);
            } 
            
        }else if(message?.type === 'interactive') {
            const opcion = message.interactive?.button_reply?.id;

            await this.handleMenuOption(message.from, opcion);
            await whatsappService.markAsRead(message.id);
        }

    }

    isGreeting(message) {
        const greetings = ["hi", "hello", "hey", "buenos dias", "buenas tardes", "buenas noches", "saludos", "hola"];
        return greetings.includes(message);
    }

    getSenderName(senderInfo) {
        return senderInfo?.profile?.name || senderInfo?.wa_id || "Usuario";
    }

    async sendWellcomeMessage(to, messageId, senderInfo) {
        const name = this.getSenderName(senderInfo).split(" ")[0];
        const response = `Hola ${name}, bienvenido a merapets. ¿en qué puedo ayudarte?`;
        await whatsappService.sendMessage(to, response, messageId);
    }

    async sendWellcomeMenu(to) {
        const menuMessage = "Elige una opcion";
        const buttons = [
            { type: "reply", reply: { id: "opcion_1", title: "Agendar" } },
            { type: "reply", reply: { id: "opcion_2", title: "consultar" } },
            { type: "reply", reply: { id: "opcion_3", title: "ubicacion" } }
        ];

        await whatsappService.sendInteractiveButtons(to, menuMessage, buttons);
    }

    async handleMenuOption(to, option) {
        let response;
        switch (option) {
            case "opcion_1":
                response = "Agendar Cita";
                break;
            case "opcion_2":
                response = "Consultar Usuario";
                break;
            case "opcion_3":
                response = "Ubicacion Local";
                break;
            default:
                response = "Opcion no valida";
        }
        await whatsappService.sendMessage(to, response);
    }

    async sendMedia(to){
            //const mediaUrl= 'https://s3.amazonaws.com/gndx.dev/medpet-audio.aac';   
            // const caption = 'Bienvenida';   
            // // const type = 'audio';

            // const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-imagen.png';  
            //  // const caption = '¡Esto es una Imagen!';   
            // // const type = 'image';

             const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-video.mp4';   
            // 
            const caption = '¡Esto es una video!';   
            const type = 'video';

            //const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-file.pdf';   
            //const caption = '¡Esto es un PDF!';   const type = 'document';

        await whatsappService.sendMideaMessage(to, type, mediaUrl, caption);
    }
}

export default new MessageHandler();