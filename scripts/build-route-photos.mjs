#!/usr/bin/env node
/**
 * Builds src/data/routePhotos.ts: one freely licensed Wikimedia Commons photo per editorial route that has no photo yet.
 * For each route a landmark's Wikipedia article gives the lead image; Commons gives its licence and author.
 * Only CC0, CC BY, CC BY-SA and public-domain files are kept, with the credit text the licence asks for.
 * Run: node scripts/build-route-photos.mjs   (the app never calls these services; the URLs point at Commons thumbnails)
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const UA = 'atls-app-data-build/1.0 (contact: emirhancob4n@gmail.com)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const LANDMARKS = {
  DE: 'Neuschwanstein Castle', GB: 'Edinburgh Castle', NL: 'Giethoorn', AT: 'Hallstatt', CZ: 'Český Krumlov',
  HU: 'Hungarian Parliament Building', PL: 'Main Square, Kraków', HR: 'Walls of Dubrovnik', IS: 'Gullfoss',
  NO: 'Geirangerfjord', SE: 'Gamla stan', DK: 'Nyhavn', IE: 'Cliffs of Moher', BE: 'Grand-Place',
  FI: ['Helsinki Cathedral', 'Suomenlinna', 'Rovaniemi'], RO: 'Bran Castle', BG: 'Rila Monastery', ME: 'Bay of Kotor', CY: 'Paphos',
  MT: 'Valletta', CN: 'Mutianyu', KR: 'Bukchon Hanok Village', VN: 'Hạ Long Bay', ID: 'Borobudur', MY: ['Petronas Towers', 'Batu Caves', 'Kuala Lumpur'],
  SG: 'Gardens by the Bay', IN: 'Taj Mahal', NP: 'Boudhanath', LK: 'Sigiriya', AE: 'Burj Khalifa',
  JO: 'Petra', UZ: 'Registan', AZ: 'Baku', MV: ['Maldives', 'Malé', 'Baa Atoll', 'Addu Atoll'], KH: 'Angkor Wat', PH: 'El Nido, Palawan',
  ZA: 'Table Mountain', KE: 'Maasai Mara', TZ: ['Serengeti', 'Mount Kilimanjaro', 'Zanzibar'], TN: 'Sidi Bou Said', AU: 'Sydney Opera House',
  NZ: 'Milford Sound', CO: 'Cartagena, Colombia', CL: 'Torres del Paine National Park', CU: ['Old Havana', 'El Capitolio', 'Havana'],
  CR: 'Arenal Volcano', EC: 'Galápagos Islands',

  AF: ['Band-e Amir', 'Blue Mosque, Mazar-i-Sharif'], AL: ['Berat', 'Gjirokastër'], DZ: ['Casbah of Algiers', 'Tassili n\'Ajjer'],
  AD: ['Andorra la Vella', 'Madriu-Perafita-Claror Valley'], AO: ['Kalandula Falls', 'Luanda'], AG: ['Nelson\'s Dockyard', 'Antigua and Barbuda'],
  AM: ['Tatev Monastery', 'Khor Virap', 'Yerevan'], BS: ['Nassau, Bahamas', 'Exuma'], BH: ['Bahrain Fort', 'Manama'],
  BD: ['Sundarbans', 'Lalbagh Fort', 'Dhaka'], BB: ['Bridgetown', 'Barbados'], BY: ['Mir Castle Complex', 'Nesvizh Castle', 'Minsk'],
  BZ: ['Great Blue Hole', 'Caracol'], BJ: ['Ganvie', 'Royal Palaces of Abomey'], BT: ['Paro Taktsang', 'Punakha Dzong'],
  BO: ['Salar de Uyuni', 'Lake Titicaca', 'La Paz'], BA: ['Stari Most', 'Mostar'], BW: ['Okavango Delta', 'Chobe National Park'],
  BN: ['Omar Ali Saifuddien Mosque', 'Bandar Seri Begawan'], BF: ['Ouagadougou', 'Ruins of Loropéni'], BI: ['Karera Falls', 'Rusizi National Park', 'Gitega'],
  CV: ['Cidade Velha', 'Santo Antão, Cape Verde', 'Cape Verde'], CM: ['Mount Cameroon', 'Waza National Park'], CF: ['Dzanga-Sangha Special Reserve', 'Bangui'],
  TD: ['Lakes of Ounianga', 'Zakouma National Park'], KM: ['Mount Karthala', 'Moroni, Comoros'], CG: ['Odzala-Kokoua National Park', 'Brazzaville'],
  CD: ['Virunga National Park', 'Kinshasa'], CI: ['Basilica of Our Lady of Peace of Yamoussoukro', 'Abidjan'], DJ: ['Lake Assal (Djibouti)', 'Lac Abbe'],
  DM: ['Boiling Lake', 'Morne Trois Pitons National Park'], DO: ['Zona Colonial', 'Los Haitises National Park', 'Samaná Peninsula', 'Santo Domingo'], SV: ['Santa Ana Volcano', 'El Salvador'],
  GQ: ['Pico Basile', 'Cathedral of Malabo', 'Bioko'], ER: ['Massawa', 'Asmara', 'Dahlak Archipelago'], EE: ['Tallinn Old Town', 'Tallinn'], SZ: ['Mlilwane Wildlife Sanctuary', 'Eswatini'],
  ET: ['Lalibela', 'Simien Mountains National Park'], FJ: ['Mamanuca Islands', 'Yasawa Islands', 'Fiji', 'Suva'], GA: ['Loango National Park', 'Libreville'],
  GM: ['Kunta Kinteh Island', 'Banjul'], GH: ['Cape Coast Castle', 'Accra'], GD: ['Grand Anse Beach', 'St. George\'s, Grenada'],
  GT: ['Tikal', 'Antigua Guatemala', 'Lake Atitlán'], GN: ['Mount Nimba', 'Conakry'], GW: ['Bijagós Archipelago', 'Bissau'],
  GY: ['Kaieteur Falls', 'Georgetown, Guyana'], HT: ['Citadelle Laferrière', 'Haiti'], HN: ['Copán', 'Roatán'],
  IR: ['Naqsh-e Jahan Square', 'Persepolis', 'Isfahan'], IQ: ['Ziggurat of Ur', 'Babylon', 'Erbil Citadel'], IL: ['Old City (Jerusalem)', 'Masada', 'Tel Aviv'],
  JM: ['Dunn\'s River Falls', 'Blue Mountains (Jamaica)', 'Jamaica'], KP: ['Pyongyang', 'Arch of Reunification'], KZ: ['Charyn Canyon', 'Bayterek Tower', 'Astana'],
  KI: ['Kiritimati', 'Tarawa', 'Kiribati'], KW: ['Kuwait Towers', 'Kuwait City'], KG: ['Issyk-Kul', 'Ala Archa National Park', 'Song-Kul'],
  LA: ['Kuang Si Falls', 'Luang Prabang', 'Vientiane'], LV: ['Riga', 'Turaida Castle'], LB: ['Baalbek', 'Byblos', 'Jeita Grotto'],
  LS: ['Maletsunyane Falls', 'Maseru'], LR: ['Monrovia', 'Sapo National Park'], LY: ['Leptis Magna', 'Sabratha', 'Ghadames'],
  LI: ['Vaduz Castle', 'Vaduz'], LT: ['Trakai Island Castle', 'Hill of Crosses', 'Vilnius'], LU: ['Luxembourg City', 'Bock Casemates'],
  MG: ['Avenue of the Baobabs', 'Tsingy de Bemaraha Strict Nature Reserve'], MW: ['Mulanje Massif', 'Liwonde National Park', 'Lake Malawi National Park'], ML: ['Great Mosque of Djenné', 'Timbuktu'],
  MH: ['Majuro', 'Bikini Atoll'], MR: ['Chinguetti', 'Nouakchott', 'Ouadane', 'Banc d\'Arguin National Park'], MU: ['Le Morne Brabant', 'Chamarel'],
  FM: ['Nan Madol', 'Pohnpei'], MD: ['Orheiul Vechi', 'Chișinău'], MC: ['Monte Carlo Casino', 'Monaco'],
  MN: ['Gorkhi-Terelj National Park', 'Genghis Khan Equestrian Statue', 'Ulaanbaatar'], MZ: ['Island of Mozambique', 'Bazaruto Archipelago'],
  MM: ['Bagan', 'Shwedagon Pagoda', 'Inle Lake'], NA: ['Sossusvlei', 'Etosha National Park'], NR: ['Buada Lagoon', 'Command Ridge', 'Anibare Bay'],
  NI: ['Granada, Nicaragua', 'León, Nicaragua'], NE: ['Grand Mosque of Agadez', 'Aïr Mountains', 'Niamey'], NG: ['Zuma Rock', 'Lagos'], MK: ['Lake Ohrid', 'Skopje'],
  OM: ['Sultan Qaboos Grand Mosque', 'Wahiba Sands', 'Muscat'], PK: ['Badshahi Mosque', 'Hunza Valley', 'Faisal Mosque'],
  PW: ['Rock Islands Southern Lagoon', 'Palau', 'Koror'], PS: ['Church of the Nativity', 'Dome of the Rock', 'Bethlehem'],
  PA: ['Panama Viejo', 'Metropolitan Cathedral, Panama City', 'Biomuseo', 'Panama City'], PG: ['Port Moresby', 'Kokoda Track', 'Papua New Guinea'], PY: ['Jesuit Missions of La Santísima Trinidad de Paraná', 'Asunción'],
  QA: ['Museum of Islamic Art, Doha', 'Doha', 'Souq Waqif'], RU: ['Saint Basil\'s Cathedral', 'Red Square', 'Hermitage Museum'],
  RW: ['Volcanoes National Park', 'Kigali'], KN: ['Brimstone Hill Fortress National Park', 'Basseterre'], LC: ['Pitons', 'Castries'],
  VC: ['Kingstown, Saint Vincent and the Grenadines', 'La Soufrière (Saint Vincent)'], WS: ['To Sua Ocean Trench', 'Lalomanu', 'Upolu', 'Samoa'],
  SM: ['Guaita', 'Three Towers of San Marino', 'San Marino'], ST: ['São Tomé', 'Pico Cão Grande'], SA: ['Al-Ula', 'Masjid al-Haram', 'Riyadh'],
  SN: ['Île de Gorée', 'Lake Retba', 'Dakar'], RS: ['Belgrade Fortress', 'Belgrade', 'Novi Sad'], SC: ['Anse Source d\'Argent', 'Praslin', 'La Digue', 'Mahé, Seychelles'],
  SL: ['Freetown', 'Tiwai Island'], SK: ['Bratislava Castle', 'Spiš Castle', 'Bratislava'], SI: ['Lake Bled', 'Ljubljana', 'Predjama Castle'],
  SB: ['Honiara', 'Marovo Lagoon'], SO: ['Laas Geel', 'Mogadishu'], SS: ['Juba', 'Boma National Park'], SD: ['Meroë', 'Nubian Pyramids'],
  SR: ['Central Suriname Nature Reserve', 'Paramaribo', 'Suriname'], SY: ['Palmyra', 'Krak des Chevaliers', 'Umayyad Mosque'], TW: ['Taroko National Park', 'Taipei', 'Jiufen', 'Sun Moon Lake'],
  TJ: ['Fann Mountains', 'Pamir Highway', 'Dushanbe'], TL: ['Dili', 'Cristo Rei of Dili'], TG: ['Lomé', 'Koutammakou'],
  TO: ['Nukuʻalofa', 'Tonga'], TT: ['Maracas Bay', 'Port of Spain', 'Tobago'], TM: ['Darvaza gas crater', 'Ashgabat'], TV: ['Vaitupu', 'Nanumea', 'Nukufetau', 'Funafuti Conservation Area'],
  UG: ['Bwindi Impenetrable National Park', 'Murchison Falls National Park', 'Kampala'], UA: ['Saint Sophia Cathedral, Kyiv', 'Lviv', 'Kyiv Pechersk Lavra'],
  UY: ['Colonia del Sacramento', 'Punta del Este', 'Montevideo'], VU: ['Mount Yasur', 'Port Vila'], VA: ['St. Peter\'s Basilica', 'Vatican Museums'],
  VE: ['Angel Falls', 'Mount Roraima', 'Caracas'], YE: ['Old City of Sana\'a', 'Socotra', 'Shibam'], ZM: ['Victoria Falls', 'South Luangwa National Park'],
  ZW: ['Victoria Falls', 'Great Zimbabwe', 'Hwange National Park'],
};

async function api(host, params) {
  const url = `https://${host}/w/api.php?${new URLSearchParams({ format: 'json', ...params })}`;
  for (let i = 0; i < 4; i++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.ok) return res.json();
    await sleep(3000 * (i + 1));
  }
  throw new Error(`${url} failed`);
}

const strip = (html) => html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#039;|&apos;/g, "'").replace(/\s+/g, ' ').trim();
/** File names that are flags, maps, logos, collages or vector/PNG art rather than a photograph of the place */
const NOT_A_PHOTO = /flag|map|logo|coat_of|emblem|locator|montage|collage|labell?ed|parks_|\.svg$|\.png$|\.gif$/i;
const OK_LICENCE = /^(CC0|CC[ -]BY|Public domain|PD)/i;

async function main() {
  const out = {};
  const skipped = [];
  for (const [id, titles] of Object.entries(LANDMARKS)) {
    const reasons = [];
    for (const title of [].concat(titles)) {
      try {
        const page = await api('en.wikipedia.org', { action: 'query', titles: title, prop: 'pageimages', piprop: 'name', redirects: '1' });
        const file = Object.values(page.query.pages)[0]?.pageimage;
        if (!file) throw new Error('no lead image');
        if (NOT_A_PHOTO.test(file)) throw new Error(`not a photograph: ${file}`);
        const info = await api('commons.wikimedia.org', { action: 'query', titles: `File:${file}`, prop: 'imageinfo', iiprop: 'extmetadata' });
        const meta = Object.values(info.query.pages)[0]?.imageinfo?.[0]?.extmetadata;
        const licence = meta?.LicenseShortName?.value || '';
        if (!OK_LICENCE.test(licence)) throw new Error(`licence not accepted: ${licence || 'unknown'}`);
        const artist = meta?.Artist?.value ? strip(meta.Artist.value) : '';
        out[id] = {
          url: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=960`,
          credit: [artist.slice(0, 60), licence].filter(Boolean).join(' · '),
        };
        process.stdout.write(`${id} `);
        break;
      } catch (err) {
        reasons.push(`${title}: ${err.message}`);
      }
      await sleep(250);
    }
    if (!out[id]) skipped.push(`${id} (${reasons.join(' | ')})`);
    await sleep(250);
  }
  console.log(`\nskipped: ${skipped.join('; ') || 'none'}`);

  const body = Object.entries(out)
    .map(([id, v]) => `  ${id}: { url: ${JSON.stringify(v.url)}, credit: ${JSON.stringify(v.credit)} },`)
    .join('\n');
  writeFileSync(
    join(root, 'src/data/routePhotos.ts'),
    `// GENERATED by scripts/build-route-photos.mjs on ${new Date().toISOString().slice(0, 10)}. Do not edit by hand; rerun the script.
// Photos from Wikimedia Commons under CC0, CC BY, CC BY-SA or public domain. The credit text is shown with the photo.

export interface RoutePhoto {
  url: string;
  credit: string;
}

export const ROUTE_PHOTOS: Record<string, RoutePhoto> = {
${body}
};
`
  );
  console.log(`wrote ${Object.keys(out).length} photos`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
