# Login Error Messages Reference Guide

## User-Facing Error Messages

This document shows all the error messages users will see after the security fix.

---

## 1. Email/Password Login Errors

### Error 1.1: No Account with This Email
**Trigger**: User tries to login with non-existent email
```
Error Message:
┌─────────────────────────────────────────────────────────────┐
│  ⚠ No account found with this email. Please register first. │
└─────────────────────────────────────────────────────────────┘

Toast Notification:
┌──────────────────────────────────────────────────────┐
│  ⚠ No account found with this email. Please register. │
└──────────────────────────────────────────────────────┘

Action: Show "Create one" link to register page
```

### Error 1.2: Incorrect Password
**Trigger**: User enters correct email but wrong password
```
Error Message:
┌──────────────────────────────────────────────┐
│  ⚠ Incorrect password. Please try again.    │
└──────────────────────────────────────────────┘

Toast Notification:
┌────────────────────────────────────────────┐
│  ⚠ Incorrect password. Please try again.   │
└────────────────────────────────────────────┘

Action: Allow user to retry password
```

### Error 1.3: Invalid Email Format
**Trigger**: User enters invalid email format
```
Error Message:
┌────────────────────────────────────┐
│  ⚠ Invalid email address.          │
└────────────────────────────────────┘

Toast Notification:
┌──────────────────────────────────┐
│  ⚠ Invalid email address.        │
└──────────────────────────────────┘

Action: Highlight email field in red
```

### Error 1.4: Empty Fields
**Trigger**: User tries to login without entering credentials
```
Validation Errors:
- Email required
- Password required

Visual: Fields highlighted in red with error text below
```

---

## 2. Google Sign-In Errors

### Error 2.1: No Account Found (Most Common)
**Trigger**: User signs in with Google account that hasn't been registered
```
Error Message:
┌─────────────────────────────────────────────────────────────┐
│  ⚠ No account found with this Google email.                 │
│    Please register first.                                   │
└─────────────────────────────────────────────────────────────┘

Toast Notification:
┌──────────────────────────────────────────────────────────┐
│  ⚠ Please register with Google first before signing in   │
└──────────────────────────────────────────────────────────┘

Action: Show "Create one" link to registration page
```

### Error 2.2: Google Sign-In Cancelled
**Trigger**: User cancels Google authentication popup
```
Error Message:
┌─────────────────────────────────────────────────────────┐
│  ⚠ Google sign-in cancelled. Please try again.          │
└─────────────────────────────────────────────────────────┘

Toast Notification:
┌──────────────────────────────────────────────────┐
│  ⚠ Google sign-in was cancelled                  │
└──────────────────────────────────────────────────┘

Action: Allow user to retry
```

### Error 2.3: Google Sign-In Network Error
**Trigger**: Network issues during Google authentication
```
Error Message:
┌─────────────────────────────────────────────────┐
│  ⚠ Network error. Please check your connection.│
└─────────────────────────────────────────────────┘

Toast Notification:
┌────────────────────────────────────────────────┐
│  ⚠ Network error. Please try again.            │
└────────────────────────────────────────────────┘

Action: Allow user to retry
```

---

## 3. Registration Errors (For Reference)

### Error 3.1: Email Already Exists
**Trigger**: User tries to register with already registered email
```
Error Message:
┌──────────────────────────────────────────────────────┐
│  ⚠ Email already in use. Please login or try another.│
└──────────────────────────────────────────────────────┘

Toast: "Email already registered"

Action: Direct to login page
```

### Error 3.2: Password Too Short
**Trigger**: User enters password with less than 6 characters
```
Validation Error:
┌─────────────────────────────────────────┐
│  ✕ Password must be at least 6 chars   │
└─────────────────────────────────────────┘

Visual: Red outline around password field
```

### Error 3.3: Passwords Don't Match
**Trigger**: Password and confirm password don't match
```
Validation Error:
┌─────────────────────────────────────────┐
│  ✕ Passwords do not match               │
└─────────────────────────────────────────┘

Visual: Red outline around confirm password field
```

### Error 3.4: Missing Required Fields
**Trigger**: User tries to submit with empty fields
```
Validation Errors:
- Name required
- Email required  
- Password required
- Department required
- Role required (if applicable)

Visual: All missing fields outlined in red
```

### Error 3.5: Department Required for Google Sign-Up
**Trigger**: User tries Google registration without selecting department
```
Error Message:
┌─────────────────────────────────────────┐
│  ⚠ Please select a department          │
└─────────────────────────────────────────┘

Toast: "Department is required!"

Action: Highlight department dropdown, focus it
```

---

## 4. Success Messages

### Success 4.1: Login Successful
**Trigger**: User successfully logs in
```
Toast Notification:
┌─────────────────────────────────────────────┐
│  ✓ Login successful! Redirecting...         │
└─────────────────────────────────────────────┘

After 1.5 seconds: Redirects to /dashboard
```

### Success 4.2: Google Sign-In Successful
**Trigger**: Registered user signs in with Google
```
Toast Notification:
┌─────────────────────────────────────────────┐
│  ✓ Google sign-in successful! Redirecting...│
└─────────────────────────────────────────────┘

After 1.5 seconds: Redirects to /dashboard
```

### Success 4.3: Registration Successful
**Trigger**: User completes registration
```
Toast Notification:
┌──────────────────────────────────────────────┐
│  ✓ Account created successfully! Redirecting│
└──────────────────────────────────────────────┘

After 1.5 seconds: Redirects to /dashboard
```

### Success 4.4: Google Sign-Up Successful
**Trigger**: User completes Google registration
```
Toast Notification:
┌──────────────────────────────────────────────────────┐
│  ✓ Google sign-up successful as Student (CSE)!      │
│    Redirecting...                                    │
└──────────────────────────────────────────────────────┘

Format: "Google sign-up successful as [ROLE] ([DEPARTMENT])"

After 1.5 seconds: Redirects to /dashboard
```

---

## 5. Console Logs (For Developers)

### Debug Information in Browser Console

#### Successful Login
```
🔷 User logged in successfully: student@university.edu 
   Role: STUDENT Department: Computer Science
```

#### Firestore Profile Missing
```
🔷 Google sign-in attempt for: john@gmail.com
   (No user document found)
   User account not found error thrown
```

#### Successful Google Sign-In
```
🔷 Google sign-in successful: john@gmail.com 
   Role: FACULTY Department: Engineering
```

---

## 6. Flow Charts - What Users See

### Login Flow
```
┌─────────────────────┐
│  Click "Sign In"    │
└──────────┬──────────┘
           │
    ┌──────▼──────┐
    │  Enter Email │
    │  & Password  │
    └──────┬───────┘
           │
    ┌──────▼──────────────┐
    │ Check if Account    │
    │ Exists in Firestore │
    └──────┬──────────────┘
           │
    ┌──────┴──────┐
    │             │
    NO            YES
    │             │
    ▼             ▼
┌─────────┐   ┌──────────────┐
│ Error:  │   │ ✓ Logged in  │
│ "No     │   │ Redirects to │
│ account"│   │ Dashboard    │
└─────────┘   └──────────────┘
```

### Google Sign-In Flow
```
┌──────────────────────┐
│ Click "Sign in with  │
│ Google"              │
└──────────┬───────────┘
           │
    ┌──────▼──────────┐
    │ Google Auth     │
    │ Popup Opens     │
    └──────┬──────────┘
           │
    ┌──────▼──────────┐
    │ User Signs In   │
    │ with Google     │
    └──────┬──────────┘
           │
    ┌──────▼──────────────┐
    │ Check if Account    │
    │ Exists in Firestore │
    └──────┬──────────────┘
           │
    ┌──────┴──────┐
    │             │
    NO            YES
    │             │
    ▼             ▼
┌──────────────┐ ┌──────────────┐
│ Error:       │ │ ✓ Logged in  │
│ "Not        │ │ Redirects to │
│ registered" │ │ Dashboard    │
└──────────────┘ └──────────────┘
```

---

## 7. Visual Styling Guide

### Error Box Styling
- Background: Red with light opacity (#FEF2F2)
- Border: 2px solid red (#FEE2E2)
- Text Color: Dark red (#B91C1C)
- Icon: ⚠ Warning symbol
- Padding: 16px
- Border Radius: 8px
- Animation: None (static)

### Toast Styling
- Background: Red (#DC2626) for errors
- Text Color: White
- Duration: 5 seconds
- Position: Top right corner
- Animation: Fade in/out
- Auto-dismiss: Yes

### Field Validation Styling
- Border: 2px solid red when error
- Background: Light red (#FEF2F2) when error
- Focus: Blue border (#3B82F6) if no error
- Error Text: Red, 12px font, below field
- Icon: ✕ next to error text

### Success Toast Styling
- Background: Green (#16A34A)
- Text Color: White
- Icon: ✓ checkmark
- Duration: 5 seconds then auto-dismiss

---

## 8. Accessibility Notes

### For Screen Readers
- Error messages are marked with `<span role="alert">`
- Toast notifications announce changes
- Form fields have labels
- Error messages linked to form fields

### For Keyboard Users
- Tab through fields in order
- Enter submits form
- Escape closes Google popup
- Error messages focused after submission

### For Color Blind Users
- Icons used (⚠, ✓, ✕) in addition to colors
- Text descriptions not color-dependent
- High contrast maintained (WCAG AA)

---

## 9. Mobile Responsiveness

All error messages are designed to work on:
- ✓ Desktop (1920px+)
- ✓ Tablet (768px - 1024px)
- ✓ Mobile (320px - 480px)

Error boxes adjust width and font size appropriately.

---

## 10. Testing Checklist

### Error Message Testing
- [ ] All error messages display correctly
- [ ] Colors are consistent
- [ ] Icons show properly
- [ ] Text is readable
- [ ] Toast notifications auto-dismiss
- [ ] Error boxes align properly
- [ ] Mobile layout works
- [ ] Accessibility features work

### Error Scenario Testing
- [ ] Test without account
- [ ] Test wrong password
- [ ] Test invalid email
- [ ] Test empty fields
- [ ] Test Google without account
- [ ] Test network errors
- [ ] Test cancelled Google popup

---

**Reference Date:** February 5, 2026
**Last Updated:** February 5, 2026
