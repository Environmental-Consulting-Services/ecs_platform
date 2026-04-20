# Mobile App Features Missing From Web Console

This is a static code inventory for local smoke testing. It compares the Flutter mobile app in `ecsd_mobile` with the React web console in `ecsd_console`.

## Summary

Yes, chat belongs on the mobile-only list.

The mobile app exposes a visible **Field Expert** chat workflow. The web console does not expose an equivalent chat, Field Expert, or messages UI. The console only has unused-looking message helper methods in its CRUD service layer.

The largest mobile-only gaps to smoke test are:

1. Field Expert chat.
2. Integrated field inspection workspace.
3. On-device site map annotation.
4. Mobile-first company to project to inspection workflow.

## Mobile-Only Or Materially Mobile-Only Features

| Feature | Mobile implementation | Web console status |
| --- | --- | --- |
| Field Expert chat | The drawer has a `Field Expert` item that routes to `/chat`. The chat screen is titled `Your Field Expert`, polls messages, and sends new messages to `expert`. Relevant files: `ecsd_mobile/lib/widgets/drawer.dart`, `ecsd_mobile/lib/screens/chat.dart`, `ecsd_mobile/lib/services/message_service.dart`. | No visible route, menu item, page, or component for chat/Field Expert/messages was found in `ecsd_console`. `ecsd_console/src/services/cruds-service.js` has message helper methods, but no callers were found. |
| Integrated field inspection workspace | Mobile inspection pages combine `Inspection Form`, `Site Map`, and `Action Items` as bottom tabs in the same field workflow. Relevant file: `ecsd_mobile/lib/screens/inspection.dart`. | Web supports inspections, action items, forms, and site maps as separate management/admin screens, but not as the same integrated field-execution workspace. |
| On-device site map annotation | Mobile uses `FlutterPainter` to draw, edit, undo/redo, delete, flip, render, save, upload, and attach site map annotations. Relevant file: `ecsd_mobile/lib/screens/sitemappainter-widget.dart`. | Web can upload/change a project site map image in `ecsd_console/src/cruds/project-management/edit-project-site-map/index.js`, but no equivalent interactive annotation painter was found. |
| Mobile-first company/project/inspection navigation | Mobile flows from companies to projects to project tabs, then into inspection tabs. Relevant files: `ecsd_mobile/lib/screens/companies.dart`, `ecsd_mobile/lib/screens/projects-list.dart`, `ecsd_mobile/lib/screens/project.dart`, `ecsd_mobile/lib/screens/inspection.dart`. | Web has CRUD screens for the same core entities, but the UX is management-oriented rather than a field workflow. |
| Mobile settings and notification placeholder screens | Mobile has settings, notification settings, privacy/about links, and static Personal/System notification tabs. Relevant files: `ecsd_mobile/lib/screens/settings.dart`, `ecsd_mobile/lib/screens/notifications.dart`, `ecsd_mobile/lib/screens/notifications-settings.dart`. | Web has account settings and sample/demo notification UI, but these do not appear to be equivalent domain notification features. Treat this as a lower-priority gap unless runtime behavior proves otherwise. |

## Shared Features Present In Both Apps

The following areas are not mobile-only. They exist in both apps, although the workflow and UI differ:

- Authentication/login.
- Companies.
- Projects.
- Inspections.
- SurveyJS inspection forms.
- Action items.
- Action item notes.
- Inspection templates.
- Project site map upload/view.
- User/profile/account flows.

## Chat Confirmation

Chat is a real mobile feature and a web-console gap.

Mobile evidence:

- `ecsd_mobile/lib/app.dart` registers the `/chat` route.
- `ecsd_mobile/lib/widgets/drawer.dart` exposes the `Field Expert` drawer item.
- `ecsd_mobile/lib/screens/chat.dart` renders the `Your Field Expert` screen, loads messages every 3 seconds, and sends messages to `expert`.
- `ecsd_mobile/lib/services/message_service.dart` handles message POST/GET calls.
- `ecsd_mobile/lib/services/chat_helper_service.dart` uses separate chat host/port/scheme/path environment values.

Web console evidence:

- `ecsd_console/src/routes.js` has no chat, Field Expert, or messages route.
- `ecsd_console/src/examples/Sidenav/index.js` only renders configured routes and external docs/support links.
- `ecsd_console/src/services/cruds-service.js` has message service methods, but static search did not find UI callers.

## Smoke Test Focus

For a local smoke test, prioritize these mobile-only flows:

1. Log into the mobile app and open **Field Expert** from the drawer.
2. Send a chat message and confirm a response or persisted message thread through the expert/chat service.
3. Open a project inspection and move between `Inspection Form`, `Site Map`, and `Action Items`.
4. Draw on a site map, save it, and confirm it reloads.
5. Create or update an action item from the inspection flow.

Then verify shared platform features in both apps:

1. Company list loads.
2. Project list loads for a company.
3. Inspection list loads for a project.
4. SurveyJS inspection form loads and saves.
5. Action item notes can be created and viewed.

## Web Console Notes Found During Inventory

These are not mobile/web feature gaps, but they may affect a local smoke test:

- Login appears to navigate to `/dashboard/analytics`, while the registered example dashboard route appears to use `/dashboards/analytics`.
- Inspection template delete may reference a mismatched service method name.
- Some action item and inspection template permission checks appear to use the `projects` permission subject.

