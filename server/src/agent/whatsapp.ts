export async function enviarMensaje(to: string, text: string): Promise<string> {

    try {

        if (process.env.WHATSAPP_MOCK === "true") {
            console.log("Mensaje simulado a WhatsApp:");
            console.log("Para:", to);
            console.log("Texto:", text);
            return 'wamiddPruebiña';
        }

        console.log("Mensaje simulado a WhatsApp:");
        console.log("Para:", to);
        console.log("Texto:", text);
        const url = `https://graph.facebook.com/v20.0/${process.env.WS_PHONE_NUMBER_ID}/messages`;

        const response = await fetch( url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.WS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "messaging_product": "whatsapp",
                "to": to,
                "type": "text",
                "text": { "body": text }
            })
        });
        const data = await response.json() as any;

        if (!response.ok || data.error) {
            console.error('Error de Meta:', data.error);
            throw new Error(`Meta API error: ${data.error?.message}`);
        }

        return data.messages[0].id;
    }

    catch (error) {
        console.error("Error enviando el mensaje a whatsapp", error);
        throw error;
    }



}