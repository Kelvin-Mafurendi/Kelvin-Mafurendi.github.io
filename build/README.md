# Site build

Builds the static site from entries published in Kelvin Studio. The same
renderer draws the app's preview (`studio/preview.html`), so a preview always
matches the published page.

```
render/markdown.mjs   the Markdown subset (bold, italic, links, lists, code)
render/blocks.mjs     blocks to HTML
render/pages.mjs      story pages, writing pages, project cards, Writing section, sitemap, feed
build.mjs             copies the site to _site/ and writes the generated pages
check/                screenshot and HTML comparisons, preview screenshots
test/                 renderer tests
```

## Commands

```
cd build && npm install
npm test                                  # renderer tests
node build.mjs --data site-data.json      # build from a JSON export into ../_site
node check/compare-html.mjs               # generated story pages and cards vs the hand-written ones
npx playwright install chromium           # once, for the screenshot checks
node check/compare.mjs                    # screenshots at 1440 and 390 px; images in check/out/
node check/preview-shot.mjs               # sample entries through the preview page
```

Without `--data`, the build reads the `public` collection and `config/site`
from Firestore, using the service account in `FIREBASE_SERVICE_ACCOUNT`.

On the home page, only the parts between `<!-- studio:... -->` markers are
generated. With nothing published, the output is the hand-written site.
