# Dewford subpage content sources

Updated 2026-09-21. Existing page URLs are retained. Only the ten empty subpage main areas were populated; header, footer, floating controls, index.html, event.html and detail.html were not rewritten.

## Source mapping

| Page | Source |
| --- | --- |
| why-dewford.html | Korean content plan slides 3, 5, 10, 12–14; September brochure pp. 4–5, 9–11, 24–26 |
| educational-philosophy.html | Korean plan slides 4, 12; brochure pp. 2, 6, 24–26 |
| rolling-enrollment.html | User's current instruction: rolling admissions without an entrance test; plan slide 15 for consultation/placement flow |
| admissions-inquiry.html | User permits individual consultation instead of Google Forms; contact details from plan slide 17 and brochure pp. 1, 28 |
| international-preschool.html | Brochure pp. 10–23; plan slides 6–7, 10–11; recovered EEP presentation slides 2–10, 12–13 |
| elementary-international.html | Elementary presentation slides 2–8, 11; plan slide 9 |
| elementary-esl.html | Elementary presentation slides 3–10; plan slide 8 |
| preschool-calendar.html | Plan slide 16 lists calendar categories, but contains no confirmed dates |
| elementary-calendar.html | Plan slide 16; elementary slides 6–8 for programme categories, but no confirmed academic calendar |
| contact.html | Plan slide 17; brochure pp. 1, 28; existing approved Yongsan address |

## Deliberate resolutions

- The user's no-entrance-test instruction overrides older elementary admission-test slides. Learning-progress assessments are distinguished from entrance selection.
- The recovered EEP deck describes an external-student after-school programme. It is a separate section under Early Learning, not presented as the regular preschool timetable.
- Detailed programme slides 10–11 take precedence over the older high-level roadmap when describing primary programmes and schedules.
- Exact preschool arrival/departure times are absent; the page gives learning areas and directs families to consultation for the class timetable.
- No fees, discounts, make-up-class policy, unverifiable awards, graduate placements or testimonials were published. These are either outdated/conflicting, examples, or placeholders in the source materials.
- The elementary file contains an inconsistent address and invalid/old recruitment dates. The already approved Yongsan address is retained; those dates are not published.
- Brochure p. 27 contains unrelated employee exit-interview placeholder text and is not used.
- No confirmed calendar events or monthly event posters were supplied. Calendar data arrays are empty, with a clear upcoming-information state. The existing Events gallery and its connection to main-page posts are preserved.
- No Google Form URL was supplied. The consultation form composes an email to ADMIN@DEWFORD.COM and explicitly requires the user to send it in their mail app. It does not claim a server-side submission.

## Layout sources

- about-us/index.html: Elementor 5639, sections f6f639c (photo/text introduction) and 96fc02e (learning/process rows).
- contact-us/index.html: Elementor 6031, section 8336f3e (contact information and inquiry columns).
- event.html: existing Elementor 5099 title markup, image and gradient treatment.
- Additional curriculum tables and calendar controls adapt to these sections with square corners and shared brand typography.

## Maintenance

- Calendar dates: assets/data/dewford-calendar.js; separate `early` and `primary` arrays. Entries use `{date: 'YYYY-MM-DD', title: '...', category: '...'}`.
- Event posts remain in assets/data/dewford-events.js and continue to drive the home/gallery/detail views.
- Page-specific copy is rendered in each HTML file for accessibility and static hosting.
- Classroom images are extracted directly from the supplied brochure, with separate assets under assets/images/dewford/subpages/.
- Backups: ../dewford-backups/subpages-before-content-20260921/.

## Template design revision

The ten content pages were redesigned using the requested About Us, FAQ and Contact Us templates. The existing content and shared title/header/footer/floating controls were preserved.

- About Us: restored rotating text widget; large centered introduction; asymmetric image/copy block; mission/vision tabs; staggered numbered history and process layouts.
- FAQ: adapted its original question-row markup into accessible button-controlled panels; sticky explanatory column; animated plus/minus and panel expansion. Programme subjects and calendar guidance use this structure.
- Contact Us: editorial heading, photo/contact column, wide consultation form with underline fields, icon-led action buttons.
- Motion: viewport fade/slide and divider reveal, subtle image hover zoom, tabs and accordion transitions. Reduced-motion preferences are respected; body copy stays visible without JavaScript.
- Validation: 320/768/1440 content widths, image references and square corners; keyboard accordion/tab interactions; calendar controls; consultation email handoff; reduced-motion behavior.
- Design CSS and interaction code: assets/css/dewford-subpage-design.css, assets/js/dewford-subpage-motion.js.

## Image source correction

Per the user's instruction, all eight brochure-derived body photographs were replaced with the separately supplied JPG files in ../이미지/서브페이지/. The page assets now live in assets/images/dewford/attached/. Each body photograph is used on one page only; the existing shared title image, index, header and footer were preserved. PPT/PDF files remain text sources only.

| Page | Supplied image |
| --- | --- |
| Why Dewford | 22464741.jpg |
| Vision & Mission | 22483778.jpg |
| Rolling Admissions | 22129227.jpg |
| Apply Now | 22492842.jpg |
| International Early Learning | 21362217.jpg |
| International Primary | 22444901.jpg |
| Primary ESL | 21170268.jpg |
| Contact | 22483785.jpg |

## Superseding native-template-only revision

The previous custom layouts and motion were disconnected at the user's request. Each main was cleared, then populated from original About Us / FAQ / Contact Us Elementor sections, preserving their widget classes, settings, layout CSS and native animation hooks. Existing copy was refilled into those template text slots. Programme tables and the custom empty calendar were converted to the FAQ template's text panels; confirmed dates are still pending. Title sections now also come from these three templates. The remaining adaptation stylesheet only covers branding, square corners, Korean text fit and form status. The remaining JS supplies email handoff and keyboard accessibility, not custom animation. Generic award logos were replaced with icons taken from the same About Us template; supplied photography remains in use.
