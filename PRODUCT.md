# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

First-time Indian retail investors using Groww's app in a "Beginner Mode". They are new to markets, wary of losing money, and unfamiliar with terms like SIP, expense ratio, STT or F&O. The prototype is also evaluated by a Groww design/product hiring panel, who view it as a phone-sized frame in a desktop browser via a shared link.

## Product Purpose

A redesigned Groww home and invest experience that helps a beginner take a safe first step (a ₹100 SIP, an emergency fund, a nominee) and understand what their numbers mean before they act. Success: a beginner knows what to do next and why, and is protected from costly mistakes (high sell charges, unprepared F&O trading) without being lectured.

## Positioning

Guidance is built into the money surfaces themselves: next steps picked from the user's account, an AI assistant that explains terms and numbers but refuses buy/sell advice and predictions, charge breakdowns before a sale, and F&O locked behind a short learning module and quiz.

## Operating Context

Mobile, one-handed, in short sessions. Two demo states: a new user (no portfolio yet, welcome card and first-SIP flow) and a returning user (portfolio, allocation, holdings, trading P&L). Evaluators toggle between the two from a "View as" switch above the phone frame.

## Capabilities and Constraints

- Home: portfolio value with hide-amounts toggle, allocation split, next-steps tasks (nominee, SIP balance, emergency fund), Learn (60-second reel, daily quiz with streak), "Start here" index funds.
- Invest: Mutual Funds (default tab), Stocks, F&O tabs; stock and fund detail pages; buy with intent ("plan") tags; sell flow with charge breakdown and high-charge warning.
- AI assistant chat in Beginner Mode with guardrails on trade advice and predictions.
- F&O unlock: concept cards, true/false quiz, sample option chain.
- All data is mock; Indian number formatting (₹, lakh grouping).
- Single-file React + Tailwind prototype (`groww-home.jsx`), built with Vite, deployed to GitHub Pages.
- Fixed for redesigns: layout and flows, all copy, and the phone-in-browser frame presentation.

## Brand Commitments

Groww-adjacent was the starting brief, but in the first direction round the user chose the category standard: the prototype should look like Groww's own current app, played straight, with Groww's production app as the craft bar. Tone is plain, warm, non-hype, Indian English.

## Evidence on Hand

Mock portfolio, fund and stock data in `groww-home.jsx`; the SEBI FY25 statistic on F&O losses (9 in 10 individual traders lost money). No real user research, testimonials or metrics; do not invent them.

## Product Principles

1. Explain before asking anyone to act.
2. Protect beginners from costly mistakes, without fear or lecturing.
3. Show the next safe step, never a wall of options.
4. Numbers are always legible, honest and in Indian format.

## Accessibility & Inclusion

Clear contrast for financial figures and gain/loss states; gain/loss never conveyed by colour alone (signs and labels accompany it); respects reduced-motion preference.
