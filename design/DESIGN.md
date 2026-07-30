# FinTrace — Design System (from Google Stitch)

**Stitch project:** https://stitch.withgoogle.com/project/12134940119081608432  
**Project ID:** `12134940119081608432`  
**Design system asset:** `assets/18286847489432747611`

## Product
Mobile-first personal finance PWA: track money in and out, categories, net position, and insights. Users can add transactions manually or paste/share MoMo SMS to log phone transactions quickly (browsers cannot read the SMS inbox).

## Brand & visual
| Token | Value |
|-------|--------|
| Brand | FinTrace |
| Mode | Light |
| Primary | `#115637` |
| Primary container | `#2F6F4E` |
| Surfaces | `#F9F9F7` |
| Headline font | Plus Jakarta Sans |
| Body / label | Manrope |
| Roundness | 12px |
| Avoid | Purple themes, neon dark UI, newspaper layouts |

## Screens (mobile)
| Screen | Stitch ID | Local preview | HTML |
|--------|-----------|---------------|------|
| Home | `7d5702fb5f9d41c5bacd6ff1a6ab2784` | `design/stitch/screenshots/home.png` | `design/stitch/html/home.html` |
| Paste SMS | `e45dfacffa5641c5a794f8bd53b2f2f5` | `design/stitch/screenshots/paste.png` | `design/stitch/html/paste.html` |
| Activity | `e22687e59cb441ae8101fb69253a9ef1` | `design/stitch/screenshots/activity.png` | `design/stitch/html/activity.html` |
| Insights | `7e9f441023ba4ef1ad7a8caf14261727` | `design/stitch/screenshots/insights.png` | `design/stitch/html/insights.html` |
| Settings | `925b4deb6603435bb628ea42f3416c4e` | `design/stitch/screenshots/settings.png` | `design/stitch/html/settings.html` |

## IA / tabs
`Home` · `Paste` · `Activity` · `Insights` · `Settings`

## Core UX
1. View net position and money flow on Home, Activity, and Insights  
2. Paste an SMS (**Paste SMS**) or enter one by hand (**Add manually**)  
3. Parse amount / money-in-or-out / merchant from pasted messages  
4. Auto-suggest category (Groceries, Electricity, Bills, Airtime, Transport…)  
5. Save → syncs to account and updates dashboards  

## Categories
Income · Groceries · Electricity · Bills · Airtime · Transport · Other
