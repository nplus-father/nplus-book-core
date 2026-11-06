# nplus-book-core

[![release](https://img.shields.io/github/v/release/nplus-father/nplus-book-core?style=flat-square)](https://github.com/nplus-father/nplus-book-core/releases)

Hugo Module，包在 [hugo-book](https://github.com/alex-shpak/hugo-book) 外面，
給 nplus.wiki 星系（約 1620 本書 + 11 本手冊）提供統一的色盤、元件與導覽。

## 安裝

書本站台的 `site/hugo.toml`：

```toml
[[module.imports]]
path = "github.com/nplus-father/nplus-book-core"

[params]
BookSection = "docs"
BookTheme   = "light"   # 必填 light：明暗切換由本模組接管（見「樣式與明暗」）
locale      = "zh-Hant-TW"
```

`site/go.mod` **不要 require 本模組的版本**。釘了版本的站拿不到任何主題更新，
用了新 shortcode 還會 build 失敗（過去曾有數百本這樣卡住，已清掉）。留空即可，
Hugo 會在 build 時抓最新 tag。本機 `hugo` build 會把 require 寫回 `go.mod`，
那是 build 產物，提交前要清掉。

## Shortcodes

### `book-cover`

書籍站首頁的開場。原始 `cover.png` 會照常發佈到 `/cover.png`（portal 與筆記站
靠那個網址取書封），版面上另外用 build 時產生的 WebP 縮圖。

metadata 放在 `site/content/_index.md` 的 frontmatter `book:` 區塊，正文只寫
自閉合的 shortcode：

```
---
title: "直覺幫浦與其他思考工具"
book:
  title: "直覺幫浦與其他思考工具"
  author: "Daniel C. Dennett"
  published: "April 29, 2013"
  link: "https://www.amazon.com/dp/B00AR354AQ"
  cover: "cover.png"
  blurb: "一到兩句繁體中文簡介，30–75 字。"
---

{{< book-cover />}}
```

shortcode 仍接受 `title`／`author`／`date`／`link`／`src` inline 參數與成對寫法的內文，
而且**優先於 frontmatter**——那只是遷移期的相容路徑，**不要新增**：inline 參數一加，
頁面顯示的值就和 `index.json` 發布的 frontmatter 值分家。少數書刻意用成對的
`{{< book-cover >}}…{{< /book-cover >}}` 包一大段正文，那時內文就是簡介。

欄位規則（`cover` 一律 `cover.png`、`published` 一律 `Month D, YYYY`、`link` 必須是
商品頁、`blurb` 繁中 30–75 字）見 `books-management/CLAUDE.md`。

### `book-overview`

四段深度概覽，JS 收成分頁。內文只寫 h2，段名固定為下面四個：

```
{{% book-overview %}}

## 作者的位置
## 完整摘要
## 定位
## 這本書的限制

{{% /book-overview %}}
```

伺服器端輸出的永遠是四段完整可讀的 section，分頁是漸進增強。段名是資料契約——
`data-default`、分頁按鈕的中英對照表、`audit-overview.py` 的「四段齊全」都拿
中文段名比對。

### `note-cover`

多來源整合筆記的 hero 卡。參數：`title`（必填）、`src`、`tags`（逗號分隔）、
`doc1`–`doc5` 與 `docText1`–`docText5`、Inner 為 Markdown 說明。

## 數學公式

內文直接寫 `$…$`（行內）與 `$$…$$`（獨立一行的區塊），不用 `{{< katex >}}` shortcode，
也不要寫成 `\\(…\\)`。站台的 `site/hugo.toml` 要開 goldmark passthrough（模板已含）：

```toml
[markup.goldmark.extensions.passthrough]
enable = true
[markup.goldmark.extensions.passthrough.delimiters]
block = [['$$', '$$']]
inline = [['$', '$']]
```

這段沒辦法收進主題：Hugo 只把模組設定檔的 `params`、`menus`、`outputs` 等區段併進站台，
`markup` 不併。開了之後 `layouts/_markup/render-passthrough.html` 會在 build 時用
`transform.ToMath`（Hugo 內建 KaTeX）把公式轉成 HTML，瀏覽器只載 `katex.min.css`。

- 分隔符只收 `$`／`$$`，刻意不收 `\(`／`\[`：全庫有不少 `\[註\]` 這種 Markdown 跳脫，
  收了會被當成公式。
- `$` 同時是貨幣符號。hook 對「沒有反斜線、又含中文、或長得像 `$5 and $10`、`$100-$499`」
  的行內段原樣吐回，不當公式；`$$` 區塊一律當公式。
- 公式寫錯時 build 只會出 `WARN KaTeX: …`，頁面上以紅字顯示原文，不會讓 deploy 失敗。

## 已讀標記

側欄的「已讀」開關。開著的時候右下角浮出一顆「本章已讀」按鈕，讀完按一下就標記；側欄
章節樹的每一章也換成可點的勾選框，可以一次勾好幾章。標記存在瀏覽器的 localStorage，
按鈕旁的「N 待匯出」開出選單：**匯出**（下載 JSON；手機上走系統分享）、複製 JSON 到
剪貼簿、清除已匯出、全部清除。

每一章以頁面 frontmatter 為基線：源檔已標已讀的章節預設勾著，取消就是「取消已讀」；
切回基線不留標記。開關關著時側欄仍看得到差異——待匯出的已讀是淡勾，待匯出的取消把
原本的勾藏起來。

匯出的檔案交給 `/book-apply-review` skill：已讀 → frontmatter `reviewed: true` 與
`reviewed_date`、取消已讀 → 移除 `reviewed`／`reviewed_date`（與舊慣例 `read`／`readAt`）。
套用是冪等的：源檔已經是目標狀態就跳過，既有的 `reviewed_date` 不會被後來的匯出檔蓋掉。

**同一筆標記不會被匯出兩次。** 匯出（或複製）當下就在該批標記上蓋 `exportedAt`，之後的
匯出只收沒蓋過的；全都匯出過了還要再送一次，會先問過你。標記本身留著不動——基線還沒
前進，側欄得繼續顯示它——等站台重建、新的 `data-rv-reviewed` 追上來，下次開任何一頁就
自動清掉。所以「清除已匯出」是備案（例如那批根本沒 commit），不是每次都得做的步驟。

設計上的幾個硬約束：

- 站台沒有後端，全庫又都在 `nplus.wiki` 同一個 origin 下，所以 localStorage 的 key 是
  `review:<station>`（station = baseURL 最後一段，跟 `/index.json` 同一個算法）；
  `review:mode` 記開關。本機 `hugoServer`（localhost）是另一個 origin，各存各的。
- 已讀基線由 build 寫進頁面（`inject/body.html` 的 `data-reviewed`、`menu-filetree.html`
  的 `data-rv-reviewed`），判準與 `index.json` 相同：`reviewed: true` 或 `read: true`。
- 差異永遠顯示，勾選框與右下角按鈕只在開關開著時出現。
- `items` 只存「跟基線不同」的差異，這條不變量同時管兩件事：勾回基線當場不留標記
  （`setReviewed`），以及重建後基線前進、標記跟著自動消失（`reconcile`，啟動時跑一次，
  側欄 filetree 每頁都渲染全書，所以一頁就對完整本）。
- 2026-09-12 之前的版本（`nplus-review/1`）還能劃線、加註；那些標記這版不再顯示也不再
  匯出。

### 匯出格式（`nplus-review/2`）

```json
{
  "format": "nplus-review/2",
  "station": "say-it-with-charts",
  "site": "https://nplus.wiki/say-it-with-charts/",
  "book": "用圖表說話：經理人的視覺溝通指南",
  "exportedAt": "2026-09-12T08:00:00.000Z",
  "count": 1,
  "items": [
    {
      "id": "rvmf3k2abcd",
      "kind": "reviewed",
      "source": "docs/01-choosing-charts/02-identify-the-comparison/_index.md",
      "page": "/say-it-with-charts/docs/01-choosing-charts/02-identify-the-comparison/",
      "title": "辨識比較類型",
      "createdAt": "2026-09-12T07:12:03.412Z"
    }
  ]
}
```

| 欄位 | 說明 |
|---|---|
| `kind` | `reviewed`（本章已讀）、`unreviewed`（取消已讀；只會出現在源檔已標已讀的頁面） |
| `source` | 內容檔相對於 `site/content/` 的路徑，由 Hugo 的 `.File.Path` 寫進頁面，直接對回源檔 |
| `page` / `title` | 頁面網址路徑與標題，給人看的 |
| `createdAt` | 按下的時間；套用時 `reviewed_date` 填的是 `exportedAt` 那天 |

`items` 依 `source` 排序，同一個 `source` 只會有一筆。改欄位時 `assets/review.js` 的
`payload()`、這張表與 skill 三邊要一起改。

## 全書單頁與純文字

每本書多兩個網址，由本模組掛進站台的 `content/book.md` 產生，書 repo 不用加任何檔案：

| 網址 | 內容 |
|---|---|
| `/book/` | 整本書一頁到底，右側目錄列出全部章節；給列印與通讀 |
| `/book/source.txt` | 全書 Markdown 原文，一章一個 `#` 標題，開頭附章節清單與網址；給 skill 或 LLM 一次抓全書 |

上游 `layout: book` 的版型假設每章正文自帶 `# 標題`；我們的章名在 frontmatter、正文從 `##`
開始，所以 `layouts/book.html` 與 `layouts/book.txt` 整份 override，替每章補上章名，並以章節
網址當錨點。這一頁不進站內搜尋（`bookSearchExclude`），也不出現在側欄。`txt` 輸出格式定義在
本模組的 `hugo.toml`（`outputFormats` 會併進站台），只有 `book.md` 用 frontmatter 開了它。

## 站內連結檢查與頁尾 git 連結

`BookPortableLinks = "warning"` 是模組預設：build 時每個站內連結都拿去 `.GetPage` 對一次，
找得到就改寫成正確的 permalink，找不到就印 `WARN Reference '…' not found`。根相對的 `/docs/…`
連結因此在 `nplus.wiki/<repo>/` 底下也能用。`relref` 產出的連結已帶站台路徑前綴，跳過不對。
圖片走同一套（上游的 `render-image`），page bundle 裡的圖直接命中，`../` 形式的圖片路徑會出
警告。站台可以在自己的 `hugo.toml` 設成 `"error"`，讓壞連結直接讓 build 失敗。

`BookLastChangeLink` 與 `BookEditLink` 也是模組預設，從 baseURL 最後一段推出 GitHub repo
（`https://github.com/nplus-father/<repo>`）：頁尾顯示最後修改日期（連到 commit）與「編輯頁面」
（連到 GitHub 上的 `site/…` 檔案）。全庫的 `enableGitInfo = true` 與 CI 的 `fetch-depth: 0`
就是為了這個。repo 不在 nplus-father 底下就在站台 `[params]` 設 `BookRepo`。

## 介面字串

Hugo 用站台 `locale` **精確比對**翻譯檔名：全庫的 `locale = 'zh-Hant-TW'` 對不到上游的 `zh-TW.yaml`，
介面字串就全退回英文（Search、Edit this page）。本模組自帶 `i18n/zh-Hant-TW.yaml`，上游用到的
每個 id（搜尋框、頁尾、圖示 alt 文字）都有繁中。`i18n/zh.yaml` 是同一份：手冊的 `locale = 'zh'`
原本會對到上游的簡體檔。

## 站台參數

| 參數 | 預設 | 用途 |
|---|---|---|
| `stationKind` | `"book"` | 寫進 `/index.json` 的 `kind`。手冊要設 `"handbook"` |
| `hasReview` | 未設 | 側欄顯示「書評」連結 |
| `reviewUrl` | 由 baseURL 推導 | 覆寫書評連結網址 |
| `BookPortableLinks` | `"warning"` | 站內連結 build 時檢查；設 `"error"` 讓壞連結擋 build |
| `BookRepo` | 由 baseURL 推導 | 覆寫頁尾 git 連結指向的 GitHub repo |
| `BookDateFormat` | `"2006-01-02"` | 頁尾最後修改日期的格式 |

頁面 frontmatter 的 `reviewed: true`（或書本慣例的 `read: true`）會在側欄加上
已讀勾勾，並計入 `/index.json`。

## 檔案

| 路徑 | 內容 |
|---|---|
| `assets/styles/custom.css` | **全站唯一的樣式檔**：開頭是 token（淺色、深色、跟系統三個區塊），後面是元件樣式 |
| `layouts/_partials/docs/inject/head.html` | 主題初始化（同步、防 FOUC）＋ 概覽分頁 JS ＋ KaTeX 樣式 |
| `layouts/_markup/render-passthrough.html` | `$…$` 公式的 render hook，build 時轉成 KaTeX HTML |
| `layouts/_partials/docs/inject/menu-before.html` | 側欄工具列：回 portal、書評、已讀開關、主題切換 |
| `layouts/_partials/docs/inject/body.html` | 已讀標記：把 station／source／已讀基線寫進頁面並載入 `review.js` |
| `assets/review.js` | 已讀標記本體：本章已讀按鈕、側欄勾選框、localStorage、匯出 |
| `layouts/_partials/docs/menu-filetree.html` | 上游整份 override，加已讀勾勾與 `data-rv-*`。升級主題要對 diff |
| `layouts/index.json` | `/index.json`，portal 用來匯總 review 進度 |
| `layouts/_markup/render-link.html` | 外部連結開新分頁、Amazon 購物車角標；`BookPortableLinks` 開著時先走上游的 portable-link 解析 |
| `content/book.md` | 掛進每個站台的 `/book/` 頁：`layout: book`，輸出 HTML 與 txt |
| `layouts/book.html` | 全書單頁版型，上游整份 override：每章補章名、以章節網址當錨點 |
| `layouts/book.txt` | `/book/source.txt`：章節清單加全書 Markdown 原文 |
| `i18n/zh-Hant-TW.yaml`、`i18n/zh.yaml` | 主題介面字串的繁中翻譯，蓋過上游 |

## 樣式與明暗

hugo-book v0.15 起不再用 Sass。上游樣式依 `assets/styles/index.yaml` 串接，`custom.css` 排最後，本模組
整份蓋過它。上游色盤在 `@layer theme` 裡，本檔不在任何 layer，所以同名變數由本檔勝出。

- 上游在 `:root` 定義了 `--space-1`（1px）、`--space-4`、`--space-8`、`--space-16`。本模組的間距 token
  叫 `--gap-1`～`--gap-6`，**不要取 `--space-*`**：撞名會讓上游的邊框與內距全部放大。
- `<html>` 的 `data-theme` 由 hugo-book 依 `BookTheme` 寫死為 `light`。`inject/head.html` 的同步 script
  在使用者沒選過時改寫為 `auto`，選過就寫 `dark`／`light`；側欄的切換鈕把 `auto` 當成系統偏好。JS
  被擋時停在 `light`。
- 上游只替五種 GitHub alert 與 info／success／danger 配色；書裡另有 QUOTE、QUESTION、EXAMPLE、FAILURE，
  在 `custom.css` 補了對應的 `--accent-color`。

## 改動主題後

1. **先 build 一本真的書驗過再發 tag。** 本機沒有 hugo 時用 `ghcr.io/gohugoio/hugo:<CI 版本>` 的 Docker image，
   書的 `site/go.mod` 用 `replace` 指到本機這份 clone（不要用 `HUGO_MODULE_REPLACEMENTS`：它會讓 Hugo
   略過本模組的 go.mod，把 hugo-book 升到最新版）。
2. `git tag vX.Y.Z && git push origin vX.Y.Z`
3. **既有的書不會自動更新**——deploy 是 push 觸發的。要散出去得對每個 book repo
   推一個 commit（空 commit 即可）。

---
© nplus.wiki
