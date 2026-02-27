# Connect This Project to GitHub

Your project is already a Git repo with an initial commit. Follow these steps to create a new GitHub repository and push your code.

## 1. Create the repository on GitHub

1. Open **https://github.com/new**
2. Set **Repository name** to something like `discord-timestamp-bot` (or `Discord-Timestamp-Bot`).
3. Leave **Description** blank or add a short description.
4. Choose **Public** (or Private if you prefer).
5. **Do not** check "Add a README", "Add .gitignore", or "Choose a license" (you already have these locally).
6. Click **Create repository**.

## 2. Connect and push from your project

After creating the repo, GitHub will show you a "push an existing repository" section. Use your **username** and **repo name** in the commands below.

In a terminal, from your project folder run:

```powershell
cd "c:\Cursor Projects\Discord Timestamp Bot"

# Add GitHub as remote (replace YOUR_USERNAME and YOUR_REPO with your GitHub username and repo name)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push your code
git push -u origin main
```

**Example:** If your GitHub username is `jane` and the repo is `discord-timestamp-bot`:

```powershell
git remote add origin https://github.com/jane/discord-timestamp-bot.git
git push -u origin main
```

Git will prompt for your GitHub credentials. Use a **Personal Access Token** as the password (GitHub no longer accepts account passwords for Git over HTTPS). To create one: GitHub → Settings → Developer settings → Personal access tokens → Generate new token (classic), with at least the `repo` scope.

---

**Optional: use GitHub CLI instead**

If you install [GitHub CLI](https://cli.github.com/), you can create the repo and push in one go:

```powershell
gh auth login
gh repo create discord-timestamp-bot --public --source=. --remote=origin --push
```

You can delete this file after you’ve finished connecting to GitHub.
