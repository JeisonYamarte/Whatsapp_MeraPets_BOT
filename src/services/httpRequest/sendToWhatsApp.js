import axios from 'axios';
import config from '../../config/env.js';

const sendToWhatsApp = async (data) => {
    const baseUrl = config.WHATSAPP_API_URL;
    const headers={
        authorization: `Bearer ${config.API_TOKEN}`,
    };
    try{
        const response = await axios({
            method: "POST",
            url: baseUrl,
            headers: headers,
            data,
        });
    } catch (error) {
        console.error("Error sending message to WhatsApp:", error);
    }
}

export default sendToWhatsApp;