"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import type { NoteRow, TodoRow } from "@/lib/supabase/queries";
import {
  createNote,
  deleteNote,
  deleteNotes as deleteNotesAction,
  restoreNote,
  updateNote,
} from "@/app/dashboard/actions/notes";
import {
  createTodo,
  deleteTodo,
  deleteTodos as deleteTodosAction,
  restoreTodo,
  setTodoCompleted,
  setTodosCompleted,
  updateTodo,
} from "@/app/dashboard/actions/todos";

export function useNotesTodosActions({
  userId,
  initialNotes,
  initialTodos,
  notes,
  setNotes,
  todos,
  setTodos,
  lastDeletedNoteRef,
  lastBulkDeletedNotesRef,
  lastDeletedTodoRef,
  lastBulkDeletedTodosRef,
}: {
  userId: string;
  initialNotes: NoteRow[];
  initialTodos: TodoRow[];
  notes: NoteRow[];
  setNotes: React.Dispatch<React.SetStateAction<NoteRow[]>>;
  todos: TodoRow[];
  setTodos: React.Dispatch<React.SetStateAction<TodoRow[]>>;
  lastDeletedNoteRef: React.MutableRefObject<
    { note: NoteRow; index: number } | null
  >;
  lastBulkDeletedNotesRef: React.MutableRefObject<
    { note: NoteRow; index: number }[]
  >;
  lastDeletedTodoRef: React.MutableRefObject<
    { todo: TodoRow; index: number } | null
  >;
  lastBulkDeletedTodosRef: React.MutableRefObject<
    { todo: TodoRow; index: number }[]
  >;
}) {
  const handleCreateNote = useCallback(
    async (formData: { text: string; color?: string | null }) => {
      const id = await createNote({
        text: formData.text,
        color: formData.color ?? null,
      });
      const now = new Date().toISOString();
      const newNote: NoteRow = {
        id,
        user_id: userId,
        text: formData.text,
        color: formData.color ?? null,
        created_at: now,
        updated_at: now,
        order_index: null,
      };
      setNotes((prev) => [newNote, ...prev]);
      return id;
    },
    [setNotes, userId],
  );

  const handleUpdateNote = useCallback(
    async (id: string, formData: { text: string; color?: string | null }) => {
      const prevNote = notes.find((n) => n.id === id);
      setNotes((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
                ...n,
                text: formData.text,
                color: formData.color ?? null,
                updated_at: new Date().toISOString(),
              }
            : n,
        ),
      );
      try {
        await updateNote(id, {
          text: formData.text,
          color: formData.color ?? null,
        });
      } catch (error) {
        console.error("Update note failed:", error);
        toast.error("Failed to update note");
        if (prevNote) {
          setNotes((prev) => prev.map((n) => (n.id === id ? prevNote : n)));
        }
      }
    },
    [notes, setNotes],
  );

  const handleDeleteNote = useCallback(
    async (id: string) => {
      let deletedNote: NoteRow | undefined;
      let deletedIndex = -1;

      setNotes((prev) => {
        deletedIndex = prev.findIndex((n) => n.id === id);
        deletedNote = prev[deletedIndex];
        if (deletedNote) {
          lastDeletedNoteRef.current = { note: deletedNote, index: deletedIndex };
        }
        return prev.filter((n) => n.id !== id);
      });

      if (deletedNote) {
        toast.error("Note deleted", {
          action: {
            label: "Undo",
            onClick: async () => {
              const lastDeleted = lastDeletedNoteRef.current;
              if (!lastDeleted) return;
              setNotes((prev) => {
                if (prev.some((n) => n.id === lastDeleted.note.id)) return prev;
                const next = [...prev];
                next.splice(
                  Math.min(lastDeleted.index, next.length),
                  0,
                  lastDeleted.note,
                );
                return next;
              });
              try {
                await restoreNote(lastDeleted.note);
              } catch (error) {
                console.error("Restore note failed:", error);
                toast.error("Failed to restore note");
              }
            },
          },
        });
      }

      try {
        await deleteNote(id);
      } catch (error) {
        console.error("Delete note failed:", error);
        toast.error("Failed to delete note");
        setNotes((prev) => {
          const deletedFromInitial = initialNotes.find((n) => n.id === id);
          return deletedFromInitial ? [deletedFromInitial, ...prev] : prev;
        });
      }
    },
    [initialNotes, lastDeletedNoteRef, setNotes],
  );

  const handleDeleteNotes = useCallback(
    async (ids: string[]) => {
      if (!ids || ids.length === 0) return;
      const idSet = new Set(ids);

      const deletedNotes = notes
        .map((note, index) => ({ note, index }))
        .filter(({ note }) => idSet.has(note.id));
      lastBulkDeletedNotesRef.current = deletedNotes;

      setNotes((prev) => prev.filter((n) => !idSet.has(n.id)));

      toast.error(`Note${ids.length > 1 ? "s" : ""} deleted`, {
        action: {
          label: "Undo",
          onClick: async () => {
            const toRestore = lastBulkDeletedNotesRef.current;
            if (toRestore.length === 0) return;
            setNotes((prev) => {
              const next = [...prev];
              const sorted = toRestore.toSorted((a, b) => a.index - b.index);
              sorted.forEach(({ note, index }) => {
                if (next.some((n) => n.id === note.id)) return;
                next.splice(Math.min(index, next.length), 0, note);
              });
              return next;
            });
            try {
              await Promise.all(toRestore.map(({ note }) => restoreNote(note)));
            } catch (error) {
              console.error("Restore notes failed:", error);
              toast.error("Failed to restore notes");
            }
          },
        },
      });

      try {
        await deleteNotesAction(ids);
      } catch (error) {
        console.error("Bulk delete notes failed:", error);
        toast.error("Failed to delete notes");
        setNotes(initialNotes);
      }
    },
    [initialNotes, lastBulkDeletedNotesRef, notes, setNotes],
  );

  const handleCreateTodo = useCallback(
    async (formData: { text: string; priority: "high" | "medium" | "low" }) => {
      const id = await createTodo({
        text: formData.text,
        priority: formData.priority,
      });
      const now = new Date().toISOString();
      const newTodo: TodoRow = {
        id,
        user_id: userId,
        text: formData.text,
        priority: formData.priority,
        completed: false,
        completed_at: null,
        created_at: now,
        updated_at: now,
        order_index: null,
      };
      setTodos((prev) => [newTodo, ...prev]);
      return id;
    },
    [setTodos, userId],
  );

  const handleUpdateTodo = useCallback(
    async (
      id: string,
      formData: { text: string; priority: "high" | "medium" | "low" },
    ) => {
      const prevTodo = todos.find((t) => t.id === id);
      setTodos((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                text: formData.text,
                priority: formData.priority,
                updated_at: new Date().toISOString(),
              }
            : t,
        ),
      );
      try {
        await updateTodo(id, {
          text: formData.text,
          priority: formData.priority,
        });
      } catch (error) {
        console.error("Update todo failed:", error);
        toast.error("Failed to update todo");
        if (prevTodo) {
          setTodos((prev) => prev.map((t) => (t.id === id ? prevTodo : t)));
        }
      }
    },
    [setTodos, todos],
  );

  const handleSetTodoCompleted = useCallback(
    async (id: string, completed: boolean) => {
      const prevTodo = todos.find((t) => t.id === id);
      setTodos((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                completed,
                completed_at: completed ? new Date().toISOString() : null,
                updated_at: new Date().toISOString(),
              }
            : t,
        ),
      );
      try {
        await setTodoCompleted(id, completed);
      } catch (error) {
        console.error("Set todo completed failed:", error);
        toast.error("Failed to update todo");
        if (prevTodo) {
          setTodos((prev) => prev.map((t) => (t.id === id ? prevTodo : t)));
        }
      }
    },
    [setTodos, todos],
  );

  const handleSetTodosCompleted = useCallback(
    async (ids: string[], completed: boolean) => {
      if (!ids || ids.length === 0) return;
      const idSet = new Set(ids);

      const prev = todos;
      setTodos((items) =>
        items.map((t) =>
          idSet.has(t.id)
            ? {
                ...t,
                completed,
                completed_at: completed ? new Date().toISOString() : null,
                updated_at: new Date().toISOString(),
              }
            : t,
        ),
      );

      try {
        await setTodosCompleted(ids, completed);
      } catch (error) {
        console.error("Bulk set todos completed failed:", error);
        toast.error("Failed to update todos");
        setTodos(prev);
      }
    },
    [setTodos, todos],
  );

  const handleDeleteTodo = useCallback(
    async (id: string) => {
      let deletedTodo: TodoRow | undefined;
      let deletedIndex = -1;

      setTodos((prev) => {
        deletedIndex = prev.findIndex((t) => t.id === id);
        deletedTodo = prev[deletedIndex];
        if (deletedTodo) {
          lastDeletedTodoRef.current = { todo: deletedTodo, index: deletedIndex };
        }
        return prev.filter((t) => t.id !== id);
      });

      if (deletedTodo) {
        toast.error("Todo deleted", {
          action: {
            label: "Undo",
            onClick: async () => {
              const lastDeleted = lastDeletedTodoRef.current;
              if (!lastDeleted) return;
              setTodos((prev) => {
                if (prev.some((t) => t.id === lastDeleted.todo.id)) return prev;
                const next = [...prev];
                next.splice(
                  Math.min(lastDeleted.index, next.length),
                  0,
                  lastDeleted.todo,
                );
                return next;
              });
              try {
                await restoreTodo(lastDeleted.todo);
              } catch (error) {
                console.error("Restore todo failed:", error);
                toast.error("Failed to restore todo");
              }
            },
          },
        });
      }

      try {
        await deleteTodo(id);
      } catch (error) {
        console.error("Delete todo failed:", error);
        toast.error("Failed to delete todo");
        setTodos((prev) => {
          const deletedFromInitial = initialTodos.find((t) => t.id === id);
          return deletedFromInitial ? [deletedFromInitial, ...prev] : prev;
        });
      }
    },
    [initialTodos, lastDeletedTodoRef, setTodos],
  );

  const handleDeleteTodos = useCallback(
    async (ids: string[]) => {
      if (!ids || ids.length === 0) return;
      const idSet = new Set(ids);

      const deletedTodos = todos
        .map((todo, index) => ({ todo, index }))
        .filter(({ todo }) => idSet.has(todo.id));
      lastBulkDeletedTodosRef.current = deletedTodos;

      setTodos((prev) => prev.filter((t) => !idSet.has(t.id)));

      toast.error(`Todo${ids.length > 1 ? "s" : ""} deleted`, {
        action: {
          label: "Undo",
          onClick: async () => {
            const toRestore = lastBulkDeletedTodosRef.current;
            if (toRestore.length === 0) return;
            setTodos((prev) => {
              const next = [...prev];
              const sorted = toRestore.toSorted((a, b) => a.index - b.index);
              sorted.forEach(({ todo, index }) => {
                if (next.some((t) => t.id === todo.id)) return;
                next.splice(Math.min(index, next.length), 0, todo);
              });
              return next;
            });
            try {
              await Promise.all(toRestore.map(({ todo }) => restoreTodo(todo)));
            } catch (error) {
              console.error("Restore todos failed:", error);
              toast.error("Failed to restore todos");
            }
          },
        },
      });

      try {
        await deleteTodosAction(ids);
      } catch (error) {
        console.error("Bulk delete todos failed:", error);
        toast.error("Failed to delete todos");
        setTodos(initialTodos);
      }
    },
    [initialTodos, lastBulkDeletedTodosRef, setTodos, todos],
  );

  return {
    handleCreateNote,
    handleUpdateNote,
    handleDeleteNote,
    handleDeleteNotes,
    handleCreateTodo,
    handleUpdateTodo,
    handleDeleteTodo,
    handleDeleteTodos,
    handleSetTodoCompleted,
    handleSetTodosCompleted,
  };
}
