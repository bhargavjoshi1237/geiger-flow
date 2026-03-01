import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeadlinesSection } from "@/components/internal/shared/deadlines";
import { LineChart, Line, Area, AreaChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export function OverviewScreen() {
  return (
    <div className="w-full px-2 lg:px-0 lg:w-[75%] mx-auto my-3 space-y-8 text-[#e7e7e7]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Active Sessions",
            value: "1,248",
            trend: "+12.5%",
            isUp: true,
            data: [40, 35, 55, 45, 60, 50, 75],
          },
          {
            label: "Network Requests",
            value: "45.2k",
            trend: "+5.2%",
            isUp: true,
            data: [30, 40, 35, 50, 45, 60, 55],
          },
          {
            label: "Error Rate",
            value: "0.12%",
            trend: "-2.4%",
            isUp: false,
            data: [60, 50, 45, 55, 40, 35, 30],
          },
        ].map((metric, i) => (
          <div
            key={i}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 relative overflow-hidden group hover:border-[#474747] transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-[#a3a3a3] text-sm font-medium mb-1">
                  {metric.label}
                </h3>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-semibold text-[#e7e7e7] tracking-tight">
                    {metric.value}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${metric.isUp ? "text-green-400 bg-green-400/10" : "text-blue-400 bg-blue-400/10"}`}
                  >
                    {metric.trend}
                  </span>
                </div>
              </div>
              <div className="w-24 h-12">
                <ChartContainer
                  config={{
                    value: {
                      color: metric.isUp ? "#10b981" : "#3b82f6",
                    },
                  }}
                  className="w-full h-full"
                >
                  <LineChart
                    data={metric.data.map((v, i) => ({ value: v, time: i }))}
                  >
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="var(--color-value)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Deadlines Section */}
      <div className="z-10 relative">
        <DeadlinesSection />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 z-10 relative">
        <div className="lg:col-span-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 h-96 flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-[#e7e7e7] font-medium">
                Throughput Analysis
              </h3>
              <p className="text-sm text-[#737373]">
                Live requests across regions
              </p>
            </div>
            <select className="bg-[#161616] border border-[#2a2a2a] text-[#e7e7e7] text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#474747]">
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ChartContainer
              config={{
                throughput: {
                  label: "Throughput",
                  color: "#10b981",
                },
              }}
              className="w-full h-full"
            >
              <AreaChart
                data={[
                  { time: "00:00", throughput: 40 },
                  { time: "04:00", throughput: 70 },
                  { time: "08:00", throughput: 45 },
                  { time: "12:00", throughput: 90 },
                  { time: "16:00", throughput: 65 },
                  { time: "20:00", throughput: 30 },
                  { time: "23:59", throughput: 85 },
                ]}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorThroughput"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Area
                  type="monotone"
                  dataKey="throughput"
                  stroke="var(--color-throughput)"
                  fillOpacity={1}
                  fill="url(#colorThroughput)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>
        <div className="bg-[#202020] border border-[#2a2a2a] rounded-2xl p-6 flex flex-col min-w-0">
          <div className="mb-6">
            <h3 className="text-[#e7e7e7] font-medium">Activity Log</h3>
            <p className="text-sm text-[#737373]">Recent workspace actions</p>
          </div>
          <div className="flex-1 space-y-6">
            {[
              {
                user: "Sarah J.",
                action: "deployed v1.4.2",
                time: "10m ago",
                dot: "bg-green-500",
              },
              {
                user: "System",
                action: "database backup complete",
                time: "1h ago",
                dot: "bg-blue-500",
              },
              {
                user: "Alex M.",
                action: "updated config.ts",
                time: "2h ago",
                dot: "bg-[#a3a3a3]",
              },
              {
                user: "API",
                action: "rate limit reached on /auth",
                time: "4h ago",
                dot: "bg-yellow-500",
              },
            ].map((log, i) => (
              <div key={i} className="flex gap-4">
                <div className="relative mt-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${log.dot}`}></div>
                  {i !== 3 && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-0.5 h-full bg-[#2a2a2a]"></div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-[#e5e5e5] leading-tight break-all">
                    <span className="font-medium text-[#e7e7e7]">
                      {log.user}
                    </span>{" "}
                    {log.action}
                  </p>
                  <span className="text-xs text-[#737373]">{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-[#202020] border border-[#2a2a2a] rounded-2xl overflow-hidden w-full relative z-10">
        <div className="px-6 py-5 border-b border-[#2a2a2a] flex items-center justify-between bg-[#202020]">
          <h3 className="text-[#e7e7e7] font-medium">Recent Deployments</h3>
          <button className="text-sm font-medium text-[#e7e7e7] bg-[#2a2a2a] hover:bg-[#333333] border border-[#333333] px-3 py-1.5 rounded-lg transition-colors">
            View All
          </button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Commit</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Environment</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              {
                commit: "fix: header styles",
                hash: "a1b2c3d",
                branch: "main",
                status: "Success",
                env: "Production",
                time: "2 mins ago",
                sColor: "text-green-400",
              },
              {
                commit: "feat: add metrics view",
                hash: "9f8e7d6",
                branch: "feature/metrics",
                status: "Building",
                env: "Staging",
                time: "15 mins ago",
                sColor: "text-blue-400",
              },
              {
                commit: "chore: update deps",
                hash: "5c4b3a2",
                branch: "dependabot/npm",
                status: "Failed",
                env: "Preview",
                time: "1 hour ago",
                sColor: "text-red-400",
              },
            ].map((row, i) => (
              <TableRow key={i} className="border-[#2a2a2a]">
                <TableCell>
                  <div className="text-sm text-[#e7e7e7] font-medium mb-0.5">
                    {row.commit}
                  </div>
                  <div className="text-xs text-[#737373] font-mono">
                    {row.hash}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#161616] border border-[#2a2a2a] text-xs text-[#a3a3a3]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 3v12" />
                      <circle cx="18" cy="6" r="3" />
                      <circle cx="6" cy="18" r="3" />
                      <path d="M18 9a9 9 0 0 1-9 9" />
                    </svg>
                    {row.branch}
                  </span>
                </TableCell>
                <TableCell className={`text-sm font-medium ${row.sColor}`}>
                  {row.status}
                </TableCell>
                <TableCell className="text-sm text-[#a3a3a3]">
                  {row.env}
                </TableCell>
                <TableCell className="text-sm text-[#737373]">
                  {row.time}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
