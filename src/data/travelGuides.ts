// ==============================================================================
// ATLS TRAVEL GUIDE: "NE YENİR? NE GEZİLİR? GEZGİN TÜYOSU"
// Curated Authentic Travel Bites & Must-See Culture Guide (TR & EN)
// ==============================================================================

export interface CountryGuide {
  food: { tr: string; en: string };
  see: { tr: string; en: string };
  tip: { tr: string; en: string };
  tag: { tr: string; en: string };
  highlight: { tr: string; en: string };
}

export const curatedCountryGuides: Record<string, CountryGuide> = {
  IT: {
    food: {
      tr: 'Trastevere’de Cacio e Pepe & sokakta taze Antep fıstıklı Gelato',
      en: 'Authentic Cacio e Pepe in Trastevere & Artisanal Pistachio Gelato',
    },
    see: {
      tr: 'Pantheon çevresi gizli avlular & Como Gölü kıyısında vapur turu',
      en: 'Hidden courtyards around the Pantheon & Ferry cruise across Lake Como',
    },
    tip: {
      tr: 'Espresso’yu masada oturmak yerine barda ayakta iç; hem yerel adet hem de yarı fiyatına gelir!',
      en: 'Drink your espresso standing at the bar counter like locals; faster and half the price!',
    },
    tag: { tr: 'Gurme & Sanat', en: 'Food & Art' },
    highlight: { tr: 'Dolce Vita Ruhu', en: 'Dolce Vita Spirit' },
  },
  FR: {
    food: {
      tr: 'Fırından yeni çıkmış sıcak tereyağlı kruvasan & Saint-Germain’de ördek konfi',
      en: 'Crispy warm all-butter croissant & Duck confit in Saint-Germain',
    },
    see: {
      tr: 'Montmartre’ın arka merdivenleri & Seine kıyısında sahaf yürüyüşü',
      en: 'Montmartre secret stairways & Sunset stroll along the Seine bouquinistes',
    },
    tip: {
      tr: 'Restoranlarda “Une carafe d’eau, s’il vous plaît” de; ücretsiz buz gibi şık sürahi su getirirler.',
      en: 'Always ask for “Une carafe d’eau, s’il vous plaît” to get free iced tap water at any bistro.',
    },
    tag: { tr: 'Romantizm & Mimari', en: 'Romance & Architecture' },
    highlight: { tr: 'Işıklar Şehri', en: 'City of Light' },
  },
  JP: {
    food: {
      tr: 'Tokyo ara sokaklarında dumanı tüten Tonkotsu Ramen & Kyoto usulü taze Matcha tatlıları',
      en: 'Steaming rich Tonkotsu Ramen in alleyway izakayas & Kyoto matcha parfaits',
    },
    see: {
      tr: 'Fushimi Inari’de şafak vakti kızıl torii kapıları & neon ışıklı Shibuya gecesi',
      en: 'Dawn walk through Fushimi Inari vermilion gates & Neon night in Shibuya',
    },
    tip: {
      tr: 'Japonya’da bahşiş bırakmak kaba sayılır; ayrıca yürürken yemek yemek yerine dükkan önünde bitir.',
      en: 'Never tip in Japan—it is considered rude. Eat your street snack right beside the stall.',
    },
    tag: { tr: 'Gelenek & Fütürizm', en: 'Tradition & Future' },
    highlight: { tr: 'Zen & Harmoni', en: 'Zen & Harmony' },
  },
  ES: {
    food: {
      tr: 'San Sebastián barlarında taze pintxos & Valensiya usulü odun ateşinde deniz ürünlü paella',
      en: 'Gourmet pintxos in San Sebastián & Wood-fired Valencian seafood paella',
    },
    see: {
      tr: 'Barselona Gotik Mahalle labirentleri & Granada Elhamra Sarayı bahçeleri',
      en: 'Gothic Quarter labyrinth in Barcelona & Alhambra gardens in Granada',
    },
    tip: {
      tr: 'İspanyollar akşam yemeğini 21:30’dan önce yemez. Öğleden sonra “Menu del Día” sipariş et, 3 kap yemek sudan ucuzdur.',
      en: 'Dinner is after 9:30 PM. Order “Menu del Día” for lunch for incredible 3-course set menus.',
    },
    tag: { tr: 'Flamenko & Güneş', en: 'Flamenco & Sun' },
    highlight: { tr: 'Sokak Neşesi', en: 'Fiesta & Joy' },
  },
  TR: {
    food: {
      tr: 'Odun fırını çıtır Antep lahmacunu, Ege zeytinyağlıları & kaymaklı çıtır baklava',
      en: 'Crispy stone-baked Gaziantep lahmacun, Aegean mezze & buttery pistachio baklava',
    },
    see: {
      tr: 'Kapadokya gün doğumunda sıcak hava balonları & Boğaz vapurunda martılara simit atmak',
      en: 'Sunrise hot-air balloons over Cappadocia & Bosphorus ferry ride with seagulls',
    },
    tip: {
      tr: 'Kapalıçarşı’da esnafla çay içmeden pazarlık bitmez; Eminönü’nden Üsküdar’a gün batımında vapurla geç.',
      en: 'Accept apple tea when offered by shopkeepers—it is genuine hospitality, not an obligation to buy.',
    },
    tag: { tr: 'Tarih & Misafirperverlik', en: 'Heritage & Soul' },
    highlight: { tr: 'İki Kıtanın Kalbi', en: 'Bridge of Continents' },
  },
  GR: {
    food: {
      tr: 'Tavernada odun kömüründe ahtapot, süzme yoğurtlu caciki & çıtır spanakopita',
      en: 'Charcoal-grilled Aegean octopus, creamy tzatziki & flaky warm spanakopita',
    },
    see: {
      tr: 'Milos adasının ay yüzeyli beyaz kumsalları & Atina Akropolis eteklerinde Plaka sokakları',
      en: 'Lunar white rock beaches of Milos & Plaka alleys below the illuminated Acropolis',
    },
    tip: {
      tr: 'Santorini yerine feribotla Naxos veya Paros’a geç; hem üçte bir fiyata gerçek ada ruhunu yaşa.',
      en: 'Skip the Santorini crowds and take a local ferry to Naxos or Paros for authentic island magic.',
    },
    tag: { tr: 'Ege & Antik Çağ', en: 'Aegean & Antiquity' },
    highlight: { tr: 'Mavi & Beyaz Rüyası', en: 'Blue & White Dream' },
  },
  US: {
    food: {
      tr: 'Texas usulü 14 saat tütsülenmiş dana brisket & New York stili ince dilim pizza',
      en: '14-hour smoked Texas brisket & Classic foldable New York thin-crust slice',
    },
    see: {
      tr: 'Büyük Kanyon’da gün batımı & Route 66 boyunca ikonik çöl manzaraları',
      en: 'Sunset over the rim of the Grand Canyon & Neon retro route across Route 66',
    },
    tip: {
      tr: 'Ulusal parkları gezmek için tek tek bilet almak yerine 80$’lık yıllık “America the Beautiful” kartı al.',
      en: 'Visiting more than two national parks? Buy the $80 annual “America the Beautiful” pass.',
    },
    tag: { tr: 'Yol Hikayesi & Doğa', en: 'Roadtrip & Wilderness' },
    highlight: { tr: 'Geniş Ufuklar', en: 'Wide Horizons' },
  },
  GB: {
    food: {
      tr: 'Borough Market’ta çıtır fish & chips ve sıcak İngiliz etli payı (meat pie)',
      en: 'Golden crispy fish & chips at Borough Market & Traditional hearty steak pie',
    },
    see: {
      tr: 'Cotswolds bal renkli taş köyleri & Edinburgh Kalesi’ne çıkan Royal Mile sokakları',
      en: 'Honey-stone villages of the Cotswolds & Cobbled walk up Edinburgh’s Royal Mile',
    },
    tip: {
      tr: 'Londra’daki dünya çapı tüm büyük müzeler (British Museum, Tate Modern) tamamen ücretsizdir!',
      en: 'World-class museums in London (British Museum, Tate Modern, V&A) are completely free of charge.',
    },
    tag: { tr: 'Aristokrasi & Sis', en: 'Heritage & Fog' },
    highlight: { tr: 'Kraliyet Zarafeti', en: 'Royal Elegance' },
  },
  DE: {
    food: {
      tr: 'Köri soslu çıtır Berlin Currywurst, taze pretzel & çıtır patatesli şinitzel',
      en: 'Crispy Currywurst in Berlin, fresh warm salted pretzels & Viennese-style schnitzel',
    },
    see: {
      tr: 'Bavyera Neuschwanstein Masal Şatosu & Berlin Duvarı East Side Gallery açık hava müzesi',
      en: 'Neuschwanstein fairytale castle in Bavaria & Berlin Wall East Side Gallery',
    },
    tip: {
      tr: 'Pazar günleri neredeyse tüm süpermarket ve mağazalar kapalıdır; alışverişini cumartesiden bitir.',
      en: 'Almost all shops and supermarkets close on Sundays—stock up snacks on Saturday!',
    },
    tag: { tr: 'Mühendislik & Kaleler', en: 'Castles & Culture' },
    highlight: { tr: 'Tarihi Rota', en: 'Romantic Road' },
  },
  TH: {
    food: {
      tr: 'Sokak tezgahında vokta pişen Pad Thai, taze Mango Sticky Rice & Tom Yum çorbası',
      en: 'Sizzling street Pad Thai, sweet coconut mango sticky rice & spicy lemongrass Tom Yum',
    },
    see: {
      tr: 'Chiang Mai orman içi tapınakları & Krabi’de zümrüt yeşili lagün kireçtaşı kayalıkları',
      en: 'Misty rainforest temples in Chiang Mai & Emerald karst cliffs in Krabi',
    },
    tip: {
      tr: 'Tapınaklara girerken omuz ve dizlerin örtülü olması şarttır; yanına hafif bir şal almayı unutma.',
      en: 'Dress respectfully when entering temples—cover shoulders and knees, and slip off shoes.',
    },
    tag: { tr: 'Egzotik & Tropik', en: 'Exotic & Tropical' },
    highlight: { tr: 'Gülümseyen Ülke', en: 'Land of Smiles' },
  },
  PT: {
    food: {
      tr: 'Belém’de tarçınlı sıcak Pastel de Nata & Lizbon kıyısında ızgara taze sardalya',
      en: 'Warm cinnamon-dusted Pastel de Nata in Belém & Fresh grilled Atlantic sardines',
    },
    see: {
      tr: 'Sintra’nın bulutlar arasındaki masal rengi sarayları & Lizbon sarı 28 nolu nostaljik tramvay',
      en: 'Dreamlike Pena Palace in misty Sintra & Clattering ride on Lisbon’s vintage Tram 28',
    },
    tip: {
      tr: 'Porto’da şarap mahzenlerini gezmek için Gaia kıyısına gün batımında nehir tekneleriyle geç.',
      en: 'Cross the Dom Luís I bridge on foot at dusk for postcard golden hour views over Porto.',
    },
    tag: { tr: 'Okyanus & Çiniler', en: 'Ocean & Azulejos' },
    highlight: { tr: 'Atlantik Esintisi', en: 'Atlantic Breeze' },
  },
  GE: {
    food: {
      tr: 'Fırından yeni çıkmış tereyağlı ve yumurtalı Acaristan Haçapurisi & sulu Hınkal mantısı',
      en: 'Fresh oven-baked bubbling Adjarian Khachapuri & Juicy spiced Khinkali dumplings',
    },
    see: {
      tr: 'Kafkas Dağları eteğinde Kazbek Gergeti Kilisesi & Tiflis tarihi sülfür hamamları',
      en: 'Gergeti Trinity Church against Mount Kazbek & Historic sulfur bath domes in Tbilisi',
    },
    tip: {
      tr: 'Hınkalı çatalla kesme; tepesindeki hamur sapından tutup ısırarak önce içindeki sıcak çorbayı iç!',
      en: 'Never eat Khinkali with a fork! Hold the top dough knob, bite a small hole, and sip the broth first.',
    },
    tag: { tr: 'Kafkasya & Şarap', en: 'Caucasus & Wine' },
    highlight: { tr: '8000 Yıllık Bağlar', en: '8,000 Years of Wine' },
  },
  NL: {
    food: {
      tr: 'Kanal kenarında taze çıtır Stroopwafel & hardallı çıtır Bitterballen köfteleri',
      en: 'Caramel-filled warm Stroopwafel & Crispy Dutch bitterballen croquettes with mustard',
    },
    see: {
      tr: 'Jordaan mahallesinin çiçekli köprüleri & ilkbaharda Keukenhof lale tarlaları',
      en: 'Flower-draped canal bridges of Jordaan & Spring tulip carpets at Keukenhof',
    },
    tip: {
      tr: 'Asla kırmızı boyalı bisiklet yollarında yürüme; bisikletliler durmaz ve zil çalarak uyarır!',
      en: 'Never step onto red bike lanes—cyclists always have right of way and won’t stop!',
    },
    tag: { tr: 'Kanallar & Sanat', en: 'Canals & Cycling' },
    highlight: { tr: 'Özgürlük Şehri', en: 'Canal Ring Beauty' },
  },
  MX: {
    food: {
      tr: 'Tacos al Pastor, taze guacamole & Oaxaca stili çikolatalı acılı Mole sosu',
      en: 'Spit-roasted Tacos al Pastor, fresh smashed guacamole & rich Oaxacan mole',
    },
    see: {
      tr: 'Chichén Itzá Maya Piramidi & Yucatán yarımadasındaki turkuaz cenote mağara suları',
      en: 'Chichén Itzá Mayan pyramid & Swimming in secret jungle limestone cenotes',
    },
    tip: {
      tr: 'Sokak tacosu yerken en kalabalık, yerellerin sıra beklediği tezgahları tercih et.',
      en: 'Follow the locals—the street taco stand with the longest line always has the freshest meat.',
    },
    tag: { tr: 'Maya Mirası & Baharat', en: 'Maya Heritage & Spice' },
    highlight: { tr: 'Canlı Kültür', en: 'Vibrant Colors' },
  },
  CH: {
    food: {
      tr: 'Dağ kulübesinde sıcak eritme Peynir Fondüsü & çıtır patatesli Rösti',
      en: 'Bubbling Alpine Swiss cheese fondue & Crispy golden buttery Rösti',
    },
    see: {
      tr: 'Matterhorn zirvesi yansımasıyla Riffelsee gölü & Lauterbrunnen 72 şelaleli vadi',
      en: 'Mirror reflection of the Matterhorn in Lake Riffelsee & Lauterbrunnen waterfall valley',
    },
    tip: {
      tr: 'Şehir çeşmelerindeki dağ suları %100 içilebilirdir; boş su şişeni her çeşmeden doldur.',
      en: 'Public town fountains flow with pristine mountain spring water—refill your flask for free!',
    },
    tag: { tr: 'Alpler & Göller', en: 'Alps & Glaciers' },
    highlight: { tr: 'Kusursuz Doğa', en: 'Alpine Perfection' },
  },
};

// Generic smart fallback generator for any country without manual bespoke entry
export function getCountryGuide(countryId: string, countryName: string, continent: string): CountryGuide {
  if (curatedCountryGuides[countryId]) {
    return curatedCountryGuides[countryId];
  }

  // Smart regional heuristics
  const continentGuides: Record<string, CountryGuide> = {
    Europe: {
      food: {
        tr: 'Bölgesel odun fırını hamur işleri, yerel peynirler ve taze sokak lezzetleri',
        en: 'Regional stone-baked pastries, artisanal cheeses & hearty local comfort foods',
      },
      see: {
        tr: 'Tarihi meydanlar, gotik katedral avluları ve arnavut kaldırımlı eski sokaklar',
        en: 'Historic town squares, medieval cobblestone alleys & scenic viewpoints',
      },
      tip: {
        tr: 'Merkezdeki turistik meydanlar yerine bir iki sokak arkadaki aile işletmelerini tercih et.',
        en: 'Dine one or two streets away from the main tourist plaza for half the bill and true flavor.',
      },
      tag: { tr: 'Tarih & Keşif', en: 'Heritage & Walks' },
      highlight: { tr: 'Avrupa Ruhu', en: 'European Charm' },
    },
    Asia: {
      food: {
        tr: 'Taze baharatlı sokak erişteleri, deniz mahsulleri ve buharda pişen yerel atıştırmalıklar',
        en: 'Fragrant street noodles, fresh seafood & steaming savory dumplings',
      },
      see: {
        tr: 'Antik tapınaklar, rengarenk gece pazarları ve yemyeşil doğa manzaraları',
        en: 'Ancient spiritual temples, buzzing night markets & lush green landscapes',
      },
      tip: {
        tr: 'Yerel gece pazarlarında taze yapılan yemekleri sıcak sıcak denemek en iyi deneyimdir.',
        en: 'Visit vibrant night markets at dusk to taste the freshest street delicacies on the spot.',
      },
      tag: { tr: 'Mistik & Lezzet', en: 'Mystic & Flavor' },
      highlight: { tr: 'Asya Büyüsü', en: 'Asian Wonder' },
    },
    Americas: {
      food: {
        tr: 'Izgara etler, taze tropik meyve suları ve mısır tabanlı geleneksel tatlar',
        en: 'Flame-grilled cuts, freshly squeezed tropical juices & traditional corn delicacies',
      },
      see: {
        tr: 'Vahşi milli park kanyonları, okyanus kıyıları ve renkli kolonyal meydanlar',
        en: 'Vast national park wilderness, dramatic coastlines & colorful colonial plazas',
      },
      tip: {
        tr: 'Geniş mesafeler için erken rezervasyon yap ve gün doğumu manzaralarını kaçırma.',
        en: 'Book nature passes in advance and catch the dramatic golden hour at national viewpoints.',
      },
      tag: { tr: 'Doğa & Macera', en: 'Nature & Adventure' },
      highlight: { tr: 'Geniş Coğrafyalar', en: 'Vast Wilds' },
    },
    Africa: {
      food: {
        tr: 'Ağır ateşte pişen tajin güveçleri, taze baharatlı pilavlar ve lezzetli sokak ızgaraları',
        en: 'Slow-simmered aromatic tagines, spiced rice dishes & fire-grilled skewers',
      },
      see: {
        tr: 'Gün batımında vahşi yaşam safarileri, kadim pazarlar ve kanyon vadileri',
        en: 'Sunset wildlife safaris, ancient medina souks & sweeping red canyons',
      },
      tip: {
        tr: 'Yerel rehberlerle gezmek hem kültürel hikayeleri öğrenmek hem de gizli rotaları keşfetmek için harikadır.',
        en: 'Hire reputable local guides to uncover untold cultural stories and secret viewpoints.',
      },
      tag: { tr: 'Vahşi Doğa & Kültür', en: 'Wilderness & Roots' },
      highlight: { tr: 'Afrika Ruhu', en: 'African Pulse' },
    },
    Oceania: {
      food: {
        tr: 'Taze okyanus deniz ürünleri, tropik meyveler ve açık hava barbeküleri',
        en: 'Fresh Pacific seafood, exotic tropical fruits & breezy outdoor barbecues',
      },
      see: {
        tr: 'Kristal mercan resifleri, beyaz kumsallar ve volkanik ada zirveleri',
        en: 'Crystal coral barrier reefs, untouched beaches & volcanic peaks',
      },
      tip: {
        tr: 'Güneş koruyucunu ve şapkanı asla unutma; deniz altı mercan resiflerinde şnorkeli ihmal etme.',
        en: 'Always wear reef-safe sunscreen and never skip a snorkel over the marine reefs.',
      },
      tag: { tr: 'Okyanus & Mercan', en: 'Ocean & Reefs' },
      highlight: { tr: 'Ada Huzuru', en: 'Island Serenity' },
    },
  };

  return (
    continentGuides[continent] || {
      food: {
        tr: 'Ülkenin en sevilen yerel lezzetleri ve geleneksel spesiyalleri',
        en: 'Beloved regional specialties and traditional home-style cooking',
      },
      see: {
        tr: 'Tarihi yapılar, doğa harikaları ve şehrin en canlı caddeleri',
        en: 'Historic landmarks, scenic natural wonders & vibrant local boulevards',
      },
      tip: {
        tr: 'Yerel halkın tavsiye ettiği sokakları keşfe çık ve anın tadını çıkar.',
        en: 'Ask locals for their favorite neighborhood café to experience the real city pulse.',
      },
      tag: { tr: 'Keşif & Kültür', en: 'Travel & Culture' },
      highlight: { tr: countryName, en: countryName },
    }
  );
}
