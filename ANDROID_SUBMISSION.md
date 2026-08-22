# Google Play Store Submission Guide: SmartKid Tutor

**App Name**: `SmartKid Tutor: AI Voice Tutor`  
**Package Name**: `ng.smartkidtutor.app`  
**EAS Project ID**: `0d1b447c-42af-4bb9-83b0-537687cb07b7`  
**Version**: `1.0.0` (Version Code: `6`)  
**Target SDK**: Android 15 (API 35)  
**Developer / Owner**: `charlestechy0`  

---

## 1. EAS Build & Upload Commands

Run these commands inside the `mobile` directory:

```bash
# 1. Build production Android App Bundle (.aab)
npx eas build --platform android --profile production

# 2. Upload latest build directly to Google Play Console via EAS CLI
npx eas submit --platform android --latest
```

---

## 2. Store Listing Metadata

### App Name
`SmartKid Tutor: AI Voice Tutor`  
*(30 / 30 characters)*

### Short Description
`AI voice tutor for kids. NERDC curriculum math, English, science & parent reports.`  
*(79 / 80 characters)*

### Full Description
```text
SmartKid Tutor is an AI-powered personalized learning companion and voice tutor designed for primary and junior secondary school children, aligned with the official national NERDC curriculum.

Powered by Ada, your child's friendly AI tutor, SmartKid Tutor makes learning active, conversational, and fun through voice interactions, step-by-step homework help, and parent-guided progress tracking.

KEY FEATURES:

1. MEET ADA — REAL-TIME VOICE TUTOR
• Conversational AI voice mode lets children speak directly to Ada just like a home tutor.
• Explains tough concepts in Mathematics, English/Phonics, Basic Science, and General Studies using age-appropriate, encouraging language.
• Adapts explanations to the child's grade level and learning pace.

2. NERDC & BASIC EDUCATION CURRICULUM ALIGNED
• Structured learning modules covering Primary 1 through JSS 3.
• Practice quizzes, concept breakdown, spelling drills, and mental math challenges.

3. DUAL-CHANNEL LEARNING (APP & WHATSAPP)
• Children can learn inside the mobile app or converse with Ada directly via WhatsApp voice notes and text.
• All learning sessions sync automatically to the parent dashboard in real time.

4. COMPREHENSIVE PARENT DASHBOARD
• Real-time subject mastery scores and learning heatmaps.
• Track question history, learning streaks, weekly growth, and topic strengths.
• Full multi-child profile management under a single parent account.

5. CHILD SAFETY & PRIVACY FIRST
• Designed in compliance with NDPR and international child data protection standards.
• No ads, no public social feeds, and no third-party tracking.
• Strict parental consent gating and secure cloud infrastructure.

Empower your child to build confidence, master subjects, and love learning with SmartKid Tutor.
```

---

## 3. Store Settings and Categorization

* **Category**: Education
* **Tags**: Education, Kids education, Learning tools, Homework helper, Math games
* **Support Email**: `support@smartkidtutor.ng` *(or `charlestechy0@gmail.com`)*
* **Website**: `https://smartkidtutor.ng`
* **Privacy Policy URL**: `https://smartkidtutor.ng/privacy-policy`

---

## 4. App Content Declarations (Play Console Setup)

In Google Play Console, navigate to **Policy and programs -> App content** and complete each section:

### A. Privacy Policy
* Enter: `https://smartkidtutor.ng/privacy-policy`

### B. Ads Declaration
* Select: **No, my app does not contain ads**

### C. App Access (Reviewer Login)
* Select: **All or some functionality is restricted**
* Add credentials:
  * **Name**: `Parent Reviewer Account`
  * **Username/Email**: `reviewer@smartkidtutor.ng`
  * **Password**: `SmartKidReview2026!`
  * **2-Factor / OTP**: No
  * **Instructions**:
    ```text
    1. Sign in with the credentials provided above to access the parent dashboard.
    2. Tap on the child profile 'Demo Child' (or create a new child profile).
    3. Open 'Ada Tutor' or tap 'Voice Mode' to test real-time voice and text tutoring with AI responses.
    4. View the child progress and activity tabs to inspect mastery charts and question logs.
    ```

### D. Content Rating (IARC)
* **Category**: Educational / Utility
* **Violence, Sexual Content, Offensive Language, Controlled Substances**: No
* **User Interaction**:
  * Exchange content/interact with users: **No** (Child interacts exclusively with the AI tutor; no user-to-user social features).
  * Share physical location: **No**
  * Purchase digital goods: **Yes** (Parental subscriptions).
* **Expected Rating**: **Everyone / PEGI 3**

### E. Target Audience and Families Policy
* **Target age groups**: Select **6–8**, **9–12**, and **13 and over** (Parent-managed child experience).
* **Appeal to children**: **Yes**
* **Families Policy Compliance**: App strictly complies with Families Policy (no third-party behavioral ads, neutral age gate, COPPA & NDPR compliant privacy policy).

### F. Policy Disclosures
* **News App**: No
* **COVID-19 Contact Tracing**: No
* **Financial Features**: My app does not provide any financial features
* **Government App**: No
* **Health App**: No

### G. Permissions Declarations
* **Microphone (`RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS`)**:
  * **Justification**:
    ```text
    Used strictly to capture the child's voice questions during interactive voice tutoring sessions with Ada. Audio is processed for speech recognition to provide instant educational answers and is not sold or shared.
    ```
* **Foreground Service (`FOREGROUND_SERVICE_MEDIA_PLAYBACK`)**:
  * **Justification**:
    ```text
    Used to ensure uninterrupted playback of Ada's educational voice responses when the child is listening to tutor explanations.
    ```

### H. Advertising ID
* Select: **No, this app does not use Advertising ID**

### I. Data Safety Form
1. **Data Collection**:
   * Collects or shares data: **Yes**
   * Encrypted in transit: **Yes** (HTTPS/TLS)
   * Account deletion mechanism: **Yes** (`https://smartkidtutor.ng/privacy-policy`)
2. **Data Types to Declare**:
   * **Personal info**:
     * **Name**: Parent and child first name (Collected | App functionality, Account management)
     * **Email address**: Parent email (Collected | App functionality, Account management)
     * **Phone number**: Parent WhatsApp number (Collected | Optional | App functionality, WhatsApp integration)
   * **Audio files**:
     * **Voice recordings**: Ephemeral voice inputs for speech recognition tutoring dialogue.
   * **App Activity**:
     * **App interactions**: Question counts and subject progress logs for parent reports.

---

## 5. Graphic Assets

* **App Icon**: `512 x 512 px` (PNG 32-bit, max 1MB)
* **Feature Graphic**: `1024 x 500 px` (JPG or PNG, max 15MB)
* **Phone Screenshots**: Minimum 2 (Recommended 5–6)
  * Format: `1080 x 1920 px` or 9:16 aspect ratio
  * Suggested sequence:
    1. Meet Ada: Real-time AI Voice Tutor
    2. Interactive Audio & Text Learning Sessions
    3. Aligned with NERDC & National Curriculum
    4. Parent Dashboard & Subject Mastery Heatmaps
    5. Multi-Child Profile Management & Weekly Progress Reports

---

## 6. Production / Closed Testing Release

1. Navigate to **Release -> Production** (or **Closed testing**).
2. Click **Create new release**.
3. Upload the generated `.aab` file (`versionCode: 6`).
4. **Release Name**: `1.0.0 (6)`
5. **Release Notes**:
```text
<en-US>
Initial release of SmartKid Tutor:
- Real-time AI voice and text tutoring with Ada
- NERDC-aligned curriculum support for Mathematics, English, Science, and more
- Multi-child parent dashboard with mastery analytics and weekly growth tracking
- Seamless WhatsApp and mobile app learning integration
- Child-safe, ad-free learning environment
</en-US>
```
6. Review warnings and click **Save and Send for Review**.
