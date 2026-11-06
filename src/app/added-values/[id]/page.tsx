import { ADDED_VALUES, NEW_AV_IDS } from "@/data/added-values";
import { AVScreen } from "./av-screen";

/* The static export builds a page per sample Added Value, and for the references kept free for new ones. */
export function generateStaticParams() {
  return [...ADDED_VALUES.map((av) => av.id), ...NEW_AV_IDS].map((id) => ({ id }));
}

export default async function AddedValuePage({ params }: PageProps<"/added-values/[id]">) {
  const { id } = await params;
  return <AVScreen id={id} />;
}
