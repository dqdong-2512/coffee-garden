import Link from "next/link";
import { Sprout, ArrowLeft, ArrowUpRight } from "lucide-react";
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
export function DevHome() {
  const links = [
    ["Owner Dashboard", "/owner/dashboard", "Your business, at a glance."],
    ["Revenue", "/owner/revenue", "Explore sales and payment trends."],
    ["Expenses", "/owner/expenses", "Keep business spending in view."],
    ["Profit", "/owner/profit", "Understand what your business keeps."],
    ["POS", "/pos", "A future workspace for your team."],
    ["Kitchen", "/kitchen", "A future home for every order."],
    [
      "Customer Order T12",
      "/order/T12",
      "A future table-side ordering experience.",
    ],
  ];
  return (
    <main className="dev-page">
      <div className="dev-brand">
        <Sprout />
        Coffee Garden
      </div>
      <PageHeader
        title="A good day starts here."
        description="Development workspace · Step 1 · Owner app foundation"
      />
      <div className="dev-grid">
        {links.map(([title, url, description], i) => (
          <Link href={url} className="card dev-card" key={url}>
            <span className="dev-number">0{i + 1}</span>
            <ArrowUpRight size={19} />
            <h2>Open {title}</h2>
            <p className="muted text-sm">{description}</p>
            <span className="mt-5 block text-xs text-stone-500">
              {i < 4 ? "UI preview" : "Planned module"}
            </span>
          </Link>
        ))}
      </div>
      <p className="mock-note mt-8">
        Development navigation only. All figures are mock data.
      </p>
    </main>
  );
}
