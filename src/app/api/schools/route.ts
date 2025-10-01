import { NextResponse } from "next/server";

type JedeSchuleItem = {
  id?: string | number;
  schul_id?: string | number;
  externalId?: string | number;
  uuid?: string;
  slug?: string;
  name?: string;
  schulname?: string;
  title?: string;
  ort?: string;
  city?: string;
  stadt?: string;
  bundesland?: string;
  state?: string;
  adresse?: string;
  address?: string;
  street?: string;
  plz?: string;
  zip?: string;
};

type MehrSchulferienSchool = {
  id?: number;
  name?: string;
  address?: string;
  school_type?: {
    name?: string;
  };
  city?: {
    name?: string;
    zip_code?: string;
  };
};

type SchoolResult = {
  externalId: string;
  name: string;
  city: string;
  state: string;
  address: string;
};

// Mock school data for testing when API is unavailable
const MOCK_SCHOOLS: SchoolResult[] = [
  {
    externalId: "gym-001",
    name: "Goethe-Gymnasium Köln",
    city: "Köln",
    state: "Nordrhein-Westfalen",
    address: "Musterstraße 123, 50667 Köln",
  },
  {
    externalId: "real-001",
    name: "Realschule am Rhein",
    city: "Düsseldorf",
    state: "Nordrhein-Westfalen",
    address: "Rheinufer 45, 40210 Düsseldorf",
  },
  {
    externalId: "gesamt-001",
    name: "Gesamtschule Essen-Mitte",
    city: "Essen",
    state: "Nordrhein-Westfalen",
    address: "Schulweg 10, 45127 Essen",
  },
  {
    externalId: "haupt-001",
    name: "Hauptschule Dortmund",
    city: "Dortmund",
    state: "Nordrhein-Westfalen",
    address: "Westfalenstraße 88, 44135 Dortmund",
  },
  {
    externalId: "grund-001",
    name: "Grundschule Bochum-Nord",
    city: "Bochum",
    state: "Nordrhein-Westfalen",
    address: "Nordring 22, 44787 Bochum",
  },
  {
    externalId: "beruf-001",
    name: "Berufskolleg Duisburg",
    city: "Duisburg",
    state: "Nordrhein-Westfalen",
    address: "Königstraße 55, 47051 Duisburg",
  },
  {
    externalId: "gym-berlin-001",
    name: "Humboldt-Gymnasium Berlin",
    city: "Berlin",
    state: "Berlin",
    address: "Unter den Linden 1, 10117 Berlin",
  },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  if (!q || q.length < 2) {
    return NextResponse.json({ schools: [] });
  }

  // Try JedeSchule API with NRW filter
  // API: https://jedeschule.codefor.de/schools/?state=NW&name={query}&skip=0&limit=100
  try {
    const endpoint = `https://jedeschule.codefor.de/schools/?state=NW&name=${encodeURIComponent(q)}&skip=0&limit=100&include_raw=false`;
    const res = await fetch(endpoint, { 
      next: { revalidate: 60 * 60 }, 
      signal: AbortSignal.timeout(8000),
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (res.ok) {
      const data = (await res.json()) as JedeSchuleItem[];

      // API returns array directly
      if (Array.isArray(data)) {
        const schools: SchoolResult[] = data
          .map((s) => {
            // Build full address from components
            const street = s?.address ?? "";
            const zip = s?.zip ?? s?.plz ?? "";
            const city = s?.city ?? s?.ort ?? s?.stadt ?? "";
            const fullAddress = [street, zip, city].filter(Boolean).join(", ");

            return {
              externalId: String(s?.id ?? ""),
              name: s?.name ?? s?.schulname ?? s?.title ?? "Unbekannte Schule",
              city: city,
              state: "Nordrhein-Westfalen",
              address: fullAddress,
            };
          })
          .filter((s) => Boolean(s.externalId) && Boolean(s.name));

        if (schools.length > 0) {
          console.log(`Found ${schools.length} NRW schools from JedeSchule API`);
          return NextResponse.json({ schools });
        }
      }
    }
  } catch (error) {
    console.log("JedeSchule API error:", error);
  }

  // Try mehr-schulferien.de API as fallback (NRW specific)
  try {
    const endpoint = `https://www.mehr-schulferien.de/api/v3.0/locations?federal_state=nordrhein-westfalen&name=${encodeURIComponent(q)}`;
    const res = await fetch(endpoint, { 
      next: { revalidate: 60 * 60 }, 
      signal: AbortSignal.timeout(5000),
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (res.ok) {
      const data = (await res.json()) as { data?: MehrSchulferienSchool[] };
      
      if (data.data && Array.isArray(data.data)) {
        const schools: SchoolResult[] = data.data
          .filter((s) => s?.name) // Only schools with names
          .map((s) => {
            const cityName = s?.city?.name ?? "";
            const zipCode = s?.city?.zip_code ?? "";
            const address = s?.address ?? "";
            const fullAddress = address || (zipCode && cityName ? `${zipCode} ${cityName}` : cityName);
            
            return {
              externalId: String(s?.id ?? ""),
              name: s?.name ?? "Unbekannte Schule",
              city: cityName,
              state: "Nordrhein-Westfalen",
              address: fullAddress,
            };
          })
          .filter((s) => Boolean(s.externalId));

        if (schools.length > 0) {
          console.log(`Found ${schools.length} NRW schools from mehr-schulferien.de API`);
          return NextResponse.json({ schools });
        }
      }
    }
  } catch (error) {
    console.log("mehr-schulferien.de API error:", error);
  }

  // Fallback to mock data (only NRW schools)
  const filteredMockSchools = MOCK_SCHOOLS.filter(
    (school) =>
      school.state === "Nordrhein-Westfalen" &&
      (school.name.toLowerCase().includes(q) ||
       school.city.toLowerCase().includes(q))
  );

  console.log(`Using ${filteredMockSchools.length} mock NRW schools`);
  return NextResponse.json({ schools: filteredMockSchools });
}


