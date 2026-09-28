# Mobile optimization

- 43 referenced photographs have responsive WebP derivatives (768, 1280, up to 1920 pixels). Camera originals are retained.
- Largest-variant total: 82,403,000 bytes approximately before, 5,990,000 bytes approximately after. These are asset totals, not measured network timing.
- Main hero originals: 40,490,642 bytes. Three 768px variants: 195,228 bytes total. Actual selection depends on screen width and pixel density.
- First hero remains high priority. Later slides have data-src/data-srcset and load on demand. Noncritical photographs use native lazy loading and async decoding. Responsive derivatives have a one-week cache lifetime.
- Public event and detail renderers also select derivatives, including existing D1 posts referring to original filenames.
- Mobile intro no longer blocks the first screen. Hero zoom and decorative rotation are disabled on small screens. Offscreen slides pause.
- Mobile and popup menus use explicit buttons and expanded state, restore missing submenus, and handle keyboard closing/focus. Mobile separators, hamburger lines, drawer height, calendar cells and editor toolbar spacing are scoped to mobile.
- Pinch zoom is allowed again.

Validation: 390px browser view of home and event pages; open drawer, expand Programs and show its child links; check submenu indicators and separators. No missing image paths or image src/data-src above 1MB among active root HTML pages. Existing 16 application tests and Wrangler deployment dry-run passed. Real device/network timing has not been measured.

Generation: scripts/optimize_mobile_images.py uses Pillow. assets/data/dewford-image-variants.json records originals and derivatives; assets/js/dewford-responsive-images.js is its client mapping.
