# ⚡ Teletalk Jobs Filler (Chrome Extension — Manifest V3)

**Teletalk Jobs Filler** হলো বাংলাদেশ সরকারি চাকরির (Alljobs / Teletalk) আবেদন ফরম (`*.teletalk.com.bd/*`) এক ক্লিকে অটো-ফিল করার জন্য তৈরি একটি সহজ, নিরাপদ এবং সম্পূর্ণ অফলাইন-স্টোরেজ ভিত্তিক Chrome Extension।

কোনো ব্যক্তিগত তথ্য কোডে হার্ডকোড করা নেই — আপনি ও আপনার পরিবার/বন্ধুদের সবার প্রোফাইল ব্রাউজারের লোকাল স্টোরেজে আলাদাভাবে সেভ রাখতে পারবেন এবং প্রয়োজনে JSON ফাইল হিসেবে ব্যাকআপ বা শেয়ার করতে পারবেন।

---

## ✨ মূল সুবিধাসমূহ (Key Features)

- **Multi-Profile Support:** একই কম্পিউটার থেকে নিজের, ভাই-বোন বা বন্ধুদের জন্য আলাদা আলাদা প্রোফাইল (`My Profile`, `Friend 1` ইত্যাদি) সেভ এবং সুইচ করার সুবিধা।
- **Smart Cascading Dropdown Handler:** District সিলেক্ট করার পর `Upazila/P.S.`, Examination সিলেক্ট করার পর `Group/Subject`, অথবা `National ID -> Yes` ও `Result -> GPA` দেওয়ার পর ডায়নামিকভাবে আসা ইনপুট বক্সগুলোর জন্য স্বয়ংক্রিয়ভাবে অপেক্ষা করে সব ডাটা পূরণ করে।
- **Old & New Teletalk Portal Compatible:** পুরাতন PHP টেমপ্লেট ও নতুন Alljobs/DGBPO টেমপ্লেট — উভয়ের ফিল্ড ID/Name এবং বাংলা/ইংরেজি লেবেল দেখে স্বয়ংক্রিয়ভাবে ম্যাচ করে (যেমন `Chattogram` / `Chittagong`, `Cumilla` / `Comilla`, `GPA(out of 5)` ইত্যাদি)।
- **Teletalk-Style Application Form UI:** ড্যাশবোর্ডটি আসল Teletalk সরকারি চাকরির আবেদন ফরমের ডিজাইন অনুযায়ী সাজানো (সবুজ ব্যানার, `Same as Present Address` / `If Applicable` টগল ও পূরণকৃত ঘরে সবুজ বর্ডার), যাতে ব্যবহারকারীরা কোনো জটিলতা ছাড়াই পরিচিত লেআউটে তথ্য সেভ করতে পারেন।
- **Job Experiences & Computer Proficiency:** প্রয়োজনে একাধিক **Job Experiences** (`⊕ ADD MORE` সহ, অটোমেটিক `+ ADD MORE` ক্লিক, `Currently Working`, ও ৩০০ অক্ষরের `Job Description`) এবং **Other Qualifications / Experiences** (*1) Do you have Proficiency in Operating a Computer, along with working in a Relevant field? — Yes*) একসাথে সেভ ও অটো-ফিল করে।
- **Visual Review Highlights:** সঠিকভাবে পূরণ হওয়া ঘরগুলো **সবুজ (Green)** রঙে এবং ক্যাপচা বা কোনো ঘর বাদ পড়লে তা **হলুদ (Yellow)** রঙে হাইলাইট হয় যেন সাবমিটের আগে সহজেই চোখে পড়ে।
- **100% Private + JSON Backup:** সমস্ত ডাটা আপনার ব্রাউজারের `chrome.storage.local`-এ থাকে। যেকোনো সময় **Export Backup (JSON)** করে পেনড্রাইভ/ইমেইলে রাখতে এবং অন্য কম্পিউটারে **Import Backup** করতে পারবেন।

---

## 🇧🇩 বাংলায় ব্যবহার নির্দেশিকা (নতুন ব্যবহারকারীদের জন্য)

### ধাপ ১: Chrome ব্রাউজারে এক্সটেনশনটি ইনস্টল (Load) করা
1. এই ফোল্ডারটি (`Teletalk Jobs Filler`) আপনার কম্পিউটারের নিরাপদ কোনো জায়গায় (যেমন `Documents` বা `D:` ড্রাইভে) রাখুন। *(ইন্সটল করার পর ফোল্ডারটি ডিলিট করবেন না)*।
2. Google Chrome (অথবা Microsoft Edge / Brave) ব্রাউজার খুলুন এবং অ্যাড্রেস বারে লিখুন:
   ```text
   chrome://extensions/
   ```
   এবং `Enter` চাপুন।
3. ডানদিকের কোণায় **Developer mode** লেখা সুইচটি **ON (চালু)** করুন।
4. বামদিকে উপরের দিকে থাকা **Load unpacked** বাটনে ক্লিক করুন।
5. `Teletalk Jobs Filler` ফোল্ডারটি সিলেক্ট করে **Select Folder** ক্লিক করুন।
6. ব্রাউজারের ডানদিকে উপরে এক্সটেনশন আইকন (Puzzle 🧩 আইকন) থেকে **Teletalk Jobs Filler** পিন (Pin 📌) করে নিন।
7. *(নতুন আপডেটের পর)* পূর্বে ইনস্টল করা থাকলে `chrome://extensions/`-এ গিয়ে **Teletalk Jobs Filler** কার্ডের **Reload (🔄)** বাটনে ক্লিক করলেই আগের সব সেভ করা প্রোফাইল ঠিক রেখে নতুন ফিচারগুলো চালু হয়ে যাবে।

### ধাপ ২: নিজের বা অন্যের তথ্য সেভ করা
1. পিন করা **Teletalk Jobs Filler** আইকনে ক্লিক করুন।
2. **⚙️ Edit / Manage Saved Data** বাটনে ক্লিক করুন — একটি পূর্ণ পেজের ড্যাশবোর্ড খুলবে।
3. এখানে ৪টি অংশে আপনার তথ্য লিখুন/সিলেক্ট করুন:
   - **Basic Information:** নিজের নাম, পিতার ও মাতার নাম (ইংরেজি ও বাংলা ইউনিকোড), জন্ম তারিখ, ধর্ম, লিঙ্গ, NID/জন্ম নিবন্ধন, মোবাইল নম্বর, ইমেইল, কোটা ইত্যাদি।
   - **Address Information:** বর্তমান ও স্থায়ী ঠিকানা (একই হলে **Same as Present Address** টিক দিন)।
   - **Educational Qualifications:** SSC, HSC এবং প্রয়োজনে Graduation ও Masters-এর **If Applicable** টিক দিয়ে সব তথ্য দিন।
   - **Job & Other Experiences:** প্রয়োজনে **If Applicable** টিক দিয়ে এক বা একাধিক **Job Experiences** (`Currently Working` ও ৩০০ অক্ষরের `Job Description` সহ) এবং **Other Qualifications / Experiences** (*1) Do you have Proficiency in Operating a Computer, along with working in a Relevant field?* — `Select` / `Yes`) সেভ করুন।
4. উপরে বা নিচে থাকা **💾 Save Profile** বাটনে ক্লিক করুন (অথবা `Ctrl + S` চাপুন)।
5. বন্ধু বা পরিবারের অন্য কারো প্রোফাইল যোগ করতে চাইলে উপরে থাকা **+ New** বাটনে ক্লিক করুন।

### ধাপ ৩: সরকারি চাকরির ফরম অটো-ফিল করা
1. যেকোনো Teletalk সরকারি চাকরির আবেদন পেজ (`*.teletalk.com.bd`) ওপেন করুন।
2. ব্রাউজার থেকে **Teletalk Jobs Filler** আইকনে ক্লিক করুন।
3. ড্রপডাউন থেকে সঠিক প্রোফাইলটি বেছে নিন।
4. **⚡ Auto Fill Current Form** বাটনে ক্লিক করুন।
5. কয়েক সেকেন্ড অপেক্ষা করুন — সব লেখা এবং ড্রপডাউন (জেলা -> উপজেলা, পরীক্ষা -> বিষয়, GPA ইত্যাদি) নিজে থেকেই পূরণ হয়ে যাবে।
6. **গুরুত্বপূর্ণ:** ফরম সাবমিট করার আগে সব তথ্য (সবুজ ও হলুদ হাইলাইট করা ঘরগুলো) ভালোভাবে মিলিয়ে দেখুন, ছবি/স্বাক্ষর (যদি চায়) ও **Verification Code (Captcha)** নিজে টাইপ করুন এবং ঘোষণাপত্রে টিক দিয়ে সাবমিট করুন।

### ধাপ ৪: ব্যাকআপ রাখা ও অন্য কম্পিউটারে নেওয়া
- **Export:** এক্সটেনশন পপআপ বা ড্যাশবোর্ড থেকে **📤 Export Backup (JSON)** ক্লিক করলে আপনার সব প্রোফাইলের একটি `.json` ফাইল ডাউনলোড হবে।
- **Import:** নতুন কম্পিউটারে গিয়ে **📥 Import Backup** বাটনে ক্লিক করে (ড্যাশবোর্ড থেকে অথবা পপআপের বক্সে `.json` ফাইল ড্রপ করে) ফাইলটি আপলোড করলেই সব প্রোফাইল সাথে সাথে ফিরে আসবে!

---

## 🇬🇧 English User Guide

### Step 1: Install the Extension in Chrome / Edge / Brave
1. Keep the `Teletalk Jobs Filler` folder in a permanent location on your PC (do not delete this folder after loading).
2. Open Google Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** (top-left) and select the `Teletalk Jobs Filler` folder.
5. Click the Puzzle 🧩 icon in Chrome's toolbar and **Pin 📌** *Teletalk Jobs Filler* for one-click access.
6. *(After an extension update)* Open `chrome://extensions/` and click the **Reload (🔄)** icon on the **Teletalk Jobs Filler** card to activate new fields while preserving all existing saved profiles.

### Step 2: Save Applicant Profiles
1. Click the **Teletalk Jobs Filler** extension icon and choose **⚙️ Edit / Manage Saved Data** to open the Teletalk-styled Application Form dashboard.
2. Fill in **Basic Information**, **Address Information**, **Educational Qualifications** (toggle **If Applicable** for Graduation / Masters if needed), and **Job & Other Experiences**:
   - **Job Experiences:** Toggle **If Applicable** and save one or more jobs (`⊕ ADD MORE`), including `CurrentlyWorking` and your 300-character `Job Description`.
   - **Other Qualifications / Experiences:** Select **Yes** for *1) Do you have Proficiency in Operating a Computer, along with working in a Relevant field?* when required.
3. Click **💾 Save Profile** (or press `Ctrl + S`).
4. Use **+ New**, **✏️ Rename**, **📋 Copy**, and **🗑️ Delete** in the green navigation bar to manage profiles for multiple applicants on the same PC.

### Step 3: Autofill Any Teletalk Application Form
1. Open the application form page on any `*.teletalk.com.bd` portal.
2. Click the **Teletalk Jobs Filler** icon, verify the selected profile in the dropdown, and click **⚡ Auto Fill Current Form**.
3. Wait 1–3 seconds while the smart engine sequentially fills basic fields, triggers cascading District -> Upazila & Exam -> Subject dropdowns, reveals hidden NID/GPA inputs, clicks `+ ADD MORE` for multiple saved job experiences, fills Other Qualifications/Experiences, and highlights fields:
   - **Soft Green Border:** Successfully autofilled.
   - **Soft Yellow Border:** Needs attention (e.g., Verification Captcha, post-specific questions, or missing profile info).
4. Carefully review all entries, enter the **Captcha**, check the declaration box, and submit.

### Step 4: Backup & Transfer Across Devices
- Click **📤 Export Backup (JSON)** in the Popup or Dashboard to save a `.json` backup file containing all profiles.
- Click **📥 Import Backup** on another device (drag & drop the `.json` file into the popup dropzone, or click **Choose .json File** to select it in the dashboard) to restore all profiles instantly.

---

## 📁 Project Structure

```text
Teletalk Jobs Filler/
├── manifest.json          # Chrome Extension Manifest V3 config
├── teletalk-data.js       # Official Teletalk 64 districts, 560+ upazilas, boards, universities & subjects
├── storage.js             # chrome.storage.local multi-profile & JSON backup manager
├── popup.html / .css / .js# Compact toolbar popup dashboard
├── options.html / .css / .js # Full-page profile data entry & management dashboard
├── filler.js              # Async smart autofill engine & MutationObserver cascading handler
├── icons/                 # Extension icons (16, 32, 48, 128 PNG + SVG + generator)
└── README.md              # Bilingual user instructions (Bangla + English)
```

---

## ⚠️ Privacy & Disclaimer
- This extension stores all user data strictly inside your local browser (`chrome.storage.local`). Nothing is ever sent to any external server.
- Always double-check all autofilled details (especially Date of Birth, District/Upazila, Roll Number, GPA/CGPA, and Quota) before final submission on the Teletalk portal.
