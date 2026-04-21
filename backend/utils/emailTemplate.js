const getOtpEmailTemplate = (otp, type = "verification") => {
  const title = type === "forgot" ? "Reset Your Password" : "Verify Your Email";
  const subtitle =
    type === "forgot"
      ? "Use the OTP below to reset your password."
      : "Use the OTP below to verify your email address.";

  return `
  <html>
    <body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, sans-serif;">
      
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:20px;">
        <tr>
          <td align="center">
            
            <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; padding:30px; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
              
              <!-- Header -->
              <tr>
                <td align="center" style="padding-bottom:20px;">
                  <h2 style="margin:0; color:#333;">DevTinder</h2>
                </td>
              </tr>

              <!-- Title -->
              <tr>
                <td style="padding-bottom:10px;">
                  <h3 style="margin:0; color:#222;">${title}</h3>
                </td>
              </tr>

              <!-- Subtitle -->
              <tr>
                <td style="padding-bottom:20px;">
                  <p style="margin:0; color:#555; font-size:14px;">
                    ${subtitle}
                  </p>
                </td>
              </tr>

              <!-- OTP Box -->
              <tr>
                <td align="center" style="padding:20px 0;">
                  <div style="
                    display:inline-block;
                    padding:15px 25px;
                    font-size:28px;
                    letter-spacing:5px;
                    font-weight:bold;
                    color:#ffffff;
                    background:#4f46e5;
                    border-radius:6px;
                  ">
                    ${otp}
                  </div>
                </td>
              </tr>

              <!-- Info -->
              <tr>
                <td style="padding-top:10px;">
                  <p style="margin:0; color:#777; font-size:13px;">
                    This OTP is valid for 5 minutes. Do not share it with anyone.
                  </p>
                </td>
              </tr>

              <!-- Divider -->
              <tr>
                <td style="padding:20px 0;">
                  <hr style="border:none; border-top:1px solid #eee;" />
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="font-size:12px; color:#999; text-align:center;">
                  If you didn’t request this, you can safely ignore this email.
                  <br /><br />
                  © ${new Date().getFullYear()} DevTinder. All rights reserved.
                </td>
              </tr>

            </table>

          </td>
        </tr>
      </table>

    </body>
  </html>
  `;
};

module.exports = getOtpEmailTemplate;