# Clarq AI Landing Page v2

Plain HTML / CSS / JS rewrite of `clarq-landing-page-main` (v1: Vite + React + Tailwind).
No build step — the folder is the site.

| File                | What it is                                                          |
|---------------------|---------------------------------------------------------------------|
| `index.html`        | The whole page; copy lives here (v1 had it in `landing-content.ts`) |
| `style.css`         | Hand-written port of the v1 Tailwind classes                        |
| `main.js`           | Nav, scroll reveal, count-up, tabs, FAQ, pilot form                 |
| `career/index.html` | Redirect page to the Notion job post (replaces the Cloudflare 301)  |
| `CNAME`             | `clarq-ai.com` for GitHub Pages                                     |
| `.nojekyll`         | Serve files as-is on GitHub Pages                                   |

## Preview

Open `index.html` directly, or serve the folder:

```bash
python -m http.server 8000
```

## Pilot form

`main.js` posts to the same Google Form as v1 (`FORM_RESPONSE_URL` and `FORM_ENTRIES` at the top).
Submitting the form locally sends a real response — change those constants to point at a
company-owned form before going live.

## Deploy (GitHub Pages + Namecheap BasicDNS)

1. Push this folder as the root of a public repo under `topgunfitnessmachine`.
2. Settings → Pages → deploy from branch `main`, folder `/`; custom domain `clarq-ai.com`.
3. Namecheap → Nameservers: Namecheap BasicDNS, then Advanced DNS:
   - `A @` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME www` → `topgunfitnessmachine.github.io.`
4. After the certificate is issued, enable **Enforce HTTPS**.

The custom domain is still attached to `stmharry/clarq-landing-page`; it must be released
(or the domain verified under the new account) before step 2 will accept it.
