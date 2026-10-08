=== Motion Studio ===
Contributors: Abhishek
Tags: animation, visual editor, effects, text styles, page builder
Requires at least: 5.8
Tested up to: 6.6
Requires PHP: 7.4
Stable tag: 1.2.0
License: GPLv2 or later

Front-end visual editor for ANY theme: click an element to edit content, add in/out animations, FX, text styles and drag/resize the layout – per device.

== Description ==

Open any page in Motion Studio, click an element (hero, heading, text, image, button, menu, footer…) and use the six tabs (Edit · Animate · FX · Text · Layout · Link):

* **Edit** – type text directly on the page (double-click), replace images from the Media Library, change links, colors, gradients, background images (incl. fixed/parallax), borders, radius, shadows, filters, blend modes, hide per device.
* **Animate** – 34 entrance animations (fade, slide, zoom, pop, bounce, flip, reveal/wipe, circle, glitch-in, typewriter…), matching exit animations (on scroll-out, after a delay, or on click), 15 loop/attention animations (pulse, float, shake, tada, jello…). Triggers: scroll, page load, hover, click. Duration, delay, easing, distance, stagger children (menus/cards pop one by one), split text into letters or words, replay on every scroll.
* **FX** – 35+ combinable effects: glitch, RGB split, jitter, text scramble/decode, bounce, float, heartbeat, Ken Burns, parallax, neon, pulse glow, animated border glow, shine sweep, spotlight & cursor glow, animated gradient, rainbow text, glass, 3D tilt, magnetic, lift, grow, zoom, ripple, number counter and more.
* **Text** – 40 one-click text styles (gradients, gold, chrome, outline, neon, 3D, long shadow, retro, fire, ice, highlighter, comic, arcade, terminal…) plus full typography with 40 Google Fonts.
* **Layout** – drag to move and resize with handles on the page (snap to grid), width/height, quick layouts (row, column, center, 2/3/4 columns, container, full width, full height, sticky, stack on mobile), flex/grid controls, margin/padding box, position, z-index, rotate, scale, order.

**Canva-style builder (new in 1.1):**

* **+ Add panel with drag & drop** – 24 elements (heading, text, buttons, image, image frame, icon, video, section, 2/3 columns, card, quote, check list, badge, divider, spacer, wave divider, blob shape, countdown, FAQ, progress bar, social icons, popup). Drag them anywhere – a green line shows exactly where it lands – or click to add after the selected element.
* **13 ready-made, pre-animated sections** – hero (split & centered), features, stats counters, gallery, pricing, team, reviews template, call-to-action, FAQ, logo marquee, contact strip, launch countdown.
* **Reorder anything by drag & drop** – drag the ⠿ Move handle under any selection (theme elements too), or use ↑ ↓, duplicate (Ctrl+D) and delete.
* **Frames** – 32 Canva-like shapes & mockups: circle, blob, morphing blob, arch, hexagon, star, heart, cloud, flower, wave, speech bubble, polaroid, phone, tablet, browser window, gallery frame, 3D tilt… Drag a frame onto any image, or drop images into frames.
* **Images** – upload, open the Media Library, drag images from the panel onto pictures/frames, or drop files from your computer straight onto the page.
* **Link tab** – make anything clickable: web address, page on your site, smooth-scroll to an element (pick it on the page), open/close a popup, back to top, email, phone, WhatsApp.
* **Connections** – draw curved, straight or elbow lines/arrows between elements (animated flow, draw-in on scroll) for steps, timelines and diagrams. They follow the elements on every screen size.
* **Menu styles** – 14 hover styles (underline slide, pill, gradient pill, glass bar, segmented, neon, brackets, fill sweep…) plus a Motion Studio mobile menu (drawer, full screen, dropdown) and header behaviour (sticky, shrink, frosted glass, transparent until scroll, hide on scroll down).
* **Site themes** – 14 one-click themes (Minimal, Startup, Dark Neon, Corporate, Pastel, Luxury Gold, Nature, Sunset, Ocean, Retro 80s, Cyberpunk, Brutalist, Monochrome, Coffee) with editable colors, fonts and button radius; works with block themes too.
* **Site extras** – reading progress bar, back-to-top button, smooth scrolling, page fade-in, custom cursor, selection & scrollbar colors.
* **Hover state** – edit how any element looks on mouse-over.

Time savers:

* ✨ **Auto-animate page** – one click animates menu, headings, images, buttons, columns, paragraphs and footer.
* ⚡ **18 one-click recipes** – Hero entrance, Menu pop, Cards stagger, Letters rise, Typewriter, Glitch title, Neon sign, Attention button, Parallax image, 3D card, Popup notice, Stats counter…
* **Responsive editing** – desktop / tablet / mobile styles with device preview.
* **All pages (global)** – style the header, menu and footer once for the whole site.
* **All similar** – edit every matching element (e.g. all H2s, all cards) at once.
* Copy / paste style, undo / redo (100 steps), keyboard shortcuts, 10 saved revisions per page, import / export, “reduce motion” accessibility support, option to disable on phones.
* Zero overhead on pages you didn't edit; styles are printed as CSS in the head (no flash), behaviour runs from one small script.

== Installation ==

1. Upload the `motion-studio` folder to `/wp-content/plugins/` (or upload the zip in Plugins → Add New → Upload).
2. Activate the plugin.
3. Visit any page while logged in and click **Edit with Motion Studio** in the admin bar – or go to **Motion Studio** in the dashboard and press **Launch Editor**.

== Keyboard shortcuts ==

Ctrl+K search everything · ? shortcuts list · Ctrl+S save · Ctrl+Z / Ctrl+Y undo/redo · Esc deselect · ↑ select parent · Alt+↑ / Alt+↓ move element · Ctrl+D duplicate · Ctrl+C / Ctrl+V copy/paste style · Delete delete/hide · A add panel · L drag/resize · P preview mode

== Notes ==

* Elements are targeted with CSS selectors. If you later restructure a page in the block editor, re-check edits on that page (the dashboard lists every edited page; revisions can be restored).
* Added blocks are inserted by the page script (like most visual add-ons), so their text is not part of the raw HTML search engines see first. Keep your most important SEO text in the WordPress editor.
* Admins with the `unfiltered_html` capability can save any HTML in blocks; other roles get WordPress's safe HTML filter.
* Requires the user capability `edit_theme_options` (Administrators).

== Changelog ==

= 1.2.0 =
* Friendlier editor: light design (with dark mode), clearer top bar with save status and a ⋯ menu.
* Floating toolbar next to the selected element (Edit text / Replace / Style / Animate / Link / Move / Duplicate / Delete).
* Welcome guide, “What would you like to do?” home panel, styled tooltips and dialogs, Undo buttons in notifications.
* Simple / Advanced switch with plain-language labels; dots on tabs that have settings.
* Search everything (Ctrl+K), live previews on animation & effect tiles, quick color swatches, library search.
* Drafts are autosaved in the browser and offered back if you leave without saving.

= 1.1.0 =
* Drag & drop builder: elements, sections, reorder, duplicate, delete.
* Canva-style image frames & mockups, media panel, file drop upload.
* Link tab (links/actions on any element) and connector lines.
* Menu styles, mobile menu, header behaviour, popups, countdown, video.
* One-click site themes and site extras; hover state editing.

= 1.0.0 =
* First release.
