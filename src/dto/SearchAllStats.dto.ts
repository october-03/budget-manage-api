export interface SearchAllStatsDto {
  bank: SearchStats[];
  card: SearchStats[];
}

interface SearchStats {
  balance: number;
  id: number;
}
