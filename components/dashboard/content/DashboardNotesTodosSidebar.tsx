"use client";

import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  CheckmarkSquare02Icon,
  Delete02Icon,
  MoreVerticalIcon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import type { NoteRow, TodoRow } from "@/lib/supabase/queries";

type TodoPriority = "high" | "medium" | "low";

const NOTE_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

const priorityConfig: Record<
  TodoPriority,
  { label: string; letter: string; colorClass: string }
> = {
  high: { label: "High", letter: "H", colorClass: "text-red-500" },
  medium: { label: "Med", letter: "M", colorClass: "text-amber-500" },
  low: { label: "Low", letter: "L", colorClass: "text-emerald-500" },
};

function normalizePriority(value?: string | null): TodoPriority {
  const v = (value ?? "").trim().toLowerCase();
  if (v === "high" || v === "h") return "high";
  if (v === "low" || v === "l") return "low";
  return "medium";
}

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

  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [expandedTodoId, setExpandedTodoId] = useState<string | null>(null);

  const [isNotesSelectionMode, setIsNotesSelectionMode] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [notesBulkDeleteDialogOpen, setNotesBulkDeleteDialogOpen] =
    useState(false);

  const [isTodosSelectionMode, setIsTodosSelectionMode] = useState(false);
  const [selectedTodoIds, setSelectedTodoIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [todosBulkDeleteDialogOpen, setTodosBulkDeleteDialogOpen] =
    useState(false);

  const selectedNotes = useMemo(
    () => notes.filter((n) => selectedNoteIds.has(n.id)),
    [notes, selectedNoteIds],
  );
  const selectedTodos = useMemo(
    () => todos.filter((t) => selectedTodoIds.has(t.id)),
    [todos, selectedTodoIds],
  );

  const [creatingNote, setCreatingNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteColor, setNewNoteColor] = useState<string | null>(
    NOTE_COLORS[5],
  );
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState("");
  const [editNoteColor, setEditNoteColor] = useState<string | null>(null);
  const [isUpdatingNote, setIsUpdatingNote] = useState(false);

  const [creatingTodo, setCreatingTodo] = useState(false);
  const [newTodoText, setNewTodoText] = useState("");
  const [newTodoPriority, setNewTodoPriority] =
    useState<TodoPriority>("medium");
  const [isCreatingTodo, setIsCreatingTodo] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editTodoText, setEditTodoText] = useState("");
  const [editTodoPriority, setEditTodoPriority] =
    useState<TodoPriority>("medium");
  const [isUpdatingTodo, setIsUpdatingTodo] = useState(false);

  const toggleSelectedNote = (id: string) => {
    setSelectedNoteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectedTodo = (id: string) => {
    setSelectedTodoIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exitNotesSelectionMode = () => {
    setIsNotesSelectionMode(false);
    setSelectedNoteIds(new Set());
  };

  const exitTodosSelectionMode = () => {
    setIsTodosSelectionMode(false);
    setSelectedTodoIds(new Set());
  };

  const handleCreateNote = async () => {
    if (!newNoteText.trim()) return;
    setIsCreatingNote(true);
    try {
      await onCreateNote({ text: newNoteText.trim(), color: newNoteColor });
      setCreatingNote(false);
      setNewNoteText("");
      setNewNoteColor(NOTE_COLORS[5]);
    } finally {
      setIsCreatingNote(false);
    }
  };

  const handleSaveNote = async (id: string) => {
    if (!editNoteText.trim()) return;
    setIsUpdatingNote(true);
    try {
      await onUpdateNote(id, {
        text: editNoteText.trim(),
        color: editNoteColor,
      });
      setEditingNoteId(null);
    } finally {
      setIsUpdatingNote(false);
    }
  };

  const handleCreateTodo = async () => {
    if (!newTodoText.trim()) return;
    setIsCreatingTodo(true);
    try {
      await onCreateTodo({
        text: newTodoText.trim(),
        priority: newTodoPriority,
      });
      setCreatingTodo(false);
      setNewTodoText("");
      setNewTodoPriority("medium");
    } finally {
      setIsCreatingTodo(false);
    }
  };

  const handleSaveTodo = async (id: string) => {
    if (!editTodoText.trim()) return;
    setIsUpdatingTodo(true);
    try {
      await onUpdateTodo(id, {
        text: editTodoText.trim(),
        priority: editTodoPriority,
      });
      setEditingTodoId(null);
    } finally {
      setIsUpdatingTodo(false);
    }
  };

  const renderColorPicker = (
    value: string | null,
    onChange: (v: string) => void,
  ) => {
    return (
      <div className="flex items-center gap-2">
        {NOTE_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            className={cn(
              "h-4 w-4 rounded-full ring-1 ring-border/60 cursor-pointer",
              value === c ? "ring-2 ring-foreground/40" : "opacity-80",
            )}
            style={{ backgroundColor: c }}
            onClick={() => onChange(c)}
            aria-label={`Select color ${c}`}
          />
        ))}
      </div>
    );
  };

  const renderPriorityPicker = (
    value: TodoPriority,
    onChange: (v: TodoPriority) => void,
  ) => {
    return (
      <div className="flex items-center gap-2">
        {(Object.keys(priorityConfig) as TodoPriority[]).map((p) => {
          const cfg = priorityConfig[p];
          const active = p === value;
          return (
            <button
              key={p}
              type="button"
              className={cn(
                "h-6 px-2 text-[11px] rounded-4xl border border-border/60 cursor-pointer",
                active
                  ? "bg-muted/40 text-foreground"
                  : "bg-transparent text-muted-foreground hover:text-foreground",
              )}
              onClick={() => onChange(p)}
            >
              <span className={cn("font-semibold", cfg.colorClass)}>
                {cfg.letter}
              </span>
              <span className="ml-1">{cfg.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <aside className="hidden min-[1200px]:flex fixed right-6 top-43 bottom-6 z-30 w-60 flex-col gap-2 text-sm text-muted-foreground">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-xl bg-muted/20 p-1 ring-1 ring-inset ring-foreground/5">
          <button
            type="button"
            className={cn(
              "px-2 py-1 text-[11px] rounded-lg cursor-pointer",
              activeSection === "notes"
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground",
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
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setActiveSection("todos")}
          >
            Todos
          </button>
        </div>
      </div>

      {activeSection === "notes" ? (
        <>
          {isNotesSelectionMode ? (
            <div className="mb-1 rounded-2xl border border-border/60 bg-muted/20 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  {selectedNoteIds.size} selected
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 px-3 text-xs rounded-4xl font-bold cursor-pointer"
                    onClick={exitNotesSelectionMode}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-7 px-3 text-xs rounded-4xl cursor-pointer"
                    onClick={() => {
                      if (selectedNoteIds.size === 0) return;
                      setNotesBulkDeleteDialogOpen(true);
                    }}
                    disabled={selectedNoteIds.size === 0}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-hover-only">
            {notes.map((note) => {
              const isEditing = editingNoteId === note.id;

              if (isEditing) {
                return (
                  <div
                    key={note.id}
                    className="relative my-2 p-3 space-y-3 rounded-2xl bg-muted/20 ring-1 ring-inset ring-foreground/5"
                  >
                    <div className="space-y-2">
                      {renderColorPicker(editNoteColor, (c) =>
                        setEditNoteColor(c),
                      )}
                      <Input
                        value={editNoteText}
                        onChange={(e) => setEditNoteText(e.target.value)}
                        placeholder="Note"
                        className="h-8 text-sm rounded-xl"
                        autoFocus
                        disabled={isUpdatingNote}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !isUpdatingNote) {
                            void handleSaveNote(note.id);
                          } else if (e.key === "Escape") {
                            setEditingNoteId(null);
                          }
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 px-3 text-xs rounded-4xl font-bold cursor-pointer"
                        onClick={() => setEditingNoteId(null)}
                        disabled={isUpdatingNote}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 px-3 text-xs rounded-4xl cursor-pointer"
                        onClick={() => void handleSaveNote(note.id)}
                        disabled={!editNoteText.trim() || isUpdatingNote}
                      >
                        {isUpdatingNote ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                );
              }

              return (
                <ContextMenu key={note.id}>
                  <ContextMenuTrigger asChild>
                    <div className="group flex items-start gap-3 px-2 py-1.5 transition-colors duration-200">
                      {isNotesSelectionMode ? (
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleSelectedNote(note.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              toggleSelectedNote(note.id);
                            }
                          }}
                          className="flex items-start gap-3 min-w-0 flex-1 text-left cursor-pointer"
                        >
                          <div
                            className={cn(
                              "flex gap-2 min-w-0 flex-1",
                              "items-start",
                            )}
                          >
                            <span className="mt-[2px]">
                              <Checkbox
                                checked={selectedNoteIds.has(note.id)}
                                onClick={(event) => event.stopPropagation()}
                                onCheckedChange={() =>
                                  toggleSelectedNote(note.id)
                                }
                              />
                            </span>
                            <span
                              className={cn("h-2 w-2 rounded-full", "mt-2")}
                              style={{
                                backgroundColor: note.color ?? NOTE_COLORS[5],
                              }}
                            />
                            <span
                              className={cn(
                                "min-w-0 flex-1",
                                expandedNoteId === note.id
                                  ? "whitespace-pre-wrap wrap-break-word"
                                  : "truncate max-w-32",
                              )}
                            >
                              {note.text}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            setExpandedNoteId((prev) =>
                              prev === note.id ? null : note.id,
                            );
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setExpandedNoteId((prev) =>
                                prev === note.id ? null : note.id,
                              );
                            }
                          }}
                          className="flex items-start gap-3 min-w-0 flex-1 text-left cursor-pointer"
                        >
                          <div
                            className={cn(
                              "flex gap-2 min-w-0 flex-1",
                              "items-start",
                            )}
                          >
                            <span
                              className={cn("h-2 w-2 rounded-full", "mt-1.5")}
                              style={{
                                backgroundColor: note.color ?? NOTE_COLORS[5],
                              }}
                            />
                            <span
                              className={cn(
                                "min-w-0 flex-1",
                                expandedNoteId === note.id
                                  ? "whitespace-pre-wrap wrap-break-word"
                                  : "truncate max-w-32",
                              )}
                            >
                              {note.text}
                            </span>
                          </div>
                        </div>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className={cn(
                              "text-muted-foreground/50 transition-all duration-200 h-6 w-6 rounded-md flex items-center justify-center cursor-pointer self-start mt-0",
                              isNotesSelectionMode
                                ? "opacity-0 pointer-events-none"
                                : "opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-muted/50",
                            )}
                            aria-label="Note options"
                          >
                            <HugeiconsIcon icon={MoreVerticalIcon} size={14} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-40">
                          <DropdownMenuItem
                            onSelect={(event) => {
                              if (isNotesSelectionMode) {
                                toggleSelectedNote(note.id);
                              } else {
                                setIsNotesSelectionMode(true);
                                setSelectedNoteIds(new Set([note.id]));
                              }
                            }}
                            className="gap-2 text-xs cursor-pointer"
                          >
                            <HugeiconsIcon
                              icon={CheckmarkSquare02Icon}
                              size={14}
                            />
                            {isNotesSelectionMode
                              ? "Toggle selection"
                              : "Select notes"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingNoteId(note.id);
                              setEditNoteText(note.text);
                              setEditNoteColor(note.color ?? NOTE_COLORS[5]);
                            }}
                            className="gap-2 text-xs cursor-pointer"
                          >
                            <HugeiconsIcon icon={PencilEdit01Icon} size={14} />
                            Edit note
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => void onDeleteNote(note.id)}
                            className="gap-2 text-xs cursor-pointer text-destructive/80 focus:text-destructive"
                          >
                            <HugeiconsIcon icon={Delete02Icon} size={14} />
                            Delete note
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-44">
                    <ContextMenuItem
                      onSelect={(event) => {
                        if (isNotesSelectionMode) {
                          toggleSelectedNote(note.id);
                        } else {
                          setIsNotesSelectionMode(true);
                          setSelectedNoteIds(new Set([note.id]));
                        }
                      }}
                      className="gap-2 text-xs cursor-pointer"
                    >
                      <HugeiconsIcon icon={CheckmarkSquare02Icon} size={14} />
                      {isNotesSelectionMode
                        ? "Toggle selection"
                        : "Select notes"}
                    </ContextMenuItem>
                    <ContextMenuItem
                      onSelect={() => {
                        setEditingNoteId(note.id);
                        setEditNoteText(note.text);
                        setEditNoteColor(note.color ?? NOTE_COLORS[5]);
                      }}
                      className="gap-2 text-xs cursor-pointer"
                    >
                      <HugeiconsIcon icon={PencilEdit01Icon} size={14} />
                      Edit note
                    </ContextMenuItem>
                    <ContextMenuItem
                      onSelect={() => void onDeleteNote(note.id)}
                      className="gap-2 text-xs cursor-pointer text-destructive/80 focus:text-destructive"
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={14} />
                      Delete note
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              );
            })}
          </div>

          <div className="pt-3 mt-2 border-t border-border/40">
            {creatingNote ? (
              <div className="relative mt-2 p-3 space-y-3 rounded-2xl bg-muted/20 ring-1 ring-inset ring-foreground/5">
                <div className="space-y-2">
                  {renderColorPicker(newNoteColor, (c) => setNewNoteColor(c))}
                  <Input
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="New note"
                    className="h-8 text-sm rounded-xl"
                    autoFocus
                    disabled={isCreatingNote}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isCreatingNote) {
                        void handleCreateNote();
                      } else if (e.key === "Escape") {
                        setCreatingNote(false);
                        setNewNoteText("");
                        setNewNoteColor(NOTE_COLORS[5]);
                      }
                    }}
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 px-3 text-xs rounded-4xl font-bold cursor-pointer"
                    onClick={() => {
                      setCreatingNote(false);
                      setNewNoteText("");
                      setNewNoteColor(NOTE_COLORS[5]);
                    }}
                    disabled={isCreatingNote}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 px-3 text-xs rounded-4xl cursor-pointer"
                    onClick={() => void handleCreateNote()}
                    disabled={!newNoteText.trim() || isCreatingNote}
                  >
                    {isCreatingNote ? "Creating..." : "Create"}
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCreatingNote(true)}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <HugeiconsIcon icon={Add01Icon} size={14} />
                Create note
              </button>
            )}
          </div>

          <AlertDialog
            open={notesBulkDeleteDialogOpen}
            onOpenChange={(open) => setNotesBulkDeleteDialogOpen(open)}
          >
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete selected notes?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete {selectedNoteIds.size} note
                  {selectedNoteIds.size === 1 ? "" : "s"}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-4xl cursor-pointer">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  className="rounded-4xl cursor-pointer"
                  onClick={async () => {
                    await onDeleteNotes(Array.from(selectedNoteIds));
                    setNotesBulkDeleteDialogOpen(false);
                    exitNotesSelectionMode();
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ) : (
        <>
          {isTodosSelectionMode ? (
            <div className="mb-1 rounded-2xl border border-border/60 bg-muted/20 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  {selectedTodoIds.size} selected
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 px-3 text-xs rounded-4xl font-bold cursor-pointer"
                    onClick={exitTodosSelectionMode}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-7 px-3 text-xs rounded-4xl cursor-pointer"
                    onClick={() => {
                      if (selectedTodoIds.size === 0) return;
                      setTodosBulkDeleteDialogOpen(true);
                    }}
                    disabled={selectedTodoIds.size === 0}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-hover-only">
            {todos.map((todo) => {
              const isEditing = editingTodoId === todo.id;
              const priority = normalizePriority(todo.priority);
              const pCfg = priorityConfig[priority];

              if (isEditing) {
                return (
                  <div
                    key={todo.id}
                    className="relative my-2 p-3 space-y-3 rounded-2xl bg-muted/20 ring-1 ring-inset ring-foreground/5"
                  >
                    <div className="space-y-2">
                      {renderPriorityPicker(
                        editTodoPriority,
                        setEditTodoPriority,
                      )}
                      <Input
                        value={editTodoText}
                        onChange={(e) => setEditTodoText(e.target.value)}
                        placeholder="Todo"
                        className="h-8 text-sm rounded-xl"
                        autoFocus
                        disabled={isUpdatingTodo}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !isUpdatingTodo) {
                            void handleSaveTodo(todo.id);
                          } else if (e.key === "Escape") {
                            setEditingTodoId(null);
                          }
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 px-3 text-xs rounded-4xl font-bold cursor-pointer"
                        onClick={() => setEditingTodoId(null)}
                        disabled={isUpdatingTodo}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 px-3 text-xs rounded-4xl cursor-pointer"
                        onClick={() => void handleSaveTodo(todo.id)}
                        disabled={!editTodoText.trim() || isUpdatingTodo}
                      >
                        {isUpdatingTodo ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                );
              }

              return (
                <ContextMenu key={todo.id}>
                  <ContextMenuTrigger asChild>
                    <div className="group flex items-start gap-3 px-2 py-1.5 transition-colors duration-200">
                      {isTodosSelectionMode ? (
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleSelectedTodo(todo.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              toggleSelectedTodo(todo.id);
                            }
                          }}
                          className="flex items-start gap-3 min-w-0 flex-1 text-left cursor-pointer"
                        >
                          <div
                            className={cn(
                              "flex gap-2 min-w-0 flex-1",
                              "items-start",
                            )}
                          >
                            <span className={cn("mt-1")}>
                              <Checkbox
                                checked={selectedTodoIds.has(todo.id)}
                                onClick={(event) => event.stopPropagation()}
                                onCheckedChange={() =>
                                  toggleSelectedTodo(todo.id)
                                }
                              />
                            </span>
                            <span
                              className={cn(
                                "text-xs font-semibold",
                                pCfg.colorClass,
                                "mt-1",
                              )}
                            >
                              {pCfg.letter}
                            </span>
                            <span
                              className={cn(
                                "min-w-0 flex-1",
                                todo.completed ? "line-through opacity-60" : "",
                                expandedTodoId === todo.id
                                  ? "whitespace-pre-wrap wrap-break-word"
                                  : "truncate max-w-32",
                              )}
                            >
                              {todo.text}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            setExpandedTodoId((prev) =>
                              prev === todo.id ? null : todo.id,
                            );
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setExpandedTodoId((prev) =>
                                prev === todo.id ? null : todo.id,
                              );
                            }
                          }}
                          className="flex items-start gap-3 min-w-0 flex-1 text-left cursor-pointer"
                        >
                          <div
                            className={cn(
                              "flex gap-2 min-w-0 flex-1",
                              "items-start",
                            )}
                          >
                            <span
                              onClick={(event) => event.stopPropagation()}
                              className={cn("mt-1")}
                            >
                              <Checkbox
                                checked={todo.completed}
                                onCheckedChange={(checked) => {
                                  void onSetTodoCompleted(
                                    todo.id,
                                    Boolean(checked),
                                  );
                                }}
                              />
                            </span>
                            <span
                              className={cn(
                                "text-xs font-semibold",
                                pCfg.colorClass,
                                "mt-1",
                              )}
                            >
                              {pCfg.letter}
                            </span>
                            <span
                              className={cn(
                                "min-w-0 flex-1",
                                todo.completed ? "line-through opacity-60" : "",
                                expandedTodoId === todo.id
                                  ? "whitespace-pre-wrap wrap-break-word"
                                  : "truncate max-w-32",
                              )}
                            >
                              {todo.text}
                            </span>
                          </div>
                        </div>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className={cn(
                              "text-muted-foreground/50 transition-all duration-200 h-6 w-6 rounded-md flex items-center justify-center cursor-pointer self-start mt-0",
                              isTodosSelectionMode
                                ? "opacity-0 pointer-events-none"
                                : "opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-muted/50",
                            )}
                            aria-label="Todo options"
                          >
                            <HugeiconsIcon icon={MoreVerticalIcon} size={14} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-44">
                          <DropdownMenuItem
                            onSelect={(event) => {
                              if (isTodosSelectionMode) {
                                toggleSelectedTodo(todo.id);
                              } else {
                                setIsTodosSelectionMode(true);
                                setSelectedTodoIds(new Set([todo.id]));
                              }
                            }}
                            className="gap-2 text-xs cursor-pointer"
                          >
                            <HugeiconsIcon
                              icon={CheckmarkSquare02Icon}
                              size={14}
                            />
                            {isTodosSelectionMode
                              ? "Toggle selection"
                              : "Select todos"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() =>
                              void onSetTodoCompleted(todo.id, !todo.completed)
                            }
                            className="gap-2 text-xs cursor-pointer"
                          >
                            <HugeiconsIcon
                              icon={CheckmarkSquare02Icon}
                              size={14}
                            />
                            {todo.completed
                              ? "Mark as active"
                              : "Mark as completed"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => {
                              setEditingTodoId(todo.id);
                              setEditTodoText(todo.text);
                              setEditTodoPriority(priority);
                            }}
                            className="gap-2 text-xs cursor-pointer"
                          >
                            <HugeiconsIcon icon={PencilEdit01Icon} size={14} />
                            Edit todo
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => void onDeleteTodo(todo.id)}
                            className="gap-2 text-xs cursor-pointer text-destructive/80 focus:text-destructive"
                          >
                            <HugeiconsIcon icon={Delete02Icon} size={14} />
                            Delete todo
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-44">
                    <ContextMenuItem
                      onSelect={(event) => {
                        if (isTodosSelectionMode) {
                          toggleSelectedTodo(todo.id);
                        } else {
                          setIsTodosSelectionMode(true);
                          setSelectedTodoIds(new Set([todo.id]));
                        }
                      }}
                      className="gap-2 text-xs cursor-pointer"
                    >
                      <HugeiconsIcon icon={CheckmarkSquare02Icon} size={14} />
                      {isTodosSelectionMode
                        ? "Toggle selection"
                        : "Select todos"}
                    </ContextMenuItem>
                    <ContextMenuItem
                      onSelect={() =>
                        void onSetTodoCompleted(todo.id, !todo.completed)
                      }
                      className="gap-2 text-xs cursor-pointer"
                    >
                      <HugeiconsIcon icon={CheckmarkSquare02Icon} size={14} />
                      {todo.completed ? "Mark as active" : "Mark as completed"}
                    </ContextMenuItem>
                    <ContextMenuItem
                      onSelect={() => {
                        setEditingTodoId(todo.id);
                        setEditTodoText(todo.text);
                        setEditTodoPriority(priority);
                      }}
                      className="gap-2 text-xs cursor-pointer"
                    >
                      <HugeiconsIcon icon={PencilEdit01Icon} size={14} />
                      Edit todo
                    </ContextMenuItem>
                    <ContextMenuItem
                      onSelect={() => void onDeleteTodo(todo.id)}
                      className="gap-2 text-xs cursor-pointer text-destructive/80 focus:text-destructive"
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={14} />
                      Delete todo
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              );
            })}
          </div>

          <div className="pt-3 mt-2 border-t border-border/40">
            {creatingTodo ? (
              <div className="relative mt-2 p-3 space-y-3 rounded-2xl bg-muted/20 ring-1 ring-inset ring-foreground/5">
                <div className="space-y-2">
                  {renderPriorityPicker(newTodoPriority, setNewTodoPriority)}
                  <Input
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    placeholder="New todo"
                    className="h-8 text-sm rounded-xl"
                    autoFocus
                    disabled={isCreatingTodo}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isCreatingTodo) {
                        void handleCreateTodo();
                      } else if (e.key === "Escape") {
                        setCreatingTodo(false);
                        setNewTodoText("");
                        setNewTodoPriority("medium");
                      }
                    }}
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 px-3 text-xs rounded-4xl font-bold cursor-pointer"
                    onClick={() => {
                      setCreatingTodo(false);
                      setNewTodoText("");
                      setNewTodoPriority("medium");
                    }}
                    disabled={isCreatingTodo}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 px-3 text-xs rounded-4xl cursor-pointer"
                    onClick={() => void handleCreateTodo()}
                    disabled={!newTodoText.trim() || isCreatingTodo}
                  >
                    {isCreatingTodo ? "Creating..." : "Create"}
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCreatingTodo(true)}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <HugeiconsIcon icon={Add01Icon} size={14} />
                Create todo
              </button>
            )}
          </div>

          <AlertDialog
            open={todosBulkDeleteDialogOpen}
            onOpenChange={(open) => setTodosBulkDeleteDialogOpen(open)}
          >
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete selected todos?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete {selectedTodoIds.size} todo
                  {selectedTodoIds.size === 1 ? "" : "s"}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-4xl cursor-pointer">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  className="rounded-4xl cursor-pointer"
                  onClick={async () => {
                    await onDeleteTodos(Array.from(selectedTodoIds));
                    setTodosBulkDeleteDialogOpen(false);
                    exitTodosSelectionMode();
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </aside>
  );
}
