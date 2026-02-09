# 🔐 Firestore Security Rules Setup

## ⚠️ Current Issue

Error: **"Failed to get document because the client is offline"**

This happens because Firestore security rules are **blocking reads/writes**. You need to configure them properly.

---

## 🚀 Fix in 5 Minutes

### Step 1: Open Firebase Console
1. Go to https://console.firebase.google.com
2. Select **achivra-883bf** project
3. Click **Firestore Database** (left sidebar)

### Step 2: Go to Security Rules
1. Click the **Rules** tab at the top
2. You'll see the current rules (might be restrictive)

### Step 3: Copy New Rules

**Clear the existing rules and paste this:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Allow authenticated users to create achievements
    match /achievements/{achievementId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && (
        resource.data.studentId == request.auth.uid ||
        request.auth.token.email in ['admin@example.com', 'faculty@example.com']
      );
      allow update, delete: if request.auth.uid == resource.data.studentId;
    }

    // Allow authenticated users to read their own notifications
    match /notifications/{notificationId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }

    // Allow reading categories
    match /categories/{categoryId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Allow authenticated users to read other users' basic info (for displaying names)
    match /users/{userId} {
      allow read: if request.auth != null;
    }
  }
}
```

### Step 4: Publish Rules
1. Click **Publish** button
2. Confirm when prompted
3. Wait for the "✓ Rules published" message

---

## ✅ That's It!

Your Firestore is now configured to allow:
- ✅ Authenticated users to create accounts
- ✅ Users to read/write their own profile
- ✅ Students to upload achievements
- ✅ Faculty to read achievements
- ✅ Users to manage their notifications

---

## 🔄 Test Again

Now try to register:
1. Go to http://localhost:3000/register
2. Fill in the form
3. Click "Create Account"
4. Should work now! ✅

---

## 📝 Rules Explanation

### Public Access
```
- Users can read categories (achievements types)
- Users can read basic user info (names)
```

### User Profile (users collection)
```
- Can read/write own document
- User ID must match authenticated 
```

### Achievements (achievements collection)
```
- Can create if authenticated
- Can read own or if faculty/admin
- Can update/delete only own
```

### Notifications (notifications collection)
```
- Can read/write own notifications
- User ID must match authenticated user
```

---

## 🆘 Still Getting Error?

If still offline error:

### 1. **Check Firebase Credentials**
Verify `.env.local` has:
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBvqGgb2we1cDmMOV3M5yGwGryxOicE9SA
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=achivra-883bf.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=achivra-883bf
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=achivra-883bf.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1036799076994
NEXT_PUBLIC_FIREBASE_APP_ID=1:1036799076994:web:93943c9f3f654870ef629b
```

### 2. **Clear Browser Cache**
- Press Ctrl+Shift+Delete
- Clear "Cached images and files"
- Reload page

### 3. **Restart Development Server**
```bash
# Kill server
Ctrl+C

# Restart
npm run dev
```

### 4. **Check Browser Console**
Press F12 → Console tab
Look for error messages and share them

---

## 🔒 Alternative: Permissive Rules (Development Only)

⚠️ **ONLY for development/testing!**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all authenticated users full access (DEV ONLY)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Do NOT use this in production!**

---

## 📋 Checklist

- [ ] Opened Firebase Console
- [ ] Clicked Firestore Database
- [ ] Clicked Rules tab
- [ ] Copied new rules (above)
- [ ] Cleared old rules completely
- [ ] Pasted new rules
- [ ] Clicked Publish
- [ ] Saw "✓ Rules published"
- [ ] Cleared browser cache
- [ ] Restarted dev server
- [ ] Tested registration again

---

## 🎉 Once Working

You can now:
✅ Register accounts
✅ Login
✅ Upload achievements
✅ Get faculty review
✅ Receive notifications
✅ Manage everything!

---

**Let me know once you've set the rules and tested!** 🚀
