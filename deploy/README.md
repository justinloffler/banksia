# Server entry point for Node hosts

cPanel Web Apps (AI App Hosting) detects any Astro project as a static site and
serves it with a plain file server, which can't run the enquiry form. Pointing
the app's root folder (`appdir`) here gives it an ordinary Node app instead:

- **Build:** `npm run build` → installs and builds the site in the parent folder
- **Start:** `npm start` → runs `node ../dist/server/entry.mjs`, listening on `PORT`

Hosts that run `npm start` from the repository root don't need this folder.
