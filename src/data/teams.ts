/* The planning team's teams: who a Team holiday can apply to (Planning · 03). No real people. */
export interface Team {
  id: string;
  name: string;
  people: string[];
}

export const TEAMS: Team[] = [
  { id: "platform", name: "Team Platform", people: ["Eve Kestrel", "John Mason Smith", "Alice Carter"] },
  { id: "finance", name: "Team Finance", people: ["Jack Morgan", "Noah Foster"] },
  { id: "warehouse", name: "Team Warehouse", people: ["Lena Novak", "Maya Bennett"] },
];
