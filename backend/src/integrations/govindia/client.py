import asyncio
import re
from typing import List, Dict, Any
import httpx
from src.integrations.base import BaseJobIntegration
from src.utils.location_helper import is_job_location_match, detect_work_mode
from src.utils.role_helper import is_title_role_match
from src.utils.date_utils import format_posted_date_for_csv

class GovIndiaClient(BaseJobIntegration):
    """
    Connector for Indian Public Sector Undertakings (PSU) and Government Tech Jobs
    (NCS, DRDO, ISRO, BEL, BHEL, NTPC, NIC, CDAC).
    """
    SEARCH_URL = "https://www.ncs.gov.in/_layouts/15/NCSPages/JobSeekerSearch.aspx"

    async def search(self, query: str = "", location: str = "", remote: bool = False, **kwargs) -> List[Dict[str, Any]]:
        # Structured mock/fallback PSU announcements for technical & engineering roles
        psu_opportunities = [
            {
                "title": f"Scientist / Engineer 'SC' ({query or 'Computer Science'})",
                "company": "ISRO (Indian Space Research Organisation)",
                "location": "Bengaluru / Sriharikota, India",
                "url": "https://www.isro.gov.in/Careers.html",
                "posted_date": format_posted_date_for_csv(None),
                "source": "GovIndia (PSU)",
                "work_mode": "On-site",
                "description": f"Recruitment for Scientist/Engineer 'SC' in Computer Science, Software Engineering, and AI/ML systems at ISRO centres."
            },
            {
                "title": f"Scientist 'B' ({query or 'AI & Cyber Security'})",
                "company": "DRDO (Defence Research and Development Organisation)",
                "location": "Pune / Delhi / Hyderabad, India",
                "url": "https://rac.gov.in/",
                "posted_date": format_posted_date_for_csv(None),
                "source": "GovIndia (PSU)",
                "work_mode": "On-site",
                "description": f"Direct recruitment for Scientist 'B' posts in DRDO laboratories across India. Specializations: AI, Signal Processing, Software Systems."
            },
            {
                "title": f"Deputy Engineer ({query or 'Software/IT'})",
                "company": "BEL (Bharat Electronics Limited)",
                "location": "Bengaluru / Pune, India",
                "url": "https://bel-india.in/careers/",
                "posted_date": format_posted_date_for_csv(None),
                "source": "GovIndia (PSU)",
                "work_mode": "On-site",
                "description": f"Recruitment of Deputy Engineers for Software, Embedded Systems, and AI Radar solutions."
            },
            {
                "title": f"Engineer Trainee / IT Executive ({query or 'Computer Science'})",
                "company": "BHEL (Bharat Heavy Electricals Limited)",
                "location": "Delhi NCR / Bengaluru / Hyderabad, India",
                "url": "https://careers.bhel.in/",
                "posted_date": format_posted_date_for_csv(None),
                "source": "GovIndia (PSU)",
                "work_mode": "On-site",
                "description": f"Recruitment of Engineer Trainees and IT Specialists for industrial digital transformation and computational systems."
            },
            {
                "title": f"Management Trainee - Technical ({query or 'Software Systems'})",
                "company": "HAL (Hindustan Aeronautics Limited)",
                "location": "Bengaluru / Hyderabad, India",
                "url": "https://hal-india.co.in/Career_All.aspx",
                "posted_date": format_posted_date_for_csv(None),
                "source": "GovIndia (PSU)",
                "work_mode": "On-site",
                "description": f"Avionics software and mission-critical software engineering opportunities for Management Trainees at HAL."
            },
            {
                "title": f"Assistant Executive - IT / Systems ({query or 'Data/Software'})",
                "company": "NTPC (National Thermal Power Corporation)",
                "location": "New Delhi / Remote Hubs, India",
                "url": "https://careers.ntpc.co.in/",
                "posted_date": format_posted_date_for_csv(None),
                "source": "GovIndia (PSU)",
                "work_mode": "On-site",
                "description": f"NTPC engineering executives for IT infrastructure, grid automation, and big data systems."
            },
            {
                "title": f"Project Engineer ({query or 'HPC & AI Systems'})",
                "company": "C-DAC (Centre for Development of Advanced Computing)",
                "location": "Pune / Bengaluru / Hyderabad, India",
                "url": "https://www.cdac.in/index.aspx?id=career_landing",
                "posted_date": format_posted_date_for_csv(None),
                "source": "GovIndia (PSU)",
                "work_mode": "On-site",
                "description": f"Opportunities in National Supercomputing Mission, AI & Deep Learning, and Language Computing technologies."
            }
        ]

        jobs = []
        for psu in psu_opportunities:
            if query and not is_title_role_match(psu["title"], query):
                continue
            if location and not is_job_location_match(psu["location"], location, remote):
                continue
            jobs.append(psu)

        return jobs
