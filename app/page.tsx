import { Chat } from "@/components/chat";
import { getPolicies } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ParentPage() {
  const policies = await getPolicies();
  return <Chat policies={policies} />;
}
