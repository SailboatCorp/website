KAIDENUK editable static site
================================

This is the same public site structure, but optimised for future editing through a Website Hub.

Files
-----
index.html
  The page shell. You normally do not edit this unless the structure of the site changes.

styles.css
  The visual design. Colours, spacing, cards, layout, mobile behaviour, and desktop behaviour live here.

app.js
  The renderer. It reads content.json, builds the homepage, science section, art section, writing section, nav buttons, footer, and internal app-style navigation.

content.json
  The editable content. This is the important file for the future Website Hub.
  Artworks, publications, qualifications, awards, links, page titles, subtitles, images, and buttons live here.

How to edit content manually for now
------------------------------------
Open content.json in a text editor.
Change the text you want.
Save the file.
Upload the changed content.json to your repo.

For example, to add an artwork, edit:

  art > artworks

Add another object like:

  {
    "title": "New Artwork Title",
    "text": "Description of the artwork.",
    "image": "assets/art/new-artwork.jpg"
  }

The image field is optional. If it is missing, the artwork appears as a text card.

How images work
---------------
You can use:

1. A full image URL:
   "https://example.com/image.jpg"

2. A local repo path:
   "assets/art/my-painting.jpg"

3. An asset reference already defined in content.json:
   "asset:art"

How links work
--------------
You can use:

1. A full URL:
   "https://example.com"

2. A link reference already defined in content.json:
   "link:barnes"

Local preview
-------------
Because the site loads content.json, opening index.html directly from your files may not work in every browser.
Use a small local server instead.

From inside this folder, run:

  python3 -m http.server 8000

Then open:

  http://localhost:8000

On Windows, Python may be:

  py -m http.server 8000

GitHub Pages / Cloudflare Pages
-------------------------------
Upload these files to your repo:

  index.html
  styles.css
  app.js
  content.json

The site should work without npm, React, Vite, or any build command.

Future Website Hub logic
------------------------
The future hub should edit content.json first.
That keeps the design safe and makes the content easy to add, remove, reorder, and publish.
