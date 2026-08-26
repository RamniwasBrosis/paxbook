import bali from "@/assets/dest/bali.jpg";
import maldives from "@/assets/dest/maldives.jpg";
import dubai from "@/assets/dest/dubai.jpg";
import thailand from "@/assets/dest/thailand.jpg";
import singapore from "@/assets/dest/singapore.jpg";
import japan from "@/assets/dest/japan.jpg";
import switzerland from "@/assets/dest/switzerland.jpg";
import europe from "@/assets/dest/europe.jpg";
import kerala from "@/assets/dest/kerala.jpg";
import rajasthan from "@/assets/dest/rajasthan.jpg";
import himachal from "@/assets/dest/himachal.jpg";
import goa from "@/assets/dest/goa.jpg";
import vietnam from "@/assets/dest/vietnam.jpg";
import malaysia from "@/assets/dest/malaysia.jpg";
import srilanka from "@/assets/dest/srilanka.jpg";
import mauritius from "@/assets/dest/mauritius.jpg";
import bhutan from "@/assets/dest/bhutan.jpg";
import heroImage from "@/assets/dest/hero.jpg";

export const hero = heroImage;

export const brand = {
  name: "Paxbook",
  tagline: "Travel | Explore | Experience",
  phone: "7300047077",
  email: "hello@paxbook.in",
  promise: "Handpicked stays, honest fares, and a dedicated expert with you from booking to boarding pass.",
};

export type TravelStyle =
  | "Honeymoon"
  | "Family"
  | "Adventure"
  | "Luxury"
  | "Budget"
  | "Seasonal";

export type Destination = {
  slug: string;
  name: string;
  country: string;
  region: "Asia" | "Middle East" | "Europe" | "Indian Ocean" | "India";
  blurb: string;
  intro: string;
  image: string;
  bestTime: string;
  idealDuration: string;
  styles: TravelStyle[];
  fromPrice: number;
  packages: number;
  visaFree: boolean;
  visaNote: string;
  thingsToDo: { title: string; text: string }[];
  hotels: { name: string; category: string; area: string }[];
  activities: string[];
  faqs: { q: string; a: string }[];
};

export const destinations: Destination[] = [
  {
    slug: "bali",
    name: "Bali",
    country: "Indonesia",
    region: "Asia",
    blurb: "Rice terraces, cliff temples and warm island evenings.",
    intro:
      "Bali balances easy beach days in the south with green, slow mornings in Ubud. It suits honeymooners and first-time international travellers equally — short flights, friendly costs and stays that look far more expensive than they are.",
    image: bali,
    bestTime: "April – October",
    idealDuration: "6 – 8 days",
    styles: ["Honeymoon", "Budget", "Family"],
    fromPrice: 46900,
    packages: 24,
    visaFree: false,
    visaNote: "Visa-on-arrival is commonly used by Indian passport holders. Our team confirms current rules before booking.",
    thingsToDo: [
      { title: "Ubud rice terraces", text: "Sunrise walk through Tegallalang followed by a jungle breakfast." },
      { title: "Nusa Penida day trip", text: "Kelingking cliff, snorkelling stops and a speedboat crossing." },
      { title: "Uluwatu sunset", text: "Cliff temple, Kecak fire dance and a seafood dinner on the sand." },
      { title: "Waterfall trail", text: "Tegenungan and Tibumana with a local guide and private transfers." },
    ],
    hotels: [
      { name: "Ubud Jungle Retreat", category: "4★ Boutique", area: "Ubud" },
      { name: "Seminyak Beach Resort", category: "5★ Resort", area: "Seminyak" },
      { name: "Nusa Dua Private Pool Villa", category: "5★ Villa", area: "Nusa Dua" },
    ],
    activities: ["Private pool villa stay", "Balinese spa evening", "Waterbom day pass", "Candlelight dinner"],
    faqs: [
      { q: "Is Bali good for a first international trip?", a: "Yes — short flights from most Indian metros, easy transfers and English-speaking guides make it a comfortable first trip." },
      { q: "How many days are ideal?", a: "6 to 8 days lets you split time between Ubud and a beach area without rushing." },
      { q: "Can the itinerary be customised?", a: "Every Paxbook itinerary is built around your dates, budget and pace. Nothing is fixed until you approve it." },
    ],
  },
  {
    slug: "maldives",
    name: "Maldives",
    country: "Maldives",
    region: "Indian Ocean",
    blurb: "Overwater villas, house reefs and absolute quiet.",
    intro:
      "The Maldives is the shortest route to a genuinely luxurious break. Pick a resort island, arrive by speedboat or seaplane, and spend the week between the house reef and your deck.",
    image: maldives,
    bestTime: "November – April",
    idealDuration: "4 – 6 days",
    styles: ["Honeymoon", "Luxury"],
    fromPrice: 89900,
    packages: 18,
    visaFree: true,
    visaNote: "Commonly a free visa-on-arrival for tourists. We reconfirm requirements before every departure.",
    thingsToDo: [
      { title: "House reef snorkelling", text: "Step off your villa deck into a living coral garden." },
      { title: "Sandbank picnic", text: "Private boat drop to an empty sandbank with a packed lunch." },
      { title: "Sunset dolphin cruise", text: "An hour on the water as pods cross the atoll." },
      { title: "Overwater spa", text: "Couples treatment with a glass floor over the lagoon." },
    ],
    hotels: [
      { name: "Lagoon Water Villa Resort", category: "5★ Resort", area: "South Malé Atoll" },
      { name: "Reef Beach Villas", category: "4★ Resort", area: "North Malé Atoll" },
      { name: "Atoll Premium Retreat", category: "5★ Luxury", area: "Baa Atoll" },
    ],
    activities: ["Seaplane transfer", "Floating breakfast", "Night fishing", "Scuba discovery dive"],
    faqs: [
      { q: "Water villa or beach villa?", a: "Most couples split the stay — beach villa first, water villa for the final nights." },
      { q: "Are meals included?", a: "We usually quote half board or all-inclusive so your on-island spend stays predictable." },
      { q: "Is it only for honeymooners?", a: "No. Several resorts have kids clubs and family villas — we shortlist based on who is travelling." },
    ],
  },
  {
    slug: "dubai",
    name: "Dubai",
    country: "UAE",
    region: "Middle East",
    blurb: "Skyline views, desert nights and effortless family days.",
    intro:
      "Dubai works brilliantly for short, high-impact holidays. Everything is close, transport is simple, and the mix of theme parks, desert safaris and observation decks keeps every age group happy.",
    image: dubai,
    bestTime: "November – March",
    idealDuration: "4 – 6 days",
    styles: ["Family", "Luxury", "Seasonal"],
    fromPrice: 54900,
    packages: 21,
    visaFree: false,
    visaNote: "Tourist visa required for Indian passport holders. Paxbook handles the application end to end.",
    thingsToDo: [
      { title: "Burj Khalifa levels 124/125", text: "Timed-entry tickets, ideally at sunset." },
      { title: "Desert safari", text: "Dune drive, camel ride and a dinner camp under the stars." },
      { title: "Dhow cruise, Dubai Marina", text: "Buffet dinner with the skyline lit up." },
      { title: "Museum of the Future", text: "One of the city's best indoor mornings." },
    ],
    hotels: [
      { name: "Marina Skyline Hotel", category: "4★ City", area: "Dubai Marina" },
      { name: "Downtown Fountain View", category: "5★ Luxury", area: "Downtown" },
      { name: "Palm Beach Resort", category: "5★ Resort", area: "Palm Jumeirah" },
    ],
    activities: ["Desert safari with BBQ", "Aquaventure waterpark", "Abu Dhabi day trip", "Dubai Frame"],
    faqs: [
      { q: "How early should we book?", a: "Peak season (Dec–Jan) hotels move fast — 6 to 8 weeks ahead is comfortable." },
      { q: "Is Dubai family friendly?", a: "Very. Most of our Dubai itineraries are built for families with children under 12." },
      { q: "Do you handle the visa?", a: "Yes, visa assistance is part of the package." },
    ],
  },
  {
    slug: "thailand",
    name: "Thailand",
    country: "Thailand",
    region: "Asia",
    blurb: "Island hopping, street food and easy value.",
    intro:
      "Thailand is the best-value international beach holiday from India. Combine Phuket or Krabi with a couple of Bangkok nights and you have a trip that feels far bigger than its price.",
    image: thailand,
    bestTime: "November – March",
    idealDuration: "5 – 7 days",
    styles: ["Budget", "Family", "Adventure"],
    fromPrice: 38900,
    packages: 26,
    visaFree: true,
    visaNote: "Currently promoted as visa-exempt for Indian tourists. We verify status at the time of booking.",
    thingsToDo: [
      { title: "Phi Phi islands by speedboat", text: "Maya Bay viewpoint, snorkel stops and a beach lunch." },
      { title: "James Bond island, Phang Nga", text: "Sea canoeing through limestone caves." },
      { title: "Bangkok temples", text: "Grand Palace and Wat Arun with a river ferry crossing." },
      { title: "Floating market morning", text: "Damnoen Saduak with a longtail boat ride." },
    ],
    hotels: [
      { name: "Patong Bay Hotel", category: "4★ Beach", area: "Phuket" },
      { name: "Krabi Cliffside Resort", category: "4★ Resort", area: "Krabi" },
      { name: "Sukhumvit City Hotel", category: "4★ City", area: "Bangkok" },
    ],
    activities: ["Speedboat island tour", "Thai cooking class", "Elephant sanctuary visit", "Chao Phraya dinner cruise"],
    faqs: [
      { q: "Phuket or Krabi?", a: "Phuket for nightlife and connectivity, Krabi for quieter beaches and dramatic scenery." },
      { q: "Is it good for families?", a: "Yes — we swap late-night stops for island days and shorter transfers." },
      { q: "What is the average budget?", a: "Most of our Thailand trips land between ₹38K and ₹85K per person depending on hotels." },
    ],
  },
  {
    slug: "singapore",
    name: "Singapore",
    country: "Singapore",
    region: "Asia",
    blurb: "Compact, spotless and made for family itineraries.",
    intro:
      "Singapore packs theme parks, gardens and skyline views into a city you can cross in 40 minutes. Ideal as a standalone short break or paired with Malaysia.",
    image: singapore,
    bestTime: "Year round",
    idealDuration: "4 – 5 days",
    styles: ["Family", "Luxury"],
    fromPrice: 62900,
    packages: 14,
    visaFree: false,
    visaNote: "E-visa required for Indian passport holders. Paxbook can file it for you.",
    thingsToDo: [
      { title: "Universal Studios Sentosa", text: "Full-day park with express options." },
      { title: "Gardens by the Bay", text: "Cloud Forest, Flower Dome and the evening light show." },
      { title: "Singapore Zoo & River Wonders", text: "Best done as a half-day morning." },
      { title: "Marina Bay Sands SkyPark", text: "City panorama at dusk." },
    ],
    hotels: [
      { name: "Clarke Quay Riverside", category: "4★ City", area: "Clarke Quay" },
      { name: "Orchard Central Hotel", category: "4★ City", area: "Orchard" },
      { name: "Sentosa Island Resort", category: "5★ Resort", area: "Sentosa" },
    ],
    activities: ["Universal Studios", "Night Safari", "Cable car to Sentosa", "Hop-on hop-off pass"],
    faqs: [
      { q: "Best time to visit?", a: "Any month works; showers are short and everything major is indoors or covered." },
      { q: "Can we combine with Malaysia?", a: "Yes, a Singapore + Kuala Lumpur / Langkawi combo is one of our most requested itineraries." },
      { q: "Is public transport easy?", a: "Very — we include a travel card in most packages." },
    ],
  },
  {
    slug: "vietnam",
    name: "Vietnam",
    country: "Vietnam",
    region: "Asia",
    blurb: "Ha Long cruises, old towns and remarkable value.",
    intro:
      "Vietnam gives you three very different trips in one country — the bay cruises of the north, the lantern-lit lanes of Hoi An, and the energy of Ho Chi Minh City.",
    image: vietnam,
    bestTime: "October – April",
    idealDuration: "6 – 8 days",
    styles: ["Budget", "Adventure", "Family"],
    fromPrice: 41900,
    packages: 12,
    visaFree: false,
    visaNote: "E-visa required for Indian passport holders. Assistance included.",
    thingsToDo: [
      { title: "Ha Long Bay overnight cruise", text: "Cabin on the water, kayaking and a cave stop." },
      { title: "Hoi An old town", text: "Lantern evening, tailoring and a riverside dinner." },
      { title: "Cu Chi tunnels", text: "Half-day history trip out of Ho Chi Minh City." },
      { title: "Ba Na Hills", text: "Cable car to the Golden Bridge." },
    ],
    hotels: [
      { name: "Hanoi Old Quarter Hotel", category: "4★ City", area: "Hanoi" },
      { name: "Da Nang Beachfront", category: "4★ Beach", area: "Da Nang" },
      { name: "Ha Long Deluxe Cruise", category: "Cruise", area: "Ha Long Bay" },
    ],
    activities: ["Overnight cruise cabin", "Street food walk", "Golden Bridge visit", "Mekong delta boat"],
    faqs: [
      { q: "North or south?", a: "First-timers usually do Hanoi + Ha Long + Da Nang; add the south only if you have 9+ days." },
      { q: "Is it budget friendly?", a: "Yes, Vietnam is one of the strongest value destinations we sell." },
      { q: "Are internal flights needed?", a: "Usually one short domestic hop, which we include in the quote." },
    ],
  },
  {
    slug: "malaysia",
    name: "Malaysia",
    country: "Malaysia",
    region: "Asia",
    blurb: "Rainforest islands and a very easy first flight abroad.",
    intro:
      "Kuala Lumpur's skyline plus Langkawi's beaches make Malaysia a relaxed, affordable and visa-light introduction to Southeast Asia.",
    image: malaysia,
    bestTime: "December – April",
    idealDuration: "5 – 7 days",
    styles: ["Family", "Budget"],
    fromPrice: 39900,
    packages: 11,
    visaFree: true,
    visaNote: "Visa-free entry has been extended to Indian tourists in recent policy updates. Always reconfirmed before travel.",
    thingsToDo: [
      { title: "Petronas Towers", text: "Skybridge tickets and the KLCC park fountain show." },
      { title: "Langkawi Sky Bridge", text: "Cable car through rainforest to the curved bridge." },
      { title: "Island hopping, Langkawi", text: "Dayang Bunting lake and eagle feeding." },
      { title: "Batu Caves", text: "Colourful steps and a short morning trip from KL." },
    ],
    hotels: [
      { name: "Bukit Bintang City Hotel", category: "4★ City", area: "Kuala Lumpur" },
      { name: "Pantai Cenang Resort", category: "4★ Beach", area: "Langkawi" },
      { name: "Langkawi Cliff Villas", category: "5★ Resort", area: "Langkawi" },
    ],
    activities: ["Sky Bridge cable car", "Island hopping boat", "Sunset cruise", "KL city tour"],
    faqs: [
      { q: "KL or Langkawi first?", a: "KL first, then wind down in Langkawi before flying home." },
      { q: "Good for elderly parents?", a: "Yes — short transfers, lifts everywhere and easy vegetarian food." },
      { q: "How is connectivity?", a: "Direct flights from several Indian cities keep the trip short." },
    ],
  },
  {
    slug: "japan",
    name: "Japan",
    country: "Japan",
    region: "Asia",
    blurb: "Bullet trains, blossom season and precise, beautiful days.",
    intro:
      "Japan rewards planning. We build the rail pass, the seat reservations and the neighbourhood order so your days flow instead of fighting the timetable.",
    image: japan,
    bestTime: "March – May, October – November",
    idealDuration: "8 – 11 days",
    styles: ["Luxury", "Family", "Seasonal"],
    fromPrice: 154900,
    packages: 9,
    visaFree: false,
    visaNote: "Tourist visa required. Documentation support included in the package.",
    thingsToDo: [
      { title: "Kyoto temple trail", text: "Fushimi Inari at dawn, Arashiyama bamboo by mid-morning." },
      { title: "Shinkansen to Osaka", text: "Reserved seats and a food crawl in Dotonbori." },
      { title: "Mount Fuji day", text: "Lake Kawaguchi views and a ropeway ride." },
      { title: "Tokyo neighbourhoods", text: "Shibuya, Asakusa and teamLab." },
    ],
    hotels: [
      { name: "Shinjuku Tower Hotel", category: "4★ City", area: "Tokyo" },
      { name: "Kyoto Machiya Stay", category: "4★ Boutique", area: "Kyoto" },
      { name: "Hakone Onsen Ryokan", category: "5★ Ryokan", area: "Hakone" },
    ],
    activities: ["JR rail pass", "teamLab tickets", "Ryokan onsen night", "Sumo or kabuki evening"],
    faqs: [
      { q: "When is blossom season?", a: "Late March to early April in most cities, but it shifts every year — we track forecasts." },
      { q: "Is a rail pass worth it?", a: "For multi-city routes, usually yes. We compare pass vs point-to-point in your quote." },
      { q: "Is Japan expensive?", a: "Mid-range Japan is comparable to Europe; we control cost through hotel location and rail choices." },
    ],
  },
  {
    slug: "switzerland",
    name: "Switzerland",
    country: "Switzerland",
    region: "Europe",
    blurb: "Alpine trains, lake towns and postcard mornings.",
    intro:
      "Switzerland is best travelled slowly with a good base town and scenic rail between them. We keep the transfers short so you spend the day on viewpoints, not platforms.",
    image: switzerland,
    bestTime: "May – September, December for snow",
    idealDuration: "7 – 9 days",
    styles: ["Honeymoon", "Luxury", "Family"],
    fromPrice: 169900,
    packages: 10,
    visaFree: false,
    visaNote: "Schengen visa required. Paxbook assists with appointments and documentation.",
    thingsToDo: [
      { title: "Jungfraujoch", text: "Top of Europe by cogwheel train." },
      { title: "Lake Lucerne cruise", text: "Boat plus Mount Pilatus golden round trip." },
      { title: "Interlaken paragliding", text: "Twenty minutes over the twin lakes." },
      { title: "Zermatt & Matterhorn", text: "Gornergrat railway on a clear morning." },
    ],
    hotels: [
      { name: "Interlaken Alpine Hotel", category: "4★ Alpine", area: "Interlaken" },
      { name: "Lucerne Lakeview", category: "4★ City", area: "Lucerne" },
      { name: "Zermatt Chalet Suites", category: "5★ Chalet", area: "Zermatt" },
    ],
    activities: ["Swiss Travel Pass", "Jungfraujoch excursion", "Paragliding", "Glacier Express leg"],
    faqs: [
      { q: "Swiss Travel Pass or individual tickets?", a: "For 4+ travel days the pass usually wins; we run the numbers for your route." },
      { q: "Can we add Paris?", a: "Yes — a Switzerland + Paris rail combination is very popular." },
      { q: "Best base towns?", a: "Interlaken and Lucerne cover most highlights with minimal repacking." },
    ],
  },
  {
    slug: "europe",
    name: "Europe",
    country: "Multi-country",
    region: "Europe",
    blurb: "Multi-city classics stitched together properly.",
    intro:
      "Paris, Amsterdam, Swiss Alps, Rome — the classic circuits work only when the transfers are planned well. We sequence cities by rail and flight time, not by wish list order.",
    image: europe,
    bestTime: "April – October",
    idealDuration: "9 – 14 days",
    styles: ["Honeymoon", "Luxury", "Family"],
    fromPrice: 189900,
    packages: 16,
    visaFree: false,
    visaNote: "Schengen visa required. Full documentation support provided.",
    thingsToDo: [
      { title: "Paris in two days", text: "Eiffel summit, Seine cruise and a Louvre morning." },
      { title: "Amsterdam canals", text: "Canal cruise plus a Zaanse Schans half day." },
      { title: "Rome & Vatican", text: "Skip-the-line Colosseum and Vatican Museums." },
      { title: "Venice", text: "Gondola ride and a Murano glass workshop." },
    ],
    hotels: [
      { name: "Paris Left Bank Hotel", category: "4★ City", area: "Paris" },
      { name: "Amsterdam Canal House", category: "4★ Boutique", area: "Amsterdam" },
      { name: "Rome Centro Storico", category: "4★ City", area: "Rome" },
    ],
    activities: ["Eurail segments", "Skip-the-line passes", "Seine dinner cruise", "Gondola ride"],
    faqs: [
      { q: "How many cities in 10 days?", a: "Three, four at most. More cities means more time in stations." },
      { q: "Group tour or private?", a: "We build both; private costs more but the pace is yours." },
      { q: "When to apply for the visa?", a: "Start 8–10 weeks before departure, especially in summer." },
    ],
  },
  {
    slug: "rajasthan",
    name: "Rajasthan",
    country: "India",
    region: "India",
    blurb: "Palace hotels, desert forts and colour everywhere.",
    intro:
      "Udaipur, Jodhpur and Jaisalmer in one loop, with heritage stays that cost a fraction of their international equivalents.",
    image: rajasthan,
    bestTime: "October – March",
    idealDuration: "6 – 8 days",
    styles: ["Luxury", "Family", "Seasonal"],
    fromPrice: 24900,
    packages: 19,
    visaFree: true,
    visaNote: "Domestic destination — no visa required.",
    thingsToDo: [
      { title: "Udaipur lake palaces", text: "City Palace, boat ride and a rooftop dinner." },
      { title: "Jaisalmer desert camp", text: "Dune sunset, folk music and a night under the stars." },
      { title: "Mehrangarh Fort", text: "Jodhpur's blue city from the ramparts." },
      { title: "Amber Fort, Jaipur", text: "Morning visit before the crowds build." },
    ],
    hotels: [
      { name: "Udaipur Lakeview Haveli", category: "4★ Heritage", area: "Udaipur" },
      { name: "Jaisalmer Luxury Camp", category: "Camp", area: "Sam Dunes" },
      { name: "Jaipur Palace Hotel", category: "5★ Heritage", area: "Jaipur" },
    ],
    activities: ["Desert camp night", "Vintage car city tour", "Cooking session", "Folk dance evening"],
    faqs: [
      { q: "Best circuit for 7 days?", a: "Jaipur → Jodhpur → Jaisalmer, or Udaipur → Jodhpur if you prefer a slower pace." },
      { q: "Is summer travel possible?", a: "It is very hot from April to June; we'd suggest hill destinations instead." },
      { q: "Train or car?", a: "Private car with driver gives the most flexibility across the state." },
    ],
  },
  {
    slug: "kerala",
    name: "Kerala",
    country: "India",
    region: "India",
    blurb: "Backwater houseboats, tea hills and slow green days.",
    intro:
      "Munnar, Thekkady and Alleppey form a compact loop that works for honeymooners and families alike, all within short drives.",
    image: kerala,
    bestTime: "September – March",
    idealDuration: "5 – 7 days",
    styles: ["Honeymoon", "Family", "Budget"],
    fromPrice: 21900,
    packages: 17,
    visaFree: true,
    visaNote: "Domestic destination — no visa required.",
    thingsToDo: [
      { title: "Alleppey houseboat", text: "Overnight on the backwaters with onboard meals." },
      { title: "Munnar tea estates", text: "Plantation walk and the tea museum." },
      { title: "Periyar wildlife", text: "Early boat safari on the lake." },
      { title: "Fort Kochi", text: "Chinese fishing nets and a Kathakali evening." },
    ],
    hotels: [
      { name: "Munnar Hillside Resort", category: "4★ Hill", area: "Munnar" },
      { name: "Alleppey Premium Houseboat", category: "Houseboat", area: "Alleppey" },
      { name: "Kochi Heritage Hotel", category: "4★ Heritage", area: "Fort Kochi" },
    ],
    activities: ["Houseboat night", "Ayurvedic massage", "Spice plantation tour", "Kathakali show"],
    faqs: [
      { q: "Monsoon travel?", a: "June to August is lush and cheaper, but plan for rain most afternoons." },
      { q: "How much driving?", a: "Each leg is roughly 3–4 hours; we break long drives with viewpoint stops." },
      { q: "Good for honeymoon?", a: "Yes — private houseboat plus a hill resort is our most booked Kerala combination." },
    ],
  },
  {
    slug: "himachal",
    name: "Himachal",
    country: "India",
    region: "India",
    blurb: "Snow valleys, pine drives and mountain quiet.",
    intro:
      "From Shimla and Manali to Spiti's high desert, Himachal scales from easy family holidays to serious adventure routes.",
    image: himachal,
    bestTime: "March – June, December – February for snow",
    idealDuration: "5 – 8 days",
    styles: ["Adventure", "Family", "Budget", "Seasonal"],
    fromPrice: 18900,
    packages: 15,
    visaFree: true,
    visaNote: "Domestic destination — no visa required.",
    thingsToDo: [
      { title: "Solang Valley", text: "Snow activities in winter, paragliding in summer." },
      { title: "Atal Tunnel & Sissu", text: "Day trip into the Lahaul valley." },
      { title: "Old Manali cafés", text: "Slow mornings by the river." },
      { title: "Shimla ridge walk", text: "Colonial-era mall road and toy train." },
    ],
    hotels: [
      { name: "Manali Riverside Resort", category: "4★ Hill", area: "Manali" },
      { name: "Shimla Ridge Hotel", category: "3★ Hill", area: "Shimla" },
      { name: "Kasol Pine Cottages", category: "Boutique", area: "Kasol" },
    ],
    activities: ["Paragliding", "River rafting", "Snow point excursion", "Bonfire evening"],
    faqs: [
      { q: "Where is guaranteed snow?", a: "January–February around Solang and Sissu, subject to weather that season." },
      { q: "Volvo or flight?", a: "Flights to Bhuntar save a full day; overnight coaches are the budget route." },
      { q: "Suitable for kids?", a: "Yes for Shimla–Manali; Spiti is better for older children and adults." },
    ],
  },
  {
    slug: "goa",
    name: "Goa",
    country: "India",
    region: "India",
    blurb: "Beach shacks, Portuguese lanes and easy long weekends.",
    intro:
      "North Goa for energy, south Goa for calm. Perfect for a 3-day reset that needs almost no planning from your side.",
    image: goa,
    bestTime: "November – February",
    idealDuration: "3 – 5 days",
    styles: ["Budget", "Family", "Honeymoon"],
    fromPrice: 14900,
    packages: 13,
    visaFree: true,
    visaNote: "Domestic destination — no visa required.",
    thingsToDo: [
      { title: "Sunset at Anjuna", text: "Cliffside cafés and a flea market afternoon." },
      { title: "Old Goa churches", text: "Basilica of Bom Jesus and Se Cathedral." },
      { title: "Dudhsagar falls", text: "Jeep safari through the Mollem forest." },
      { title: "South Goa beaches", text: "Palolem and Agonda, far quieter than the north." },
    ],
    hotels: [
      { name: "Candolim Beach Resort", category: "4★ Beach", area: "North Goa" },
      { name: "Palolem Boutique Stay", category: "Boutique", area: "South Goa" },
      { name: "Panjim Heritage House", category: "3★ Heritage", area: "Panjim" },
    ],
    activities: ["Water sports combo", "Sunset cruise", "Spice farm lunch", "Scooter rental"],
    faqs: [
      { q: "North or south Goa?", a: "North for nightlife and cafés, south for quiet beaches and resorts." },
      { q: "Cheapest months?", a: "May to September, though the monsoon closes many water activities." },
      { q: "Is a car needed?", a: "A scooter or a private car makes a big difference; we can arrange both." },
    ],
  },
  {
    slug: "sri-lanka",
    name: "Sri Lanka",
    country: "Sri Lanka",
    region: "Asia",
    blurb: "Tea trains, safari parks and short flying times.",
    intro:
      "A compact island where you can move from beaches to hill country tea estates in one scenic train ride.",
    image: srilanka,
    bestTime: "December – April",
    idealDuration: "6 – 8 days",
    styles: ["Family", "Budget", "Adventure"],
    fromPrice: 43900,
    packages: 8,
    visaFree: true,
    visaNote: "Free tourist ETA has been offered to Indian travellers in recent policy rounds. Reconfirmed before booking.",
    thingsToDo: [
      { title: "Kandy to Ella train", text: "One of the world's great rail journeys." },
      { title: "Yala safari", text: "Morning jeep drive for leopards and elephants." },
      { title: "Sigiriya rock", text: "Early climb before the heat." },
      { title: "Galle Fort", text: "Rampart walk at sunset." },
    ],
    hotels: [
      { name: "Kandy Lake Hotel", category: "4★ City", area: "Kandy" },
      { name: "Ella Valley Cabins", category: "Boutique", area: "Ella" },
      { name: "Bentota Beach Resort", category: "4★ Beach", area: "Bentota" },
    ],
    activities: ["Scenic train seats", "Yala safari jeep", "Tea factory visit", "Whale watching (seasonal)"],
    faqs: [
      { q: "How many days are enough?", a: "Seven days covers hill country, one safari park and a beach stay." },
      { q: "Is self-drive advisable?", a: "We recommend a car with driver; roads are narrow and slow." },
      { q: "Is it family friendly?", a: "Yes, with shorter driving days and a beach base at the end." },
    ],
  },
  {
    slug: "mauritius",
    name: "Mauritius",
    country: "Mauritius",
    region: "Indian Ocean",
    blurb: "Lagoon blues with a slower, greener island rhythm.",
    intro:
      "Mauritius pairs Maldives-grade water with mountains, waterfalls and villages, so there is plenty to do beyond the beach.",
    image: mauritius,
    bestTime: "May – December",
    idealDuration: "6 – 7 days",
    styles: ["Honeymoon", "Family", "Luxury"],
    fromPrice: 74900,
    packages: 9,
    visaFree: true,
    visaNote: "Visa-on-arrival is commonly granted to Indian tourists. Confirmed before each departure.",
    thingsToDo: [
      { title: "Île aux Cerfs", text: "Speedboat day trip with a beach barbecue." },
      { title: "Chamarel", text: "Seven coloured earths and the waterfall viewpoint." },
      { title: "Blue Bay catamaran", text: "Snorkelling in the marine park." },
      { title: "Port Louis market", text: "Street food and local crafts." },
    ],
    hotels: [
      { name: "Grand Baie Beach Resort", category: "4★ Beach", area: "Grand Baie" },
      { name: "Flic en Flac Lagoon Hotel", category: "5★ Resort", area: "Flic en Flac" },
      { name: "Belle Mare Luxury Villas", category: "5★ Villa", area: "Belle Mare" },
    ],
    activities: ["Catamaran cruise", "Underwater sea walk", "Quad biking", "Dolphin watching"],
    faqs: [
      { q: "Mauritius or Maldives?", a: "Maldives for pure resort isolation, Mauritius when you want sightseeing too." },
      { q: "How long is the flight?", a: "Roughly six to seven hours from major Indian metros." },
      { q: "All-inclusive worth it?", a: "Often yes, since restaurants outside resorts can be spread out." },
    ],
  },
  {
    slug: "bhutan",
    name: "Bhutan",
    country: "Bhutan",
    region: "Asia",
    blurb: "Monasteries, mountain air and unhurried days.",
    intro:
      "Bhutan is quiet, careful travel — cliffside monasteries, clean valleys and a pace that resets you within two days.",
    image: bhutan,
    bestTime: "March – May, September – November",
    idealDuration: "5 – 7 days",
    styles: ["Adventure", "Honeymoon", "Seasonal"],
    fromPrice: 49900,
    packages: 7,
    visaFree: true,
    visaNote: "Indian travellers use a permit process rather than a standard visa. A daily levy applies; we include it in the quote.",
    thingsToDo: [
      { title: "Tiger's Nest hike", text: "Four to five hours return from the Paro valley floor." },
      { title: "Punakha Dzong", text: "River confluence and the suspension bridge." },
      { title: "Dochula Pass", text: "108 chortens with a Himalayan skyline on clear days." },
      { title: "Thimphu markets", text: "Weekend crafts and a national museum visit." },
    ],
    hotels: [
      { name: "Paro Valley Lodge", category: "3★ Lodge", area: "Paro" },
      { name: "Thimphu Boutique Hotel", category: "4★ City", area: "Thimphu" },
      { name: "Punakha River Resort", category: "4★ Resort", area: "Punakha" },
    ],
    activities: ["Tiger's Nest trek", "Hot stone bath", "Archery session", "Monastery blessing"],
    faqs: [
      { q: "How fit do I need to be?", a: "The Tiger's Nest hike is moderate; ponies are available for part of the climb." },
      { q: "By road or air?", a: "Fly into Paro for comfort, or drive in via Phuentsholing to save cost." },
      { q: "Is the daily fee included?", a: "Yes, our quotes show it as a separate, transparent line item." },
    ],
  },
];

export const destinationBySlug = (slug: string) => destinations.find((d) => d.slug === slug);

export type Package = {
  slug: string;
  title: string;
  destinationSlug: string;
  destination: string;
  nights: number;
  days: number;
  fromPrice: number;
  rating: number;
  reviews: number;
  hotelCategory: "3★" | "4★" | "5★";
  styles: TravelStyle[];
  highlights: string[];
  inclusions: string[];
  flights: string;
  itinerary: { day: string; title: string; text: string }[];
};

const it = (rows: [string, string][]) =>
  rows.map(([title, text], i) => ({ day: `Day ${i + 1}`, title, text }));

export const packages: Package[] = [
  {
    slug: "bali-honeymoon-escape",
    title: "Bali Honeymoon Escape",
    destinationSlug: "bali",
    destination: "Bali, Indonesia",
    nights: 5,
    days: 6,
    fromPrice: 58900,
    rating: 4.8,
    reviews: 126,
    hotelCategory: "4★",
    styles: ["Honeymoon", "Budget"],
    highlights: ["Private pool villa", "Nusa Penida speedboat", "Candlelight dinner", "Uluwatu sunset"],
    inclusions: ["5 nights stay", "Daily breakfast", "Private transfers", "All listed tours", "Visa assistance"],
    flights: "Return economy flights quoted separately or bundled on request",
    itinerary: it([
      ["Arrival in Bali", "Airport pick-up, welcome drink and an easy evening at the resort."],
      ["Ubud green day", "Tegallalang terraces, a jungle swing stop and the sacred monkey forest."],
      ["Nusa Penida", "Speedboat crossing, Kelingking viewpoint and a snorkelling stop at Crystal Bay."],
      ["Uluwatu & Seminyak", "Cliff temple, Kecak dance and a beach club sunset."],
      ["Free day + spa", "Balinese couple's spa and a candlelight dinner by the pool."],
      ["Departure", "Breakfast, checkout and an airport transfer."],
    ]),
  },
  {
    slug: "maldives-water-villa-retreat",
    title: "Maldives Water Villa Retreat",
    destinationSlug: "maldives",
    destination: "Maldives",
    nights: 4,
    days: 5,
    fromPrice: 118900,
    rating: 4.9,
    reviews: 84,
    hotelCategory: "5★",
    styles: ["Honeymoon", "Luxury"],
    highlights: ["2 nights water villa", "Half board meals", "Sunset dolphin cruise", "Floating breakfast"],
    inclusions: ["4 nights resort stay", "Speedboat transfers", "Half board", "Honeymoon setup", "Snorkelling gear"],
    flights: "Return flights to Malé can be added to your quote",
    itinerary: it([
      ["Arrival at Malé", "Speedboat to the resort, welcome ceremony and a beach villa check-in."],
      ["Reef day", "House-reef snorkelling and an afternoon at the infinity pool."],
      ["Sandbank & dolphins", "Private sandbank picnic followed by a sunset dolphin cruise."],
      ["Water villa move", "Shift to the overwater villa with a floating breakfast and spa session."],
      ["Departure", "Late breakfast and speedboat back to Malé."],
    ]),
  },
  {
    slug: "dubai-family-holiday",
    title: "Dubai Family Holiday",
    destinationSlug: "dubai",
    destination: "Dubai, UAE",
    nights: 4,
    days: 5,
    fromPrice: 61900,
    rating: 4.7,
    reviews: 208,
    hotelCategory: "4★",
    styles: ["Family", "Seasonal"],
    highlights: ["Burj Khalifa 124/125", "Desert safari", "Dhow dinner cruise", "Abu Dhabi day trip"],
    inclusions: ["4 nights hotel", "Daily breakfast", "All transfers", "Tour tickets", "Visa assistance"],
    flights: "Return economy flights available on request",
    itinerary: it([
      ["Arrival", "Meet and greet, hotel check-in and a Marina walk in the evening."],
      ["City & Burj Khalifa", "Half-day city tour with a timed sunset slot at the observation deck."],
      ["Desert safari", "Dune bashing, camel ride and a BBQ dinner with live entertainment."],
      ["Abu Dhabi", "Sheikh Zayed Grand Mosque and a Corniche drive."],
      ["Departure", "Free morning for shopping, then airport transfer."],
    ]),
  },
  {
    slug: "thailand-island-hopper",
    title: "Thailand Island Hopper",
    destinationSlug: "thailand",
    destination: "Phuket & Krabi, Thailand",
    nights: 6,
    days: 7,
    fromPrice: 44900,
    rating: 4.6,
    reviews: 173,
    hotelCategory: "4★",
    styles: ["Budget", "Adventure", "Family"],
    highlights: ["Phi Phi speedboat tour", "James Bond island", "Krabi beach stay", "Bangkok city night"],
    inclusions: ["6 nights stay", "Breakfast daily", "Shared transfers", "Two island tours", "Airport assistance"],
    flights: "One internal flight included in the quote",
    itinerary: it([
      ["Arrive Phuket", "Transfer to Patong and an evening beach walk."],
      ["Phi Phi islands", "Full-day speedboat tour with lunch and snorkelling."],
      ["Phang Nga bay", "James Bond island and sea canoeing through the caves."],
      ["Krabi transfer", "Drive to Ao Nang and a relaxed beach afternoon."],
      ["Four islands tour", "Longtail boat to Tup, Chicken and Poda islands."],
      ["Bangkok", "Flight to Bangkok, temple stop and a night market."],
      ["Departure", "Breakfast and transfer to the airport."],
    ]),
  },
  {
    slug: "switzerland-alpine-classic",
    title: "Switzerland Alpine Classic",
    destinationSlug: "switzerland",
    destination: "Switzerland",
    nights: 7,
    days: 8,
    fromPrice: 189900,
    rating: 4.9,
    reviews: 61,
    hotelCategory: "4★",
    styles: ["Honeymoon", "Luxury", "Family"],
    highlights: ["Jungfraujoch", "Mount Pilatus golden round", "Swiss Travel Pass", "Lake Lucerne cruise"],
    inclusions: ["7 nights stay", "Swiss Travel Pass", "Breakfast daily", "Excursion tickets", "Visa assistance"],
    flights: "Return flights to Zurich quoted separately",
    itinerary: it([
      ["Arrive Zurich", "Train to Lucerne and a lakeside evening."],
      ["Mount Pilatus", "Golden round trip by cogwheel, cable car and boat."],
      ["To Interlaken", "Scenic rail transfer and a Harder Kulm sunset."],
      ["Jungfraujoch", "Top of Europe with the ice palace and plateau."],
      ["Grindelwald First", "Cliff walk, first flyer and mountain carts."],
      ["Zermatt", "Gornergrat railway and Matterhorn views."],
      ["Free day", "Optional paragliding or a Lauterbrunnen valley walk."],
      ["Departure", "Transfer to Zurich airport."],
    ]),
  },
  {
    slug: "kerala-backwater-serenity",
    title: "Kerala Backwater Serenity",
    destinationSlug: "kerala",
    destination: "Kerala, India",
    nights: 5,
    days: 6,
    fromPrice: 26900,
    rating: 4.7,
    reviews: 142,
    hotelCategory: "4★",
    styles: ["Honeymoon", "Family", "Budget"],
    highlights: ["Alleppey houseboat night", "Munnar tea estates", "Periyar boat safari", "Ayurvedic spa"],
    inclusions: ["5 nights stay", "All meals on houseboat", "Private car with driver", "Sightseeing", "Airport transfers"],
    flights: "Domestic flights can be added to your quote",
    itinerary: it([
      ["Arrive Kochi", "Fort Kochi walk and a Kathakali performance."],
      ["To Munnar", "Waterfall stops en route and a tea estate evening."],
      ["Munnar sightseeing", "Eravikulam park, Mattupetty dam and the tea museum."],
      ["Thekkady", "Spice plantation tour and a Periyar lake boat ride."],
      ["Alleppey houseboat", "Board a private houseboat with lunch, dinner and breakfast onboard."],
      ["Departure", "Disembark and transfer to Kochi airport."],
    ]),
  },
  {
    slug: "rajasthan-royal-trail",
    title: "Rajasthan Royal Trail",
    destinationSlug: "rajasthan",
    destination: "Rajasthan, India",
    nights: 6,
    days: 7,
    fromPrice: 32900,
    rating: 4.6,
    reviews: 98,
    hotelCategory: "4★",
    styles: ["Luxury", "Family", "Seasonal"],
    highlights: ["Udaipur palace stay", "Jaisalmer desert camp", "Mehrangarh fort", "Folk music night"],
    inclusions: ["6 nights stay", "Breakfast daily", "Private car with driver", "Monument guide", "Camp dinner"],
    flights: "Domestic flights can be bundled on request",
    itinerary: it([
      ["Arrive Udaipur", "City Palace and a Lake Pichola sunset boat ride."],
      ["Udaipur to Jodhpur", "Ranakpur temple stop en route."],
      ["Jodhpur", "Mehrangarh fort and the blue city lanes."],
      ["To Jaisalmer", "Long drive with a desert highway stop."],
      ["Jaisalmer", "Golden fort, havelis and a Sam dunes camp night."],
      ["To Jaipur", "Travel day with an evening at Chokhi Dhani."],
      ["Jaipur & departure", "Amber Fort in the morning, then airport transfer."],
    ]),
  },
  {
    slug: "singapore-malaysia-combo",
    title: "Singapore + Malaysia Combo",
    destinationSlug: "singapore",
    destination: "Singapore & Malaysia",
    nights: 6,
    days: 7,
    fromPrice: 78900,
    rating: 4.7,
    reviews: 87,
    hotelCategory: "4★",
    styles: ["Family", "Luxury"],
    highlights: ["Universal Studios", "Gardens by the Bay", "Genting cable car", "Petronas Towers"],
    inclusions: ["6 nights stay", "Breakfast daily", "Inter-city coach", "Attraction tickets", "E-visa assistance"],
    flights: "Return flights quoted separately",
    itinerary: it([
      ["Arrive Singapore", "Transfer, evening at Marina Bay light show."],
      ["Sentosa", "Universal Studios with a cable car ride."],
      ["City & Gardens", "City tour, Gardens by the Bay domes and the Supertree show."],
      ["To Kuala Lumpur", "Coach transfer with a Malacca photo stop."],
      ["KL city", "Batu Caves, Petronas twin towers and KL Tower."],
      ["Genting Highlands", "Cable car, theme park and a hilltop lunch."],
      ["Departure", "Free morning and airport transfer."],
    ]),
  },
  {
    slug: "vietnam-discovery",
    title: "Vietnam Discovery",
    destinationSlug: "vietnam",
    destination: "Vietnam",
    nights: 6,
    days: 7,
    fromPrice: 49900,
    rating: 4.6,
    reviews: 64,
    hotelCategory: "4★",
    styles: ["Adventure", "Budget", "Family"],
    highlights: ["Ha Long overnight cruise", "Golden Bridge", "Hoi An lanterns", "Street food walk"],
    inclusions: ["6 nights stay", "Cruise full board", "One internal flight", "Transfers", "E-visa assistance"],
    flights: "Internal Hanoi–Da Nang flight included",
    itinerary: it([
      ["Arrive Hanoi", "Old Quarter walk and a water puppet show."],
      ["Ha Long Bay", "Overnight cruise with kayaking and a cave visit."],
      ["Back to Hanoi", "Cruise brunch, return drive and a street food evening."],
      ["Fly to Da Nang", "Beach afternoon and the Dragon Bridge at night."],
      ["Ba Na Hills", "Cable car, Golden Bridge and French village."],
      ["Hoi An", "Ancient town, tailoring and a lantern boat ride."],
      ["Departure", "Transfer to Da Nang airport."],
    ]),
  },
  {
    slug: "goa-long-weekend",
    title: "Goa Long Weekend",
    destinationSlug: "goa",
    destination: "Goa, India",
    nights: 3,
    days: 4,
    fromPrice: 16900,
    rating: 4.4,
    reviews: 219,
    hotelCategory: "4★",
    styles: ["Budget", "Family", "Honeymoon"],
    highlights: ["Beachfront resort", "Sunset cruise", "Water sports combo", "Old Goa tour"],
    inclusions: ["3 nights stay", "Breakfast daily", "Airport transfers", "Sunset cruise", "North Goa tour"],
    flights: "Domestic flights available on request",
    itinerary: it([
      ["Arrival", "Check-in at a beachfront resort and a Candolim sunset."],
      ["North Goa", "Fort Aguada, Calangute and a water sports session."],
      ["Old Goa & cruise", "Churches, Panjim lanes and a Mandovi river cruise."],
      ["Departure", "Breakfast and airport transfer."],
    ]),
  },
  {
    slug: "himachal-snow-adventure",
    title: "Himachal Snow Adventure",
    destinationSlug: "himachal",
    destination: "Shimla & Manali, India",
    nights: 5,
    days: 6,
    fromPrice: 22900,
    rating: 4.5,
    reviews: 131,
    hotelCategory: "3★",
    styles: ["Adventure", "Budget", "Seasonal"],
    highlights: ["Solang valley", "Atal Tunnel drive", "Kufri excursion", "Bonfire evening"],
    inclusions: ["5 nights stay", "Breakfast & dinner", "Private cab", "Sightseeing", "Bonfire night"],
    flights: "Flights to Chandigarh or Bhuntar can be added",
    itinerary: it([
      ["Arrive Shimla", "Mall road and ridge walk in the evening."],
      ["Kufri", "Snow point excursion and horse riding."],
      ["To Manali", "Scenic drive along the Beas with river stops."],
      ["Solang valley", "Ropeway, snow activities and paragliding option."],
      ["Atal Tunnel & Sissu", "Day trip into Lahaul with a packed lunch."],
      ["Departure", "Old Manali café breakfast and drop."],
    ]),
  },
  {
    slug: "europe-highlights",
    title: "Europe Highlights: Paris, Swiss & Rome",
    destinationSlug: "europe",
    destination: "France, Switzerland, Italy",
    nights: 10,
    days: 11,
    fromPrice: 234900,
    rating: 4.8,
    reviews: 52,
    hotelCategory: "4★",
    styles: ["Honeymoon", "Luxury", "Family"],
    highlights: ["Eiffel summit", "Jungfraujoch", "Vatican skip-the-line", "Venice gondola"],
    inclusions: ["10 nights stay", "Breakfast daily", "Rail segments", "Entry tickets", "Schengen visa support"],
    flights: "Return flights and internal rail quoted in your proposal",
    itinerary: it([
      ["Arrive Paris", "Seine evening cruise after check-in."],
      ["Paris", "Eiffel summit, Louvre and Montmartre."],
      ["Disneyland or Versailles", "Choose your day out of the city."],
      ["To Switzerland", "High-speed rail to Lucerne."],
      ["Mount Pilatus", "Golden round trip and lake cruise."],
      ["Interlaken", "Jungfraujoch excursion."],
      ["To Venice", "Rail transfer and an evening in San Marco."],
      ["Venice", "Gondola ride and Murano glass workshop."],
      ["To Rome", "Train south, Trevi and Spanish Steps at night."],
      ["Rome", "Colosseum and Vatican Museums with skip-the-line entry."],
      ["Departure", "Transfer to Rome airport."],
    ]),
  },
];

export const packageBySlug = (slug: string) => packages.find((p) => p.slug === slug);

export const priceBands = [
  { id: "all", label: "All" },
  { id: "u50", label: "Under ₹50K", test: (n: number) => n < 50000 },
  { id: "50-150", label: "₹50K – ₹1.5L", test: (n: number) => n >= 50000 && n < 150000 },
  { id: "150-250", label: "₹1.5L – ₹2.5L", test: (n: number) => n >= 150000 && n < 250000 },
  { id: "luxury", label: "Luxury", test: (n: number) => n >= 100000 },
] as const;

export const travelStyles: { id: TravelStyle; label: string; blurb: string }[] = [
  { id: "Honeymoon", label: "Honeymoon", blurb: "Private villas, slow mornings and dinners that matter." },
  { id: "Family", label: "Family", blurb: "Short transfers, kid-friendly stays and flexible days." },
  { id: "Adventure", label: "Adventure", blurb: "Treks, dives and drives with proper local crews." },
  { id: "Luxury", label: "Luxury", blurb: "Five-star stays, private guides and seamless transfers." },
  { id: "Budget", label: "Budget", blurb: "Great value trips without cutting the good parts." },
  { id: "Seasonal", label: "Seasonal", blurb: "Snow, blossom and festival departures, timed right." },
];

export const durations = [
  { range: "2 – 3 Days", label: "Quick Getaway", note: "Weekend resets close to home", slug: "goa", nights: "2-3" },
  { range: "4 – 6 Days", label: "Short & Sweet", note: "One country, no rush", slug: "dubai", nights: "4-6" },
  { range: "7 – 10 Days", label: "More to Explore", note: "Two bases, proper depth", slug: "bali", nights: "7-10" },
  { range: "10 – 15 Days", label: "The Ultimate Journey", note: "Multi-country, once in a while", slug: "europe", nights: "10-15" },
];

export const trustPoints = [
  { title: "100% Personalized Trips", text: "Every itinerary is built around your dates, pace and budget." },
  { title: "Expert Travel Assistance", text: "A named travel expert from first call to your return flight." },
  { title: "Handpicked Experiences", text: "Stays and activities we would send our own family to." },
  { title: "24×7 On-Trip Support", text: "Someone always answers, in your timezone or ours." },
  { title: "Secure Booking", text: "Clear documentation, confirmed vouchers, no hidden add-ons." },
];

export const whyPaxbook = [
  { icon: "Sparkles", title: "Customized For You", text: "No fixed departures. Your trip is drafted, revised and approved by you." },
  { icon: "Headset", title: "Expert Travel Assistance", text: "One expert owns your file — not a rotating call centre queue." },
  { icon: "ShieldCheck", title: "Trusted & Reliable", text: "Honest fares, written inclusions and vouchers before you fly." },
  { icon: "Compass", title: "Handpicked Experiences", text: "Curated stays and activities, personally vetted by our team." },
  { icon: "LifeBuoy", title: "Worry-Free Travel", text: "Visa help, insurance guidance and on-ground contacts everywhere." },
  { icon: "Clock", title: "Dedicated Support", text: "Reachable before, during and after your journey." },
];

export const howItWorks = [
  { step: "01", title: "Choose Your Destination", text: "Browse destinations or tell our planner what you feel like." },
  { step: "02", title: "Customize Your Trip", text: "Swap hotels, add activities and set the pace with your expert." },
  { step: "03", title: "Book With Expert Support", text: "Approve the final itinerary, pay securely and get your vouchers." },
  { step: "04", title: "Travel & Create Memories", text: "Land with everything arranged and support a call away." },
];

export const testimonials = [
  {
    name: "Traveller review",
    trip: "Bali · 6 days",
    quote:
      "The itinerary was rebuilt twice until it matched what we actually wanted. Transfers were on time every single day.",
    rating: 5,
    image: bali,
  },
  {
    name: "Traveller review",
    trip: "Maldives · 5 days",
    quote:
      "Resort choice, meal plan and the water villa upgrade were explained clearly. Nothing was a surprise on arrival.",
    rating: 5,
    image: maldives,
  },
  {
    name: "Traveller review",
    trip: "Dubai · 5 days",
    quote:
      "Travelling with two kids and elderly parents — the pacing was handled better than we could have planned ourselves.",
    rating: 5,
    image: dubai,
  },
  {
    name: "Traveller review",
    trip: "Kerala · 6 days",
    quote:
      "Houseboat and the Munnar stay were both a level above what we expected at the price quoted.",
    rating: 5,
    image: kerala,
  },
];

export const visaCountries = [
  {
    slug: "dubai",
    country: "UAE (Dubai)",
    image: dubai,
    type: "Tourist e-Visa",
    processing: "3 – 5 working days",
    fee: "Shared with your quote",
    documents: ["Passport with 6 months validity", "Passport size photograph", "Confirmed flight & hotel booking"],
    freeEntry: false,
  },
  {
    slug: "thailand",
    country: "Thailand",
    image: thailand,
    type: "Visa exemption for tourists",
    processing: "On arrival",
    fee: "Nil under current exemption",
    documents: ["Passport with 6 months validity", "Return ticket", "Proof of accommodation"],
    freeEntry: true,
  },
  {
    slug: "singapore",
    country: "Singapore",
    image: singapore,
    type: "Tourist e-Visa",
    processing: "4 – 7 working days",
    fee: "Shared with your quote",
    documents: ["Passport copy", "Photograph as per spec", "Bank statement", "Confirmed itinerary"],
    freeEntry: false,
  },
  {
    slug: "maldives",
    country: "Maldives",
    image: maldives,
    type: "Free visa on arrival",
    processing: "On arrival",
    fee: "Nil",
    documents: ["Passport with 1 month validity", "Confirmed resort booking", "Return ticket"],
    freeEntry: true,
  },
  {
    slug: "vietnam",
    country: "Vietnam",
    image: vietnam,
    type: "e-Visa",
    processing: "3 – 5 working days",
    fee: "Shared with your quote",
    documents: ["Passport scan", "Digital photograph", "Travel dates & entry port"],
    freeEntry: false,
  },
  {
    slug: "switzerland",
    country: "Schengen (Switzerland / Europe)",
    image: switzerland,
    type: "Schengen short-stay visa",
    processing: "15 – 25 working days",
    fee: "Shared with your quote",
    documents: ["Application form", "Bank statements (6 months)", "ITR", "Travel insurance", "Confirmed bookings"],
    freeEntry: false,
  },
  {
    slug: "sri-lanka",
    country: "Sri Lanka",
    image: srilanka,
    type: "ETA",
    processing: "1 – 3 working days",
    fee: "Shared with your quote",
    documents: ["Passport copy", "Return ticket", "Accommodation details"],
    freeEntry: true,
  },
  {
    slug: "bhutan",
    country: "Bhutan",
    image: bhutan,
    type: "Entry permit for Indian nationals",
    processing: "2 – 4 working days",
    fee: "Daily levy applies",
    documents: ["Passport or voter ID", "Photograph", "Hotel & guide confirmation"],
    freeEntry: true,
  },
];

export const visaFree = [
  { name: "Maldives", image: maldives, note: "Free visa on arrival", slug: "maldives" },
  { name: "Thailand", image: thailand, note: "Visa exemption for tourists", slug: "thailand" },
  { name: "Sri Lanka", image: srilanka, note: "Free ETA rounds", slug: "sri-lanka" },
  { name: "Mauritius", image: mauritius, note: "Visa on arrival", slug: "mauritius" },
  { name: "Malaysia", image: malaysia, note: "Visa-free entry window", slug: "malaysia" },
  { name: "Bhutan", image: bhutan, note: "Permit, no visa needed", slug: "bhutan" },
];

export const blogs = [
  {
    slug: "bali-7-day-itinerary",
    category: "Travel Guides",
    title: "A realistic 7-day Bali itinerary that isn't exhausting",
    excerpt: "Two bases, four highlights and enough unscheduled time to actually enjoy the island.",
    date: "12 Aug 2026",
    readTime: "6 min read",
    image: bali,
    body: [
      "Most Bali itineraries try to fit the whole island into a week. The result is three hours in a car every day and a holiday that feels like a commute. The fix is simple: pick two bases, and let each one do what it does best.",
      "Start in Ubud. Three nights is enough for the rice terraces, a waterfall morning, one temple and a slow café day. Book a stay with a valley view rather than one on the main road — the price difference is small and the mornings are completely different.",
      "Then move south. Seminyak or Nusa Dua, depending on whether you want beach clubs or calm water. Keep one full day free for Nusa Penida, which needs an early start, and one entirely empty. That empty day is the one people remember.",
      "On budget: mid-range Bali is genuinely affordable, but transfers add up. Pre-booking a car with a driver for the full day usually costs less than three separate app rides, and you are not negotiating in the sun each time.",
    ],
  },
  {
    slug: "maldives-resort-choice",
    category: "Honeymoon",
    title: "How to choose a Maldives resort without overpaying",
    excerpt: "Transfer type, meal plan and house reef quality matter more than the star rating.",
    date: "04 Aug 2026",
    readTime: "5 min read",
    image: maldives,
    body: [
      "The resort you choose in the Maldives decides your entire trip, because you cannot casually change islands. Three things drive both cost and experience: how you get there, what you eat, and what is under the water outside your villa.",
      "Speedboat resorts are cheaper to reach and let you arrive at any hour. Seaplane resorts are further out, more scenic and add a significant per-person cost — and they only fly in daylight.",
      "On meals, half board is the sweet spot for most couples. All-inclusive only pays off if you drink, or if the resort is far from any alternative.",
      "Finally, ask about the house reef. A resort with a good one gives you a free activity every single day. Without it, snorkelling becomes a paid excursion every time.",
    ],
  },
  {
    slug: "schengen-visa-checklist",
    category: "Visa",
    title: "Schengen visa: the document checklist people get wrong",
    excerpt: "Bank statements, cover letters and the booking proofs that actually get accepted.",
    date: "28 Jul 2026",
    readTime: "7 min read",
    image: europe,
    body: [
      "Schengen rejections are rarely about money. They are usually about documents that do not agree with each other — dates on the itinerary that do not match the hotel booking, or a cover letter that describes a different route.",
      "Keep one master itinerary and build every other document from it. Flights, hotels, insurance and the cover letter should all show the same entry date, exit date and cities.",
      "Six months of bank statements should show a steady balance, not a large deposit landing a week before the appointment. If someone is sponsoring the trip, their documents need to be complete too.",
      "Apply early. In summer, appointment slots disappear faster than the processing time itself, and travel plans built around a tight visa window are stressful for everyone.",
    ],
  },
  {
    slug: "family-travel-pace",
    category: "Family Travel",
    title: "Planning a family trip that works for three generations",
    excerpt: "Pace, proximity and food access decide whether everyone enjoys the holiday.",
    date: "19 Jul 2026",
    readTime: "5 min read",
    image: singapore,
    body: [
      "Multi-generation trips fail on pace, not on destination. Grandparents need shorter days, children need earlier meals, and everyone needs a place to sit down.",
      "Choose one hotel and do day trips from it wherever possible. Repacking every second night is the single fastest way to exhaust a family group.",
      "Book the big attraction on day two, not day one. Jet lag and travel fatigue on the first day turn a great experience into a queue.",
      "Finally, check food. Easy vegetarian access, familiar breakfast options and a kettle in the room solve more problems than an extra star of hotel rating.",
    ],
  },
  {
    slug: "best-time-southeast-asia",
    category: "Destinations",
    title: "When to travel to Southeast Asia, month by month",
    excerpt: "A practical seasonality guide for Thailand, Bali, Vietnam and Malaysia.",
    date: "08 Jul 2026",
    readTime: "6 min read",
    image: thailand,
    body: [
      "Southeast Asia does not have one season. Thailand's west coast and east coast peak at different times, and Vietnam runs almost 2,000 kilometres north to south with three separate climates.",
      "November to March is the safe window for Thailand's Andaman side, Bali and most of Vietnam. That is also when prices are highest, so book earlier than you think you need to.",
      "The shoulder months — April, May, October — often give you 80% of the weather at 60% of the cost. Rain in these months tends to arrive in short, heavy bursts rather than all day.",
      "If your dates are fixed and they fall in the wet season, change the destination, not the plan. There is almost always a nearby island or region that is dry that month.",
    ],
  },
  {
    slug: "adventure-himachal",
    category: "Adventure",
    title: "Himachal beyond Manali: routes worth the extra drive",
    excerpt: "Tirthan, Spiti and Chitkul for travellers who want quiet over convenience.",
    date: "26 Jun 2026",
    readTime: "6 min read",
    image: himachal,
    body: [
      "Manali is easy and it is busy. If you have seven days and tolerance for mountain roads, the valleys on either side of it are a different holiday altogether.",
      "Tirthan is the gentlest option — trout streams, forest walks and homestays, roughly two hours off the main highway.",
      "Spiti needs acclimatisation and a plan. Go via Shimla and return via Manali once the pass opens, never the reverse in a hurry.",
      "Chitkul, at the end of the Sangla valley, is a single-road village with a view that justifies the drive. Carry cash and expect patchy network.",
    ],
  },
];

export const blogBySlug = (slug: string) => blogs.find((b) => b.slug === slug);

export const blogCategories = [
  "All",
  "Travel Guides",
  "Destinations",
  "Visa",
  "Travel Tips",
  "Honeymoon",
  "Family Travel",
  "Adventure",
];

export const lovedTrips = packages.slice(0, 8).map((p) => {
  const dest = destinationBySlug(p.destinationSlug);
  return {
    slug: p.slug,
    title: p.title,
    image: dest?.image ?? bali,
    duration: `${p.nights} Nights / ${p.days} Days`,
    travellerType: p.styles[0],
    price: p.fromPrice,
    destination: p.destination,
  };
});

export const dashboardTrips = [
  {
    id: "PXB-2026-1041",
    title: "Bali Honeymoon Escape",
    destination: "Bali, Indonesia",
    image: bali,
    dates: "18 Sep – 23 Sep 2026",
    nights: 5,
    travellers: 2,
    status: "Confirmed" as const,
    paid: 42000,
    total: 117800,
    hotel: "Ubud Jungle Retreat · Seminyak Beach Resort",
    flight: "Indigo 6E-1043 · DEL → DPS",
  },
  {
    id: "PXB-2026-0987",
    title: "Dubai Family Holiday",
    destination: "Dubai, UAE",
    image: dubai,
    dates: "02 Dec – 06 Dec 2026",
    nights: 4,
    travellers: 4,
    status: "Awaiting payment" as const,
    paid: 25000,
    total: 247600,
    hotel: "Marina Skyline Hotel",
    flight: "Air India AI-915 · DEL → DXB",
  },
  {
    id: "PXB-2025-0731",
    title: "Kerala Backwater Serenity",
    destination: "Kerala, India",
    image: kerala,
    dates: "12 Jan – 17 Jan 2026",
    nights: 5,
    travellers: 2,
    status: "Completed" as const,
    paid: 53800,
    total: 53800,
    hotel: "Munnar Hillside Resort · Alleppey Houseboat",
    flight: "Indigo 6E-6371 · DEL → COK",
  },
];

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
