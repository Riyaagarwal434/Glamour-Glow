// Helper function to send email via Brevo REST API
const sendViaBrevo = async ({ toEmail, toName, subject, htmlContent }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not defined in environment variables.");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": apiKey,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      sender: {
        name: "Glamour & Glow",
        email: "riyaagarwal3012@gmail.com"
      },
      to: [
        {
          email: toEmail,
          name: toName || "Client"
        }
      ],
      subject: subject,
      htmlContent: htmlContent
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Brevo API returned error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return data;
};

/**
 * Sends a stylized HTML booking email to the customer.
 * @param {Object} booking - The booking document containing name, email, service, date, time, status.
 * @param {string} statusType - The booking status type ('pending', 'confirmed', 'rejected')
 */
const sendBookingEmail = async (booking, statusType) => {
  try {
    let statusTitle = "";
    let statusColor = "";
    let statusBg = "";
    let headerGradient = "";
    let messageText = "";

    switch (statusType) {
      case "pending":
        statusTitle = "Booking Received & Pending Approval";
        statusColor = "#9a6300";
        statusBg = "#fff3cd";
        headerGradient = "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
        messageText = `We have received your booking request for the service listed below. Our team is currently reviewing it, and we will update you as soon as it is confirmed.`;
        break;
      case "confirmed":
        statusTitle = "Booking Confirmed!";
        statusColor = "#155724";
        statusBg = "#d4edda";
        headerGradient = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
        messageText = `Great news! Your booking has been successfully confirmed. We look forward to seeing you at your scheduled time.`;
        break;
      case "rejected":
        statusTitle = "Booking Update: Cancelled/Declined";
        statusColor = "#721c24";
        statusBg = "#f8d7da";
        headerGradient = "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
        messageText = `Unfortunately, we are unable to accept your booking request for the slot listed below. Please try selecting a different date/time or contact us directly.`;
        break;
      default:
        statusTitle = "Booking Update";
        statusColor = "#3182ce";
        statusBg = "#ebf8ff";
        headerGradient = "linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%)";
        messageText = `There is an update regarding your booking request. Please check the details below.`;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${statusTitle}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f7fafc;
            margin: 0;
            padding: 0;
            color: #2d3748;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
          }
          .header {
            background: ${headerGradient};
            padding: 30px;
            text-align: center;
            color: #ffffff;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            letter-spacing: 0.5px;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-top: 0;
            color: #1a202c;
          }
          .message {
            font-size: 16px;
            line-height: 1.6;
            color: #4a5568;
            margin-bottom: 25px;
          }
          .details-card {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            border: 1px solid #edf2f7;
            margin-bottom: 25px;
          }
          .details-title {
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #718096;
            margin-top: 0;
            margin-bottom: 15px;
            font-weight: 700;
          }
          .details-table {
            width: 100%;
            border-collapse: collapse;
          }
          .details-table td {
            padding: 10px 0;
            font-size: 15px;
          }
          .details-table td.label {
            color: #718096;
            width: 30%;
            font-weight: 500;
          }
          .details-table td.value {
            color: #2d3748;
            font-weight: 600;
            text-align: right;
          }
          .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 700;
            color: ${statusColor};
            background-color: ${statusBg};
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .footer {
            background-color: #edf2f7;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #718096;
            border-top: 1px solid #edf2f7;
          }
          .footer p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Salon Appointment Update</h1>
          </div>
          <div class="content">
            <p class="greeting">Hello ${booking.name},</p>
            <p class="message">${messageText}</p>
            
            <div class="details-card">
              <p class="details-title">Appointment Summary</p>
              <table class="details-table">
                <tr>
                  <td class="label">Service</td>
                  <td class="value">${booking.service}</td>
                </tr>
                <tr>
                  <td class="label">Date</td>
                  <td class="value">${booking.date}</td>
                </tr>
                <tr>
                  <td class="label">Time</td>
                  <td class="value">${booking.time}</td>
                </tr>
                <tr>
                  <td class="label">Status</td>
                  <td class="value">
                    <span class="status-badge">${statusType}</span>
                  </td>
                </tr>
              </table>
            </div>
            
            <p class="message" style="margin-bottom: 0;">If you have any questions or need to reschedule, please feel free to reach out to us.</p>
          </div>
          <div class="footer">
            <p><strong>Salon Booking System</strong></p>
            <p>This is an automated notification. Please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await sendViaBrevo({
      toEmail: booking.email,
      toName: booking.name,
      subject: `${statusTitle} - Salon Appointment`,
      htmlContent: htmlContent
    });
    console.log(`[Email Sent via Brevo] Message ID: ${info.messageId} | Recipient: ${booking.email} | Type: ${statusType}`);
    return info;
  } catch (error) {
    console.error(`[Email Error] Failed to send email to ${booking.email} via Brevo:`, error);
    throw error;
  }
};

/**
 * Sends an email to the salon owner notifying them of a new booking request with action links.
 * @param {Object} booking - The booking document containing name, email, service, date, time, _id.
 */
const sendOwnerNotificationEmail = async (booking) => {
  try {
    const ownerEmail = "riyaagarwal3012@gmail.com";
    const approveLink = `http://localhost:5000/api/booking/approve/${booking._id}`;
    const rejectLink = `http://localhost:5000/api/booking/reject/${booking._id}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Booking Request</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f7fafc;
            margin: 0;
            padding: 0;
            color: #2d3748;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
          }
          .header {
            background: linear-gradient(135deg, #ff8c5a 0%, #ff5722 100%);
            padding: 30px;
            text-align: center;
            color: #ffffff;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            letter-spacing: 0.5px;
          }
          .content {
            padding: 40px 30px;
          }
          .title {
            font-size: 18px;
            font-weight: 600;
            margin-top: 0;
            color: #1a202c;
            margin-bottom: 15px;
          }
          .details-card {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            border: 1px solid #edf2f7;
            margin-bottom: 30px;
          }
          .details-table {
            width: 100%;
            border-collapse: collapse;
          }
          .details-table td {
            padding: 10px 0;
            font-size: 15px;
          }
          .details-table td.label {
            color: #718096;
            width: 35%;
            font-weight: 500;
          }
          .details-table td.value {
            color: #2d3748;
            font-weight: 600;
            text-align: right;
          }
          .actions-wrapper {
            margin-top: 30px;
            text-align: center;
          }
          .btn-action {
            display: inline-block;
            width: 45%;
            box-sizing: border-box;
            text-align: center;
            padding: 12px 10px;
            border-radius: 30px;
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-decoration: none;
            margin: 0 2%;
          }
          .btn-approve {
            background-color: #10b981;
            color: #ffffff !important;
          }
          .btn-reject {
            background-color: #ef4444;
            color: #ffffff !important;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Glamour & Glow Appointment</h1>
          </div>
          <div class="content">
            <p class="title">New Booking Request Received 📅</p>
            <p>A new appointment has been scheduled and is pending approval. Review details below:</p>
            
            <div class="details-card">
              <table class="details-table">
                <tr>
                  <td class="label">Client Name</td>
                  <td class="value">${booking.name}</td>
                </tr>
                <tr>
                  <td class="label">Client Email</td>
                  <td class="value">${booking.email}</td>
                </tr>
                <tr>
                  <td class="label">Service</td>
                  <td class="value">${booking.service}</td>
                </tr>
                <tr>
                  <td class="label">Date</td>
                  <td class="value">${booking.date}</td>
                </tr>
                <tr>
                  <td class="label">Time</td>
                  <td class="value">${booking.time}</td>
                </tr>
              </table>
            </div>
            
            <p style="text-align: center; font-weight: bold;">Review and take action:</p>
            <div class="actions-wrapper">
              <a href="${approveLink}" class="btn-action btn-approve" style="color: #ffffff;">Approve</a>
              <a href="${rejectLink}" class="btn-action btn-reject" style="color: #ffffff;">Reject</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await sendViaBrevo({
      toEmail: ownerEmail,
      toName: "Salon Owner",
      subject: `New Booking Request - ${booking.name} (${booking.service})`,
      htmlContent: htmlContent
    });
    console.log(`[Owner Notification Sent via Brevo] Message ID: ${info.messageId} | Booking ID: ${booking._id}`);
    return info;
  } catch (error) {
    console.error(`[Owner Notification Error] Failed to notify owner for booking ${booking._id} via Brevo:`, error);
    throw error;
  }
};

module.exports = {
  sendBookingEmail,
  sendOwnerNotificationEmail
};

