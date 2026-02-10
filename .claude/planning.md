# Planning Methodology

## Multi-Step Alignment Process
Plans are created from high to low level with user alignment at each step. Never proceed to the next level without approval.

## Project Status Tracking
- Check [status.md](status.md) before planning to understand what's already done
- Update [status.md](status.md) when epics are completed

## Planning Steps

### 1. Epic Creation
- Create epic name
- Create document in `.claude/epics/` directory
- **Alignment required before proceeding**

### 2. Epic Overview
- Write 3-4 sentences describing what the epic will accomplish
- **Alignment required before proceeding**

### 3. High-Level Tasks
- Create "Tasks" section with short, descriptive task names using markdown checkboxes (`- [ ]`)
- No details yet, just the task titles in checkbox format for tracking
- **Alignment required before proceeding**

### 4. Task Requirements
- Create "Task Details" section with numbered headings for each task
- Add requirements subsection to each task
- What functionality is needed for each task
- **Alignment required before proceeding**

### 5. Implementation Details
- **Read [coding-standards.md](.claude/coding-standards.md) and [tech-stack.md](.claude/tech-stack.md) first**
- Add technical implementation details to each task
- How each task will be built
- **Ask clarifying questions** to clear up any ambiguities before implementation
- **Final alignment before implementation begins**

## Important
- Plan one epic at a time
- Get approval at each level before moving forward
- Never skip alignment steps
- Check off task checkboxes (`- [x]`) when completed to track progress
