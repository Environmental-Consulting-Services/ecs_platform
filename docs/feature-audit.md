# Feature Audit

Current status of ECSD features.

## Web App

List of features that currently exist in the web app UI and any issues with them.

### Login/Logout

- Sometimes a browser console error when logging out

### Sign Up

- UI glitch makes it hard to click register button (workaround: press enter on keyboard)
- ~User accounts are not successfully created~ ✅ **Fixed**

### Companies

- List of companies is user-specific, not shared across users
- Only active companies are shown, no way to toggle/filter inactive companies

### Projects

- No way to assign different owner to new or existing projects

#### Edit Project Site Map

- Can't upload new site map

### Users

- ~Can't edit user~ ✅ **Fixed**
- Can't upload profile image
- Can't edit own user

### Inspections

- Inspection name not shown in table
- Can't edit inspection metadata (no UI, edit button takes you to view inspection screen)
- Can't download PDF

#### View Inspection

- Empty blue message bar when clicking save on view inspection
- Complete button just shows thank you message without doing anything else

### Action Items

- Messy UI for adding action items
- No options for Assigned To

#### Action Item Notes

- Works

### Inspection Templates

- ~Can't add new template (wrong form)~ ✅ **Fixed**

#### Editor

- Lots of browser console errors

### Docs/Support

- Take you to dead links

### User Settings

- Non-functional placeholder page

### Notifications

- Button does nothing
- Page is empty

### UI Configurator

- Sidebar colors don't work

## Mobile App

List of features currently exposed in the mobile app UI and notable gaps based on unverified automated code review.

- Login/Logout
  - Login appears wired to backend auth and token storage
  - Logout is exposed in the shared navbar menu
  - App requests camera and microphone permissions on launch
- Sign Up
  - Screen appears to be a template/mock flow
  - Register button just navigates to home and does not appear to create an account
- Companies
  - Users can browse companies and drill into project lists
  - No mobile UI for creating or editing companies
- Projects
  - Users can browse projects and open a project detail screen
  - Project detail has tabs for project summary, inspections, and action items
  - No mobile UI for creating or editing projects
  - Some list metadata appears hard-coded placeholder text (`Status: Active`, `Phase: Initial`)
- Inspections
  - Users can list inspections for a project
  - Can create a new inspection
  - Inspection detail has tabs for inspection form, site map, and action items
  - Inspection forms appear to load from templates in a WebView and save progress/completion back to the inspection record
  - Site map annotation/upload flow appears implemented
  - Inspection metadata editing looks limited
- Action Items
  - Users can list project-level and inspection-level action items
  - Can create action items from the list view
  - Action item detail supports editing name, description, location, assignee, status, and due date
- Action Item Notes
  - Notes can be loaded, added, and deleted
- AI Chat
  - `Field Expert` chat appears more implemented on mobile than web
  - Loads message history, polls for updates, and sends messages to an `expert` recipient
  - Not runtime-verified
- Notifications
  - Screen is static sample content, not backend-driven
- User Settings
  - Notification settings are local-only toggle switches with no persistence/API wiring
  - Settings page still contains obvious placeholder sections such as FaceID, payment options, and gift cards
- Users
  - Profile page is static mock content rather than current-user data
- Docs/Support
  - About / Privacy / User Agreement screens contain template/demo text, not product-specific content
  - Drawer support link opens an external web URL rather than an in-app support flow
- Other Template Screens
  - Search screen is still template/demo content unrelated to ECSD
  - Onboarding screen is still Argon template branding and does not reflect the product

## Section 4 Features

List of features outlined in section 4 of `Final SmartComplAI MVP Handoff.pdf` and what their implementation status is.

- Project/User Dashboard - 🔧 **Partially implemented**
  - No project permission checks
  - Assignment functionality isn't clear
- Compliance Management Module - 🔧 **Partially implemented**
  - No pass/fail logic for action items or inspections
  - No follow-up scheduling
  - No CAL log
- Inspection Workflows (Web & Mobile) - 🔧 **Partially implemented**
  - No photo uploads (at least in web console)
- Corrective Action Logging - 🔧 **Partially implemented**
  - No inspection report, no CAL log tied to inspection.
- Document Vault & Report Generation - 🔧 **Partially implemented**
  - No working PDF generation
  - No document vault
  - Site map files can't be uploaded
- SWMP Upload & Project Assignment - ❌ **Not implemented**
- Admin Tools & Project Role Assignments - 🔧 **Partially implemented**
  - No project assignment (not clear/doesn't work)
- AI Chat Integration - ❓ **Possibly implemented**
  - Not implemented in web console
  - Appears to be full implemented in mobile app, haven't tested
- System Notifications & Alerts - ❌ **Not implemented**

## Technical Issues

- Lot's of miscellaneous bugs in code
- Web console builds very slowly
- Mobile app unreviewed and untested

## Proposed Follow Up Work

### Round of bug fixes / clean-up in the web app

**Cost:** 3 Units

Fix a majority of the bugs and UI/UX issues in the web app. Any substantial missing or under-developed features (like PDF generation) would be excluded from this.

### Mobile App Analysis / QA / Deployment or Work Proposal

**Cost:** 2 units

It would take a significant amount of work in order to try and get the mobile running, test it out, report on its status, and propose additional work (maybe deployment) for it.
