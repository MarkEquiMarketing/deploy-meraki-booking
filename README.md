# meraki-booking — booking.meraki.show (static)

Public static site for **booking.meraki.show** (Cloud86 / Plesk).
Generated from the `website/` dev repo via `build-site-zip.sh`.

- `/` → 301 redirect to https://meraki.show (see `.htaccess`)
- `/preregistration/` → the pre-registration giveaway funnel
- `/assets/` → shared Meraki library (meraki.css, meraki.js, logo, favicon)

Deploy: Plesk Git (Remote repository) pulls this repo to the booking.meraki.show docroot,
Automatic deployment + webhook. Edit → commit → push → auto-deploy.
