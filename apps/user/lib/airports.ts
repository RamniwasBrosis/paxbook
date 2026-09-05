export interface AirportEntry {
  code: string;
  city: string;
  name: string;
  country: string;
}

/** Common domestic + international airports for the search autocomplete. IATA codes are public reference data. */
export const AIRPORTS: AirportEntry[] = [
  { code: "DEL", city: "New Delhi", name: "Indira Gandhi International", country: "India" },
  { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji Maharaj International", country: "India" },
  { code: "BLR", city: "Bengaluru", name: "Kempegowda International", country: "India" },
  { code: "MAA", city: "Chennai", name: "Chennai International", country: "India" },
  { code: "CCU", city: "Kolkata", name: "Netaji Subhas Chandra Bose International", country: "India" },
  { code: "HYD", city: "Hyderabad", name: "Rajiv Gandhi International", country: "India" },
  { code: "PNQ", city: "Pune", name: "Pune Airport", country: "India" },
  { code: "AMD", city: "Ahmedabad", name: "Sardar Vallabhbhai Patel International", country: "India" },
  { code: "COK", city: "Kochi", name: "Cochin International", country: "India" },
  { code: "GOI", city: "Goa (Dabolim)", name: "Goa International", country: "India" },
  { code: "GOX", city: "Goa (Mopa)", name: "Manohar International", country: "India" },
  { code: "JAI", city: "Jaipur", name: "Jaipur International", country: "India" },
  { code: "LKO", city: "Lucknow", name: "Chaudhary Charan Singh International", country: "India" },
  { code: "IXC", city: "Chandigarh", name: "Chandigarh International", country: "India" },
  { code: "PAT", city: "Patna", name: "Jay Prakash Narayan International", country: "India" },
  { code: "GAU", city: "Guwahati", name: "Lokpriya Gopinath Bordoloi International", country: "India" },
  { code: "BBI", city: "Bhubaneswar", name: "Biju Patnaik International", country: "India" },
  { code: "IXB", city: "Bagdogra", name: "Bagdogra Airport", country: "India" },
  { code: "SXR", city: "Srinagar", name: "Sheikh ul-Alam International", country: "India" },
  { code: "IXJ", city: "Jammu", name: "Jammu Airport", country: "India" },
  { code: "IXA", city: "Agartala", name: "Maharaja Bir Bikram Airport", country: "India" },
  { code: "IXR", city: "Ranchi", name: "Birsa Munda Airport", country: "India" },
  { code: "RPR", city: "Raipur", name: "Swami Vivekananda Airport", country: "India" },
  { code: "IDR", city: "Indore", name: "Devi Ahilyabai Holkar Airport", country: "India" },
  { code: "NAG", city: "Nagpur", name: "Dr. Babasaheb Ambedkar International", country: "India" },
  { code: "VNS", city: "Varanasi", name: "Lal Bahadur Shastri International", country: "India" },
  { code: "ATQ", city: "Amritsar", name: "Sri Guru Ram Dass Jee International", country: "India" },
  { code: "UDR", city: "Udaipur", name: "Maharana Pratap Airport", country: "India" },
  { code: "JDH", city: "Jodhpur", name: "Jodhpur Airport", country: "India" },
  { code: "IXZ", city: "Port Blair", name: "Veer Savarkar International", country: "India" },
  { code: "TRV", city: "Thiruvananthapuram", name: "Trivandrum International", country: "India" },
  { code: "CJB", city: "Coimbatore", name: "Coimbatore International", country: "India" },
  { code: "MAA", city: "Chennai", name: "Chennai International", country: "India" },
  { code: "VTZ", city: "Visakhapatnam", name: "Visakhapatnam Airport", country: "India" },
  { code: "IXM", city: "Madurai", name: "Madurai Airport", country: "India" },
  { code: "STV", city: "Surat", name: "Surat Airport", country: "India" },
  { code: "IXE", city: "Mangaluru", name: "Mangaluru International", country: "India" },
  { code: "DED", city: "Dehradun", name: "Jolly Grant Airport", country: "India" },
  { code: "IXU", city: "Aurangabad", name: "Chhatrapati Sambhajinagar Airport", country: "India" },
  { code: "DXB", city: "Dubai", name: "Dubai International", country: "UAE" },
  { code: "AUH", city: "Abu Dhabi", name: "Zayed International", country: "UAE" },
  { code: "SHJ", city: "Sharjah", name: "Sharjah International", country: "UAE" },
  { code: "DOH", city: "Doha", name: "Hamad International", country: "Qatar" },
  { code: "SIN", city: "Singapore", name: "Changi Airport", country: "Singapore" },
  { code: "KUL", city: "Kuala Lumpur", name: "Kuala Lumpur International", country: "Malaysia" },
  { code: "BKK", city: "Bangkok", name: "Suvarnabhumi Airport", country: "Thailand" },
  { code: "CMB", city: "Colombo", name: "Bandaranaike International", country: "Sri Lanka" },
  { code: "KTM", city: "Kathmandu", name: "Tribhuvan International", country: "Nepal" },
  { code: "DAC", city: "Dhaka", name: "Hazrat Shahjalal International", country: "Bangladesh" },
  { code: "LHR", city: "London", name: "Heathrow Airport", country: "United Kingdom" },
  { code: "LGW", city: "London", name: "Gatwick Airport", country: "United Kingdom" },
  { code: "JFK", city: "New York", name: "John F. Kennedy International", country: "USA" },
  { code: "EWR", city: "Newark", name: "Newark Liberty International", country: "USA" },
  { code: "ORD", city: "Chicago", name: "O'Hare International", country: "USA" },
  { code: "SFO", city: "San Francisco", name: "San Francisco International", country: "USA" },
  { code: "YYZ", city: "Toronto", name: "Toronto Pearson International", country: "Canada" },
  { code: "YVR", city: "Vancouver", name: "Vancouver International", country: "Canada" },
  { code: "FRA", city: "Frankfurt", name: "Frankfurt Airport", country: "Germany" },
  { code: "MUC", city: "Munich", name: "Munich Airport", country: "Germany" },
  { code: "CDG", city: "Paris", name: "Charles de Gaulle Airport", country: "France" },
  { code: "AMS", city: "Amsterdam", name: "Schiphol Airport", country: "Netherlands" },
  { code: "IST", city: "Istanbul", name: "Istanbul Airport", country: "Turkey" },
  { code: "SYD", city: "Sydney", name: "Sydney Kingsford Smith", country: "Australia" },
  { code: "MEL", city: "Melbourne", name: "Melbourne Airport", country: "Australia" },
  { code: "HKG", city: "Hong Kong", name: "Hong Kong International", country: "Hong Kong" },
  { code: "NRT", city: "Tokyo", name: "Narita International", country: "Japan" },
  { code: "MLE", city: "Male", name: "Velana International", country: "Maldives" },
  { code: "JED", city: "Jeddah", name: "King Abdulaziz International", country: "Saudi Arabia" },
  { code: "RUH", city: "Riyadh", name: "King Khalid International", country: "Saudi Arabia" },
  { code: "MCT", city: "Muscat", name: "Muscat International", country: "Oman" },
  { code: "KWI", city: "Kuwait City", name: "Kuwait International", country: "Kuwait" },
  { code: "BAH", city: "Manama", name: "Bahrain International", country: "Bahrain" },
];

export function searchAirports(query: string, limit = 8): AirportEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored = AIRPORTS.filter(
    (a) => a.code.toLowerCase().startsWith(q) || a.city.toLowerCase().includes(q) || a.name.toLowerCase().includes(q),
  );
  scored.sort((a, b) => {
    const aCode = a.code.toLowerCase() === q ? 0 : a.code.toLowerCase().startsWith(q) ? 1 : 2;
    const bCode = b.code.toLowerCase() === q ? 0 : b.code.toLowerCase().startsWith(q) ? 1 : 2;
    return aCode - bCode;
  });
  return scored.slice(0, limit);
}

export function findAirport(code: string): AirportEntry | undefined {
  return AIRPORTS.find((a) => a.code === code.toUpperCase());
}
