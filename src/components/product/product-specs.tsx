interface Spec {
  id: string;
  group: string;
  key: string;
  value: string;
}

interface ProductSpecsProps {
  specs: Spec[];
}

export function ProductSpecs({ specs }: ProductSpecsProps) {
  if (!specs || specs.length === 0) {
    return (
      <div className="rounded-xl border border-white/8 bg-surface p-6 text-center text-sm text-muted">
        Detailed specifications not available for this product.
      </div>
    );
  }

  // Group specs by their group key
  const grouped = specs.reduce<Record<string, Spec[]>>((acc, spec) => {
    if (!acc[spec.group]) acc[spec.group] = [];
    acc[spec.group].push(spec);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([group, groupSpecs]) => (
        <div key={group} className="overflow-hidden rounded-xl border border-white/8">
          <div className="border-b border-white/8 bg-white/3 px-4 py-3">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-cyan">
              {group}
            </h4>
          </div>
          <div className="divide-y divide-white/5">
            {groupSpecs.map((spec, i) => (
              <div
                key={spec.id}
                className={`flex items-start px-4 py-3 text-sm ${i % 2 === 0 ? "" : "bg-white/1"}`}
              >
                <span className="w-2/5 text-muted shrink-0">{spec.key}</span>
                <span className="flex-1 font-medium text-foreground">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
