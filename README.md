# Mobility Control Tower (Static Demo)

A static, single-page experience that unifies five AI demos (Fleet, Ops, Revenue, Customer/Risk, ESG/Enterprise) into one Mobility Control Tower. All content is driven by local JSON files and can be hosted directly on GitHub Pages.

## Run locally

1. Ensure you are in the project root.
2. Start a lightweight HTTP server (required so `fetch()` can read the JSON files):
   ```bash
   python -m http.server 8000
   ```
3. Open the app at [http://localhost:8000](http://localhost:8000).

## Deploy to GitHub Pages

1. Commit and push the repository to GitHub.
2. In your repository settings, open **Pages** and choose:
   - **Source:** `Deploy from a branch`
   - **Branch:** `main` (or your default branch) and `/ (root)` directory
3. Save the settings. GitHub Pages will publish the site at `https://<your-username>.github.io/<repo-name>/`.

No build step is required; the site runs directly from the static files in this repository.
