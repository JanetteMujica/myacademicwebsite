# Hugo Website Cheat Sheet

Janette Mujica

This website is built with:

- Hugo Extended
- Git/GitHub
- The pmichaillat academic website template
- GitHub Pages

Repository:
https://github.com/JanetteMujica/myacademicwebsite

---

# 1. Open the project

Open PowerShell and navigate to the website folder:

```powershell
cd C:\Users\Janette\Documents\myacademicwebsite
```

---

# 2. Start the local website

Because Windows does not currently recognize the `hugo` command directly, use:

```powershell
& "C:\Users\Janette\AppData\Local\Microsoft\WinGet\Links\hugo.exe" server
```

If successful, Hugo will display:

```text
Web Server is available at:
http://localhost:1313/myacademicwebsite/
```

Open this URL in your browser:

http://localhost:1313/myacademicwebsite/

---

# 3. Stop the local website

In PowerShell:

```text
Ctrl + C
```

---

# 4. Main files to edit

## Site configuration

File:

```text
config.yml
```

Contains:

- Website title
- Social media links
- Menu navigation
- Base URL
- Author information

Current URL:

```yaml
baseURL: 'https://janettemujica.github.io/myacademicwebsite/'
```

---

## Website content

Folder:

```text
content/
```

Contains pages such as:

- About
- Research
- Publications
- Teaching
- Contact

---

## Images

Folder:

```text
static/
```

Store:

- Profile photo
- CV
- PDFs
- Other files

Examples:

```text
static/images/
static/files/
```

---

# 5. Save changes

After editing any file:

1. Save the file
2. Refresh the browser

Hugo automatically rebuilds the website.

No need to restart Hugo.

---

# 6. Check modified files

```powershell
git status
```

Shows which files changed.

---

# 7. Save changes to Git

```powershell
git add .
git commit -m "Describe changes"
```

Example:

```powershell
git commit -m "Update biography and CV"
```

---

# 8. Upload changes to GitHub

```powershell
git push
```

---

# 9. Download latest version from GitHub

Before working on the site:

```powershell
git pull
```

---

# 10. Useful Git commands

Current status:

```powershell
git status
```

Upload changes:

```powershell
git push
```

Download changes:

```powershell
git pull
```

View commit history:

```powershell
git log --oneline
```

---

# 11. Common workflow

Every time I work on the website:

Step 1

```powershell
cd C:\Users\Janette\Documents\myacademicwebsite
```

Step 2

```powershell
git pull
```

Step 3

```powershell
& "C:\Users\Janette\AppData\Local\Microsoft\WinGet\Links\hugo.exe" server
```

Step 4

Open:

```text
http://localhost:1313/myacademicwebsite/
```

Step 5

Edit files and save

Step 6

```powershell
git add .
git commit -m "Describe changes"
git push
```

---

# 12. Troubleshooting

## Error

```text
hugo is not recognized
```

Use:

```powershell
& "C:\Users\Janette\AppData\Local\Microsoft\WinGet\Links\hugo.exe" server
```

---

## Website not loading

Make sure Hugo is still running.

You should see:

```text
Web Server is available at ...
```

in PowerShell.

---

## Check Hugo version

```powershell
& "C:\Users\Janette\AppData\Local\Microsoft\WinGet\Links\hugo.exe" version
```

Expected:

```text
hugo v0.165.0+extended
```

---

# Future Improvement

After restarting
