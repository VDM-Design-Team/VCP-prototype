import type { ContactRow } from "@vdm-design-team/vcp-design-system";

/**
 * The Contact List (DS `ContactsPage`, Figma `Contact List`): the messages people sent through the contact form,
 * which the super admin reads and deletes. Sample data (`@example.com`, as the prototype's other people).
 */
export const CONTACTS: readonly ContactRow[] = [
  { id: "m1", email: "michael.ross@example.com", subject: "Access to the Design domain", message: "I joined the design team this week. Could someone give me access to the Design domain?" },
  { id: "m2", email: "sara.lind@example.com", subject: "Capacity points look wrong", message: "My capacity for Cycle 27 shows 0 points, but I am working full time this cycle." },
  { id: "m3", email: "tom.becker@example.com", subject: "Export the planning list", message: "Is there a way to export the planning list to a spreadsheet for our weekly review?" },
  { id: "m4", email: "priya.shah@example.com", subject: "Wrong holiday dates", message: "The holiday registry shows me off from 12 to 16 November. It should be 19 to 23." },
  { id: "m5", email: "daniel.ortiz@example.com", subject: "Notification emails", message: "I get an email for every comment. Can I turn these off and keep the bell?" },
  { id: "m6", email: "hanna.kowal@example.com", subject: "New project tag", message: "Please add a project tag for the supplier portal so we can file Added Values under it." },
  { id: "m7", email: "leo.marsh@example.com", subject: "Can't upload a file", message: "Uploading a 12 MB PDF to an Added Value fails without a message. Is there a size limit?" },
  { id: "m8", email: "ines.costa@example.com", subject: "Delete my account", message: "I'm leaving the company at the end of the month. Please delete my account then." },
  { id: "m9", email: "ben.okafor@example.com", subject: "Gantt chart is slow", message: "The Gantt chart takes a long time to open when every cycle is shown." },
  { id: "m10", email: "julia.weiss@example.com", subject: "Two accounts", message: "I seem to have two accounts with the same email. Could they be merged?" },
  { id: "m11", email: "omar.haddad@example.com", subject: "Reopen a rejected Added Value", message: "VCP-1209 was rejected as a duplicate, but it isn't one. Who can reopen it?" },
  { id: "m12", email: "emma.novak@example.com", subject: "Training session", message: "Our team would like a short session on planning in cycles. Is that possible next week?" },
];
