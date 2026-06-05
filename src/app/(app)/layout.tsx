import { AssessmentProvider } from "@/components/assessment/assessment-context";

/**
 * Shared client-state boundary for the assessment and results routes.
 *
 * Keeping the AssessmentProvider here means the in-memory assessment persists
 * across client-side navigation from /assessment to /results WITHOUT writing to
 * disk or any server — consistent with Pinpoint's local-only model.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AssessmentProvider>{children}</AssessmentProvider>;
}
