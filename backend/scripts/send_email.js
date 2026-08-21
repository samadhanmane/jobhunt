const nodemailer = require('nodemailer');
const fs = require('fs');

async function main() {
    const payloadPath = process.argv[2];
    if (!payloadPath || !fs.existsSync(payloadPath)) {
        console.error('Nodemailer Error: Payload file path missing or not found:', payloadPath);
        process.exit(1);
    }

    try {
        const data = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));

        const fromEmail = data.from_email || process.env.EMAIL_FROM || "sm8199849@gmail.com";
        const emailPassword = data.password || process.env.EMAIL_PASSWORD || "sqzbfaesgowgzrne";

        const transporter = nodemailer.createTransport({
            service: 'gmail',
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
        console.error('[Nodemailer Exception]:', err.message);
        process.exit(1);
    }
}

main();
