import os
import socket
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime
from typing import List, Dict, Any, Optional
from src.config import settings

class EmailService:
    """
    Service for sending rich HTML job digests with CSV attachments via SMTP.
    """
    def __init__(self):
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 465

    def _get_from_email(self) -> str:
        return settings.EMAIL_FROM or os.getenv("EMAIL_FROM") or "sm8199849@gmail.com"

    def _get_password(self) -> str:
        return settings.EMAIL_PASSWORD or os.getenv("EMAIL_PASSWORD") or "sqzbfaesgowgzrne"

    def _get_smtp_connection(self):
        from_email = self._get_from_email()
        password = self._get_password()
        
        # Explicitly resolve Gmail SMTP to IPv4 to prevent Render container IPv6 unreachable errors
        try:
            target_host = socket.gethostbyname(self.smtp_server)
        except Exception:
            target_host = self.smtp_server

        try:
            server = smtplib.SMTP_SSL(target_host, 465, timeout=30)
            server.login(from_email, password)
            return server
        except Exception as e:
            print(f"[EmailService] SSL 465 notice, attempting 587 STARTTLS ({e})")
            server = smtplib.SMTP(target_host, 587, timeout=30)
            server.ehlo()
            server.starttls()
            server.login(from_email, password)
            return server

    def _generate_html_digest(self, role: str, location: str, jobs: List[Dict[str, Any]], summary_note: str = "", raw_total_count: Optional[int] = None) -> str:
        today_str = datetime.now().strftime("%B %d, %Y")
        total_raw = raw_total_count if raw_total_count is not None else len(jobs)
        
        jobs_html = ""
        for idx, job in enumerate(jobs[:10]):
            score = round(job.get("match_score", 0))
            score_color = "#10b981" if score >= 80 else ("#f59e0b" if score >= 60 else "#6366f1")
            
            matching_skills = job.get("matching_skills", [])
            skills_badge_html = "".join([
                f'<span style="display: inline-block; background: rgba(16, 185, 129, 0.15); color: #10b981; font-size: 11px; padding: 2px 8px; border-radius: 4px; margin-right: 4px; margin-bottom: 4px; font-weight: 500;">✓ {s}</span>'
                for s in matching_skills[:5]
            ])
            
            salary_html = '<span style="color: #94a3b8; font-size: 12px; margin-left: 8px;">💰 N/A</span>'
            if job.get("salary_range"):
                min_s = job["salary_range"].get("min")
                max_s = job["salary_range"].get("max")
                curr = job["salary_range"].get("currency", "$")
                if min_s and max_s:
                    salary_html = f'<span style="color: #cbd5e1; font-size: 12px; margin-left: 8px;">💰 {curr}{min_s:,.0f} - {max_s:,.0f}</span>'
                elif min_s:
                    salary_html = f'<span style="color: #cbd5e1; font-size: 12px; margin-left: 8px;">💰 > {curr}{min_s:,.0f}</span>'

            jobs_html += f"""
            <div style="background: #1e293b; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 18px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <div>
                        <h3 style="margin: 0 0 4px 0; color: #f8fafc; font-size: 16px; font-weight: 700;">{job.get('title', 'Unknown Role')}</h3>
                        <p style="margin: 0; color: #94a3b8; font-size: 13px;">🏢 <strong style="color: #cbd5e1;">{job.get('company', 'Unknown Company')}</strong> &nbsp;|&nbsp; 📍 {job.get('location', 'Remote')} {salary_html}</p>
                    </div>
                    <div style="background: {score_color}22; border: 1px solid {score_color}66; color: {score_color}; font-size: 13px; font-weight: 800; padding: 4px 10px; border-radius: 20px; text-align: right; white-space: nowrap;">
                        ★ {score}% Match
                    </div>
                </div>
                
                <div style="margin: 10px 0 12px 0;">
                    {skills_badge_html}
                </div>
                
                {f'<p style="margin: 0 0 12px 0; font-size: 12px; color: #94a3b8; border-left: 2px solid #6366f1; padding-left: 8px;">{job.get("match_reason")}</p>' if job.get("match_reason") else ''}
                
                <div>
                    <a href="{job.get('url', '#')}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 600; padding: 8px 16px; border-radius: 6px;">View & Apply ↗</a>
                </div>
            </div>
            """

        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f8fafc; margin: 0; padding: 20px; }}
                .container {{ max-width: 620px; margin: 0 auto; background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 24px; }}
            </style>
        </head>
        <body style="background-color: #0b0f19; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px;">
            <div style="max-width: 620px; margin: 0 auto; background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 28px;">
                
                <!-- Header -->
                <div style="text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 20px; margin-bottom: 24px;">
                    <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); width: 44px; height: 44px; line-height: 44px; border-radius: 12px; font-size: 22px; margin-bottom: 10px;">⚡</div>
                    <h1 style="margin: 0; font-size: 22px; color: #ffffff; font-weight: 800;">JobAgent <span style="color: #8b5cf6;">AI</span> Daily Digest</h1>
                    <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 14px;">Targeting: <strong style="color: #60a5fa;">{role}</strong> in <strong style="color: #a78bfa;">{location or 'Worldwide'}</strong></p>
                    <p style="margin: 4px 0 0 0; color: #64748b; font-size: 12px;">{today_str}</p>
                </div>


                <!-- Summary Banner -->
                <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 10px; padding: 14px 18px; margin-bottom: 24px;">
                    <p style="margin: 0; font-size: 14px; color: #c7d2fe;">
                        🎯 <strong>{len(jobs)} Curated Top Matches</strong> (from <strong>{total_raw} total gathered jobs</strong> across LinkedIn, Indeed, Freehire, Himalayas & Arbeitnow).
                    </p>
                    {f'<p style="margin: 6px 0 0 0; font-size: 12px; color: #94a3b8;">{summary_note}</p>' if summary_note else ''}
                    <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 12px; color: #38bdf8;">
                        📎 <strong>2 CSV Spreadsheets Attached:</strong>
                        <ul style="margin: 6px 0 0 16px; padding: 0; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
                            <li><strong>all_fetched_jobs.csv</strong>: Complete structured database of all {total_raw} jobs gathered before deduplication.</li>
                            <li><strong>curated_matching_jobs.csv</strong>: Filtered, deduplicated & AI-ranked opportunities tailored to your preferences.</li>
                        </ul>
                    </div>
                </div>

                <!-- Job Cards -->
                <div>
                    {jobs_html if jobs_html else '<p style="color: #94a3b8; text-align: center; padding: 20px;">No new matching jobs found today matching your exact filters.</p>'}
                </div>

                <!-- Footer -->
                <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); margin-top: 24px; padding-top: 18px; text-align: center; color: #64748b; font-size: 11px;">
                    <p style="margin: 0 0 4px 0;">This automated daily report was generated by JobAgent AI based on your saved career preferences.</p>
                    <p style="margin: 0;">Powered by Mistral AI & Multi-Platform Parallel Aggregation.</p>
                </div>
            </div>
        </body>
        </html>
        """
        return html

    def send_daily_job_digest(
        self,
        to_email: str,
        role: str,
        location: str,
        jobs: List[Dict[str, Any]],
        csv_path: Optional[str] = None,
        csv_paths: Optional[List[str]] = None,
        summary_note: str = "",
        raw_total_count: Optional[int] = None
    ) -> bool:
        """
        Sends HTML email digest with one or more CSV attachments to the user.
        """
        from_email = self._get_from_email()
        password = self._get_password()

        if not to_email or not from_email or not password:
            print("Email notice: Missing email credentials or recipient.")
            return False

        try:
            today_str = datetime.now().strftime("%Y-%m-%d")
            subject = f"🎯 {len(jobs)} Curated {role} Jobs ({location or 'Remote'}) - {today_str}"

            msg = MIMEMultipart("mixed")
            msg["From"] = f"JobAgent AI <{from_email}>"
            msg["To"] = to_email
            msg["Subject"] = subject

            # Attach HTML Body
            html_content = self._generate_html_digest(role, location, jobs, summary_note, raw_total_count)
            html_part = MIMEText(html_content, "html", "utf-8")
            msg.attach(html_part)

            # Collect all CSV attachments to include
            all_attachments = []
            if csv_path:
                all_attachments.append(csv_path)
            if csv_paths:
                all_attachments.extend(csv_paths)

            for path in set(all_attachments):
                if path and os.path.exists(path):
                    with open(path, "rb") as f:
                        csv_part = MIMEBase("application", "octet-stream")
                        csv_part.set_payload(f.read())
                        encoders.encode_base64(csv_part)
                        filename = os.path.basename(path)
                        csv_part.add_header("Content-Disposition", f'attachment; filename="{filename}"')
                        msg.attach(csv_part)

            server = self._get_smtp_connection()
            server.sendmail(from_email, [to_email], msg.as_string())
            server.quit()
            print(f"Successfully sent email digest to {to_email} with {len(jobs)} jobs and {len(all_attachments)} CSV attachments.")
            return True
        except Exception as e:
            print(f"Failed to send email to {to_email}: {e}")
            return False

    def send_welcome_confirmation(self, to_email: str, role: str, location: str, scheduled_time: str) -> bool:
        """
        Sends a welcome confirmation email when user schedules a new automation.
        """
        from_email = self._get_from_email()
        try:
            subject = f"⚡ Daily Job Alert Activated for {role}"
            msg = MIMEMultipart("alternative")
            msg["From"] = f"JobAgent AI <{from_email}>"
            msg["To"] = to_email
            msg["Subject"] = subject

            html = f"""
            <div style="background: #0b0f19; color: #f8fafc; font-family: sans-serif; padding: 24px;">
                <div style="max-width: 540px; margin: 0 auto; background: #0f172a; border-radius: 12px; padding: 24px; border: 1px solid rgba(255,255,255,0.1);">
                    <h2 style="color: #60a5fa; margin-top: 0;">⚡ Daily Job Alert Activated!</h2>
                    <p style="color: #cbd5e1;">You have scheduled daily job discovery for:</p>
                    <ul style="color: #94a3b8;">
                        <li><strong>Target Role:</strong> {role}</li>
                        <li><strong>Location:</strong> {location or 'Remote / Worldwide'}</li>
                        <li><strong>Daily Delivery Time:</strong> {scheduled_time}</li>
                    </ul>
                    <p style="color: #cbd5e1;">We will scrape LinkedIn, Indeed, Freehire, and Himalayas daily, deduplicate duplicate postings, score fit with Mistral AI, and send you a morning email with the top matches and CSV attachments.</p>
                </div>
            </div>
            """
            msg.attach(MIMEText(html, "html", "utf-8"))

            server = self._get_smtp_connection()
            server.sendmail(from_email, [to_email], msg.as_string())
            server.quit()
            return True
        except Exception as e:
            print(f"Failed to send welcome email: {e}")
            return False

email_service = EmailService()

