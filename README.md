# Marrowby's Bakery: baking smarter with AI

**🥈 Runners-up · University of Manchester Regional Consulting Competition 2026** · Team P2P Pioneers

[![Cover slide of the Marrowby's Bakery presentation](https://neet-portfolio-one.vercel.app/cases/marrowbys/slides/slide-1.jpg)](https://neet-portfolio-one.vercel.app/#case-marrowbys)

### ▶ [View the presentation](https://neet-portfolio-one.vercel.app/#case-marrowbys) · [Download the PDF](https://neet-portfolio-one.vercel.app/cases/marrowbys/Marrowbys_Bakery_P2P_Pioneers.pdf) · [Try the live prototype](https://marrowbys-portal.vercel.app)

**The question:** where should a 40-shop bakery chain put AI first to get the best gains?

**Our answer:** start at the oven. An AI daily bake order for every shop and AI catering quotes sent in minutes, with a person approving every order and every quote.

| | |
| --- | --- |
| **£645k a year** | gains identified (base case, all 40 shops): £480k from the bake order + £165k from catering |
| **£367k a year** | net from the bake order after its £113k running cost |
| **7.5%** | waste cut needed to break even, against a 25% plan |
| **2.3×** | the low case (£260k) still covers the running cost more than twice |
| **2 days → minutes** | to send a catering quote; each point of win rate is worth £70k profit |
| **~£0.7m run-rate by month 6** | in the final-round plan, about 60% of a sudden £1.2m cost rise |

## This repo: the staff portal prototype

A clickable admin-portal prototype showing how the proposed AI tools would look to Marrowby's staff: tomorrow's bake order with manager override, catering quotes, rotas and the owner's summary view. It was shown on the Recipe slide of the deck. **Marrowby's is a fictional case company and all data is illustrative.**

Static site: `index.html`, `styles.css`, `app.js`, `assets/`. No build step.

Run locally: `python3 -m http.server 5173` in this folder, then open http://localhost:5173

Deploy to Vercel: import this folder from a GitHub repo (Framework preset: Other, no build command), or run `npx vercel --prod` here once Node is installed.

## Team P2P Pioneers

Keshav Vatsa · Neet Jain · Sejal Ghuge · Simran Aggarwal · Thomas Anto Ullas
