# 🛍️ SmartCart & Team Action Hub

A modern, mobile-friendly collaborative web application designed for group shopping follow-ups, dressing/apparel fitting tracking, and team task delegation. Built for **real-time synchronization across multiple users and phones**.

---

## ✨ Three Core Integrated Modules

### 1. 🛒 DMart Grocery Shopping Cart
* **Pre-seeded with all 81 items** from `dmart list.docx` organized by **1st Floor** and **2nd Floor**.
* **Qty / Pcs / Size**: Quick `+` and `-` quantity steppers, units (`pcs`, `kg`, `gm`, `packets`, `litres`, `bottle`, etc.), and package sizes.
* **1-Tap Strikethrough**: Check off items as you pick them off supermarket shelves.
* **Instant Search & WhatsApp Export**: Copy formatted grocery checklist for WhatsApp in 1 click.

### 2. 👗 Dressing & Clothing Shopping Cart
* **Apparel & Clothes Tracking**: Built specifically for clothing shopping across sections:
  * **Sections**: Men's Wear, Women's Wear, Kids Wear, Footwear, Ethnic Wear, Accessories.
  * **Sizes**: Full sizing options (`S`, `M`, `L`, `XL`, `XXL`, `28`, `30`, `32`, `34`, `36`, `38`, `40`, `UK 7/8/9`, `Kids 2-12Y`, or custom).
  * **Colors & Brands**: Track color patterns, fabric, and brand preferences.
* **Trial Room & Fitting Workflow**:
  * ⏳ `Needs Trial Room`: Mark items that must be tried on.
  * 👍 `Fitting Checked`: Confirm size fits after trial.
  * 🛒 `In Cart`: Ready for final checkout.
  * ✅ `Purchased`: Done and billed.
* **Assigned by Person**: Track who each dress or shoe is for (Nithin, Priya, Rahul, Anitha, etc.).
* **Dressing WhatsApp Checklist**: Export categorized clothing checklist grouped by person.

### 3. 👥 Group Action & Task Delegation
* **Assign Follow-up Tasks by Name**: Delegate shopping tasks, price checks, trial room follow-ups, and billing checks to specific people.
* **Filter by Assignee**: Click any member's avatar chip to see only the tasks assigned to them.
* **Priority & Status Flow**: `Urgent`, `High`, `Medium`, `Low` priority with stages `To Do` &rarr; `In Progress` &rarr; `Follow Up` &rarr; `Completed`.

---

## ⚡ Multi-User Live Cloud Sync

* When **any person** updates an item, changes a size, strikes off a product, or updates a task on their phone, **all other users see it update live in real-time**!
* **Dual System**:
  * **Local Storage Mode**: Instant out-of-the-box local sync.
  * **Cloud Sync (Google Firebase Realtime Database)**: 100% free, 0 server maintenance. Connect in 60 seconds by clicking the top bar **"Connect Multi-User Sync"** button.

---

## 🚀 How to Host on GitHub & Deploy to Vercel

```bash
# 1. Commit and push to your GitHub repo
git add .
git commit -m "feat: recreate as SmartCart & Team Action Hub with Dressing Cart and Group Tasks"
git push -u origin main

# 2. Deploy to Vercel
# Import your repository on vercel.com - it auto-builds Vite and goes live in 30 seconds!
```
