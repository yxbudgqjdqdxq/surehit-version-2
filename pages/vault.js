// pages/vault.js
import { useRouter } from "next/router";
import React, { useEffect, useState, useRef } from "react";

const CORRECT_PASSWORD = "14344";

const SECRET_PARAGRAPHS = [
`If you're reading this, something is heavy right now.

I'm not going to ask what. You don't have to name it, explain it,
or make it make sense to anyone including me. The weight is real
whether or not it has a clean reason. I already know something is
wrong. Not because I'm watching. Because I know you. Quietly.
More than I ever said out loud while I had the chance.`,

`Here's what I actually know about you when things fall apart.

You go inside. Not outward, not loudly, just inward. You take the
whole thing on yourself. Every piece of whatever broke. You hold
it like it must be your fault because that's the pattern you've
lived long enough to believe without questioning it. People have
left you without reasons you could name. And when someone leaves
without a reason the only explanation your brain offers at 2am is
you.

I need you to sit with what I'm about to say.

That explanation. The one your brain gives you when it's quiet and
dark and everything feels like evidence against you. It's not true.
It was never true. It's a story you inherited from people who
didn't know how to stay and it has nothing to do with who you
actually are.

You are not the reason people don't stay.

Read that again if you need to. I mean it exactly as I wrote it.`,

`I know what your not-okay actually looks like.

It's quieter than people expect. It's carrying all of it internally
while reaching outward at the same time. It's the anxiety that
sits in your chest before it shows on your face. It's the cigarette.
The calls. The way you go through the entire thing alone in your
head while simultaneously needing someone to just. Be there.
Without you having to ask twice. Without you having to justify
the asking.

You shouldn't have to ask twice.

Not with me. Not with anyone who actually sees you.`,

`Here's the thing I've been holding for a while and never said
properly. The thing that lives at the actual center of all of this.

I thought this would end up like everything else for me. I genuinely
did. I know my own patterns well enough to recognize when something
is temporary and I was ready for temporary. Comfortable with it,
even. It felt safe to keep it in that category.

And then I watched you with people.

Not with me. With people. The way you show up for them specifically.
The effort you put in. The detail of how you care. You give people
versions of yourself that cost something real and you give it
without tallying. Without a scoreboard. Without waiting to be paid
back in equal measure. You just give it because that's how you love
and you love like that quietly like it's the most normal thing in
the world when it is actually one of the rarest things I have
ever been close enough to watch.

I wasn't prepared for that.

I love you.

Not as a declaration that needs a response. Not as something I'm
saying because this is the part of the letter where it belongs.
As a fact. A quiet, honest, already existing fact that doesn't
need your approval or your reciprocation or even your belief in
it to be completely true. I love the specific way you are with
people who need you. I love the version of you that tries even
when she's running on empty. I love the you that exists when
nobody's watching and you're just being yourself without performing
any of it for anyone. That version. The unguarded one. The one
you don't show easily. That one got me in a way I wasn't expecting
and wasn't ready for and didn't know what to do with for a long
time.

Now I'm telling you. Because you deserve to know.
Because sitting on it any longer felt wrong.`,

`Nobody tells you enough that the instinct you have to absorb
everything is a wound, not a strength.

You built it because you had to. Somewhere along the way you
learned that needing people openly was too risky. That carrying
it yourself was safer. That asking for help was the thing that
made people uncomfortable enough to eventually go quiet and
then eventually go. So you stopped asking. You got very good
at holding things alone and calling it independence when really
it was just protection that hardened into habit.

You're allowed to put it down. 

Not forever. Just tonight. Just for right now.

You're allowed to need something without it meaning you're
too much. You're allowed to fall apart without it meaning
you're broken. You're allowed to not be okay without it
meaning this is how it stays.`,

`Whatever today is.

Whatever broke or hurt or collapsed without warning. Whatever
was said or wasn't said. Whatever happened between us or happened
completely outside of us. Whatever it is that brought you here
to this specific page on this specific night. I want you to
know one thing that is true regardless of every other variable.

You are loved by someone who did not expect to love you.

Someone who thought he had his patterns figured out. Who thought
he knew exactly how this kind of thing went. Who was wrong.
Quietly, completely, irreversibly wrong. And who is grateful
for that.

You made me pay attention to small things. Specific things.
The kind of things most people walk past. That's not a small
gift. That's actually everything.`,

`Rest now.

Not fix. Not explain. Not perform recovery for anyone including
yourself. Just rest. Let tonight be what it is. Let yourself
be exactly as not-okay as you actually are without adding the
weight of needing to be better by morning.

I'm not going anywhere.

Not a dramatic promise. Not a forever declaration wrapped in
conditions. Just the present truth, stated plainly, because
you deserve plain truth more than you deserve beautiful lies.

I'm not going anywhere.

Take your time. Do it your way. And when you're ready to
breathe again. I'll be here.

That's the whole thing.
That's everything I've been holding.

Now you have it.`
];

export default function VaultPage() {
  const router = useRouter();
  const { auth } = router.query;

  const [allowed, setAllowed] = useState(false);
  const [pw, setPw] = useState("");
  const [isError, setIsError] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // For the fade-in effect on paragraphs
  const [visibleParagraphs, setVisibleParagraphs] = useState(0);

  useEffect(() => {
    if (String(auth) === "1") {
       setAllowed(true);
       startFadeSequence();
    }
  }, [auth]);

  const startFadeSequence = () => {
    // Reveal paragraphs slowly one by one
    let count = 0;
    const interval = setInterval(() => {
      count += 1;
      setVisibleParagraphs(count);
      if (count >= SECRET_PARAGRAPHS.length) clearInterval(interval);
    }, 4500); // Wait 4.5s between each block appearing to let her read
  };

  function tryUnlock(e) {
    if (e) e.preventDefault();
    if (pw === CORRECT_PASSWORD) {
      setIsError(false);
      setIsTransitioning(true); // Initiate the 1-second Rose Cream bleed
      setTimeout(() => {
        setAllowed(true);
        setIsTransitioning(false);
        startFadeSequence();
        setPw("");
      }, 1000);
    } else {
      setIsError(true);
      setPw("");
      setTimeout(() => setIsError(false), 500); // 0.5s cold pulse error
    }
  }

  // --- PASSWORD SCREEN ---
  if (!allowed) {
    return (
      <div className={`vault-auth-screen ${isTransitioning ? "rose-bleed" : ""}`}>
        <style dangerouslySetInnerHTML={{__html: `
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap');
          
          body, html { margin: 0; padding: 0; overflow: hidden; background: #5A2F3A; }
          .site-header, .spotify-widget-container, .animated-bg { display: none !important; }
          
          .vault-auth-screen {
            position: fixed; inset: 0;
            background: #5A2F3A; /* Midnight Wine */
            display: flex; align-items: center; justify-content: center;
            overflow: hidden;
            transition: background 1s ease;
            z-index: 99999;
          }
          
          /* Paper grain texture */
          .vault-auth-screen::before {
            content: ""; position: absolute; inset: 0;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
            pointer-events: none; mix-blend-mode: multiply;
          }

          .rose-bleed {
            background: #F6C6D0 !important; /* Rose Cream */
          }

          .pw-input {
            background: transparent;
            border: none;
            border-bottom: 1px solid rgba(252, 228, 236, 0.1);
            color: #FCE4EC;
            font-family: 'Cormorant Garamond', serif;
            font-size: 24px;
            text-align: center;
            width: 80px;
            outline: none;
            padding: 8px 0;
            letter-spacing: 4px;
            transition: all 0.3s ease;
          }
          
          .pw-input.error {
             border-bottom: 2px solid #9B5E72; /* Lover's Plum */
             color: #9B5E72;
          }
        `}} />
        
        <form onSubmit={tryUnlock} style={{ position: "relative", zIndex: 10 }}>
          <input
            className={`pw-input ${isError ? "error" : ""}`}
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoFocus
            spellCheck="false"
          />
        </form>
      </div>
    );
  }

  // --- THE LETTER SCREEN ---
  return (
    <div className="vault-letter-screen">
       <style dangerouslySetInnerHTML={{__html: `
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap');
          
          body, html { background: #1E0F17 !important; margin: 0; padding: 0; scrollbar-width: none; }
          body::-webkit-scrollbar { display: none; }
          .site-header, .spotify-widget-container, .animated-bg { display: none !important; }

          .vault-letter-screen {
             min-height: 100vh;
             background: #1E0F17;
             display: flex; justify-content: center;
             padding: 120px 24px;
             animation: fadeDeepIn 2s ease forwards;
             font-family: 'Cormorant Garamond', serif;
             font-weight: 400;
             color: rgba(252, 228, 236, 0.85); /* Blush Petal 85% */
             font-size: 19px;
             line-height: 1.9;
          }

          @keyframes fadeDeepIn { 0% { opacity: 0; } 100% { opacity: 1; } }
          
          .letter-container {
             max-width: 580px;
             width: 100%;
          }

          .letter-block {
             opacity: 0;
             transform: translateY(20px);
             animation: blockFade 3s ease forwards;
             margin-bottom: 40px;
             white-space: pre-wrap;
          }
          
          @keyframes blockFade {
             to { opacity: 1; transform: translateY(0); }
          }

          .letter-divider {
            text-align: center;
            color: #D19AAE; /* Vintage Mauve */
            letter-spacing: 12px;
            font-weight: 300;
            margin: 60px 0;
            opacity: 0.6;
          }

          .letter-signature {
            color: #9B5E72; /* Lover's Plum */
            font-size: 17px;
            margin-top: 80px;
            margin-bottom: 100px;
            opacity: 0;
            animation: blockFade 3s ease forwards;
          }
       `}} />

       <div className="letter-container">
          {SECRET_PARAGRAPHS.map((para, idx) => (
             visibleParagraphs > idx && (
                <React.Fragment key={idx}>
                   {idx > 0 && <div className="letter-divider">---</div>}
                   <div className="letter-block">{para}</div>
                </React.Fragment>
             )
          ))}

          {visibleParagraphs >= SECRET_PARAGRAPHS.length && (
            <div className="letter-signature">— Asif</div>
          )}
       </div>
    </div>
  );
}