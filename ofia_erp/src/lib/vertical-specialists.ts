export interface SpecialistStaff {
  id: string;
  name: string;
  role: string;
  rating: number;
  completedJobs: number;
  isAvailable: boolean;
  specialty: string;
}

export const VERTICAL_SPECIALISTS: Record<string, SpecialistStaff[]> = {
  fashion: [
    { id: "STYL-01", name: "Damilola Adebayo", role: "Lead Bespoke Stylist", rating: 4.9, completedJobs: 120, isAvailable: true, specialty: "Haute Couture & Tailoring" },
    { id: "STYL-02", name: "Grace Effiong", role: "Personal Shopper & Fitter", rating: 4.8, completedJobs: 85, isAvailable: true, specialty: "Bridal & Red Carpet" },
    { id: "STYL-03", name: "Chinedu Alabi", role: "Master Couturier & Pattern Drafter", rating: 5.0, completedJobs: 154, isAvailable: true, specialty: "Anatomic Pattern Drafting & Embroidery" },
  ],
  cars: [
    { id: "TECH-01", name: "Engr. Babatunde Lawal", role: "Master Diagnostic Technician", rating: 4.9, completedJobs: 142, isAvailable: true, specialty: "Engine Diagnostics & OBD-II" },
    { id: "TECH-02", name: "Chibuike Okonkwo", role: "Certified Vehicle Inspector", rating: 4.8, completedJobs: 98, isAvailable: true, specialty: "Pre-Purchase & Safety Audits" },
    { id: "TECH-03", name: "Amina Yusuf", role: "Automotive Electrical Specialist", rating: 5.0, completedJobs: 87, isAvailable: false, specialty: "ECU Tuning & Hybrid Systems" },
  ],
  beauty: [
    { id: "SPA-01", name: "Zainab Bello", role: "Senior Medical Esthetician", rating: 4.9, completedJobs: 210, isAvailable: true, specialty: "Skin Therapy & Peels" },
    { id: "SPA-02", name: "Kehinde Daniels", role: "Master Hair Artiste & Therapist", rating: 4.8, completedJobs: 135, isAvailable: true, specialty: "Trichology & Treatments" },
    { id: "SPA-03", name: "Dr. Ngozi Eze", role: "Clinical Dermatology Consultant", rating: 5.0, completedJobs: 94, isAvailable: true, specialty: "Anti-Aging & Bio-Active Infusion" },
  ],
  hardware: [
    { id: "HDW-01", name: "Engr. Taiwo Adeleke", role: "COREN Renewable Energy Lead", rating: 4.9, completedJobs: 178, isAvailable: true, specialty: "PV Sizing & Solar Load Audits" },
    { id: "HDW-02", name: "Festus Okorie", role: "Certified Solar Inverter Specialist", rating: 4.8, completedJobs: 145, isAvailable: true, specialty: "Hybrid & High-Surge Inverter Commissioning" },
    { id: "HDW-03", name: "Bolaji Balogun", role: "High-Voltage Electrical Contractor", rating: 4.9, completedJobs: 112, isAvailable: true, specialty: "Breaker Distribution & Earthing Certification" },
  ],
  pharmacy: [
    { id: "PHM-01", name: "Pharm. Kemi Adeyemi", role: "Lead Clinical Pharmacist", rating: 5.0, completedJobs: 260, isAvailable: true, specialty: "Medication Therapy Management & Chronic Care" },
    { id: "PHM-02", name: "Dr. Obinna Nwosu", role: "Consultant Care Pharmacist", rating: 4.9, completedJobs: 190, isAvailable: true, specialty: "Drug Interactions & Prescription Verification" },
    { id: "PHM-03", name: "Folashade Adele", role: "Diagnostic Care Specialist", rating: 4.8, completedJobs: 130, isAvailable: true, specialty: "Vitals, Lipid & Blood Glucose Diagnostics" },
  ],
  property: [
    { id: "PRP-01", name: "Nnamdi Azikiwe", role: "Principal Licensed Realtor", rating: 4.9, completedJobs: 88, isAvailable: true, specialty: "Commercial & Luxury Residential Escort" },
    { id: "PRP-02", name: "Barr. Sola Ogundipe", role: "Real Estate Title Legal Counsel", rating: 5.0, completedJobs: 64, isAvailable: true, specialty: "Governor's Consent & Land Registry Searches" },
    { id: "PRP-03", name: "Aisha Mohammed", role: "Shortlet Turnover Coordinator", rating: 4.8, completedJobs: 120, isAvailable: true, specialty: "Physical Space & Turnkey Audits" },
  ],
  food: [
    { id: "FOD-01", name: "Chef Pierre Alade", role: "Executive Maître d' & Head Chef", rating: 5.0, completedJobs: 115, isAvailable: true, specialty: "VIP Chef's Table & Private Dining" },
    { id: "FOD-02", name: "Chef Halima Danjuma", role: "Corporate Catering Director", rating: 4.9, completedJobs: 92, isAvailable: true, specialty: "Event Tasting & Dietary Menu Architecture" },
    { id: "FOD-03", name: "Sommelier Bayo Martins", role: "Banquet & Beverage Specialist", rating: 4.8, completedJobs: 76, isAvailable: true, specialty: "Wine Pairing & Hospitality Station Logistics" },
  ],
  gadgets: [
    { id: "GAD-01", name: "Samuel Okafor", role: "Apple / Android Certified Tech", rating: 4.9, completedJobs: 340, isAvailable: true, specialty: "Logic Board & Screen Repair" },
    { id: "GAD-02", name: "Emeka Peters", role: "Drone & Camera Specialist", rating: 4.7, completedJobs: 72, isAvailable: true, specialty: "Sensor Calibration & Firmware" },
    { id: "GAD-03", name: "Victor Adeleke", role: "Micro-Soldering Lab Lead", rating: 5.0, completedJobs: 185, isAvailable: true, specialty: "Thermal Diagnostics & BGA Reballing" },
  ],
  "home-living": [
    { id: "HML-01", name: "Arc. Femi Oladipo", role: "Interior Design Director", rating: 4.9, completedJobs: 84, isAvailable: true, specialty: "3D Floor Planning & Ergonomic Layouts" },
    { id: "HML-02", name: "Sunday Adebiyi", role: "Master Joiner & Carpentry Lead", rating: 4.8, completedJobs: 160, isAvailable: true, specialty: "White-Glove Architectural Assembly" },
    { id: "HML-03", name: "Ronke Cole", role: "Acoustics & Lighting Consultant", rating: 4.9, completedJobs: 68, isAvailable: true, specialty: "Residential Ambience & Finishing Audits" },
  ],
  retail: [
    { id: "CS-01", name: "Folake Williams", role: "Senior Client Specialist", rating: 4.9, completedJobs: 160, isAvailable: true, specialty: "Consultations & Fitting" },
    { id: "CS-02", name: "Ibrahim Musa", role: "Product Specialist", rating: 4.8, completedJobs: 95, isAvailable: true, specialty: "Demonstrations & Onboarding" },
    { id: "CS-03", name: "Cynthia Okafor", role: "VIP Concierge & Gifting Lead", rating: 5.0, completedJobs: 110, isAvailable: true, specialty: "Bespoke Corporate Hampers & Curations" },
  ],
  dispatch: [
    { id: "RDR-01", name: "Chidi Okeke", role: "Senior Fleet Rider", rating: 4.9, completedJobs: 380, isAvailable: true, specialty: "Express Motorcycle Courier" },
    { id: "RDR-02", name: "Tunde Bakare", role: "Van Freight Specialist", rating: 4.8, completedJobs: 215, isAvailable: true, specialty: "Bulk Cargo & Interstate Haulage" },
    { id: "RDR-03", name: "Emeka Obi", role: "Cold-Chain Logistics Courier", rating: 4.9, completedJobs: 145, isAvailable: true, specialty: "Pharmaceutical & Perishable Delivery" },
  ],
};
