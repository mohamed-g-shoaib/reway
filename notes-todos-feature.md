I want to add a new feature in the dashboard, i want to add notes, and to-do tasks

1- this will be on desktop only, like the sidebar, its only on desktop
2- it will be positioned at right side of the dashbaord, with the exact same layout of the groups sidebar, but you need to decide if we will makde notes and todos separate
3- for notes, you will open an inline editor like how sidebar opens create group inline, you will take text input from the user, with cancel and save buttons, you will also allow the user to add a colored dot, a simple dot to make a note unique, you will only add the color picker, exactly like the create group from sidebar but without the popover since it's not needed
4- for todos, you will also open an inline editor like sidebar, you will take from user the text, and priority level, and you will add the letter of the priority as the icon with priority color -> [H Talk to Manager at 9PM] as you can see H mean high, which is usually red, you will also add a check for marking the todo as completed, which also adds a strike through on the text, but you will have to decide the order of these items, for example -> [(check) [priority] text] or something different, and keep in mind there is also a menu button that acts the same as menu button in sidebar to allow users to bulk select and delete (for notes) and the same for todos in addition to bulk mark as completed
5- since the area is tight, you will implement an expand strategy, clicking a note or a todo expands to show the truncated text, it's as if you're opening the inline edit in groups sidebar, it expans the group to open the inline edit
6- just like how we will have inline create we will need inline edit as well

---

the above implementation plan is saved at @notes-todos-feature.md which you will use to track all the things i wrote word by word to ensure they're fully implemented, and you will track status with "Completed | Not Yet"

you will use the exact same patterns we have used to develop groups sidebar, you will also use supabase MCP if you need to do any action in database.

---

## Implementation checklist (Completed | Not Yet)

1. **Desktop only (like Groups sidebar)**: Completed

2. **Position on right side with same layout as Groups sidebar + decide Notes vs Todos separation**: Completed

3. **Notes: inline create editor (text + cancel/save) + colored dot + color picker (no popover)**: Completed

4. **Todos: inline create editor (text + priority) + priority letter icon with color + completed check + strike-through + menu button for bulk select/delete + bulk mark completed + decide row layout order**: Completed

5. **Tight area expand strategy: click note/todo expands to show truncated text (like inline edit expansion in Groups sidebar)**: Completed

6. **Inline edit for both notes and todos (same pattern as inline create)**: Completed
