"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Benchmark {
  id: string;
  game: string;
  resolution: string;
  fps: number;
  settings: string;
}

interface ProductBenchmarksProps {
  benchmarks: Benchmark[];
  productName: string;
}

const RESOLUTION_COLORS: Record<string, string> = {
  "1080p": "#00E5FF",
  "1440p": "#5B8CFF",
  "4K": "#00FF88",
  "default": "#00E5FF",
};

// Custom tooltip component
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { resolution: string; settings: string } }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 shadow-xl">
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted mt-1">{payload[0].payload.resolution} · {payload[0].payload.settings}</p>
        <p className="text-2xl font-bold text-cyan mt-1">
          {payload[0].value} <span className="text-sm font-normal text-muted">FPS</span>
        </p>
      </div>
    );
  }
  return null;
};

export function ProductBenchmarks({ benchmarks, productName }: ProductBenchmarksProps) {
  if (!benchmarks || benchmarks.length === 0) {
    // Show placeholder benchmarks
    const placeholderBenchmarks = [
      { id: "1", game: "Cyberpunk 2077", resolution: "1440p", fps: 95, settings: "Ultra" },
      { id: "2", game: "GTA V", resolution: "1440p", fps: 160, settings: "Ultra" },
      { id: "3", game: "Valorant", resolution: "1080p", fps: 380, settings: "High" },
      { id: "4", game: "Forza Horizon 5", resolution: "1440p", fps: 120, settings: "Extreme" },
      { id: "5", game: "Elden Ring", resolution: "4K", fps: 60, settings: "Max" },
      { id: "6", game: "CS2", resolution: "1080p", fps: 420, settings: "High" },
    ];
    benchmarks = placeholderBenchmarks;
  }

  // Group by resolution to show different chart series
  const chartData = benchmarks.map((b) => ({
    game: b.game.length > 12 ? b.game.slice(0, 12) + "…" : b.game,
    fullGame: b.game,
    fps: b.fps,
    resolution: b.resolution,
    settings: b.settings,
    color: RESOLUTION_COLORS[b.resolution] || RESOLUTION_COLORS["default"],
  }));

  const resolutions = [...new Set(benchmarks.map((b) => b.resolution))];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">Resolution Legend:</span>
          {resolutions.map((res) => (
            <span
              key={res}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-xs font-medium"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: RESOLUTION_COLORS[res] || RESOLUTION_COLORS["default"] }}
              />
              {res}
            </span>
          ))}
        </div>
        <span className="ml-auto text-xs text-muted">*Estimated FPS — varies per system config</span>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
              vertical={false}
            />
            <XAxis
              dataKey="game"
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              unit=" FPS"
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="fps" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto rounded-xl border border-white/8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8 bg-white/3">
              <th className="px-4 py-3 text-left font-semibold text-muted">Game</th>
              <th className="px-4 py-3 text-center font-semibold text-muted">Resolution</th>
              <th className="px-4 py-3 text-center font-semibold text-muted">Settings</th>
              <th className="px-4 py-3 text-center font-semibold text-muted">Avg FPS</th>
            </tr>
          </thead>
          <tbody>
            {benchmarks.map((b, i) => (
              <tr
                key={b.id}
                className={`border-b border-white/5 transition-colors hover:bg-white/3 ${i % 2 === 0 ? "" : "bg-white/1"}`}
              >
                <td className="px-4 py-3 font-medium text-foreground">{b.game}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{
                      color: RESOLUTION_COLORS[b.resolution] || RESOLUTION_COLORS["default"],
                      backgroundColor: `${RESOLUTION_COLORS[b.resolution] || RESOLUTION_COLORS["default"]}18`,
                    }}
                  >
                    {b.resolution}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-muted">{b.settings}</td>
                <td className="px-4 py-3 text-center">
                  <span className="font-bold text-cyan">{b.fps}</span>
                  <span className="text-xs text-muted ml-1">FPS</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
