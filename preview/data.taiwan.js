/* YouDO seed fixture — Taipei, TWD.
   Canonical shape per docs/PRD.md §9: integer minor units, metres, ISO instants,
   status enums, real entity ids. Display strings are derived at the render
   boundary (formatMoney / formatDistance / formatDuration / formatWhen in
   app.js), never stored — so this fixture carries straight into M0 unchanged.

   M4 additions:
   - `offers` is a real table. The prototype used to imply offers existed;
     nothing recorded them, so a poster had nothing to accept.
   - Every quest carries a §8 status. `assigned`, `in_progress`, `completed`,
     `paid`, `cancelled` and `expired` all have a live record here, because a
     state with no fixture is a state nobody reviews.
   - Positions are metres on a flat grid centred on Taipei Main Station, so
     distance is computed from whoever is *looking* rather than stored once
     from one person's point of view. Flipping the actor moves every distance. */

window.YOUDO_DATA = (function () {
  /* The preview clock. Everything time-based — the 72-hour confirm window,
     expiry, "Today, 6pm" — is measured against this, and the preview can
     advance it, so those states are reachable instead of theoretical. */
  var NOW = "2026-09-16T09:00:00+08:00";

  /* Metres east / north of Taipei Main Station. */
  var AREAS = {
    "Zhongshan": { x: 900, y: 1500 },
    "Da'an": { x: 1800, y: -2200 },
    "Songshan": { x: 4800, y: 300 },
    "Xinyi": { x: 4200, y: -2600 },
    "Nangang": { x: 8200, y: -400 },
    "Wenshan": { x: 2600, y: -7400 }
  };
  function at(area, dx, dy) {
    return { x: AREAS[area].x + (dx || 0), y: AREAS[area].y + (dy || 0) };
  }

  var users = {
    u0: { id: "u0", name: "Alex L.", rating: 4.8, questsCompleted: 27, verified: true,
          area: "Da'an", home: at("Da'an", 120, -60), cancelRate: 0.03,
          bio: "Around Da'an most days. Happy with dogs, flat-pack and anything that needs carrying.",
          phone: "+886 912 345 678", email: "alex.l@example.tw", bank: "CTBC •••• 4417",
          joined: "2025-11-04T10:00:00+08:00" },
    u1: { id: "u1", name: "Wei-Ting C.", rating: 4.9, questsCompleted: 38, verified: true,
          area: "Da'an", home: at("Da'an", -340, 210), cancelRate: 0.02,
          bio: "Two dogs, one small flat, not enough hours.",
          phone: "+886 928 110 442", email: "weiting.c@example.tw", bank: "Fubon •••• 8820",
          joined: "2025-06-12T10:00:00+08:00" },
    u2: { id: "u2", name: "Jason H.", rating: 4.7, questsCompleted: 12, verified: false,
          area: "Zhongshan", home: at("Zhongshan", 80, -120), cancelRate: 0.08,
          bio: "Work shifts, so errands pile up.",
          phone: "+886 955 201 663", email: "jason.h@example.tw", bank: "E.SUN •••• 1102",
          joined: "2026-02-01T10:00:00+08:00" },
    u3: { id: "u3", name: "Mei-Ling W.", rating: 5.0, questsCompleted: 3, verified: true,
          area: "Songshan", home: at("Songshan", -200, 90), cancelRate: 0,
          bio: "New here. Moving into a place that needs a lot of assembling.",
          phone: "+886 937 884 019", email: "meiling.w@example.tw", bank: "Cathay •••• 7731",
          joined: "2026-08-20T10:00:00+08:00" },
    u4: { id: "u4", name: "Kuan-Yu T.", rating: 4.6, questsCompleted: 21, verified: false,
          area: "Xinyi", home: at("Xinyi", 150, 220), cancelRate: 0.11,
          bio: "Moving flats again. Third time this year.",
          phone: "+886 966 330 771", email: "kuanyu.t@example.tw", bank: "Taishin •••• 2094",
          joined: "2025-09-30T10:00:00+08:00" },
    u5: { id: "u5", name: "Yi-Chen L.", rating: 4.9, questsCompleted: 8, verified: true,
          area: "Da'an", home: at("Da'an", 400, 380), cancelRate: 0.05,
          bio: "Patient with technology and with people learning it.",
          phone: "+886 918 447 205", email: "yichen.l@example.tw", bank: "Mega •••• 6618",
          joined: "2026-01-15T10:00:00+08:00" }
  };

  /* One entry per legal §8 state, so the lifecycle can be reviewed without
     first having to drive the app into each one. */
  var quests = [
    { id: "q1", posterId: "u1", title: "Walk Biscuit for an hour",
      payoutMinor: 40000, payoutUnit: "fixed", categoryId: "dog-walking",
      point: at("Da'an", 210, 640), estimatedMinutes: 60,
      scheduledFor: "2026-09-16T18:00:00+08:00", expiresAt: "2026-09-16T17:00:00+08:00",
      createdAt: "2026-09-15T20:10:00+08:00",
      status: "in_progress", acceptedOfferId: "o1", startedAt: "2026-09-16T08:40:00+08:00",
      addressLine: "14B, Lane 31, Yongkang St", area: "Da'an",
      details: "Biscuit is a very slow beagle who stops at every tree. Lead and bags are by the door — ring the buzzer and I'll hand him over. An hour around the park is plenty.",
      requirements: ["Comfortable with medium dogs", "Send one photo mid-walk"] },

    { id: "q2", posterId: "u2", title: "Pick up a parcel from the post office",
      payoutMinor: 20000, payoutUnit: "fixed", categoryId: "delivery",
      point: at("Zhongshan", -120, 330), estimatedMinutes: 20,
      scheduledFor: "2026-09-17T10:00:00+08:00", expiresAt: "2026-09-17T09:00:00+08:00",
      createdAt: "2026-09-16T07:30:00+08:00",
      status: "open", acceptedOfferId: null,
      addressLine: "5F, No. 88, Linsen N Rd", area: "Zhongshan",
      details: "One shoebox-sized parcel, already paid for. I'll send the collection code in chat.",
      requirements: ["Bring a bag"] },

    { id: "q3", posterId: "u3", title: "Assemble a wardrobe (2 boxes)",
      payoutMinor: 35000, payoutUnit: "hourly", categoryId: "assembly",
      point: at("Songshan", 260, -180), estimatedMinutes: 180,
      scheduledFor: "2026-09-19T11:00:00+08:00", expiresAt: "2026-09-19T10:00:00+08:00",
      createdAt: "2026-09-14T18:45:00+08:00",
      status: "open", acceptedOfferId: null,
      addressLine: "9F-2, No. 240, Nanjing E Rd Sec 5", area: "Songshan",
      details: "Flat-pack wardrobe, two boxes, instructions included. I'll be home the whole time and there's coffee.",
      requirements: ["Own drill", "Two hands free on Saturday"] },

    { id: "q4", posterId: "u4", title: "Help carry a sofa down two floors",
      payoutMinor: 60000, payoutUnit: "fixed", categoryId: "moving",
      point: at("Xinyi", -300, 140), estimatedMinutes: 45,
      scheduledFor: "2026-09-16T20:00:00+08:00", expiresAt: "2026-09-16T19:00:00+08:00",
      createdAt: "2026-09-16T08:05:00+08:00",
      status: "open", acceptedOfferId: null,
      addressLine: "2F, No. 12, Lane 553, Songshou Rd", area: "Xinyi",
      details: "Two-seater sofa, second floor, no lift. Van is already booked — I just need a second pair of arms.",
      requirements: ["Can lift 30 kg"] },

    { id: "q5", posterId: "u5", title: "Set up a printer and show me how it works",
      payoutMinor: 40000, payoutUnit: "fixed", categoryId: "tech-help",
      point: at("Da'an", -150, 420), estimatedMinutes: 40,
      scheduledFor: "2026-09-18T17:00:00+08:00", expiresAt: "2026-09-18T16:00:00+08:00",
      createdAt: "2026-09-15T12:20:00+08:00",
      status: "open", acceptedOfferId: null,
      addressLine: "3F, No. 66, Fuxing S Rd Sec 2", area: "Da'an",
      details: "New printer still in the box. Patience appreciated — I'd like to be able to do it myself afterwards.",
      requirements: ["Patient explainer"] },

    /* Posted by the default actor — this is what fills the offer inbox. */
    { id: "q6", posterId: "u0", title: "Drop two bags at the recycling point",
      payoutMinor: 25000, payoutUnit: "fixed", categoryId: "delivery",
      point: at("Da'an", 120, -60), estimatedMinutes: 25,
      scheduledFor: "2026-09-17T14:00:00+08:00", expiresAt: "2026-09-17T13:00:00+08:00",
      createdAt: "2026-09-16T06:50:00+08:00",
      status: "open", acceptedOfferId: null,
      addressLine: "6F, No. 19, Lane 86, Xinsheng S Rd Sec 3", area: "Da'an",
      details: "Two bags of cardboard and one of glass, already sorted. The point is a five-minute walk from my door.",
      requirements: [] },

    /* Doer has finished; the 72-hour confirm window is running. */
    { id: "q7", posterId: "u0", title: "Water my plants while I'm away",
      payoutMinor: 30000, payoutUnit: "fixed", categoryId: "tech-help",
      point: at("Da'an", 120, -60), estimatedMinutes: 30,
      scheduledFor: "2026-09-15T09:00:00+08:00", expiresAt: "2026-09-15T08:00:00+08:00",
      createdAt: "2026-09-13T11:00:00+08:00",
      status: "completed", acceptedOfferId: "o7",
      startedAt: "2026-09-15T09:05:00+08:00", completedAt: "2026-09-15T10:02:00+08:00",
      addressLine: "6F, No. 19, Lane 86, Xinsheng S Rd Sec 3", area: "Da'an",
      details: "Six pots on the balcony, one thirsty fern indoors. Key is with the building manager.",
      requirements: ["Gentle with the fern"] },

    /* Paid, unrated — the ratings capture the kit only ever displayed. */
    { id: "q8", posterId: "u2", title: "Queue for the new bakery on Dihua St",
      payoutMinor: 35000, payoutUnit: "fixed", categoryId: "delivery",
      point: at("Zhongshan", -600, 250), estimatedMinutes: 90,
      scheduledFor: "2026-09-13T07:30:00+08:00", expiresAt: "2026-09-13T07:00:00+08:00",
      createdAt: "2026-09-12T09:00:00+08:00",
      status: "paid", acceptedOfferId: "o8",
      startedAt: "2026-09-13T07:28:00+08:00", completedAt: "2026-09-13T09:10:00+08:00",
      paidAt: "2026-09-13T12:00:00+08:00",
      addressLine: "No. 201, Dihua St Sec 1", area: "Zhongshan",
      details: "Two loaves of the milk bread if they still have it, anything else if they don't.",
      requirements: [] },

    /* Cancelled after acceptance — escrow refunded in full, reason recorded. */
    { id: "q9", posterId: "u4", title: "Take a suitcase to Taipei Main Station",
      payoutMinor: 50000, payoutUnit: "fixed", categoryId: "delivery",
      point: at("Xinyi", 60, 90), estimatedMinutes: 50,
      scheduledFor: "2026-09-14T15:00:00+08:00", expiresAt: "2026-09-14T14:00:00+08:00",
      createdAt: "2026-09-13T16:40:00+08:00",
      status: "cancelled", acceptedOfferId: "o9",
      cancelledAt: "2026-09-14T11:20:00+08:00", cancelledBy: "u4",
      cancelReason: "My travel plans changed",
      addressLine: "18F, No. 7, Songzhi Rd", area: "Xinyi",
      details: "One large suitcase, wheels work. Drop at the west-side left luggage counter.",
      requirements: [] },

    /* Reached expiry with no acceptance. */
    { id: "q10", posterId: "u3", title: "Photograph a bike for a listing",
      payoutMinor: 20000, payoutUnit: "fixed", categoryId: "tech-help",
      point: at("Songshan", 400, 260), estimatedMinutes: 30,
      scheduledFor: "2026-09-15T16:00:00+08:00", expiresAt: "2026-09-15T15:00:00+08:00",
      createdAt: "2026-09-14T09:15:00+08:00",
      status: "expired", acceptedOfferId: null,
      addressLine: "1F, No. 15, Lane 90, Bade Rd Sec 4", area: "Songshan",
      details: "Six or seven clear photos of a road bike, outdoors, for a resale listing.",
      requirements: [] }
  ];

  var categories = [
    { id: "all", label: "All" },
    { id: "delivery", label: "Delivery" },
    { id: "dog-walking", label: "Dog walking" },
    { id: "assembly", label: "Assembly" },
    { id: "moving", label: "Moving" },
    { id: "tech-help", label: "Tech help" },
    { id: "cleaning", label: "Cleaning" }
  ];

  /* Offers are records now. `pending` is unique per (quest, doer) — the guard
     lives in the store, not in the fixture, but nothing here violates it. */
  var offers = [
    { id: "o1", questId: "q1", doerId: "u0", amountMinor: 40000, status: "accepted",
      note: "I walk a dog on Yongkang already — happy to send a photo mid-walk.",
      createdAt: "2026-09-15T21:02:00+08:00", respondedAt: "2026-09-15T21:40:00+08:00" },

    { id: "o2", questId: "q2", doerId: "u3", amountMinor: 20000, status: "pending",
      note: "I pass that post office on the way to work.",
      createdAt: "2026-09-16T08:11:00+08:00", respondedAt: null },

    { id: "o3", questId: "q3", doerId: "u0", amountMinor: 35000, status: "pending",
      note: "I have a drill and I'm free all Saturday morning.",
      createdAt: "2026-09-16T08:44:00+08:00", respondedAt: null },
    { id: "o4", questId: "q3", doerId: "u4", amountMinor: 40000, status: "pending",
      note: "Two wardrobes' experience. I'd want a bit more for a Saturday.",
      createdAt: "2026-09-15T19:30:00+08:00", respondedAt: null },

    { id: "o5", questId: "q4", doerId: "u2", amountMinor: 60000, status: "pending",
      note: "", createdAt: "2026-09-16T08:30:00+08:00", respondedAt: null },

    { id: "o6", questId: "q5", doerId: "u4", amountMinor: 35000, status: "pending",
      note: "Can do it for a bit less if the evening suits you.",
      createdAt: "2026-09-15T14:02:00+08:00", respondedAt: null },

    { id: "o7", questId: "q7", doerId: "u5", amountMinor: 30000, status: "accepted",
      note: "I'm two streets away, easy.",
      createdAt: "2026-09-13T12:10:00+08:00", respondedAt: "2026-09-13T12:35:00+08:00" },

    { id: "o8", questId: "q8", doerId: "u0", amountMinor: 35000, status: "accepted",
      note: "I'll be there before it opens.",
      createdAt: "2026-09-12T10:15:00+08:00", respondedAt: "2026-09-12T10:50:00+08:00" },

    { id: "o9", questId: "q9", doerId: "u0", amountMinor: 50000, status: "accepted",
      note: "", createdAt: "2026-09-13T17:00:00+08:00", respondedAt: "2026-09-13T17:22:00+08:00" },

    /* Three live offers on the actor's own quest — the offer inbox. */
    { id: "o10", questId: "q6", doerId: "u5", amountMinor: 25000, status: "pending",
      note: "I can take them down on my way out at two.",
      createdAt: "2026-09-16T07:20:00+08:00", respondedAt: null },
    { id: "o11", questId: "q6", doerId: "u3", amountMinor: 30000, status: "pending",
      note: "Three bags is a bit much for one trip — I'd do it for a little more.",
      createdAt: "2026-09-16T07:55:00+08:00", respondedAt: null },
    { id: "o12", questId: "q6", doerId: "u2", amountMinor: 25000, status: "pending",
      note: "", createdAt: "2026-09-16T08:35:00+08:00", respondedAt: null },

    /* Offers that lost — a declined and a withdrawn record, so those states
       are visible on a real thread rather than only in a legend. */
    { id: "o13", questId: "q8", doerId: "u3", amountMinor: 40000, status: "declined",
      note: "", createdAt: "2026-09-12T10:20:00+08:00", respondedAt: "2026-09-12T10:50:00+08:00" },
    { id: "o14", questId: "q10", doerId: "u2", amountMinor: 20000, status: "withdrawn",
      note: "", createdAt: "2026-09-14T10:00:00+08:00", respondedAt: "2026-09-14T13:10:00+08:00" }
  ];

  /* One thread per (quest, doer), created when the offer is sent. Never shared. */
  var threads = [
    { id: "t-q1-u0", questId: "q1", posterId: "u1", doerId: "u0",
      lastMessageAt: "2026-09-16T08:41:00+08:00" },
    { id: "t-q3-u0", questId: "q3", posterId: "u3", doerId: "u0",
      lastMessageAt: "2026-09-16T08:44:00+08:00" },
    { id: "t-q6-u5", questId: "q6", posterId: "u0", doerId: "u5",
      lastMessageAt: "2026-09-16T07:20:00+08:00" },
    { id: "t-q6-u3", questId: "q6", posterId: "u0", doerId: "u3",
      lastMessageAt: "2026-09-16T07:55:00+08:00" },
    { id: "t-q6-u2", questId: "q6", posterId: "u0", doerId: "u2",
      lastMessageAt: "2026-09-16T08:35:00+08:00" },
    { id: "t-q7-u5", questId: "q7", posterId: "u0", doerId: "u5",
      lastMessageAt: "2026-09-15T10:02:00+08:00" },
    { id: "t-q8-u0", questId: "q8", posterId: "u2", doerId: "u0",
      lastMessageAt: "2026-09-13T09:12:00+08:00" }
  ];

  /* Per-thread, never shared — the prototype's single global thread was a bug.
     `senderId` rather than "me"/"them", because who "me" is now depends on the
     actor you are viewing as. */
  var messagesByThread = {
    "t-q1-u0": [
      { id: "m1", senderId: "u1", body: "Hi! Are you free at six today?", at: "2026-09-16T08:20:00+08:00" },
      { id: "m2", senderId: "u0", body: "Yes — I can be there a few minutes early.", at: "2026-09-16T08:33:00+08:00" },
      { id: "m3", senderId: "u1", body: "Perfect. Biscuit is slow, so an hour is plenty.", at: "2026-09-16T08:38:00+08:00" },
      { id: "m4", senderId: "u1", body: "Buzzer is 14B, see you at six", at: "2026-09-16T08:41:00+08:00" }
    ],
    "t-q3-u0": [
      { id: "m5", senderId: "u3", body: "Do you have a drill or shall I borrow one?", at: "2026-09-16T08:40:00+08:00" },
      { id: "m6", senderId: "u0", body: "I have a drill and I'm free all Saturday morning.", at: "2026-09-16T08:44:00+08:00" }
    ],
    "t-q6-u5": [
      { id: "m7", senderId: "u5", body: "I can take them down on my way out at two.", at: "2026-09-16T07:20:00+08:00" }
    ],
    "t-q6-u3": [
      { id: "m8", senderId: "u3", body: "Three bags is a bit much for one trip — I'd do it for a little more.", at: "2026-09-16T07:55:00+08:00" }
    ],
    "t-q6-u2": [
      { id: "m9", senderId: "u2", body: "I'd like to take this on at NT$250.", at: "2026-09-16T08:35:00+08:00" }
    ],
    "t-q7-u5": [
      { id: "m10", senderId: "u5", body: "All watered. The fern was very thirsty.", at: "2026-09-15T10:02:00+08:00" }
    ],
    "t-q8-u0": [
      { id: "m11", senderId: "u2", body: "You're a hero, thank you", at: "2026-09-13T09:12:00+08:00" }
    ]
  };

  /* Append-only, double-entry. Entries per txnId sum to zero; balances are
     derived by summation and never stored (ADR-005). Opening balances are
     themselves a transaction, so nothing in the wallet is a magic number.
     `platform_escrow` is the provider-side mirror and stays empty until a real
     PaymentsPort exists — faking it here would double-count `user_held`. */
  var ledger = [
    { id: "e1", txnId: "tx-open", account: "user_available", userId: "u0", questId: null,
      amountMinor: 684000, at: "2025-11-04T10:00:00+08:00", memo: "Opening balance" },
    { id: "e2", txnId: "tx-open", account: "external_bank", userId: "u0", questId: null,
      amountMinor: -684000, at: "2025-11-04T10:00:00+08:00", memo: "Opening balance" },
    { id: "e3", txnId: "tx-open-1", account: "user_available", userId: "u1", questId: null,
      amountMinor: 210000, at: "2025-06-12T10:00:00+08:00", memo: "Opening balance" },
    { id: "e4", txnId: "tx-open-1", account: "external_bank", userId: "u1", questId: null,
      amountMinor: -210000, at: "2025-06-12T10:00:00+08:00", memo: "Opening balance" },
    { id: "e5", txnId: "tx-open-2", account: "user_available", userId: "u2", questId: null,
      amountMinor: 96000, at: "2026-02-01T10:00:00+08:00", memo: "Opening balance" },
    { id: "e6", txnId: "tx-open-2", account: "external_bank", userId: "u2", questId: null,
      amountMinor: -96000, at: "2026-02-01T10:00:00+08:00", memo: "Opening balance" },
    { id: "e7", txnId: "tx-open-3", account: "user_available", userId: "u3", questId: null,
      amountMinor: 145000, at: "2026-08-20T10:00:00+08:00", memo: "Opening balance" },
    { id: "e8", txnId: "tx-open-3", account: "external_bank", userId: "u3", questId: null,
      amountMinor: -145000, at: "2026-08-20T10:00:00+08:00", memo: "Opening balance" },
    { id: "e9", txnId: "tx-open-4", account: "user_available", userId: "u4", questId: null,
      amountMinor: 88000, at: "2025-09-30T10:00:00+08:00", memo: "Opening balance" },
    { id: "e10", txnId: "tx-open-4", account: "external_bank", userId: "u4", questId: null,
      amountMinor: -88000, at: "2025-09-30T10:00:00+08:00", memo: "Opening balance" },
    { id: "e11", txnId: "tx-open-5", account: "user_available", userId: "u5", questId: null,
      amountMinor: 132000, at: "2026-01-15T10:00:00+08:00", memo: "Opening balance" },
    { id: "e12", txnId: "tx-open-5", account: "external_bank", userId: "u5", questId: null,
      amountMinor: -132000, at: "2026-01-15T10:00:00+08:00", memo: "Opening balance" },

    /* q8 — accepted, completed, released. Fee is 10% of NT$350 = NT$35. */
    { id: "e13", txnId: "tx-q8-hold", account: "user_available", userId: "u2", questId: "q8",
      amountMinor: -35000, at: "2026-09-12T10:50:00+08:00", memo: "Held for a quest" },
    { id: "e14", txnId: "tx-q8-hold", account: "user_held", userId: "u2", questId: "q8",
      amountMinor: 35000, at: "2026-09-12T10:50:00+08:00", memo: "Held for a quest" },
    { id: "e15", txnId: "tx-q8-release", account: "user_held", userId: "u2", questId: "q8",
      amountMinor: -35000, at: "2026-09-13T12:00:00+08:00", memo: "Released to the doer" },
    { id: "e16", txnId: "tx-q8-release", account: "user_available", userId: "u0", questId: "q8",
      amountMinor: 31500, at: "2026-09-13T12:00:00+08:00", memo: "Quest paid" },
    { id: "e17", txnId: "tx-q8-release", account: "platform_fee", userId: null, questId: "q8",
      amountMinor: 3500, at: "2026-09-13T12:00:00+08:00", memo: "Platform fee" },

    /* q9 — accepted then cancelled. Escrow refunded in full. */
    { id: "e18", txnId: "tx-q9-hold", account: "user_available", userId: "u4", questId: "q9",
      amountMinor: -50000, at: "2026-09-13T17:22:00+08:00", memo: "Held for a quest" },
    { id: "e19", txnId: "tx-q9-hold", account: "user_held", userId: "u4", questId: "q9",
      amountMinor: 50000, at: "2026-09-13T17:22:00+08:00", memo: "Held for a quest" },
    { id: "e20", txnId: "tx-q9-refund", account: "user_held", userId: "u4", questId: "q9",
      amountMinor: -50000, at: "2026-09-14T11:20:00+08:00", memo: "Refunded after cancellation" },
    { id: "e21", txnId: "tx-q9-refund", account: "user_available", userId: "u4", questId: "q9",
      amountMinor: 50000, at: "2026-09-14T11:20:00+08:00", memo: "Refunded after cancellation" },

    /* q1 — in progress, money already held by the poster. */
    { id: "e22", txnId: "tx-q1-hold", account: "user_available", userId: "u1", questId: "q1",
      amountMinor: -40000, at: "2026-09-15T21:40:00+08:00", memo: "Held for a quest" },
    { id: "e23", txnId: "tx-q1-hold", account: "user_held", userId: "u1", questId: "q1",
      amountMinor: 40000, at: "2026-09-15T21:40:00+08:00", memo: "Held for a quest" },

    /* q7 — doer finished, confirm window running, still held. */
    { id: "e24", txnId: "tx-q7-hold", account: "user_available", userId: "u0", questId: "q7",
      amountMinor: -30000, at: "2026-09-13T12:35:00+08:00", memo: "Held for a quest" },
    { id: "e25", txnId: "tx-q7-hold", account: "user_held", userId: "u0", questId: "q7",
      amountMinor: 30000, at: "2026-09-13T12:35:00+08:00", memo: "Held for a quest" },

    /* A cash-out, so the ledger shows money leaving as well as arriving. */
    { id: "e26", txnId: "tx-cash-1", account: "user_available", userId: "u0", questId: null,
      amountMinor: -150000, at: "2026-09-10T16:00:00+08:00", memo: "Cash out to CTBC •••• 4417" },
    { id: "e27", txnId: "tx-cash-1", account: "external_bank", userId: "u0", questId: null,
      amountMinor: 150000, at: "2026-09-10T16:00:00+08:00", memo: "Cash out to CTBC •••• 4417" }
  ];

  /* Ratings unlock only after `paid`, and show after both sides submit or 14
     days pass (PRD §7.8). q8 is deliberately half-rated so both sides of that
     rule are visible. */
  var reviews = [
    { id: "r1", questId: "q8", raterId: "u2", rateeId: "u0", rating: 5,
      comment: "Queued in the rain without being asked twice.", at: "2026-09-13T12:30:00+08:00" }
  ];

  var notifications = [
    { id: "n1", userId: "u0", type: "offer_received", questId: "q6",
      body: "Yi-Chen L. offered NT$250 on “Drop two bags at the recycling point”",
      at: "2026-09-16T07:20:00+08:00", readAt: null },
    { id: "n2", userId: "u0", type: "offer_received", questId: "q6",
      body: "Mei-Ling W. offered NT$300 on “Drop two bags at the recycling point”",
      at: "2026-09-16T07:55:00+08:00", readAt: null },
    { id: "n3", userId: "u0", type: "quest_done", questId: "q7",
      body: "Yi-Chen L. marked “Water my plants while I'm away” as done",
      at: "2026-09-15T10:02:00+08:00", readAt: null },
    { id: "n4", userId: "u0", type: "message", questId: "q1",
      body: "Wei-Ting C. sent you a message", at: "2026-09-16T08:41:00+08:00", readAt: null },
    { id: "n5", userId: "u0", type: "payment", questId: "q8",
      body: "NT$315 released to your wallet for “Queue for the new bakery on Dihua St”",
      at: "2026-09-13T12:00:00+08:00", readAt: "2026-09-13T13:00:00+08:00" },
    { id: "n6", userId: "u1", type: "quest_started", questId: "q1",
      body: "Alex L. started “Walk Biscuit for an hour”",
      at: "2026-09-16T08:40:00+08:00", readAt: null }
  ];

  /* Where each person had read up to. Without this every historical message
     counts as unread and the chat badge is a meaningless total. */
  var threadReadAt = {
    "u0:t-q1-u0": "2026-09-16T08:35:00+08:00",
    "u0:t-q3-u0": "2026-09-16T08:50:00+08:00",
    "u0:t-q6-u3": "2026-09-16T08:00:00+08:00",
    "u0:t-q6-u2": "2026-09-16T08:40:00+08:00",
    "u0:t-q7-u5": "2026-09-15T18:00:00+08:00",
    "u0:t-q8-u0": "2026-09-13T10:00:00+08:00",
    "u1:t-q1-u0": "2026-09-16T08:45:00+08:00",
    "u5:t-q6-u5": "2026-09-16T07:25:00+08:00",
    "u5:t-q7-u5": "2026-09-15T10:05:00+08:00"
  };

  var savedByUser = { u0: ["q4"], u1: [], u2: [], u3: [], u4: [], u5: [] };

  return {
    now: NOW,
    currency: "TWD",
    areas: AREAS,
    meId: "u0",
    users: users,
    categories: categories,
    quests: quests,
    offers: offers,
    threads: threads,
    messagesByThread: messagesByThread,
    ledger: ledger,
    reviews: reviews,
    notifications: notifications,
    savedByUser: savedByUser,
    threadReadAt: threadReadAt
  };
})();
