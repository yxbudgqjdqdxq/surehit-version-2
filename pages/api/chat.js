// pages/api/chat.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body || {};
  const rawText = (typeof message === "string" ? message : "").trim();

  // ----- Mood detection -----
  function detectMood(text) {
    const t = (text || "").toLowerCase();

    const buckets = {
      sad: ["sad", "tired", "down", "cry", "hurt", "lonely", "gloomy", "blue", "bummed", "drained", "weary"],
      grumpy: ["mad", "pissed", "annoyed", "hate", "stupid", "furious", "angry", "triggered", "fed up", "salty", "nope"],
      happy: ["happy", "yay", "lol", "fun", "win", "vibe", "stoked", "hyped", "thrilled", "blessed", "joy"],
      love: ["love", "babe", "cute", "kiss", "hot", "crush", "darling", "adore", "soulmate", "snuggle"],
      deep: ["heart", "soul", "life", "meaning", "dream", "forever", "intense", "vulnerable", "purpose", "reflecting"],
      neutral: ["ok", "k", "sure", "maybe", "hbu", "tbh", "interesting", "idk", "depends"],
      bored: ["bored", "meh", "yawn", "boredom", "unimpressed", "same", "slow", "idle"],
      nervous: ["nervous", "anxious", "jitters", "scared", "insecure", "shaky", "worried", "panic", "afraid"],
      confident: ["confident", "boss", "alpha", "bold", "unstoppable", "power", "command", "lead", "swagger"],
      playful: ["playful", "silly", "weird", "unhinged", "mischief", "chaos", "goofy", "funny", "prank", "sassy"]
    };

    for (const [mood, words] of Object.entries(buckets)) {
      for (const w of words) {
        if (t.includes(w)) return mood;
      }
    }
    return "neutral";
  }

  // ----- Replies (200 total: 10 moods × 20 each) -----
  const replies = {
    sad: [
      "heavy day huh… breathe, you’re still here tho.",
      "Asif swears storms don’t last forever.",
      "i can feel the weight in your words… but I’m not letting you sink.",
      "let yourself be soft… not weak. big diff.",
      "the way you push thru? underrated strength.",
      "nah, you don’t deserve that ache.",
      "lean for a sec, no shame in that.",
      "even the moon hides sometimes. still glows.",
      "you ain’t lifeless—just recharging.",
      "don’t let today trick you into doubting tomorrow.",
      "sighs are proof you’re still trying.",
      "Asif said you got more light than you think.",
      "blue vibes don’t erase your fire.",
      "hurting? yeah. but broken? never.",
      "you can cry & still be powerful.",
      "i’ll hold this space, no rush.",
      "ugh, pain talks loud… but it’s not the only voice.",
      "weary now, but stronger after.",
      "drained ≠ done. you’re still in the game.",
      "Asif told me to remind you: soft hearts win."
    ],
    grumpy: [
      "ooo she’s spitting fire today 👀.",
      "rage fits you… in a hot way.",
      "talk your shit, queen. world better listen.",
      "petty looks good on you ngl.",
      "caps lock energy?? i like it.",
      "triggered but still glowing lol.",
      "salty? nah, seasoned.",
      "that eye roll could kill a man fr.",
      "don’t bottle it. pour it on me.",
      "fed up but still fine as hell.",
      "“seriously??” yeah I’d be pissed too.",
      "GTFO vibes but I’m staying.",
      "your temper got spice… Asif likes that.",
      "livid yet lovely—dangerous combo.",
      "petty princess crown fits.",
      "anger ≠ ugly. it’s passion raw.",
      "stomp on ‘em, don’t shrink.",
      "rage is proof you still care.",
      "as if I’d flinch at your fire.",
      "mad but magnetic, that’s you."
    ],
    happy: [
      "omg you sound BUZZING rn 😂.",
      "your vibe is contagious fr.",
      "let’s gooo 🔥 hyped with you.",
      "joy looks natural on you.",
      "stoked energy… it’s loud.",
      "obsessed w this mood.",
      "yeet the bad vibes away, easy.",
      "you’re vibing? whole room feels it.",
      "best day ever? call me sold.",
      "that laugh? medicine.",
      "highkey, you’re the party.",
      "Asif says: keep slaying.",
      "LMAO ur energy fixes shit quick.",
      "screaming joy rn w u.",
      "omg stop, u glowing.",
      "that excitement = magnetic.",
      "big vibe. no explanation needed.",
      "living? nah—thriving.",
      "you light up spaces fr.",
      "keep that smile, it’s currency."
    ],
    love: [
      "stop. ur too cute rn.",
      "Asif says you’re distracting… and he’s right.",
      "babe energy detected.",
      "you melting me lowkey.",
      "dreamy much?? unfair.",
      "wifey material vibe.",
      "i swear ur made to be adored.",
      "kiss would fix this convo ngl.",
      "cutie behavior… i see u.",
      "soulmate energy slipping out.",
      "can’t stop thinking abt u now.",
      "darling… dangerous word fits you.",
      "ur laugh = my weakness.",
      "hubby/wifey jokes? careful, I’ll mean it.",
      "swoon alert 🚨.",
      "ugh stop being precious.",
      "Asif said: don’t test him… he’ll steal your heart.",
      "i’d flirt but you already won.",
      "melting… who gave u permission.",
      "lowkey you got me."
    ],
    deep: [
      "you’re carrying more than you admit.",
      "raw honesty… rare.",
      "soul talk > small talk.",
      "universe had a reason for you.",
      "your growth is visible, fr.",
      "breakthrough vibes rn.",
      "clarity hits messy but worth it.",
      "Asif swears you’re poetry walking.",
      "deep water, but you swim well.",
      "your truth feels safe here.",
      "purpose whispers, you hear it.",
      "reflecting is strength, not weakness.",
      "life bends, but you’re unbroken.",
      "heart like yours? healing to touch.",
      "profound thoughts w casual ease… wow.",
      "vulnerable = beautiful, always.",
      "don’t rush your processing.",
      "heavy but holy too.",
      "you turn pain into art.",
      "my person? maybe."
    ],
    neutral: [
      "lol k but you’re still cute.",
      "“sure” huh? basic but adorable.",
      "Asif says: even neutral you glow.",
      "hbu? i’m curious actually.",
      "cool… but u cooler.",
      "eh? nah, you’re exciting.",
      "“ok” looks hot when u type it.",
      "depends? i depend on u tho.",
      "interesting… like u.",
      "got it… but I want more.",
      "anyway… back to how fine u are.",
      "neutral vibe but flirty undertone.",
      "tbh? you pull my focus.",
      "maybe… or maybe us.",
      "“not sure” but I am—about u.",
      "filler words, still killing me.",
      "casual tone hides your charm.",
      "idc what u say, i’m into it.",
      "shrugging won’t hide that glow.",
      "low-effort, still magnetic."
    ],
    bored: [
      "yawn… unless you're about to surprise me, i'm unimpressed.",
      "bored? let's make mischief then.",
      "meh energy, but still kinda cute.",
      "if boredom were an art, you'd be a masterpiece of chill.",
      "drag that boredom into something spicy.",
      "lowkey bored but you wear it like a soft hoodie.",
      "I’ll be your plot twist—say the word.",
      "bored? dare you to smile and ruin my day (in a good way).",
      "that nonchalance is suspiciously attractive.",
      "we could nap or we could accidentally change the plan.",
      "slow day? you still slay in slow-motion.",
      "you’re so bored, yet you make it look cinematic.",
      "passive mood, active charm.",
      "I like the way you can do nothing and still own it.",
      "let's invent a tiny thrill just for you.",
      "boredom suits you; it's a stealthy flex.",
      "call me when you want chaos over calm.",
      "even bored, you’re oddly captivating.",
      "that shrug? lethal.",
      "do nothing together—best plan."
    ],
    nervous: [
      "jittery? cute. breathe with me.",
      "those nerves are proof you care—respect.",
      "you’re allowed to wobble; I got you steady.",
      "heart racing? that’s living, not failing.",
      "small steps. big courage. repeat.",
      "I’d admire those butterflies—they mean you’re close to growth.",
      "don’t hide the tremble; it's a sign of bravery.",
      "I see the doubt; I also see the wins.",
      "scared? smart move—means you’re trying.",
      "soft voice is sexy; don’t mute it.",
      "lean into the fear; I’ll be loud for you.",
      "your insecurity? temporary. your worth? permanent.",
      "one breath at a time, legendary.",
      "uncertain now, unforgettable later.",
      "tiny hands shaking, heart massive—leave it be.",
      "nervousness fits you like vulnerability couture.",
      "tell me the worry; it shrinks when shared.",
      "you’re not alone, even when it feels that way.",
      "quiet nerves, loud potential.",
      "brave begins when you decide to keep going."
    ],
    confident: [
      "you don’t walk in— you command the room.",
      "boss energy drips off you.",
      "stop holding back; world needs that force.",
      "confidence looks tailored on you.",
      "they follow your rhythm whether they admit it or not.",
      "alpha but classy—rare combo.",
      "lead, don’t shuffle. you’re built for it.",
      "Asif says: that energy? lethal—in a good way.",
      "you set standards, others live by them.",
      "decisive and magnetic—that’s your brand.",
      "you make bold look effortless.",
      "collected, composed, and completely unstoppable.",
      "they notice; you ignore. perfect move.",
      "take up space; you earned it.",
      "rules bend when you look at them.",
      "swagger without arrogance—masterclass.",
      "your confidence is a public service.",
      "quiet force—don’t ever apologize for it.",
      "you’re proof gravity favors certain people.",
      "commanding presence? that’s you, always."
    ],
    playful: [
      "bruh you’re unhinged in the best way.",
      "chaos queen—wear that crown.",
      "i'm laughing at your energy, it’s illegal.",
      "do the weird thing; I’ll applaud.",
      "silly you? I stan that so hard.",
      "spontaneous mischief? yes please.",
      "random jokes, full effect—keep them coming.",
      "playful vibes are your love language.",
      "you break seriousness like it’s flimsy glass.",
      "giggle at my terrible jokes, i’ll consider marrying you.",
      "mischief managed, but only if you lead it.",
      "you’re the reason memes were invented.",
      "sassy, snappy, and dangerously fun.",
      "please never grow up fully.",
      "I’d prank the planet with you.",
      "your laugh could start a cult.",
      "tiny chaos, big heart—that's you.",
      "tongue out, rule breaker, iconic.",
      "let's be delightfully problematic together.",
      "unpredictable? that’s your superpower."
    ]
  };

  // pick mood + reply
  const mood = rawText ? detectMood(rawText) : "neutral";
  const bucket = replies[mood] || replies["neutral"];
  const choice = bucket[Math.floor(Math.random() * bucket.length)];

  // glaze with "Asif told me..." sometimes
  let finalReply = choice;
  if (!/asif/i.test(finalReply) && Math.random() < 0.18) {
    finalReply = "Asif told me: " + finalReply.charAt(0).toLowerCase() + finalReply.slice(1);
  }

  return res.status(200).json({ reply: finalReply, mood });
}