const CREST_BASE = "https://crests.football-data.org";

/** Emblemas das competições (URLs). */
export const LEAGUE_EMBLEMS: Record<string, string> = {
  PL: `${CREST_BASE}/PL.png`,
  PD: `${CREST_BASE}/PD.png`,
  BL1: `${CREST_BASE}/BL1.png`,
  SA: `${CREST_BASE}/SA.png`,
  FL1: `${CREST_BASE}/FL1.png`,
  CL: `${CREST_BASE}/CL.png`,
  EL: `${CREST_BASE}/EL.png`,
  DED: `${CREST_BASE}/DED.png`,
  PPL: `${CREST_BASE}/PPL.png`,
  ELC: `${CREST_BASE}/ELC.png`,
  BSA: `${CREST_BASE}/BSA.png`,
  CLI: `${CREST_BASE}/CLI.png`,
};

export function getLeagueEmblem(code: string): string | undefined {
  return LEAGUE_EMBLEMS[code];
}

/**
 * Mapeamento de códigos de competição para região (agrupamento no frontend).
 */
export const REGIONS: Record<string, string> = {
  PL: "Europa",
  ELC: "Europa",
  PD: "Europa",
  BL1: "Europa",
  SA: "Europa",
  FL1: "Europa",
  DED: "Europa",
  PPL: "Europa",
  CL: "Europa",
  EL: "Europa",
  BSA: "América do Sul",
  CLI: "América do Sul",
};

export function getRegion(code: string): string {
  return REGIONS[code] ?? "Outras";
}
