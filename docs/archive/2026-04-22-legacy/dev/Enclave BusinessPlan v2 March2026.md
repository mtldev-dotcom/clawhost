

**ENCLAVE**

*Your AI. Your Data. Your Space.*

**Product Vision & Business Plan**

March 2026  ·  Confidential

# **1\.  Executive Summary**

Enclave is a multi-tenant SaaS platform that gives every subscriber a private, hosted AI co-worker. One subscription. One click. Instant deployment of a dedicated AI agent with its own subdomain, connected communication channels, a shared file workspace, deep third-party integrations, and a persistent memory that never forgets a single interaction — ever.

|  | The Core Promise We give you an AI assistant that remembers everything you have ever told it, can read and write to your documents and calendar, works across every messaging platform you already use, and operates in a private container that even we — the platform operators — cannot access or read. |
| :---- | :---- |

The market is crowded with AI chat interfaces, but they all share the same critical weaknesses: context resets at the end of every session, data lives on shared infrastructure visible to the provider, integrations are bolt-on afterthoughts, and there is no persistent workspace shared between user and agent. Enclave solves all four at once.

OpenClaw, the open-source agent runtime we build on, has grown to 337,000+ GitHub stars and an active community of tens of thousands of power users who are already running it 24/7 on their own servers. Enclave makes all of that accessible to non-technical users with a two-minute signup and zero DevOps.

# **2\.  The Problem We Solve**

## **2.1  AI Assistants Forget Everything**

Every major AI product today — ChatGPT, Claude.ai, Gemini — resets memory at the end of every conversation. After 365 days of daily use, the AI knows nothing more about the user than it did on day one. Users who want continuity must manually paste context, re-explain their projects, and repeat preferences every single session. This is not a gap — it is a deliberate architectural choice made by platforms that treat memory as a liability.

## **2.2  No True Privacy Exists**

Every hosted AI platform has access to the content of user conversations. This is not a hypothetical risk — it is the technical default. Model training, abuse monitoring, and customer support all require the provider to read conversation data. For professionals handling client information, personal communications, or financial strategy, this is an unacceptable exposure with no current alternative.

## **2.3  No Single Workspace**

AI integrations today are isolated silos: a Notion AI button here, a Gmail summary there, a calendar assistant in a third app. There is no single AI co-worker that spans all of a user's tools simultaneously, maintains context across all of them, and learns from every interaction in every channel. Users must context-switch constantly, re-explaining the same project in six different apps.

## **2.4  Setup Complexity Blocks the Market**

OpenClaw is powerful and already has 337,000 GitHub stars — but it requires Node.js, terminal access, config files, Docker knowledge, and server management. The community estimates fewer than 5% of people who would benefit from a personal AI agent have the technical skill to self-host one. Enclave eliminates every technical barrier.

# **3\.  Our Solution — Five Pillars**

| Pillar | Category | What It Means |
| :---- | :---- | :---- |
| Private by Architecture | Architectural | Isolated container per user. Encryption key we never store. We physically cannot read your data. |
| Never Forgets | Memory | DAG-based full message persistence \+ semantic vector search \+ structured entity extraction. Ask about anything, ever. |
| Shared Workspace | Productivity | A file system both user and agent can read, write, and organize. The AI has a desk in your office. |
| Works Everywhere | Channels | 25+ messaging channels natively. Telegram, WhatsApp, Discord, Slack, iMessage, Email, Voice — agent follows you. |
| Extensible by Design | Platform | Skills marketplace, MCP integrations, cron automation, webhooks, multi-agent teams. Grows with the user. |

# **4\.  What OpenClaw Gives Us (Platform Foundation)**

Enclave is built on OpenClaw, one of the fastest-growing open-source projects of 2026 with 337,000 GitHub stars. The following is what we inherit from the platform and expose to users through our managed service — no DevOps required.

## **4.1  Communication Channels (25+)**

OpenClaw natively supports more messaging surfaces than any competing AI agent framework. Every channel listed below is available at launch or in our roadmap, configured from the Enclave dashboard with no technical setup required by the user.

| Channel | Status | Notes |
| :---- | :---- | :---- |
| Telegram | Live at Launch | Primary default channel. Full DM \+ group support, pairing code security, webhook mode. |
| WhatsApp | Live at Launch | Baileys-based integration. Personal and business accounts. |
| Discord | Phase 1 | Bot token setup, DM \+ server channels, slash commands, media support. |
| Slack | Phase 1 | Bolt integration, workspace messages, DM \+ channel routing. |
| Google Chat | Phase 1 | Google Chat API, space \+ DM messages. |
| Web Chat (Dashboard) | Phase 1 | Browser-based chat inside the Enclave virtual office interface. |
| iMessage / BlueBubbles | Phase 2 | macOS iMessage via BlueBubbles server (recommended) or legacy imsg. |
| Signal | Phase 2 | signal-cli based integration, high-privacy messaging. |
| Microsoft Teams | Phase 2 | Bot Framework integration, DM \+ team channels. |
| Matrix | Phase 2 | Decentralized, privacy-first messaging network. |
| Email (reply-by-email) | Phase 3 | Gmail Pub/Sub webhooks. Agent receives and sends email threads. |
| LINE / Feishu / Mattermost | Phase 3 | Asian market channels. Feishu \= Lark enterprise. |
| Nextcloud Talk / Synology Chat | Phase 3 | Self-hosted messaging platforms. |
| Nostr / Tlon | Phase 4 | Decentralized, crypto-native social channels. |
| Voice (phone call) | Phase 4 | Voice Wake \+ Talk Mode. Agent responds to spoken input. |
| WeChat | Phase 4 | Official Tencent plugin via @tencent-weixin/openclaw-weixin. |
| Twitch / Zalo / IRC | Phase 5 | Niche/streaming \+ Southeast Asian markets. |

## **4.2  Native Automation Engine**

OpenClaw has a built-in automation layer that goes far beyond simple chat. These are platform-native features every Enclave user gets immediately, configured via the dashboard.

| Feature | What It Enables |
| :---- | :---- |
| Cron Scheduling | Schedule agent tasks at any time or interval. Morning briefings, weekly reports, daily check-ins — all fire without any user input. |
| Webhooks | Receive external triggers from any service. A new Stripe payment, a GitHub push, a Notion database update — any webhook can wake the agent and trigger a workflow. |
| Gmail Pub/Sub | Agent monitors your inbox in real time via Google's push notification system. No polling. Instant response to new emails. |
| Multi-Agent Routing | Route different channels or accounts to different specialized agents. One agent for work, one for personal, one for a specific project — all managed from one dashboard. |
| Agent-to-Agent Messaging | Agents can spawn sub-tasks, send messages to each other, and coordinate work in parallel. A 'team' of agents working together on a complex job. |
| Live Canvas \+ A2UI | An agent-driven visual workspace. The agent can draw, diagram, and update a shared visual canvas in real time — meeting notes, mind maps, flow diagrams. |
| Browser Control | Agent controls a dedicated Chrome/Chromium instance. Can browse, fill forms, take screenshots, upload files, and interact with any website. |
| Session Control Commands | Users can send /compact, /reset, /think, /verbose, /usage directly in chat to control agent behavior without opening a dashboard. |

# **5\.  The Shared Workspace — The Virtual Office**

This is the centerpiece of the Enclave product and our most significant addition on top of raw OpenClaw. The dashboard is not a settings panel — it is a private collaborative space where user and AI both live and work. Think of it as a personal Google Drive that your AI co-worker has full access to, can organize, can search, and can write to on your behalf — but that only you and your agent can ever see.

|  | The Analogy Google Drive exists so you can store and organize your files. Your Enclave Workspace exists so you and your AI can store, organize, and act on your files together. The AI is not a visitor to your workspace — it is a co-owner with its own desk. |
| :---- | :---- |

## **5.1  File System (Enclave Drive)**

Every user gets a private, encrypted file storage layer that both they and their agent can read and write to. This is the foundation that makes the AI feel like a real co-worker rather than a chat window.

| Feature | Description |
| :---- | :---- |
| Upload & Organize | Users can upload files (PDF, DOCX, images, spreadsheets, code) directly from the dashboard. Agent automatically reads and indexes them. |
| Agent Can Write | Agent can create, edit, and save files to the workspace. Draft a report, save research notes, generate a spreadsheet — they appear in the user's file list. |
| Full-Text Search | Search across every file, note, and document in the workspace by content — not just filename. 'Find the contract with the Montreal clause' returns the right file. |
| Version History | Every file change is versioned. Users can see what the agent wrote, when, and roll back if needed. |
| Folders & Projects | Organize by project or client. Agent knows which context applies when working on a specific project folder. |
| Large File Handling | Files over 25k tokens are stored separately and summarized for the agent. The agent can retrieve full content on demand without filling its context window. |
| Shared Notes Layer | Markdown notes workspace. User and agent both create notes. Automatically cross-referenced with conversation history. |

## **5.2  Knowledge Base**

A curated space where users define what their agent should always know — their preferences, SOPs, key facts, and reference materials. This is the agent's 'manual,' separate from conversation history.

* **Personal SOP Library:** Standard operating procedures the agent follows for recurring tasks (e.g., 'always CC Sarah on client emails')

* **Tone & Style Guide:** Writing preferences the agent applies to all drafts (formal, French first, no bullet points, etc.)

* **Key Contacts:** Names, roles, relationship notes — the agent knows who is who

* **Project Briefs:** Background documents for ongoing projects the agent has permanent access to

* **Reference Materials:** Policies, rate cards, templates — any document the agent should consult before acting

## **5.3  Memory Dashboard**

Users can see, search, and edit exactly what their agent remembers. This is transparency-as-a-feature: users trust the AI more when they can inspect its memory, and they can correct mistakes directly.

* **Memory Timeline:** Chronological view of everything the agent has learned about the user

* **Entity Browser:** Browse all extracted contacts, projects, appointments, and preferences

* **Edit & Delete:** Users can correct wrong memories or delete sensitive information (GDPR-compliant)

* **Memory Export:** Download a full export of agent memory — you own your data and can take it with you

## **5.4  Activity Log & Audit Trail**

Every action the agent takes is logged with timestamp, tool used, and outcome. Users can see exactly what their AI did, when, and why — full transparency with no hidden actions.

# **6\.  Memory Architecture — The Never-Forget Engine**

Persistent, accurate, long-term memory is the feature that makes Enclave categorically different from every other AI product. It is built in three interlocking layers, all running inside the user's private container.

## **6.1  Layer 1 — Verbatim Recall: lossless-claw**

lossless-claw is an open-source OpenClaw plugin that replaces the default sliding-window truncation with a DAG (Directed Acyclic Graph) summarization system. Every message is persisted in a per-user SQLite database. Nothing is ever deleted.

* **lcm\_grep:** Full-text and regex search across all messages and summaries — find any conversation, ever

* **lcm\_expand\_query:** Deep recall via sub-agent delegation — agent searches DAG, expands summaries back to raw messages, and answers precisely

* **lcm\_describe:** Inspect specific summary nodes or stored large files by ID

* **Depth-aware summaries:** Leaf → condensed → arc-level summaries at increasing abstraction. Nothing discarded.

* **Large file interception:** Files over 25k tokens stored separately, exploration summary replaces them in context. Full content retrievable on demand.

|  | What This Means in Practice User asks in March 2027: 'What was the name of the contractor we discussed in January 2026?' Agent searches its DAG, expands the relevant summary back to the original message, and returns the exact answer. Not an approximation — the actual stored conversation content. |
| :---- | :---- |

## **6.2  Layer 2 — Semantic Recall: Qdrant**

Qdrant is a self-hosted vector database running as a sidecar container inside each user's instance. It enables meaning-based retrieval — the user does not need to remember exact words. Natural language queries find relevant content by meaning, not just keyword match.

* **Fuzzy recall:** 'Find that project about the Montreal renovation' works even if the word 'renovation' was never used

* **Cross-document search:** Semantic search spans conversation history, workspace files, knowledge base, and notes simultaneously

* **Zero external API:** Runs entirely inside the user's container — no data ever leaves the instance

## **6.3  Layer 3 — Structured Memory: Mem0**

Mem0 is a self-hosted AI memory layer that automatically extracts and organizes named entities from conversations into a queryable personal knowledge graph. The agent builds this silently as it works.

| Memory Type | Example — What the Agent Remembers |
| :---- | :---- |
| People & Contacts | "Sarah is my accountant, \+1-514-xxx-xxxx, she uses QuickBooks Online" |
| Projects & Clients | "Project Atlas \= bakery client e-commerce site, deadline Q4 2026, budget $15k" |
| Preferences | "Nick prefers formal French emails, no bullet points, always BCC himself" |
| Appointments | "Dentist every 6 months, last visit March 2026 with Dr. Leblanc" |
| Recurring Tasks | "Invoice Marc on the 1st of every month, $3,500 \+ tax" |
| Product Knowledge | "Company pricing: Starter $49/mo, Pro $149/mo, Enterprise custom" |
| Goals & Commitments | "Committed to shipping v2 before end of April, blocked on API design" |

## **6.4  Privacy Architecture**

Privacy is not a policy at Enclave. It is a technical guarantee enforced by the infrastructure. We are architecturally unable to read user data — not because of policy, but because we do not possess the decryption keys.

| Mechanism | Technical Detail |
| :---- | :---- |
| Key generation | At provisioning, a unique 256-bit encryption key is generated and injected directly as an env var into the user's container. Never written to our database. |
| Data isolation | lossless-claw SQLite, Qdrant vectors, Mem0 facts, and workspace files are all encrypted at rest using the user's key. Stored only on the persistent volume attached to their container. |
| Zero operator access | We store: email, subscription status, instance URL. We cannot technically read conversation content — a subpoena for conversation data would return nothing. |
| Backup ownership | Optional: nightly encrypted export to a user-owned S3 or Cloudflare R2 bucket. Their key, their bucket, their data. |
| GDPR / deletion | Deleting an account destroys the container, the volume, and all associated keys. Complete and cryptographically irreversible. |

# **7\.  Third-Party Integrations**

Integrations are surfaced to the agent as MCP (Model Context Protocol) tools. This means the AI does not just read data from connected apps — it can take real action: create events, send emails, update records, file tasks. The user approves each action category once; after that, the agent acts autonomously within those permissions.

## **7.1  Tier 1 — Productivity Core (Phase 1–2)**

| Integration | Access Level | Agent Capabilities |
| :---- | :---- | :---- |
| Google Calendar | Read \+ Write | Schedule meetings, check availability, set reminders, receive morning briefings, block focus time, prepare meeting agendas |
| Gmail / Google Mail | Read \+ Write | Triage inbox, draft replies, send with approval, label and archive, Gmail Pub/Sub for real-time alerts |
| Google Drive / Docs | Read \+ Write | Read and write documents in the user's existing Drive, sync files to Enclave workspace, co-edit documents |
| Google Sheets | Read \+ Write | Query data, update cells, generate reports, create charts, sync spreadsheets to workspace |
| Notion | Read \+ Write | Create pages, update databases, manage wikis, build and update project trackers, full Notion API access |
| Outlook / Microsoft 365 | Read \+ Write | Microsoft equivalent of Gmail \+ Calendar for business users |

## **7.2  Tier 2 — Tasks & Teams (Phase 2–3)**

| Integration | Access | Agent Capabilities |
| :---- | :---- | :---- |
| TickTick | Read \+ Write | Create, complete, and prioritize tasks. Agent creates tasks automatically during conversations without being asked. |
| Todoist | Read \+ Write | Project-based task management. Agent understands Todoist's project/section model. |
| Airtable | Read \+ Write | Query and update bases, create records, build views. Popular CRM and project tracker replacement. |
| Slack | Read \+ Write | Post updates, read channel history for context, DM team members, react to messages. |
| Discord | Read \+ Write | Server management, channel posting, role-based notifications, community management. |
| Linear | Read \+ Write | Issue creation, status updates, sprint tracking. Dev-team primary workflow. |
| GitHub | Read \+ Write | Open PRs, review issues, track deployments, monitor CI/CD status, Sentry → PR automation. |
| Jira | Read \+ Write | Create and update tickets, sprint reports, standup summaries. |
| Asana | Read \+ Write | Task creation, project updates, team assignment, deadline tracking. |

## **7.3  Tier 3 — Business & Finance (Phase 3–4)**

| Integration | Access | Agent Capabilities |
| :---- | :---- | :---- |
| Stripe | Read | Revenue reports, MRR tracking, invoice lookup, subscription management, failed payment alerts. |
| QuickBooks / FreshBooks | Read \+ Write | Expense categorization, invoice generation, financial reporting, payment tracking. |
| HubSpot | Read \+ Write | CRM updates, contact enrichment, pipeline management, follow-up scheduling. |
| Shopify | Read \+ Write | Order management, inventory alerts, customer lookup, sales reporting. |
| Zapier / Make | Write (trigger) | Trigger existing Zapier/Make automations from natural language. Bridge to 1,000+ additional apps. |
| Calendly | Read | Meeting link insertion, availability detection, booking confirmation. |

## **7.4  Tier 4 — Content & Media (Phase 4\)**

| Integration | Access | Agent Capabilities |
| :---- | :---- | :---- |
| WordPress / Ghost | Read \+ Write | Draft, publish, and schedule blog posts. Research-to-publish in one command. |
| Buffer / Hootsuite | Write | Schedule social posts across platforms from a single instruction. |
| YouTube | Read | Transcribe and summarize videos. Daily digest of followed channels. |
| RSS / News | Read | Monitor custom news feeds, industry publications, competitor blogs. |
| Spotify / Podcast apps | Read | Summarize podcast episodes, extract key insights for note-taking. |
| Readwise / Instapaper | Read \+ Write | Sync highlights and notes into the workspace knowledge base. |

## **7.5  Tier 5 — Developer & Power User (Phase 4–5)**

| Integration | Access | Agent Capabilities |
| :---- | :---- | :---- |
| Sentry | Read | Monitor error tracking, alert on new issues, auto-generate Codex PRs for common error patterns. |
| Railway / Render / Fly.io | Read \+ Write | Monitor deployment status, roll back failed deploys, receive build notifications. |
| Cloudflare | Read \+ Write | DNS management, worker deployments, analytics monitoring. |
| Vercel | Read | Deployment monitoring, preview link sharing, build log analysis. |
| Tailscale | Read \+ Write | VPN management, device status, secure gateway exposure. |
| NixOS / Docker / SSH | Read \+ Write | Server config management. Agent SSHs, applies config changes, rebuilds — all from chat. |

# **8\.  Skills Marketplace**

Skills are pre-built, opinionated workflows users activate with one click. They represent the highest-value layer of the product: hard-coded prompt engineering, multi-step tool orchestration, and workflow logic that would take a non-technical user months to replicate. OpenClaw's ClawHub already hosts 1,700+ community skills — Enclave packages, curates, and manages these for users while adding our own premium skill catalog.

## **8.1  Core Skills (Included with Pro)**

| Skill | What It Does |
| :---- | :---- |
| Morning Briefing | Delivered at chosen time via Telegram: weather, calendar overview, priority emails, open tasks, daily focus recommendation. Adapts depth to calendar density. |
| Evening Wind-Down | End-of-day summary: what was accomplished, what carries over, tomorrow's preview, any urgent items flagged overnight. |
| Meeting Prep | Before any calendar event: researches attendees (LinkedIn, web), drafts talking points, surfaces relevant files from workspace, prepares agenda draft. |
| Meeting Notes | Auto-transcribes meeting audio (via phone mic or uploaded recording), extracts action items, assigns them by name, creates tasks in TickTick/Todoist/Jira. |
| Inbox Zero | Triages email: categorizes (action needed / FYI / spam), drafts replies for approval, archives low-priority items. Runs on schedule or on-demand. |
| Weekly Review | Every Sunday: pulls completed tasks, calendar events, metrics from connected tools. Writes a structured weekly summary. Posts to Notion or sends via Telegram. |

## **8.2  Research Skills**

| Skill | What It Does |
| :---- | :---- |
| Lead Researcher | Input: a company or person name. Output: comprehensive brief — public info, recent news, social presence, suggested angles for outreach. |
| Market Scan | Scans GitHub, HackerNews, Product Hunt, Reddit, and X for a topic. Returns competitive landscape, open gaps, and sentiment analysis. |
| Competitor Monitor | Weekly scrape of competitor websites for pricing changes, new features, announcements. Formatted into structured report with changelog-style diffs. |
| ArXiv Reader | Fetch, summarize, and cross-reference academic papers. Maintain a personal research library in the workspace. Ask questions about any paper. |
| Reddit/X Pain Point Miner | Monitors specified communities for complaints about a product category. Weekly digest of real user pain points — ideal for product validation. |
| Earnings Tracker | Monitors SEC filings and press releases for specified companies. Alerts on earnings calls, filings, and major news drops. |

## **8.3  Content Skills**

| Skill | What It Does |
| :---- | :---- |
| Content Repurposer | Input: a blog post, transcript, or URL. Output: Twitter/X thread, LinkedIn post, email newsletter, and TikTok script — all from one source. |
| Newsletter Writer | Research topics, draft content, remember previous issues to avoid repetition, format for Substack/Ghost/Mailchimp. Scheduled or on-demand. |
| SEO Blog Engine | Research keyword, pull data from multiple sources, structure around target terms, output a draft needing only light editing. |
| YouTube Summarizer | Daily digest of new videos from followed channels — transcribed and summarized into workspace notes. Never miss content from key creators. |
| Social Media Scheduler | Draft posts for all platforms from a single instruction. Stage for review, then schedule via Buffer/Hootsuite. Consistent tone across channels. |
| Podcast Briefer | Transcribe and extract key insights from podcast episodes. Automatically routes to workspace knowledge base. |

## **8.4  Developer Skills**

| Skill | What It Does |
| :---- | :---- |
| Sentry → Codex → PR | Monitor Sentry alerts → agent identifies fix → Codex writes the patch → PR opened automatically → Slack notification sent. Bugs resolved before users notice. |
| Deploy Monitor | Watch Railway/Render/Fly.io deployments. Notify on success/failure. Roll back on critical errors. Report build logs on request. |
| Code Review Assistant | Webhook from GitHub triggers agent review of new PRs: style, logic, security flags. Posts review comments directly on GitHub. |
| Self-Extending Agent | Agent can write new skill files when the user describes a new workflow: 'I need to query our internal API and post results to Slack.' Agent drafts the skill; user approves. |
| Infra Manager | SSH to server, edit NixOS/Docker configs, run rebuilds — all via chat from any device. No laptop required. |

## **8.5  Business Skills (Premium)**

| Skill | What It Does |
| :---- | :---- |
| Client Onboarding Autopilot | CRM webhook detects new client → agent creates welcome email \+ project folder \+ Slack channel \+ calendar invite → logs completion. Full sequence in minutes. |
| Financial Pulse | Connect Stripe \+ QuickBooks. Daily revenue report, monthly P\&L summary, flagged anomalies. Ask 'How much did I spend on rideshares in February?' and get an answer. |
| CRM Assistant | HubSpot/Airtable integration. Agent updates deal stages, enriches contact records, schedules follow-ups, drafts outreach emails. |
| Autonomous Business Stack | Overnight mode: agent monitors competitors, scrapes pricing updates, repurposes content, audits incomplete tasks, generates next-day briefings — all while the user sleeps. |
| Family/Household Manager | Aggregate family calendars, monitor messages for appointments, manage household inventory, coordinate schedules. One agent for the whole household. |

# **9\.  Use Cases by User Persona**

These are not theoretical. Every use case below has been documented by real OpenClaw community members running it in production on their own servers. Enclave makes every one of these available to non-technical users in two minutes.

## **9.1  The Solo Founder / Indie Hacker**

|  | "I run my entire business through Telegram while my agent handles the operational layer." One community member documents running 4 specialized agents: a strategy lead, a dev agent, a marketing agent, and a business metrics agent — coordinated through a single Telegram chat, sharing memory and working in parallel on a VPS. |
| :---- | :---- |

* **Morning Briefing:** Calendar, MRR update from Stripe, priority emails, GitHub open PRs — all before opening a laptop

* **Competitor Monitoring:** Weekly scan of competitor pricing pages, new feature announcements, Product Hunt launches

* **Content Pipeline:** Agent researches, drafts, and queues blog posts and social content on schedule

* **Client Communications:** Drafts all client email responses for approval, with full context from previous interactions

* **Overnight Research:** While the founder sleeps, agent mines Reddit/X for pain points, analyses market gaps, prepares next-day strategy brief

* **Code Deployment:** Sentry alert → Codex fix → PR opened → Slack notification — all autonomous

## **9.2  The Freelancer / Consultant**

* **Client Brief Generator:** Input a new client name → agent researches them, prepares an onboarding brief, creates a project folder in workspace

* **Invoice Automation:** Agent generates monthly invoices via QuickBooks, emails them on the 1st, tracks payment status, sends reminders

* **Meeting Prep:** Before every client call, agent surfaces all previous conversation history, open deliverables, and relevant files from workspace

* **Time Tracking Narrative:** Agent writes a prose description of work done from calendar \+ task history — ready to paste into an invoice

* **Proposal Writer:** Research a prospect, pull relevant case studies from workspace, draft a tailored proposal — all via one Telegram message

## **9.3  The Knowledge Worker / Analyst**

* **Daily Intelligence Brief:** Curated digest of industry news, SEC filings, competitor moves, arXiv papers in their field — delivered every morning

* **Meeting Notes → Tasks:** Upload a recording or transcript → agent extracts action items → creates tasks in Linear/Jira/Todoist → emails attendees summaries

* **Research Library:** Drop URLs, tweets, and articles into chat → agent builds a searchable knowledge base → retrieve insights weeks later by meaning, not keyword

* **Earnings Tracker:** Monitor 20 companies' SEC filings and press releases — agent alerts when anything relevant drops

* **Report Generation:** Pull from Sheets/Airtable/Notion → agent writes a structured weekly/monthly report → posts to Slack or emails stakeholders

## **9.4  The Developer**

* **Mobile-First Development:** Build and deploy entire projects from WhatsApp or Telegram — never open a laptop. One user rebuilt their entire website, migrated 18 blog posts, and moved DNS to Cloudflare from bed.

* **Incident Response:** Sentry alert fires → agent reviews logs → writes fix → opens Codex PR → posts Slack update → all before the developer sees the alert

* **Infra Management:** Edit NixOS/Docker/Podman configs via chat. Agent SSHs, applies changes, runs rebuilds, reports results.

* **Code Review Automation:** GitHub webhook → agent reviews every new PR for style, logic, security → posts inline comments → requests changes if needed

* **Self-Healing Deployments:** Agent monitors Railway/Render status, auto-rolls back on critical errors, keeps the developer informed via Telegram

## **9.5  The Content Creator**

* **YouTube Digest:** Daily summary of new videos from 50 followed channels — key insights extracted and routed to workspace notes. Never miss content.

* **Content Repurposing:** One piece of content → Twitter thread \+ LinkedIn post \+ email newsletter \+ TikTok script — all in one command

* **Audience Research:** Weekly Reddit/X mining for pain points in their niche — feeds directly into content calendar

* **Newsletter Engine:** Agent researches topics, drafts content, remembers previous issues to avoid repetition, formats for Substack — weekly cadence maintained automatically

* **Video Production Pipeline:** Script research → outline → draft narration → social clips brief — all staged through workspace, all autonomous

## **9.6  The Executive / Team Lead**

* **Inbox Management:** Agent triages 200+ daily emails, drafts responses, flags the 5 that actually need attention — executive only touches what matters

* **Team Standup Aggregation:** Pulls Jira/Linear status, Slack threads, and GitHub activity → generates a standup summary before the morning meeting

* **Board / Investor Reports:** Monthly: pull Stripe MRR, product metrics, key wins/risks → agent writes a structured update → formatted for email send

* **Calendar Intelligence:** Agent manages the executive's calendar — declines conflicts, schedules focus blocks, prepares for every meeting

* **Delegation Tracking:** Agent tracks every task delegated to team members — follows up automatically, surfaces overdue items, keeps the executive informed without nagging

## **9.7  Personal Life & Household**

* **Family Scheduler:** Aggregate all family calendars, monitor messages for appointment mentions, flag conflicts, coordinate pickups and logistics

* **Meal Planning:** Full weekly meal plan in Notion — shopping lists sorted by store and aisle, recipe catalogue, weather-aware grilling recommendations. Saves an hour a week.

* **Health Tracking:** Morning weight/sleep log via chat → agent tracks trends, flags anomalies, surfaces patterns in weekly review

* **Home Inventory:** User mentions buying something → agent logs it. Ask 'when did I buy the air purifier?' and get an instant answer.

* **Goal Accountability:** Weekly check-ins on personal goals. Agent reviews what was committed, what happened, and adjusts the plan — like a personal coach with perfect memory

# **10\. Brand Identity**

## **10.1  Name: Enclave**

'Enclave' is a geopolitical term for a territory that is fully surrounded by, but completely distinct from, another territory — with its own sovereignty and laws. It captures precisely what we are building: a private, sovereign space for a user's AI and data, existing inside the internet but operating by entirely different rules.

| Why It Works | Explanation |
| :---- | :---- |
| Privacy & Sovereignty | An enclave is impenetrable and self-governed — exactly what we promise about user data |
| Workspace / Place | 'Your enclave' is a place you go, not a tool you use — consistent with the Virtual Office metaphor |
| Permanence | An enclave does not disappear — mirrors the never-forget memory promise |
| Premium & Distinctive | Uncommon enough to feel premium without being contrived |
| Domain Opportunity | enclave.ai, enclave.app, enclaveai.com worth pursuing immediately |

## **10.2  The One-Liner**

|  | The Pitch Enclave gives you a hosted AI co-worker with perfect memory, full access to your calendar, docs, and apps, and a private workspace that even we cannot see. Set up in 60 seconds. |
| :---- | :---- |

## **10.3  Brand Principles**

* **Privacy is architectural, not a policy:** We say 'we cannot read your data' not 'we will not.' The distinction is everything.

* **Memory is a first-class feature:** Not a footnote. The never-forget promise is the headline.

* **Co-worker, not chatbot:** The agent has a desk in your office. It is assigned work, not asked questions.

* **Calm and professional interface:** The dashboard is a workspace. No gamification, no confetti, no growth hacks. Think Notion, not Duolingo.

* **Emerald accent, used with restraint:** Once per screen maximum. Never decorative.

## **10.4  Competitive Differentiation**

| Product | Critical Weakness vs. Enclave |
| :---- | :---- |
| ChatGPT / Claude.ai | Shared infra, resets every session, provider reads your data, no workspace, no integrations |
| Zapier AI | Automation-first, not a co-worker, no persistent memory, no private hosting, no workspace |
| Notion AI | Locked inside Notion, cannot act on other tools, no conversation memory |
| Personal.ai / Mem.ai | Memory-focused but limited integrations, no agent execution, no private hosting |
| Open-source self-hosted OpenClaw | Requires technical setup, no managed workspace, no skills marketplace, no guaranteed privacy |
| Enclave | Private instance, never forgets, full workspace, 25+ channels, deep integrations, managed hosting — zero DevOps |

# **11\. Business Model**

## **11.1  Pricing Tiers**

| Tier | Price | What's Included |
| :---- | :---- | :---- |
| Starter | $9 / month | 1 agent, Telegram \+ web chat, lossless-claw memory, 5GB workspace, 3 integrations, 3 pre-built skills |
| Pro | $29 / month | 1 agent, all 25+ channels, full memory stack (LCM \+ Qdrant \+ Mem0), 25GB workspace, unlimited integrations, all core skills |
| Builder | $59 / month | 3 agents, multi-agent routing, 100GB workspace, all skills, developer integrations, webhook access, priority support |
| Teams | $49 / seat / mo (min 3\) | Shared knowledge base across team members, admin dashboard, SSO, team workspace, priority support |
| Skills Add-ons | $3–$9 / skill / mo | Individual premium skills à la carte. Third-party developer skills with revenue share (Phase 4). |
| Encrypted Backup | $4 / month add-on | Nightly encrypted export to user-owned S3 or R2 bucket. Any tier. |

## **11.2  Unit Economics**

| Metric | Estimate |
| :---- | :---- |
| GCP VM cost (e2-standard-2, \~10 users) | \~$40/mo → $4/user hosting cost at current density |
| Memory stack overhead (LCM \+ Qdrant \+ Mem0) | Negligible — all run in-container, no external API costs |
| Gross margin at $9/mo (Starter) | \~55% at current infrastructure pricing |
| Gross margin at $29/mo (Pro) | \~80% — memory \+ vector stack adds minimal marginal cost |
| Gross margin at $59/mo (Builder) | \~85% |
| Target MRR at 100 users (mixed) | \~$2,200/mo |
| Target MRR at 500 users (mixed) | \~$11,000/mo |
| Target MRR at 2,000 users (mixed) | \~$45,000/mo |

# **12\. Product Roadmap**

| Phase | Timeline | Key Deliverables |
| :---- | :---- | :---- |
| Phase 1 | Now → Month 1 | lossless-claw on all instances. Persistent volumes in Dokploy. Encryption keys at provision time. Stripe webhook tested. Full signup → provision → Telegram flow verified. Basic workspace (file upload, agent file write). Discord \+ Slack channels. |
| Phase 2 | Month 2 | Qdrant sidecar in each instance. Semantic search wired as MCP tool. Web Chat in dashboard. Google Calendar \+ Gmail integration. Morning Briefing \+ Meeting Prep skills. Pro tier launch. |
| Phase 3 | Month 3 | Mem0 sidecar. Memory Dashboard UI (view, edit, delete memories). Notion \+ Google Sheets \+ TickTick integrations. Workspace Knowledge Base. Inbox Zero \+ Weekly Review skills. Signal \+ iMessage channels. |
| Phase 4 | Month 4–5 | Skills Marketplace public launch (10 launch skills). Content skills (repurposer, newsletter, YouTube digest). HubSpot \+ Airtable \+ Stripe integrations. Multi-agent Builder tier. Encrypted backup add-on. Third-party skill developer program announced. |
| Phase 5 | Month 5–6 | Teams tier. Developer skills (Sentry→PR, deploy monitor, infra manager). Voice channel (Talk Mode). WhatsApp \+ Matrix \+ Microsoft Teams channels. Memory export (full data portability). Mobile apps (iOS/Android companion nodes). |
| Phase 6 | Month 7–12 | Enterprise tier (SSO, compliance, dedicated infra). Live Canvas in dashboard. Advanced multi-agent orchestration. Marketplace third-party skills (revenue share). International expansion (EU GDPR certification, APAC channels). |

# **13\. Go-To-Market Strategy**

## **13.1  Initial Customer Profile**

Phase 1 targets the non-technical professional who: already pays for ChatGPT or Claude but is frustrated by memory loss; uses Telegram or WhatsApp as their primary communication tool; manages multiple client relationships or projects simultaneously; and handles sensitive enough work that privacy genuinely matters to them. Secondary ICP: technical founders and indie hackers who understand the value of self-hosted infrastructure but do not want to manage it themselves.

## **13.2  Acquisition Channels**

* **Privacy-first communities:** Hacker News, r/selfhosted, r/privacytools, Mastodon, Signal groups — our privacy promise resonates immediately with this audience

* **OpenClaw community:** 337,000 GitHub stars means a massive technical audience who want managed hosting. We are the 'OpenClaw but without the DevOps' option.

* **French-Canadian tech community:** Bilingual product from day one — local advantage in a strong, underserved market

* **Content strategy:** 'Your AI should never forget you' is a single essay that can drive thousands of signups in the right communities

* **Showcase / use cases:** Document 10 compelling user stories with specific numbers (saved hours, revenue generated, bugs fixed). These convert extremely well in the OpenClaw community.

* **Referral loop:** Users invite colleagues; Teams feature creates natural expansion within organizations

## **13.3  Pricing Philosophy**

We price on value delivered, not compute consumed. $9/month is less than one coffee per week. The psychological comparison is not 'vs. ChatGPT Plus ($20)' — it is 'vs. hiring a part-time assistant ($2,000/month).' We are replacing a human workflow, not competing with a chat interface.

# **14\. Technical Stack**

| Layer | Technology |
| :---- | :---- |
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js API routes, Server Actions, Prisma ORM |
| Platform Database | PostgreSQL — platform metadata only. Zero user conversation data. |
| Auth | NextAuth v5 (Auth.js), JWT strategy, AUTH\_TRUST\_HOST for production |
| Payments | Stripe Subscriptions \+ Webhooks |
| Agent Runtime | OpenClaw (self-hosted, one container per user) |
| Memory Layer 1 | lossless-claw (SQLite DAG, verbatim recall) |
| Memory Layer 2 | Qdrant (self-hosted vector DB, semantic recall) |
| Memory Layer 3 | Mem0 (self-hosted entity extraction, structured memory) |
| Workspace Storage | Persistent Docker volumes per user, AES-256 encryption |
| Integrations | MCP (Model Context Protocol) tool bridge |
| Channels | OpenClaw native (25+): Telegram, WhatsApp, Discord, Slack, Signal, iMessage, Matrix, and more |
| Automation | OpenClaw cron, webhooks, Gmail Pub/Sub — all configured from dashboard |
| Provisioning | Dokploy REST API on GCP e2-standard-2 (8GB RAM) |
| Skills Platform | ClawHub (1,700+ community skills) \+ Enclave curated skill catalog |
| i18n | next-intl — English \+ French (more languages in roadmap) |
| Monitoring | Dokploy health checks \+ custom uptime monitoring per user instance |
| Hosting | GCP VM (current), Hetzner VPS (EU expansion) |

# **15\. Risks & Mitigations**

| Risk | Likelihood | Mitigation |
| :---- | :---- | :---- |
| Compute costs scale with users | Medium | Optimize container density. Upgrade VM tiers incrementally. Explore Hetzner (cheaper) for EU. |
| OpenClaw upstream breaking changes | Low–Med | Pin OpenClaw versions per instance. Test upgrades in staging before rolling to users. |
| lossless-claw requires unreleased PR \#22201 | Medium | Fork and apply patch until merged. Contribute to the PR to accelerate merging. |
| Privacy claim creates legal target | Low | Architecture makes the claim verifiable and auditable. Legal opinion on GDPR compliance before EU launch. |
| LLM provider outages | Low | OpenClaw's built-in model failover \+ OpenRouter multi-provider fallback. Memory layers run locally regardless. |
| User data loss (container failure) | Medium | Persistent volumes \+ nightly backup option. Health monitoring per instance. Recovery SLA. |
| Community trust (security) | Medium | 42,000 exposed OpenClaw installs were found by researchers in Feb 2026\. Our managed service is the secure alternative — we enforce DM pairing, sandboxing, and key auth by default. |
| Skill quality on marketplace | Low | All third-party skills are reviewed before listing. Security audit process defined before Phase 4 launch. |

**Enclave**

*Your AI. Your Data. Your Space.*

Confidential  ·  March 2026