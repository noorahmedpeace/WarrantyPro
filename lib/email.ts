export interface EmailPayload {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

export class EmailService {
    /**
     * Sends an email notification.
     * In MVP/Production without an API key, this will log to console.
     * To scale, uncomment the Resend/SendGrid implementation.
     */
    static async send(payload: EmailPayload): Promise<boolean> {
        // SCALABILITY: Replace with Resend or SendGrid here
        // const res = await fetch('https://api.resend.com/emails', { ... })

        console.log(`
        ==================================================
        [MOCK EMAIL SERVICE]
        To: ${payload.to}
        Subject: ${payload.subject}
        Body: ${payload.text}
        ==================================================
        `)

        return true;
    }
}
