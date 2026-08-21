const nodemailer = require('nodemailer');
const fs = require('fs');

async function main() {
    const payloadPath = process.argv[2];
    if (!payloadPath || !fs.existsSync(payloadPath)) {
        console.error('Email Runner Error: Payload file path missing or not found:', payloadPath);
        process.exit(1);
    }

    try {
        const data = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
        const fromEmail = data.from_email || process.env.EMAIL_FROM || "sm8199849@gmail.com";
        const emailPassword = data.password || process.env.EMAIL_PASSWORD || "sqzbfaesgowgzrne";

        // 1. First: Check for Brevo API Key (HTTPS Port 443 - Bypasses Render raw SMTP firewall blocks)
        const brevoKey = process.env.BREVO_API_KEY || data.brevo_api_key;
        if (brevoKey) {
            try {
                const attachments = (data.attachments || []).map(att => {
                    const contentBuf = fs.readFileSync(att.path);
                    return {
                        name: att.filename,
                        content: contentBuf.toString('base64')
                    };
                });

                const payload = {
                    sender: { name: "JobAgent AI", email: fromEmail },
                    to: [{ email: data.to_email }],
                    subject: data.subject,
                    htmlContent: data.html_content,
                    attachment: attachments
                };

                const res = await fetch('https://api.brevo.com/v3/smtp/email', {
                    method: 'POST',
                    headers: {
                        'api-key': brevoKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    const result = await res.json();
                    console.log(`[Brevo HTTPS Success]: Email sent to ${data.to_email} | MessageId: ${result.messageId}`);
                    process.exit(0);
                } else {
                    const errText = await res.text();
                    console.error('[Brevo API Notice]:', res.status, errText);
                }
            } catch (apiErr) {
                console.error('[Brevo HTTPS Exception]:', apiErr.message);
            }
        }

        // 2. Second: Nodemailer SMTP with 5s connection timeout (Localhost / Unblocked SMTP)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            connectionTimeout: 5000, // 5s connection timeout
            greetingTimeout: 5000,
            socketTimeout: 10000,
            auth: {
                user: fromEmail,
                pass: emailPassword
            }
        });

        const attachments = (data.attachments || []).map(att => ({
            filename: att.filename,
            path: att.path
        }));

        const mailOptions = {
            from: `JobAgent AI <${fromEmail}>`,
            to: data.to_email,
            subject: data.subject,
            html: data.html_content,
            attachments: attachments
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Nodemailer Success]: Email sent to ${data.to_email} | MessageId: ${info.messageId}`);
        process.exit(0);
    } catch (err) {
        console.error('[Email Runner Exception]:', err.message);
        process.exit(1);
    }
}

main();
