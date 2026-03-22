# GitHub

This project is hosted at **[https://github.com/brperry/timebot](https://github.com/brperry/timebot)**.

The local repo should have `origin` set to that URL:

```powershell
git remote -v
# origin  https://github.com/brperry/timebot.git (fetch)
# origin  https://github.com/brperry/timebot.git (push)
```

To push updates from `main`:

```powershell
cd "c:\Cursor Projects\Discord Timestamp Bot"
git push origin main
```

If you need to add the remote on a fresh clone:

```powershell
git remote add origin https://github.com/brperry/timebot.git
git branch -M main
git push -u origin main
```

Use a GitHub **Personal Access Token** as the password when Git prompts over HTTPS, or use [GitHub CLI](https://cli.github.com/) (`gh auth login`).
