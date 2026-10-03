import os
import json
import uuid
import subprocess
from datetime import datetime
from typing import List, Dict, Any, Optional
from src.config import settings

class EmailService:
    """
    Service for sending rich HTML job digests with CSV attachments strictly via Nodemailer.
    """
    def _get_from_email(self) -> str:
        return settings.EMAIL_FROM or os.getenv("EMAIL_FROM") or ""

    def _get_password(self) -> str:
        return settings.EMAIL_PASSWORD or os.getenv("EMAIL_PASSWORD") or ""

    def _send_via_nodemailer(self, to_email: str, subject: str, html_content: str, attachment_paths: List[str]) -> bool:
        """
        Dispatches email using Node.js Nodemailer engine.
        """
        from_email = self._get_from_email()
        password = self._get_password()
        brevo_key = getattr(settings, "BREVO_API_KEY", None) or os.getenv("BREVO_API_KEY")

        if not brevo_key and not (from_email and password):
            print("[EmailService] Notice: Neither BREVO_API_KEY nor EMAIL_FROM/EMAIL_PASSWORD is configured. Email dispatch skipped.")
            return False
        
        attachments = []
        for path in set(attachment_paths):
            if path and os.path.exists(path):
                attachments.append({
                    "filename": os.path.basename(path),
                    "path": os.path.abspath(path)
                })

        payload = {
            "from_email": from_email,
            "password": password,
            "to_email": to_email,
            "subject": subject,
            "html_content": html_content,
            "attachments": attachments,
            "brevo_api_key": brevo_key
        }

        # Calculate backend root directory
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        scratch_dir = os.path.join(backend_dir, "scratch")
        os.makedirs(scratch_dir, exist_ok=True)
        payload_path = os.path.join(scratch_dir, f"mail_payload_{uuid.uuid4().hex}.json")
        script_path = os.path.join(backend_dir, "scripts", "send_email.js")

        try:
            with open(payload_path, "w", encoding="utf-8") as f:
                json.dump(payload, f)

            res = subprocess.run(["node", script_path, payload_path], capture_output=True, text=True, timeout=15)
            
            if res.returncode == 0:
                print(f"[EmailService/Runner] {res.stdout.strip()}")
                return True
            else:
                print(f"[EmailService/Nodemailer Failed]: {res.stderr.strip() or res.stdout.strip()}")
                return False
        except Exception as err:
            print(f"[EmailService/Nodemailer Exception]: {err}")
            return False
        finally:
            if os.path.exists(payload_path):
                try:
                    os.remove(payload_path)
                except Exception:
                    pass

    def _generate_html_digest(
        self,
        role: str,
        location: str,
        jobs: List[Dict[str, Any]],
        summary_note: str = "",
        raw_total_count: Optional[int] = None,
        sub_domain: str = "All",
        ai_facets: Optional[List[str]] = None
    ) -> str:
        today_str = datetime.now().strftime("%B %d, %Y")
        total_raw = raw_total_count if raw_total_count is not None else len(jobs)
        facets_list = ai_facets or []

        jobs_html = ""
        for idx, job in enumerate(jobs[:12]):
            score = round(job.get("match_score", 0))
            score_color = "#10b981" if score >= 80 else ("#f59e0b" if score >= 65 else "#6366f1")

            matching_skills = job.get("matching_skills", [])
            skills_badge_html = "".join([
                f'<span style="display: inline-block; background: rgba(16, 185, 129, 0.15); color: #10b981; font-size: 11px; padding: 2px 8px; border-radius: 4px; margin-right: 4px; margin-bottom: 4px; font-weight: 600;">✓ {s}</span>'
                for s in matching_skills[:6]
            ])

            salary_html = ""
            if job.get("salary_range"):
                min_s = job["salary_range"].get("min")
                max_s = job["salary_range"].get("max")
                curr = job["salary_range"].get("currency", "$")
                if min_s and max_s:
                    salary_html = f'<span style="color: #38bdf8; font-size: 12px; margin-left: 8px; font-weight: 600;">💰 {curr}{min_s:,.0f} - {max_s:,.0f}</span>'
                elif min_s:
                    salary_html = f'<span style="color: #38bdf8; font-size: 12px; margin-left: 8px; font-weight: 600;">💰 > {curr}{min_s:,.0f}</span>'

            job_sub = job.get("sub_domain") or sub_domain
            sub_badge = f'<span style="display: inline-block; background: rgba(99, 102, 241, 0.2); color: #a5b4fc; font-size: 11px; padding: 2px 8px; border-radius: 4px; margin-right: 6px; font-weight: bold; border: 1px solid rgba(99, 102, 241, 0.3);">⚡ {job_sub}</span>' if job_sub and job_sub != "All" else ""

            from src.utils.location_helper import detect_work_mode
            wmode = job.get("work_mode") or detect_work_mode(job.get("location", ""), job.get("title", ""), job.get("description", ""))
            mode_icon = "🏠" if wmode == "Remote" else ("🔄" if wmode == "Hybrid" else "🏢")
            mode_badge = f'<span style="display: inline-block; background: rgba(6, 182, 212, 0.15); color: #67e8f9; font-size: 11px; padding: 2px 8px; border-radius: 4px; margin-right: 6px; font-weight: 500;">{mode_icon} {wmode}</span>'

            role_fit = round(job.get("role_match_score", score))
            skill_fit = round(job.get("skill_match_score", score))
            exp_fit = round(job.get("exp_match_score", score))
            loc_fit = round(job.get("loc_match_score", score))

            breakdown_html = f"""
            <div style="background: rgba(15, 23, 42, 0.6); border-radius: 6px; padding: 6px 10px; margin: 8px 0; display: flex; gap: 12px; font-size: 11px; color: #94a3b8; flex-wrap: wrap;">
                <span>Role: <strong style="color: #e2e8f0;">{role_fit}%</strong></span>
                <span>Skills: <strong style="color: #e2e8f0;">{skill_fit}%</strong></span>
                <span>Exp: <strong style="color: #e2e8f0;">{exp_fit}%</strong></span>
                <span>Location: <strong style="color: #e2e8f0;">{loc_fit}%</strong></span>
            </div>
            """

            comp = job.get("company", "")
            recruiter_hint = f'<div style="font-size: 11px; color: #64748b; margin-top: 4px;">✉️ Outbound Contact: <code>talent@{comp.lower().replace(" ", "")}.com</code></div>' if comp else ""

            jobs_html += f"""
            <div style="background: #1e293b; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 18px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <div>
                        <h3 style="margin: 0 0 4px 0; color: #f8fafc; font-size: 16px; font-weight: 700;">{job.get('title', 'Unknown Role')}</h3>
                        <p style="margin: 0; color: #94a3b8; font-size: 13px;">
                            🏢 <strong style="color: #cbd5e1;">{job.get('company', 'Unknown Company')}</strong> &nbsp;|&nbsp; 📍 {job.get('location', 'Remote')} {salary_html}
                        </p>
                    </div>
                    <div style="text-align: right;">
                        <div style="background: {score_color}22; border: 1px solid {score_color}66; color: {score_color}; font-size: 13px; font-weight: 800; padding: 4px 12px; border-radius: 20px; text-align: right; white-space: nowrap; display: inline-block;">
                            ★ {score}% Match
                        </div>
                        {f'<div style="font-size: 10px; font-weight: bold; color: #f59e0b; margin-top: 4px;">⚠️ Reposted ({job.get("repost_badge")})</div>' if job.get("is_repost") else ''}
                    </div>
                </div>

                <div style="margin: 6px 0;">
                    {sub_badge}
                    {mode_badge}
                </div>

                {breakdown_html}

                <div style="margin: 8px 0 10px 0;">
                    {skills_badge_html}
                </div>

                {f'<p style="margin: 0 0 10px 0; font-size: 12px; color: #94a3b8; border-left: 2px solid #6366f1; padding-left: 8px;">{job.get("match_reason")}</p>' if job.get("match_reason") else ''}

                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                    <a href="{job.get('url', '#')}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; padding: 8px 18px; border-radius: 6px;">View & Apply ↗</a>
                    {recruiter_hint}
                </div>
            </div>
            """

        active_facets_html = "".join([
            f'<span style="display: inline-block; background: rgba(99, 102, 241, 0.2); color: #c7d2fe; font-size: 11px; padding: 3px 8px; border-radius: 12px; margin-right: 4px; font-weight: 600;">{f}</span>'
            for f in facets_list
        ])

        return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Daily Job Digest - {role}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
    <div style="max-width: 680px; margin: 0 auto; padding: 24px 16px;">
        <div style="background: linear-gradient(135deg, #1e1b4b, #0f172a); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 16px; padding: 24px; margin-bottom: 20px; text-align: left;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="font-size: 20px;">⚡</span>
                <span style="color: #818cf8; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;">JobHunt Automated Intelligence</span>
            </div>
            <h1 style="margin: 0 0 6px 0; color: #ffffff; font-size: 22px; font-weight: 800;">Daily AI Job Digest</h1>
            <p style="margin: 0 0 12px 0; color: #94a3b8; font-size: 13px;">
                Curated for <strong style="color: #e2e8f0;">"{role}"</strong> in <strong style="color: #38bdf8;">{location or 'Worldwide'}</strong> on {today_str}
            </p>
            {f'<div style="margin-top: 8px;">{active_facets_html}</div>' if facets_list else ''}
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 10px 14px; margin-top: 14px; display: flex; justify-content: space-between; font-size: 12px;">
                <span>🎯 Curated Matches: <strong style="color: #10b981;">{len(jobs)}</strong></span>
                <span>🌐 Total Harvested: <strong style="color: #818cf8;">{total_raw}</strong></span>
                <span>📎 Full CSV Attached</span>
            </div>
        </div>

        <div>
            {jobs_html if jobs_html else '<p style="text-align: center; color: #94a3b8; padding: 30px;">No new matching jobs found for today criteria.</p>'}
        </div>

        <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 20px; text-align: center; color: #64748b; font-size: 12px;">
            <p style="margin: 0 0 6px 0;">This automated report was generated from 94+ verified corporate ATS portals and live boards.</p>
            <p style="margin: 0;">Access your full dashboard, company insights, and cold email outreach drafts anytime at <a href="http://localhost:3000" style="color: #818cf8; text-decoration: none; font-weight: 600;">JobHunt Dashboard</a></p>
        </div>
    </div>
</body>
</html>
"""

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
        Sends HTML email digest with one or more CSV attachments strictly via Nodemailer.
        """
        today_str = datetime.now().strftime("%Y-%m-%d")
        subject = f"🎯 {len(jobs)} Curated {role} Jobs ({location or 'Remote'}) - {today_str}"
        html_content = self._generate_html_digest(role, location, jobs, summary_note, raw_total_count)

        all_attachments = []
        if csv_path:
            all_attachments.append(csv_path)
        if csv_paths:
            all_attachments.extend(csv_paths)

        return self._send_via_nodemailer(to_email, subject, html_content, all_attachments)

    def send_welcome_confirmation(self, to_email: str, role: str, location: str, scheduled_time: str) -> bool:
        """
        Sends a welcome confirmation email when user schedules a new automation strictly via Nodemailer.
        """
        subject = f"⚡ Daily Job Alert Activated for {role}"
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
                <p style="color: #cbd5e1;">We will scrape LinkedIn, Indeed, Freehire, and Himalayas daily, deduplicate duplicate postings, score fit with Google Gemini AI, and send you a morning email with top matches and CSV attachments.</p>
            </div>
        </div>
        """

    def send_cookie_expired_alert(self, to_email: str, scheduled_time: str, role: str, frontend_url: Optional[str] = None) -> bool:
        """
        Sends an automated notification when user's LinkedIn li_at cookie is detected as expired
        prior to their scheduled daily automation run.
        """
        app_url = frontend_url or getattr(settings, "FRONTEND_URL", "http://localhost:3000")
        if isinstance(app_url, str) and "," in app_url:
            app_url = app_url.split(",")[0].strip()

        subject = f"⚠️ Action Required: Your LinkedIn Session Cookie has Expired — JobAgent AI"
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #090d16; color: #f8fafc; margin: 0; padding: 0; }}
                .container {{ max-width: 560px; margin: 24px auto; background-color: #0f172a; border-radius: 14px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1); }}
                .header {{ background: #1e1b4b; border-bottom: 2px solid #ef4444; padding: 24px; text-align: center; }}
                .content {{ padding: 24px; }}
                .btn {{ display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; padding: 10px 20px; border-radius: 8px; margin-top: 16px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2 style="margin: 0; color: #f87171; font-size: 20px;">⚠️ LinkedIn Session Cookie Expired</h2>
                    <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 13px;">Pre-Automation Health Check Notification</p>
                </div>
                
                <div class="content">
                    <p style="font-size: 13px; color: #cbd5e1; line-height: 1.6;">
                        Hi there,<br><br>
                        Our automated health checker detected that your personal <strong>LinkedIn session cookie (<code>li_at</code>) has expired</strong>.
                    </p>
                    
                    <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 8px; padding: 14px; margin: 16px 0; font-size: 12px; color: #fca5a5;">
                        ⏰ <strong>Scheduled Run Impact:</strong> Your daily job digest for <strong>{role}</strong> is scheduled for delivery at <strong>{scheduled_time}</strong>.
                        Without an active LinkedIn cookie, recruiter & hiring manager contact discovery may use fallback search dorking.
                    </div>
                    
                    <h3 style="font-size: 13px; color: #f8fafc; margin: 16px 0 8px 0;">How to refresh your cookie in 30 seconds:</h3>
                    <ol style="font-size: 12px; color: #94a3b8; line-height: 1.8; padding-left: 20px; margin: 0 0 16px 0;">
                        <li>Open <a href="https://www.linkedin.com" target="_blank" style="color: #818cf8;">LinkedIn.com</a> in your browser.</li>
                        <li>Press <code>F12</code> &rarr; Application &rarr; Cookies &rarr; <code>.linkedin.com</code>.</li>
                        <li>Copy the value of the <code>li_at</code> cookie.</li>
                        <li>Paste it into your JobAgent AI dashboard under <strong>LinkedIn Cookie Settings</strong>.</li>
                    </ol>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="{app_url}" class="btn" style="color: #ffffff;">Update LinkedIn Cookie Now &rarr;</a>
                    </div>
                </div>
                
                <div style="background-color: #080c15; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                    JobAgent AI Automation Engine • Automated Cookie Health Sentinel
                </div>
            </div>
        </body>
        </html>
        """
        return self._send_via_nodemailer(to_email, subject, html, [])

    def send_password_reset_otp(self, to_email: str, otp_code: str) -> bool:
        """
        Sends a secure, 6-digit one-time password (OTP) verification email for password reset.
        """
        subject = f"🔐 Your Password Reset OTP: {otp_code} (JobHunt AI)"
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f8fafc; margin: 0; padding: 24px 12px; }}
                .container {{ max-width: 520px; margin: 0 auto; background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }}
                .header {{ background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 28px 24px; text-align: center; }}
                .content {{ padding: 28px 24px; text-align: center; }}
                .otp-box {{ background: #1e293b; border: 2px dashed #6366f1; border-radius: 12px; padding: 18px 24px; margin: 24px auto; display: inline-block; letter-spacing: 8px; font-size: 32px; font-weight: 800; color: #38bdf8; font-family: monospace; }}
                .badge {{ display: inline-block; background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 9999px; padding: 4px 14px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }}
                .footer {{ background-color: #080c15; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid rgba(255, 255, 255, 0.05); }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff;">🔐 Password Reset Request</h1>
                    <p style="margin: 6px 0 0 0; color: #e0e7ff; font-size: 13px;">JobHunt AI Authentication Sentinel</p>
                </div>
                
                <div class="content">
                    <span class="badge">⏰ Valid for 15 Minutes</span>
                    <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6; margin: 0 0 16px 0;">
                        We received a request to reset your JobHunt AI account password. Use the single-use verification code below to complete your password reset:
                    </p>
                    
                    <div class="otp-box">
                        {otp_code}
                    </div>
                    
                    <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 20px 0 0 0;">
                        Enter this code on the password reset screen along with your new password. If you didn't request a password reset, you can safely disregard this email. Your password will remain unchanged.
                    </p>
                </div>
                
                <div class="footer">
                    JobHunt AI Security Team • Automated Verification System
                </div>
            </div>
        </body>
        </html>
        """
        return self._send_via_nodemailer(to_email, subject, html, [])

email_service = EmailService()

