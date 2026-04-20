# Section 4 Feature Audit

Source PDF: `../Final SmartComplAI MVP Handoff.pdf`  
Section reviewed: `4. Completed Features Status (Web & Mobile)`  
Audit basis: current code in `ecsd_console`, `ecsd_api`, `ecsd_mobile`, and `ecsd_expert`

Status meanings:
- `Fully implemented`: the feature is present and clearly exposed in the shipped app surface described by the PDF.
- `Partially implemented`: some underlying code exists, but the feature is incomplete, hidden, demo-only, backend-only, or missing major claimed behavior.
- `Not implemented`: I could not find a working implementation path for the claimed feature.

Platform note:
- A feature being `mobile-only` or `web-only` does not make it partial by itself.
- I only count platform scope against a feature when the PDF explicitly claims both platforms, or when the current implementation misses a major part of the claimed behavior regardless of platform.

## 1. Project/User Dashboard

**Status:** `Partially implemented`

**Why:**
- The active web console does have project listing and permission checks through the `Projects` screen and CASL-based UI gating.
- The API also attempts to filter projects by the current user in [ecsd_api/src/apis/projects/index.js](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_api/src/apis/projects/index.js:37).
- But the actual dashboard screens are generic template dashboards, not a project/user dashboard, and they are commented out of the active sidenav in [ecsd_console/src/routes.js](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_console/src/routes.js:462).
- The app’s default route sends users to `/company-management`, not a dashboard, in [ecsd_console/src/App.js](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_console/src/App.js:281).
- The analytics dashboard itself is stock sample content, not user/project-specific data, in [ecsd_console/src/layouts/dashboards/analytics/index.js](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_console/src/layouts/dashboards/analytics/index.js:31).
- The PDF itself says summary cards are still pending.

**How to find it in the UI:**
- What exists in the web console: left nav -> `Projects`
- Route: `/project-management`
- There is no active dashboard menu item in the current web console.

## 2. Compliance Management Module

**Status:** `Partially implemented`

**Why:**
- The web console exposes `Inspections`, `Action Items`, and `Inspection Templates` in the active sidenav via [ecsd_console/src/routes.js](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_console/src/routes.js:157).
- Inspection records, status fields, templates, and action links exist in the data model in [ecsd_api/src/apis/inspections/schema/inspection.schema.js](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_api/src/apis/inspections/schema/inspection.schema.js:6).
- Action items / corrective actions exist in [ecsd_api/src/apis/actionitems/schema/actionitem.schema.js](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_api/src/apis/actionitems/schema/actionitem.schema.js:5).
- But the claimed pass/fail logic and follow-up scheduling are not clearly exposed as dedicated web-console functionality. They may be embedded inside survey templates/form data, but I did not find a visible compliance module screen that matches the PDF language.
- The new inspection form is minimal and does not expose project assignment or scheduling fields in the web UI in [ecsd_console/src/cruds/inspection-management/new-inspection/index.js](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_console/src/cruds/inspection-management/new-inspection/index.js:24).

**How to find it in the UI:**
- Web console:
  - `Inspections` -> `/inspection-management`
  - `Action Items` -> `/actionitem-management`
  - `Inspection Templates` -> `/inspectiontemplate-management`

## 3. Inspection Workflows (Web & Mobile)

**Status:** `Partially implemented`

**Why:**
- Web: users can create inspections and open/save inspection forms through the survey-based inspection viewer in [ecsd_console/src/cruds/inspection-management/view-inspection/index.js](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_console/src/cruds/inspection-management/view-inspection/index.js:24).
- Web: inspection list and PDF/share actions exist in [ecsd_console/src/cruds/inspection-management/index.js](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_console/src/cruds/inspection-management/index.js:33).
- Mobile: the inspection screen has tabs for `Inspection Form`, `Site Map`, and `Action Items` in [ecsd_mobile/lib/screens/inspection.dart](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_mobile/lib/screens/inspection.dart:52).
- Mobile: image upload exists for the site map flow in [ecsd_mobile/lib/screens/sitemappainter-widget.dart](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_mobile/lib/screens/sitemappainter-widget.dart:603).
- But the PDF claims photo uploads via both web and mobile; I found clear mobile upload behavior and web site-map upload behavior, not a clear inspection-photo upload flow in the web console.
- The web new-inspection flow is also missing several fields implied by the PDF, including scheduling details.

**How to find it in the UI:**
- Web console:
  - `Inspections` -> `/inspection-management`
  - `+ Add Inspection`
  - Open an inspection with the edit/view action
- Mobile:
  - Open a project, then an inspection
  - Bottom tabs: `Inspection Form`, `Site Map`, `Action Items`

## 4. Corrective Action Logging

**Status:** `Partially implemented`

**Why:**
- Corrective actions exist as `Action Items` in the web console and backend.
- The mobile inspection workflow includes an `Action Items` tab inside the inspection screen in [ecsd_mobile/lib/screens/inspection.dart](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_mobile/lib/screens/inspection.dart:61).
- The web console also has a stand-alone `Action Items` screen in [ecsd_console/src/routes.js](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_console/src/routes.js:167) and CRUD pages in [ecsd_console/src/cruds/actionitem-management/index.js](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_console/src/cruds/actionitem-management/index.js:18).
- That means corrective action handling exists, but the web console does not clearly show CAL generation as an integrated part of the inspection workflow the way the PDF describes.
- The stand-alone action item UI also contradicts the PDF note that stand-alone CAL logging was outside MVP scope.

**How to find it in the UI:**
- Web console:
  - `Action Items` -> `/actionitem-management`
- Mobile:
  - Inside an inspection -> `Action Items` tab

## 5. Document Vault & Report Generation

**Status:** `Partially implemented`

**Why:**
- PDF generation for inspections is real in both console and API:
  - web console PDF/share actions in [ecsd_console/src/cruds/inspection-management/index.js](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_console/src/cruds/inspection-management/index.js:88)
  - server-side PDF generation in [ecsd_api/src/apis/inspections/index.js](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_api/src/apis/inspections/index.js:117)
- File upload/download endpoints exist for images/files in [ecsd_api/src/apis/images/route/index.js](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_api/src/apis/images/route/index.js:8).
- Project site maps can be uploaded from the web console in [ecsd_console/src/cruds/project-management/edit-project-site-map/index.js](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_console/src/cruds/project-management/edit-project-site-map/index.js:358).
- But I did not find a real web-console `document vault` screen where users browse project documents and inspection reports. The web surface appears limited to PDF export/share and site-map upload.

**How to find it in the UI:**
- Web console:
  - `Inspections` -> use the PDF/download/share actions
  - `Projects` -> open a project -> `Edit Site Map`
- I did not find a dedicated document vault page in the active web console.

## 6. SWMP Upload & Project Assignment

**Status:** `Not implemented`

**Why:**
- I found management-plan / narrative data models in the API, for example [ecsd_api/src/apis/managementplans/schema/managementplan.schema.js](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_api/src/apis/managementplans/schema/managementplan.schema.js:46).
- But I did not find an active web-console route, service, or screen for SWMP upload, SWMP-to-project assignment, or SWMP document management.
- The active sidenav has no SWMP or management-plan entry in [ecsd_console/src/routes.js](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_console/src/routes.js:99).
- The `managementplan-management` code appears to be an unused duplicate/older path, not part of the active UI.

**How to find it in the UI:**
- I could not find this in the active web console.

## 7. Admin Tools & Project Role Assignments

**Status:** `Partially implemented`

**Why:**
- Admin-style management screens for users and projects are present:
  - `Users` in [ecsd_console/src/cruds/user-management/index.js](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_console/src/cruds/user-management/index.js:21)
  - `Projects` in [ecsd_console/src/cruds/project-management/index.js](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_console/src/cruds/project-management/index.js:23)
- Global roles exist in the data model and user APIs.
- The project schema supports role-tagged user/person relationships in [ecsd_api/src/apis/projects/schema/project.schema.js](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_api/src/apis/projects/schema/project.schema.js:25).
- But the active project create/edit screens do not expose add/remove-user or project-role assignment controls.
- The project API update path for `people` also looks suspicious/incomplete relative to the schema in [ecsd_api/src/apis/projects/index.js](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_api/src/apis/projects/index.js:215).

**How to find it in the UI:**
- Web console:
  - `Users` -> `/user-management`
  - `Projects` -> `/project-management`
- I did not find project-specific role assignment controls in the active web console.

## 8. AI Chat Integration

**Status:** `Fully implemented`

**Why:**
- There is a real OpenAI-backed expert/chat service in `ecsd_expert`, including routes in [ecsd_expert/src/routes/expert/index.js](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_expert/src/routes/expert/index.js:10) and OpenAI integration in [ecsd_expert/src/services/chatgpt/index.js](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_expert/src/services/chatgpt/index.js:13).
- The mobile app exposes a chat screen in [ecsd_mobile/lib/app.dart](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_mobile/lib/app.dart:109) and [ecsd_mobile/lib/screens/chat.dart](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_mobile/lib/screens/chat.dart:15).
- I did not find an active chat entry in the web console routes.
- Under the clarified audit rule, that does not count against implementation by itself, because the PDF item does not require the feature to be available specifically in both web and mobile.
- Remaining risk: I did not functionally test the chat service end to end during this audit.

**How to find it in the UI:**
- Mobile app:
  - Drawer -> `Chat`
- Web console:
  - I could not find an active chat route or menu item.

## 9. System Notifications & Alerts

**Status:** `Partially implemented`

**Why:**
- There is some email/send infrastructure tied to inspection PDF sharing in [ecsd_api/src/apis/inspections/index.js](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_api/src/apis/inspections/index.js:185).
- The web console has a notifications page, but it is a demo/template page with canned snackbar examples in [ecsd_console/src/layouts/pages/notifications/index.js](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_console/src/layouts/pages/notifications/index.js:17).
- The mobile app also has a notifications screen, but its data is static sample content in [ecsd_mobile/lib/screens/notifications.dart](/home/joshua/WebDev/kognova/ecs/ecs_platform/ecsd_mobile/lib/screens/notifications.dart:8).
- I did not find implemented inspection-assignment reminders, overdue corrective-action alerts, or a real in-app notification center wired to backend events.

**How to find it in the UI:**
- Web console:
  - direct route `/pages/notifications`
  - not exposed in the active compliance sidenav
- Mobile:
  - `Notifications`

## Bottom Line

What is clearly present in the current web console:
- companies, projects, users
- inspections
- action items
- inspection templates
- inspection PDF export/share
- site-map upload/edit

What is not clearly present in the current web console:
- a real project/user dashboard
- a document vault
- SWMP upload/assignment
- project-specific role assignment UI
- production notification center

That matches your observation: a number of Section 4 claims are broader than what the current web console actually exposes.
