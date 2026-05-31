# Geiger Notes Integration Plan for Geiger Flow

## Project Overview

This document outlines the integration strategy for bringing Geiger Notes (visual boards, brainstorming, free-form canvas) into the Geiger Flow project management application.

---

## 1. Current State Analysis

### Geiger Flow (Current Workspace)
- **Tech Stack**: Next.js, React, shadcn/ui components
- **Purpose**: Project management with Kanban, Timeline, Milestones, Goals
- **Data Model**: Projects → Milestones → Goals → Tasks/Issues
- **UI Components**: Dashboard screens, sidebar navigation, project views

### Geiger Notes (Separate Project)
- **Location**: `d:\pro\geiger\geiger-notes\`
- **Tech Stack**: Next.js, React Flow (`@xyflow/react`)
- **Purpose**: Visual boards, creative brainstorming, early-stage ideation
- **Key Components**:
  - Canvas: BoardCanvas, zoom-controls
  - Nodes: BoardNode, DocumentNode, ImageNode, FileNode, LinkNode, CommentNode, ClockNode
  - Edges: CenterEdge with arrow markers
  - Collaboration: Host/Join/Merge/Members tabs
  - Traits: Text editing, drawing, resizing, image fullscreen

---

## 2. Integration Approaches

### Approach A: Embed as Project Feature
Add a "Boards" tab in project views that loads the Notes canvas component.

**Pros**:
- Direct integration into existing project workflow
- Share authentication and project context
- Seamless user experience

**Cons**:
- Requires significant refactoring of Notes components
- Tight coupling between projects

### Approach B: Link to Flow
Create custom Flow nodes that represent project data (tasks, milestones) and allow connecting them to Notes canvas.

**Pros**:
- Loose coupling
- Clear separation of concerns
- Both systems remain independent

**Cons**:
- More complex synchronization
- Two data sources to manage

### Approach C: Hybrid Views (Recommended)
Create a unified canvas that can display both Flow project items and Notes boards, with bidirectional sync.

**Pros**:
- Best of both worlds
- Users can visualize project data visually
- Flexible and extensible

**Cons**:
- Most complex to implement
- Requires careful state management

---

## 3. Recommended Implementation Strategy

### Phase 1: Foundation (Week 1-2)
1. Install React Flow in geiger-flow project
2. Create base canvas component (`components/internal/canvas/ProjectCanvas.jsx`)
3. Set up custom node registry

### Phase 2: Custom Nodes for Flow Data (Week 3-4)
1. Create TaskNode - displays task info, draggable
2. Create MilestoneNode - displays milestone with progress
3. Create GoalNode - displays goal with status
4. Implement edge connections between Flow nodes

### Phase 3: Notes Integration (Week 5-6)
1. Add BoardNode from geiger-notes (refactored)
2. Add DocumentNode for rich text notes
3. Add ImageNode for visual assets
4. Implement LinkNode for external resources

### Phase 4: Collaboration Features (Week 7-8)
1. Add real-time cursor presence
2. Implement board sharing
3. Add comment threads on nodes

### Phase 5: Polish & Optimization (Week 9+)
1. Performance optimization for large boards
2. Mobile responsiveness
3. Keyboard shortcuts
4. Export/import functionality

---

## 4. Component Mapping

| Geiger Notes Component | Integration Target |
|------------------------|-------------------|
| BoardCanvas | ProjectCanvas (new) |
| BoardNode | ProjectBoardNode |
| DocumentNode | ProjectNoteNode |
| ImageNode | AssetNode |
| FileNode | AttachmentNode |
| LinkNode | ExternalLinkNode |
| CommentNode | DiscussionNode |
| ClockNode | TimelineNode |
| CenterEdge | ProjectEdge |
| zoom-controls | SharedZoomControls |

---

## 5. Data Model Extensions

```javascript

{
  boards: {
    id: string,
    project_id: string,
    name: string,
    nodes: BoardNode[],
    edges: Edge[],
    settings: BoardSettings
  },
  board_nodes: {
    id: string,
    board_id: string,
    type: 'task' | 'milestone' | 'goal' | 'note' | 'image' | 'link',
    position: { x: number, y: number },
    data: NodeData
  }
}
```

---

## 6. UI Integration Points

### Sidebar Navigation
- Add "Boards" option in project sidebar
- Quick access to recent boards

### Project View Tabs
- New "Board" tab alongside Tasks, Timeline, Settings
- Toggle between Kanban and Board views

### Topbar Actions
- "Open in Board View" button on project pages

---

## 7. Key Features to Implement First

1. **Basic Canvas** - Pan, zoom, grid background
2. **Task Nodes** - Display Flow tasks on canvas
3. **Drag & Drop** - Reorder tasks visually
4. **Connections** - Link tasks to show dependencies
5. **Mini-map** - Navigation overview

---

## 8. Technical Considerations

### State Management
- Use Zustand for canvas state
- Sync with existing Supabase data
- Implement undo/redo

### Performance
- Virtualization for large boards
- Lazy loading node content
- Debounced auto-save

### Responsive Design
- Touch gestures for mobile
- Collapsible panels
- Adaptive toolbar

---

## 9. Dependencies to Add

```json
{
  "@xyflow/react": "^12.0.0",
  "zustand": "^5.0.0",
  "immer": "^10.0.0"
}
```

---

## 10. Next Steps

1. [ ] Review this plan with stakeholders
2. [ ] Set up development environment for geiger-notes
3. [ ] Install dependencies in geiger-flow
4. [ ] Create prototype canvas component
5. [ ] Implement basic task nodes
6. [ ] Test integration with existing project data

---

*This plan is a living document and should be refined based on implementation feedback.*
