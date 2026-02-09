# Quick Testing Guide - Login Security Fix

## What Changed?
Users can NO LONGER login without registering first. The system now requires:
1. **Registration FIRST** → User creates account with Name, Email, Password, Role, Department
2. **Login SECOND** → User can only login after account is registered

## The New Login Flow

```
┌─────────────────────────────────────┐
│  User visits Login Page             │
└──────────────┬──────────────────────┘
               │
     ┌─────────┴─────────┐
     │                   │
     ▼                   ▼
Try to Login      Try Google Login
     │                   │
     │                   │
Verify:           Verify:
- Email exists    - Google account
- Password match  - Has registered account
- Firestore       - Role & Department set
  profile exists       
     │                   │
     ├──Error────────────┤
     │ "No account       │
     │  found. Please    │
     │  register first"  │
     │                   │
     └───────┬───────────┘
             │
             ▼
    ┌──────────────────┐
    │  No Account?     │
    │  Click Register  │
    └──────────────────┘
             │
             ▼
    ┌──────────────────┐
    │  Registration    │
    │  - Name          │
    │  - Email         │
    │  - Password      │
    │  - Role          │
    │  - Department    │
    └──────┬───────────┘
           │
           ▼
    ✅ Account Created
    ✅ Can Now Login
```

## Test Scenarios

### ✅ Scenario 1: Try to Login Without Account
**Steps:**
1. Open login page
2. Email: `test@example.com` (doesn't exist)
3. Password: `anything123`
4. Click "Sign In"

**Expected Result:**
- ❌ Error message: "No account found with this email. Please register first."
- User stays on login page
- Suggestion to "Create one" (link to register)

---

### ✅ Scenario 2: Try Google Sign-In Without Account
**Steps:**
1. Open login page
2. Click "Sign in with Google"
3. Use a Google account that hasn't been registered in the system

**Expected Result:**
- ❌ Error message: "User account not found. Please register first before logging in with Google."
- User redirected back to login page
- Suggestion to register first

---

### ✅ Scenario 3: Proper Registration Flow
**Steps:**
1. Click "Register here" on login page
2. Fill in:
   - Full Name: `John Student`
   - Email: `john@university.edu`
   - Password: `SecurePass123`
   - Confirm Password: `SecurePass123`
   - Role: `Student`
   - Department: `Computer Science`
3. Click "Register"

**Expected Result:**
- ✅ Success message: "Account created successfully! Redirecting..."
- Redirects to Dashboard
- User profile shows: Student from CS Department

---

### ✅ Scenario 4: Login After Registration
**Steps:**
1. Register as above (Scenario 3)
2. Got redirected to Dashboard
3. Click Logout (top right)
4. Click Login link
5. Enter:
   - Email: `john@university.edu`
   - Password: `SecurePass123`
6. Click "Sign In"

**Expected Result:**
- ✅ Success message: "Login successful! Redirecting..."
- Redirects to Dashboard
- User is logged in with correct role and department

---

### ✅ Scenario 5: Google Registration then Login
**Steps:**
1. Go to Register page
2. Select Role: `Faculty`
3. Select Department: `Engineering`
4. Click "Sign up with Google"
5. Complete Google authentication with your Google account

**Expected Result:**
- ✅ Account created with Google
- Role: Faculty, Department: Engineering
- Redirects to Dashboard
- Logout and come back to login
- Click "Sign in with Google"
- ✅ Successfully logs in with same Google account

---

### ✅ Scenario 6: Wrong Password After Registration
**Steps:**
1. Register user first (Scenario 3)
2. Go to Login
3. Enter correct email but wrong password
4. Click "Sign In"

**Expected Result:**
- ❌ Error message: "Incorrect password. Please try again."
- User can retry

---

## Key Improvements

| Feature | Old Behavior | New Behavior |
|---------|-------------|--------------|
| **Login without account** | ✅ Allowed (Wrong!) | ❌ Blocked |
| **Auto-create student account** | ✅ Yes (Wrong!) | ❌ No |
| **Role clarity** | ❌ Unknown | ✅ Must select during registration |
| **Department requirement** | ❌ Optional/Empty | ✅ Required during registration |
| **Google registration** | ❌ No options | ✅ Select role & department |
| **Google login** | ✅ Auto-creates | ❌ Requires pre-registration |
| **Account verification** | ❌ No | ✅ Yes (Firestore check) |

---

## Files Modified

1. **src/services/authService.ts**
   - `login()` method: Added Firestore verification
   - `signInWithGoogle()` method: Removed auto-account creation

2. **src/components/AuthForms.tsx**
   - `LoginForm`: Enhanced error messages
   - Better user guidance to register

---

## How to Report Issues

If you find any bugs:
1. Take a screenshot of the error
2. Note the exact steps you took
3. Note the email/role/department used
4. Report to the development team

---

**Last Updated:** February 5, 2026
