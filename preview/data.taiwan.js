/* YouDO seed fixture — Taipei, TWD.
   Canonical shape per docs/PRD.md §9: integer minor units, metres, ISO instants,
   status enums, real entity ids. Display strings are derived at the render
   boundary (see formatMoney / formatDistance / formatDuration in app.js),
   never stored — so this fixture carries straight into M0 unchanged. */

window.YOUDO_DATA = (function () {
  var NOW = "2026-09-16T09:00:00+08:00";

  var users = {
    u0: { id: "u0", name: "Alex L.", rating: 4.8, questsCompleted: 27, verified: true, area: "Da'an" },
    u1: { id: "u1", name: "Wei-Ting C.", rating: 4.9, questsCompleted: 38, verified: true, area: "Da'an" },
    u2: { id: "u2", name: "Jason H.", rating: 4.7, questsCompleted: 12, verified: false, area: "Zhongshan" },
    u3: { id: "u3", name: "Mei-Ling W.", rating: 5.0, questsCompleted: 3, verified: true, area: "Songshan" },
    u4: { id: "u4", name: "Kuan-Yu T.", rating: 4.6, questsCompleted: 21, verified: false, area: "Xinyi" },
    u5: { id: "u5", name: "Yi-Chen L.", rating: 4.9, questsCompleted: 8, verified: true, area: "Da'an" }
  };

  var quests = [
    {
      id: "q1", posterId: "u1", title: "Walk Biscuit for an hour",
      payoutMinor: 40000, payoutUnit: "fixed", categoryId: "dog-walking",
      distanceM: 1200, estimatedMinutes: 60,
      scheduledFor: "2026-09-16T18:00:00+08:00", when: "Today, 6pm",
      expiresAt: "2026-09-16T11:00:00+08:00",
      status: "open", offersCount: 3,
      addressLine: "Yongkang St, Da'an District", area: "Da'an",
      badges: [{ label: "Ends in 2h", tone: "hot", icon: "clock" }],
      details: "Biscuit is a very slow beagle who stops at every tree. Lead and bags are by the door — ring the buzzer and I'll hand him over. An hour around the park is plenty.",
      requirements: ["Comfortable with medium dogs", "Send one photo mid-walk"]
    },
    {
      id: "q2", posterId: "u2", title: "Pick up a parcel from the post office",
      payoutMinor: 20000, payoutUnit: "fixed", categoryId: "delivery",
      distanceM: 600, estimatedMinutes: 20,
      scheduledFor: "2026-09-17T10:00:00+08:00", when: "Tomorrow, 10am",
      expiresAt: "2026-09-17T09:00:00+08:00",
      status: "open", offersCount: 1,
      addressLine: "Linsen N Rd, Zhongshan District", area: "Zhongshan",
      badges: [],
      details: "One shoebox-sized parcel, already paid for. I'll send the collection code in chat.",
      requirements: ["Bring a bag"]
    },
    {
      id: "q3", posterId: "u3", title: "Assemble a wardrobe (2 boxes)",
      payoutMinor: 35000, payoutUnit: "hourly", categoryId: "assembly",
      distanceM: 2400, estimatedMinutes: 180,
      scheduledFor: "2026-09-19T11:00:00+08:00", when: "Sat, 11am",
      expiresAt: "2026-09-19T10:00:00+08:00",
      status: "open", offersCount: 6,
      addressLine: "Nanjing E Rd, Songshan District", area: "Songshan",
      badges: [{ label: "Tools needed", tone: "warning", icon: "briefcase" }],
      details: "Flat-pack wardrobe, two boxes, instructions included. I'll be home the whole time and there's coffee.",
      requirements: ["Own drill", "Two hands free on Saturday"]
    },
    {
      id: "q4", posterId: "u4", title: "Help carry a sofa down two floors",
      payoutMinor: 60000, payoutUnit: "fixed", categoryId: "moving",
      distanceM: 3100, estimatedMinutes: 45,
      scheduledFor: "2026-09-16T20:00:00+08:00", when: "Today, 8pm",
      expiresAt: "2026-09-16T19:00:00+08:00",
      status: "open", offersCount: 2,
      addressLine: "Songshou Rd, Xinyi District", area: "Xinyi",
      badges: [{ label: "New", tone: "accent" }],
      details: "Two-seater sofa, second floor, no lift. Van is already booked — I just need a second pair of arms.",
      requirements: ["Can lift 30 kg"]
    },
    {
      id: "q5", posterId: "u5", title: "Set up a printer and show me how it works",
      payoutMinor: 40000, payoutUnit: "fixed", categoryId: "tech-help",
      distanceM: 900, estimatedMinutes: 40,
      scheduledFor: "2026-09-18T17:00:00+08:00", when: "Thu, 5pm",
      expiresAt: "2026-09-18T16:00:00+08:00",
      status: "open", offersCount: 4,
      addressLine: "Fuxing S Rd, Da'an District", area: "Da'an",
      badges: [],
      details: "New printer still in the box. Patience appreciated — I'd like to be able to do it myself afterwards.",
      requirements: ["Patient explainer"]
    }
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

  /* Quests the current user is involved in. step indexes StatusTrack:
     0 Posted · 1 Accepted · 2 Doing · 3 Paid */
  var myQuests = [
    { id: "m1", questId: "q1", title: "Walk Biscuit for an hour", payoutMinor: 40000,
      categoryId: "dog-walking", step: 2, role: "doing", when: "Today, 6pm", counterpartId: "u1" },
    { id: "m2", questId: null, title: "Drop two bags at the recycling point", payoutMinor: 25000,
      categoryId: "delivery", step: 3, role: "posted", when: "Mon, 2pm", counterpartId: "u5" }
  ];

  var threads = [
    { id: "t1", questId: "q1", questTitle: "Walk Biscuit for an hour", withUserId: "u1",
      amountMinor: 40000, step: 1, unread: 2, time: "12:41" },
    { id: "t2", questId: "q3", questTitle: "Assemble a wardrobe (2 boxes)", withUserId: "u3",
      amountMinor: 35000, step: 0, unread: 0, time: "11:08" },
    { id: "t3", questId: "q2", questTitle: "Pick up a parcel from the post office", withUserId: "u2",
      amountMinor: 20000, step: 3, unread: 0, time: "Yesterday" }
  ];

  /* Per-thread, never shared — the prototype's single global thread was a bug. */
  var messagesByThread = {
    t1: [
      { id: "t1m1", from: "them", text: "Hi! Are you free at six today?", time: "12:20" },
      { id: "t1m2", from: "me", text: "Yes — I can be there a few minutes early.", time: "12:33" },
      { id: "t1m3", from: "them", text: "Perfect. Biscuit is slow, so an hour is plenty.", time: "12:38" },
      { id: "t1m4", from: "them", text: "Buzzer is 14B, see you at six", time: "12:41" }
    ],
    t2: [
      { id: "t2m1", from: "me", text: "I have a drill and I'm free all Saturday morning.", time: "10:52" },
      { id: "t2m2", from: "them", text: "Do you have a drill or shall I borrow one?", time: "11:08" }
    ],
    t3: [
      { id: "t3m1", from: "them", text: "Collection code is 4471 — thanks!", time: "Yesterday" },
      { id: "t3m2", from: "me", text: "Picked up and dropped at your door.", time: "Yesterday" }
    ]
  };

  /* Append-only. Signed minor units; state drives the wallet row treatment. */
  var ledger = [
    { id: "L1", questId: "q1", counterpartId: "u1", label: "Walk Biscuit for an hour",
      amountMinor: 40000, state: "held", tone: "warning" },
    { id: "L2", questId: "q5", counterpartId: "u5", label: "Set up a printer and show me how it works",
      amountMinor: 40000, state: "paid", tone: "success" },
    { id: "L3", questId: "q4", counterpartId: "u4", label: "Help carry a sofa down two floors",
      amountMinor: 60000, state: "paid", tone: "success" },
    { id: "L4", questId: null, counterpartId: null, label: "Cash out to bank",
      amountMinor: -150000, state: "sent", tone: "neutral", account: "CTBC •••• 4417" }
  ];

  return {
    now: NOW,
    currency: "TWD",
    me: { id: "u0", name: "Alex L.", rating: 4.8, questsCompleted: 27, verified: true,
          area: "Da'an", availableMinor: 684000, heldMinor: 40000,
          monthEarnedMinor: 420000, monthQuests: 9, bank: "CTBC •••• 4417",
          phone: "+886 912 345 678", email: "alex.l@example.tw" },
    users: users,
    categories: categories,
    quests: quests,
    myQuests: myQuests,
    threads: threads,
    messagesByThread: messagesByThread,
    ledger: ledger
  };
})();
