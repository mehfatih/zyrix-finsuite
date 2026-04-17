# Zyrix FinSuite — Complete Setup & Deploy Guide
## من الصفر حتى الـ Production

---

## ① نسخ الملفات للمشروع الحقيقي

افتح Terminal في `D:\Zyrix Hub\zyrix-finsuite` ونفذ:

```powershell
# أنشئ المجلدات إذا مش موجودة
mkdir -p src/pages src/components src/services src/hooks src/context src/utils

# بعدها انسخ الملفات يدوياً من هذه القائمة:
```

### قائمة الملفات للنسخ:
```
zyrix-finsuite/
├── index.html                          ← جديد
├── package.json                        ← جديد / محدّث
├── vite.config.js                      ← جديد / محدّث
├── vercel.json                         ← جديد
├── railway.toml                        ← جديد
├── mockServer.js                       ← جديد (للتطوير المحلي)
├── .env.production                     ← جديد
├── .env.local                          ← جديد (لا ترفعه لـ git)
└── src/
    ├── main.jsx                        ← جديد
    ├── App.jsx                         ← محدّث
    ├── components/
    │   └── ui.jsx                      ← جديد (Skeleton, Toast, Modal, Charts...)
    ├── context/
    │   └── AuthContext.jsx             ← جديد
    ├── hooks/
    │   └── useApi.js                   ← جديد
    ├── services/
    │   └── api.js                      ← جديد (كل API calls)
    └── pages/
        ├── LoginPage.jsx               ← جديد
        ├── CustomerDashboard.jsx       ← محدّث
        ├── InvestmentsPage.jsx         ← جديد
        ├── AccountsPage.jsx            ← جديد
        ├── NotificationsPage.jsx       ← جديد
        ├── AdminPanel.jsx              ← محدّث
        └── AdminReportsPage.jsx        ← جديد (مع Charts)
```

---

## ② تشغيل محلياً مع Mock Server

```bash
# Terminal 1 — Mock API (يشبه الـ Backend الحقيقي)
node mockServer.js
# يشتغل على http://localhost:3001

# Terminal 2 — Frontend
npm install
npm run dev
# يشتغل على http://localhost:5173
```

### تسجيل الدخول في التطوير:
| الدور | Email | Password |
|-------|-------|----------|
| Admin    | `finsuite-admin@zyrix.co` | `Zyrix@Admin2026` |
| Customer | `customer@zyrix.co`       | `Customer123`     |

> ملاحظة: في `.env.local`، الـ `VITE_API_URL=http://localhost:5173`
> لأن Vite يعمل كـ proxy ويحول `/api/*` للـ Backend (انظر `vite.config.js`)

---

## ③ ربط الـ api.js بالـ Mock Server محلياً

في ملف `src/services/api.js`، السطر الأول:

```js
// أصلي (Production):
const BASE_URL = "https://finsuite-backend-production.up.railway.app";

// للتطوير مع Mock Server، غيّره مؤقتاً:
const BASE_URL = import.meta.env.VITE_API_URL || "https://finsuite-backend-production.up.railway.app";
```

---

## ④ Git Push للـ Frontend

```bash
cd "D:\Zyrix Hub\zyrix-finsuite"

# إذا لم يكن Git initialized
git init
git remote add origin https://github.com/mehfatih/zyrix-finsuite.git

# إضافة .gitignore
cat > .gitignore << 'EOF'
node_modules/
dist/
.env.local
.env.*.local
*.log
.DS_Store
EOF

# Stage + commit
git add .
git commit -m "feat: complete frontend — Customer Dashboard, Admin Panel, Notifications, Charts"

# Push
git push -u origin main
# أو إذا الـ branch اسمه master:
git push -u origin master
```

---

## ⑤ Deploy على Vercel (مجاني — الأسرع)

```bash
# 1. ثبّت Vercel CLI (مرة واحدة)
npm install -g vercel

# 2. من مجلد المشروع
cd "D:\Zyrix Hub\zyrix-finsuite"
vercel

# 3. اتبع الأسئلة:
#    - Link to existing project? No → Create new
#    - Project name: zyrix-finsuite
#    - Framework: Vite
#    - Build Command: npm run build
#    - Output Directory: dist
#    - Add environment variable:
#      VITE_API_URL = https://finsuite-backend-production.up.railway.app

# 4. للنشر في Production:
vercel --prod
```

### بعد النشر على Vercel — أضف الـ URL لـ CORS في Backend:
```
https://zyrix-finsuite.vercel.app
```

---

## ⑥ Deploy على Railway (إذا تبي كل شيء على Railway)

```bash
# 1. ثبّت Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Link + deploy
cd "D:\Zyrix Hub\zyrix-finsuite"
railway link
railway up

# 4. أضف environment variable في Railway Dashboard:
#    VITE_API_URL = https://finsuite-backend-production.up.railway.app
```

---

## ⑦ Backend CORS Fix (مهم!)

في `D:\Zyrix Hub\zyrix-finsuite-backend`، ابحث عن إعداد CORS وأضف URL الـ Frontend:

```js
// مثال Express.js
const cors = require("cors");
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://zyrix-finsuite.vercel.app",    // ← أضف URL الـ Vercel
    "https://your-railway-frontend.up.railway.app", // ← أضف URL الـ Railway
  ],
  credentials: true,
}));
```

ثم:
```bash
cd "D:\Zyrix Hub\zyrix-finsuite-backend"
git add .
git commit -m "fix: add frontend URLs to CORS allowlist"
git push
# Railway يعيد النشر تلقائياً
```

---

## ⑧ ملفات مضافة لـ CustomerDashboard

لإضافة صفحة Notifications في الـ sidebar، عدّل `CustomerDashboard.jsx`:

```jsx
// في قسم imports أضف:
import NotificationsPage from "./NotificationsPage";

// في NAV array أضف:
{ id: "notifications", label: "Notifications", icon: "🔔" },

// في pages object أضف:
notifications: <NotificationsPage />,
```

لإضافة Reports في AdminPanel، عدّل `AdminPanel.jsx`:

```jsx
// في قسم imports أضف:
import AdminReportsPage from "./AdminReportsPage";

// في pages object، استبدل سطر reports:
reports: <AdminReportsPage />,
```

---

## ✅ Checklist قبل الـ Production

- [ ] `npm run build` ينجح بدون errors
- [ ] Login يشتغل مع Admin credentials
- [ ] Login يشتغل مع Customer credentials
- [ ] Customer Dashboard يحمّل البيانات
- [ ] Admin Panel يفتح ويعرض الـ stats
- [ ] CORS مضبوط في Backend
- [ ] `.env.local` غير مرفوع لـ Git
- [ ] `VITE_API_URL` مضبوط في Vercel/Railway environment variables

---

## الـ URLs النهائية

| Service  | URL |
|---------|-----|
| Frontend | `https://zyrix-finsuite.vercel.app` |
| Backend  | `https://finsuite-backend-production.up.railway.app` |
| Admin    | `https://zyrix-finsuite.vercel.app/admin` |
| Customer | `https://zyrix-finsuite.vercel.app/dashboard` |