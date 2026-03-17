/* eslint-disable no-console */
/**
 * import-blog-articles.js
 *
 * Creates hand-written Pokemon blog articles directly in WordPress via REST API.
 * Requires WP_BASE_URL, WP_USER, and WP_APP_PASSWORD in your .env file.
 *
 * Usage:
 *   node scripts/import-blog-articles.js
 *
 * Each article is skipped if a post with the same slug already exists.
 */

const fs = require("fs");
const path = require("path");

const REQUIRED_ENV = ["WP_BASE_URL", "WP_USER", "WP_APP_PASSWORD"];

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const sep = trimmed.indexOf("=");
    if (sep < 1) continue;
    const key = trimmed.slice(0, sep).trim();
    if (!key || process.env[key]) continue;
    let value = trimmed.slice(sep + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function validateEnv() {
  const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(
      `Missing environment variables: ${missing.join(", ")}. Add them to .env before running.`,
    );
  }
}

function authHeader() {
  const creds = `${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`;
  return `Basic ${Buffer.from(creds).toString("base64")}`;
}

async function slugExists(baseUrl, slug) {
  const url = `${baseUrl}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&per_page=1`;
  const res = await fetch(url, {
    headers: { Authorization: authHeader() },
  });
  if (!res.ok) return false;
  const data = await res.json();
  return Array.isArray(data) && data.length > 0;
}

async function createPost(baseUrl, post) {
  const res = await fetch(`${baseUrl}/wp-json/wp/v2/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      status: "publish",
      featured_media: 0,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err}`);
  }

  return res.json();
}

// ─── Article definitions ─────────────────────────────────────────────────────

const ARTICLES = [
  {
    title: "Što su Pokémoni? Kompletni vodič za početnike",
    slug: "sto-su-pokemoni-vodic-za-pocetnike",
    excerpt:
      "Saznaj sve o Pokémon svijetu – od originalnih 151 stvorenja do moderne generacije i zašto su Pokémoni i danas popularni milijunima djece i odraslih širom svijeta.",
    content: `
<figure class="wp-block-image size-large">
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" alt="Pikachu – maskota Pokémon franšize" />
  <figcaption>Pikachu – najprepoznatljiviji Pokémon na svijetu</figcaption>
</figure>

<h2>Što su Pokémoni?</h2>
<p>Pokémoni (skraćenica od engleskog <em>Pocket Monsters</em>) su izmišljena bića iz svijeta koji je stvorio Satoshi Tajiri 1989. godine. Prvotno inspiriran kolekcijom kukaca u djetinjstvu, Tajiri je zamislio igru u kojoj igrači hvataju, treniraju i bore se s različitim stvorenjima.</p>

<p>Pokémon franšiza danas obuhvaća:</p>
<ul>
  <li>Videoigre (Game Boy, Nintendo DS, Switch i mobilne platforme)</li>
  <li>Animiranu seriju s više od 1200 epizoda</li>
  <li>Kartašku igru (Trading Card Game)</li>
  <li>Filmove, plišane igračke, figurice i ostalu robu</li>
</ul>

<h2>Kako funkcionira Pokémon svijet?</h2>
<p>U Pokémon svijetu, posebni treneri putuju po regijama kako bi hvatali Pokémone pomoću Poké kugli. Svaki Pokémon ima jedinstvene sposobnosti i tipove – vatru, vodu, travu, elektriku i još mnogo toga. Cilj je postati Pokémon prvak pobjeđujući sve Gym Leadere i Elite Four u svakoj regiji.</p>

<h2>Koliko ima Pokémona?</h2>
<p>Sa zaključkom 9. generacije postoji <strong>više od 1000 Pokémona</strong>. Svaki ima broj u Pokédexu, evoluira u snažnije forme i ima posebne statistike (HP, napad, obrana, brzina itd.).</p>

<h2>Zašto su Pokémoni toliko popularni?</h2>
<p>Kombinacija nostalgije, strategije i kolekcionar­skog nagona Pokémon drži popularnim već gotovo 30 godina. Pokémon GO (2016.) privukao je stotine milijuna igrača na mobilnim uređajima. Pokémon karte danas su dragocjene kolekcionarski predmeti čija vrijednost može doseći tisuće eura.</p>
    `.trim(),
  },

  {
    title: "Što je Pokémon TCG? Vodič za kartašku igru",
    slug: "sto-je-pokemon-tcg-vodic-za-kartasku-igru",
    excerpt:
      "Pokémon TCG (Trading Card Game) jedna je od najpopularnijih kartaških igara na svijetu. Saznaj kako se igra, koje vrste karata postoje i zašto su toliko tražene.",
    content: `
<figure class="wp-block-image size-large">
  <img src="https://images.pokemontcg.io/base1/4_hires.png" alt="Charizard Base Set karta" />
  <figcaption>Charizard iz Base Set – jedna od najčuvenijih Pokemon karata</figcaption>
</figure>

<h2>Što je Pokémon TCG?</h2>
<p>Pokémon Trading Card Game (TCG) je kartaška igra za dva igrača u kojoj svaki igrač gradi špil od 60 karata i pokušava pobijediti protivnika. Igra je lansirana 1996. u Japanu, a godinu dana kasnije i globalno. Od tada je prodano <strong>više od 45 milijardi karata</strong> diljem svijeta.</p>

<h2>Vrste karata</h2>
<ul>
  <li><strong>Pokémon karte</strong> – prikazuju Pokémone s napadima, HP-om i slabostima</li>
  <li><strong>Trener karte</strong> – Items, Podrška i Stadioni koji pomažu strategiji</li>
  <li><strong>Energija karte</strong> – potrebne za aktiviranje napada</li>
</ul>

<h2>Kako se igra?</h2>
<p>Svaki igrač vuče 7 karata, postavlja aktivnog Pokémona i do 5 u "klupu". Cilj je uzeti 6 nagradnih karata – to se postiže nokautiranjem protivnikovih Pokémona. Igra zahtijeva <strong>strategiju, poznavanje meta-decka i dobre povlačene karte</strong>.</p>

<h2>Setovi i ekspanzije</h2>
<p>Svake godine izlazi nekoliko novih TCG ekspanzija. Najvažniji stariji setovi su Base Set, Jungle i Fossil, a moderni setovi poput <em>Scarlet & Violet</em> i <em>Paldean Fates</em> donose nove EX i Tera Pokémone.</p>

<h2>Kolekcionar ili igrač?</h2>
<p>Pokémon TCG privlači dva tipa ljubitelja: kompetitivne igrače koji grade meta-decks za turnire, i kolekcionare koji traže rijetke holo i graded karte kao investicijske predmete. Obje publike osiguravaju veliku potražnju za kartama.</p>
    `.trim(),
  },

  {
    title: "Najskuplja Pokémon karta na svijetu – Top 10 rekorda",
    slug: "najskuplja-pokemon-karta-na-svijetu",
    excerpt:
      "Znaš li koliko vrijedi najskuplja Pokémon karta? Otkrijemo top 10 rekordnih prodaja i zašto neke karte dosežu cijene novih automobila – čak i stanova.",
    content: `
<figure class="wp-block-image size-large">
  <img src="https://images.pokemontcg.io/base1/4_hires.png" alt="1st Edition Charizard Pokemon karta" />
  <figcaption>1st Edition Base Set Charizard – ikona kolekcionarskog tržišta</figcaption>
</figure>

<h2>Pokémon karte kao investicija</h2>
<p>Tržište Pokémon karata eksplodiralo je 2020.–2021. kada su popularni YouTuberi i poznate osobe počeli otvarati vintage pakete na kamerama. Cijene rijetkih karata porasle su za stotine posto u kratkom roku.</p>

<h2>Top 5 najskupljih Pokémon karata</h2>

<h3>1. Pikachu Illustrator – do 5.275.000 $</h3>
<p>Ova karta distribuirana je samo pobjednicima natječaja crtanja u Japanu 1997. i 1998. Postoji svega 39 primjeraka. PSA 10 primjerak prodan je 2022. za nevjerojatnih <strong>5.275.000 USD</strong> – rekord na tržištu.</p>

<h3>2. 1st Edition Shadowless Charizard (PSA 10) – ~400.000 $</h3>
<p>Charizard iz prve naklade Base Seta bez sjene oko slike (tzv. "shadowless") u PSA 10 stanju je najtraženija "mainstream" karta. Logan Paul kupio je primjerak za <strong>150.100 USD</strong>, ali trendovi sugeriraju više cijene za savršene primjerke.</p>

<h3>3. Trophy Pikachu Trainer No. 3 – 300.000 $+</h3>
<p>Karta nagrađena najboljim trenerima na japanskim turnirima. Iznimno rijetka i gotovo nikad ne dolazi na aukciju.</p>

<h3>4. Umbreon Gold Star (PSA 10) – 70.000 $</h3>
<p>Gold Star Pokémoni prikazuju Pokémona u zlatnoj boji i iznimno su rijetki. Umbreon PSA 10 postiže iznimne cijene.</p>

<h3>5. Charizard VSTAR Rainbow (Alt Art) – 400–600 $</h3>
<p>Moderni alternativni art Charizard iz <em>Brilliant Stars</em> seta i dalje je jedan od najpopularnijih modernih kolekcionarskih primjeraka.</p>

<h2>Što određuje vrijednost karte?</h2>
<ul>
  <li><strong>Rijedkost</strong> – ograničeni printovi, promo distribucija</li>
  <li><strong>Stanje</strong> – PSA, BGS ili CGC ocjena (1–10)</li>
  <li><strong>Popularnost Pokémona</strong> – Charizard, Pikachu i Mewtwo uvijek vode</li>
  <li><strong>Generacija</strong> – Base Set i stariji setovi imaju nostalgijsku premiju</li>
</ul>
    `.trim(),
  },

  {
    title: "Gdje kupiti Pokémon karte u Hrvatskoj i online",
    slug: "gdje-kupiti-pokemon-karte-hrvatska-online",
    excerpt:
      "Tražiš Pokémon karte? Vodič za kupnju u fizičkim trgovinama, online shopovima i na platformama poput eBaya – što paziti i kako ne dati previše.",
    content: `
<figure class="wp-block-image size-large">
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png" alt="Mewtwo Pokemon karta" />
  <figcaption>Pokémon karte dostupne su na više mjesta – fizički i online</figcaption>
</figure>

<h2>Fizičke trgovine u Hrvatskoj</h2>
<p>Pokémon karte danas prodaju mnoge igraonice igara, specijalizirane fantastičke trgovine i veće knjižare. U Zagrebu, Splitu i Rijeci postoje specijalizirane radionice gdje možeš kupiti boostere, theme decks i sealed setove.</p>

<ul>
  <li>Specijalizirane game i hobby shopovi u većim gradovima</li>
  <li>Igračarnice u tržnim centrima (Müller, Smyths Toys gdje postoje)</li>
  <li>Fizički retaileri poput Konzuma i Lerstata ponekad imaju booster pakete</li>
</ul>

<h2>Online kupnja – domaće platforme</h2>
<p>Naša online prodavaonica nudi:</p>
<ul>
  <li><strong>Sealed proizvode</strong> – booster boxovi, Elite Trainer Boxevi</li>
  <li><strong>Single karte</strong> – graded i raw karte iz svih setova</li>
  <li><strong>Mystery boxovi</strong> – iznenađenje za kolekcionare</li>
</ul>
<p>Prednost kupnje kod nas je garantirana autentičnost, brza dostava unutar Hrvatske i mogućnost konzultacije pri odabiru.</p>

<h2>Međunarodne online platforme</h2>
<ul>
  <li><strong>eBay</strong> – najveća selekcija, ali pazi na prodavače s lošim feedbackom</li>
  <li><strong>TCGPlayer</strong> (SAD) – vjerodostojna platforma s dobrim ocjenom stanja</li>
  <li><strong>Card Market</strong> (Europa) – europska alternativa s niskim troškovima dostave</li>
  <li><strong>Pokemon Center</strong> – oficijalna web stranica za sealed proizvode</li>
</ul>

<h2>Na što paziti pri kupnji?</h2>
<ul>
  <li>Provjeri je li prodavač verificiran i ima li povratne recenzije</li>
  <li>Za skuplje karte traži PSA/BGS certifikat ili autentifikaciju</li>
  <li>Sealed kutije nikad ne kupuj ako nisu u originalnoj foliji</li>
  <li>Usporedi cijene na više platformi prije kupnje</li>
</ul>
    `.trim(),
  },

  {
    title: "Za koje uzraste su Pokémoni? Od djece do odraslih kolekcionara",
    slug: "za-koje-uzraste-su-pokemoni",
    excerpt:
      "Pokémoni su počeli kao igra za djecu, ali danas privlače sve uzraste. Saznaj zašto su Pokémoni prikladni za različite dobne skupine i što svaka iznosi iz iskustva.",
    content: `
<figure class="wp-block-image size-large">
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png" alt="Eevee – jedan od najpopularnijih Pokémona" />
  <figcaption>Eevee je popularan kod svih uzrasta zahvaljujući milim evolucionima</figcaption>
</figure>

<h2>Pokémoni za djecu (5–10 godina)</h2>
<p>Originalni cilj Pokémona bio je privući djecu školske dobi. Animirana serija, jednostavne videoigre i tematske igračke savršeno su prilagođeni mlađoj publici. U ovoj dobi djeca:</p>
<ul>
  <li>Prate animiranu seriju i uče nazive Pokémona</li>
  <li>Igraju početničke videoigre (Pokémon: Let's Go, Pokémon Shield)</li>
  <li>Sakupljaju kartice i plišane igračke</li>
  <li>Uče bazičnu strategiju kroz TCG starter decks</li>
</ul>

<h2>Mladenačka publika (11–17 godina)</h2>
<p>Tinejdžeri ulaze dublje u kompetitivni aspekt. Turniri u TCG-u, online Pokémon Showdown i napredni speedrun zajednice privlače ovu grupu. To je dob u kojoj mnogi počinju ozbiljno kolekcionirati.</p>

<h2>Odrasli kolekcionari (18+)</h2>
<p>Možda iznenađujuće, <strong>odrasla generacija danas je pokretač tržišta</strong>. Nostalgija za originalne 151 karten iz 90-ih, u kombinaciji s rastom vrijednosti vintage karata, privukla je ozbiljne investitore i kolekcionare. YouTube kanali poput <em>PokeRev</em> i <em>Leonhart</em> imaju milijune pretplatnika upravo zahvaljujući odrasloj publici.</p>

<h2>Zašto Pokémoni prolaze granice uzrasta?</h2>
<ul>
  <li><strong>Nostalgija</strong> – odrasli se sjećaju originalnih karata iz djetinjstva</li>
  <li><strong>Kompleksna strategija</strong> – kompetitivni TCG zahtijeva duboko razumijevanje meta-decka</li>
  <li><strong>Financijski potencijal</strong> – kolekcionar­ske karte mogu biti investicija</li>
  <li><strong>Zajednica</strong> – Pokémon organizira turnire za sve uzraste (Junior, Senior, Masters)</li>
</ul>

<h2>Zaključak</h2>
<p>Pokémoni su jedinstven fenomen koji ne poznaje dobnu granicu. Bilo da si roditelj koji kupuje dijete, tinejdžer koji gradi natjecateljski deck ili odrasli kolekcinoar koji traži PSA 10 Charizard – Pokémon ušao u tvoj život na način koji je teško opisati riječima. I to upravo čini ovaj fenomen nevjerojatnim.</p>
    `.trim(),
  },

  {
    title: "Pokémon turniej i kompetitivna scena 2025. – sve što trebaš znati",
    slug: "pokemon-turniej-kompetitivna-scena-2025",
    excerpt:
      "Kompetitivni Pokémon TCG bujao je 2024./2025. Saznaj kako se prijaviti na turnir, koji su aktualni meta-decks i koji su ti bodovi potrebni za Worlds.",
    content: `
<figure class="wp-block-image size-large">
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png" alt="Charizard – jedan od najpopularnijih kompetitivnih Pokémona" />
  <figcaption>Charizard ostaje jedna od ikona kompetitivnog Pokémon TCG-a</figcaption>
</figure>

<h2>Organizacijska struktura</h2>
<p>Kompetitivnom Pokémon scenom upravlja <strong>Play! Pokémon</strong> program koji organizira lokalne, regionalne i međunarodne turnire u kategorijama Junior (do 10 g.), Senior (11–15 g.) i Masters (16+).</p>

<p>Bodovi Championship Points (CP) skupljaju se na:</p>
<ul>
  <li><strong>League Cup</strong> – lokalni, najlakši ulaz</li>
  <li><strong>Regional Championship</strong> – veći turniri s boljom distribucijom CP bodova</li>
  <li><strong>Special Event / International Championship</strong> – Europa, Amerika, Latinska Amerika</li>
  <li><strong>Pokémon World Championship</strong> – vrh pyramid, u 2025. u Honoluluu</li>
</ul>

<h2>Aktualni meta-decks (2025.)</h2>
<p>Meta se mijenja sa svakom ekspanzijom. Na temelju zadnjih regionalnih rezultata, top tiered decks su:</p>
<ul>
  <li><strong>Charizard ex / Pidgeot ex</strong> – konzistentni deck s jakim napadima i dobrom provukom</li>
  <li><strong>Gardevoir ex</strong> – brzi spread damage i iznimno dobro u mirror matchupu</li>
  <li><strong>Roaring Moon ex</strong> – agresivni dark deck niske krivulje</li>
  <li><strong>Dragapult ex</strong> – novi trier 1 kandidat iz Twilight Masquerade</li>
</ul>

<h2>Kako se prijaviti?</h2>
<ol>
  <li>Kreiraj Pokemon Trainer Club račun na <em>pokemon.com</em></li>
  <li>Registriraj se na <em>play.pokemon.com</em> za Play! Pokémon program</li>
  <li>Pronađi lokalni turnir putem <em>Pokémon Event Locator</em></li>
  <li>Plati kotizaciju (obično 5–15 €) i dođi s deckom od 60 karata</li>
</ol>

<h2>Savjeti za početnike natjecatelje</h2>
<ul>
  <li>Počni s jednim dobro poznatim deckom umjesto eksperimentiranja</li>
  <li>Nauči pravilnik – posebno pravila o tajmeru, prize kartama i double knock-outu</li>
  <li>Preslušaj proglašene liste karata i turnirane ruke na YouTubeu</li>
  <li>Dođi rano i sudjeluj bez pritiska – iskustvo nadopunjuje teorijsko znanje</li>
</ul>
    `.trim(),
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  loadEnvFile();
  validateEnv();

  const baseUrl = process.env.WP_BASE_URL.replace(/\/$/, "");
  console.log(`\nTargeting WordPress at: ${baseUrl}\n`);

  let created = 0;
  let skipped = 0;

  for (const article of ARTICLES) {
    process.stdout.write(`Processing: "${article.title}"… `);

    try {
      const exists = await slugExists(baseUrl, article.slug);
      if (exists) {
        console.log("SKIPPED (already exists)");
        skipped++;
        continue;
      }

      const post = await createPost(baseUrl, article);
      console.log(`CREATED (id: ${post.id}, url: ${post.link})`);
      created++;
    } catch (err) {
      console.error(`ERROR: ${err.message}`);
    }
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`);
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
