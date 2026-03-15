# Activity Visualization System

A comprehensive activity visualization system for the Geiger Flow calendar component that provides visual insights into activity patterns across different time scales.

## Overview

The activity visualization system overlays heatmap-style visual indicators on the calendar to show activity intensity:
- **Day View**: Hourly activity intensity
- **Week View**: Hourly patterns across multiple days
- **Month View**: Daily activity patterns across weeks

## Features

- ✅ **Activity Heatmap**: Visual intensity indicators on calendar cells
- ✅ **Multiple Views**: Day, Week, and Month visualization
- ✅ **Activity Summary**: Statistics widget showing trends and patterns
- ✅ **Customizable Intensity**: 0-5 scale with configurable thresholds
- ✅ **Real-time Updates**: Supports live activity tracking
- ✅ **Performance Optimized**: Efficient activity calculations

## Installation

The activity visualization is built into the existing Calendar component. Simply pass the `activities` prop:

```jsx
import { Calendar } from '@/components/ui/calendar';

<Calendar
  activities={activityData}
  showActivity={true}
  activityViewMode="overlay"
/>
```

## Activity Data Structure

```typescript
interface Activity {
  timestamp: Date | string;  // When the activity occurred
  intensity?: number;        // 1-5 scale (default: 1)
  count?: number;            // Alternative to intensity
  type?: string;             // Category (optional)
  metadata?: object;         // Additional data (optional)
}
```

### Examples

```jsx
// Simple activity with timestamp only
const simpleActivity = {
  timestamp: new Date(),
  // intensity defaults to 1
};

// Activity with explicit intensity
const intenseActivity = {
  timestamp: new Date(),
  intensity: 5,  // Maximum intensity
};

// Activity with count (gets normalized)
const countActivity = {
  timestamp: '2026-03-15T10:30:00',
  count: 15,  // Will be normalized to 0-5 scale
};

// Complete activity with all fields
const completeActivity = {
  timestamp: new Date(),
  intensity: 3,
  type: 'work',
  metadata: {
    user: 'john@example.com',
    project: 'geiger-flow',
    action: 'commit',
  },
};
```

## Component Props

### Calendar Component

```jsx
<Calendar
  // Existing props
  events={[]}
  selectedDate={new Date()}
  view="month"
  
  // Activity visualization props
  activities={[]}              // Array of activity objects
  showActivity={false}         // Enable activity visualization
  activityViewMode="overlay"   // 'overlay' | 'replace'
  activityColorScheme="zinc"   // 'zinc' | 'blue' | 'green' | 'purple'
/>
```

#### Activity Props

- **activities** `Activity[]` - Array of activity data objects
- **showActivity** `boolean` - Enable/disable activity visualization (default: `false`)
- **activityViewMode** `'overlay' | 'replace'` - Display mode (default: `'overlay'`)
  - `overlay`: Show activity behind events
  - `replace`: Replace events with activity visualization
- **activityColorScheme** `string` - Color scheme (default: `'zinc'`)
  - Currently supported: `zinc`
  - Future: `blue`, `green`, `purple`

### ActivityCalendar Component

Enhanced calendar with built-in statistics and analysis:

```jsx
import { ActivityCalendar } from '@/components/ui/activity-calendar';

<ActivityCalendar
  activities={activityData}
  onDateSelect={(date) => console.log(date)}
  onActivityClick={(activity) => console.log(activity)}
  showStats={true}
  title="Activity Calendar"
  description="Track your productivity"
/>
```

#### Props

- **activities** `Activity[]` - Activity data
- **onDateSelect** `(date: Date) => void` - Date selection callback
- **onActivityClick** `(activity: Activity) => void` - Activity click callback
- **showStats** `boolean` - Show statistics cards (default: `true`)
- **title** `string` - Component title (default: `"Activity Calendar"`)
- **description** `string` - Component description
- **className** `string` - Additional CSS classes

## Activity Implementation Details

### Activity Level Calculation

Activity intensity is calculated using a 0-5 scale:

```javascript
const ACTIVITY_COLORS = {
  0: 'bg-transparent',      // No activity
  1: 'bg-zinc-500/10',      // Minimal
  2: 'bg-zinc-500/20',      // Low
  3: 'bg-zinc-500/30',      // Moderate
  4: 'bg-zinc-500/40',      // High
  5: 'bg-zinc-500/50',      // Very High
};
```

### Normalization Formula

```javascript
// Default maxCount = 20 (adjust based on your data)
const level = Math.min(5, Math.ceil((totalActivity / maxCount) * 5));
```

## Views

### Day View

Shows hourly activity with background intensity:

```
┌─────────────────────────────────┐
│    March 15, 2026               │
├─────────────────────────────────┤
│ 8:00 │ ░░ Low Activity          │
│ 9:00 │ ████ High Activity       │
│10:00 │ ██████ Very High         │
│11:00 │ ░░ Low Activity          │
└─────────────────────────────────┘
```

### Week View

Displays hourly patterns across days:

```
┌───┬─────────────────────────────┐
│   │ Mon  Tue  Wed  Thu  Fri     │
├───┼─────────────────────────────┤
│ 8 │ ░░   ██   ░░   ████  ░░     │
│ 9 │ ██   ████ ██   ░░    ████   │
│10 │ ████ ░░   ████ ██    ░░     │
└───┴─────────────────────────────┘
```

### Month View

Daily activity intensity across weeks:

```
┌────┬────┬────┬────┬────┬────┬────┐
│ M  │ T  │ W  │ T  │ F  │ S  │ S  │
├────┼────┼────┼────┼────┼────┼────┤
│ ░░ │ ██ │ ████│ ░░ │ ████│    │    │
│ ██ │ ░░ │ ████│ ██ │ ░░  │    │    │
│████│ ██ │ ░░  │████│ ██  │    │    │
└────┴────┴────┴────┴────┴────┴────┘
```

## Statistics

The `ActivityCalendar` component provides automatic statistics:

### Week Statistics
- Total activity this week
- Comparison to last week

### Month Statistics  
- Total activity this month
- Daily average

### Pattern Detection
- Most active day of the week
- Peak activity hours
- Trend direction (up/down/stable)

## Use Cases

### 1. Team Productivity Tracking

```jsx
const teamActivities = commits.map(commit => ({
  timestamp: commit.date,
  intensity: 1,
  type: 'commit',
  metadata: { author: commit.author }
}));

<ActivityCalendar 
  activities={teamActivities}
  title="Team Activity"
/>
```

### 2. Event Attendance

```jsx
const eventAttendance = events.map(event => ({
  timestamp: event.date,
  count: event.attendeeCount,
  type: event.type,
}));

<ActivityCalendar 
  activities={eventAttendance}
  title="Event Attendance"
/>
```

### 3. System Monitoring

```jsx
// Real-time system metrics
useEffect(() => {
  const interval = setInterval(() => {
    addActivity({
      timestamp: new Date(),
      count: requestCount,
      type: 'requests',
    });
  }, 60000); // Every minute

  return () => clearInterval(interval);
}, []);
```

### 4. User Activity Tracking

```jsx
const userActions = actions.map(action => ({
  timestamp: action.timestamp,
  intensity: action.importance,
  type: action.type,
  metadata: {
    page: action.page,
    duration: action.duration,
  },
}));

<ActivityCalendar 
  activities={userActions}
  title="User Activity"
/>
```

## Performance Considerations

- Activities are filtered by date range for efficient rendering
- Memoization prevents unnecessary recalculations
- Activity calculations are optimized for real-time updates
- Maximum 1000 activities recommended for smooth performance

## Customization

### Custom Color Scheme

You can customize the activity colors by modifying the `ACTIVITY_COLORS` constant in the calendar component:

```javascript
const ACTIVITY_COLORS = {
  0: 'bg-transparent',
  1: 'bg-blue-500/10',    // Custom color
  2: 'bg-blue-500/20',
  3: 'bg-blue-500/30',
  4: 'bg-blue-500/40',
  5: 'bg-blue-500/50',
};
```

### Custom Activity Level Calculation

Adjust the `maxCount` parameter based on your data:

```javascript
// In getActivityLevel function
const maxCount = 50; // Increase for high-volume data
```

## Demo

Run the demo component to see the visualization in action:

```jsx
import { ActivityCalendarDemo } from '@/components/ui/activity-calendar-demo';

<ActivityCalendarDemo />
```

The demo includes:
- Random activity generation
- Real-time activity simulation
- Interactive controls
- Live statistics updates

## Best Practices

1. **Data Aggregation**: Aggregate high-frequency activities before passing to the calendar
2. **Time Zones**: Ensure all timestamps are in the same timezone
3. **Performance**: Limit activities to the visible date range when possible
4. **User Feedback**: Combine visualization with hover states for detailed information
5. **Accessibility**: Provide text alternatives for activity intensity indicators

## Examples

See the following files for complete implementations:
- `activity-calendar.jsx` - Enhanced calendar with stats
- `activity-calendar-demo.jsx` - Interactive demo with simulation
- `calendar.jsx` - Base calendar with activity support

## Future Enhancements

- [ ] Multiple color schemes
- [ ] Activity aggregation strategies
- [ ] Export activity reports
- [ ] Activity comparison views
- [ ] Predictive activity patterns
- [ ] Integration with project management tools
