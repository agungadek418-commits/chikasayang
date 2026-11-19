/* =========================================================
   CONFIG TERPUSAT — ubah semua konten website di sini saja.
   Placeholder yang bisa dipakai di teks: {name} {nickname} {from} {days}
   ========================================================= */
const birthdayConfig = {
    /* ---------- Identitas ---------- */
    girlfriendName: "Luh Putu Chika Yuliani",
    nickname: "Chikuu Sayang",
    fromName: "Adek",

    /* ---------- Tanggal (format YYYY-MM-DD) ---------- */
    birthdayDate: "2026-12-18",
    relationshipDate: "2025-07-18",

    /* ---------- Hero ---------- */
    siteTitle: "Happy Birthday",
    heroEyebrow: "a little gift, made just for you",
    heroTitle: "Happy Birthday, My Favorite Person",
    heroMessage: `I hope this little corner of the internet makes you smile today.
        Every photo, every song, every word here is a piece of us —
        and I wanted you to have all of it.`,

    /* ---------- Foto Hero (5 polaroid di bagian paling atas) ---------- */
    heroPhotos: [
        "assets/photos/chiku.jpg",
        "assets/photos/chikasayang.jpg",
        "assets/photos/chikasayang2.jpg",
        "assets/photos/chikasayang3.jpg",
        "assets/photos/chikasayang4.jpg"
    ],

    /* ---------- Our Memories (section sinematik) ---------- */
    memoriesTitle: "Somewhere in my favorite memories, there's always you.",
    memoriesOverlay: "nothing can come between us",
    memoriesCaption: "on this special day, i made this for you",
    memoriesPhoto: "assets/photos/photo-6.jpg",   // poster sebelum video diputar

    /* ---------- Songs ---------- */
    vinylPhoto: "assets/music/bg.jpg",   // foto di tengah piringan hitam (kosongkan "" untuk pakai cover lagu)
    songsTitleLine1: "Songs that",
    songsTitleLine2: "Remind Me of You",
    songsSubheading: "Every song has a little piece of us.",
    // Dekorasi di sekitar piringan (tampilan mobile)
    vinylTagA: "side A",
    vinylTagB: "for {nickname}",
    vinylHintIdle: "tap the record to play",
    vinylHintPlaying: "now spinning",
    vinylMarquee: "made with love ♥ for {nickname} ♥ our songs ♥ ",

    /* ---------- Reasons (6 kartu, ikon mengikuti urutan) ---------- */
    reasonsTitle: "Reasons Why I Love You",
    reasonsSubheading: "just a few of the thousand I could write down",
    reasons: [
        { title: "Your Beautiful Smile",     text: "It's the first thing I look for in a crowded room, and the last thing I want to forget at night." },
        { title: "Your Little Habits",       text: "The tiny things you do without noticing — those are the things I'd miss the most, and love the most." },
        { title: "Your Kind Heart",          text: "You care so gently, so honestly. Being cared for by you makes me want to be a better person." },
        { title: "Your Warm Hugs",           text: "Somehow every worry gets quieter the second your arms are around me. Home feels like you." },
        { title: "Your Funny Side",          text: "You make ordinary days feel like inside jokes. I laugh harder with you than with anyone." },
        { title: "Simply Because You're You", text: "No list is long enough. I love you for everything you are — and everything you're still becoming." }
    ],

    /* ---------- Love Letter ---------- */
    letterTitle: "A Letter For You",
    letterGreeting: "Dear {nickname},",
    loveLetter: `
        Happy birthday, my favorite person.

        Thank you for being part of my life. Thank you for the quiet mornings,
        the long talks, the silly photos, and for staying beside me when things weren't easy.

        I don't say it enough, but you make everything softer, brighter, and a little more magical.
        I hope this year gives you back all the happiness you give to the people around you.

        I love you — today, tomorrow, and for every birthday after this one.
    `,
    signatureLine: "Forever yours,",
    // tanda tangan memakai fromName

    /* ---------- Gallery (minimal 15 slot) ---------- */
    galleryTitle: "Our Photo Gallery",
    gallerySubheading: "tiny pieces of us, pinned to the wall",
    photos: [
        "assets/photos/chiku7.jpg",
        "assets/photos/chiku8.jpg",
        "assets/photos/chiku9.jpg",
        "assets/photos/chiku10.jpg",
        "assets/photos/chiku11.jpg",
        "assets/photos/chiku12.jpg",
        "assets/photos/chiku13.jpg",
        "assets/photos/chiku14.jpg",
        "assets/photos/chiku15.jpg",
        "assets/photos/chiku16.jpg",
        "assets/photos/chiku17.jpg",
        "assets/photos/chiku18.jpg",
        "assets/photos/chiku19.jpg",
        "assets/photos/chiku20.jpg",
        "assets/photos/chiku1.jpg"
    ],
    // Caption untuk tiap foto (urutan sama dengan photos). Boleh dikosongkan.
    photoCaptions: [
        "the cutest pout",
        "your laugh, caught",
        "being silly as always",
        "always teasing me",
        "can't stop smiling",
        "that cute nose scrunch",
        "never a serious photo",
        "your favorite place",
        "uniform days & chubby cheeks",
        "golden hour glow",
        "I'm staring at you here",
        "sweeter than the flowers",
        "that signature duck face",
        "sunday lazy",
        "my favorite view"
    ],

    /* ---------- Video (dipakai di section Our Memories) ---------- */
    video: "assets/videos/chiku.mp4",

    /* ---------- Secret Message ---------- */
    secretButtonText: "Open My Secret Message",
    secretTitle: "For your eyes only",
    secretMessage: `
        No matter how many people I meet,
        you will always be my favorite.

        You are the best thing that ever happened to me,
        and I'm so proud to be yours.
    `,

    /* ---------- Final Surprise ---------- */
    finalEyebrow: "One More Thing...",
    finalLine: "I hope I get to celebrate a thousand more birthdays with you.",
    finalModalTitle: "Happy Birthday, {nickname}",
    finalMessage: `
        Thank you for being you.
        Today is yours, and so is my heart — now and always.

        I love you, {name}.
    `,

    /* ---------- Pesan acak (tombol Send Some Love) ---------- */
    randomMessages: [
        "You're my favorite person, always.",
        "Thinking of you, as usual.",
        "I'm so lucky it's you.",
        "Your smile is my favorite view.",
        "Every day with you is a good day.",
        "You make my world softer.",
        "Home is wherever you are.",
        "I love you more than yesterday."
    ],

    /* ---------- Open When... letters (amplop; klik = amplop terbuka + surat) ---------- */
    openWhenTitle: "Open When...",
    openWhenSubheading: "little letters for the days you need me most",
    // label = tulisan di bawah amplop, title = judul di kertas, text = isi surat (baris kosong = paragraf baru)
    openWhenLetters: [
        {
            label: "Open when you miss me",
            title: "I miss you too",
            text: `
                Close your eyes for a second.
                Wherever I am right now, I'm thinking about you too. I promise.

                Missing someone just means they matter. And you matter to me more than I know how to say.

                Look at our photos, play our songs, and hold on to this: I'm always on my way back to you.
            `
        },
        {
            label: "Open when you feel sad",
            title: "It's okay, {nickname}",
            text: `
                It's okay to not be okay today. You don't have to be strong for anyone right now.

                Cry if you need to. Rest if you need to. Eat something warm, drink some water, and let the day be slow.

                This feeling will pass, and I'll be right here when it does. You are not alone, not even for a second.
            `
        },
        {
            label: "Open when you can't sleep",
            title: "Still awake?",
            text: `
                Put your phone down for a minute and take a deep breath. In slowly, out slowly.

                Whatever your mind is chasing right now, it can wait until tomorrow. It will look smaller in the morning light.

                Think about something happy, like us. Goodnight, {nickname}. Sweet dreams. I love you.
            `
        },
        {
            label: "Open when you feel stressed",
            title: "You've got this",
            text: `
                Hey. Pause. Shoulders down, jaw loose, one slow breath.

                You don't have to do everything today. Just the next small thing, then the next one.

                I've seen how hard you work and how much you care. I'm so proud of you, and I believe in you completely.
            `
        },
        {
            label: "Open when you need a smile",
            title: "Smile, please",
            text: `
                Okay, here's your daily reminder: you are ridiculously cute.

                Remember that time we laughed so hard we couldn't breathe? Think about that one for a moment.

                There. I bet you're smiling now. Mission accomplished. Love you!
            `
        },
        {
            label: "Open when you're mad at me",
            title: "I'm sorry",
            text: `
                If you're reading this, I probably messed up. Sorry, {nickname}.

                I'd rather talk it through than stay apart, and I'd rather be kind than be right.

                Take your time. When you're ready, come find me. I'll be waiting with a hug, and probably some snacks.
            `
        }
    ],

    /* ---------- Love Coupons (bisa di-claim, tersimpan di HP-nya) ---------- */
    couponsTitle: "Love Coupons",
    couponsSubheading: "redeem anytime, no expiry date",
    couponsNote: "Tap claim, screenshot the coupon, and send it to me. I'll make it happen.",
    couponClaimMessage: "Claimed! Screenshot this and send it to {from} ♥",
    couponStamp: "Claimed",
    // icon: heart | sparkle | strawberry | cherry | cassette | camera | bear | lily | webheart | flower5
    coupons: [
        { title: "1x Dinner, My Treat",      text: "Pick any place you like. You choose, I pay.",                 icon: "strawberry" },
        { title: "1x Ten-Minute Hug",        text: "No phones, no rush. Just a very long hug.",                    icon: "heart" },
        { title: "1x Massage",               text: "Shoulders, back, or feet. Your call.",                         icon: "lily" },
        { title: "1x Movie Night, Your Pick", text: "You choose the movie, I bring the snacks. No complaints.",    icon: "camera" },
        { title: "1x Sweet Treat Run",       text: "Ice cream, boba, or anything sweet. On me.",                   icon: "cherry" },
        { title: "1x You Win an Argument",   text: "I'll admit you were right. One time only, so use it wisely.",  icon: "sparkle" },
        { title: "1x Song Dedication",       text: "A song picked (or sung, badly) just for you.",                 icon: "cassette" },
        { title: "1x Small Wish, No Questions", text: "Any small wish you have. I'll just say yes.",               icon: "bear" }
    ],

    /* ---------- Scratch Cards / Kartu Gosok (digosok pakai jari sampai foto muncul) ---------- */
    scratchTitle: "Scratch to Reveal",
    scratchSubheading: "use your finger, there's a little surprise underneath",
    scratchHint: "scratch the foil with your finger (or your mouse) ♥",
    scratchFoilText: "scratch me",
    scratchProgress: "{n} of {total} revealed",
    scratchAllDone: "You found them all, {nickname} ♥",
    scratchRevealAt: 55,   // persen area tergosok sebelum foto otomatis terbuka penuh (20–90)
    // label = tulisan sebelum digosok, caption = tulisan setelah foto muncul
    scratchCards: [
        { label: "Surprise No. 1", photo: "assets/photos/chiku7.jpg",  caption: "my favorite smile" },
        { label: "Surprise No. 2", photo: "assets/photos/chiku13.jpg", caption: "you, being you" },
        { label: "Surprise No. 3", photo: "assets/photos/chiku20.jpg", caption: "the one I'd choose again" }
    ],

    /* ---------- Music Playlist (3 lagu, file MP3 lokal) ---------- */
    musicPlaylist: [
        {
            title: "Best Part - Daniel Caesar",
            artist: "Daniel Caesar",
            cover: "assets/music/chiku2.jpg",
            src: "assets/music/bestpart.mp3"
        },
        {
            title: "Superfacial Love",
            artist: "Ruth B.",
            cover: "assets/music/music1.jpg",
            src: "assets/music/superfacial.mp3"
        },
        {
            title: "Special Song For YOU",
            artist: "I Love U So Much Sayang",
            cover: "assets/music/music2.jpg",
            src: "assets/music/song-3.mp3"
        }
    ]
};

window.birthdayConfig = birthdayConfig;