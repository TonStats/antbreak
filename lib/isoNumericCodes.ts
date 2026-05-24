// ISO 3166-1 alpha-2 → numeric code lookup (for world-atlas map matching)
export const ISO_A2_TO_NUMERIC: Record<string, number> = {
  // Easy
  US: 840, GB: 826, FR: 250, DE: 276, JP: 392, CN: 156, IN: 356, BR: 76,
  AU: 36,  CA: 124, RU: 643, ZA: 710, MX: 484, AR: 32,  KR: 410, IT: 380,
  ES: 724, ID: 360, SA: 682, TR: 792, EG: 818, NG: 566, TH: 764, VN: 704,
  KE: 404, GH: 288, MA: 504, PK: 586, BD: 50,  PH: 608,

  // Medium
  AF: 4,   AL: 8,   DZ: 12,  AO: 24,  AM: 51,  AT: 40,  AZ: 31,  BH: 48,
  BY: 112, BE: 56,  BJ: 204, BO: 68,  BA: 70,  BW: 72,  BG: 100, BF: 854,
  KH: 116, CM: 120, CF: 140, TD: 148, CL: 152, CO: 170, CR: 188, HR: 191,
  CU: 192, CY: 196, CZ: 203, CD: 180, DK: 208, DJ: 262, DO: 214, EC: 218,
  SV: 222, ER: 232, EE: 233, ET: 231, FI: 246, GE: 268, GR: 300, GT: 320,
  GN: 324, HT: 332, HN: 340, HU: 348, IS: 352, IR: 364, IQ: 368, IE: 372,
  IL: 376, CI: 384, JM: 388, JO: 400, KZ: 398, KW: 414, KG: 417, LA: 418,
  LV: 428, LB: 422, LR: 430, LY: 434, LT: 440, LU: 442, MG: 450, MW: 454,
  MY: 458, ML: 466, MD: 498, MN: 496, ME: 499, MZ: 508, MM: 104, NA: 516,
  NP: 524, NL: 528, NZ: 554, NI: 558, NE: 562, KP: 408, MK: 807, NO: 578,
  OM: 512, PA: 591, PG: 598, PY: 600, PE: 604, PL: 616, PT: 620, QA: 634,
  CG: 178, RO: 642, RW: 646, SN: 686, RS: 688, SG: 702, SK: 703, SI: 705,
  SO: 706, LK: 144, SD: 729, SE: 752, CH: 756, SY: 760, TW: 158, TJ: 762,
  TZ: 834, TG: 768, TT: 780, TN: 788, TM: 795, UG: 800, UA: 804, AE: 784,
  UY: 858, UZ: 860, VE: 862, YE: 887, ZM: 894, ZW: 716, XK: 0,

  // Hard
  AD: 20,  AG: 28,  BS: 44,  BB: 52,  BZ: 84,  BT: 64,  BN: 96,  BI: 108,
  CV: 132, KM: 174, TL: 626, GQ: 226, SZ: 748, FJ: 242, GA: 266, GM: 270,
  GD: 308, GW: 624, GY: 328, KI: 296, LS: 426, LI: 438, MV: 462, MT: 470,
  MH: 584, MR: 478, MU: 480, FM: 583, MC: 492, NR: 520, PW: 585, KN: 659,
  LC: 662, VC: 670, WS: 882, SM: 674, ST: 678, SC: 690, SL: 694, SB: 90,
  SS: 728, SR: 740, TO: 776, TV: 798, VU: 548, VA: 336,
}
