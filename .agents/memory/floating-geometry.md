---
name: Floating panel coordinate systems
description: Coordinate-system constraint for portalled Floating UI panels.
---
Measure the same floating element that receives the computed CSS coordinates, not a static child inside an already positioned wrapper.

**Why:** Mixing those coordinate systems caused the DatePicker calendar to move to the viewport corner; delaying visibility alone did not solve it.

**How to apply:** When changing floating panel structure, preserve the identity of the measured and positioned element. Keep visual transforms on its inner content.
