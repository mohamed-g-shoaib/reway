"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { NoteRow, TodoRow } from "@/lib/supabase/queries";
import type { TodoPriority } from "./notes-todos/types";
import { NotesSection } from "./notes-todos/NotesSection";
import { TodosSection } from "./notes-todos/TodosSection";

interface DashboardNotesTodosSidebarProps {
  notes: NoteRow[];
  todos: TodoRow[];

  onCreateNote: (formData: {
    text: string;
    color?: string | null;
  }) => Promise<string>;
  onUpdateNote: (
    id: string,
    formData: { text: string; color?: string | null },
  ) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
  onDeleteNotes: (ids: string[]) => Promise<void>;

  onCreateTodo: (formData: {
    text: string;
    priority: TodoPriority;
  }) => Promise<string>;
  onUpdateTodo: (
    id: string,
    formData: { text: string; priority: TodoPriority },
  ) => Promise<void>;
  onDeleteTodo: (id: string) => Promise<void>;
  onDeleteTodos: (ids: string[]) => Promise<void>;
  onSetTodoCompleted: (id: string, completed: boolean) => Promise<void>;
  onSetTodosCompleted: (ids: string[], completed: boolean) => Promise<void>;
}

export function DashboardNotesTodosSidebar({
  notes,
  todos,
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
}: DashboardNotesTodosSidebarProps) {
  const [activeSection, setActiveSection] = useState<"notes" | "todos">(
    "notes",
  );

  return (
    <aside
      data-onboarding="notes-todos-desktop"
      className="hidden min-[1200px]:flex fixed right-6 top-43 bottom-6 z-30 w-60 flex-col gap-2 text-sm text-muted-foreground"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-xl bg-muted/20 p-1 ring-1 ring-inset ring-foreground/5">
          <button
            type="button"
            className={cn(
              "px-2 py-1 text-[11px] rounded-lg cursor-pointer",
              activeSection === "notes"
                ? "bg-muted/40 text-foreground"
                : "text-muted-foreground hover:text-primary/90 hover:bg-muted/40",
            )}
            onClick={() => setActiveSection("notes")}
          >
            Notes
          </button>
          <button
            type="button"
            className={cn(
              "px-2 py-1 text-[11px] rounded-lg cursor-pointer",
              activeSection === "todos"
                ? "bg-muted/40 text-foreground"
                : "text-muted-foreground hover:text-primary/90 hover:bg-muted/40",
            )}
            onClick={() => setActiveSection("todos")}
          >
            Todos
          </button>
        </div>
      </div>

      {activeSection === "notes" ? (
        <NotesSection
          notes={notes}
          onCreateNote={onCreateNote}
          onUpdateNote={onUpdateNote}
          onDeleteNote={onDeleteNote}
          onDeleteNotes={onDeleteNotes}
        />
      ) : (
        <TodosSection
          todos={todos}
          onCreateTodo={onCreateTodo}
          onUpdateTodo={onUpdateTodo}
          onDeleteTodo={onDeleteTodo}
          onDeleteTodos={onDeleteTodos}
          onSetTodoCompleted={onSetTodoCompleted}
          onSetTodosCompleted={onSetTodosCompleted}
        />
      )}
    </aside>
  );
}
