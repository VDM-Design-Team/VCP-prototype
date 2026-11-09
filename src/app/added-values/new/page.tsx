import { CreateScreen } from "./create-screen";

export const metadata = { title: "Added Value Creation · VCP Prototype" };

/* Static, so it wins over /added-values/[id] for "new". */
export default function NewAddedValuePage() {
  return <CreateScreen />;
}
