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
        return settings.EMAIL_FROM or os.getenv("EMAIL_FROM") or "sm8199849@gmail.com"

    def _get_password(self) -> str:
        return settings.EMAIL_PASSWORD or os.getenv("EMAIL_PASSWORD") or "sqzbfaesgowgzrne"

    def _send_via_nodemailer(self, to_email: str, subject: str, html_content: str, attachment_paths: List[str]) -> bool:
        """
        Dispatches email using Node.js Nodemailer engine.
        """
        from_email = self._get_from_email()
        password = self._get_password()
        
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
            "attachments": attachments
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

            res = subprocess.run(["node", script_path, payload_path], capture_output=True, text=True, timeout=45)
            
            if res.returncode == 0:
                print(f"[EmailService/Nodemailer] {res.stdout.strip()}")
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
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0f19; color: #f8fafc; margin: 0; padding: 0; }}
                .container {{ max-width: 600px; margin: 20px auto; background-color: #0f172a; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1); shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }}
                .header {{ background: linear-gradient(135deg, #4f46e5, #7c3aed, #06b6d4); padding: 32px 24px; text-align: center; }}
                .content {{ padding: 24px; }}
                .footer {{ background-color: #070a12; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255, 255, 255, 0.05); }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">⚡ JobAgent AI Digest</h1>
                    <p style="margin: 6px 0 0 0; color: #e0e7ff; font-size: 14px;">Curated Intelligence for <strong>{role}</strong> ({location or 'Remote'})</p>
                </div>
                
                <div class="content">
                    <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 10px; padding: 14px; margin-bottom: 20px; font-size: 13px; color: #c7d2fe;">
                        📊 <strong>Scan Results ({today_str}):</strong> Discovered <strong>{total_raw}</strong> total postings. AI filtered <strong>{len(jobs)}</strong> top matching roles for your alert criteria.
                    </div>
                    
                    {f'<div style="background: #1e1b4b; border-left: 4px solid #818cf8; padding: 12px 16px; border-radius: 4px; margin-bottom: 20px; font-size: 13px; color: #e0e7ff;">💡 {summary_note}</div>' if summary_note else ''}
                    
                    <h2 style="font-size: 16px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;">Top Recommendations</h2>
                    
                    {jobs_html}
                    
                    <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                        <p style="color: #94a3b8; font-size: 13px; margin-bottom: 12px;">📎 Complete list of all {len(jobs)} jobs is attached as CSV files to this email.</p>
                    </div>
                </div>
                
                <div class="footer">
                    <p style="margin: 0;">Sent by JobAgent AI Engine • Real-time Automated Intelligence</p>
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
                <p style="color: #cbd5e1;">We will scrape LinkedIn, Indeed, Freehire, and Himalayas daily, deduplicate duplicate postings, score fit with Mistral AI, and send you a morning email with top matches and CSV attachments.</p>
            </div>
        </div>
        """

        return self._send_via_nodemailer(to_email, subject, html, [])

email_service = EmailService()
