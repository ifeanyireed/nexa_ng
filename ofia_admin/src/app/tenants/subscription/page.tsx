import { redirect } from "next/navigation";

export default function TenantSubscriptionRedirect() {
  redirect("/subscriptions");
}
