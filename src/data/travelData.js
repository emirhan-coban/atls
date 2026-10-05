export const initialProfile = {
  name: "Dünya Gezgini",
  handle: "@gezgin",
  avatarInitials: "AT",
  location: "Global Citizen",
  locationTr: "Dünya Vatandaşı",
  nationality: "Global Citizen",
  passportNo: "AT-742910-X",
  issueDate: new Date().getFullYear().toString(),
  expiryDate: "LIFETIME",
  bio: "Exploring the human experience across borders.",
};

// Production start: initial countries is empty (users start with 0 stamps)
export const initialCountries = [];

export const stampsData = {
  en: [],
  tr: [],
};

export const getPassportStamps = (lang = 'en') => stampsData[lang] || stampsData.en;
export const passportStamps = stampsData.en;

export const availableCatalog = [
  {
    "id": "AF",
    "name": "Afghanistan",
    "nameTr": "Afganistan",
    "flag": "🇦🇫",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "AL",
    "name": "Albania",
    "nameTr": "Arnavutluk",
    "flag": "🇦🇱",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "DZ",
    "name": "Algeria",
    "nameTr": "Cezayir",
    "flag": "🇩🇿",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "AD",
    "name": "Andorra",
    "nameTr": "Andorra",
    "flag": "🇦🇩",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "AO",
    "name": "Angola",
    "nameTr": "Angola",
    "flag": "🇦🇴",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "AG",
    "name": "Antigua and Barbuda",
    "nameTr": "Antigua ve Barbuda",
    "flag": "🇦🇬",
    "continent": "North America",
    "continentTr": "Kuzey Amerika"
  },
  {
    "id": "AR",
    "name": "Argentina",
    "nameTr": "Arjantin",
    "flag": "🇦🇷",
    "continent": "South America",
    "continentTr": "Güney Amerika"
  },
  {
    "id": "AM",
    "name": "Armenia",
    "nameTr": "Ermenistan",
    "flag": "🇦🇲",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "AU",
    "name": "Australia",
    "nameTr": "Avustralya",
    "flag": "🇦🇺",
    "continent": "Oceania",
    "continentTr": "Okyanusya"
  },
  {
    "id": "AT",
    "name": "Austria",
    "nameTr": "Avusturya",
    "flag": "🇦🇹",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "AZ",
    "name": "Azerbaijan",
    "nameTr": "Azerbaycan",
    "flag": "🇦🇿",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "BS",
    "name": "Bahamas",
    "nameTr": "Bahamalar",
    "flag": "🇧🇸",
    "continent": "North America",
    "continentTr": "Kuzey Amerika"
  },
  {
    "id": "BH",
    "name": "Bahrain",
    "nameTr": "Bahreyn",
    "flag": "🇧🇭",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "BD",
    "name": "Bangladesh",
    "nameTr": "Bangladeş",
    "flag": "🇧🇩",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "BB",
    "name": "Barbados",
    "nameTr": "Barbados",
    "flag": "🇧🇧",
    "continent": "North America",
    "continentTr": "Kuzey Amerika"
  },
  {
    "id": "BY",
    "name": "Belarus",
    "nameTr": "Belarus",
    "flag": "🇧🇾",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "BE",
    "name": "Belgium",
    "nameTr": "Belçika",
    "flag": "🇧🇪",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "BZ",
    "name": "Belize",
    "nameTr": "Belize",
    "flag": "🇧🇿",
    "continent": "North America",
    "continentTr": "Kuzey Amerika"
  },
  {
    "id": "BJ",
    "name": "Benin",
    "nameTr": "Benin",
    "flag": "🇧🇯",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "BT",
    "name": "Bhutan",
    "nameTr": "Butan",
    "flag": "🇧🇹",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "BO",
    "name": "Bolivia",
    "nameTr": "Bolivya",
    "flag": "🇧🇴",
    "continent": "South America",
    "continentTr": "Güney Amerika"
  },
  {
    "id": "BA",
    "name": "Bosnia and Herzegovina",
    "nameTr": "Bosna Hersek",
    "flag": "🇧🇦",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "BW",
    "name": "Botswana",
    "nameTr": "Botsvana",
    "flag": "🇧🇼",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "BR",
    "name": "Brazil",
    "nameTr": "Brezilya",
    "flag": "🇧🇷",
    "continent": "South America",
    "continentTr": "Güney Amerika"
  },
  {
    "id": "BN",
    "name": "Brunei",
    "nameTr": "Brunei",
    "flag": "🇧🇳",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "BG",
    "name": "Bulgaria",
    "nameTr": "Bulgaristan",
    "flag": "🇧🇬",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "BF",
    "name": "Burkina Faso",
    "nameTr": "Burkina Faso",
    "flag": "🇧🇫",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "BI",
    "name": "Burundi",
    "nameTr": "Burundi",
    "flag": "🇧🇮",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "CV",
    "name": "Cabo Verde",
    "nameTr": "Yeşil Burun Adaları",
    "flag": "🇨🇻",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "KH",
    "name": "Cambodia",
    "nameTr": "Kamboçya",
    "flag": "🇰🇭",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "CM",
    "name": "Cameroon",
    "nameTr": "Kamerun",
    "flag": "🇨🇲",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "CA",
    "name": "Canada",
    "nameTr": "Kanada",
    "flag": "🇨🇦",
    "continent": "North America",
    "continentTr": "Kuzey Amerika"
  },
  {
    "id": "CF",
    "name": "Central African Republic",
    "nameTr": "Orta Afrika Cumhuriyeti",
    "flag": "🇨🇫",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "TD",
    "name": "Chad",
    "nameTr": "Çad",
    "flag": "🇹🇩",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "CL",
    "name": "Chile",
    "nameTr": "Şili",
    "flag": "🇨🇱",
    "continent": "South America",
    "continentTr": "Güney Amerika"
  },
  {
    "id": "CN",
    "name": "China",
    "nameTr": "Çin",
    "flag": "🇨🇳",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "CO",
    "name": "Colombia",
    "nameTr": "Kolombiya",
    "flag": "🇨🇴",
    "continent": "South America",
    "continentTr": "Güney Amerika"
  },
  {
    "id": "KM",
    "name": "Comoros",
    "nameTr": "Komorlar",
    "flag": "🇰🇲",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "CG",
    "name": "Congo",
    "nameTr": "Kongo Cumhuriyeti",
    "flag": "🇨🇬",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "CD",
    "name": "DR Congo",
    "nameTr": "Demokratik Kongo",
    "flag": "🇨🇩",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "CR",
    "name": "Costa Rica",
    "nameTr": "Kosta Rika",
    "flag": "🇨🇷",
    "continent": "North America",
    "continentTr": "Kuzey Amerika"
  },
  {
    "id": "HR",
    "name": "Croatia",
    "nameTr": "Hırvatistan",
    "flag": "🇭🇷",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "CU",
    "name": "Cuba",
    "nameTr": "Küba",
    "flag": "🇨🇺",
    "continent": "North America",
    "continentTr": "Kuzey Amerika"
  },
  {
    "id": "CY",
    "name": "Cyprus",
    "nameTr": "Kıbrıs",
    "flag": "🇨🇾",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "CZ",
    "name": "Czech Republic",
    "nameTr": "Çekya",
    "flag": "🇨🇿",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "DK",
    "name": "Denmark",
    "nameTr": "Danimarka",
    "flag": "🇩🇰",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "DJ",
    "name": "Djibouti",
    "nameTr": "Cibuti",
    "flag": "🇩🇯",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "DM",
    "name": "Dominica",
    "nameTr": "Dominika",
    "flag": "🇩🇲",
    "continent": "North America",
    "continentTr": "Kuzey Amerika"
  },
  {
    "id": "DO",
    "name": "Dominican Republic",
    "nameTr": "Dominik Cumhuriyeti",
    "flag": "🇩🇴",
    "continent": "North America",
    "continentTr": "Kuzey Amerika"
  },
  {
    "id": "EC",
    "name": "Ecuador",
    "nameTr": "Ekvador",
    "flag": "🇪🇨",
    "continent": "South America",
    "continentTr": "Güney Amerika"
  },
  {
    "id": "EG",
    "name": "Egypt",
    "nameTr": "Mısır",
    "flag": "🇪🇬",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "SV",
    "name": "El Salvador",
    "nameTr": "El Salvador",
    "flag": "🇸🇻",
    "continent": "North America",
    "continentTr": "Kuzey Amerika"
  },
  {
    "id": "GQ",
    "name": "Equatorial Guinea",
    "nameTr": "Ekvator Ginesi",
    "flag": "🇬🇶",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "ER",
    "name": "Eritrea",
    "nameTr": "Eritre",
    "flag": "🇪🇷",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "EE",
    "name": "Estonia",
    "nameTr": "Estonya",
    "flag": "🇪🇪",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "SZ",
    "name": "Eswatini",
    "nameTr": "Esvatini",
    "flag": "🇸🇿",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "ET",
    "name": "Ethiopia",
    "nameTr": "Etiyopya",
    "flag": "🇪🇹",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "FJ",
    "name": "Fiji",
    "nameTr": "Fiji",
    "flag": "🇫🇯",
    "continent": "Oceania",
    "continentTr": "Okyanusya"
  },
  {
    "id": "FI",
    "name": "Finland",
    "nameTr": "Finlandiya",
    "flag": "🇫🇮",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "FR",
    "name": "France",
    "nameTr": "Fransa",
    "flag": "🇫🇷",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "GA",
    "name": "Gabon",
    "nameTr": "Gabon",
    "flag": "🇬🇦",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "GM",
    "name": "Gambia",
    "nameTr": "Gambiya",
    "flag": "🇬🇲",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "GE",
    "name": "Georgia",
    "nameTr": "Gürcistan",
    "flag": "🇬🇪",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "DE",
    "name": "Germany",
    "nameTr": "Almanya",
    "flag": "🇩🇪",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "GH",
    "name": "Ghana",
    "nameTr": "Gana",
    "flag": "🇬🇭",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "GR",
    "name": "Greece",
    "nameTr": "Yunanistan",
    "flag": "🇬🇷",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "GD",
    "name": "Grenada",
    "nameTr": "Grenada",
    "flag": "🇬🇩",
    "continent": "North America",
    "continentTr": "Kuzey Amerika"
  },
  {
    "id": "GT",
    "name": "Guatemala",
    "nameTr": "Guatemala",
    "flag": "🇬🇹",
    "continent": "North America",
    "continentTr": "Kuzey Amerika"
  },
  {
    "id": "GN",
    "name": "Guinea",
    "nameTr": "Gine",
    "flag": "🇬🇳",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "GW",
    "name": "Guinea-Bissau",
    "nameTr": "Gine-Bissau",
    "flag": "🇬🇼",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "GY",
    "name": "Guyana",
    "nameTr": "Guyana",
    "flag": "🇬🇾",
    "continent": "South America",
    "continentTr": "Güney Amerika"
  },
  {
    "id": "HT",
    "name": "Haiti",
    "nameTr": "Haiti",
    "flag": "🇭🇹",
    "continent": "North America",
    "continentTr": "Kuzey Amerika"
  },
  {
    "id": "HN",
    "name": "Honduras",
    "nameTr": "Honduras",
    "flag": "🇭🇳",
    "continent": "North America",
    "continentTr": "Kuzey Amerika"
  },
  {
    "id": "HU",
    "name": "Hungary",
    "nameTr": "Macaristan",
    "flag": "🇭🇺",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "IS",
    "name": "Iceland",
    "nameTr": "İzlanda",
    "flag": "🇮🇸",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "IN",
    "name": "India",
    "nameTr": "Hindistan",
    "flag": "🇮🇳",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "ID",
    "name": "Indonesia",
    "nameTr": "Endonezya",
    "flag": "🇮🇩",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "IR",
    "name": "Iran",
    "nameTr": "İran",
    "flag": "🇮🇷",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "IQ",
    "name": "Iraq",
    "nameTr": "Irak",
    "flag": "🇮🇶",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "IE",
    "name": "Ireland",
    "nameTr": "İrlanda",
    "flag": "🇮🇪",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "IL",
    "name": "Israel",
    "nameTr": "İsrail",
    "flag": "🇮🇱",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "IT",
    "name": "Italy",
    "nameTr": "İtalya",
    "flag": "🇮🇹",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "JM",
    "name": "Jamaica",
    "nameTr": "Jamaika",
    "flag": "🇯🇲",
    "continent": "North America",
    "continentTr": "Kuzey Amerika"
  },
  {
    "id": "JP",
    "name": "Japan",
    "nameTr": "Japonya",
    "flag": "🇯🇵",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "JO",
    "name": "Jordan",
    "nameTr": "Ürdün",
    "flag": "🇯🇴",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "KZ",
    "name": "Kazakhstan",
    "nameTr": "Kazakistan",
    "flag": "🇰🇿",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "KE",
    "name": "Kenya",
    "nameTr": "Kenya",
    "flag": "🇰🇪",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "KI",
    "name": "Kiribati",
    "nameTr": "Kiribati",
    "flag": "🇰🇮",
    "continent": "Oceania",
    "continentTr": "Okyanusya"
  },
  {
    "id": "KW",
    "name": "Kuwait",
    "nameTr": "Kuveyt",
    "flag": "🇰🇼",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "KG",
    "name": "Kyrgyzstan",
    "nameTr": "Kırgızistan",
    "flag": "🇰🇬",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "LA",
    "name": "Laos",
    "nameTr": "Laos",
    "flag": "🇱🇦",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "LV",
    "name": "Latvia",
    "nameTr": "Letonya",
    "flag": "🇱🇻",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "LB",
    "name": "Lebanon",
    "nameTr": "Lübnan",
    "flag": "🇱🇧",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "LS",
    "name": "Lesotho",
    "nameTr": "Lesotho",
    "flag": "🇱🇸",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "LR",
    "name": "Liberia",
    "nameTr": "Liberya",
    "flag": "🇱🇷",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "LY",
    "name": "Libya",
    "nameTr": "Libya",
    "flag": "🇱🇾",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "LI",
    "name": "Liechtenstein",
    "nameTr": "Lihtenştayn",
    "flag": "🇱🇮",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "LT",
    "name": "Lithuania",
    "nameTr": "Litvanya",
    "flag": "🇱🇹",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "LU",
    "name": "Luxembourg",
    "nameTr": "Lüksemburg",
    "flag": "🇱🇺",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "MG",
    "name": "Madagascar",
    "nameTr": "Madagaskar",
    "flag": "🇲🇬",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "MW",
    "name": "Malawi",
    "nameTr": "Malavi",
    "flag": "🇲🇼",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "MY",
    "name": "Malaysia",
    "nameTr": "Malezya",
    "flag": "🇲🇾",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "MV",
    "name": "Maldives",
    "nameTr": "Maldivler",
    "flag": "🇲🇻",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "ML",
    "name": "Mali",
    "nameTr": "Mali",
    "flag": "🇲🇱",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "MT",
    "name": "Malta",
    "nameTr": "Malta",
    "flag": "🇲🇹",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "MH",
    "name": "Marshall Islands",
    "nameTr": "Marshall Adaları",
    "flag": "🇲🇭",
    "continent": "Oceania",
    "continentTr": "Okyanusya"
  },
  {
    "id": "MR",
    "name": "Mauritania",
    "nameTr": "Moritanya",
    "flag": "🇲🇷",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "MU",
    "name": "Mauritius",
    "nameTr": "Mauritius",
    "flag": "🇲🇺",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "MX",
    "name": "Mexico",
    "nameTr": "Meksika",
    "flag": "🇲🇽",
    "continent": "North America",
    "continentTr": "Kuzey Amerika"
  },
  {
    "id": "FM",
    "name": "Micronesia",
    "nameTr": "Mikronezya",
    "flag": "🇫🇲",
    "continent": "Oceania",
    "continentTr": "Okyanusya"
  },
  {
    "id": "MD",
    "name": "Moldova",
    "nameTr": "Moldova",
    "flag": "🇲🇩",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "MC",
    "name": "Monaco",
    "nameTr": "Monako",
    "flag": "🇲🇨",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "MN",
    "name": "Mongolia",
    "nameTr": "Moğolistan",
    "flag": "🇲🇳",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "ME",
    "name": "Montenegro",
    "nameTr": "Karadağ",
    "flag": "🇲🇪",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "MA",
    "name": "Morocco",
    "nameTr": "Fas",
    "flag": "🇲🇦",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "MZ",
    "name": "Mozambique",
    "nameTr": "Mozambik",
    "flag": "🇲🇿",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "MM",
    "name": "Myanmar",
    "nameTr": "Myanmar",
    "flag": "🇲🇲",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "NA",
    "name": "Namibia",
    "nameTr": "Namibya",
    "flag": "🇳🇦",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "NR",
    "name": "Nauru",
    "nameTr": "Nauru",
    "flag": "🇳🇷",
    "continent": "Oceania",
    "continentTr": "Okyanusya"
  },
  {
    "id": "NP",
    "name": "Nepal",
    "nameTr": "Nepal",
    "flag": "🇳🇵",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "NL",
    "name": "Netherlands",
    "nameTr": "Hollanda",
    "flag": "🇳🇱",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "NZ",
    "name": "New Zealand",
    "nameTr": "Yeni Zelanda",
    "flag": "🇳🇿",
    "continent": "Oceania",
    "continentTr": "Okyanusya"
  },
  {
    "id": "NI",
    "name": "Nicaragua",
    "nameTr": "Nikaragua",
    "flag": "🇳🇮",
    "continent": "North America",
    "continentTr": "Kuzey Amerika"
  },
  {
    "id": "NE",
    "name": "Niger",
    "nameTr": "Nijer",
    "flag": "🇳🇪",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "NG",
    "name": "Nigeria",
    "nameTr": "Nijerya",
    "flag": "🇳🇬",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "MK",
    "name": "North Macedonia",
    "nameTr": "Kuzey Makedonya",
    "flag": "🇲🇰",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "NO",
    "name": "Norway",
    "nameTr": "Norveç",
    "flag": "🇳🇴",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "OM",
    "name": "Oman",
    "nameTr": "Umman",
    "flag": "🇴🇲",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "PK",
    "name": "Pakistan",
    "nameTr": "Pakistan",
    "flag": "🇵🇰",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "PW",
    "name": "Palau",
    "nameTr": "Palau",
    "flag": "🇵🇼",
    "continent": "Oceania",
    "continentTr": "Okyanusya"
  },
  {
    "id": "PS",
    "name": "Palestine",
    "nameTr": "Filistin",
    "flag": "🇵🇸",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "PA",
    "name": "Panama",
    "nameTr": "Panama",
    "flag": "🇵🇦",
    "continent": "North America",
    "continentTr": "Kuzey Amerika"
  },
  {
    "id": "PG",
    "name": "Papua New Guinea",
    "nameTr": "Papua Yeni Gine",
    "flag": "🇵🇬",
    "continent": "Oceania",
    "continentTr": "Okyanusya"
  },
  {
    "id": "PY",
    "name": "Paraguay",
    "nameTr": "Paraguay",
    "flag": "🇵🇾",
    "continent": "South America",
    "continentTr": "Güney Amerika"
  },
  {
    "id": "PE",
    "name": "Peru",
    "nameTr": "Peru",
    "flag": "🇵🇪",
    "continent": "South America",
    "continentTr": "Güney Amerika"
  },
  {
    "id": "PH",
    "name": "Philippines",
    "nameTr": "Filipinler",
    "flag": "🇵🇭",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "PL",
    "name": "Poland",
    "nameTr": "Polonya",
    "flag": "🇵🇱",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "PT",
    "name": "Portugal",
    "nameTr": "Portekiz",
    "flag": "🇵🇹",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "QA",
    "name": "Qatar",
    "nameTr": "Katar",
    "flag": "🇶🇦",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "RO",
    "name": "Romania",
    "nameTr": "Romanya",
    "flag": "🇷🇴",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "RU",
    "name": "Russia",
    "nameTr": "Rusya",
    "flag": "🇷🇺",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "RW",
    "name": "Rwanda",
    "nameTr": "Ruanda",
    "flag": "🇷🇼",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "KN",
    "name": "Saint Kitts and Nevis",
    "nameTr": "Saint Kitts ve Nevis",
    "flag": "🇰🇳",
    "continent": "North America",
    "continentTr": "Kuzey Amerika"
  },
  {
    "id": "LC",
    "name": "Saint Lucia",
    "nameTr": "Saint Lucia",
    "flag": "🇱🇨",
    "continent": "North America",
    "continentTr": "Kuzey Amerika"
  },
  {
    "id": "VC",
    "name": "Saint Vincent and the Grenadines",
    "nameTr": "Saint Vincent ve Grenadinler",
    "flag": "🇻🇨",
    "continent": "North America",
    "continentTr": "Kuzey Amerika"
  },
  {
    "id": "WS",
    "name": "Samoa",
    "nameTr": "Samoa",
    "flag": "🇼🇸",
    "continent": "Oceania",
    "continentTr": "Okyanusya"
  },
  {
    "id": "SM",
    "name": "San Marino",
    "nameTr": "San Marino",
    "flag": "🇸🇲",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "ST",
    "name": "Sao Tome and Principe",
    "nameTr": "Sao Tome ve Principe",
    "flag": "🇸🇹",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "SA",
    "name": "Saudi Arabia",
    "nameTr": "Suudi Arabistan",
    "flag": "🇸🇦",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "SN",
    "name": "Senegal",
    "nameTr": "Senegal",
    "flag": "🇸🇳",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "RS",
    "name": "Serbia",
    "nameTr": "Sırbistan",
    "flag": "🇷🇸",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "SC",
    "name": "Seychelles",
    "nameTr": "Seyşeller",
    "flag": "🇸🇨",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "SL",
    "name": "Sierra Leone",
    "nameTr": "Sierra Leone",
    "flag": "🇸🇱",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "SG",
    "name": "Singapore",
    "nameTr": "Singapur",
    "flag": "🇸🇬",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "SK",
    "name": "Slovakia",
    "nameTr": "Slovakya",
    "flag": "🇸🇰",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "SI",
    "name": "Slovenia",
    "nameTr": "Slovenya",
    "flag": "🇸🇮",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "SB",
    "name": "Solomon Islands",
    "nameTr": "Solomon Adaları",
    "flag": "🇸🇧",
    "continent": "Oceania",
    "continentTr": "Okyanusya"
  },
  {
    "id": "SO",
    "name": "Somalia",
    "nameTr": "Somali",
    "flag": "🇸🇴",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "ZA",
    "name": "South Africa",
    "nameTr": "Güney Afrika",
    "flag": "🇿🇦",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "SS",
    "name": "South Sudan",
    "nameTr": "Güney Sudan",
    "flag": "🇸🇸",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "ES",
    "name": "Spain",
    "nameTr": "İspanya",
    "flag": "🇪🇸",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "LK",
    "name": "Sri Lanka",
    "nameTr": "Sri Lanka",
    "flag": "🇱🇰",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "SD",
    "name": "Sudan",
    "nameTr": "Sudan",
    "flag": "🇸🇩",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "SR",
    "name": "Suriname",
    "nameTr": "Surinam",
    "flag": "🇸🇷",
    "continent": "South America",
    "continentTr": "Güney Amerika"
  },
  {
    "id": "SE",
    "name": "Sweden",
    "nameTr": "İsveç",
    "flag": "🇸🇪",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "CH",
    "name": "Switzerland",
    "nameTr": "İsviçre",
    "flag": "🇨🇭",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "SY",
    "name": "Syria",
    "nameTr": "Suriye",
    "flag": "🇸🇾",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "TW",
    "name": "Taiwan",
    "nameTr": "Tayvan",
    "flag": "🇹🇼",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "TJ",
    "name": "Tajikistan",
    "nameTr": "Tacikistan",
    "flag": "🇹🇯",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "TZ",
    "name": "Tanzania",
    "nameTr": "Tanzanya",
    "flag": "🇹🇿",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "TH",
    "name": "Thailand",
    "nameTr": "Tayland",
    "flag": "🇹🇭",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "TL",
    "name": "Timor-Leste",
    "nameTr": "Doğu Timor",
    "flag": "🇹🇱",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "TG",
    "name": "Togo",
    "nameTr": "Togo",
    "flag": "🇹🇬",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "TO",
    "name": "Tonga",
    "nameTr": "Tonga",
    "flag": "🇹🇴",
    "continent": "Oceania",
    "continentTr": "Okyanusya"
  },
  {
    "id": "TT",
    "name": "Trinidad and Tobago",
    "nameTr": "Trinidad ve Tobago",
    "flag": "🇹🇹",
    "continent": "North America",
    "continentTr": "Kuzey Amerika"
  },
  {
    "id": "TN",
    "name": "Tunisia",
    "nameTr": "Tunus",
    "flag": "🇹🇳",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "TR",
    "name": "Turkey",
    "nameTr": "Türkiye",
    "flag": "🇹🇷",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "TM",
    "name": "Turkmenistan",
    "nameTr": "Türkmenistan",
    "flag": "🇹🇲",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "TV",
    "name": "Tuvalu",
    "nameTr": "Tuvalu",
    "flag": "🇹🇻",
    "continent": "Oceania",
    "continentTr": "Okyanusya"
  },
  {
    "id": "UG",
    "name": "Uganda",
    "nameTr": "Uganda",
    "flag": "🇬🇦",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "UA",
    "name": "Ukraine",
    "nameTr": "Ukrayna",
    "flag": "🇺🇦",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "AE",
    "name": "United Arab Emirates",
    "nameTr": "Birleşik Arap Emirlikleri",
    "flag": "🇦🇪",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "GB",
    "name": "United Kingdom",
    "nameTr": "Birleşik Krallık",
    "flag": "🇬🇧",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "US",
    "name": "United States",
    "nameTr": "Amerika Birleşik Devletleri",
    "flag": "🇺🇸",
    "continent": "North America",
    "continentTr": "Kuzey Amerika"
  },
  {
    "id": "UY",
    "name": "Uruguay",
    "nameTr": "Uruguay",
    "flag": "🇺🇾",
    "continent": "South America",
    "continentTr": "Güney Amerika"
  },
  {
    "id": "UZ",
    "name": "Uzbekistan",
    "nameTr": "Özbekistan",
    "flag": "🇺🇿",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "VU",
    "name": "Vanuatu",
    "nameTr": "Vanuatu",
    "flag": "🇻🇺",
    "continent": "Oceania",
    "continentTr": "Okyanusya"
  },
  {
    "id": "VA",
    "name": "Vatican City",
    "nameTr": "Vatikan",
    "flag": "🇻🇦",
    "continent": "Europe",
    "continentTr": "Avrupa"
  },
  {
    "id": "VE",
    "name": "Venezuela",
    "nameTr": "Venezuela",
    "flag": "🇻🇪",
    "continent": "South America",
    "continentTr": "Güney Amerika"
  },
  {
    "id": "VN",
    "name": "Vietnam",
    "nameTr": "Vietnam",
    "flag": "🇻🇳",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "YE",
    "name": "Yemen",
    "nameTr": "Yemen",
    "flag": "🇾🇪",
    "continent": "Asia",
    "continentTr": "Asya"
  },
  {
    "id": "ZM",
    "name": "Zambia",
    "nameTr": "Zambiya",
    "flag": "🇿🇲",
    "continent": "Africa",
    "continentTr": "Afrika"
  },
  {
    "id": "ZW",
    "name": "Zimbabwe",
    "nameTr": "Zimbabve",
    "flag": "🇿🇼",
    "continent": "Africa",
    "continentTr": "Afrika"
  }
];

const catalogMap = new Map();
availableCatalog.forEach((c) => {
  if (c && c.id) {
    catalogMap.set(c.id.toUpperCase(), c);
  }
});

export const getLocalizedCountryName = (countryOrId, lang = 'en') => {
  if (!countryOrId) return '';
  const id = (typeof countryOrId === 'string' ? countryOrId : countryOrId.id)?.toUpperCase();
  const catalogItem = id ? catalogMap.get(id) : null;
  
  if (lang === 'tr') {
    return catalogItem?.nameTr || (typeof countryOrId === 'object' ? countryOrId.nameTr || countryOrId.name : catalogItem?.name || id || '');
  }
  return catalogItem?.name || (typeof countryOrId === 'object' ? countryOrId.name || countryOrId.nameTr : catalogItem?.nameTr || id || '');
};

export const getLocalizedContinent = (countryOrId, lang = 'en') => {
  if (!countryOrId) return '';
  const id = (typeof countryOrId === 'string' ? countryOrId : countryOrId.id)?.toUpperCase();
  const catalogItem = id ? catalogMap.get(id) : null;
  
  if (lang === 'tr') {
    return catalogItem?.continentTr || (typeof countryOrId === 'object' ? countryOrId.continentTr || countryOrId.continent : catalogItem?.continent || '');
  }
  return catalogItem?.continent || (typeof countryOrId === 'object' ? countryOrId.continent || countryOrId.continentTr : catalogItem?.continentTr || '');
};
