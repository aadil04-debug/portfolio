AADIL ABDULLAH — PORTFOLIO
==========================

WHAT'S INSIDE
  index.html              Home page: hero, projects, about, services, contact
  project1.html – 5       Case-study pages
  project-template.html   Copy this to add the sixth project
  css/style.css           All styling. Colours are the variables at the top.
  js/script.js            Theme switch, filters, menu, form. No libraries.
  assets/img, assets/video  Images and videos

PREVIEW
  Open index.html in a browser. The Archivo font loads from Google Fonts,
  so you need an internet connection to see it.

PUBLISH
  Upload the whole folder to any static host (Netlify, Vercel, GitHub Pages,
  Cloudflare Pages). There is no build step.

THEMES
  Dark is the default. The button in the header switches to light, and the
  visitor's choice is remembered. The hero stays dark in both themes.

EDITING
  Text ............ open any .html file in a text editor
  Colours ......... top of css/style.css (dark theme = :root,
                    light theme = :root[data-theme="light"])
  Hero loop ....... replace assets/video/hero-loop.mp4 (16:9, under ~2 MB)
                    and assets/img/hero-poster.jpg (one frame from it)
  Stats ........... index.html, the data-count values in the About section
  Contact form .... sends through Formspree; the form ID is in the
                    <form action="..."> in index.html

ADD THE SIXTH PROJECT
  1. Copy project-template.html to project6.html and replace everything
     marked EDIT. Put its images in assets/img/.
  2. In index.html, replace the "Coming soon" tile with a link tile, using
     the same markup as the other five (<a class="tile" href="project6.html"
     data-category="video" ...>).
  3. In project5.html, point "Next project" at project6.html, and in
     project6.html point it back at project1.html.
