# PureDraft HR — Email Setup Guide

All steps needed to get `support@puredrafthr.btbcoder.site` working for receiving emails and replying professionally.

> **Note on Resend free plan**: Resend's free tier only allows 1 verified domain, which is already in use by another project. Contact form notifications will arrive from `onboarding@resend.dev` (only you see this). Users on the website see `support@puredrafthr.btbcoder.site` and your replies go out as `support@` — your personal email is never exposed. If you upgrade Resend in the future, verify `puredrafthr.btbcoder.site` to send from `support@` directly.

---

## Prerequisites

- **DNS Provider**: Namecheap (default nameservers) for `btbcoder.site`
- **Transactional Email**: Resend (free plan — 1 domain limit, API key in `.env.local`)
- **Auth**: Clerk (free plan — custom email templates not available)
- **Hosting**: Vercel

---

## Step 1: Add Vercel Environment Variable

The app uses `RESEND_FROM_EMAIL` to set the sender address. You already added it to `.env.local` for local dev — now add it to Vercel for production.

1. Go to [Vercel Dashboard](https://vercel.com/) → your PureDraftHR project
2. **Settings** → **Environment Variables**
3. Add:

| Key                 | Value                                              | Environments        |
| ------------------- | -------------------------------------------------- | ------------------- |
| `RESEND_FROM_EMAIL` | `PureDraft HR <support@puredrafthr.btbcoder.site>` | Production, Preview |

4. Click **Save**
5. **Redeploy** the project (Settings → Deployments → redeploy latest, or push a new commit)

---

## Step 2: Set Up Inbound Email Forwarding (ImprovMX)

This forwards emails sent **to** `support@puredrafthr.btbcoder.site` into your Gmail inbox.

1. Go to [ImprovMX](https://improvmx.com/) and sign up (free plan works)
2. Click **Add Domain** → enter `puredrafthr.btbcoder.site`
3. Add a forwarding rule:
   - **Alias**: `support`
   - **Forward to**: `eniolorundasamson@gmail.com`
4. ImprovMX will show you **MX records** and an **SPF record** to add
5. Go to **Namecheap → Advanced DNS** for `btbcoder.site`
6. Add these records:

| Type | Host          | Value                                                        | Priority |
| ---- | ------------- | ------------------------------------------------------------ | -------- |
| MX   | `puredrafthr` | `mx1.improvmx.com.`                                          | 10       |
| MX   | `puredrafthr` | `mx2.improvmx.com.`                                          | 20       |
| TXT  | `puredrafthr` | `v=spf1 include:spf.improvmx.com include:spf.brevo.com ~all` | —        |

> **Important**: ImprovMX shows Host as `@` because it sees `puredrafthr.btbcoder.site` as the domain. In Namecheap, use `puredrafthr` as the Host — Namecheap appends `.btbcoder.site` automatically.
>
> **SPF**: The TXT record includes both ImprovMX (receiving) and Brevo (sending). Only one SPF record per host is allowed — merge them into one.

7. Wait for DNS propagation (usually 5–30 minutes)
8. Test by sending an email to `support@puredrafthr.btbcoder.site` from another account — it should arrive in your Gmail

---

## Step 3: Set Up Brevo SMTP (for Gmail "Send As")

Resend SMTP requires domain verification (blocked by the free plan 1-domain limit). Use **Brevo** (free, 300 emails/day) as the SMTP provider instead.

1. Go to [Brevo](https://www.brevo.com/) and sign up (free plan)
2. Go to **Settings** → **Senders, Domains & Dedicated IPs** → **Domains**
3. Click **Add a domain** → enter `puredrafthr.btbcoder.site`
4. Brevo will show you DNS records to verify the domain (DKIM + Brevo code). Add them in **Namecheap → Advanced DNS**:

| Type  | Host                          | Value                                |
| ----- | ----------------------------- | ------------------------------------ |
| TXT   | `puredrafthr`                 | _(Brevo code — copy from dashboard)_ |
| CNAME | `mail._domainkey.puredrafthr` | _(DKIM value — copy from dashboard)_ |

5. Back in Brevo, click **Verify** — wait for DNS propagation
6. Once verified, go to **Settings** → **SMTP & API** to get your SMTP credentials:
   - **SMTP Server**: `smtp-relay.brevo.com`
   - **Port**: `587`
   - **Login**: _(your Brevo login email)_
   - **Password**: _(your Brevo SMTP key — shown on the page)_

---

## Step 4: Gmail "Send As" (Reply as support@)

This lets you **reply** to emails from Gmail using `support@puredrafthr.btbcoder.site` so your personal Gmail stays hidden.

1. Open [Gmail](https://mail.google.com/) → click the **gear icon** → **See all settings**
2. Go to **Accounts and Import** tab
3. Under **"Send mail as"**, click **Add another email address**
4. Fill in:
   - **Name**: `PureDraft HR Support`
   - **Email**: `support@puredrafthr.btbcoder.site`
   - Uncheck **"Treat as an alias"**
5. Click **Next Step**
6. Enter SMTP settings (from Brevo, Step 3):

| Setting     | Value                      |
| ----------- | -------------------------- |
| SMTP Server | `smtp-relay.brevo.com`     |
| Port        | `587`                      |
| Username    | _(your Brevo login email)_ |
| Password    | _(your Brevo SMTP key)_    |
| Security    | **TLS**                    |

7. Click **Add Account**
8. Gmail will send a confirmation code to `support@puredrafthr.btbcoder.site`
   - This will be forwarded to your Gmail via ImprovMX (Step 2 must be done first!)
   - Enter the confirmation code
9. Back in Settings → "Send mail as", click **make default** next to the support@ address (optional — makes it the default sender)

---

## Step 5: Clerk Email Templates (Paid Plan Only)

Custom Clerk email templates require a **paid Clerk plan**. On the free plan, Clerk uses its default templates.

If you upgrade to a paid plan in the future:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/) → **Customization** → **Emails**
2. The file `clerk-email-templates.html` in this repo contains 6 branded templates:
   - Verification Code
   - Account Locked
   - Password Changed
   - Password Removed
   - Primary Email Changed
   - Sign in from New Device
3. For each template: copy the HTML between the `<!-- START -->` and `<!-- END -->` markers and paste it into the Clerk email body editor
4. Update the **Name**, **From**, and **Reply-to** fields as noted in the HTML comments above each template

---

## Verification Checklist

After completing all steps, test each one:

- [ ] **Vercel env var added** — `RESEND_FROM_EMAIL` shows in Vercel project settings
- [ ] **Contact form email works** — Submit the contact form on the live site, check your Gmail for the branded email (From will show `onboarding@resend.dev`)
- [ ] **Inbound forwarding works** — Send an email to `support@puredrafthr.btbcoder.site`, it arrives in Gmail
- [ ] **Brevo domain verified** — Brevo Dashboard shows domain as verified
- [ ] **Reply as support@ works** — Reply to an email from Gmail, recipient sees `support@puredrafthr.btbcoder.site`

---

## DNS Records Summary (Namecheap)

All DNS records to add for `btbcoder.site` in Namecheap Advanced DNS:

| Type  | Host                          | Value                                                        | Priority |
| ----- | ----------------------------- | ------------------------------------------------------------ | -------- |
| MX    | `puredrafthr`                 | `mx1.improvmx.com.`                                          | 10       |
| MX    | `puredrafthr`                 | `mx2.improvmx.com.`                                          | 20       |
| TXT   | `puredrafthr`                 | `v=spf1 include:spf.improvmx.com include:spf.brevo.com ~all` | —        |
| TXT   | `puredrafthr`                 | _(Brevo verification code — from dashboard)_                 | —        |
| CNAME | `mail._domainkey.puredrafthr` | _(Brevo DKIM value — from dashboard)_                        | —        |

> **Note**: Only one SPF TXT record per host is allowed. The record above merges both ImprovMX (receiving) and Brevo (sending). If you upgrade Resend in the future, add `include:send.resend.com` to the same SPF record.
