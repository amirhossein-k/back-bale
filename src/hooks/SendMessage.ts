// src\hooks\SendMessage.ts
// تایپ برای درخواست
interface SendMessageRequest {
    chatId: number;
    text: string;
    userId?: string;

}

export async function SendMessage({ chatId, text, userId }: SendMessageRequest) {
    const Api = `api/telegram/send-to-group`
    try {
        console.log("send");
        const response = await fetch(Api, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ chatId, text, userId }),
        });
        console.log(response, "response");

        if (!response.ok) {
            const errorBody = await response.text().catch(() => "");
            throw new Error(
                `خطای ${response.status}: ${response.statusText}${errorBody ? " - " + errorBody : ""}`,
            );

        }
        const dataRes = await response.json();
        return dataRes;

    } catch (error: any) {

    }

}