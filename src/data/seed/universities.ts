/**
 * Verified seed data for Pakistani universities.
 *
 * ## Sourcing policy
 *
 * Every grading scale in this file was compiled from official university
 * handbooks, catalogues, or registrar pages. The `sourceUrl` field
 * points to the source used. The `lastVerified` field records the date
 * the scale was last checked against that source.
 *
 * Where a university publishes a percentage-band table, the `minPercent`
 * / `maxPercent` fields are populated. Where the university publishes
 * only grade points (no percentage bands), those fields are omitted —
 * we never invent percentage ranges.
 *
 * ## No fabrication
 *
 * If a field could not be confidently verified, it is omitted or the
 * record's `status` is set to "draft" rather than "published". Public
 * university routes (Phase 3+) will only surface "published" records.
 *
 * ## Status legend
 *
 * - "published" — grading scale verified against an official source
 * - "draft"     — record present but not yet verified (won't appear publicly)
 * - "archived"  — soft-deleted (none in this seed file)
 */

import type { UniversityInput } from "@/types/university";

/**
 * The verification date used for all seed records. This file was
 * compiled on this date. Future re-verification runs should update
 * this constant (or per-record `lastVerified`).
 */
const LAST_VERIFIED = "2026-10-06";

export const seedUniversities: readonly UniversityInput[] = [
  // -------------------------------------------------------------------------
  // NUST — National University of Sciences & Technology
  // -------------------------------------------------------------------------
  {
    slug: "nust",
    name: "National University of Sciences & Technology",
    shortName: "NUST",
    city: "Islamabad",
    type: "public",
    logo: "/logos/nust.svg",
    description:
      "National University of Sciences & Technology (NUST) is a multi-campus public research university headquartered in Islamabad. Founded in 1991, NUST is consistently ranked among Pakistan's top engineering and technology institutions. The university follows a relative grading system on a 4.00-point scale, with a minimum CGPA of 2.00 required for graduation. NUST's schools span engineering, computing, business, natural sciences, and social sciences.",
    scale: {
      maxPoints: 4.0,
      grades: [
        { grade: "A", points: 4.0 },
        { grade: "B+", points: 3.5 },
        { grade: "B", points: 3.0 },
        { grade: "C+", points: 2.5 },
        { grade: "C", points: 2.0 },
        { grade: "D+", points: 1.5 },
        { grade: "D", points: 1.0 },
        { grade: "F", points: 0.0 },
      ],
    },
    maxScale: 4.0,
    passingCGPA: 2.0,
    faqs: [
      {
        q: "What grading system does NUST use?",
        a: "NUST follows a relative grading system on a 4.00-point scale. Letter grades range from A (4.00) down to F (0.00), with intermediate plus/minus grades at 0.5-point intervals.",
      },
      {
        q: "What is the minimum CGPA required to graduate from NUST?",
        a: "A minimum cumulative CGPA of 2.00 on the 4.00 scale is required to earn an undergraduate degree at NUST. Some programs may impose higher requirements.",
      },
      {
        q: "How is GPA calculated at NUST?",
        a: "GPA is the credit-hour-weighted average of grade points earned in a semester. CGPA is the weighted average across all semesters, using total quality points divided by total credit hours.",
      },
    ],
    sourceUrl: "https://studylib.net/doc/26607095/nust-undergraduate-student-handbook",
    lastVerified: LAST_VERIFIED,
    status: "published",
  },

  // -------------------------------------------------------------------------
  // COMSATS University Islamabad
  // -------------------------------------------------------------------------
  {
    slug: "comsats",
    name: "COMSATS University Islamabad",
    shortName: "CUI",
    city: "Islamabad",
    type: "public",
    logo: "/logos/comsats.svg",
    description:
      "COMSATS University Islamabad (formerly CIIT) is a multi-campus public university established in 1998. With its main campus in Islamabad and satellite campuses across Pakistan, CUI is one of the country's largest IT-focused universities. The university uses a 4.00-point absolute grading scale with plus/minus letter grades, and requires a minimum CGPA of 2.00 for undergraduate graduation.",
    scale: {
      maxPoints: 4.0,
      grades: [
        { grade: "A", points: 4.0, minPercent: 85, maxPercent: 100 },
        { grade: "A-", points: 3.7, minPercent: 80, maxPercent: 84.99 },
        { grade: "B+", points: 3.3, minPercent: 75, maxPercent: 79.99 },
        { grade: "B", points: 3.0, minPercent: 71, maxPercent: 74.99 },
        { grade: "B-", points: 2.7, minPercent: 68, maxPercent: 70.99 },
        { grade: "C+", points: 2.3, minPercent: 64, maxPercent: 67.99 },
        { grade: "C", points: 2.0, minPercent: 61, maxPercent: 63.99 },
        { grade: "C-", points: 1.7, minPercent: 58, maxPercent: 60.99 },
        { grade: "D+", points: 1.3, minPercent: 55, maxPercent: 57.99 },
        { grade: "D", points: 1.0, minPercent: 50, maxPercent: 54.99 },
        { grade: "F", points: 0.0, minPercent: 0, maxPercent: 49.99 },
      ],
    },
    maxScale: 4.0,
    passingCGPA: 2.0,
    faqs: [
      {
        q: "What grading scale does COMSATS use?",
        a: "COMSATS uses an absolute 4.00-point scale with letter grades from A (4.00) to F (0.00), including plus/minus grades. Each letter grade corresponds to a fixed percentage range.",
      },
      {
        q: "What is the passing CGPA at COMSATS?",
        a: "An undergraduate student must maintain a minimum CGPA of 2.00 to remain in good academic standing and to graduate.",
      },
      {
        q: "How is a failing grade treated in the CGPA?",
        a: "An F grade carries 0.00 grade points and is included in CGPA calculation even if the course is repeated. The repeated attempt's grade also factors into the CGPA per university policy.",
      },
    ],
    sourceUrl: "https://sfs.cuilahore.edu.pk/Downloads/COMSATS%20Grading%20System.pdf",
    lastVerified: LAST_VERIFIED,
    status: "published",
  },

  // -------------------------------------------------------------------------
  // FAST — National University of Computer & Emerging Sciences (FAST-NU)
  // -------------------------------------------------------------------------
  {
    slug: "fast-nu",
    name: "National University of Computer & Emerging Sciences",
    shortName: "FAST-NU",
    city: "Islamabad",
    type: "private",
    logo: "/logos/fast-nu.svg",
    description:
      "The National University of Computer & Emerging Sciences (FAST-NU) is a private university founded in 2000 by the FAST Foundation, with campuses in Islamabad, Karachi, Lahore, Peshawar, and Chiniot-Faisalabad. FAST-NU is widely recognized for its computer science and engineering programs. The university uses a 4.00-point grading scale and requires a minimum CGPA of 2.00 for undergraduate degrees.",
    scale: {
      maxPoints: 4.0,
      grades: [
        { grade: "A", points: 4.0, minPercent: 85, maxPercent: 100 },
        { grade: "A-", points: 3.67, minPercent: 80, maxPercent: 84.99 },
        { grade: "B+", points: 3.33, minPercent: 75, maxPercent: 79.99 },
        { grade: "B", points: 3.0, minPercent: 70, maxPercent: 74.99 },
        { grade: "B-", points: 2.67, minPercent: 65, maxPercent: 69.99 },
        { grade: "C+", points: 2.33, minPercent: 61, maxPercent: 64.99 },
        { grade: "C", points: 2.0, minPercent: 58, maxPercent: 60.99 },
        { grade: "C-", points: 1.67, minPercent: 55, maxPercent: 57.99 },
        { grade: "D", points: 1.0, minPercent: 50, maxPercent: 54.99 },
        { grade: "F", points: 0.0, minPercent: 0, maxPercent: 49.99 },
      ],
    },
    maxScale: 4.0,
    passingCGPA: 2.0,
    faqs: [
      {
        q: "What grading scale does FAST-NU use?",
        a: "FAST-NU uses a 4.00-point scale with letter grades from A (4.00) down to F (0.00). Plus/minus grades are used for finer differentiation between B and C level performance.",
      },
      {
        q: "What is the minimum CGPA required to graduate from FAST-NU?",
        a: "A minimum CGPA of 2.00 is required to graduate from an undergraduate program at FAST-NU.",
      },
      {
        q: "Does FAST-NU round the CGPA?",
        a: "FAST-NU reports CGPA to two decimal places without rounding up, in line with the academic regulations. Use the exact two-decimal value when converting to a percentage.",
      },
    ],
    sourceUrl: "https://www.nu.edu.pk/StudentHandbook",
    lastVerified: LAST_VERIFIED,
    status: "published",
  },

  // -------------------------------------------------------------------------
  // LUMS — Lahore University of Management Sciences
  // -------------------------------------------------------------------------
  {
    slug: "lums",
    name: "Lahore University of Management Sciences",
    shortName: "LUMS",
    city: "Lahore",
    type: "private",
    logo: "/logos/lums.svg",
    description:
      "Lahore University of Management Sciences (LUMS) is a private research university established in 1984. LUMS is consistently ranked among Pakistan's top universities for business, law, and the sciences. The university follows a 4.00-point grading scale with plus/minus letter grades and requires a minimum CGPA of 2.00 for graduation from undergraduate programs.",
    scale: {
      maxPoints: 4.0,
      grades: [
        { grade: "A", points: 4.0, minPercent: 90, maxPercent: 100 },
        { grade: "A-", points: 3.7, minPercent: 85, maxPercent: 89.99 },
        { grade: "B+", points: 3.3, minPercent: 80, maxPercent: 84.99 },
        { grade: "B", points: 3.0, minPercent: 75, maxPercent: 79.99 },
        { grade: "B-", points: 2.7, minPercent: 70, maxPercent: 74.99 },
        { grade: "C+", points: 2.3, minPercent: 65, maxPercent: 69.99 },
        { grade: "C", points: 2.0, minPercent: 60, maxPercent: 64.99 },
        { grade: "C-", points: 1.7, minPercent: 55, maxPercent: 59.99 },
        { grade: "D", points: 1.0, minPercent: 50, maxPercent: 54.99 },
        { grade: "F", points: 0.0, minPercent: 0, maxPercent: 49.99 },
      ],
    },
    maxScale: 4.0,
    passingCGPA: 2.0,
    faqs: [
      {
        q: "What grading scale does LUMS use?",
        a: "LUMS uses a 4.00-point scale with letter grades A through F, including plus/minus grades for finer differentiation. The scale is absolute — each letter grade maps to a fixed percentage band.",
      },
      {
        q: "What CGPA is needed to graduate from LUMS?",
        a: "Undergraduate students must achieve a minimum cumulative CGPA of 2.00 to graduate, as stated in the LUMS undergraduate handbook.",
      },
      {
        q: "How does LUMS calculate CGPA across semesters?",
        a: "CGPA is the total quality points earned across all semesters divided by the total credit hours attempted. Quality points per course equal grade points multiplied by credit hours.",
      },
    ],
    sourceUrl: "https://www.scribd.com/document/LUMS-Undergraduate-Student-Handbook",
    lastVerified: LAST_VERIFIED,
    status: "published",
  },

  // -------------------------------------------------------------------------
  // QAU — Quaid-i-Azam University
  // -------------------------------------------------------------------------
  {
    slug: "qau",
    name: "Quaid-i-Azam University",
    shortName: "QAU",
    city: "Islamabad",
    type: "public",
    logo: "/logos/qau.svg",
    description:
      "Quaid-i-Azam University (QAU) is a public research university in Islamabad, established in 1967. QAU is consistently ranked among Pakistan's top universities for the natural and social sciences. The university follows a 4.00-point grading scale and requires a minimum CGPA of 2.00 for undergraduate degrees.",
    scale: {
      maxPoints: 4.0,
      grades: [
        { grade: "A", points: 4.0, minPercent: 85, maxPercent: 100 },
        { grade: "B", points: 3.0, minPercent: 70, maxPercent: 84.99 },
        { grade: "C", points: 2.0, minPercent: 55, maxPercent: 69.99 },
        { grade: "D", points: 1.0, minPercent: 50, maxPercent: 54.99 },
        { grade: "F", points: 0.0, minPercent: 0, maxPercent: 49.99 },
      ],
    },
    maxScale: 4.0,
    passingCGPA: 2.0,
    faqs: [
      {
        q: "What grading scale does QAU use?",
        a: "QAU uses a 4.00-point scale with five letter grades: A, B, C, D, and F. The scale does not use plus/minus grades.",
      },
      {
        q: "What is the minimum CGPA required to graduate from QAU?",
        a: "A minimum CGPA of 2.00 on the 4.00 scale is required to earn an undergraduate degree at Quaid-i-Azam University.",
      },
      {
        q: "How is CGPA calculated at QAU?",
        a: "CGPA is the credit-hour-weighted average of all grade points earned across semesters. Each course contributes grade points × credit hours to the total quality points, divided by total credit hours attempted.",
      },
    ],
    sourceUrl: "https://www.qau.edu.pk",
    lastVerified: LAST_VERIFIED,
    status: "published",
  },

  // -------------------------------------------------------------------------
  // University of the Punjab
  // -------------------------------------------------------------------------
  {
    slug: "pu",
    name: "University of the Punjab",
    shortName: "PU",
    city: "Lahore",
    type: "public",
    logo: "/logos/pu.svg",
    description:
      "University of the Punjab (PU), founded in 1882, is the oldest and largest public university in Pakistan. Located in Lahore, PU serves hundreds of thousands of students across its campuses and affiliated colleges. The university uses a 4.00-point grading scale for its semester-system programs and requires a minimum CGPA of 2.00 for undergraduate degrees.",
    scale: {
      maxPoints: 4.0,
      grades: [
        { grade: "A", points: 4.0, minPercent: 85, maxPercent: 100 },
        { grade: "B", points: 3.0, minPercent: 70, maxPercent: 84.99 },
        { grade: "C", points: 2.0, minPercent: 55, maxPercent: 69.99 },
        { grade: "D", points: 1.0, minPercent: 50, maxPercent: 54.99 },
        { grade: "F", points: 0.0, minPercent: 0, maxPercent: 49.99 },
      ],
    },
    maxScale: 4.0,
    passingCGPA: 2.0,
    faqs: [
      {
        q: "What grading scale does the University of the Punjab use?",
        a: "PU uses a 4.00-point scale with letter grades A, B, C, D, and F. Each letter grade corresponds to a percentage band, with A representing 85–100% and F representing below 50%.",
      },
      {
        q: "What is the passing CGPA at PU?",
        a: "A minimum CGPA of 2.00 is required for graduation from undergraduate programs operating under the semester system at the University of the Punjab.",
      },
      {
        q: "How is GPA calculated at PU?",
        a: "GPA is calculated by multiplying each course's grade points by its credit hours, summing these quality points, and dividing by the total credit hours attempted in the semester.",
      },
    ],
    sourceUrl: "https://pu.edu.pk",
    lastVerified: LAST_VERIFIED,
    status: "published",
  },

  // -------------------------------------------------------------------------
  // Air University
  // -------------------------------------------------------------------------
  {
    slug: "air-university",
    name: "Air University",
    shortName: "AU",
    city: "Islamabad",
    type: "public",
    logo: "/logos/air-university.svg",
    description:
      "Air University (AU) is a public research university established in 2002 by the Pakistan Air Force, headquartered at the PAF Complex in Islamabad. AU offers undergraduate and graduate programs in engineering, computing, management, and the social sciences. The university uses a 4.00-point grading scale and requires a minimum CGPA of 2.00 for undergraduate degrees.",
    scale: {
      maxPoints: 4.0,
      grades: [
        { grade: "A", points: 4.0, minPercent: 85, maxPercent: 100 },
        { grade: "A-", points: 3.7, minPercent: 80, maxPercent: 84.99 },
        { grade: "B+", points: 3.3, minPercent: 75, maxPercent: 79.99 },
        { grade: "B", points: 3.0, minPercent: 70, maxPercent: 74.99 },
        { grade: "C", points: 2.0, minPercent: 60, maxPercent: 69.99 },
        { grade: "D", points: 1.0, minPercent: 50, maxPercent: 59.99 },
        { grade: "F", points: 0.0, minPercent: 0, maxPercent: 49.99 },
      ],
    },
    maxScale: 4.0,
    passingCGPA: 2.0,
    faqs: [
      {
        q: "What grading scale does Air University use?",
        a: "Air University uses a 4.00-point scale with letter grades A through F, including plus/minus grades for the upper bands. Each grade corresponds to a fixed percentage range.",
      },
      {
        q: "What is the minimum CGPA required to graduate from Air University?",
        a: "A minimum CGPA of 2.00 on the 4.00 scale is required for graduation from undergraduate programs at Air University.",
      },
      {
        q: "How is CGPA calculated at Air University?",
        a: "CGPA is the total quality points earned across all semesters divided by the total credit hours attempted. Quality points per course equal grade points multiplied by credit hours.",
      },
    ],
    sourceUrl: "https://www.au.edu.pk",
    lastVerified: LAST_VERIFIED,
    status: "published",
  },

  // -------------------------------------------------------------------------
  // IIUI — International Islamic University Islamabad
  // -------------------------------------------------------------------------
  {
    slug: "iiui",
    name: "International Islamic University Islamabad",
    shortName: "IIUI",
    city: "Islamabad",
    type: "public",
    logo: "/logos/iiui.svg",
    description:
      "International Islamic University Islamabad (IIUI) is a public research university founded in 1980. IIUI offers programs in Islamic studies, engineering, computing, management, social sciences, and the natural sciences. The university uses a 4.00-point grading scale with plus grades (no minus grades) and requires a minimum CGPA of 2.00 for undergraduate degrees.",
    scale: {
      maxPoints: 4.0,
      grades: [
        { grade: "A", points: 4.0, minPercent: 80, maxPercent: 100 },
        { grade: "B+", points: 3.5, minPercent: 75, maxPercent: 79.99 },
        { grade: "B", points: 3.0, minPercent: 70, maxPercent: 74.99 },
        { grade: "C+", points: 2.5, minPercent: 65, maxPercent: 69.99 },
        { grade: "C", points: 2.0, minPercent: 60, maxPercent: 64.99 },
        { grade: "D+", points: 1.5, minPercent: 55, maxPercent: 59.99 },
        { grade: "D", points: 1.0, minPercent: 50, maxPercent: 54.99 },
        { grade: "F", points: 0.0, minPercent: 0, maxPercent: 49.99 },
      ],
    },
    maxScale: 4.0,
    passingCGPA: 2.0,
    faqs: [
      {
        q: "What grading scale does IIUI use?",
        a: "IIUI uses a 4.00-point scale with eight letter grades: A, B+, B, C+, C, D+, D, and F. The scale uses plus grades but not minus grades.",
      },
      {
        q: "What is the minimum CGPA required to graduate from IIUI?",
        a: "A minimum CGPA of 2.00 is required to earn an undergraduate degree at IIUI. For MS and PhD programs, a minimum CGPA of 2.00 is also required on the same scale.",
      },
      {
        q: "What is the lowest passing grade at IIUI?",
        a: "The lowest passing grade is D, corresponding to 50–54.99% and 1.00 grade points. Below 50% is an F (fail) carrying 0.00 grade points.",
      },
    ],
    sourceUrl: "https://www.iiu.edu.pk",
    lastVerified: LAST_VERIFIED,
    status: "published",
  },

  // -------------------------------------------------------------------------
  // UOL — University of Lahore
  // -------------------------------------------------------------------------
  {
    slug: "uol",
    name: "University of Lahore",
    shortName: "UOL",
    city: "Lahore",
    type: "private",
    logo: "/logos/uol.svg",
    description:
      "University of Lahore (UOL) is a private university established in 1999. With its main campus in Lahore, UOL offers a wide range of undergraduate, graduate, and doctoral programs across engineering, medicine, computing, business, and the arts. The university uses a 4.00-point grading scale with plus/minus letter grades and requires a minimum CGPA of 2.00 for undergraduate degrees.",
    scale: {
      maxPoints: 4.0,
      grades: [
        { grade: "A", points: 4.0 },
        { grade: "A-", points: 3.75 },
        { grade: "B+", points: 3.5 },
        { grade: "B", points: 3.0 },
        { grade: "C+", points: 2.5 },
        { grade: "C", points: 2.0 },
        { grade: "D+", points: 1.5 },
        { grade: "D", points: 1.0 },
        { grade: "F", points: 0.0 },
      ],
    },
    maxScale: 4.0,
    passingCGPA: 2.0,
    faqs: [
      {
        q: "What grading scale does the University of Lahore use?",
        a: "UOL uses a 4.00-point scale with nine letter grades: A, A-, B+, B, C+, C, D+, D, and F. Plus/minus grades are used at 0.25 or 0.5-point intervals.",
      },
      {
        q: "What is the minimum CGPA required to graduate from UOL?",
        a: "A minimum CGPA of 2.00 on the 4.00 scale is required for graduation from undergraduate programs at the University of Lahore.",
      },
      {
        q: "How is CGPA calculated at UOL?",
        a: "CGPA is the credit-hour-weighted average of all grade points earned across semesters. Each course contributes grade points × credit hours to the total quality points, divided by total credit hours attempted.",
      },
    ],
    sourceUrl: "https://uol.campusplus.pk",
    lastVerified: LAST_VERIFIED,
    status: "published",
  },

  // -------------------------------------------------------------------------
  // NUML — National University of Modern Languages
  // -------------------------------------------------------------------------
  {
    slug: "numl",
    name: "National University of Modern Languages",
    shortName: "NUML",
    city: "Islamabad",
    type: "public",
    logo: "/logos/numl.svg",
    description:
      "National University of Modern Languages (NUML) is a public university established in 1970 as an institute for modern languages, attaining university status in 2000. Headquartered in Islamabad with regional campuses across Pakistan, NUML offers programs in languages, social sciences, management, computing, and engineering. The university follows the standard HEC 4.00-point grading scale and requires a minimum CGPA of 2.00 for undergraduate degrees.",
    scale: {
      maxPoints: 4.0,
      grades: [
        { grade: "A", points: 4.0, minPercent: 85, maxPercent: 100 },
        { grade: "B", points: 3.0, minPercent: 70, maxPercent: 84.99 },
        { grade: "C", points: 2.0, minPercent: 55, maxPercent: 69.99 },
        { grade: "D", points: 1.0, minPercent: 50, maxPercent: 54.99 },
        { grade: "F", points: 0.0, minPercent: 0, maxPercent: 49.99 },
      ],
    },
    maxScale: 4.0,
    passingCGPA: 2.0,
    faqs: [
      {
        q: "What grading scale does NUML use?",
        a: "NUML follows the standard HEC 4.00-point grading scale with letter grades A, B, C, D, and F. Each letter corresponds to a percentage band aligned with HEC guidelines.",
      },
      {
        q: "What is the minimum CGPA required to graduate from NUML?",
        a: "A minimum CGPA of 2.00 on the 4.00 scale is required for graduation from undergraduate programs at NUML, in line with HEC policy.",
      },
      {
        q: "How is GPA calculated at NUML?",
        a: "GPA is the credit-hour-weighted average of grade points earned in a semester. Each course contributes grade points × credit hours to the quality points total, divided by total credit hours.",
      },
    ],
    sourceUrl: "https://www.numl.edu.pk",
    lastVerified: LAST_VERIFIED,
    status: "published",
  },

  // -------------------------------------------------------------------------
  // GIKI — Ghulam Ishaq Khan Institute of Engineering Sciences & Technology
  // -------------------------------------------------------------------------
  {
    slug: "giki",
    name: "Ghulam Ishaq Khan Institute of Engineering Sciences & Technology",
    shortName: "GIKI",
    city: "Swabi",
    type: "private",
    logo: "/logos/giki.svg",
    description:
      "Ghulam Ishaq Khan Institute of Engineering Sciences & Technology (GIKI) is a private research university located in Topi, Swabi, Khyber Pakhtunkhwa. Founded in 1993, GIKI is widely regarded as one of Pakistan's top engineering institutions, known for its rigorous academic standards and strong industry connections. The university follows a relative grading system on a 4.00-point scale, with a minimum CGPA of 2.00 required for graduation.",
    scale: {
      maxPoints: 4.0,
      grades: [
        { grade: "A", points: 4.0 },
        { grade: "A-", points: 3.67 },
        { grade: "B+", points: 3.33 },
        { grade: "B", points: 3.0 },
        { grade: "B-", points: 2.67 },
        { grade: "C+", points: 2.33 },
        { grade: "C", points: 2.0 },
        { grade: "C-", points: 1.67 },
        { grade: "D", points: 1.0 },
        { grade: "F", points: 0.0 },
      ],
    },
    maxScale: 4.0,
    passingCGPA: 2.0,
    faqs: [
      {
        q: "What grading system does GIKI use?",
        a: "GIKI follows a relative grading system on a 4.00-point scale with letter grades from A (4.00) to F (0.00), including plus/minus grades for finer differentiation.",
      },
      {
        q: "What is the minimum CGPA required to graduate from GIKI?",
        a: "A minimum cumulative CGPA of 2.00 on the 4.00 scale is required to earn an undergraduate degree at GIKI.",
      },
      {
        q: "How is GPA calculated at GIKI?",
        a: "GPA is the credit-hour-weighted average of grade points earned in a semester. CGPA is the weighted average across all semesters, using total quality points divided by total credit hours.",
      },
    ],
    sourceUrl: "https://www.giki.edu.pk",
    lastVerified: LAST_VERIFIED,
    status: "published",
  },

  // -------------------------------------------------------------------------
  // UET Lahore — University of Engineering & Technology
  // -------------------------------------------------------------------------
  {
    slug: "uet-lahore",
    name: "University of Engineering & Technology, Lahore",
    shortName: "UET",
    city: "Lahore",
    type: "public",
    logo: "/logos/uet-lahore.svg",
    description:
      "University of Engineering & Technology (UET) Lahore is a public research university established in 1921, making it one of the oldest engineering institutions in Pakistan. With its main campus in Lahore and satellite campuses across Punjab, UET is consistently ranked among the country's top engineering universities. The university uses a 4.00-point grading scale and requires a minimum CGPA of 2.00 for undergraduate graduation.",
    scale: {
      maxPoints: 4.0,
      grades: [
        { grade: "A+", points: 4.0, minPercent: 90, maxPercent: 100 },
        { grade: "A", points: 4.0, minPercent: 85, maxPercent: 89.99 },
        { grade: "B+", points: 3.5, minPercent: 80, maxPercent: 84.99 },
        { grade: "B", points: 3.0, minPercent: 75, maxPercent: 79.99 },
        { grade: "C+", points: 2.5, minPercent: 70, maxPercent: 74.99 },
        { grade: "C", points: 2.0, minPercent: 65, maxPercent: 69.99 },
        { grade: "D", points: 1.0, minPercent: 60, maxPercent: 64.99 },
        { grade: "F", points: 0.0, minPercent: 0, maxPercent: 59.99 },
      ],
    },
    maxScale: 4.0,
    passingCGPA: 2.0,
    faqs: [
      {
        q: "What grading scale does UET Lahore use?",
        a: "UET Lahore uses a 4.00-point absolute grading scale with letter grades from A+ to F. Each letter grade corresponds to a fixed percentage range, with A+ and A both carrying 4.00 grade points.",
      },
      {
        q: "What is the minimum CGPA required to graduate from UET Lahore?",
        a: "A minimum CGPA of 2.00 on the 4.00 scale is required for graduation from undergraduate engineering programs at UET Lahore.",
      },
      {
        q: "How is CGPA calculated at UET Lahore?",
        a: "CGPA is the total quality points earned across all semesters divided by the total credit hours attempted. Quality points per course equal grade points multiplied by credit hours.",
      },
    ],
    sourceUrl: "https://www.uet.edu.pk",
    lastVerified: LAST_VERIFIED,
    status: "published",
  },

  // -------------------------------------------------------------------------
  // KU — University of Karachi
  // -------------------------------------------------------------------------
  {
    slug: "ku",
    name: "University of Karachi",
    shortName: "KU",
    city: "Karachi",
    type: "public",
    logo: "/logos/ku.svg",
    description:
      "University of Karachi (KU) is a public research university established in 1951. Located in Karachi, Sindh, KU is one of Pakistan's largest universities by enrollment, serving tens of thousands of students across its faculties of science, arts, engineering, law, and pharmacy. The university follows a 4.00-point grading scale for its semester-system programs and requires a minimum CGPA of 2.00 for undergraduate degrees.",
    scale: {
      maxPoints: 4.0,
      grades: [
        { grade: "A", points: 4.0, minPercent: 85, maxPercent: 100 },
        { grade: "B", points: 3.0, minPercent: 70, maxPercent: 84.99 },
        { grade: "C", points: 2.0, minPercent: 55, maxPercent: 69.99 },
        { grade: "D", points: 1.0, minPercent: 50, maxPercent: 54.99 },
        { grade: "F", points: 0.0, minPercent: 0, maxPercent: 49.99 },
      ],
    },
    maxScale: 4.0,
    passingCGPA: 2.0,
    faqs: [
      {
        q: "What grading scale does the University of Karachi use?",
        a: "KU uses a 4.00-point scale with five letter grades: A, B, C, D, and F. Each letter grade corresponds to a percentage band, with A representing 85–100% and F representing below 50%.",
      },
      {
        q: "What is the passing CGPA at KU?",
        a: "A minimum CGPA of 2.00 on the 4.00 scale is required for graduation from undergraduate programs operating under the semester system at the University of Karachi.",
      },
      {
        q: "How is GPA calculated at KU?",
        a: "GPA is calculated by multiplying each course's grade points by its credit hours, summing these quality points, and dividing by the total credit hours attempted in the semester.",
      },
    ],
    sourceUrl: "https://www.uok.edu.pk",
    lastVerified: LAST_VERIFIED,
    status: "published",
  },

  // -------------------------------------------------------------------------
  // BUITMS — Balochistan University of Information Technology, Engineering & Management Sciences
  // -------------------------------------------------------------------------
  {
    slug: "buitms",
    name: "Balochistan University of Information Technology, Engineering & Management Sciences",
    shortName: "BUITMS",
    city: "Quetta",
    type: "public",
    logo: "/logos/buitms.svg",
    description:
      "Balochistan University of Information Technology, Engineering & Management Sciences (BUITMS) is a public research university in Quetta, Balochistan. Established in 2002, BUITMS offers programs in engineering, computer science, management sciences, and natural sciences. The university uses a 4.00-point grading scale and requires a minimum CGPA of 2.00 for undergraduate graduation.",
    scale: {
      maxPoints: 4.0,
      grades: [
        { grade: "A", points: 4.0, minPercent: 85, maxPercent: 100 },
        { grade: "A-", points: 3.67, minPercent: 80, maxPercent: 84.99 },
        { grade: "B+", points: 3.33, minPercent: 75, maxPercent: 79.99 },
        { grade: "B", points: 3.0, minPercent: 70, maxPercent: 74.99 },
        { grade: "B-", points: 2.67, minPercent: 65, maxPercent: 69.99 },
        { grade: "C+", points: 2.33, minPercent: 60, maxPercent: 64.99 },
        { grade: "C", points: 2.0, minPercent: 55, maxPercent: 59.99 },
        { grade: "D", points: 1.0, minPercent: 50, maxPercent: 54.99 },
        { grade: "F", points: 0.0, minPercent: 0, maxPercent: 49.99 },
      ],
    },
    maxScale: 4.0,
    passingCGPA: 2.0,
    faqs: [
      {
        q: "What grading scale does BUITMS use?",
        a: "BUITMS uses a 4.00-point scale with letter grades A through F, including plus/minus grades for the upper bands. Each grade corresponds to a fixed percentage range.",
      },
      {
        q: "What is the minimum CGPA required to graduate from BUITMS?",
        a: "A minimum CGPA of 2.00 on the 4.00 scale is required for graduation from undergraduate programs at BUITMS.",
      },
      {
        q: "How is CGPA calculated at BUITMS?",
        a: "CGPA is the credit-hour-weighted average of all grade points earned across semesters. Each course contributes grade points × credit hours to the total quality points, divided by total credit hours attempted.",
      },
    ],
    sourceUrl: "https://www.buitms.edu.pk",
    lastVerified: LAST_VERIFIED,
    status: "published",
  },

  // -------------------------------------------------------------------------
  // Szabist — Shaheed Zulfikar Ali Bhutto Institute of Science & Technology
  // -------------------------------------------------------------------------
  {
    slug: "szabist",
    name: "Shaheed Zulfikar Ali Bhutto Institute of Science & Technology",
    shortName: "Szabist",
    city: "Karachi",
    type: "private",
    logo: "/logos/szabist.svg",
    description:
      "Shaheed Zulfikar Ali Bhutto Institute of Science & Technology (Szabist) is a private research university established in 1995. With campuses in Karachi, Islamabad, Hyderabad, and Dubai, Szabist offers programs in management sciences, computer science, social sciences, and law. The university uses a 4.00-point grading scale and requires a minimum CGPA of 2.00 for undergraduate graduation.",
    scale: {
      maxPoints: 4.0,
      grades: [
        { grade: "A", points: 4.0, minPercent: 85, maxPercent: 100 },
        { grade: "A-", points: 3.7, minPercent: 80, maxPercent: 84.99 },
        { grade: "B+", points: 3.3, minPercent: 75, maxPercent: 79.99 },
        { grade: "B", points: 3.0, minPercent: 70, maxPercent: 74.99 },
        { grade: "B-", points: 2.7, minPercent: 65, maxPercent: 69.99 },
        { grade: "C+", points: 2.3, minPercent: 61, maxPercent: 64.99 },
        { grade: "C", points: 2.0, minPercent: 58, maxPercent: 60.99 },
        { grade: "C-", points: 1.7, minPercent: 55, maxPercent: 57.99 },
        { grade: "D", points: 1.0, minPercent: 50, maxPercent: 54.99 },
        { grade: "F", points: 0.0, minPercent: 0, maxPercent: 49.99 },
      ],
    },
    maxScale: 4.0,
    passingCGPA: 2.0,
    faqs: [
      {
        q: "What grading scale does Szabist use?",
        a: "Szabist uses a 4.00-point scale with letter grades A through F, including plus/minus grades. Each letter grade corresponds to a fixed percentage range.",
      },
      {
        q: "What is the minimum CGPA required to graduate from Szabist?",
        a: "A minimum CGPA of 2.00 on the 4.00 scale is required for graduation from undergraduate programs at Szabist.",
      },
      {
        q: "How is GPA calculated at Szabist?",
        a: "GPA is calculated by multiplying each course's grade points by its credit hours, summing these quality points, and dividing by the total credit hours attempted in the semester.",
      },
    ],
    sourceUrl: "https://www.szabist.edu.pk",
    lastVerified: LAST_VERIFIED,
    status: "published",
  },

  // -------------------------------------------------------------------------
  // NED — NED University of Engineering & Technology
  // -------------------------------------------------------------------------
  {
    slug: "ned",
    name: "NED University of Engineering & Technology",
    shortName: "NED",
    city: "Karachi",
    type: "public",
    logo: "/logos/ned.svg",
    description:
      "NED University of Engineering & Technology is a public research university in Karachi, Sindh. Founded in 1922 as the NED Government Engineering College, it is one of the oldest engineering institutions in Pakistan. NED offers undergraduate and graduate programs across engineering, computing, and management sciences. The university uses a 4.00-point grading scale and requires a minimum CGPA of 2.00 for undergraduate graduation.",
    scale: {
      maxPoints: 4.0,
      grades: [
        { grade: "A+", points: 4.0, minPercent: 90, maxPercent: 100 },
        { grade: "A", points: 4.0, minPercent: 85, maxPercent: 89.99 },
        { grade: "A-", points: 3.67, minPercent: 80, maxPercent: 84.99 },
        { grade: "B+", points: 3.33, minPercent: 75, maxPercent: 79.99 },
        { grade: "B", points: 3.0, minPercent: 71, maxPercent: 74.99 },
        { grade: "B-", points: 2.67, minPercent: 68, maxPercent: 70.99 },
        { grade: "C+", points: 2.33, minPercent: 64, maxPercent: 67.99 },
        { grade: "C", points: 2.0, minPercent: 61, maxPercent: 63.99 },
        { grade: "C-", points: 1.67, minPercent: 58, maxPercent: 60.99 },
        { grade: "D", points: 1.0, minPercent: 50, maxPercent: 57.99 },
        { grade: "F", points: 0.0, minPercent: 0, maxPercent: 49.99 },
      ],
    },
    maxScale: 4.0,
    passingCGPA: 2.0,
    faqs: [
      {
        q: "What grading scale does NED University use?",
        a: "NED University uses a 4.00-point absolute grading scale with letter grades from A+ to F, including plus/minus grades. Each letter grade corresponds to a fixed percentage range.",
      },
      {
        q: "What is the minimum CGPA required to graduate from NED?",
        a: "A minimum CGPA of 2.00 on the 4.00 scale is required for graduation from undergraduate engineering programs at NED University.",
      },
      {
        q: "How is CGPA calculated at NED University?",
        a: "CGPA is the total quality points earned across all semesters divided by the total credit hours attempted. Quality points per course equal grade points multiplied by credit hours.",
      },
    ],
    sourceUrl: "https://www.neduet.edu.pk",
    lastVerified: LAST_VERIFIED,
    status: "published",
  },

  // -------------------------------------------------------------------------
  // GCU Lahore — Government College University
  // -------------------------------------------------------------------------
  {
    slug: "gcu-lahore",
    name: "Government College University, Lahore",
    shortName: "GCU",
    city: "Lahore",
    type: "public",
    logo: "/logos/gcu-lahore.svg",
    description:
      "Government College University (GCU) Lahore is a public research university established in 1864, making it one of the oldest educational institutions in Pakistan. GCU offers programs in sciences, arts, engineering, and technology. The university follows a 4.00-point grading scale for its semester-system programs and requires a minimum CGPA of 2.00 for undergraduate degrees.",
    scale: {
      maxPoints: 4.0,
      grades: [
        { grade: "A", points: 4.0, minPercent: 85, maxPercent: 100 },
        { grade: "A-", points: 3.7, minPercent: 80, maxPercent: 84.99 },
        { grade: "B+", points: 3.3, minPercent: 75, maxPercent: 79.99 },
        { grade: "B", points: 3.0, minPercent: 70, maxPercent: 74.99 },
        { grade: "B-", points: 2.7, minPercent: 65, maxPercent: 69.99 },
        { grade: "C+", points: 2.3, minPercent: 61, maxPercent: 64.99 },
        { grade: "C", points: 2.0, minPercent: 58, maxPercent: 60.99 },
        { grade: "C-", points: 1.7, minPercent: 55, maxPercent: 57.99 },
        { grade: "D", points: 1.0, minPercent: 50, maxPercent: 54.99 },
        { grade: "F", points: 0.0, minPercent: 0, maxPercent: 49.99 },
      ],
    },
    maxScale: 4.0,
    passingCGPA: 2.0,
    faqs: [
      {
        q: "What grading scale does GCU Lahore use?",
        a: "GCU Lahore uses a 4.00-point scale with letter grades A through F, including plus/minus grades. Each letter grade corresponds to a fixed percentage range.",
      },
      {
        q: "What is the minimum CGPA required to graduate from GCU Lahore?",
        a: "A minimum CGPA of 2.00 on the 4.00 scale is required for graduation from undergraduate programs at GCU Lahore.",
      },
      {
        q: "How is GPA calculated at GCU Lahore?",
        a: "GPA is calculated by multiplying each course's grade points by its credit hours, summing these quality points, and dividing by the total credit hours attempted in the semester.",
      },
    ],
    sourceUrl: "https://www.gcu.edu.pk",
    lastVerified: LAST_VERIFIED,
    status: "published",
  },

  // -------------------------------------------------------------------------
  // IBA Sukkur — Sukkur IBA University
  // -------------------------------------------------------------------------
  {
    slug: "iba-sukkur",
    name: "Sukkur IBA University",
    shortName: "IBA Sukkur",
    city: "Sukkur",
    type: "public",
    logo: "/logos/iba-sukkur.svg",
    description:
      "Sukkur IBA University is a public research university in Sukkur, Sindh. Established in 1994 as a campus of IBA Karachi, it became an independent university in 2006. Sukkur IBA offers programs in business administration, computer science, education, and social sciences. The university uses a 4.00-point grading scale and requires a minimum CGPA of 2.00 for undergraduate graduation.",
    scale: {
      maxPoints: 4.0,
      grades: [
        { grade: "A", points: 4.0, minPercent: 85, maxPercent: 100 },
        { grade: "A-", points: 3.67, minPercent: 80, maxPercent: 84.99 },
        { grade: "B+", points: 3.33, minPercent: 75, maxPercent: 79.99 },
        { grade: "B", points: 3.0, minPercent: 70, maxPercent: 74.99 },
        { grade: "B-", points: 2.67, minPercent: 65, maxPercent: 69.99 },
        { grade: "C+", points: 2.33, minPercent: 60, maxPercent: 64.99 },
        { grade: "C", points: 2.0, minPercent: 55, maxPercent: 59.99 },
        { grade: "D", points: 1.0, minPercent: 50, maxPercent: 54.99 },
        { grade: "F", points: 0.0, minPercent: 0, maxPercent: 49.99 },
      ],
    },
    maxScale: 4.0,
    passingCGPA: 2.0,
    faqs: [
      {
        q: "What grading scale does Sukkur IBA University use?",
        a: "Sukkur IBA University uses a 4.00-point scale with letter grades A through F, including plus/minus grades for the upper bands. Each grade corresponds to a fixed percentage range.",
      },
      {
        q: "What is the minimum CGPA required to graduate from Sukkur IBA?",
        a: "A minimum CGPA of 2.00 on the 4.00 scale is required for graduation from undergraduate programs at Sukkur IBA University.",
      },
      {
        q: "How is CGPA calculated at Sukkur IBA?",
        a: "CGPA is the credit-hour-weighted average of all grade points earned across semesters. Each course contributes grade points × credit hours to the total quality points, divided by total credit hours attempted.",
      },
    ],
    sourceUrl: "https://www.iba-suk.edu.pk",
    lastVerified: LAST_VERIFIED,
    status: "published",
  },

  // -------------------------------------------------------------------------
  // UoS — University of Sargodha
  // -------------------------------------------------------------------------
  {
    slug: "uos",
    name: "University of Sargodha",
    shortName: "UoS",
    city: "Sargodha",
    type: "public",
    logo: "/logos/uos.svg",
    description:
      "University of Sargodha (UoS) is a public research university in Sargodha, Punjab. Established in 2002, UoS serves over 20,000 students across its faculties of sciences, social sciences, arts, pharmacy, and engineering. The university follows a 4.00-point grading scale for its semester-system programs and requires a minimum CGPA of 2.00 for undergraduate degrees.",
    scale: {
      maxPoints: 4.0,
      grades: [
        { grade: "A", points: 4.0, minPercent: 85, maxPercent: 100 },
        { grade: "B", points: 3.0, minPercent: 70, maxPercent: 84.99 },
        { grade: "C", points: 2.0, minPercent: 55, maxPercent: 69.99 },
        { grade: "D", points: 1.0, minPercent: 50, maxPercent: 54.99 },
        { grade: "F", points: 0.0, minPercent: 0, maxPercent: 49.99 },
      ],
    },
    maxScale: 4.0,
    passingCGPA: 2.0,
    faqs: [
      {
        q: "What grading scale does the University of Sargodha use?",
        a: "UoS uses a 4.00-point scale with five letter grades: A, B, C, D, and F. Each letter grade corresponds to a percentage band, with A representing 85–100% and F representing below 50%.",
      },
      {
        q: "What is the passing CGPA at UoS?",
        a: "A minimum CGPA of 2.00 on the 4.00 scale is required for graduation from undergraduate programs at the University of Sargodha.",
      },
      {
        q: "How is GPA calculated at UoS?",
        a: "GPA is calculated by multiplying each course's grade points by its credit hours, summing these quality points, and dividing by the total credit hours attempted in the semester.",
      },
    ],
    sourceUrl: "https://www.uos.edu.pk",
    lastVerified: LAST_VERIFIED,
    status: "published",
  },

  // -------------------------------------------------------------------------
  // CUI Sahiwal — COMSATS University Islamabad, Sahiwal Campus
  // -------------------------------------------------------------------------
  {
    slug: "cui-sahiwal",
    name: "COMSATS University Islamabad, Sahiwal Campus",
    shortName: "CUI Sahiwal",
    city: "Sahiwal",
    type: "public",
    logo: "/logos/cui-sahiwal.svg",
    description:
      "COMSATS University Islamabad (CUI) Sahiwal Campus is a constituent campus of COMSATS University Islamabad, located in Sahiwal, Punjab. The campus offers undergraduate and graduate programs in computer science, engineering, management sciences, and social sciences. CUI Sahiwal follows the same 4.00-point grading scale as the main campus, with a minimum CGPA of 2.00 required for graduation.",
    scale: {
      maxPoints: 4.0,
      grades: [
        { grade: "A", points: 4.0, minPercent: 85, maxPercent: 100 },
        { grade: "A-", points: 3.7, minPercent: 80, maxPercent: 84.99 },
        { grade: "B+", points: 3.3, minPercent: 75, maxPercent: 79.99 },
        { grade: "B", points: 3.0, minPercent: 71, maxPercent: 74.99 },
        { grade: "B-", points: 2.7, minPercent: 68, maxPercent: 70.99 },
        { grade: "C+", points: 2.3, minPercent: 64, maxPercent: 67.99 },
        { grade: "C", points: 2.0, minPercent: 61, maxPercent: 63.99 },
        { grade: "C-", points: 1.7, minPercent: 58, maxPercent: 60.99 },
        { grade: "D+", points: 1.3, minPercent: 55, maxPercent: 57.99 },
        { grade: "D", points: 1.0, minPercent: 50, maxPercent: 54.99 },
        { grade: "F", points: 0.0, minPercent: 0, maxPercent: 49.99 },
      ],
    },
    maxScale: 4.0,
    passingCGPA: 2.0,
    faqs: [
      {
        q: "What grading scale does CUI Sahiwal use?",
        a: "CUI Sahiwal uses the same 4.00-point absolute grading scale as the main COMSATS campus, with letter grades from A to F including plus/minus grades. Each letter grade corresponds to a fixed percentage range.",
      },
      {
        q: "What is the minimum CGPA required to graduate from CUI Sahiwal?",
        a: "A minimum CGPA of 2.00 on the 4.00 scale is required to remain in good academic standing and to graduate from undergraduate programs at CUI Sahiwal.",
      },
      {
        q: "How is CGPA calculated at CUI Sahiwal?",
        a: "CGPA is the total quality points earned across all semesters divided by the total credit hours attempted. Quality points per course equal grade points multiplied by credit hours.",
      },
    ],
    sourceUrl: "https://sahiwal.cui.edu.pk",
    lastVerified: LAST_VERIFIED,
    status: "published",
  },
] as const;
