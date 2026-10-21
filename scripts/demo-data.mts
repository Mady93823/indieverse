/**
 * Fills the site with demo songs so there is something to look at while building.
 * The songs, lyrics and artists are all made up for this demo.
 *
 *   npm run demo:add      add the demo songs (running it again resets them)
 *   npm run demo:remove   delete them again, e.g. before going live
 *
 * Demo songs are recognised by their generated cover file, so songs you add yourself
 * are never changed or deleted, even if one has the same title as a demo song.
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { slugify } from "../src/lib/slug";
import { normalizeLyrics } from "../src/lib/songs/schema";
import type { CreditRole } from "../src/generated/prisma/client";

if (existsSync(".env")) process.loadEnvFile(".env");

const { db } = await import("../src/lib/db");

// Same folder the app uses (src/lib/uploads.ts).
const COVERS_DIR = path.join(path.resolve(process.env.UPLOAD_DIR || "uploads"), "covers");
const DAY = 24 * 60 * 60 * 1000;

type Motif = "rain" | "waves" | "sun" | "stars" | "rings";

type DemoSong = {
  title: string;
  titleTamil: string;
  singers: string[];
  music: string[];
  lyricists: string[];
  album?: string;
  releaseYear: number;
  status: "PUBLISHED" | "DRAFT";
  /** How long ago it was published, so "Recently added" has an order. */
  daysAgo: number;
  /** Starting view count, so "Popular" has something to rank. */
  views: number;
  cover: { from: string; to: string; motif: Motif };
  lyricsTamil: string;
  lyricsTanglish: string;
};

const DEMO_SONGS: DemoSong[] = [
  {
    title: "Mazhai Saaral",
    titleTamil: "மழைச் சாரல்",
    singers: ["Meera Krishnan"],
    music: ["Aadhi Sundar"],
    lyricists: ["Kavin Raj"],
    album: "Jannal Oram",
    releaseYear: 2024,
    status: "PUBLISHED",
    daysAgo: 2,
    views: 1840,
    cover: { from: "#1e3a8a", to: "#0ea5e9", motif: "rain" },
    lyricsTamil: `
ஜன்னல் ஓரம் மழைச் சாரல்
மெல்ல வந்து பேசுதே
உன் நினைவின் வாசம் இங்கே
காற்றில் கலந்து வீசுதே

துளி துளியாய் விழும் போது
என் இதயம் பாடுதே
நீ இல்லாத இந்த மாலை
ஏனோ நீளம் ஆகுதே

மழையே மழையே மெதுவாய் பெய்
என் கனவை நனைத்து விடு
அவள் வரும் பாதையெல்லாம்
பூக்களாக மாற்றி விடு`,
    lyricsTanglish: `
Jannal oram mazhai saaral
Mella vandhu pesudhe
Un ninaivin vaasam inge
Kaatril kalandhu veesudhe

Thuli thuliyaai vizhum podhu
En idhayam paadudhe
Nee illaadha indha maalai
Yeno neelam aagudhe

Mazhaiye mazhaiye medhuvaai pei
En kanavai nanaiththu vidu
Aval varum paadhaiyellaam
Pookkalaaga maatri vidu`,
  },
  {
    title: "Chennai Iravu",
    titleTamil: "சென்னை இரவு",
    singers: ["Kavin Raj", "Nila Varma"],
    music: ["Thendral Band"],
    lyricists: ["Kavin Raj"],
    releaseYear: 2023,
    status: "PUBLISHED",
    daysAgo: 5,
    views: 2310,
    cover: { from: "#1e1b4b", to: "#7c3aed", motif: "stars" },
    lyricsTamil: `
மெரினா காற்று மெதுவாய் வீச
நிலவும் நம்மோடு நடக்குதே
தெரு விளக்கின் மஞ்சள் ஒளியில்
நகரம் கதைகள் சொல்லுதே

ஓ சென்னை இரவே
தூங்காத உன் கண்கள்
ஓ சென்னை இரவே
எங்கள் பாடல் உன் சொந்தம்

டீ கடையில் சிரிப்புகள் கேட்க
பேருந்து ஒன்று கடந்து போக
நண்பர்களோடு இந்த நொடி
என்றும் நெஞ்சில் நிலைக்குமே`,
    lyricsTanglish: `
Marina kaatru medhuvaai veesa
Nilavum nammodu nadakkudhe
Theru vilakkin manjal oliyil
Nagaram kadhaigal solludhe

Oh Chennai iravae
Thoongaadha un kangal
Oh Chennai iravae
Engal paadal un sondham

Tea kadaiyil sirippugal ketka
Perundhu ondru kadandhu poga
Nanbargalodu indha nodi
Endrum nenjil nilaikkume`,
  },
  {
    title: "Amma",
    titleTamil: "அம்மா",
    singers: ["Selvi Arun"],
    music: ["Raghav Iyer"],
    lyricists: ["Yazhini"],
    album: "Veedu",
    releaseYear: 2022,
    status: "PUBLISHED",
    daysAgo: 9,
    views: 3120,
    cover: { from: "#9d174d", to: "#f59e0b", motif: "sun" },
    lyricsTamil: `
விடியும் முன்னே எழுந்தவளே
விளக்கை ஏற்றி சிரித்தவளே
என் பசி நான் சொல்லும் முன்னே
அறிந்து கொண்ட தெய்வமே

அம்மா அம்மா
உன் மடியே என் உலகம்
அம்மா அம்மா
உன் குரலே என் தாலாட்டு

தூரம் போனாலும் நான்
உன் நினைவில் வாழ்கிறேன்
ஒவ்வொரு வெற்றியிலும்
உன் முகம் தான் காண்கிறேன்`,
    lyricsTanglish: `
Vidiyum munne ezhundhavale
Vilakkai yetri siriththavale
En pasi naan sollum munne
Arindhu konda dheivame

Amma amma
Un madiye en ulagam
Amma amma
Un kurale en thaalaattu

Dhooram ponaalum naan
Un ninaivil vaazhgiren
Ovvoru vetriyilum
Un mugam thaan kaangiren`,
  },
  {
    title: "Kadal Alai",
    titleTamil: "கடல் அலை",
    singers: ["Aadhi Sundar"],
    music: ["Aadhi Sundar"],
    lyricists: ["Indhu Prakash"],
    album: "Uppu Kaatru",
    releaseYear: 2025,
    status: "PUBLISHED",
    daysAgo: 12,
    views: 760,
    cover: { from: "#0f766e", to: "#22d3ee", motif: "waves" },
    lyricsTamil: `
கரையைத் தேடி வரும் அலையே
ஏன் இந்த அவசரம்
மணலில் எழுதிய பெயரை
அழித்துப் போவது நியாயமா

அலையே அலையே
என்னோடு கொஞ்சம் நில்
அலையே அலையே
அவள் கதையைச் சொல்

உப்புக் காற்றில் ஒரு பாடல்
தூரத்தில் ஒரு படகு
நான் காத்திருக்கும் இந்தக் கரையில்
நீ வருவாய் ஒரு நாள்`,
    lyricsTanglish: `
Karaiyai thedi varum alaiye
Yen indha avasaram
Manalil ezhudhiya peyarai
Azhiththu povadhu niyaayamaa

Alaiye alaiye
Ennodu konjam nil
Alaiye alaiye
Aval kadhaiyai sol

Uppu kaatril oru paadal
Dhoorathil oru padagu
Naan kaaththirukkum indha karaiyil
Nee varuvaai oru naal`,
  },
  {
    title: "Nanba",
    titleTamil: "நண்பா",
    singers: ["Kural Collective"],
    music: ["Kural Collective"],
    lyricists: ["Kavin Raj"],
    releaseYear: 2024,
    status: "PUBLISHED",
    daysAgo: 15,
    views: 1290,
    cover: { from: "#b45309", to: "#facc15", motif: "rings" },
    lyricsTamil: `
பள்ளி மணி அடித்த நாள் முதல்
பக்கத்தில் நீ தான் நண்பா
சைக்கிள் சக்கரம் சுற்றிய தெருவில்
நம் கனவுகள் ஓடின நண்பா

வா நண்பா வா
வாழ்க்கை ஒரு பயணம்
வா நண்பா வா
நீ இருந்தால் போதும்

தோல்வி வந்த இரவுகளில்
தோள் கொடுத்தாய் நண்பா
வெற்றி வந்த காலை வேளையில்
முதல் சிரிப்பு உன்னுடையது`,
    lyricsTanglish: `
Palli mani adiththa naal mudhal
Pakkaththil nee thaan nanba
Cycle chakkaram sutriya theruvil
Nam kanavugal odina nanba

Vaa nanba vaa
Vaazhkkai oru payanam
Vaa nanba vaa
Nee irundhaal podhum

Tholvi vandha iravugalil
Thol koduththaai nanba
Vetri vandha kaalai velaiyil
Mudhal sirippu unnudaiyadhu`,
  },
  {
    title: "Pudhu Payanam",
    titleTamil: "புது பயணம்",
    singers: ["Nila Varma"],
    music: ["Raghav Iyer"],
    lyricists: ["Yazhini"],
    releaseYear: 2025,
    status: "PUBLISHED",
    daysAgo: 1,
    views: 430,
    cover: { from: "#166534", to: "#84cc16", motif: "sun" },
    lyricsTamil: `
ரயில் ஜன்னல் வழியே பார்த்தேன்
பச்சை வயல்கள் ஓடுதே
புது ஊரின் வாசல் நோக்கி
என் இதயம் தேடுதே

ஒரு பை நிறைய கனவுகள்
ஒரு கை நிறைய நம்பிக்கை
பயம் இல்லை இனி எனக்கு
இது என் புது பயணம்

போகும் வழியில் பூக்கும் பூக்கள்
புன்னகை தந்து போகுதே
நேற்றைய வலிகள் எல்லாம்
காற்றோடு கரைந்து போகுதே`,
    lyricsTanglish: `
Rail jannal vazhiye paarththen
Pachai vayalgal odudhe
Pudhu oorin vaasal nokki
En idhayam thedudhe

Oru pai niraiya kanavugal
Oru kai niraiya nambikkai
Bayam illai ini enakku
Idhu en pudhu payanam

Pogum vazhiyil pookkum pookkal
Punnagai thandhu pogudhe
Netraiya valigal ellaam
Kaatrodu karaindhu pogudhe`,
  },
  {
    title: "Filter Coffee",
    titleTamil: "ஃபில்டர் காபி",
    singers: ["Kavin Raj"],
    music: ["Thendral Band"],
    lyricists: ["Indhu Prakash"],
    album: "Kaalai Raagam",
    releaseYear: 2023,
    status: "PUBLISHED",
    daysAgo: 20,
    views: 2650,
    cover: { from: "#451a03", to: "#b45309", motif: "rings" },
    lyricsTamil: `
காலை ஆறு மணி அலாரம்
கண்ணைத் திறக்க மனமில்லை
அம்மா போடும் ஃபில்டர் காபி
வாசம் வந்தால் தூக்கம் இல்லை

ஃபில்டர் காபி ஃபில்டர் காபி
நுரை பொங்கும் சின்ன சந்தோஷம்
ஃபில்டர் காபி ஃபில்டர் காபி
ஒரு டம்ளரில் ஒரு உலகம்

மழை பெய்யும் மாலை நேரம்
பால்கனியில் நாமிருவர்
சூடான காபியும் கதைகளும்
போதுமே இந்த வாழ்க்கைக்கு`,
    lyricsTanglish: `
Kaalai aaru mani alaaram
Kannai thirakka manamillai
Amma podum filter coffee
Vaasam vandhaal thookkam illai

Filter coffee filter coffee
Nurai pongum chinna sandhosham
Filter coffee filter coffee
Oru tumblaril oru ulagam

Mazhai peiyum maalai neram
Balconyil naamiruvar
Soodaana coffeeyum kadhaigalum
Podhume indha vaazhkkaikku`,
  },
  {
    title: "Kanavu Kanmani",
    titleTamil: "கனவு கண்மணி",
    singers: ["Aadhi Sundar", "Meera Krishnan"],
    music: ["Raghav Iyer"],
    lyricists: ["Yazhini"],
    album: "Jannal Oram",
    releaseYear: 2024,
    status: "PUBLISHED",
    daysAgo: 25,
    views: 1980,
    cover: { from: "#831843", to: "#c084fc", motif: "stars" },
    lyricsTamil: `
கண்மணி உன் கண்கள் பேசும்
மொழி எனக்குப் புரிகிறதே
சொல்லாத வார்த்தைகள் எல்லாம்
புன்னகையில் தெரிகிறதே

கனவிலும் நீ நனவிலும் நீ
என் நாட்களின் நிறம் நீ
கனவிலும் நீ நனவிலும் நீ
என் பாடலின் சுரம் நீ

விண்மீன்கள் கூட்டம் போலே
உன் நினைவுகள் மின்னுதே
நீ அருகில் இருக்கும் வரை
இரவும் பகல் போல் ஆகுதே`,
    lyricsTanglish: `
Kanmani un kangal pesum
Mozhi enakku purigiradhe
Sollaadha vaarththaigal ellaam
Punnagaiyil therigiradhe

Kanavilum nee nanavilum nee
En naatkalin niram nee
Kanavilum nee nanavilum nee
En paadalin suram nee

Vinmeengal koottam pole
Un ninaivugal minnudhe
Nee arugil irukkum varai
Iravum pagal pol aagudhe`,
  },
  {
    title: "Oor Thiruvizha",
    titleTamil: "ஊர் திருவிழா",
    singers: ["Selvi Arun", "Kural Collective"],
    music: ["Kural Collective"],
    lyricists: ["Indhu Prakash"],
    releaseYear: 2022,
    status: "PUBLISHED",
    daysAgo: 32,
    views: 980,
    cover: { from: "#9a3412", to: "#f43f5e", motif: "stars" },
    lyricsTamil: `
பறை சத்தம் கேட்குது பாரு
ஊரே இன்று கூடுது பாரு
கோவில் வாசல் தோரணம் கட்டி
வண்ண விளக்கு மின்னுது பாரு

ஆடு ஆடு திருவிழா
பாடு பாடு திருவிழா
மனசு எல்லாம் மகிழ்ச்சி பொங்க
எங்க ஊரு திருவிழா

ராட்டினம் சுற்றும் குழந்தைகள்
பலூன் விற்கும் தாத்தா
மல்லிகைப் பூ வாசத்தோடு
இரவு முழுதும் கொண்டாட்டம்`,
    lyricsTanglish: `
Parai saththam ketkudhu paaru
Oore indru koodudhu paaru
Kovil vaasal thoranam katti
Vanna vilakku minnudhu paaru

Aadu aadu thiruvizha
Paadu paadu thiruvizha
Manasu ellaam magizhchi ponga
Enga ooru thiruvizha

Raattinam sutrum kuzhandhaigal
Balloon virkkum thaaththaa
Malligai poo vaasaththodu
Iravu muzhudhum kondaattam`,
  },
  {
    title: "Vidiyal",
    titleTamil: "விடியல்",
    singers: ["Meera Krishnan"],
    music: ["Aadhi Sundar"],
    lyricists: ["Kavin Raj"],
    album: "Uppu Kaatru",
    releaseYear: 2025,
    status: "PUBLISHED",
    daysAgo: 40,
    views: 150,
    cover: { from: "#7c2d12", to: "#fbbf24", motif: "sun" },
    lyricsTamil: `
இருள் நீண்ட இரவு முடியும்
கிழக்கே ஒரு ஒளி தோன்றும்
கண்ணீர் துளிகள் காய்ந்த பின்னே
புது கனவு ஒன்று பூக்கும்

விடியல் வரும் விடியல் வரும்
நம்பிக்கை கொள் நெஞ்சே
விடியல் வரும் விடியல் வரும்
நாளை நமதே

விழுந்த இடத்தில் எழுந்து நின்று
மீண்டும் நடப்போம் வா
வானம் கூட தொடும் தூரம் தான்
சிறகை விரிப்போம் வா`,
    lyricsTanglish: `
Irul neenda iravu mudiyum
Kizhakke oru oli thondrum
Kanneer thuligal kaayndha pinne
Pudhu kanavu ondru pookkum

Vidiyal varum vidiyal varum
Nambikkai kol nenje
Vidiyal varum vidiyal varum
Naalai namadhe

Vizhundha idaththil ezhundhu nindru
Meendum nadappom vaa
Vaanam kooda thodum dhooram thaan
Siragai virippom vaa`,
  },
  // Two unfinished drafts, to show how drafts look in the admin.
  {
    title: "Megam",
    titleTamil: "மேகம்",
    singers: ["Nila Varma"],
    music: [],
    lyricists: [],
    releaseYear: 2026,
    status: "DRAFT",
    daysAgo: 0,
    views: 0,
    cover: { from: "#334155", to: "#94a3b8", motif: "rain" },
    lyricsTamil: `
மேகம் ஒன்று மெதுவாய் நகர
நிழல் ஒன்று என்னைத் தொடர`,
    lyricsTanglish: "",
  },
  {
    title: "Thaai Mann",
    titleTamil: "தாய் மண்",
    singers: ["Selvi Arun"],
    music: ["Raghav Iyer"],
    lyricists: [],
    releaseYear: 2026,
    status: "DRAFT",
    daysAgo: 0,
    views: 0,
    cover: { from: "#3f6212", to: "#a3e635", motif: "waves" },
    lyricsTamil: "",
    lyricsTanglish: "",
  },
];

/** A fixed file name per demo song (UUID-shaped, like real uploads) that marks the song as demo data. */
function demoCoverPath(slug: string) {
  const h = createHash("sha256").update(`indieverse-demo:${slug}`).digest("hex");
  const name = `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}.webp`;
  return { file: path.join(COVERS_DIR, name), url: `/uploads/covers/${name}` };
}

/** Small seeded random generator, so each song's cover looks the same every time. */
function random(seed: string) {
  let state = createHash("sha256").update(seed).digest().readUInt32LE(0);
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function escapeXml(text: string) {
  return text.replace(/[<>&"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function motifShapes(motif: Motif, rand: () => number) {
  const range = (n: number, f: (i: number) => string) => Array.from({ length: n }, (_, i) => f(i)).join("");
  switch (motif) {
    case "rain":
      return range(60, () => {
        const x = rand() * 900 - 50;
        const y = rand() * 700 - 100;
        const len = 40 + rand() * 80;
        return `<line x1="${x}" y1="${y}" x2="${x - len * 0.35}" y2="${y + len}" stroke="#fff" stroke-opacity="${0.15 + rand() * 0.35}" stroke-width="${2 + rand() * 3}" stroke-linecap="round"/>`;
      });
    case "waves":
      return range(5, (i) => {
        const y = 300 + i * 70;
        return `<path d="M0 ${y} Q 100 ${y - 40} 200 ${y} T 400 ${y} T 600 ${y} T 800 ${y} V 800 H 0 Z" fill="#fff" fill-opacity="${0.08 + i * 0.03}"/>`;
      });
    case "sun":
      return `<circle cx="560" cy="250" r="170" fill="#fff" fill-opacity="0.28"/>
        <circle cx="560" cy="250" r="110" fill="#fff" fill-opacity="0.35"/>
        ${range(4, (i) => `<rect x="0" y="${470 + i * 34}" width="800" height="${10 + i * 4}" fill="#fff" fill-opacity="${0.1 + i * 0.04}"/>`)}`;
    case "stars":
      return `<mask id="crescent">
          <circle cx="590" cy="190" r="90" fill="#fff"/><circle cx="630" cy="160" r="85" fill="#000"/>
        </mask>
        <circle cx="590" cy="190" r="90" fill="#fff" fill-opacity="0.85" mask="url(#crescent)"/>
        ${range(70, () => `<circle cx="${rand() * 800}" cy="${rand() * 560}" r="${0.8 + rand() * 2.6}" fill="#fff" fill-opacity="${0.3 + rand() * 0.6}"/>`)}`;
    case "rings":
      return range(9, (i) => `<circle cx="400" cy="320" r="${40 + i * 34}" fill="none" stroke="#fff" stroke-opacity="${0.42 - i * 0.04}" stroke-width="${i % 3 === 0 ? 10 : 4}"/>`);
  }
}

function coverSvg(song: DemoSong, slug: string) {
  const { from, to, motif } = song.cover;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>
      </linearGradient>
      <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.45"/>
      </linearGradient>
    </defs>
    <rect width="800" height="800" fill="url(#bg)"/>
    ${motifShapes(motif, random(slug))}
    <rect width="800" height="800" fill="url(#shade)"/>
    <text x="56" y="664" font-family="Ubuntu, 'DejaVu Sans', sans-serif" font-size="66" font-weight="700" fill="#fff">${escapeXml(song.title)}</text>
    <text x="58" y="732" font-family="'Noto Sans Tamil', sans-serif" font-size="40" fill="#fff" fill-opacity="0.88">${escapeXml(song.titleTamil)}</text>
  </svg>`;
}

/** Songs added with this script, i.e. those still using their generated demo cover. */
async function findDemoSong(slug: string) {
  const song = await db.song.findUnique({ where: { slug }, select: { id: true, coverImage: true } });
  return { song, isDemo: !!song && song.coverImage === demoCoverPath(slug).url };
}

async function addDemoSongs() {
  await mkdir(COVERS_DIR, { recursive: true });
  let added = 0;

  for (const demo of DEMO_SONGS) {
    const slug = slugify(demo.title);
    const { song, isDemo } = await findDemoSong(slug);
    if (song && !isDemo) {
      console.log(`  skipped "${demo.title}": one of your own songs already uses /songs/${slug}`);
      continue;
    }

    const cover = demoCoverPath(slug);
    await writeFile(cover.file, await sharp(Buffer.from(coverSvg(demo, slug))).webp({ quality: 82 }).toBuffer());

    const data = {
      title: demo.title,
      titleTamil: demo.titleTamil,
      album: demo.album ?? null,
      releaseYear: demo.releaseYear,
      youtubeUrl: null,
      spotifyUrl: null,
      coverImage: cover.url,
      lyricsTamil: normalizeLyrics(demo.lyricsTamil),
      lyricsTanglish: normalizeLyrics(demo.lyricsTanglish),
      status: demo.status,
      views: demo.views,
      publishedAt: demo.status === "PUBLISHED" ? new Date(Date.now() - demo.daysAgo * DAY) : null,
    };

    await db.$transaction(async (tx) => {
      const saved = await tx.song.upsert({ where: { slug }, update: data, create: { slug, ...data } });
      await tx.songCredit.deleteMany({ where: { songId: saved.id } });
      const roles: [CreditRole, string[]][] = [
        ["SINGER", demo.singers],
        ["MUSIC", demo.music],
        ["LYRICS", demo.lyricists],
      ];
      for (const [role, names] of roles) {
        for (const [position, name] of names.entries()) {
          const artistSlug = slugify(name);
          const artist = await tx.artist.upsert({
            where: { slug: artistSlug },
            update: {},
            create: { name, slug: artistSlug },
          });
          await tx.songCredit.create({ data: { songId: saved.id, artistId: artist.id, role, position } });
        }
      }
    });
    added++;
  }
  console.log(`Added ${added} demo songs (${DEMO_SONGS.filter((s) => s.status === "DRAFT").length} of them drafts).`);
}

async function removeDemoSongs() {
  let removed = 0;
  for (const demo of DEMO_SONGS) {
    const slug = slugify(demo.title);
    const { song, isDemo } = await findDemoSong(slug);
    if (song && isDemo) {
      await db.song.delete({ where: { id: song.id } });
      removed++;
    } else if (song) {
      console.log(`  kept "${demo.title}": it's one of your own songs (or a demo song you gave a new cover)`);
    }
    await unlink(demoCoverPath(slug).file).catch(() => {});
  }
  // Artists only exist through songs; drop the demo artists that no longer have any.
  const artists = await db.artist.deleteMany({ where: { credits: { none: {} } } });
  console.log(`Removed ${removed} demo songs and ${artists.count} artists left without songs.`);
}

try {
  if (process.argv.includes("--remove")) await removeDemoSongs();
  else await addDemoSongs();
  // The script changes the database directly, so the running site's cache doesn't know yet.
  console.log(
    "If the site is running, restart `npm run dev` to see the change." +
      " For a production server, run `npm run build` and restart it.",
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
