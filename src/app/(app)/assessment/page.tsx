import { AssessmentWizard } from "@/components/assessment/wizard";

export const metadata = {
  title: "Assessment — Pinpoint",
};

export default function AssessmentPage() {
  return (
    <div>
      <div className="container pt-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          AI policy assessment
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Answer a few questions about how your team works. Your responses stay
          in this browser — there is no account and nothing is uploaded.
        </p>
      </div>
      <AssessmentWizard />
    </div>
  );
}
