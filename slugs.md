# Nexa_ng Page Slugs

This document lists the routes for the Nexa_ng Service Finder platform.

## Public / Marketing & Discovery
- **Home**: `/`
- **Search**: `/search`
- **Niche Home**: `/[niche]`
- **Niche Search**: `/[niche]/search`
- **Niche Available Pros**: `/[niche]/available`
- **Niche Pros Near Me**: `/[niche]/near-me`
- **Categories**: `/categories`
- **Niche Category**: `/[niche]/category/[slug]`
- **Cities**: `/cities/[city]`
- **Articles**: `/[niche]/articles`
- **Article View**: `/[niche]/articles/[slug]`
- **Success Stories**: `/success-stories`
- **Trending**: `/trending`
- **Showcase**: `/showcase`
- **About**: `/about`
- **Contact**: `/contact`
- **Nexa Verified Info**: `/nexa-verified`

## Business & Shopping
- **Business Profile**: `/[niche]/[state]/[lga]/[business]`
- **Business Shop**: `/[niche]/[state]/[lga]/[business]/shop`
- **Product Detail**: `/[niche]/shop/[slug]`
- **Niche Shop**: `/[niche]/shop`
- **Business Landing**: `/business`

## Authentication & Onboarding
- **Login**: `/login`
- **Signup**: `/signup`
- **Join as Pro**: `/join`
- **Pro Registration**: `/join/register`
- **Tech Onboarding**: `/join/technician`

## Checkout & Bookings
- **Checkout**: `/checkout`
- **Checkout Success**: `/checkout/success`
- **Book Nexa Verified**: `/book/nexa-verified/checkout`
- **Booking Confirmation**: `/book/nexa-verified/confirmed/[ref]`
- **Track Booking**: `/booking/[ref]/track`
- **Review Booking**: `/booking/[ref]/review`

## User / Pro / Client Dashboard
- **Pro Dashboard Home**: `/dashboard`
- **Profile**: `/dashboard/profile`
- **Settings**: `/dashboard/settings`
- **Wallet**: `/dashboard/wallet`
- **Bookings**: `/dashboard/bookings`
- **Messages**: `/dashboard/messages`
- **Leads**: `/dashboard/leads`
- **Deals**: `/dashboard/deals`
- **Analytics**: `/dashboard/analytics`
- **Availability**: `/dashboard/availability`
- **Manage Shop**: `/dashboard/shop`
- **Manage Articles**: `/dashboard/articles`
- **New Article**: `/dashboard/articles/new`
- **Client Dashboard Home**: `/client/dashboard`
- **Account**: `/account`

## Technical & Support
- **Tech Dashboard**: `/tech/dashboard`
- **Tech Job Details**: `/tech/jobs/[id]`
- **Tech Earnings**: `/tech/earnings`
- **Support Ticket**: `/support/[ref]`

## Operations & Admin
- **Ops Assignments**: `/ops/assignments`
- **Ops Job Details**: `/ops/jobs/[id]`
- **Ops Technicians**: `/ops/technicians`
- **Ops Disputes**: `/ops/disputes`
- **Premium Analytics**: `/admin/premium-analytics`

## Legal
- **Privacy Policy**: `/legal/privacy`
- **Terms of Service**: `/legal/terms`

  The seed script will create:
   - An Admin User (`admin@nexa.ng`).
   - A Client User (`client@nexa.ng`).
   - Multiple Pro Users across various niches (e.g. `bisi@handyman.ng`, `chef@gbolahan.ng`).
   - Default login password for all accounts: `password123`.
