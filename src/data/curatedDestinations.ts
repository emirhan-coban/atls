// ==============================================================================
// ATLS CURATED DESTINATIONS DATABASE
// Top 15 World Destinations with high-res travel photography, specific places,
// food spots, map queries (Google/Apple Maps), and authentic traveler tips.
// ==============================================================================

export interface MapPoint {
  title: string;
  subtitle: string;
  city: string;
  desc: { tr: string; en: string };
  mapQuery: string;
}

export interface CuratedDestination {
  id: string;
  name: string;
  nameTr: string;
  flag: string;
  continent: string;
  continentTr: string;
  heroImage: string;
  tag: { tr: string; en: string };
  headline: { tr: string; en: string };
  seePlaces: MapPoint[];
  foodPlaces: MapPoint[];
  insiderTip: { tr: string; en: string };
}

export const CURATED_DESTINATIONS: CuratedDestination[] = [
  {
    id: 'IT',
    name: 'Italy',
    nameTr: 'İtalya',
    flag: '🇮🇹',
    continent: 'Europe',
    continentTr: 'Avrupa',
    heroImage: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=900&q=80', // Rome Colosseum sunset
    tag: { tr: 'Gastronomi & Tarih', en: 'Food & Heritage' },
    headline: {
      tr: 'Rönesansın, arnavut kaldırımlı sokakların ve gerçek Dolce Vita’nın anavatanı.',
      en: 'The cradle of the Renaissance, cobbled piazzas and true Dolce Vita.',
    },
    seePlaces: [
      {
        title: 'Trastevere Sokakları',
        subtitle: 'Sarmaşıklı Avlular & Canlı Akşamlar',
        city: 'Roma',
        desc: {
          tr: 'Turist kalabalığından uzakta, yerel kafelerin ve sarmaşıklı sokak lambalarının süslediği en otantik Roma mahallesi.',
          en: 'Charming ivy-clad alleyways and cozy neighborhood piazzas with vibrant street life.',
        },
        mapQuery: 'Trastevere, Rome, Italy',
      },
      {
        title: 'Como Gölü & Bellagio',
        subtitle: 'Alp Eteklerinde Vapur Turu',
        city: 'Lombardiya',
        desc: {
          tr: 'Karlı dağ zirveleri ve pastel renkli tarihi villaların göl aynasındaki büyüleyici yansıması.',
          en: 'Breathtaking pastel villages and snow-capped Alpine peaks mirrored in glacial waters.',
        },
        mapQuery: 'Bellagio, Lake Como, Italy',
      },
      {
        title: 'Pantheon & Piazza Navona',
        subtitle: '2000 Yıllık Antik Mimari',
        city: 'Roma',
        desc: {
          tr: 'Tepesindeki oculus deliğinden güneş ışığının süzüldüğü, dünyanın en iyi korunmuş antik kubbesi.',
          en: 'The legendary Roman temple with sunlight piercing through the open central oculus.',
        },
        mapQuery: 'Pantheon, Rome, Italy',
      },
    ],
    foodPlaces: [
      {
        title: 'Cacio e Pepe & Carbonara',
        subtitle: 'Da Enzo al 29 (Trastevere)',
        city: 'Roma',
        desc: {
          tr: 'Pecorino Romano peyniri ve taze çekilmiş karabiberle yapılan Roma’nın en ikonik el yapımı makarnası.',
          en: 'Handmade tonnarelli pasta tossed in rich pecorino and freshly cracked black pepper.',
        },
        mapQuery: 'Da Enzo al 29, Via dei Vascellari, Rome, Italy',
      },
      {
        title: 'Otantik Fıstıklı Gelato',
        subtitle: 'Gelateria Frigidarium',
        city: 'Roma',
        desc: {
          tr: 'Bronte fıstığından yapılan, üzerine isteğe göre sıcak bitter çikolata kabuğu dökülen efsane dondurma.',
          en: 'Pure Sicilian pistachio gelato dipped in an optional molten dark chocolate shell.',
        },
        mapQuery: 'Gelateria Frigidarium, Via del Governo Vecchio, Rome, Italy',
      },
    ],
    insiderTip: {
      tr: 'İtalya’da kahveyi masaya oturmak yerine barda ayakta içersen yarı fiyatına gelir! Ayrıca asla akşam yemeğinden sonra Cappuccino sipariş etme (sadece sabah içilir).',
      en: 'Drink espresso standing at the bar counter like locals for half price. Never order cappuccino after lunch—it’s strictly a morning drink!',
    },
  },
  {
    id: 'JP',
    name: 'Japan',
    nameTr: 'Japonya',
    flag: '🇯🇵',
    continent: 'Asia',
    continentTr: 'Asya',
    heroImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80', // Kyoto Pagoda & cherry blossoms
    tag: { tr: 'Fütürizm & Zen', en: 'Futurism & Zen' },
    headline: {
      tr: 'Neon ışıklı gökdelenler ile bin yıllık tapınakların kusursuz dengesi.',
      en: 'Flawless harmony between neon metropolis and sacred millennium-old shrines.',
    },
    seePlaces: [
      {
        title: 'Fushimi Inari Torii Kapıları',
        subtitle: 'Orman İçi Kutsal Rota',
        city: 'Kyoto',
        desc: {
          tr: 'Dağın zirvesine doğru uzanan 10.000 adet kızıl torii kapısı arasından geçen mistik sabah yürüyüşü.',
          en: 'Misty sunrise hike through ten thousand vermilion gates winding up the sacred mountain.',
        },
        mapQuery: 'Fushimi Inari Taisha, Kyoto, Japan',
      },
      {
        title: 'Shibuya Yaya Geçidi & Omoide Yokocho',
        subtitle: 'Neon Rüyası & Nostaljik Sokaklar',
        city: 'Tokyo',
        desc: {
          tr: 'Dünyanın en kalabalık yaya geçidinden sonra Shinjuku’daki minik yakitori dükkanlarına geç.',
          en: 'The world’s busiest pedestrian crossing followed by lantern-lit vintage alleyways.',
        },
        mapQuery: 'Shibuya Crossing, Tokyo, Japan',
      },
    ],
    foodPlaces: [
      {
        title: 'Koyu Tonkotsu Ramen',
        subtitle: 'Ichiran Shinjuku',
        city: 'Tokyo',
        desc: {
          tr: 'Özel tek kişilik kabinlerde, kemik suyunda 16 saat kaynayan derin lezzetli taze erişte.',
          en: 'Silky 16-hour simmered pork bone broth served in private individual tasting booths.',
        },
        mapQuery: 'Ichiran Ramen, Shinjuku, Tokyo, Japan',
      },
      {
        title: 'Taze Uji Matcha Tatlıları',
        subtitle: 'Gion Tsujiri',
        city: 'Kyoto',
        desc: {
          tr: 'Kyoto’nun tarihi Gion mahallesinde geleneksel yöntemlerle taş değirmende öğütülen matcha dondurması.',
          en: 'Stone-ground artisan matcha parfaits in the heart of historic geisha district Gion.',
        },
        mapQuery: 'Gion Tsujiri, Kyoto, Japan',
      },
    ],
    insiderTip: {
      tr: 'Japonya’da bahşiş bırakmak kaba sayılır, para masaya bırakılırsa peşinden koşup iade ederler. Ayrıca sokakta yürürken bir şeyler yemek hoş karşılanmaz.',
      en: 'Never leave a tip in Japan—it is seen as disrespectful. Eat your street snack right in front of the stall before walking away.',
    },
  },
  {
    id: 'FR',
    name: 'France',
    nameTr: 'Fransa',
    flag: '🇫🇷',
    continent: 'Europe',
    continentTr: 'Avrupa',
    heroImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80', // Paris Eiffel & Haussmann street
    tag: { tr: 'Romantizm & Sanat', en: 'Romance & Art' },
    headline: {
      tr: 'Işıklar Şehri Paris, lavanta vadileri ve dünya gastronomi başkenti.',
      en: 'The City of Light, lavender valleys, and the culinary capital of the world.',
    },
    seePlaces: [
      {
        title: 'Montmartre Gizli Merdivenleri',
        subtitle: 'Ressamlar Meydanı & Sacré-Cœur',
        city: 'Paris',
        desc: {
          tr: 'Paris’in en yüksek tepesinden şehre bakan, bohem sokak ressamları ve tarihi yel değirmenleri.',
          en: 'Cobbled winding staircases leading up to artists’ square and panoramic Parisian rooftops.',
        },
        mapQuery: 'Place du Tertre, Montmartre, Paris, France',
      },
      {
        title: 'Seine Nehri Bouquinistes',
        subtitle: 'Tarihi Nehir Kenarı Sahaf Yürüyüşü',
        city: 'Paris',
        desc: {
          tr: 'Notre Dame karşısında nehir boyunca uzanan yeşil ahşap sahaf kutuları ve antika posterler.',
          en: 'Iconic riverside open-air green bookstalls selling vintage prints and classic literature.',
        },
        mapQuery: 'Quai de la Tournelle, Paris, France',
      },
    ],
    foodPlaces: [
      {
        title: 'Çıtır Tereyağlı Kruvasan',
        subtitle: 'Du Pain et des Idées',
        city: 'Paris',
        desc: {
          tr: 'Kanal kenarında 1875’ten kalma fırında taze çıkan, çıtır katmanlı efsane kruvasan.',
          en: 'Award-winning flaky all-butter croissant baked fresh in an 1875 heritage bakery.',
        },
        mapQuery: 'Du Pain et des Idées, Rue Yves Toudic, Paris, France',
      },
      {
        title: 'Ördek Konfi (Confit de Canard)',
        subtitle: 'Le Comptoir du Relais',
        city: 'Paris',
        desc: {
          tr: 'Kendi yağında saatlerce pişen, derisi çıtır çıtır, eti lif lif dökülen Saint-Germain klasiği.',
          en: 'Tender slow-cooked duck with golden crispy skin, served with garlic herb potatoes.',
        },
        mapQuery: 'Le Comptoir du Relais, Carrefour de l’Odéon, Paris, France',
      },
    ],
    insiderTip: {
      tr: 'Bistrolarda pahalı şişe su yerine “Une carafe d’eau, s’il vous plaît” de; ücretsiz buz gibi şık sürahi su getirirler. Bir dükkana girerken her zaman önce “Bonjour” demeyi unutma.',
      en: 'Always ask for “Une carafe d’eau, s’il vous plaît” to get free iced tap water at any bistro. Always say “Bonjour” when stepping into any shop!',
    },
  },
  {
    id: 'ES',
    name: 'Spain',
    nameTr: 'İspanya',
    flag: '🇪🇸',
    continent: 'Europe',
    continentTr: 'Avrupa',
    heroImage: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=900&q=80', // Madrid / Barcelona architecture
    tag: { tr: 'Flamenko & Güneş', en: 'Flamenco & Sunshine' },
    headline: {
      tr: 'Gece yarısına kadar süren tapas sohbetleri, Gaudi mimarisi ve Akdeniz enerjisi.',
      en: 'Midnight tapas culture, Gaudí wonders, and infectious Mediterranean passion.',
    },
    seePlaces: [
      {
        title: 'El Born & Gotik Mahalle',
        subtitle: 'Orta Çağ Labirentleri',
        city: 'Barselona',
        desc: {
          tr: 'Yüksek taş binaların arasındaki dar gölgeli sokaklar, saklı barlar ve sanat atölyeleri.',
          en: 'Shadowy medieval alleys packed with independent boutiques, tapas bars and plazas.',
        },
        mapQuery: 'El Born, Barcelona, Spain',
      },
      {
        title: 'Elhamra Sarayı & Generalife',
        subtitle: 'Endülüs’ün Zirve Noktası',
        city: 'Granada',
        desc: {
          tr: 'Karşı tepesinde Sierra Nevada karları yükselen, su kanalları ve dantel gibi taş işçiliği.',
          en: 'The crown jewel of Moorish palaces with reflecting pools and delicate stone filigree.',
        },
        mapQuery: 'Alhambra, Granada, Spain',
      },
    ],
    foodPlaces: [
      {
        title: 'Gourmet Pintxos Turu',
        subtitle: 'Bar Nestor (Eski Şehir)',
        city: 'San Sebastián',
        desc: {
          tr: 'Bask bölgesinin dünyaca ünlü bar tezgahı lezzetleri ve fırından sıcak çıkan meşhur patatesli tortilla.',
          en: 'World-capital of bite-sized pintxos and Bar Nestor’s legendary once-a-day tortilla.',
        },
        mapQuery: 'Bar Nestor, San Sebastian, Spain',
      },
      {
        title: 'Odun Ateşinde Paella',
        subtitle: 'La Pepica',
        city: 'Valensiya',
        desc: {
          tr: 'Geniş tavada safranla pişirilen, altı çıtır çıtır tutmuş (socarrat) orijinal deniz ürünlü paella.',
          en: 'Traditional saffron rice with crispy caramelized bottom crust along the seaside.',
        },
        mapQuery: 'Restaurante La Pepica, Valencia, Spain',
      },
    ],
    insiderTip: {
      tr: 'Öğle saatlerinde restoranlarda “Menú del Día” iste; başlangıç, ana yemek, tatlı ve içecek dahil 12-15€ civarına kral gibi yersin. Akşam yemeği ise asla 21:00’den önce başlamaz.',
      en: 'Ask for “Menú del Día” at lunch for an incredible 3-course set menu for €12-15. Remember dinner starts late—rarely before 9:30 PM!',
    },
  },
  {
    id: 'TR',
    name: 'Turkey',
    nameTr: 'Türkiye',
    flag: '🇹🇷',
    continent: 'Europe',
    continentTr: 'Avrupa',
    heroImage: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=900&q=80', // Cappadocia hot air balloons
    tag: { tr: 'Miras & Misafirperverlik', en: 'Heritage & Hospitality' },
    headline: {
      tr: 'İki kıtayı birleştiren Boğaz rüzgarı, peri bacaları ve bin yıllık mutfak kültürü.',
      en: 'Where continents embrace across the Bosphorus, fairy chimneys and epic feasts.',
    },
    seePlaces: [
      {
        title: 'Kapadokya Balon Vadisi',
        subtitle: 'Gün Doğumu Peri Bacaları',
        city: 'Nevşehir',
        desc: {
          tr: 'Kızıl vadilerin üzerinden gün doğumunda göğe yükselen yüzlerce rengarenk sıcak hava balonu.',
          en: 'Hundreds of hot-air balloons drifting over mystical fairy chimneys at sunrise.',
        },
        mapQuery: 'Göreme, Cappadocia, Turkey',
      },
      {
        title: 'Boğaz Vapuru & Moda Sahili',
        subtitle: 'Kıta Değiştiren Gün Batımı',
        city: 'İstanbul',
        desc: {
          tr: 'Eminönü’nden Kadıköy’e geçerken martılara simit atmak ve Tarihi Yarımada siluetini izlemek.',
          en: 'Historic commuter ferry crossing from Europe to Asia while feeding seagulls at sunset.',
        },
        mapQuery: 'Moda Sahili, Kadikoy, Istanbul, Turkey',
      },
    ],
    foodPlaces: [
      {
        title: 'Çıtır Lahmacun & Kebap',
        subtitle: 'Çiya Sofrası',
        city: 'İstanbul (Kadıköy)',
        desc: {
          tr: 'Mezopotamya ve Anadolu’nun unutulmaya yüz tutmuş otantik bölgesel yemekleri ve taze fırın lezzetleri.',
          en: 'Unmatched culinary expedition into forgotten Anatolian and Silk Road heirloom recipes.',
        },
        mapQuery: 'Ciya Sofrasi, Caferaga, Kadikoy, Istanbul, Turkey',
      },
      {
        title: 'Taze Çıtır Baklava',
        subtitle: 'Güllüoğlu Karaköy',
        city: 'İstanbul',
        desc: {
          tr: 'Antep fıstığıyla fırınlanan, ısırdığında hışırdayan 40 kat ince yufkalı sıcak şerbetli lezzet.',
          en: 'Crispy 40-layered hand-stretched phyllo stuffed with emerald Gaziantep pistachios.',
        },
        mapQuery: 'Karakoy Gulluoglu, Kemankes, Istanbul, Turkey',
      },
    ],
    insiderTip: {
      tr: 'Tarihi Yarımada’dan Anadolu yakasına mutlaka gün batımı saatinde şehir hatları vapuruyla geç. Esnafın ikram ettiği çay bir satış baskısı değil, gerçek Türk misafirperverliğidir.',
      en: 'Take the public commuter ferry at golden hour between Karaköy and Kadıköy. When shopkeepers offer hot black tea, accept it—it is genuine hospitality.',
    },
  },
  {
    id: 'GR',
    name: 'Greece',
    nameTr: 'Yunanistan',
    flag: '🇬🇷',
    continent: 'Europe',
    continentTr: 'Avrupa',
    heroImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=900&q=80', // Santorini white cliff houses
    tag: { tr: 'Ege & Antik Çağ', en: 'Aegean & Antiquity' },
    headline: {
      tr: 'Mavi kubbeli bembeyaz köyler, turkuaz koylar ve felsefenin doğduğu topraklar.',
      en: 'Whitewashed cliffside villages, azure coves, and the cradle of Western philosophy.',
    },
    seePlaces: [
      {
        title: 'Plaka & Anafiotika Sokakları',
        subtitle: 'Akropolis Eteklerinde Ada Havası',
        city: 'Atina',
        desc: {
          tr: 'Akropolis tapınağının tam altında, Kiklad adalarını andıran bembeyaz kübik evler ve begonviller.',
          en: 'Cycladic village nestled directly beneath the walls of the ancient Acropolis.',
        },
        mapQuery: 'Anafiotika, Athens, Greece',
      },
      {
        title: 'Milos Sarakiniko Koyu',
        subtitle: 'Ay Yüzeyli Beyaz Kayalıklar',
        city: 'Milos Adası',
        desc: {
          tr: 'Rüzgar ve dalgalarla şekillenmiş bembeyaz volkanik tebeşir kayaları ve berrak turkuaz su.',
          en: 'Surreal bone-white volcanic limestone formations sculpted into a lunar beach.',
        },
        mapQuery: 'Sarakiniko Beach, Milos, Greece',
      },
    ],
    foodPlaces: [
      {
        title: 'Kömürde Ahtapot & Fava',
        subtitle: 'Taverna Klimataria',
        city: 'Atina',
        desc: {
          tr: 'Geleneksel taverna avlusunda canlı buzuki müziği eşliğinde zeytinyağlı ızgara Ege ahtapotu.',
          en: 'Tender octopus grilled over charcoal with Santorinian yellow split-pea puree and ouzo.',
        },
        mapQuery: 'Klimataria, Pl. Theatrou, Athens, Greece',
      },
    ],
    insiderTip: {
      tr: 'Aşırı pahalı ve kalabalık Santorini yerine feribotla Naxos veya Paros’a geç; üçte bir fiyata gerçek ada huzurunu yaşarsın.',
      en: 'Skip the overcrowded Santorini cruise rush—take a short ferry to Naxos or Paros for authentic island magic and lower prices.',
    },
  },
  {
    id: 'PT',
    name: 'Portugal',
    nameTr: 'Portekiz',
    flag: '🇵🇹',
    continent: 'Europe',
    continentTr: 'Avrupa',
    heroImage: 'https://images.unsplash.com/photo-1509840841025-9088ba78a826?auto=format&fit=crop&w=900&q=80', // Lisbon yellow tram
    tag: { tr: 'Okyanus & Çiniler', en: 'Ocean & Azulejos' },
    headline: {
      tr: 'Melankolik Fado melodileri, sarı tramvaylar ve Atlantik kıyısında çıtır tatlılar.',
      en: 'Melancholic Fado melodies, vintage yellow trams and warm Atlantic breezes.',
    },
    seePlaces: [
      {
        title: 'Alfama & Miradouro de Santa Luzia',
        subtitle: 'Çinili Seyir Terası',
        city: 'Lizbon',
        desc: {
          tr: 'Mavi beyaz çiniler (azulejos) ve mor begonviller arasından Tejo nehrine bakan masalsı manzara.',
          en: 'Breathtaking terrace overlooking red-tile rooftops and the sparkling Tagus River.',
        },
        mapQuery: 'Miradouro de Santa Luzia, Lisbon, Portugal',
      },
      {
        title: 'Pena Sarayı & Sintra Ormanları',
        subtitle: 'Bulutlar Arasında Masal Şatosu',
        city: 'Sintra',
        desc: {
          tr: 'Sarı ve kırmızı kuleleriyle sisli dağın zirvesine kurulmuş romantik masal kalesi.',
          en: 'Vibrant yellow and red romanticist castle perched high above the mist-covered hills.',
        },
        mapQuery: 'Pena Palace, Sintra, Portugal',
      },
    ],
    foodPlaces: [
      {
        title: 'Sıcak Pastel de Nata',
        subtitle: 'Pastéis de Belém',
        city: 'Lizbon',
        desc: {
          tr: '1837’den beri gizli manastır tarifiyle yapılan, üzeri tarçınlı çıtır milföylü sıcak krema keki.',
          en: 'Freshly baked custard tarts with blistered tops and whisper-thin caramelized crust.',
        },
        mapQuery: 'Pasteis de Belem, Rua de Belem, Lisbon, Portugal',
      },
    ],
    insiderTip: {
      tr: 'Popüler 28 nolu tramvay çok kalabalıksa ve yankesici riski varsa, benzer rota çizen 12 nolu tramvayı tercih et.',
      en: 'Vintage Tram 28 has huge queues and pickpockets; hop on Tram 12 instead for almost the same historic route with plenty of seats.',
    },
  },
  {
    id: 'TH',
    name: 'Thailand',
    nameTr: 'Tayland',
    flag: '🇹🇭',
    continent: 'Asia',
    continentTr: 'Asya',
    heroImage: 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&w=900&q=80', // Thailand karst beach longtail boat
    tag: { tr: 'Tropik & Sokak Lezzeti', en: 'Tropical & Street Food' },
    headline: {
      tr: 'Zümrüt yeşili adalar, altın Buda heykelleri ve dünyanın en canlı sokak pazarları.',
      en: 'Emerald limestone islands, golden temples and the world’s tastiest street food.',
    },
    seePlaces: [
      {
        title: 'Railay Kumsalı & Karst Kayalıkları',
        subtitle: 'Sadece Tekneyle Ulaşılan Cennet',
        city: 'Krabi',
        desc: {
          tr: 'Devasa kireçtaşı kayalıklarıyla çevrili, kristal berraklığında turkuaz lagün suları.',
          en: 'World-famous emerald lagoon accessible only by wooden longtail boat.',
        },
        mapQuery: 'Railay Beach, Krabi, Thailand',
      },
      {
        title: 'Wat Pho & Yatan Buda',
        subtitle: '46 Metrelik Altın Heykel',
        city: 'Bangkok',
        desc: {
          tr: 'Geleneksel Tay masajının doğum yeri olan tapınak ve sedef kakmalı devasa Buda heykeli.',
          en: 'Sacred temple complex housing the monumental 46-meter gold-plated reclining Buddha.',
        },
        mapQuery: 'Wat Pho, Bangkok, Thailand',
      },
    ],
    foodPlaces: [
      {
        title: 'Wok Ateşinde Pad Thai',
        subtitle: 'Thipsamai Pad Thai',
        city: 'Bangkok',
        desc: {
          tr: 'İncecik yumurta tülüne sarılmış taze karidesli, fıstıklı ve misket limonlu efsane sokak klasiği.',
          en: 'Stir-fried rice noodles wrapped in a paper-thin egg crepe with plump prawns.',
        },
        mapQuery: 'Thipsamai, Maha Chai Road, Bangkok, Thailand',
      },
    ],
    insiderTip: {
      tr: 'Tapınaklara girerken omuz ve dizlerin örtülü olması şarttır. Taksiye binmeden önce her zaman taksimetreyi (“Meter, please”) açtır.',
      en: 'Dress with covered shoulders and knees at all temples. Always insist the taxi driver turns on the meter (“Meter, please”).',
    },
  },
  {
    id: 'GE',
    name: 'Georgia',
    nameTr: 'Gürcistan',
    flag: '🇬🇪',
    continent: 'Asia',
    continentTr: 'Asya',
    heroImage: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=900&q=80', // Gergeti Trinity Church Mount Kazbek
    tag: { tr: 'Kafkasya & Şarap', en: 'Caucasus & Wine' },
    headline: {
      tr: '8000 yıllık şarap geleneği, karlı Kafkas zirveleri ve sıcacık haçapuriler.',
      en: '8,000 years of winemaking heritage, colossal Caucasus peaks and hearty feasts.',
    },
    seePlaces: [
      {
        title: 'Gergeti Teslis Kilisesi',
        subtitle: 'Kazbek Dağı Manzarası',
        city: 'Stepantsminda',
        desc: {
          tr: '5000 metrelik karlı Kazbek zirvesinin önünde tek başına duran 14. yüzyıl taş kilisesi.',
          en: 'Legendary 14th-century church isolated beneath the mighty glacier of Mount Kazbek.',
        },
        mapQuery: 'Gergeti Trinity Church, Stepantsminda, Georgia',
      },
      {
        title: 'Tiflis Eski Şehir & Sülfür Hamamları',
        subtitle: 'Tuğla Kemerli Sıcak Kaynaklar',
        city: 'Tiflis',
        desc: {
          tr: 'Ahşap oymalı balkonlar, rengarenk vitraylar ve yeraltından çıkan doğal kükürtlü sular.',
          en: 'Historic dome bathhouses and carved wooden balconies clinging to the canyon cliffs.',
        },
        mapQuery: 'Abanotubani, Tbilisi, Georgia',
      },
    ],
    foodPlaces: [
      {
        title: 'Acaristan Usulü Haçapuri',
        subtitle: 'Restaurant Cafe Stamba',
        city: 'Tiflis',
        desc: {
          tr: 'Fırından sıcak çıkan kayık şekilli çıtır ekmek içinde eriyen Sulguni peyniri, tereyağı ve taze yumurta.',
          en: 'Boat-shaped warm bread filled with molten cheese, topped with butter and egg yolk.',
        },
        mapQuery: 'Stamba Hotel, Merab Kostava Street, Tbilisi, Georgia',
      },
    ],
    insiderTip: {
      tr: 'Hınkal mantısını sakın çatalla kesme! Üstündeki hamur tutamacından tutup ısırarak önce içindeki sıcak et suyunu hüplet.',
      en: 'Never eat Khinkali dumplings with a fork! Bite a small corner, slurp the hot rich spiced broth first, then enjoy the dumpling.',
    },
  },
  {
    id: 'CH',
    name: 'Switzerland',
    nameTr: 'İsviçre',
    flag: '🇨🇭',
    continent: 'Europe',
    continentTr: 'Avrupa',
    heroImage: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=900&q=80', // Swiss Alps & valley
    tag: { tr: 'Alpler & Göller', en: 'Alps & Glaciers' },
    headline: {
      tr: 'Kusursuz tren yolculukları, ayna gibi buzul gölleri ve şelaleler vadisi.',
      en: 'Pristine panoramic train rides, mirror lakes and waterfall valleys.',
    },
    seePlaces: [
      {
        title: 'Lauterbrunnen Şelaleler Vadisi',
        subtitle: '72 Şelaleli Masal Diyarı',
        city: 'Bernese Oberland',
        desc: {
          tr: 'Yüzlerce metrelik sarp kireçtaşı kayalıklardan dökülen şelaleler ve ahşap dağ evleri.',
          en: 'Dramatic valley featuring 72 roaring waterfalls plunging from vertical rock faces.',
        },
        mapQuery: 'Lauterbrunnen, Switzerland',
      },
      {
        title: 'Matterhorn & Zermatt',
        subtitle: 'Toblerone Dağı Zirvesi',
        city: 'Valais',
        desc: {
          tr: 'Otomobil trafiğine kapalı dağ kasabasında, göle yansıyan ikonik piramit zirve.',
          en: 'The car-free Alpine village gazing upon the world’s most iconic pyramid peak.',
        },
        mapQuery: 'Zermatt, Switzerland',
      },
    ],
    foodPlaces: [
      {
        title: 'Geleneksel Peynir Fondüsü & Rösti',
        subtitle: 'Restaurant Whymper-Stube',
        city: 'Zermatt',
        desc: {
          tr: 'Gruyère ve Vacherin peynirleriyle hazırlanan, kızarmış ekmek küpleri batırılan sıcak dağ lezzeti.',
          en: 'Bubbling Alpine cheese fondue with crispy golden butter-fried rösti potatoes.',
        },
        mapQuery: 'Whymper-Stube, Zermatt, Switzerland',
      },
    ],
    insiderTip: {
      tr: 'İsviçre’de su satın alma! Sokaktaki tüm tarihi çeşmelerden Alplerden gelen tertemiz kaynak suyu akar, matarana doldur.',
      en: 'Never buy bottled water in Switzerland—public town fountains flow with drinkable pure Alpine spring water.',
    },
  },
  {
    id: 'US',
    name: 'United States',
    nameTr: 'Amerika Birleşik Devletleri',
    flag: '🇺🇸',
    continent: 'Americas',
    continentTr: 'Amerika',
    heroImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
    tag: { tr: 'Milli Parklar & Metropoller', en: 'National Parks & Skylines' },
    headline: {
      tr: 'Gökdelen silüetlerinden kanyonların sonsuzluğuna uzanan devasa coğrafya.',
      en: 'From electrifying metropolises to the raw majesty of colossal canyons.',
    },
    seePlaces: [
      {
        title: 'Central Park & Top of the Rock',
        subtitle: 'Manhattan’ın Kalbi & 360° Seyir',
        city: 'New York',
        desc: {
          tr: 'Gökdelen ormanının ortasındaki devasa yeşil vaha ve Empire State manzaralı gözlem terası.',
          en: 'The legendary urban oasis encircled by skyscrapers and panoramic skyline views.',
        },
        mapQuery: 'Top of the Rock, Rockefeller Plaza, New York, NY',
      },
      {
        title: 'Grand Canyon Güney Kenarı (South Rim)',
        subtitle: 'Milyonlarca Yıllık Jeolojik Mucize',
        city: 'Arizona',
        desc: {
          tr: 'Colorado Nehri’nin kızıl kireçtaşı kayaları milyonlarca yılda oyduğu doğa şaheseri.',
          en: 'Breathtaking crimson gorges and endless carved plateaus overlooking the Colorado River.',
        },
        mapQuery: 'Grand Canyon South Rim, Arizona, USA',
      },
      {
        title: 'Golden Gate Köprüsü & Baker Beach',
        subtitle: 'Pasifik Sisinin İkonik Silüeti',
        city: 'San Francisco',
        desc: {
          tr: 'Kızıl köprünün Pasifik Okyanusu ve meşhur San Francisco sisiyle kucaklaştığı efsanevi sahil.',
          en: 'Iconic orange suspension bridge emerging dramatically through rolling Pacific fog banks.',
        },
        mapQuery: 'Baker Beach, San Francisco, California',
      },
    ],
    foodPlaces: [
      {
        title: 'Katz’s Delicatessen',
        subtitle: '1888’den Beri Efsanevi Pastrami Sandviç',
        city: 'New York',
        desc: {
          tr: 'Hafif isli, lokum kıvamında marine edilmiş çavdar ekmeği arası pastırma ve çıtır salatalık turşusu.',
          en: 'Historic Lower East Side institution famed for colossal hand-carved hot pastrami on rye.',
        },
        mapQuery: 'Katz Delicatessen, East Houston Street, New York, NY',
      },
      {
        title: 'Franklin Barbecue',
        subtitle: 'Austin’in Meşe Kütüğünde Pişen İsli Brisketi',
        city: 'Austin, Texas',
        desc: {
          tr: '14 saat kısık ateşte tütsülenen, karabiber kabuklu dünyanın en yumuşak sığır eti.',
          en: 'Legendary Texas oak-smoked brisket served with thick crust and irresistible barbecue bark.',
        },
        mapQuery: 'Franklin Barbecue, East 11th Street, Austin, TX',
      },
    ],
    insiderTip: {
      tr: 'New York metrosunda fiziki metro kartı almakla vakit kaybetme; temassız banka kartını veya Apple Pay’ini doğrudan OMNY turnikelerine okutarak anında binebilirsin. Oturmalı restoranlarda bahşiş standardı %18-%20’dir.',
      en: 'Skip physical MetroCards in NYC—simply tap your phone or contactless credit card via OMNY at every subway turnstile. Sit-down restaurant tip standard is 18-20%.',
    },
  },
  {
    id: 'BR',
    name: 'Brazil',
    nameTr: 'Brezilya',
    flag: '🇧🇷',
    continent: 'Americas',
    continentTr: 'Amerika',
    heroImage: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=900&q=80',
    tag: { tr: 'Samba, Sahiller & Doğa', en: 'Samba, Rainforests & Coastlines' },
    headline: {
      tr: 'Tropik yağmur ormanları, dalgaların ritmi ve hayat dolu karnaval enerjisi.',
      en: 'Rhythmic ocean shores, emerald rainforests and infectious carnival zest.',
    },
    seePlaces: [
      {
        title: 'Kurtarıcı İsa Heykeli (Cristo Redentor)',
        subtitle: 'Corcovado Tepesinden Rio Manzarası',
        city: 'Rio de Janeiro',
        desc: {
          tr: '700 metre yükseklikteki zirveden Guanabara Körfezi’ni ve şeker külahı dağını kucaklayan dünya harikası.',
          en: 'Art Deco wonder towering 700 meters above Rio with awe-inspiring 360-degree panoramic ocean views.',
        },
        mapQuery: 'Christ the Redeemer, Rio de Janeiro, Brazil',
      },
      {
        title: 'İguazü Şelaleleri (Foz do Iguaçu)',
        subtitle: 'Dünyanın En Görkemli Şelale Sistemi',
        city: 'Paraná',
        desc: {
          tr: '275 farklı su çağlayanının gök gürültüsü gibi tropik ormana döküldüğü doğa mucizesi.',
          en: 'Roaring curtain of 275 thunderous cascades plunging through dense subtropical jungle.',
        },
        mapQuery: 'Iguazu Falls, Foz do Iguacu, Brazil',
      },
      {
        title: 'Arpoador Kayalıkları & Ipanema',
        subtitle: 'Plaj Kültürü & Alkışlanan Gün Batımı',
        city: 'Rio de Janeiro',
        desc: {
          tr: 'Güneş okyanusa batarken yüzlerce yerlinin kayalıklara toplanıp alkış tuttuğu unutulmaz atmosfer.',
          en: 'Golden sands where sunset watchers gather on rocky points to applaud the twilight sky.',
        },
        mapQuery: 'Pedra do Arpoador, Rio de Janeiro, Brazil',
      },
    ],
    foodPlaces: [
      {
        title: 'Churrascaria Palace',
        subtitle: 'Geleneksel 1951 Rodizio Şöleni',
        city: 'Rio de Janeiro',
        desc: {
          tr: 'Şişlerle masaya gelen Picanha (özel sığır sırtı) eti, farofa ve tropik salatalar.',
          en: 'Authentic Copacabana rodizio grill serving melt-in-your-mouth prime picanha cuts.',
        },
        mapQuery: 'Churrascaria Palace, Copacabana, Rio de Janeiro, Brazil',
      },
      {
        title: 'Confeitaria Colombo',
        subtitle: '1894 Belle Époque Kafe & Coxinha',
        city: 'Rio de Janeiro',
        desc: {
          tr: 'Devasa Belçika aynaları ve vitraylar altında çıtır tavuklu coxinha ve Brezilya kahvesi.',
          en: 'Gilded historical cafe with magnificent stained-glass skylights and crisp savory pastries.',
        },
        mapQuery: 'Confeitaria Colombo, Centro, Rio de Janeiro, Brazil',
      },
    ],
    insiderTip: {
      tr: 'Ipanema sahilinde susadığında seyyar büfelerden buz gibi taze yeşil hindistan cevizi (água de coco) iste; içtikten sonra satıcıya verirsen palayla ikiye bölüp içindeki yumuşacık eti de ikram eder.',
      en: 'Buy a freshly chilled green coconut (água de coco) from beach kiosks; once finished, ask them to slice it open so you can scoop out the sweet flesh with a wooden spoon.',
    },
  },
  {
    id: 'MX',
    name: 'Mexico',
    nameTr: 'Meksika',
    flag: '🇲🇽',
    continent: 'Americas',
    continentTr: 'Amerika',
    heroImage: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=900&q=80',
    tag: { tr: 'Maya Mirası & Baharatlı Lezzetler', en: 'Mayan Lore & Street Flavors' },
    headline: {
      tr: 'Mistik piramitler, turkuaz obruklar (cenote) ve UNESCO korumalı sokak lezzetleri.',
      en: 'Mystical Mayan pyramids, hidden limestone cenotes and UNESCO culinary heritage.',
    },
    seePlaces: [
      {
        title: 'Chichén Itzá El Castillo Piramidi',
        subtitle: 'Maya Astronomisinin Başyapıtı',
        city: 'Yucatán',
        desc: {
          tr: 'Ekinoks günlerinde güneş gölgesiyle tüylü yılan Kukulkan’ın basamaklardan indiği antik piramit.',
          en: 'Soaring Mayan step pyramid aligned precisely with astronomical solar equinoxes.',
        },
        mapQuery: 'Chichen Itza, Yucatan, Mexico',
      },
      {
        title: 'Frida Kahlo Müzesi (La Casa Azul)',
        subtitle: 'Mavi Ev & Coyoacán Sokakları',
        city: 'Mexico City',
        desc: {
          tr: 'Kobalt mavisi duvarları, kaktüs bahçeleri ve Frida’nın fırçalarıyla korunan ikonik sanat evi.',
          en: 'Intense cobalt-blue colonial residence preserving the art, gardens and studio of Frida Kahlo.',
        },
        mapQuery: 'Frida Kahlo Museum, Coyoacan, Mexico City, Mexico',
      },
      {
        title: 'Cenote Dos Ojos',
        subtitle: 'Kristal Berrak Yeraltı Mağara Gölü',
        city: 'Tulum, Quintana Roo',
        desc: {
          tr: 'Sarkıt ve dikitlerle süslü turkuaz yeraltı nehrinde şnorkelle yüzme deneyimi.',
          en: 'Sun-dappled cavernous limestone sinkhole with subterranean crystalline turquoise waters.',
        },
        mapQuery: 'Cenote Dos Ojos, Tulum, Quintana Roo, Mexico',
      },
    ],
    foodPlaces: [
      {
        title: 'Taquería Los Cocuyos',
        subtitle: 'Tarihi Merkezde 24 Saat Açık Taco Tezgahı',
        city: 'Mexico City',
        desc: {
          tr: 'Büyük bakır tencerede kısık ateşte pişen Suadero ve Longaniza takoları.',
          en: 'Legendary hole-in-the-wall stand simmering brisket suadero and spicy chorizo all day long.',
        },
        mapQuery: 'Taqueria Los Cocuyos, Centro Historico, Mexico City, Mexico',
      },
      {
        title: 'Restaurante El Cardenal',
        subtitle: 'Geleneksel Meksika Kahvaltısı & Sıcak Çikolata',
        city: 'Mexico City',
        desc: {
          tr: 'Köpüklü Doña Valentina çikolatası ve taze peynirli sıcak concha ekmeği.',
          en: 'Classic multi-level venue famous for frothy artisanal Mexican hot chocolate and savory conchas.',
        },
        mapQuery: 'Restaurante El Cardenal, Calle de la Palma, Mexico City, Mexico',
      },
    ],
    insiderTip: {
      tr: 'Taco sipariş ederken "con todo" dersen taze kişniş ve soğanla hazırlanır. Masadaki renkli acı sosları (özellikle açık yeşil habanero) boca etmeden önce çatalın ucuyla acılığını mutlaka kontrol et!',
      en: 'Order street tacos "con todo" to get authentic cilantro and diced onions. Always test tabletop salsa with a drop before pouring generously—habanero packs real fire!',
    },
  },
  {
    id: 'AR',
    name: 'Argentina',
    nameTr: 'Arjantin',
    flag: '🇦🇷',
    continent: 'Americas',
    continentTr: 'Amerika',
    heroImage: 'https://images.unsplash.com/photo-1589553416260-f586c8f1514f?auto=format&fit=crop&w=900&q=80',
    tag: { tr: 'Tango, Patagonya & Asado', en: 'Tango, Asado & Glaciers' },
    headline: {
      tr: 'Güneyin Paris’i Buenos Aires, Patagonya rüzgarları ve efsanevi açık ateş lezzetleri.',
      en: 'The Paris of the South, wild Patagonian winds and legendary open-fire steaks.',
    },
    seePlaces: [
      {
        title: 'Perito Moreno Buzulu',
        subtitle: 'Sürekli Hareket Eden Buzul Kütlesi',
        city: 'El Calafate, Patagonya',
        desc: {
          tr: 'Devasa gök mavisi buz kütlelerinin göle kırılarak düştüğü dünyanın en etkileyici buzulu.',
          en: 'Mighty dynamic glacier where immense sapphire icebergs calve dramatically into Lake Argentino.',
        },
        mapQuery: 'Perito Moreno Glacier, Santa Cruz, Argentina',
      },
      {
        title: 'San Telmo & Caminito Rengarenk Evleri',
        subtitle: 'Sokak Tangosu & Bohem Avlular',
        city: 'Buenos Aires',
        desc: {
          tr: 'Pazar günleri antika tezgahlarının kurulduğu, sokak köşelerinde canlı tango yapılan tarihi semt.',
          en: 'Cobbled alleyways adorned with vivid corrugated iron houses, antique fairs and spontaneous street tangos.',
        },
        mapQuery: 'Caminito, La Boca, Buenos Aires, Argentina',
      },
    ],
    foodPlaces: [
      {
        title: 'Don Julio Parrilla',
        subtitle: 'Dünyanın En Ünlü Biftek Restoranı',
        city: 'Palermo, Buenos Aires',
        desc: {
          tr: 'Özel meşe kömüründe pişen Bife de Lomo, Ojo de Bife ve Chimichurri sosu.',
          en: 'Acclaimed temple of Argentine grass-fed beef grilled over traditional glowing embers.',
        },
        mapQuery: 'Don Julio, Guatemala, Palermo, Buenos Aires, Argentina',
      },
      {
        title: 'Pizzería Güerrín',
        subtitle: '1932’den Beri Bol Peynirli Fugazzeta',
        city: 'Buenos Aires',
        desc: {
          tr: 'Avenia Corrientes tiyatrolarından çıkanların uğradığı, taşan mozzarella ve karamelize soğanlı pizza.',
          en: 'Historic theater-district landmark overflowing with melted mozzarella and sweet caramelized onions.',
        },
        mapQuery: 'Pizzeria Guerrin, Avenida Corrientes, Buenos Aires, Argentina',
      },
    ],
    insiderTip: {
      tr: 'Buenos Aires’te akşam yemeği saatleri çok geçtir; restoranlar genelde 21:30’dan önce dolmaz. Öğleden sonra kahvenin yanına yerel fırınlardan sıcak Medialuna (tatlı kruvasan) ve Dulce de Leche iste.',
      en: 'Porteños dine late—restaurants won’t get lively before 9:30 or 10 PM. For afternoon merienda, order sweet glazed medialunas with café con leche.',
    },
  },
  {
    id: 'CA',
    name: 'Canada',
    nameTr: 'Kanada',
    flag: '🇨🇦',
    continent: 'Americas',
    continentTr: 'Amerika',
    heroImage: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=900&q=80',
    tag: { tr: 'Turkuaz Göller & Vahşi Doğa', en: 'Glacial Lakes & Wild Wilderness' },
    headline: {
      tr: 'Kayalık Dağlar’ın turkuaz buzul gölleri ve çok kültürlü modern şehirler.',
      en: 'Turquoise glacial lakes of the Rockies and vibrant multicultural cities.',
    },
    seePlaces: [
      {
        title: 'Moraine Gölü & Banff Milli Parkı',
        subtitle: 'On Zirveler Vadisi’nin Turkuaz Aynası',
        city: 'Alberta',
        desc: {
          tr: 'Buzul ununun suya kattığı gerçeküstü parlak turkuaz rengi ve karlı dağ yansıması.',
          en: 'Unreal neon-blue glacial lake nestled under the towering rugged peaks of the Valley of the Ten Peaks.',
        },
        mapQuery: 'Moraine Lake, Banff National Park, Alberta, Canada',
      },
      {
        title: 'Niagara Şelaleleri (Horseshoe Falls)',
        subtitle: 'Kuzey Amerika’nın En Güçlü Şelalesi',
        city: 'Ontario',
        desc: {
          tr: 'Nal şeklindeki dev şelaleden saniyede milyonlarca litre suyun döküldüğü görkemli nokta.',
          en: 'Immense crescent-shaped waterfall creating roaring mists and rainbows over the Niagara gorge.',
        },
        mapQuery: 'Horseshoe Falls, Niagara Falls, Ontario, Canada',
      },
    ],
    foodPlaces: [
      {
        title: 'La Banquise',
        subtitle: '24 Saat Açık Hakiki Montreal Poutine',
        city: 'Montreal, Quebec',
        desc: {
          tr: 'Sıcak patates kızartması üzerine taze gıcırdayan peynir parçacıkları (cheese curds) ve sıcak gravy sosu.',
          en: 'Iconic spot serving classic Quebec poutine crowned with piping brown gravy and fresh squeaky cheese curds.',
        },
        mapQuery: 'La Banquise, Rue Rachel Est, Montreal, Quebec, Canada',
      },
    ],
    insiderTip: {
      tr: 'Moraine Gölü’ne gitmek istiyorsan Parks Canada servis (shuttle) biletlerini önceden ayırt; özel araçların göl yoluna girmesine izin verilmiyor.',
      en: 'Book Parks Canada shuttle reservations well in advance for Moraine Lake; personal vehicles are no longer permitted on the access road.',
    },
  },
  {
    id: 'PE',
    name: 'Peru',
    nameTr: 'Peru',
    flag: '🇵🇪',
    continent: 'Americas',
    continentTr: 'Amerika',
    heroImage: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=900&q=80',
    tag: { tr: 'İnka Medeniyeti & Gastronomi', en: 'Inca Empires & World-Class Cuisine' },
    headline: {
      tr: 'Bulutların üzerindeki kayıp İnka kenti ve Pasifik’in taptaze lezzetleri.',
      en: 'Lost mountain citadels in cloud forests and Latin America’s culinary capital.',
    },
    seePlaces: [
      {
        title: 'Machu Picchu Antik Kenti',
        subtitle: 'Bulut Ormanındaki Gizemli İnka Şehri',
        city: 'Cusco',
        desc: {
          tr: 'And Dağları’nın sisli zirvesine harçsız kesme taşlarla inşa edilmiş efsanevi İnka kalesi.',
          en: 'Remarkable stone citadel perched high in misty Andean peaks above the Urubamba River.',
        },
        mapQuery: 'Machu Picchu, Peru',
      },
      {
        title: 'Kutsal Vadi & Ollantaytambo',
        subtitle: 'Teraslı Tarım Harikası & İnka Kaleleri',
        city: 'Urubamba',
        desc: {
          tr: 'Dağ yamaçlarına oyulmuş dev tarım terasları ve canlı Quechua köyleri.',
          en: 'Enchanting river valley carved with monumental Inca terraces and living indigenous craft towns.',
        },
        mapQuery: 'Ollantaytambo, Sacred Valley, Peru',
      },
    ],
    foodPlaces: [
      {
        title: 'La Mar Cebichería Peruana',
        subtitle: 'Gastón Acurio’dan Taze Leche de Tigre',
        city: 'Miraflores, Lima',
        desc: {
          tr: 'Pasifik levreği, taze lime suyu, mısır (choclo) ve tatlı patatesle hazırlanan klasik taze ceviche.',
          en: 'Bustling open-air seafood sanctuary serving zesty citrus-cured ceviche and grilled anticuchos.',
        },
        mapQuery: 'La Mar Cebicheria, Avenida Mariscal La Mar, Miraflores, Lima, Peru',
      },
    ],
    insiderTip: {
      tr: 'Cusco’ya vardıktan sonra ilk gün irtifa hastalığına (soroche) karşı kesinlikle tempolu yürüyüş yapma; bol su ve koka ya da muña çayı içerek vücudunun 3.400 metreye alışmasını bekle.',
      en: 'Take your arrival day in Cusco very slowly to acclimatize to the 3,400m altitude. Sip warm muña herbal tea and stay well hydrated before your trek.',
    },
  },
  {
    id: 'MA',
    name: 'Morocco',
    nameTr: 'Fas',
    flag: '🇲🇦',
    continent: 'Africa',
    continentTr: 'Afrika',
    heroImage: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=900&q=80',
    tag: { tr: 'Baharat Kokuları & Labirent Medinalar', en: 'Spices, Souks & Medinas' },
    headline: {
      tr: 'Kızıl surlar, saray avluları (riad) ve nane çayının büyüleyici ritüeli.',
      en: 'Crimson ramparts, tranquil mosaic riads and fragrant mint tea rituals.',
    },
    seePlaces: [
      {
        title: 'Jemaa el-Fnaa Meydanı & Souklar',
        subtitle: 'Marakeş’in Kalbi & Canlı Gösteriler',
        city: 'Marakeş',
        desc: {
          tr: 'Hikaye anlatıcıları, sokak müzisyenleri ve baharat kokulu tarihi çarşı labirenti.',
          en: 'Electrifying open plaza brimming with storytellers, musicians and labyrinthine spice souks.',
        },
        mapQuery: 'Jemaa el-Fna, Marrakech, Morocco',
      },
      {
        title: 'Şafşavan (Chefchaouen) Mavi Şehir',
        subtitle: 'Rif Dağları Eteğinde Masmavi Sokaklar',
        city: 'Şafşavan',
        desc: {
          tr: 'Tüm kapı ve merdivenlerinin çivit mavisine boyandığı dağ eteğindeki huzurlu kasaba.',
          en: 'Enchanting mountain village where every doorway and alleyway is bathed in serene shades of cobalt blue.',
        },
        mapQuery: 'Chefchaouen Medina, Morocco',
      },
    ],
    foodPlaces: [
      {
        title: 'Geleneksel Kuzu Tagine & Kuskus',
        subtitle: 'Nomad Rooftop Restaurant',
        city: 'Marakeş',
        desc: {
          tr: 'Toprak güveçte erik ve bademle saatlerce pişen yumuşacık kuzu eti.',
          en: 'Slow-simmered spiced tagines with tender lamb, prunes and toasted almonds atop a panoramic medina roof.',
        },
        mapQuery: 'Nomad, Rahba Kedima, Marrakech, Morocco',
      },
    ],
    insiderTip: {
      tr: 'Medina sokaklarında "yol kapalı" diyenlere aldanma; genelde kendi dükkanlarına yönlendirmek için söylerler. Çarşıda alışveriş yaparken ilk fiyatın yarısına pazarlık etmek yaygın ve doğaldır.',
      en: 'Politely ignore people claiming alleys are closed in the medina. Bargaining with a friendly smile to roughly half the opening price is customary in souks.',
    },
  },
  {
    id: 'EG',
    name: 'Egypt',
    nameTr: 'Mısır',
    flag: '🇪🇬',
    continent: 'Africa',
    continentTr: 'Afrika',
    heroImage: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=900&q=80',
    tag: { tr: 'Firavunlar & Nil Nehri', en: 'Pharaohs & The River Nile' },
    headline: {
      tr: '4500 yıllık piramitler, altın sarısı çöller ve Nil’in hayat verdiği tapınaklar.',
      en: '4,500-year-old pyramids, golden desert sands and colossal temples on the Nile.',
    },
    seePlaces: [
      {
        title: 'Gize Piramitleri & Büyük Sfenks',
        subtitle: 'Antik Dünyanın Yaşayan Tek Harikası',
        city: 'Kahire',
        desc: {
          tr: 'Keops, Kefren ve Mikerinos piramitleriyle çöl ufkuna bakan dev kireçtaşı sfenks.',
          en: 'The sole surviving Ancient Wonder of the World standing guard over the desert horizon.',
        },
        mapQuery: 'Giza Necropolis, Al Haram, Giza Governorate, Egypt',
      },
      {
        title: 'Karnak Tapınağı',
        subtitle: '134 Devasa Sütunlu Tapınak Salonu',
        city: 'Luksor',
        desc: {
          tr: 'Devasa hiyeroglifli sütunlar ve koç başlı sfenks yoluyla birbirine bağlanan firavun tapınakları.',
          en: 'Towering hypostyle hall of 134 colossal columns covered in deep ceremonial hieroglyphics.',
        },
        mapQuery: 'Karnak Temple, Luxor, Egypt',
      },
    ],
    foodPlaces: [
      {
        title: 'Koshary Abou Tarek',
        subtitle: 'Kahire’nin En Meşhur Sokak Yemeği',
        city: 'Kahire',
        desc: {
          tr: 'Pirinç, mercimek, makarna, nohut üzerine çıtır soğan ve baharatlı domates-sarımsak sosu.',
          en: 'Beloved multi-level restaurant dedicated entirely to Egypt’s national comfort bowl of spiced lentils, rice and crispy onions.',
        },
        mapQuery: 'Koshary Abou Tarek, Marouf, Qasr El Nil, Cairo, Egypt',
      },
    ],
    insiderTip: {
      tr: 'Piramitleri ziyaret ederken sabah 08:00 açılışında gitmeye özen göster; böylece hem tur otobüslerinden hem de çöl sıcağından kaçınmış olursun.',
      en: 'Visit the Giza plateau right at the 8:00 AM opening to beat tour buses and scorching heat.',
    },
  },
];
