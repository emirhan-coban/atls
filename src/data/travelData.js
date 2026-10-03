export const initialProfile = {
  name: "Maya Chen",
  handle: "@mayachen",
  avatarInitials: "MC",
  location: "Lisbon, Portugal",
  nationality: "Global Citizen",
  passportNo: "AT-892410-X",
  issueDate: "2021",
  expiryDate: "LIFETIME",
  bio: "Partly local, mostly curious. Exploring the human experience across 195 borders.",
};

export const cultureSectors = [
  {
    id: "portugal-saudade",
    sector: "SECTOR OF THE DAY • CULTURE",
    country: "Portugal",
    flag: "🇵🇹",
    title: "Saudade Spirit",
    subtitle: "A Melancholy Love For What Was",
    description: "Saudade is a deep emotional state of nostalgic longing for something or someone that is absent. A quiet celebration of presence through memory.",
    colors: ["#4F46E5", "#7C3AED"],
    tag: "RESIDENCE",
    visitedYear: "2023 - Present",
  },
  {
    id: "japan-mono",
    sector: "SECTOR OF THE WEEK • PHILOSOPHY",
    country: "Japan",
    flag: "🇯🇵",
    title: "Mono no Aware",
    subtitle: "The Pathos of Fleeting Moments",
    description: "An empathy toward things, and at the same time a gentle sadness at their transience, like falling cherry blossoms in Kyoto.",
    colors: ["#6366F1", "#EC4899"],
    tag: "VISITED",
    visitedYear: "2022",
  },
  {
    id: "brazil-ginga",
    sector: "SECTOR HIGHLIGHT • RHYTHM",
    country: "Brazil",
    flag: "🇧🇷",
    title: "Ginga Flow",
    subtitle: "The Swaying Soul of Brazil",
    description: "More than just a martial movement in capoeira; ginga is an innate fluid resilience and joy woven into everyday Brazilian life.",
    colors: ["#3B82F6", "#10B981"],
    tag: "VISITED",
    visitedYear: "2023",
  },
];

export const initialCountries = [
  // Lived in (2)
  { id: "PT", name: "Portugal", status: "lived", flag: "🇵🇹", year: "2023-Now", notes: "Home in Lisbon, overlooking the Tejo", visits: 1 },
  { id: "TW", name: "Taiwan", status: "lived", flag: "🇹🇼", year: "2019-2022", notes: "Night markets and coastal rain", visits: 1 },

  // Visited (12)
  { id: "US", name: "United States", status: "visited", flag: "🇺🇸", year: "2018", notes: "Roadtrip across the Pacific Coast Highway", visits: 4 },
  { id: "CA", name: "Canada", status: "visited", flag: "🇨🇦", year: "2019", notes: "Banff lakes in crisp autumn", visits: 1 },
  { id: "BR", name: "Brazil", status: "visited", flag: "🇧🇷", year: "2023", notes: "Rio carnival and Salvador drums", visits: 1 },
  { id: "GB", name: "United Kingdom", status: "visited", flag: "🇬🇧", year: "2021", notes: "Rainy London cafe hopping", visits: 3 },
  { id: "FR", name: "France", status: "visited", flag: "🇫🇷", year: "2022", notes: "Parisian bookstores and Provence lavender", visits: 2 },
  { id: "ES", name: "Spain", status: "visited", flag: "🇪🇸", year: "2023", notes: "Tapas in Seville and Gaudi in Barcelona", visits: 2 },
  { id: "IT", name: "Italy", status: "visited", flag: "🇮🇹", year: "2022", notes: "Sunset over Florence terracotta roofs", visits: 2 },
  { id: "DE", name: "Germany", status: "visited", flag: "🇩🇪", year: "2023", notes: "Berlin gallery weekends", visits: 1 },
  { id: "JP", name: "Japan", status: "visited", flag: "🇯🇵", year: "2022", notes: "Kyoto bamboo groves at sunrise", visits: 2 },
  { id: "VN", name: "Vietnam", status: "visited", flag: "🇻🇳", year: "2020", notes: "Hanoi egg coffee and Ha Long karst waters", visits: 1 },
  { id: "TR", name: "Turkey", status: "visited", flag: "🇹🇷", year: "2023", notes: "Bosphorus breeze and Cappadocia balloons", visits: 1 },
  { id: "NL", name: "Netherlands", status: "visited", flag: "🇳🇱", year: "2021", notes: "Cycling along Amsterdam canals", visits: 1 },

  // Want to visit (5)
  { id: "IS", name: "Iceland", status: "want", flag: "🇮🇸", year: "Planned 2025", notes: "Northern lights & black sand beaches", visits: 0 },
  { id: "NO", name: "Norway", status: "want", flag: "🇳🇴", year: "Planned 2025", notes: "Fjord trekking and midnight sun", visits: 0 },
  { id: "NZ", name: "New Zealand", status: "want", flag: "🇳🇿", year: "Wishlist", notes: "Milford Sound and Queenstown trails", visits: 0 },
  { id: "PE", name: "Peru", status: "want", flag: "🇵🇪", year: "Wishlist", notes: "Inca trail & Sacred Valley", visits: 0 },
  { id: "MA", name: "Morocco", status: "want", flag: "🇲🇦", year: "Wishlist", notes: "Marrakech medina & blue streets of Chefchaouen", visits: 0 },
];

export const passportStamps = [
  { id: "stamp-1", code: "LIS", city: "Lisbon", country: "Portugal", date: "14 OCT 2023", type: "ENTRY", accentColor: "#4F46E5", bg: "#EEF2FF" },
  { id: "stamp-2", code: "HND", city: "Tokyo", country: "Japan", date: "03 APR 2022", type: "PERMIT", accentColor: "#7C3AED", bg: "#F5F3FF" },
  { id: "stamp-3", code: "CDG", city: "Paris", country: "France", date: "21 JUL 2022", type: "TRANSIT", accentColor: "#2563EB", bg: "#EFF6FF" },
  { id: "stamp-4", code: "IST", city: "Istanbul", country: "Turkey", date: "09 SEP 2023", type: "ENTRY", accentColor: "#059669", bg: "#ECFDF5" },
];

export const availableCatalog = [
  { id: "AR", name: "Argentina", flag: "🇦🇷", continent: "South America" },
  { id: "AU", name: "Australia", flag: "🇦🇺", continent: "Oceania" },
  { id: "AT", name: "Austria", flag: "🇦🇹", continent: "Europe" },
  { id: "BE", name: "Belgium", flag: "🇧🇪", continent: "Europe" },
  { id: "CH", name: "Switzerland", flag: "🇨🇭", continent: "Europe" },
  { id: "CL", name: "Chile", flag: "🇨🇱", continent: "South America" },
  { id: "CO", name: "Colombia", flag: "🇨🇴", continent: "South America" },
  { id: "CR", name: "Costa Rica", flag: "🇨🇷", continent: "North America" },
  { id: "DK", name: "Denmark", flag: "🇩🇰", continent: "Europe" },
  { id: "EG", name: "Egypt", flag: "🇪🇬", continent: "Africa" },
  { id: "FI", name: "Finland", flag: "🇫🇮", continent: "Europe" },
  { id: "GR", name: "Greece", flag: "🇬🇷", continent: "Europe" },
  { id: "HR", name: "Croatia", flag: "🇭🇷", continent: "Europe" },
  { id: "ID", name: "Indonesia", flag: "🇮🇩", continent: "Asia" },
  { id: "IE", name: "Ireland", flag: "🇮🇪", continent: "Europe" },
  { id: "IN", name: "India", flag: "🇮🇳", continent: "Asia" },
  { id: "KR", name: "South Korea", flag: "🇰🇷", continent: "Asia" },
  { id: "MX", name: "Mexico", flag: "🇲🇽", continent: "North America" },
  { id: "MY", name: "Malaysia", flag: "🇲🇾", continent: "Asia" },
  { id: "PL", name: "Poland", flag: "🇵🇱", continent: "Europe" },
  { id: "SE", name: "Sweden", flag: "🇸🇪", continent: "Europe" },
  { id: "SG", name: "Singapore", flag: "🇸🇬", continent: "Asia" },
  { id: "TH", name: "Thailand", flag: "🇹🇭", continent: "Asia" },
  { id: "ZA", name: "South Africa", flag: "🇿🇦", continent: "Africa" },
];
