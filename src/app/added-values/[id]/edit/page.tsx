import { ADDED_VALUES, NEW_AV_IDS } from "@/data/added-values";
import { EditScreen } from "./edit-screen";

export const metadata = { title: "Edit an Added Value · VCP Prototype" };

/* As /added-values/[id]: a page per sample AV and per reference kept free for new ones. */
export function generateStaticParams() {
  return [...ADDED_VALUES.map((av) => av.id), ...NEW_AV_IDS].map((id) => ({ id }));
}

export default async function EditAddedValuePage({ params }: PageProps<"/added-values/[id]/edit">) {
  const { id } = await params;
  return <EditScreen id={id} />;
}
