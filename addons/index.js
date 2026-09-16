// Installs every bundled addon by importing it for its side effect: each
// addon's index.js calls loadAddon() as it evaluates, filling the registry.
//
// Import this ONE module rather than the five individually. Both hosts that
// render project screens — the real route and the landing playground — pull it
// in, so an addon added here appears in both and the two can never drift apart.
import "./sql";
import "./project-plus";
import "./forms";
import "./credited-resources";
import "./system-architecture";
