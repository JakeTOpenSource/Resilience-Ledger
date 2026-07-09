# Publishing to GitHub — step by step (no coding required)

*Written for Windows PowerShell. Replace `JakeTOpenSource` with your GitHub username everywhere, including inside `CITATION.cff`.*

Note: steps 6-9 (git init, first commit) are ALREADY DONE on this machine — the folder became a repository with an initial commit on 2026-07-02. Start at step 1 (account), then jump to step 10 (connect and push).

1. Create a GitHub account (skip if you already have one). In your browser open https://github.com/signup and sign up with your email address. The username you pick replaces JakeTOpenSource everywhere below — also update it inside CITATION.cff (the repository-code line) before you publish.

2. Check that Git is installed. Open PowerShell (Start menu, type: powershell, press Enter) and run:

git --version

If you see a version number, skip step 3.

3. Only if Git was missing, install it, then close and reopen PowerShell:

winget install --id Git.Git -e --source winget

4. Tell Git who you are (one time only). In PowerShell run both lines:

git config --global user.name "Your Name"
git config --global user.email "you@example.com"

5. Create the repository on GitHub. In your browser open https://github.com/new and fill in: Repository name: delta-atlas — Description: Deterministic, client-side coherence-audit tools + the Resilience Ledger method docs. CC BY 4.0. — Visibility: Public — and leave every "Initialize this repository with" checkbox UNCHECKED (no README, no .gitignore, no license — the folder already has all three). Click Create repository.

6. In PowerShell, go to the project folder:

cd "<path-to-your-project-folder>"

7. Turn the folder into a Git repository on a branch named main:

git init
git branch -M main

8. Stage everything, then eyeball what will be published:

git add .
git status

Read the list once. You should see the HTML tools, the .md docs, the JSON data, the two .js scripts, README.md, CONTRIBUTING.md, CITATION.cff, LICENSE.txt and .gitignore — and NO file ending in .local.js. If a .local.js file appears, stop and check that .gitignore is in the folder.

9. Make the first commit:

git commit -m "Initial public release: Delta Atlas / Resilience Ledger"

10. Connect the folder to the GitHub repository (replace JakeTOpenSource with your actual username):

git remote add origin https://github.com/JakeTOpenSource/Resilience-Ledger.git

11. Push it up:

git push -u origin main

A window will pop up asking you to sign in to GitHub in the browser (this is Git Credential Manager — it comes with Git for Windows). Sign in and approve once; it is remembered after that.

12. Verify. In your browser open https://github.com/JakeTOpenSource/Resilience-Ledger — you should see the file list with the README rendered underneath, and a "Cite this repository" button on the right from CITATION.cff.

13. Publishing future updates is always the same three commands from the project folder:

git add -A
git commit -m "describe what changed"
git push

14. OPTIONAL — free second mirror on GitHub Pages. On the repo page: Settings > Pages > under "Build and deployment" set Source to "Deploy from a branch", Branch: main, folder: / (root), then Save. A few minutes later the site is live at https://JakeTOpenSource.github.io/delta-atlas/ — a second free home in case the first ever goes away. The Cloudflare address stays primary: the install-as-app button and offline caching are tuned to the site living at the domain root, so expect those two features to behave best at https://resilience-eval-ai.pages.dev/.

15. OPTIONAL — install the GitHub CLI later, if you ever want it:

winget install --id GitHub.cli

Then close and reopen PowerShell and run:

gh auth login

Choose: GitHub.com, then HTTPS, then "Login with a web browser", and follow the prompt.
