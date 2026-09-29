import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      // 1. INDUSTRY CLUSTER / NICHE SUBDOMAINS
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "(?<niche>food|hotels|hotel|rides|ride|dispatch|beauty|apartments|apartment|shortlets|shortlet|cars|car|laundry|tutors|tutor|autocare|properties|property|home-services|homeservices|fashion-grooming|fashion|professional-services|professionals|education-skills|education|events-entertainment|events|health-wellness|health|logistics-transport|logistics|automotive-services|auto|food-agribusiness|real-estate-construction|realestate|handyman|specialists|cleaning|tech|corporate|creative|talent|tutoring|vocational|planning|entertainment|medical|wellness|caregiving|mechanics|culinary|agriculture|construction|plumber|electrician|carpenter|painter|tiler|welder|solar|solar-installer|generator|generator-repairer|ac-technician|borehole|inverter|tailor|barber|hairdresser|makeup|makeup-artist|nails|lawyer|accountant|cctv|mechanic|car-mechanic|chef|caterer|chauffeur|mover)\\..*",
          }
        ],
        destination: "/:niche",
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "(?<niche>food|hotels|hotel|rides|ride|dispatch|beauty|apartments|apartment|shortlets|shortlet|cars|car|laundry|tutors|tutor|autocare|properties|property|home-services|homeservices|fashion-grooming|fashion|professional-services|professionals|education-skills|education|events-entertainment|events|health-wellness|health|logistics-transport|logistics|automotive-services|auto|food-agribusiness|real-estate-construction|realestate|handyman|specialists|cleaning|tech|corporate|creative|talent|tutoring|vocational|planning|entertainment|medical|wellness|caregiving|mechanics|culinary|agriculture|construction|plumber|electrician|carpenter|painter|tiler|welder|solar|solar-installer|generator|generator-repairer|ac-technician|borehole|inverter|tailor|barber|hairdresser|makeup|makeup-artist|nails|lawyer|accountant|cctv|mechanic|car-mechanic|chef|caterer|chauffeur|mover)\\..*",
          }
        ],
        destination: "/:niche/:path*",
      },
      
      // 2. TENANT SHOPFRONT SUBDOMAINS (Anything else)
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "(?<tenant>[^.]+)\\..*",
          }
        ],
        destination: "/shopfront?tenant=:tenant",
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "(?<tenant>[^.]+)\\..*",
          }
        ],
        destination: "/shopfront/:path*?tenant=:tenant",
      }
    ];
  }
};

export default nextConfig;
