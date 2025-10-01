// Email notification system
// Supports Resend API and console fallback for development

type EmailData = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: EmailData): Promise<boolean> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@zielvereinbarung.digital";

  // If no API key is configured, log to console (development mode)
  if (!RESEND_API_KEY) {
    console.log("=== EMAIL (Development Mode) ===");
    console.log(`To: ${to}`);
    console.log(`From: ${FROM_EMAIL}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${html}`);
    console.log("================================");
    return true;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to send email:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

// Email templates
export function getFormSubmittedEmail(schoolName: string, formId: string, accessCode: string) {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  return {
    subject: `Neue Zielvereinbarung von ${schoolName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #005AA9; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background-color: #005AA9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Neue Zielvereinbarung eingereicht</h1>
          </div>
          <div class="content">
            <p>Guten Tag,</p>
            <p><strong>${schoolName}</strong> hat eine neue Zielvereinbarung eingereicht.</p>
            <p><strong>Zugangscode:</strong> ${accessCode}</p>
            <p>Bitte prüfen Sie die Zielvereinbarung und nehmen Sie diese an oder senden Sie Feedback zur Überarbeitung.</p>
            <a href="${APP_URL}/admin/forms/${formId}" class="button">Zielvereinbarung ansehen</a>
            <div class="footer">
              <p>Dies ist eine automatische Benachrichtigung von Zielvereinbarung Digital.</p>
              <p>Ministerium für Schule und Bildung des Landes Nordrhein-Westfalen</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

export function getFormApprovedEmail(schoolName: string, accessCode: string) {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  return {
    subject: `Ihre Zielvereinbarung wurde angenommen`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #00838F; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .success { background-color: #E3F2FD; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #00838F; }
          .button { display: inline-block; background-color: #005AA9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Zielvereinbarung angenommen</h1>
          </div>
          <div class="content">
            <p>Sehr geehrte Damen und Herren von <strong>${schoolName}</strong>,</p>
            <div class="success">
              <strong>Ihre Zielvereinbarung wurde erfolgreich angenommen!</strong>
            </div>
            <p>Sie können die Zielvereinbarung jederzeit einsehen und als PDF herunterladen.</p>
            <p><strong>Zugangscode:</strong> ${accessCode}</p>
            <a href="${APP_URL}/formular/${accessCode}" class="button">Zielvereinbarung ansehen</a>
            <div class="footer">
              <p>Dies ist eine automatische Benachrichtigung von Zielvereinbarung Digital.</p>
              <p>Ministerium für Schule und Bildung des Landes Nordrhein-Westfalen</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

export function getFormReturnedEmail(schoolName: string, accessCode: string, message: string) {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  return {
    subject: `Ihre Zielvereinbarung wurde zur Überarbeitung zurückgegeben`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #FF9800; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .warning { background-color: #FFF3E0; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #FF9800; }
          .feedback { background-color: white; padding: 15px; border-radius: 4px; margin: 20px 0; border: 1px solid #ddd; }
          .button { display: inline-block; background-color: #005AA9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Überarbeitung erforderlich</h1>
          </div>
          <div class="content">
            <p>Sehr geehrte Damen und Herren von <strong>${schoolName}</strong>,</p>
            <div class="warning">
              <strong>Ihre Zielvereinbarung wurde zur Überarbeitung zurückgegeben.</strong>
            </div>
            <p>Bitte nehmen Sie folgende Änderungen vor:</p>
            <div class="feedback">
              <strong>Feedback vom Schulamt:</strong><br>
              ${message}
            </div>
            <p><strong>Zugangscode:</strong> ${accessCode}</p>
            <a href="${APP_URL}/formular/${accessCode}" class="button">Zielvereinbarung bearbeiten</a>
            <div class="footer">
              <p>Dies ist eine automatische Benachrichtigung von Zielvereinbarung Digital.</p>
              <p>Ministerium für Schule und Bildung des Landes Nordrhein-Westfalen</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}



