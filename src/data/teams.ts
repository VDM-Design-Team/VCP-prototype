/* The teams an admin's Settings start with (Admin · 04): the dashboard's team filter and a Team holiday's
   Applies to (Planning · 03) read them from the settings store. No real people. */
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
