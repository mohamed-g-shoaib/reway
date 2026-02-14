"use client";

import { useState } from "react";

import type { NoteRow, TodoRow } from "@/lib/supabase/queries";
import { NoteRow as NoteRowItem } from "@/components/dashboard/content/notes-todos/NoteRow";
import { TodoRow as TodoRowItem } from "@/components/dashboard/content/notes-todos/TodoRow";

export function NotesSectionPreview({ notes }: { notes: NoteRow[] }) {
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-hover-only">
      {notes.map((note) => (
        <NoteRowItem
          key={note.id}
          note={note}
          expanded={expandedNoteId === note.id}
          onToggleExpanded={() =>
            setExpandedNoteId((prev) => (prev === note.id ? null : note.id))
          }
          selectionMode={false}
          selected={false}
          onToggleSelected={() => {}}
          onEnterSelectionMode={() => {}}
          onEdit={() => {}}
          onDelete={() => {}}
          showActions={false}
        />
      ))}
    </div>
  );
}

export function TodosSectionPreview({
  todos,
  onToggleCompleted,
}: {
  todos: TodoRow[];
  onToggleCompleted: (id: string, completed: boolean) => void;
}) {
  const [expandedTodoId, setExpandedTodoId] = useState<string | null>(null);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-hover-only">
      {todos.map((todo) => (
        <TodoRowItem
          key={todo.id}
          todo={todo}
          expanded={expandedTodoId === todo.id}
          onToggleExpanded={() =>
            setExpandedTodoId((prev) => (prev === todo.id ? null : todo.id))
          }
          selectionMode={false}
          selected={false}
          onToggleSelected={() => {}}
          onEnterSelectionMode={() => {}}
          onToggleCompleted={() => onToggleCompleted(todo.id, !todo.completed)}
          onEdit={() => {}}
          onDelete={() => {}}
          showActions={false}
        />
      ))}
    </div>
  );
}
