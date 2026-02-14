"use client";

import type { NoteRow, TodoRow } from "@/lib/supabase/queries";
import type { TodoPriority } from "@/components/dashboard/content/notes-todos/types";
import { NotesSection } from "@/components/dashboard/content/notes-todos/NotesSection";
import { TodosSection } from "@/components/dashboard/content/notes-todos/TodosSection";

export function NotesTodosSidebar({
  activeNotesTodosSection,
  setActiveNotesTodosSection,
  notes,
  todos,
  NotesSectionPreview,
  TodosSectionPreview,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
  onDeleteNotes,
  onCreateTodo,
  onUpdateTodo,
  onDeleteTodo,
  onDeleteTodos,
  onSetTodoCompleted,
  onSetTodosCompleted,
}: {
  activeNotesTodosSection: "notes" | "todos";
  setActiveNotesTodosSection: (v: "notes" | "todos") => void;
  notes: NoteRow[];
  todos: TodoRow[];
  NotesSectionPreview: React.ComponentType<{ notes: NoteRow[] }>;
  TodosSectionPreview: React.ComponentType<{ todos: TodoRow[] }>;
  onCreateNote: (formData: { text: string; color?: string | null }) => Promise<string>;
  onUpdateNote: (id: string, formData: { text: string; color?: string | null }) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
  onDeleteNotes: (ids: string[]) => Promise<void>;
  onCreateTodo: (formData: { text: string; priority: TodoPriority }) => Promise<string>;
  onUpdateTodo: (id: string, formData: { text: string; priority: TodoPriority }) => Promise<void>;
  onDeleteTodo: (id: string) => Promise<void>;
  onDeleteTodos: (ids: string[]) => Promise<void>;
  onSetTodoCompleted: (id: string, completed: boolean) => Promise<void>;
  onSetTodosCompleted: (ids: string[], completed: boolean) => Promise<void>;
}) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col gap-2 p-4 text-xs text-muted-foreground min-[1200px]:flex">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-xl bg-muted/20 p-1 ring-1 ring-inset ring-foreground/5">
          <button
            type="button"
            className={`px-2 py-1 text-[11px] rounded-lg cursor-pointer ${
              activeNotesTodosSection === "notes"
                ? "bg-muted/40 text-foreground"
                : "text-muted-foreground hover:text-primary/90 hover:bg-muted/40"
            }`}
            onClick={() => setActiveNotesTodosSection("notes")}
          >
            Notes
          </button>
          <button
            type="button"
            className={`px-2 py-1 text-[11px] rounded-lg cursor-pointer ${
              activeNotesTodosSection === "todos"
                ? "bg-muted/40 text-foreground"
                : "text-muted-foreground hover:text-primary/90 hover:bg-muted/40"
            }`}
            onClick={() => setActiveNotesTodosSection("todos")}
          >
            Todos
          </button>
        </div>
      </div>

      {activeNotesTodosSection === "notes" ? (
        <>
          <NotesSectionPreview notes={notes} />
          <NotesSection
            notes={[]}
            onCreateNote={onCreateNote}
            onUpdateNote={onUpdateNote}
            onDeleteNote={onDeleteNote}
            onDeleteNotes={onDeleteNotes}
          />
        </>
      ) : (
        <>
          <TodosSectionPreview todos={todos} />
          <TodosSection
            todos={[]}
            onCreateTodo={onCreateTodo}
            onUpdateTodo={onUpdateTodo}
            onDeleteTodo={onDeleteTodo}
            onDeleteTodos={onDeleteTodos}
            onSetTodoCompleted={onSetTodoCompleted}
            onSetTodosCompleted={onSetTodosCompleted}
          />
        </>
      )}
    </aside>
  );
}
