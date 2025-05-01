import whatsappService from "./whatsappService.js";
import appendToSheets from "./googleSheetsService.js";
import openrouterService from "./openRouterService.js";

class MessageHandler {

    constructor() {
        this.appointmentState = {};
        this.asistandState = {};
    }

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

            } else if(this.appointmentState[message.from]) {
                await this.handleAppointmentFlow(message.from, incomingMessage);
                return;

            }else if(this.asistandState[message.from]){
                await this.handleAsistandFlow(message.from, incomingMessage);
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
                this.appointmentState[to] = { step: 'name' };
                response = "por favor, ingresa tu nombre:";
                break;
            case "opcion_2":
                this.asistandState[to] = { step: 'question' };
                response = "Haz tu consulta";
                break;
            case "opcion_3":
                await this.sendLocation(to);
                response = "Ubicacion del Local";
                break;
            case "opcion_6":
                response = "si es una emergencia, por favor llama a este contacto";
                await this.sendContact(to);
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
            const caption = '¡Esto es una video!';   
            const type = 'video';

            //const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-file.pdf';   
            //const caption = '¡Esto es un PDF!';   const type = 'document';

        await whatsappService.sendMideaMessage(to, type, mediaUrl, caption);
    }

    completeAppointmentFlow(to) {
        const appoinment = this.appointmentState[to];
        delete this.appointmentState[to];

        const userData = [
            to,
            appoinment.name,
            appoinment.petName,
            appoinment.petType,
            appoinment.reason,
            new Date().toISOString()
        ]

        appendToSheets(userData);
        
        return `Gracias por agendar tu cita, ${appoinment.name}.
        Tu mascota ${appoinment.petName} (${appoinment.petType}) tiene una cita por ${appoinment.reason}.
        Te contactaremos pronto para confirmar la fecha y hora.`;
        
    }


    async handleAppointmentFlow(to, message) {
        const state = this.appointmentState[to] || {};
        let response;

        switch (state.step) {
            case 'name':
                state.name = message;
                state.step = 'petName';
                response = 'Gracias, ahora, ¿cuál es el nombre de tu mascota?';
                break;
            case 'petName':
                state.petName = message;
                state.step = 'petType';
                response = `Gracias ${state.name}, ¿qué tipo de mascota tienes? (por ejemplo: perro, gato, etc.)`;
                break;
            case 'petType':
                state.petType = message;
                state.step = 'reason';
                response = `Gracias ${state.name}, ¿cuál es el motivo de la cita?`;
                break;
            case 'reason':
                state.reason = message;
                response = this.completeAppointmentFlow(to);
                break;
        }
        await whatsappService.sendMessage(to, response);
    }

    async handleAsistandFlow(to, message) {
        const state = this.asistandState[to] || {};
        let response;

        const menuMessage = '¿la respuesta fue de tu ayuda?';
        const buttons= [
            { type: "reply", reply: { id: "opcion_4", title: "si, gracias" } },
            { type: "reply", reply: { id: "opcion_5", title: "hacer otra pregunta." } },
            { type: "reply", reply: { id: "opcion_6", title: "Emergencia" } }
        ];

        if (state.step === 'question'){
            response = await openrouterService(message);
        }

        delete this.asistandState[to];
        await whatsappService.sendMessage(to, response || "error");
        await whatsappService.sendInteractiveButtons(to, menuMessage, buttons);
    }

    async sendContact(to){
        const contact = {
            addresses: [
              {
                street: "123 Calle de las Mascotas",
                city: "Ciudad",
                state: "Estado",
                zip: "12345",
                country: "País",
                country_code: "PA",
                type: "WORK"
              }
            ],
            emails: [
              {
                email: "contacto@merapet.com",
                type: "WORK"
              }
            ],
            name: {
              formatted_name: "MeraPet Contacto",
              first_name: "MedPet",
              last_name: "Contacto",
              middle_name: "",
              suffix: "",
              prefix: ""
            },
            org: {
              company: "MeraPet",
              department: "Atención al Cliente",
              title: "Representante"
            },
            phones: [
              {
                phone: "+1234567890",
                wa_id: "1234567890",
                type: "WORK"
              }
            ],
            urls: [
              {
                url: "https://www.merapet.com",
                type: "WORK"
              }
            ]
        }
        await whatsappService.sendContactMessage(to, contact);
    }


    async sendLocation(to){
        const location = {
            latitude: 37.7749,
            longitude: -122.4194,
            name: "Ubicación de MeraPet",
            address: "123 Market St, San Francisco, CA 94103, USA"
        }
        await whatsappService.sendLocationMessage(to, location);
    }

    
}

export default new MessageHandler();