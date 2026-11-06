import { ADDED_VALUES } from "@/data/added-values";
import { AVScreen } from "./av-screen";

/* The static export builds a page per sample Added Value. */
export function generateStaticParams() {
  return ADDED_VALUES.map((av) => ({ id: av.id }));
}

export default async function AddedValuePage({ params }: PageProps<"/added-values/[id]">) {
  const { id } = await params;
  return <AVScreen id={id} />;
}
