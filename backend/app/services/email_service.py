import logging

import httpx

from app.config import settings

logger = logging.getLogger("pralayai.email")

RESEND_API = "https://api.resend.com/emails"


async def send_email(to: str, subject: str, html: str) -> bool:
    if not settings.RESEND_API_KEY:
        logger.warning("Email not sent: RESEND_API_KEY not configured")
        return False
    async with httpx.AsyncClient(timeout=15) as client:
        res = await client.post(
            RESEND_API,
            headers={
                "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": settings.EMAIL_FROM,
                "to": [to],
                "subject": subject,
                "html": html,
            },
        )
        if res.is_success:
            logger.info("Email sent: to=%s subject=%s", to, subject)
        else:
            logger.error("Email send failed: to=%s status=%s body=%s", to, res.status_code, res.text[:200])
        return res.is_success


def _professional_html(content: str) -> str:
    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:32px 16px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#1a1a1b;border-radius:12px;border:1px solid #2f2f30;overflow:hidden;">
        <tr><td style="padding:32px 28px 16px;text-align:center;">
          <div style="font-size:24px;font-weight:700;background:linear-gradient(90deg,#4b90ff,#ff5546);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">PralayAI</div>
          <div style="font-size:13px;color:#9aa0a6;margin-top:4px;">Defensive Cybersecurity Assistant</div>
        </td></tr>
        <tr><td style="padding:8px 28px 24px;color:#e8eaed;font-size:15px;line-height:1.6;">
          {content}
        </td></tr>
        <tr><td style="padding:16px 28px;border-top:1px solid #2f2f30;text-align:center;font-size:12px;color:#5f6368;">
          &copy; 2026 PralayAI &mdash; Security-first AI assistant
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""


async def send_otp_email(to: str, otp: str) -> bool:
    html = _professional_html(f"""
    <p style="margin:0 0 16px;">Use the OTP below to complete your password reset.</p>
    <div style="background:#212122;border:1px solid #2f2f30;border-radius:8px;padding:14px 18px;text-align:center;font-size:28px;font-weight:700;letter-spacing:6px;color:#8ab4f8;margin:0 0 16px;">{otp}</div>
    <p style="margin:0 0 16px;color:#9aa0a6;font-size:13px;">This code expires in {settings.RESET_OTP_EXPIRY_MINUTES} minutes.</p>
    <p style="margin:0;color:#5f6368;font-size:12px;">If you did not request this, please ignore this email.</p>
    """)
    return await send_email(to, "Your PralayAI Verification Code", html)
