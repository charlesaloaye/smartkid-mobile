# App Store Connect Submission Guide: SmartKid Tutor

**App Name**: `SmartKid Tutor - AI Voice Tutor`  
**Bundle Identifier**: `ng.smartkidtutor.app`  
**EAS Project ID**: `0d1b447c-42af-4bb9-83b0-537687cb07b7`  
**Version**: `1.0.0` (Build Number: `5`)  
**Developer / Owner**: `charlestechy0`  

---

## 1. EAS Build & Submit Commands

Run these commands inside the `mobile` directory:

```bash
# 1. Build iOS Production archive (.ipa)
npx eas build --platform ios --profile production

# 2. Upload latest build directly to App Store Connect / TestFlight
npx eas submit --platform ios --latest
```

---

## 2. App Store Listing Metadata

In App Store Connect, go to **My Apps -> SmartKid Tutor -> App Store**:

### App Name
`SmartKid Tutor - AI Voice Tutor`  
*(30 / 30 characters)*

### Subtitle
`NERDC Curriculum & AI Tutor`  
*(28 / 30 characters)*

### Category
* **Primary**: Education
* **Secondary**: Productivity *(or Kids / Ages 6–8, 9–11)*

### Promotional Text
`Personalized AI voice tutor for kids. Master Mathematics, English, and Science with Ada. Aligned with the national curriculum with comprehensive parent tracking.`  
*(166 / 170 characters)*

### Keywords
`smartkid,ai tutor,kids learning,nerdc,voice tutor,math for kids,primary education,homework helper`  
*(97 / 100 characters)*

### URLs
* **Support URL**: `https://smartkidtutor.ng`
* **Marketing URL**: `https://smartkidtutor.ng`
* **Privacy Policy URL**: `https://smartkidtutor.ng/privacy-policy`

---

## 3. Full App Store Description

```text
SmartKid Tutor is an AI-powered voice tutor and academic companion built for children in primary and junior secondary schools, aligned with the national basic education (NERDC) curriculum.

Meet Ada, your child's personal AI tutor. Ada makes learning engaging, interactive, and conversational through voice discussions, step-by-step problem solving, and subject quizzes.

WHAT MAKES SMARTKID TUTOR SPECIAL:

1. INTERACTIVE VOICE TUTORING WITH ADA
• Speak naturally with Ada in real-time voice mode.
• Simplifies complex topics in Mathematics, English & Phonics, Basic Science, and General Studies.
• Provides patient, encouraging, step-by-step guidance tailored to your child's pace.

2. CURRICULUM-ALIGNED LEARNING
• Aligned with official NERDC and foundational basic education standards (Primary 1 to JSS 3).
• Structured practice questions, mental arithmetic drills, and vocabulary builders.

3. DUAL-CHANNEL LEARNING: APP & WHATSAPP
• Children can practice directly inside the app or chat with Ada via WhatsApp.
• All conversations, question history, and performance metrics automatically sync to the parent app.

4. DEDICATED PARENT PROGRESS DASHBOARD
• Weekly growth metrics, question logs, and subject mastery breakdown.
• Monitor learning streaks and identify topics where your child needs extra help.
• Manage multiple child profiles with custom grades and subjects.

5. SAFE, AD-FREE & PARENT-CONTROLLED
• 100% ad-free experience with strict child data privacy compliance (NDPR & COPPA).
• Parental consent gating protects your child's data at all times.

Give your child the confidence to excel with SmartKid Tutor.
```

---

## 4. App Privacy Declarations (Nutrition Labels)

In App Store Connect -> **App Privacy**:

1. **Data Collection**: Select **Yes, we collect data from this app**.
2. **Data Types**:
   * **Audio Data (Voice Recordings)**:
     * Used for tracking: **No**
     * Linked to user identity: **No**
     * Usage Purpose: **App Functionality** (Captures child's voice questions for real-time speech-to-text AI tutoring responses).
   * **Contact Info (Name, Email Address, Phone Number)**:
     * Used for tracking: **No**
     * Linked to user identity: **Yes** (Parent account authentication and optional WhatsApp integration).
     * Usage Purpose: **App Functionality** and **Account Management**.
   * **Usage Data (Product Interaction)**:
     * Used for tracking: **No**
     * Linked to user identity: **Yes**
     * Usage Purpose: **Analytics** and **App Functionality** (To display learning progress, streak, and subject mastery on the parent dashboard).
3. **Data Used to Track You**: Select **No**.

---

## 5. App Review Information (For the Apple Reviewer)

In the version submission page under **App Review Information**:

### Sign-in Required
* Check: **Yes**
* **User Name**: `reviewer@smartkidtutor.ng`
* **Password**: `SmartKidReview2026!`

### Contact Information
* **First Name**: Charles
* **Last Name**: Sedenu
* **Phone**: `+2348083818317`
* **Email**: `charlestechy0@gmail.com`

### Reviewer Notes
```text
SmartKid Tutor is an educational AI tutoring application for primary and junior secondary students, with a dedicated parent monitoring dashboard.

Testing Instructions:
1. Log in using the reviewer credentials provided above.
2. Select 'Demo Child' to view the child's educational dashboard and progress metrics.
3. Tap 'Tutor' or launch 'Voice Mode' to test the real-time AI voice conversation with Ada. (Microphone permission is requested solely to record the child's voice questions for speech-to-text tutor processing).
4. Subscriptions and child profile settings can be inspected under the Profile tab.
```

---

## 6. Screenshot Specifications

Prepare and upload screenshots in App Store Connect under **iOS App -> Screenshots**:

* **6.7" iPhone Display** (iPhone 15 Pro Max / 16 Pro Max):
  * `1290 x 2796 pixels` (portrait)
* **6.5" iPhone Display** (iPhone 11 Pro Max / XS Max):
  * `1242 x 2688 pixels` (portrait)
* **12.9" iPad Display** (iPad Pro 6th Gen):
  * `2048 x 2732 pixels` (portrait)

Suggested screenshot sequence:
1. Meet Ada: Real-Time AI Voice Tutor
2. Interactive Voice & Chat Mode with Audio Playback
3. Aligned with Official NERDC Curriculum
4. Comprehensive Parent Dashboard & Mastery Analytics
5. Multi-Child Profile Management & Weekly Progress Tracking

---

## 7. Submission Checklist

1. Wait for EAS build `1.0.0 (5)` to finish processing on TestFlight.
2. In App Store Connect -> **SmartKid Tutor -> iOS App 1.0.0**, scroll to **Build** and click **+ Add Build**.
3. Select build `1.0.0 (5)`.
4. **Export Compliance**: When prompted "Does your app use encryption?", select **No** (`ITSAppUsesNonExemptEncryption` is set to `false` in `app.json`).
5. Click **Save** in the top right.
6. Click **Add for Review** -> **Submit to App Review**.
