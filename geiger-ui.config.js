import { defineNavConfig } from "@geiger/ui";

// The @geiger/ui config for Geiger Flow.
//
// Users curate their own project sidebar in Settings → Navigation. This file is
// where the product declares the rules around that: what may never be hidden,
// and which nav entries can't function without another. @geiger/ui reads the
// rules and enforces them — a switch that would break the invariant is disabled
// and explains itself, so nothing is hidden or shown behind the user's back.
//
// Titles must match `components/internal/sidebar/projects/sidebar_data.js`
// exactly (projectNav plus the settingsNav submenu), and address top-level
// entries and sub-items alike. Add-on nav is merged in before this config is
// applied, so an add-on's entries are curatable too — the add-on manifest still
// owns its own enablement.

export default defineNavConfig({
  product: "flow",

  // The spine of a project, plus the screen that unhides everything else.
  locked: ["Overview", "Issues", "Settings", "General", "Navigation"],

  hiddenByDefault: [],

  dependencies: [
    // Issues are the unit of work everything else planned or reported is built
    // from. Issues itself is locked, so these rules matter for the surfaces in
    // between rather than for the root.
    {
      screen: "Tasks",
      requires: ["Issues"],
      reason: "Tasks break down the issues they belong to.",
    },
    {
      screen: "Work Queue",
      requires: ["Issues", "Tasks"],
      reason: "The work queue is the prioritised view of issues and tasks.",
    },

    // Planning surfaces read the same backlog.
    {
      screen: "Projections",
      requires: ["Planning"],
      reason: "Projections extrapolate from the plan.",
    },
    {
      screen: "Milestones",
      requires: ["Planning"],
      reason: "Milestones are the dated markers on the plan.",
    },
    { screen: "Goals", requires: ["Objectives"] },
    {
      screen: "Grounding",
      requires: ["Issues"],
      reason: "Grounding attaches real-world signal to issues.",
    },

    // Reporting aggregates the work surfaces.
    {
      screen: "Reporting",
      requires: ["Issues"],
      reason: "Reporting aggregates issue and task activity.",
    },
    { screen: "Logs", requires: ["Issues"] },

    // People surfaces.
    {
      screen: "Resource Allocation",
      requires: ["Team"],
      reason: "Allocation assigns capacity to the people on the team.",
    },
    { screen: "Security", requires: ["Team"] },

    // Office is a document surface over the project's files.
    { screen: "Recent Files", requires: ["Office"] },
    { screen: "Folders", requires: ["Office"] },
    { screen: "Shared with Project", requires: ["Office"] },
    {
      screen: "Assets",
      requires: ["Office"],
      reason: "Assets are stored in the project's Office files.",
    },

    // Vault holds the credentials externals connect with.
    {
      screen: "Externals",
      requires: ["Vault"],
      reason: "External connections authenticate with credentials from Vault.",
    },

    // Settings submenu — everything configures what General establishes.
    { screen: "Connections", requires: ["General"] },
    { screen: "Customs", requires: ["General"] },
    { screen: "Add-ons", requires: ["General"] },
    { screen: "Usage", requires: ["General"] },
    { screen: "Advanced", requires: ["General"] },
    { screen: "Enterprise", requires: ["Advanced"] },
  ],
});
