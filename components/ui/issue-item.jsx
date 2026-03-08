import * as React from "react";

import { cn } from "@/lib/utils";

const severityColors = {
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const statusIcons = {
  open: (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  ),
  in_progress: (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="m4.93 4.93 2.83 2.83" />
      <path d="m16.24 16.24 2.83 2.83" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="m4.93 19.07 2.83-2.83" />
      <path d="m16.24 7.76 2.83-2.83" />
    </svg>
  ),
  resolved: (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
};

function IssueItem({ 
  className, 
  title, 
  severity = "medium", 
  status = "open",
  assignee,
  dueDate,
  ...props 
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 p-3 rounded-lg bg-[#161616] border border-[#2a2a2a] hover:border-[#474747] transition-colors cursor-pointer",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex-shrink-0">
          {statusIcons[status] || statusIcons.open}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-[#e7e7e7] font-medium truncate">
            {title}
          </p>
          {assignee && (
            <p className="text-xs text-[#737373] truncate">
              {assignee}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {dueDate && (
          <span className="text-xs text-[#737373] hidden sm:inline">
            {dueDate}
          </span>
        )}
        <span
          className={cn(
            "text-xs px-2 py-0.5 rounded-md border capitalize",
            severityColors[severity] || severityColors.medium
          )}
        >
          {severity}
        </span>
      </div>
    </div>
  );
}

function IssuesList({ 
  className, 
  issues = [], 
  showHeader = true,
  title = "Top Issues",
  ...props 
}) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {showHeader && (
        <div className="flex items-center justify-between">
          <h3 className="text-[#e7e7e7] font-medium">{title}</h3>
          <button className="text-sm font-medium text-[#a3a3a3] hover:text-[#e7e7e7] transition-colors">
            View All
          </button>
        </div>
      )}
      <div className="space-y-2">
        {issues.length > 0 ? (
          issues.map((issue, index) => (
            <IssueItem
              key={index}
              title={issue.title}
              severity={issue.severity}
              status={issue.status}
              assignee={issue.assignee}
              dueDate={issue.dueDate}
            />
          ))
        ) : (
          <p className="text-sm text-[#737373] text-center py-4">
            No issues found
          </p>
        )}
      </div>
    </div>
  );
}

export { IssueItem, IssuesList, severityColors };
