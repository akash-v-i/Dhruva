import heroPolar from "@/assets/hero-polar.jpg";
import stationImg from "@/assets/station-bharati.jpg";
import vesselImg from "@/assets/expedition-vessel.jpg";
import iceCoreImg from "@/assets/ice-core.jpg";
import coastImg from "@/assets/polar-coast.webp";
import fieldTeamImg from "@/assets/field-team.webp";
import trekShipImg from "@/assets/trek-ship.webp";
import peaksImg from "@/assets/polar-peaks.webp";
import whaleImg from "@/assets/whale-zodiacs.webp";
import iceShelfImg from "@/assets/ice-shelf-front.png";
import shipsImg from "@/assets/ships-bay.webp";
import historicStationImg from "@/assets/historic-station.webp";
import penguinsImg from "@/assets/penguin-colony.webp";
import twilightImg from "@/assets/polar-twilight.webp";

export const IMAGES = {
  hero: heroPolar,
  station: stationImg,
  vessel: vesselImg,
  iceCore: iceCoreImg,
  coast: coastImg,
  fieldTeam: fieldTeamImg,
  trekShip: trekShipImg,
  peaks: peaksImg,
  whale: whaleImg,
  iceShelf: iceShelfImg,
  ships: shipsImg,
  historicStation: historicStationImg,
  penguins: penguinsImg,
  twilight: twilightImg,
};

export type ContentType = "report" | "publication" | "dataset" | "photo" | "video" | "activity";

export type Access = "public" | "internal" | "embargoed";

export const CONTENT_TYPES: {
  id: ContentType;
  label: string;
  plural: string;
  description: string;
}[] = [
  {
    id: "report",
    label: "Report",
    plural: "Reports",
    description: "Expedition, station and scientific field reports.",
  },
  {
    id: "publication",
    label: "Publication",
    plural: "Publications",
    description: "Peer-reviewed papers with DOI and citation export.",
  },
  {
    id: "dataset",
    label: "Dataset",
    plural: "Datasets",
    description: "Observational and modelled data with licences.",
  },
  {
    id: "photo",
    label: "Photo",
    plural: "Photos",
    description: "Field photography from stations and expeditions.",
  },
  {
    id: "video",
    label: "Video",
    plural: "Videos",
    description: "Documentaries, lectures and field footage.",
  },
  {
    id: "activity",
    label: "Activity",
    plural: "Activities",
    description: "Outreach events, training and institutional activity.",
  },
];

export const REGIONS = ["Antarctica", "Arctic", "Southern Ocean", "Himalaya"] as const;
export type Region = (typeof REGIONS)[number];

export interface Station {
  id: string;
  name: string;
  region: Region;
  lat: number;
  lon: number;
  established: number;
  description: string;
  image?: string;
}

export interface Expedition {
  id: string;
  name: string;
  number: string;
  region: Region;
  start: string;
  end: string;
  leader: string;
  summary: string;
  image?: string;
  stationIds: string[];
  route: { lat: number; lon: number; label: string }[];
  /** `at` is the index of the route waypoint where the event happened. */
  timeline: { date: string; title: string; detail: string; at?: number }[];
}

export interface Item {
  id: string;
  type: ContentType;
  title: string;
  summary: string;
  body: string;
  region: Region;
  date: string;
  year: number;
  authors: string[];
  tags: string[];
  licence: string;
  access: Access;
  embargoUntil?: string;
  expeditionId?: string;
  stationId?: string;
  language: "English" | "Hindi";
  image?: string;
  meta?: Record<string, string>;
}

export const stations: Station[] = [
  {
    id: "bharati",
    name: "Bharati",
    region: "Antarctica",
    lat: -69.4,
    lon: 76.19,
    established: 2012,
    description:
      "India's third Antarctic station, located in the Larsemann Hills on the Prydz Bay coast. Bharati supports oceanographic, geological and atmospheric research through the austral summer and winter.",
    image: stationImg,
  },
  {
    id: "maitri",
    image: coastImg,
    name: "Maitri",
    region: "Antarctica",
    lat: -70.77,
    lon: 11.73,
    established: 1989,
    description:
      "Located in the Schirmacher Oasis, Maitri is a year-round station supporting geology, glaciology, atmospheric sciences and medicine, with a freshwater lake adjacent to the main building.",
  },
  {
    id: "himadri",
    image: peaksImg,
    name: "Himadri",
    region: "Arctic",
    lat: 78.92,
    lon: 11.92,
    established: 2008,
    description:
      "India's Arctic research base at Ny-Ålesund, Svalbard. Himadri hosts atmospheric, glaciological and biological studies in collaboration with international Arctic partners.",
  },
  {
    id: "dakshin-gangotri",
    image: historicStationImg,
    name: "Dakshin Gangotri",
    region: "Antarctica",
    lat: -70.09,
    lon: 12.0,
    established: 1983,
    description:
      "India's first Antarctic base, now a supply depot and transit camp after being submerged in ice. It remains a historically significant site in Indian polar science.",
  },
];

export const expeditions: Expedition[] = [
  {
    id: "isea-42",
    name: "Indian Scientific Expedition to Antarctica 42",
    number: "ISEA-42",
    region: "Antarctica",
    start: "2022-11-14",
    end: "2023-04-02",
    leader: "Dr. Anjali Mehra",
    summary:
      "A summer and overwintering campaign focused on sea-ice observation, coastal oceanography and long-term atmospheric monitoring around Prydz Bay and the Schirmacher Oasis.",
    image: vesselImg,
    stationIds: ["bharati", "maitri"],
    route: [
      { lat: 18.94, lon: 72.84, label: "Departure — Mumbai" },
      { lat: -33.92, lon: 18.42, label: "Port call — Cape Town" },
      { lat: -60.5, lon: 40.0, label: "Southern Ocean transect" },
      { lat: -69.4, lon: 76.19, label: "Bharati station" },
      { lat: -70.77, lon: 11.73, label: "Maitri station" },
    ],
    timeline: [
      {
        date: "14 Nov 2022",
        title: "Departure from Mumbai",
        detail: "58 members embark with 340 tonnes of cargo.",
        at: 0,
      },
      {
        date: "02 Dec 2022",
        title: "Southern Ocean transect",
        detail: "CTD casts and continuous sea-ice observation logs.",
        at: 2,
      },
      {
        date: "21 Dec 2022",
        title: "Arrival at Bharati",
        detail: "Summer camp established; automatic weather station serviced.",
        at: 3,
      },
      {
        date: "18 Jan 2023",
        title: "Ice-core drilling",
        detail: "Shallow cores retrieved from the Larsemann Hills ice cap.",
        at: 3,
      },
      {
        date: "09 Feb 2023",
        title: "Maitri handover",
        detail: "Overwintering team of 22 takes charge.",
        at: 4,
      },
      {
        date: "02 Apr 2023",
        title: "Return voyage complete",
        detail: "Samples transferred to the national polar repository.",
        at: 0,
      },
    ],
  },
  {
    id: "isea-43",
    image: shipsImg,
    name: "Indian Scientific Expedition to Antarctica 43",
    number: "ISEA-43",
    region: "Antarctica",
    start: "2023-11-08",
    end: "2024-03-27",
    leader: "Dr. Rohit Nambiar",
    summary:
      "Continued climate monitoring with an expanded programme on ice-shelf thinning, katabatic wind measurement and microbial ecology of coastal lakes.",
    stationIds: ["bharati", "maitri", "dakshin-gangotri"],
    route: [
      { lat: 18.94, lon: 72.84, label: "Departure — Mumbai" },
      { lat: -33.92, lon: 18.42, label: "Port call — Cape Town" },
      { lat: -68.0, lon: 60.0, label: "Pack-ice survey" },
      { lat: -69.4, lon: 76.19, label: "Bharati station" },
    ],
    timeline: [
      {
        date: "08 Nov 2023",
        title: "Departure from Mumbai",
        detail: "Expedition of 51 members sails south.",
        at: 0,
      },
      {
        date: "15 Dec 2023",
        title: "Ice-shelf survey",
        detail: "Radar profiling across the Amery front.",
        at: 2,
      },
      {
        date: "22 Jan 2024",
        title: "Lake microbiology",
        detail: "Sampling of six coastal lakes in the Larsemann Hills.",
        at: 3,
      },
      {
        date: "27 Mar 2024",
        title: "Return",
        detail: "Datasets submitted for review and curation.",
        at: 0,
      },
    ],
  },
  {
    id: "iare-9",
    name: "Indian Arctic Expedition 9",
    number: "IARE-9",
    region: "Arctic",
    start: "2024-06-02",
    end: "2024-09-18",
    leader: "Dr. Kavita Rao",
    summary:
      "Summer campaign at Ny-Ålesund studying fjord hydrography, glacier mass balance and Arctic aerosol composition, with a linked outreach programme for Indian schools.",
    image: peaksImg,
    stationIds: ["himadri"],
    route: [
      { lat: 28.61, lon: 77.21, label: "Departure — New Delhi" },
      { lat: 69.65, lon: 18.96, label: "Staging — Tromsø" },
      { lat: 78.92, lon: 11.92, label: "Himadri, Ny-Ålesund" },
      { lat: 79.1, lon: 12.5, label: "Kongsfjorden survey" },
    ],
    timeline: [
      {
        date: "02 Jun 2024",
        title: "Team arrives at Ny-Ålesund",
        detail: "Instrument calibration and station handover.",
        at: 2,
      },
      {
        date: "28 Jun 2024",
        title: "Fjord hydrography",
        detail: "Weekly CTD profiles across Kongsfjorden.",
        at: 3,
      },
      {
        date: "11 Aug 2024",
        title: "Glacier mass balance",
        detail: "Stake network re-measured on Midtre Lovénbreen.",
        at: 2,
      },
      {
        date: "18 Sep 2024",
        title: "Season closed",
        detail: "Aerosol filters shipped for laboratory analysis.",
        at: 2,
      },
    ],
  },
  {
    id: "soe-7",
    image: whaleImg,
    name: "Southern Ocean Expedition 7",
    number: "SOE-7",
    region: "Southern Ocean",
    start: "2025-01-12",
    end: "2025-04-05",
    leader: "Dr. Meera Iyer",
    summary:
      "Dedicated Southern Ocean cruise measuring carbon uptake, phytoplankton productivity and the structure of the Antarctic Circumpolar Current.",
    stationIds: [],
    route: [
      { lat: -20.16, lon: 57.5, label: "Departure — Port Louis" },
      { lat: -45.0, lon: 57.0, label: "Subantarctic front" },
      { lat: -55.0, lon: 60.0, label: "Polar front transect" },
      { lat: -63.0, lon: 65.0, label: "Marginal ice zone" },
    ],
    timeline: [
      {
        date: "12 Jan 2025",
        title: "Cruise begins",
        detail: "Underway pCO₂ system activated.",
        at: 0,
      },
      {
        date: "02 Feb 2025",
        title: "Polar front crossing",
        detail: "48 stations occupied along 57°E.",
        at: 2,
      },
      {
        date: "05 Apr 2025",
        title: "Cruise ends",
        detail: "Preliminary carbon flux estimates circulated.",
        at: 3,
      },
    ],
  },
];

export const items: Item[] = [
  {
    id: "sea-ice-observations-42",
    type: "report",
    title: "Antarctic Sea-Ice Observations from Expedition 42",
    summary:
      "Analysis of sea-ice concentration, thickness and floe distribution recorded during the ISEA-42 voyage between Cape Town and Prydz Bay.",
    body: "Sea-ice observations were logged hourly during daylight transit using the ASPeCt protocol. The report compares 2022–23 observations with the twelve preceding seasons and documents an earlier-than-average break-up of fast ice near the Larsemann Hills. Instrument calibration notes, observer rosters and quality-control procedures are included as annexures.",
    region: "Antarctica",
    date: "2023-06-21",
    year: 2023,
    authors: ["Dr. Anjali Mehra", "S. Prabhakar"],
    tags: ["Climate", "Sea ice", "Observation"],
    licence: "CC BY 4.0",
    access: "public",
    expeditionId: "isea-42",
    stationId: "bharati",
    language: "English",
    meta: { "Report type": "Expedition report", Pages: "148", Format: "PDF" },
  },
  {
    id: "amery-ice-shelf-thinning",
    image: iceShelfImg,
    type: "publication",
    title: "Basal Thinning Rates of the Amery Ice Shelf, 2010–2024",
    summary:
      "Peer-reviewed assessment of basal melt across the Amery Ice Shelf using radar profiling and satellite altimetry.",
    body: "Combining airborne radar profiles collected during ISEA-43 with fifteen years of satellite altimetry, this study estimates spatially resolved basal melt rates and identifies a persistent high-melt channel near the grounding zone.",
    region: "Antarctica",
    date: "2024-11-04",
    year: 2024,
    authors: ["Dr. Rohit Nambiar", "Dr. L. Fernandes", "P. Shah"],
    tags: ["Glaciology", "Ice shelf", "Remote sensing"],
    licence: "CC BY-NC 4.0",
    access: "public",
    expeditionId: "isea-43",
    language: "English",
    meta: {
      Journal: "Journal of Polar Glaciology",
      DOI: "10.1234/jpg.2024.0117",
      Volume: "58(4), 331–349",
      Citations: "24",
    },
  },
  {
    id: "kongsfjorden-ctd-2024",
    type: "dataset",
    title: "Kongsfjorden CTD Profiles, Summer 2024",
    summary:
      "Temperature, salinity and dissolved-oxygen profiles from 84 stations occupied across Kongsfjorden during IARE-9.",
    body: "Profiles were collected weekly at fixed transects using a shipboard CTD rosette. Data are provided as NetCDF and CSV with per-cast quality flags following standard oceanographic conventions.",
    region: "Arctic",
    date: "2024-10-30",
    year: 2024,
    authors: ["Dr. Kavita Rao"],
    tags: ["Oceanography", "Hydrography", "Fjord"],
    licence: "CC BY 4.0",
    access: "public",
    expeditionId: "iare-9",
    stationId: "himadri",
    language: "English",
    meta: {
      Variables: "Temperature, salinity, dissolved oxygen, pressure",
      Format: "NetCDF, CSV",
      "Spatial extent": "78.85°N–79.15°N, 11.3°E–12.8°E",
      "Temporal extent": "02 Jun 2024 – 18 Sep 2024",
      DOI: "10.1234/dhruva.ds.2024.014",
    },
  },
  {
    id: "southern-ocean-carbon-flux",
    type: "dataset",
    title: "Southern Ocean Surface pCO₂ and Carbon Flux, SOE-7",
    summary:
      "Underway surface carbon dioxide measurements and derived air–sea flux estimates along a 57°E meridional transect.",
    body: "Continuous underway pCO₂ was recorded at one-minute resolution and merged with meteorological and hydrographic observations. Flux estimates use standard gas-transfer parameterisation; uncertainty fields are supplied alongside.",
    region: "Southern Ocean",
    date: "2025-07-15",
    year: 2025,
    authors: ["Dr. Meera Iyer", "A. Banerjee"],
    tags: ["Carbon", "Biogeochemistry", "Ocean"],
    licence: "CC BY-NC 4.0",
    access: "embargoed",
    embargoUntil: "2027-01-15",
    expeditionId: "soe-7",
    language: "English",
    meta: {
      Variables: "pCO₂, SST, salinity, wind speed, flux",
      Format: "CSV, NetCDF",
      "Temporal extent": "12 Jan 2025 – 05 Apr 2025",
    },
  },
  {
    id: "bharati-winter-photo",
    type: "photo",
    title: "Bharati Station Under Winter Twilight",
    summary:
      "The elevated modules of Bharati station photographed during the brief civil twilight of the austral winter.",
    body: "Captured from the eastern ridge of the Larsemann Hills, this image shows the station's container-module architecture, designed to withstand wind speeds above 300 km/h.",
    region: "Antarctica",
    date: "2023-07-03",
    year: 2023,
    authors: ["S. Prabhakar"],
    tags: ["Station", "Architecture", "Winter"],
    licence: "CC BY 4.0",
    access: "public",
    stationId: "bharati",
    expeditionId: "isea-42",
    language: "English",
    image: stationImg,
    meta: {
      Credit: "Dhruva Media Archive",
      "Capture date": "03 July 2023",
      Resolution: "6000 × 4000",
    },
  },
  {
    id: "ice-core-handling",
    type: "photo",
    title: "Shallow Ice Core Retrieved at the Field Camp",
    summary: "A researcher inspects a shallow ice core before logging and cold storage.",
    body: "Ice cores are logged, photographed and packed at −20 °C within minutes of extraction to preserve the entrapped air record.",
    region: "Arctic",
    date: "2024-07-19",
    year: 2024,
    authors: ["Dhruva Field Team"],
    tags: ["Ice cores", "Field work", "Glaciology"],
    licence: "CC BY 4.0",
    access: "public",
    expeditionId: "iare-9",
    stationId: "himadri",
    language: "English",
    image: iceCoreImg,
    meta: { Credit: "Dhruva Media Archive", "Capture date": "19 July 2024" },
  },
  {
    id: "life-at-maitri",
    type: "video",
    title: "Life at Maitri: An Overwintering Year",
    summary:
      "A 14-minute documentary following the overwintering team at Maitri through the polar night.",
    body: "Filmed across ten months, the documentary covers daily station operations, scientific routines, medical preparedness and the return of the sun.",
    region: "Antarctica",
    date: "2023-09-12",
    year: 2023,
    authors: ["Dhruva Outreach Unit"],
    tags: ["Station life", "Documentary", "Outreach"],
    licence: "CC BY-NC 4.0",
    access: "public",
    stationId: "maitri",
    expeditionId: "isea-42",
    language: "English",
    image: coastImg,
    meta: { Duration: "14 min 22 s", Subtitles: "English, Hindi", Speaker: "Dr. Anjali Mehra" },
  },
  {
    id: "polar-science-day",
    image: penguinsImg,
    type: "activity",
    title: "National Polar Science Day for Schools",
    summary:
      "An outreach programme connecting 40 schools with researchers at Himadri and Bharati through live sessions.",
    body: "The programme included live station link-ups, a quiz on polar geography, and a hands-on module on reading ice-core layers. Recordings and classroom material are available for reuse.",
    region: "Arctic",
    date: "2025-02-26",
    year: 2025,
    authors: ["Dhruva Outreach Unit"],
    tags: ["Education", "Outreach", "Students"],
    licence: "CC BY 4.0",
    access: "public",
    stationId: "himadri",
    language: "English",
    meta: {
      "Activity type": "Outreach event",
      Location: "Nationwide, online",
      Participants: "3,800 students",
    },
  },
  {
    id: "katabatic-wind-report",
    type: "report",
    title: "Katabatic Wind Regimes at the Schirmacher Oasis",
    summary:
      "Three seasons of high-frequency wind measurement describing katabatic onset, duration and the influence of local topography.",
    body: "Automatic weather station records from Maitri are used to classify katabatic events, quantify their diurnal structure and assess implications for station logistics and flight operations.",
    region: "Antarctica",
    date: "2024-08-09",
    year: 2024,
    authors: ["Dr. Rohit Nambiar", "N. Kulkarni"],
    tags: ["Meteorology", "Wind", "Station"],
    licence: "CC BY 4.0",
    access: "public",
    stationId: "maitri",
    expeditionId: "isea-43",
    language: "English",
    meta: { "Report type": "Scientific report", Pages: "62", Format: "PDF" },
  },
  {
    id: "coastal-lake-microbiology",
    type: "publication",
    title: "Microbial Diversity in Larsemann Hills Coastal Lakes",
    summary:
      "Metagenomic characterisation of six coastal lakes reveals distinct communities shaped by salinity and seasonal ice cover.",
    body: "Sampling during ISEA-43 produced 48 metagenomes. The study reports strong partitioning between saline and freshwater lakes and identifies several cold-adapted taxa previously unrecorded in the region.",
    region: "Antarctica",
    date: "2025-03-18",
    year: 2025,
    authors: ["Dr. S. Venkatesan", "Dr. Rohit Nambiar"],
    tags: ["Biology", "Microbiology", "Lakes"],
    licence: "CC BY 4.0",
    access: "public",
    expeditionId: "isea-43",
    stationId: "bharati",
    language: "English",
    meta: {
      Journal: "Polar Biology Reports",
      DOI: "10.1234/pbr.2025.0042",
      Volume: "19(1), 12–31",
      Citations: "7",
    },
  },
  {
    id: "aerosol-composition-arctic",
    type: "dataset",
    title: "Arctic Aerosol Composition, Ny-Ålesund 2024",
    summary:
      "Filter-based aerosol chemistry including black carbon, sulphate and sea-salt fractions measured through the Arctic summer.",
    body: "Daily filters were analysed for ionic and carbonaceous components. The dataset supports studies of long-range pollutant transport into the Arctic.",
    region: "Arctic",
    date: "2025-01-22",
    year: 2025,
    authors: ["Dr. Kavita Rao", "T. Joseph"],
    tags: ["Atmosphere", "Aerosol", "Air quality"],
    licence: "Restricted — institutional",
    access: "internal",
    expeditionId: "iare-9",
    stationId: "himadri",
    language: "English",
    meta: { Variables: "BC, SO₄²⁻, NO₃⁻, Na⁺, OC/EC", Format: "CSV" },
  },
  {
    id: "polar-night-photo-essay",
    type: "photo",
    title: "Aurora Australis Over the Schirmacher Oasis",
    summary: "A long-exposure frame of the aurora australis recorded during the 2023 polar night.",
    body: "Taken at −38 °C with a 20-second exposure, the image is part of a wider photo essay documenting the polar night at Maitri.",
    region: "Antarctica",
    date: "2023-06-28",
    year: 2023,
    authors: ["N. Kulkarni"],
    tags: ["Aurora", "Night sky", "Photography"],
    licence: "CC BY 4.0",
    access: "public",
    stationId: "maitri",
    language: "English",
    image: twilightImg,
    meta: { Credit: "Dhruva Media Archive", "Capture date": "28 June 2023" },
  },
  {
    id: "hindi-explainer-video",
    type: "video",
    title: "ध्रुवीय विज्ञान: बर्फ की परतें क्या बताती हैं",
    summary:
      "A Hindi-language explainer on how ice cores record past climate, produced for school audiences.",
    body: "The eight-minute film explains layer formation, trapped air bubbles and dating techniques, with subtitles in English.",
    region: "Antarctica",
    date: "2025-05-14",
    year: 2025,
    authors: ["Dhruva Outreach Unit"],
    tags: ["Education", "Ice cores", "Hindi"],
    licence: "CC BY 4.0",
    access: "public",
    language: "Hindi",
    image: peaksImg,
    meta: { Duration: "8 min 05 s", Subtitles: "English", Speaker: "Dr. Kavita Rao" },
  },
  {
    id: "training-course-polar-logistics",
    image: trekShipImg,
    type: "activity",
    title: "Pre-Expedition Training in Polar Logistics and Safety",
    summary:
      "A three-week residential training programme covering crevasse rescue, cold-weather medicine and station operations.",
    body: "Held before each Antarctic season, the course prepares selected members in survival skills, fire safety, equipment handling and environmental protocols under the Antarctic Treaty.",
    region: "Himalaya",
    date: "2024-09-02",
    year: 2024,
    authors: ["Dhruva Training Cell"],
    tags: ["Training", "Safety", "Logistics"],
    licence: "CC BY 4.0",
    access: "public",
    language: "English",
    meta: {
      "Activity type": "Training",
      Location: "Auli, Uttarakhand",
      Participants: "58 selected members",
    },
  },
  {
    id: "circumpolar-current-structure",
    type: "publication",
    title: "Frontal Structure of the Antarctic Circumpolar Current at 57°E",
    summary:
      "High-resolution hydrographic sections resolve the position and transport of the Subantarctic and Polar fronts.",
    body: "Forty-eight full-depth stations occupied during SOE-7 are used to compute geostrophic transport and compare frontal positions with the previous decade.",
    region: "Southern Ocean",
    date: "2025-09-08",
    year: 2025,
    authors: ["Dr. Meera Iyer"],
    tags: ["Oceanography", "Circulation", "Fronts"],
    licence: "CC BY 4.0",
    access: "public",
    expeditionId: "soe-7",
    language: "English",
    meta: {
      Journal: "Ocean Science Letters",
      DOI: "10.1234/osl.2025.0093",
      Volume: "12(3), 201–219",
      Citations: "3",
    },
  },
  {
    id: "glacier-mass-balance-report",
    type: "report",
    title: "Mass Balance of Midtre Lovénbreen, 2014–2024",
    summary:
      "A decade of stake-network measurements documenting sustained negative mass balance on a Svalbard valley glacier.",
    body: "Annual winter and summer balances are reported alongside meteorological context. The glacier has lost mass in nine of the ten years observed.",
    region: "Arctic",
    date: "2025-04-11",
    year: 2025,
    authors: ["Dr. Kavita Rao", "M. Dhar"],
    tags: ["Glaciology", "Mass balance", "Svalbard"],
    licence: "CC BY 4.0",
    access: "public",
    expeditionId: "iare-9",
    stationId: "himadri",
    language: "English",
    meta: { "Report type": "Monitoring report", Pages: "88", Format: "PDF" },
  },
  {
    id: "bharati-aws-2023",
    type: "dataset",
    title: "Bharati Automatic Weather Station Record, 2013–2023",
    summary:
      "Hourly air temperature, pressure, humidity and wind from the automatic weather station at Bharati, quality-controlled for a decade of operation.",
    body: "The record combines ten years of hourly observations with calibration logs and gap flags. Mean annual air temperature at the site is close to −10 °C, with strongest winds during the winter months. Data are supplied as CSV and NetCDF with a README describing sensor changes.",
    region: "Antarctica",
    date: "2024-02-19",
    year: 2024,
    authors: ["S. Prabhakar", "Dr. Anjali Mehra"],
    tags: ["Meteorology", "Climate", "Observation"],
    licence: "CC BY 4.0",
    access: "public",
    expeditionId: "isea-42",
    stationId: "bharati",
    language: "English",
    meta: {
      DOI: "10.5281/dhruva.bharati-aws",
      Format: "CSV, NetCDF",
      Coverage: "2013–2023",
      Resolution: "Hourly",
    },
  },
  {
    id: "maitri-ozone-2022",
    type: "dataset",
    title: "Total Column Ozone at Maitri, 2012–2022",
    summary:
      "Daily total column ozone from a Brewer spectrophotometer at Maitri, capturing the annual spring ozone hole over East Antarctica.",
    body: "Daily ozone totals are provided with instrument status flags. The series shows the recurring September–October depletion each year and supports validation of satellite ozone products over the Schirmacher Oasis.",
    region: "Antarctica",
    date: "2023-03-14",
    year: 2023,
    authors: ["Dr. Meera Iyer", "V. Joshi"],
    tags: ["Atmosphere", "Ozone", "Observation"],
    licence: "CC BY 4.0",
    access: "public",
    stationId: "maitri",
    language: "English",
    meta: {
      DOI: "10.5281/dhruva.maitri-ozone",
      Format: "CSV",
      Coverage: "2012–2022",
      Instrument: "Brewer spectrophotometer",
    },
  },
  {
    id: "krill-acoustics-soe7",
    type: "dataset",
    title: "Antarctic Krill Acoustic Survey, SOE-7",
    summary:
      "Multi-frequency echosounder records mapping Antarctic krill swarms across the polar front and marginal ice zone during SOE-7.",
    body: "Acoustic backscatter at three frequencies was recorded along the cruise track and classified into krill and non-krill targets. Swarm density was highest near the marginal ice zone, linking krill distribution to the retreating sea-ice edge.",
    region: "Southern Ocean",
    date: "2025-05-22",
    year: 2025,
    authors: ["Dr. Meera Iyer", "A. Kulkarni"],
    tags: ["Wildlife", "Krill", "Oceanography"],
    licence: "CC BY 4.0",
    access: "embargoed",
    embargoUntil: "2026-12-01",
    expeditionId: "soe-7",
    language: "English",
    meta: { Format: "NetCDF", Frequencies: "38, 120, 200 kHz", Coverage: "Jan–Apr 2025" },
  },
  {
    id: "southern-ocean-phytoplankton",
    type: "publication",
    title: "Phytoplankton Blooms Along the Polar Front, 57°E",
    summary:
      "Peer-reviewed analysis of chlorophyll and nutrient measurements showing where phytoplankton blooms drive carbon uptake in the Indian sector of the Southern Ocean.",
    body: "Chlorophyll, nitrate and silicate profiles from SOE-7 show the strongest blooms just south of the polar front. The study links these blooms to the air–sea carbon flux measured underway during the same cruise.",
    region: "Southern Ocean",
    date: "2025-08-30",
    year: 2025,
    authors: ["Dr. Meera Iyer", "R. Sen", "Dr. L. Fernandes"],
    tags: ["Oceanography", "Carbon", "Phytoplankton"],
    licence: "CC BY 4.0",
    access: "public",
    expeditionId: "soe-7",
    language: "English",
    meta: { DOI: "10.1016/dhruva.2025.0830", Journal: "Deep-Sea Research II", Pages: "14" },
  },
  {
    id: "larsemann-geology-map",
    type: "report",
    title: "Geological Map of the Larsemann Hills",
    summary:
      "Field mapping report describing the rock types, structures and glacial deposits of the Larsemann Hills around Bharati station.",
    body: "The report presents a 1:25,000 geological map compiled from field traverses during ISEA-42 and ISEA-43. It records high-grade metamorphic rocks and moraines left by the retreating ice sheet, and marks sites of protected geological value.",
    region: "Antarctica",
    date: "2024-06-10",
    year: 2024,
    authors: ["Dr. P. Menon", "S. Prabhakar"],
    tags: ["Geology", "Mapping", "Larsemann Hills"],
    licence: "CC BY 4.0",
    access: "public",
    expeditionId: "isea-43",
    stationId: "bharati",
    language: "English",
    meta: { "Report type": "Field report", Pages: "64", Format: "PDF", Scale: "1:25,000" },
  },
  {
    id: "isea-42-voyage-report",
    type: "report",
    title: "ISEA-42 Voyage and Logistics Report",
    summary:
      "The official voyage report of the 42nd Indian Antarctic expedition, covering the route, cargo, station resupply and overwintering handover.",
    body: "The report documents the voyage from Mumbai via Cape Town to Bharati and Maitri, cargo operations, helicopter support and the handover to the overwintering team of 22 members. It lists all science projects supported during the season.",
    region: "Antarctica",
    date: "2023-07-05",
    year: 2023,
    authors: ["Dr. Anjali Mehra"],
    tags: ["Logistics", "Expedition", "Observation"],
    licence: "CC BY 4.0",
    access: "public",
    expeditionId: "isea-42",
    stationId: "maitri",
    language: "English",
    meta: { "Report type": "Expedition report", Pages: "212", Format: "PDF" },
  },
  {
    id: "maitri-lake-water-quality",
    type: "report",
    title: "Priyadarshini Lake Water Quality at Maitri",
    summary:
      "Monitoring report on the freshwater lake that supplies Maitri station, covering temperature, chemistry and ice-cover duration.",
    body: "Seasonal sampling tracks lake temperature, conductivity and nutrients. The lake remains fit for station use, and the length of its ice-free season varies from year to year with summer air temperature.",
    region: "Antarctica",
    date: "2024-09-18",
    year: 2024,
    authors: ["V. Joshi", "Dr. P. Menon"],
    tags: ["Limnology", "Water", "Monitoring"],
    licence: "CC BY 4.0",
    access: "internal",
    stationId: "maitri",
    language: "English",
    meta: { "Report type": "Station report", Pages: "36", Format: "PDF" },
  },
  {
    id: "dakshin-gangotri-history",
    type: "publication",
    title: "Dakshin Gangotri: India's First Antarctic Station",
    summary:
      "A historical account of how India built its first Antarctic base on the ice shelf in 1983 and what it taught the programme.",
    body: "Drawing on expedition diaries and photographs, the article traces the construction of Dakshin Gangotri during the third Indian expedition, its years as a research base, and its later role as a supply depot after it was buried by snow and ice.",
    region: "Antarctica",
    date: "2023-01-09",
    year: 2023,
    authors: ["Dr. R. Bhatt"],
    tags: ["History", "Stations", "Education"],
    licence: "CC BY 4.0",
    access: "public",
    stationId: "dakshin-gangotri",
    language: "English",
    image: historicStationImg,
    meta: { Journal: "Polar Heritage Notes", Pages: "18" },
  },
  {
    id: "chandra-basin-glaciers",
    type: "publication",
    title: "Glacier Retreat in the Chandra Basin, Western Himalaya",
    summary:
      "A study of glacier area and mass change in the Chandra basin, linking Himalayan ice loss to the same warming seen at the poles.",
    body: "Satellite imagery and field measurements show that most glaciers in the basin have lost area since 2000. The paper compares Himalayan and polar glacier responses and discusses water supply for downstream communities.",
    region: "Himalaya",
    date: "2024-12-02",
    year: 2024,
    authors: ["Dr. N. Thakur", "M. Dhar"],
    tags: ["Glaciology", "Himalaya", "Climate"],
    licence: "CC BY 4.0",
    access: "public",
    language: "English",
    image: peaksImg,
    meta: { DOI: "10.1007/dhruva.2024.1202", Journal: "Journal of Glaciology", Pages: "16" },
  },
  {
    id: "himalayan-snow-cover",
    type: "dataset",
    title: "Himalayan Snow Cover Fraction, 2001–2024",
    summary:
      "Monthly snow cover fraction for the western Himalaya derived from satellite imagery, for comparing mountain and polar cryosphere trends.",
    body: "Snow cover fraction is supplied as monthly grids with a basin-level summary table. The dataset supports studies of snowmelt timing and its links with the Indian monsoon.",
    region: "Himalaya",
    date: "2025-01-15",
    year: 2025,
    authors: ["Dr. N. Thakur"],
    tags: ["Snow", "Himalaya", "Remote sensing"],
    licence: "CC BY 4.0",
    access: "public",
    language: "English",
    meta: {
      DOI: "10.5281/dhruva.himalaya-snow",
      Format: "GeoTIFF, CSV",
      Coverage: "2001–2024",
      Resolution: "Monthly, 500 m",
    },
  },
  {
    id: "kongsfjorden-glacier-front",
    type: "photo",
    title: "Tidewater Glacier Front in Kongsfjorden",
    summary:
      "The calving front of a tidewater glacier photographed during IARE-9 fjord surveys near Ny-Ålesund.",
    body: "Photographed from the survey boat during a CTD transect. Glacier fronts like this release meltwater and icebergs that change the temperature and salinity of the fjord.",
    region: "Arctic",
    date: "2024-07-21",
    year: 2024,
    authors: ["A. Kulkarni"],
    tags: ["Glaciology", "Fjord", "Svalbard"],
    licence: "CC BY 4.0",
    access: "public",
    expeditionId: "iare-9",
    stationId: "himadri",
    language: "English",
    image: iceShelfImg,
    meta: { Credit: "A. Kulkarni / NCPOR", Camera: "Mirrorless, 70–200 mm" },
  },
  {
    id: "penguin-colony-survey",
    type: "photo",
    title: "Adélie Penguin Colony Survey Near the Coast",
    summary:
      "Field team counting an Adélie penguin colony on a coastal ridge during a summer wildlife survey.",
    body: "Scientists count nests from a safe distance along marked routes to avoid disturbing the birds. Repeat counts over many seasons show how colonies respond to changes in sea ice and food supply.",
    region: "Antarctica",
    date: "2024-01-12",
    year: 2024,
    authors: ["R. Sen"],
    tags: ["Wildlife", "Penguins", "Fieldwork"],
    licence: "CC BY 4.0",
    access: "public",
    expeditionId: "isea-43",
    language: "English",
    image: penguinsImg,
    meta: { Credit: "R. Sen / NCPOR" },
  },
  {
    id: "southern-ocean-whale-sighting",
    type: "photo",
    title: "Minke Whale Surfacing in Brash Ice",
    summary:
      "A minke whale surfacing among brash ice, recorded during the SOE-7 marine mammal watch.",
    body: "Marine mammal sightings are logged with position and time along the cruise track. Whales gather where krill are abundant, so sightings complement the acoustic krill survey.",
    region: "Southern Ocean",
    date: "2025-02-17",
    year: 2025,
    authors: ["A. Kulkarni"],
    tags: ["Wildlife", "Whales", "Krill"],
    licence: "CC BY-NC 4.0",
    access: "public",
    expeditionId: "soe-7",
    language: "English",
    image: whaleImg,
    meta: { Credit: "A. Kulkarni / NCPOR" },
  },
  {
    id: "voyage-to-bharati-film",
    type: "video",
    title: "Voyage to Bharati: 40 Days at Sea",
    summary:
      "A short documentary following ISEA-42 from Mumbai through the Southern Ocean to Bharati station.",
    body: "The film follows cargo loading, the Southern Ocean crossing, the first sight of pack ice and the arrival of the summer team at Bharati, with interviews with the expedition leader and scientists.",
    region: "Antarctica",
    date: "2023-08-15",
    year: 2023,
    authors: ["Dhruva Media Cell"],
    tags: ["Documentary", "Expedition", "Education"],
    licence: "CC BY-NC 4.0",
    access: "public",
    expeditionId: "isea-42",
    stationId: "bharati",
    language: "English",
    image: trekShipImg,
    meta: { Duration: "18 min", Subtitles: "English, Hindi" },
  },
  {
    id: "arctic-lecture-series",
    type: "video",
    title: "Why the Arctic Matters to India — Public Lecture",
    summary:
      "A public lecture explaining how Arctic warming connects to India's weather, monsoon and sea level.",
    body: "The lecture introduces India's Arctic research at Himadri, explains Arctic amplification, and discusses how changes far to the north can influence the Indian monsoon.",
    region: "Arctic",
    date: "2024-10-04",
    year: 2024,
    authors: ["Dr. Kavita Rao"],
    tags: ["Education", "Climate", "Lecture"],
    licence: "CC BY 4.0",
    access: "public",
    stationId: "himadri",
    language: "English",
    image: peaksImg,
    meta: { Duration: "46 min", Subtitles: "English, Hindi" },
  },
  {
    id: "school-video-call-maitri",
    type: "activity",
    title: "Live Video Call from Maitri with 40 Schools",
    summary:
      "Students from 40 schools spoke live with the overwintering team at Maitri about life and science at the station.",
    body: "The session covered the polar night, station routines, weather observation and careers in polar science. Questions from students were collected in advance in English and Hindi.",
    region: "Antarctica",
    date: "2024-06-21",
    year: 2024,
    authors: ["Dhruva Outreach Cell"],
    tags: ["Education", "Outreach", "Schools"],
    licence: "CC BY 4.0",
    access: "public",
    stationId: "maitri",
    language: "English",
    image: fieldTeamImg,
    meta: { Participants: "40 schools", Format: "Live video call" },
  },
  {
    id: "polar-photo-exhibition",
    type: "activity",
    title: '"Two Poles" Photo Exhibition, New Delhi',
    summary:
      "A public exhibition of photographs from Indian Antarctic and Arctic expeditions, with captions in English and Hindi.",
    body: "The exhibition presented fifty photographs from the Dhruva media archive, grouped by station and expedition, with QR codes linking each print to its full record online.",
    region: "Arctic",
    date: "2025-03-08",
    year: 2025,
    authors: ["Dhruva Outreach Cell"],
    tags: ["Outreach", "Photography", "Exhibition"],
    licence: "CC BY 4.0",
    access: "public",
    language: "English",
    image: twilightImg,
    meta: { Venue: "New Delhi", Duration: "2 weeks" },
  },
  {
    id: "sea-ice-hindi-explainer",
    type: "report",
    title: "समुद्री बर्फ़: विद्यार्थियों के लिए सरल परिचय",
    summary:
      "A Hindi-language explainer for school students on what sea ice is, how it forms and why it matters for climate.",
    body: "The booklet explains sea ice with simple diagrams, uses observations from ISEA-42 near Bharati as examples, and ends with a short quiz for classroom use.",
    region: "Antarctica",
    date: "2024-08-01",
    year: 2024,
    authors: ["Dhruva Outreach Cell"],
    tags: ["Education", "Sea ice", "Hindi"],
    licence: "CC BY 4.0",
    access: "public",
    expeditionId: "isea-42",
    language: "Hindi",
    meta: { "Report type": "Educational booklet", Pages: "24", Format: "PDF" },
  },
];

export const getStation = (id?: string) => stations.find((s) => s.id === id);
export const getExpedition = (id?: string) => expeditions.find((e) => e.id === id);
export const getItem = (id: string) => items.find((i) => i.id === id);
export const itemsByExpedition = (id: string) => items.filter((i) => i.expeditionId === id);
export const itemsByStation = (id: string) => items.filter((i) => i.stationId === id);
export const itemsByType = (type: ContentType) => items.filter((i) => i.type === type);

export const typeLabel = (t: ContentType) => CONTENT_TYPES.find((c) => c.id === t)?.label ?? t;

export const formatDate = (iso: string) =>
  // Fixed to UTC so the server and every visitor's browser render the same date.
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

export const ALL_TAGS = Array.from(new Set(items.flatMap((i) => i.tags))).sort();

export const LEARN_TOPICS = [
  {
    id: "ice-cores",
    title: "Ice cores",
    blurb:
      "Layers of snow compressed over millennia hold air bubbles that record ancient atmospheres.",
  },
  {
    id: "glaciers",
    title: "Glaciers and ice shelves",
    blurb: "Rivers of ice shape coastlines and control how quickly the ocean rises.",
  },
  {
    id: "wildlife",
    title: "Polar wildlife",
    blurb: "Penguins, seals, krill and seabirds depend on sea ice that changes every season.",
  },
  {
    id: "climate",
    title: "Polar climate",
    blurb: "The poles warm faster than anywhere else, and the effects reach every coastline.",
  },
];

export const GLOSSARY = [
  {
    t: "Sea ice",
    d: "Frozen ocean water that forms, grows and melts in the sea, unlike icebergs which come from glaciers.",
  },
  {
    t: "Ice shelf",
    d: "A thick floating platform of ice formed where a glacier flows down to the coastline and onto the ocean.",
  },
  {
    t: "Katabatic wind",
    d: "Dense cold air draining downhill under gravity, producing the fierce winds typical of polar plateaus.",
  },
  {
    t: "Mass balance",
    d: "The difference between snow gained and ice lost by a glacier over a year.",
  },
  {
    t: "CTD",
    d: "An instrument measuring conductivity, temperature and depth — the backbone of ocean profiling.",
  },
  {
    t: "Ice core",
    d: "A cylinder of ice drilled from a glacier or ice sheet whose layers and trapped air bubbles record past climate.",
  },
  {
    t: "Krill",
    d: "Small shrimp-like crustaceans that swarm in the Southern Ocean and feed penguins, seals and whales.",
  },
  {
    t: "Polar night",
    d: "The period in winter when the sun stays below the horizon for more than 24 hours at high latitudes.",
  },
  {
    t: "Ozone hole",
    d: "A seasonal thinning of the ozone layer over Antarctica each spring, caused by human-made chemicals.",
  },
  {
    t: "Fast ice",
    d: "Sea ice that is attached to the coast or the sea floor and does not drift with currents and winds.",
  },
];

export const POLAR_FACTS = [
  "Antarctica holds roughly 60 per cent of the world's fresh water, locked in ice.",
  "At Maitri the sun does not rise for nearly six weeks during the polar night.",
  "Ice cores from East Antarctica preserve a climate record more than 800,000 years old.",
  "Ny-Ålesund, home to Himadri, is one of the northernmost permanent settlements on Earth.",
];

export const ASK_EXAMPLES = [
  "What is Maitri?",
  "Who led ISEA-42?",
  "What did Indian expeditions learn about sea ice near Prydz Bay?",
  "How is the Amery Ice Shelf changing?",
  "Which datasets describe Arctic fjord temperatures?",
  "Why do scientists drill ice cores?",
];
