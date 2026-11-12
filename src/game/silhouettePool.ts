/**
 * Countries the Silhouette mode can use: playable countries whose outline is at least SILHOUETTE_MIN_SIDE map units
 * on its longest side (smaller shapes are not recognisable). Kept static so the pool is stable across map data
 * updates; `modes.test.ts` fails if the map data stops matching, and then this list must be regenerated deliberately
 * (changing it reshuffles every future Silhouette puzzle).
 */
export const SILHOUETTE_IDS: readonly string[] = `
AE AF AL AM AO AR AT AZ BA BD BE BF BG BJ BO BR BT BW BY BZ CA CD CF CG CH CL CM CN CO CR CU CZ DE
DK DO DZ EC EE EG ER ES ET FI FJ FR GA GB GE GH GM GN GQ GR GT GW GY HN HR HT HU ID IE IL IN IQ IR
IS IT JO JP KE KG KH KZ LA LK LR LT LV LY MA MD MG ML MM MN MR MW MX MY MZ NA NE NG NI NL NO NP NZ
OM PA PE PG PH PK PL PT PY RO RS RU SA SB SD SE SK SL SN SO SR SS SY TD TG TH TJ TL TM TN TR TW TZ
UA UG US UY UZ VE VN YE ZA ZM ZW
`.trim().split(/\s+/);
