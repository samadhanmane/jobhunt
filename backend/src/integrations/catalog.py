# -*- coding: utf-8 -*-
"""
Master catalog of verified AI, DeepTech, and Enterprise ATS job boards.
Categorized by ATS provider: Greenhouse, Ashby, Lever, Workday, Workable, Phenom.
"""

# Dedicated Top-Tier Direct AI & ML Company Registry
AI_COMPANIES = [
    {"name": "OpenAI", "provider": "ashby", "slug": "openai", "careers_url": "https://jobs.ashbyhq.com/openai", "category": "ai_ml"},
    {"name": "Anthropic", "provider": "greenhouse", "slug": "anthropic", "careers_url": "https://job-boards.greenhouse.io/anthropic", "api": "https://boards-api.greenhouse.io/v1/boards/anthropic/jobs", "category": "ai_ml"},
    {"name": "NVIDIA", "provider": "workday", "tenant": "nvidia", "site": "NVIDIAExternalCareerSite", "wd_num": 1, "careers_url": "https://nvidia.wd1.myworkdayjobs.com/NVIDIAExternalCareerSite", "category": "ai_ml"},
    {"name": "Mistral AI", "provider": "lever", "slug": "mistral", "careers_url": "https://jobs.lever.co/mistral", "category": "ai_ml"},
    {"name": "Cohere", "provider": "ashby", "slug": "cohere", "careers_url": "https://jobs.ashbyhq.com/cohere", "category": "ai_ml"},
    {"name": "Hugging Face", "provider": "workable", "slug": "huggingface", "careers_url": "https://apply.workable.com/huggingface/", "category": "ai_ml"},
    {"name": "xAI", "provider": "ashby", "slug": "xai", "careers_url": "https://jobs.ashbyhq.com/xai", "category": "ai_ml"},
    {"name": "Perplexity", "provider": "ashby", "slug": "perplexity", "careers_url": "https://jobs.ashbyhq.com/perplexity", "category": "ai_ml"},
    {"name": "Scale AI", "provider": "greenhouse", "slug": "scaleai", "careers_url": "https://job-boards.greenhouse.io/scaleai", "api": "https://boards-api.greenhouse.io/v1/boards/scaleai/jobs", "category": "ai_ml"},
    {"name": "Together AI", "provider": "ashby", "slug": "togetherai", "careers_url": "https://jobs.ashbyhq.com/togetherai", "category": "ai_ml"},
    {"name": "Replicate", "provider": "ashby", "slug": "replicate", "careers_url": "https://jobs.ashbyhq.com/replicate", "category": "ai_ml"},
    {"name": "Cursor", "provider": "ashby", "slug": "anysphere", "careers_url": "https://jobs.ashbyhq.com/anysphere", "category": "ai_ml"},
    {"name": "Runway", "provider": "ashby", "slug": "runwayml", "careers_url": "https://jobs.ashbyhq.com/runwayml", "category": "ai_ml"},
    {"name": "ElevenLabs", "provider": "ashby", "slug": "elevenlabs", "careers_url": "https://jobs.ashbyhq.com/elevenlabs", "category": "ai_ml"},
    {"name": "Deepgram", "provider": "ashby", "slug": "deepgram", "careers_url": "https://jobs.ashbyhq.com/deepgram", "category": "ai_ml"},
    {"name": "Pinecone", "provider": "ashby", "slug": "pinecone", "careers_url": "https://jobs.ashbyhq.com/pinecone", "category": "ai_ml"},
    {"name": "LangChain", "provider": "ashby", "slug": "langchain", "careers_url": "https://jobs.ashbyhq.com/langchain", "category": "ai_ml"},
    {"name": "Decagon", "provider": "ashby", "slug": "decagon", "careers_url": "https://jobs.ashbyhq.com/decagon", "category": "ai_ml"},
    {"name": "Sierra", "provider": "ashby", "slug": "sierra", "careers_url": "https://jobs.ashbyhq.com/sierra", "category": "ai_ml"},
    {"name": "Lindy", "provider": "ashby", "slug": "lindy", "careers_url": "https://jobs.ashbyhq.com/lindy", "category": "ai_ml"},
    {"name": "Vapi", "provider": "ashby", "slug": "vapi", "careers_url": "https://jobs.ashbyhq.com/vapi", "category": "ai_ml"},
    {"name": "Bland AI", "provider": "ashby", "slug": "bland", "careers_url": "https://jobs.ashbyhq.com/bland", "category": "ai_ml"},
]

COMPANY_CATALOG = [
    # Direct AI Companies
    *AI_COMPANIES,
    # High-growth & DeepTech
    {"name": "PolyAI", "provider": "greenhouse", "slug": "polyai", "careers_url": "https://job-boards.eu.greenhouse.io/polyai", "api": "https://boards-api.greenhouse.io/v1/boards/polyai/jobs"},
    {"name": "Parloa", "provider": "greenhouse", "slug": "parloa", "careers_url": "https://job-boards.eu.greenhouse.io/parloa", "api": "https://boards-api.greenhouse.io/v1/boards/parloa/jobs"},
    {"name": "Intercom", "provider": "greenhouse", "slug": "intercom", "careers_url": "https://job-boards.greenhouse.io/intercom", "api": "https://boards-api.greenhouse.io/v1/boards/intercom/jobs"},
    {"name": "Hume AI", "provider": "greenhouse", "slug": "humeai", "careers_url": "https://job-boards.greenhouse.io/humeai", "api": "https://boards-api.greenhouse.io/v1/boards/humeai/jobs"},
    {"name": "Airtable", "provider": "greenhouse", "slug": "airtable", "careers_url": "https://job-boards.greenhouse.io/airtable", "api": "https://boards-api.greenhouse.io/v1/boards/airtable/jobs"},
    {"name": "Vercel", "provider": "greenhouse", "slug": "vercel", "careers_url": "https://job-boards.greenhouse.io/vercel", "api": "https://boards-api.greenhouse.io/v1/boards/vercel/jobs"},
    {"name": "Temporal", "provider": "greenhouse", "slug": "temporal", "careers_url": "https://job-boards.greenhouse.io/temporal", "api": "https://boards-api.greenhouse.io/v1/boards/temporal/jobs"},
    {"name": "Arize AI", "provider": "greenhouse", "slug": "arizeai", "careers_url": "https://job-boards.greenhouse.io/arizeai", "api": "https://boards-api.greenhouse.io/v1/boards/arizeai/jobs"},
    {"name": "RunPod", "provider": "greenhouse", "slug": "runpod", "careers_url": "https://job-boards.greenhouse.io/runpod", "api": "https://boards-api.greenhouse.io/v1/boards/runpod/jobs"},
    {"name": "Glean", "provider": "greenhouse", "slug": "gleanwork", "careers_url": "https://job-boards.greenhouse.io/gleanwork", "api": "https://boards-api.greenhouse.io/v1/boards/gleanwork/jobs"},
    {"name": "Speechmatics", "provider": "greenhouse", "slug": "speechmatics", "careers_url": "https://job-boards.greenhouse.io/speechmatics", "api": "https://boards-api.greenhouse.io/v1/boards/speechmatics/jobs"},
    {"name": "n8n", "provider": "ashby", "slug": "n8n", "careers_url": "https://jobs.ashbyhq.com/n8n", "api": ""},
    {"name": "Zapier", "provider": "ashby", "slug": "zapier", "careers_url": "https://jobs.ashbyhq.com/zapier", "api": ""},
    {"name": "Palantir", "provider": "lever", "slug": "palantir", "careers_url": "https://jobs.lever.co/palantir", "api": ""},
    {"name": "Sanctuary AI", "provider": "lever", "slug": "sanctuary", "careers_url": "https://jobs.lever.co/sanctuary", "api": ""},
    {"name": "Semios", "provider": "workable", "slug": "semios", "careers_url": "https://apply.workable.com/semios/", "api": ""},
    {"name": "Attio", "provider": "ashby", "slug": "attio", "careers_url": "https://jobs.ashbyhq.com/attio", "api": ""},
    {"name": "Tinybird", "provider": "ashby", "slug": "tinybird", "careers_url": "https://jobs.ashbyhq.com/tinybird", "api": ""},
    {"name": "Clarity AI", "provider": "lever", "slug": "clarity-ai", "careers_url": "https://jobs.lever.co/clarity-ai", "api": ""},
    {"name": "Aleph Alpha", "provider": "ashby", "slug": "AlephAlpha", "careers_url": "https://jobs.ashbyhq.com/AlephAlpha", "api": ""},
    {"name": "DeepL", "provider": "ashby", "slug": "DeepL", "careers_url": "https://jobs.ashbyhq.com/DeepL", "api": ""},
    {"name": "Wayve", "provider": "greenhouse", "slug": "wayve", "careers_url": "https://job-boards.greenhouse.io/wayve", "api": "https://boards-api.greenhouse.io/v1/boards/wayve/jobs"},
    {"name": "Synthesia", "provider": "ashby", "slug": "synthesia", "careers_url": "https://jobs.ashbyhq.com/synthesia", "api": ""},
    {"name": "Lovable", "provider": "ashby", "slug": "lovable", "careers_url": "https://jobs.ashbyhq.com/lovable", "api": ""},
    {"name": "Supabase", "provider": "ashby", "slug": "supabase", "careers_url": "https://jobs.ashbyhq.com/supabase", "api": ""},
    {"name": "Resend", "provider": "ashby", "slug": "resend", "careers_url": "https://jobs.ashbyhq.com/resend", "api": ""},
    {"name": "Clerk", "provider": "ashby", "slug": "clerk", "careers_url": "https://jobs.ashbyhq.com/clerk", "api": ""},
    {"name": "Inngest", "provider": "ashby", "slug": "inngest", "careers_url": "https://jobs.ashbyhq.com/inngest", "api": ""},
    {"name": "Toggl", "provider": "workable", "slug": "toggl", "careers_url": "https://apply.workable.com/toggl", "api": ""},
    {"name": "Doist", "provider": "workable", "slug": "doist", "careers_url": "https://apply.workable.com/doist", "api": ""},
    {"name": "Allianz", "provider": "phenom", "slug": "careers.allianz.com", "careers_url": "https://careers.allianz.com", "api": ""},
]

# Deduplicate catalog by provider + slug
_seen_keys = set()
_deduped_catalog = []
for c in COMPANY_CATALOG:
    k = (c.get("provider"), c.get("slug") or c.get("tenant"))
    if k not in _seen_keys:
        _seen_keys.add(k)
        _deduped_catalog.append(c)
COMPANY_CATALOG = _deduped_catalog

GREENHOUSE_COMPANIES = [c for c in COMPANY_CATALOG if c.get("provider") == "greenhouse"]
ASHBY_COMPANIES = [c for c in COMPANY_CATALOG if c.get("provider") == "ashby"]
LEVER_COMPANIES = [c for c in COMPANY_CATALOG if c.get("provider") == "lever"]
PHENOM_COMPANIES = [c for c in COMPANY_CATALOG if c.get("provider") == "phenom"]
WORKABLE_COMPANIES = [c for c in COMPANY_CATALOG if c.get("provider") == "workable"]
WORKDAY_COMPANIES = [c for c in COMPANY_CATALOG if c.get("provider") == "workday"]

