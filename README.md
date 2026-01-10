# nplus-book-core

[![](https://img.shields.io/github/v/release/Andrewnplus/nplus-book-core?style=flat-square)](https://github.com/Andrewnplus/nplus-book-core/releases)

A centralized Hugo Module extending the **Hugo Book** theme. Designed for the nplus.wiki ecosystem to provide unified styles, components, and navigation.

## ✨ Features

- **Unified Design System**: Centralized Light/Dark mode via CSS variables.
- **Enhanced Navigation**:
    - Top "Back to nplus.wiki" button.
    - Bottom "Theme Switch" button.
- **Custom Components**: Optimized `book-cover` shortcode.
- **Asset Management**: Global Favicons, Logos, and Archetypes.

## 📦 Installation

Add the following to your site's `hugo.toml`:

[module]
[[module.imports]]
path = "github.com/Andrewnplus/nplus-book-core"

[params]
# Required: Lock to 'light' to allow Core SCSS to manage themes
BookTheme = 'light'

## 🛠️ Usage

### Book Cover Shortcode
Standardized card for book summaries:

{{< book-cover
src="images/cover.jpg"
title="Book Title"
author="Author Name"
date="YYYY-MM-DD"
link="https://amazon.com/..." >}}
Your Markdown summary here.
{{< /book-cover >}}

### Markdown Alerts
Supports standard GitHub-style alerts:

> [!NOTE]
> Use this for general notes.

> [!TIP]
> Use this for helpful tips.

## 🎨 Maintenance

- **_variables.scss**: Global palette and theme mapping.
- **_custom.scss**: Global overrides and component styles.
- **menu.html**: Overridden sidebar structure.

### Release Workflow
This project uses Semantic Versioning. Push a tag to trigger downstream updates:

1. `git tag v1.0.0`
2. `git push origin v1.0.0`

---
© nplus.wiki