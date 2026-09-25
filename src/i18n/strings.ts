/* English only, at launch (ADR-006) — Chinese localization is an explicit
   M6 decision point, not M1 work. This flat dictionary is the whole i18n
   layer: every user-facing string in the app goes through t() (./t.ts)
   instead of being written inline, so localizing later is a translation
   pass over this one file (plus whichever locale files join it), never a
   call-site refactor. Copy for onboarding is a faithful port of
   preview/app.js's OnboardingFlow; copy for later phases (browse, tabs,
   filters) is added incrementally as those screens are built, not guessed
   ahead of time. */
export const strings = {
  "onboarding.welcome.eyebrow": "Taipei",
  "onboarding.welcome.title": "Small jobs, done by neighbours",
  "onboarding.welcome.body":
    "Post something you need done, or take on a job near you and get paid. The money is held in escrow between you, always.",
  "onboarding.welcome.pitchPoster.title": "Need something done",
  "onboarding.welcome.pitchPoster.body": "Post a job, agree a price, and pay only once it's done.",
  "onboarding.welcome.pitchDoer.title": "Have a free hour",
  "onboarding.welcome.pitchDoer.body": "Take a nearby job and get paid — no shifts, no licence.",
  "onboarding.welcome.cta": "Get started",

  "onboarding.location.title": "See what's near you",
  "onboarding.location.body":
    "We use your area to show nearby quests and give posters an honest distance. Your exact address is never shared until a quest is accepted.",
  "onboarding.location.skip": "Not now",
  "onboarding.location.allow": "Allow location",
  "onboarding.location.allowedToast": "Found you nearby — quests are sorted by distance",
  "onboarding.location.skippedToast": "You can turn location on later, in Settings",

  "onboarding.signin.title": "Sign in to YouDO",
  "onboarding.signin.body": "No passwords. Use your Google account, or we'll send a code to your email or phone.",
  "onboarding.signin.google": "Sign in via Google",
  "onboarding.signin.useCode": "Use a code instead",
  "onboarding.signin.loading": "Signing in with Google…",

  "onboarding.contact.title": "Sign in with a code",
  "onboarding.contact.body": "We'll text or email a 6-digit code — nothing to remember.",
  "onboarding.contact.emailTab": "Email",
  "onboarding.contact.phoneTab": "Phone",
  "onboarding.contact.emailLabel": "Email",
  "onboarding.contact.phoneLabel": "Phone",
  "onboarding.contact.emailPlaceholder": "you@example.com",
  "onboarding.contact.phonePlaceholder": "+886 9xx xxx xxx",
  "onboarding.contact.back": "Back",
  "onboarding.contact.send": "Send code",
  "onboarding.contact.invalidEmail": "Add a working email to send the code",
  "onboarding.contact.invalidPhone": "Add a working phone number to send the code",
  "onboarding.contact.sentToast": "Code sent to {{contact}}",

  "onboarding.code.title": "Enter your code",
  "onboarding.code.body": "We sent a 6-digit code to {{contact}}.",
  "onboarding.code.label": "6-digit code",
  "onboarding.code.resend": "Resend code",
  "onboarding.code.back": "Back",
  "onboarding.code.verify": "Verify code",
  "onboarding.code.tooShort": "Enter all 6 digits",
  "onboarding.code.wrong": "That code didn't match — check your messages and try again",
  "onboarding.code.resentToast": "Sent a new code to {{contact}}",

  "tabs.browse": "Browse",
  "tabs.quests": "My quests",
  "tabs.post": "Post",
  "tabs.chats": "Chats",
  "tabs.profile": "Profile",
  "tabs.browse.comingSoon": "The quest feed is coming soon.",
  "tabs.quests.comingSoon": "Track offers and quest progress here soon.",
  "tabs.post.comingSoon": "Posting a quest is coming soon.",
  "tabs.chats.comingSoon": "Chat with posters and doers here soon.",
  "tabs.profile.comingSoon": "Your profile and settings are coming soon.",

  "common.loading": "Loading…",
  "common.errorGeneric": "We couldn't reach the server. Check your connection and try again.",
  "common.retry": "Try again",
} as const;

export type StringKey = keyof typeof strings;
