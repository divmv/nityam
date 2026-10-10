# Nityam

Nityam is a quiet, installable web app for daily prayer and meditation. It is built with Expo and React Native Web, so you can use it in a browser on desktop, iPhone, or iPad and add it to your device's Home Screen.

## What it includes

- A searchable library of sloka lyrics.
- A meditation timer with a mantra, chant counter, and session log.
- A calendar for checking off morning prayer and meditation, with monthly totals and streaks.
- A Pause & Reflect journal with a guided breathing pause, anger intensity notes, and response reflections.
- Local saving for check-ins, meditation sessions, and reflections on the device/browser where you use the app.

Prayer reminders are not available in the installable web app. Your data is not synced to an account or backed up to a server. Clearing the browser's site data or removing the app may erase locally saved progress, including private reflection notes, so keep your own backup if the records matter to you.

## Run locally

### Requirements

- Node.js **22.13 or later** (the version required by this project's Expo SDK 57).
- npm, which is included with Node.js.

### Setup

Clone the repository and install the locked dependencies:

```sh
git clone https://github.com/divmv/nityam.git
cd nityam
npm ci
```

Start the web development server:

```sh
npm run web
```

Open the local URL printed in the terminal (usually `http://localhost:8081`). Changes to the source files appear in the running development session after the app reloads. Stop the server with `Ctrl+C`.

Other available commands:

```sh
npm start          # Start the Expo development server
npm run web:build  # Export a production web build into dist/
npm run lint       # Run Expo's ESLint checks
```

## Deploy the web app

The project is configured to deploy to Expo Application Services (EAS) Hosting. Sign in with the Expo account that owns the linked EAS project, then run:

```sh
npx eas-cli@latest login
npm run web:deploy
```

The deploy script exports the web app and publishes a production deployment. EAS CLI prints the deployment URL when it finishes. You need access to the linked Expo project to deploy it.

## Add it to an iPhone or iPad Home Screen

1. Open the deployed app URL in Safari.
2. Tap **Share**.
3. Choose **Add to Home Screen**, then confirm.

The installed icon opens Nityam in its own app-style window. The Home Screen version uses the same browser/device storage as the website on that device.

## Project files

- `App.js` — top-level app state and section switching.
- `src/screens/` — library, meditation, and calendar screens.
- `src/styles.js` — shared visual styles.
- `src/utils/` — date helpers.
- `songs.json` — prayer and mantra lyrics shown in the library.
- `public/` — web app manifest, browser entry page, and install icons.
- `assets/nityam-icon.svg` — editable vector source for the app icon; `scripts/generate-icons.ps1` renders the web and native PNG sizes.

## More information

- [Expo SDK 57 documentation](https://docs.expo.dev/versions/v57.0.0/)
- [Publish an Expo web app with EAS Hosting](https://docs.expo.dev/deploy/web/)
