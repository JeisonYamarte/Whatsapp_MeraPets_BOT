import whatsappService from "./whatsappService.js";

class MessageHandler {
    async handleIncomingMessage(message, senderInfo) {
        if(message?.type === 'text') {
            const incomingMessage = message.text.body.toLowerCase().trim();

            if (this.isGreeting(incomingMessage)) {
                await this.sendWellcomeMessage(message.from, message.id, senderInfo);
                await this.sendWellcomeMenu(message.from);
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

}

export default new MessageHandler();