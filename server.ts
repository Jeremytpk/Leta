import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON requests
  app.use(express.json());

  // API Route: Send Assignment Notification
  app.post("/api/notify-assignment", async (req, res) => {
    const {
      employeeEmail,
      employeeName,
      type, // "assigned" | "unassigned" | "reassigned"
      jobId,
      jobDescription,
      clientName,
      clientAddress,
      prevTechName,
    } = req.body;

    if (!employeeEmail) {
      return res.status(400).json({ error: "employeeEmail is required" });
    }

    const subjectMap = {
      assigned: `🔧 New Dispatch Ticket Assigned: ${jobId} - ${clientName}`,
      unassigned: `⚠️ Ticket Unassigned: ${jobId} - ${clientName}`,
      reassigned: `🔄 Ticket Reassigned: ${jobId} - ${clientName}`,
    };

    const subject = subjectMap[type as keyof typeof subjectMap] || `Service Ticket Update: ${jobId}`;

    let bodyHtml = "";
    if (type === "assigned") {
      bodyHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #4f46e5; margin: 0; font-size: 22px;">🔧 New Service Ticket Assignment</h1>
            <p style="color: #64748b; margin: 5px 0 0 0; font-size: 13px;">Leta Technologies LLC • Dispatch Center</p>
          </div>
          <p style="font-size: 15px; color: #334155;">Hello <strong>${employeeName}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.5;">You have been assigned to a new service dispatch ticket. Please review the customer location and task scope details below:</p>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 600; width: 120px; text-transform: uppercase;">Ticket ID</td>
                <td style="padding: 6px 0; color: #1e293b; font-family: monospace; font-size: 14px; font-weight: bold;">#${jobId}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase;">Client</td>
                <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: bold;">${clientName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase;">Address</td>
                <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">${clientAddress}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; vertical-align: top;">Scope / Tasks</td>
                <td style="padding: 6px 0; color: #334155; font-size: 14px; white-space: pre-line; line-height: 1.4;">${jobDescription}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 14px; color: #475569; line-height: 1.5;">Please head over to the <strong>Leta Admin Hub</strong> portal, select the <strong>Service Tickets</strong> tab, and update your state once you arrive onsite.</p>
          
          <div style="text-align: center; margin: 25px 0 15px 0;">
            <a href="${process.env.APP_URL || "http://localhost:3000"}" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 10px 22px; font-size: 14px; font-weight: 700; border-radius: 6px; display: inline-block;">Open Admin Hub</a>
          </div>

          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">Leta Technologies LLC • This is an automated diagnostic dispatch update.</p>
        </div>
      `;
    } else if (type === "unassigned") {
      bodyHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #ea580c; margin: 0; font-size: 22px;">⚠️ Service Ticket Unassigned</h1>
            <p style="color: #64748b; margin: 5px 0 0 0; font-size: 13px;">Leta Technologies LLC • Dispatch Center</p>
          </div>
          <p style="font-size: 15px; color: #334155;">Hello <strong>${employeeName}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.5;">You have been <strong>unassigned</strong> from the following service ticket:</p>
          
          <div style="background-color: #fff7ed; border: 1px solid #ffedd5; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #c2410c; font-size: 13px; font-weight: 600; width: 120px; text-transform: uppercase;">Ticket ID</td>
                <td style="padding: 6px 0; color: #1e293b; font-family: monospace; font-size: 14px; font-weight: bold;">#${jobId}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #c2410c; font-size: 13px; font-weight: 600; text-transform: uppercase;">Client</td>
                <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: bold;">${clientName}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 14px; color: #475569; line-height: 1.5;">This ticket has been returned to the dispatch queue. You are no longer responsible for this diagnostic dispatch. Please check your active schedule for other assignments.</p>

          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">Leta Technologies LLC • This is an automated diagnostic dispatch update.</p>
        </div>
      `;
    } else if (type === "reassigned") {
      bodyHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #6366f1; margin: 0; font-size: 22px;">🔄 Service Ticket Reassigned</h1>
            <p style="color: #64748b; margin: 5px 0 0 0; font-size: 13px;">Leta Technologies LLC • Dispatch Center</p>
          </div>
          <p style="font-size: 15px; color: #334155;">Hello <strong>${employeeName}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.5;">You have been assigned to the following service ticket (previously allocated to <strong>${prevTechName || "another technician"}</strong>):</p>
          
          <div style="background-color: #e0e7ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #4338ca; font-size: 13px; font-weight: 600; width: 120px; text-transform: uppercase;">Ticket ID</td>
                <td style="padding: 6px 0; color: #1e293b; font-family: monospace; font-size: 14px; font-weight: bold;">#${jobId}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #4338ca; font-size: 13px; font-weight: 600; text-transform: uppercase;">Client</td>
                <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: bold;">${clientName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #4338ca; font-size: 13px; font-weight: 600; text-transform: uppercase;">Address</td>
                <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">${clientAddress}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #4338ca; font-size: 13px; font-weight: 600; text-transform: uppercase; vertical-align: top;">Scope / Tasks</td>
                <td style="padding: 6px 0; color: #334155; font-size: 14px; white-space: pre-line; line-height: 1.4;">${jobDescription}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 14px; color: #475569; line-height: 1.5;">Please review the trouble ticket details and head over to the site as scheduled. Remember to update your progress indicators inside Leta Admin Hub.</p>
          
          <div style="text-align: center; margin: 25px 0 15px 0;">
            <a href="${process.env.APP_URL || "http://localhost:3000"}" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 10px 22px; font-size: 14px; font-weight: 700; border-radius: 6px; display: inline-block;">View Ticket Details</a>
          </div>

          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">Leta Technologies LLC • This is an automated diagnostic dispatch update.</p>
        </div>
      `;
    }

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: Number(SMTP_PORT || 587),
          secure: Number(SMTP_PORT || 587) === 465,
          auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: SMTP_FROM || SMTP_USER,
          to: employeeEmail,
          subject: subject,
          html: bodyHtml,
        });

        console.log(`[EMAIL_SYSTEM] Successfully sent email to ${employeeEmail} for ${type} event on ticket ${jobId}`);
        return res.json({ success: true, simulated: false });
      } catch (err: any) {
        console.error(`[EMAIL_SYSTEM] Failed to transmit real SMTP email:`, err);
        return res.status(500).json({ error: "SMTP transmission failed", details: err.message });
      }
    } else {
      // Elegant, clean, non-crashing fallback logged to server console
      console.log("\n=================================================");
      console.log(`📬 [EMAIL_SYSTEM SIMULATION]`);
      console.log(`Recipient: ${employeeEmail} (${employeeName})`);
      console.log(`Subject:   ${subject}`);
      console.log(`Event:     ${type.toUpperCase()}`);
      console.log(`Job ID:    ${jobId}`);
      console.log(`Client:    ${clientName} @ ${clientAddress}`);
      console.log("-------------------------------------------------");
      console.log("HTML Preview Snippet (First 200 chars):");
      console.log(bodyHtml.trim().replace(/\s+/g, " ").substring(0, 200) + "...");
      console.log("=================================================\n");

      return res.json({
        success: true,
        simulated: true,
        message: "SMTP is not configured in environment variables. Email logged to server console successfully.",
      });
    }
  });

  // API Route: Contact Form Submission / Dispatch Request
  app.post("/api/contact-message", async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required fields." });
    }

    const emailSubject = `📥 New Dispatch / Contact Message: ${subject || "No Subject"} - from ${name}`;
    
    const bodyHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 20px;">
          <h1 style="color: #4f46e5; margin: 0; font-size: 22px;">📥 New Contact Inquiry</h1>
          <p style="color: #64748b; margin: 5px 0 0 0; font-size: 13px;">Leta Technologies LLC • Dispatch Center</p>
        </div>
        <p style="font-size: 15px; color: #334155;">Hello Operations Team,</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.5;">A new contact message or dispatch request has been submitted through the corporate landing page. See details below:</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 600; width: 120px; text-transform: uppercase;">From Name</td>
              <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: bold;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase;">From Email</td>
              <td style="padding: 6px 0; color: #1e293b; font-size: 14px;"><a href="mailto:${email}" style="color: #4f46e5; text-decoration: none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase;">Subject</td>
              <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: bold;">${subject || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; vertical-align: top;">Message</td>
              <td style="padding: 6px 0; color: #334155; font-size: 14px; white-space: pre-line; line-height: 1.4;">${message}</td>
            </tr>
          </table>
        </div>

        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">Leta Technologies LLC • Customer Dispatch System</p>
      </div>
    `;

    const recipientEmail = "techs@leta.repair";
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: Number(SMTP_PORT || 587),
          secure: Number(SMTP_PORT || 587) === 465,
          auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: SMTP_FROM || SMTP_USER,
          to: recipientEmail,
          subject: emailSubject,
          html: bodyHtml,
        });

        console.log(`[EMAIL_SYSTEM] Successfully sent contact form email to ${recipientEmail}`);
        return res.json({ success: true, simulated: false });
      } catch (err: any) {
        console.error(`[EMAIL_SYSTEM] Failed to transmit real SMTP contact email:`, err);
        return res.status(500).json({ error: "SMTP transmission failed", details: err.message });
      }
    } else {
      // Elegant, clean fallback logged to console
      console.log("\n=================================================");
      console.log(`📬 [EMAIL_SYSTEM SIMULATION - CONTACT FORM]`);
      console.log(`Recipient: ${recipientEmail}`);
      console.log(`Subject:   ${emailSubject}`);
      console.log(`Sender:    ${name} <${email}>`);
      console.log(`Message:   ${message}`);
      console.log("-------------------------------------------------");
      console.log("=================================================\n");

      return res.json({
        success: true,
        simulated: true,
        message: "SMTP is not configured in environment variables. Email logged to server console successfully.",
      });
    }
  });

  // Serve static files and handle Vite development mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Full-stack Express server booted on http://0.0.0.0:${PORT}`);
  });
}

startServer();
