import Link from "next/link";
import { Sprout, ArrowLeft } from "lucide-react";
import { Card, PageHeader, Badge } from "@/ui/core/primitives";
export function Placeholder({
  title,
  description,
  owner = false,
}: {
  title: string;
  description: string;
  owner?: boolean;
}) {
  const content = (
    <>
      <PageHeader title={title} description={description} />
      <Card className="placeholder-card">
        <span className="placeholder-icon">
          <Sprout size={32} />
        </span>
        <Badge>Growing next</Badge>
        <h2>A little room to grow.</h2>
        <p>
          {description} This module is planned for a future step. The Coffee
          Garden foundation is ready.
        </p>
        <Link
          href={owner ? "/owner/dashboard" : "/"}
          className="button button-secondary"
        >
          <ArrowLeft size={16} />
          {owner ? "Back to dashboard" : "Back to development home"}
        </Link>
      </Card>
    </>
  );
  return owner ? (
    content
  ) : (
    <main className="dev-page">
      <Link href="/" className="dev-brand">
        Coffee Garden
      </Link>
      {content}
    </main>
  );
}
