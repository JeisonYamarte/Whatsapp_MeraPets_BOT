import axios from 'axios';
import config from '../config/env.js';



const openrouterService = async (message) => {
    try{
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions',{
          model: 'mistralai/mistral-7b-instruct',
          messages: [
            { role: 'system', content: 'Comportarte como un veterinario, deberás de resolver las preguntas lo más simple posible. Responde en texto plano, como si fuera una conversación por WhatsApp, no saludes, no generas conversaciones, solo respondes con la pregunta del usuario, resume lo mas posible y recuerda que son sintomas de algun animal de hogar' },
            { role: 'user', content: message }
          ]  
        },{
            headers: {
                'Authorization': `Bearer ${config.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            }
        })

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error in OpenRouter service:', error);
        throw error;
    }
}

export default openrouterService;