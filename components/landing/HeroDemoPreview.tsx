"use client";

import { useReducedMotion } from "motion/react";
import {
  Folder01Icon,
  Search01Icon,
  BulbIcon,
  ToolsIcon,
} from "@hugeicons/core-free-icons";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RewayLogo from "@/components/logo";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

import { useMemo, useState } from "react";

import type { NoteRow, TodoRow } from "@/lib/supabase/queries";
import type { TodoPriority } from "@/components/dashboard/content/notes-todos/types";
import { NOTE_COLORS } from "@/components/dashboard/content/notes-todos/config";
import { NotesSectionPreview, TodosSectionPreview } from "./hero-demo/NotesTodosPreviews";

import type { HeroBookmark, HeroGroup, HeroGroupId } from "./hero-demo/types";
import { PREVIEW_BOOKMARKS, getInitialHeroGroups } from "./hero-demo/data";
import { DemoShell } from "./hero-demo/DemoShell";
import { GroupsSidebar } from "./hero-demo/GroupsSidebar";
import { GroupsDropdown } from "./hero-demo/GroupsDropdown";
import { BookmarksGrid } from "./hero-demo/BookmarksGrid";
import { NotesTodosSidebar } from "./hero-demo/NotesTodosSidebar";

export function HeroDemoPreview() {
  const shouldReduceMotion = useReducedMotion();

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeGroup, setActiveGroup] = useState<HeroGroupId>("all");
  const [commandMode, setCommandMode] = useState<"add" | "search">("add");
  const [commandInputValue, setCommandInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCommandFocused, setIsCommandFocused] = useState(false);

  const [heroBookmarks, setHeroBookmarks] = useState(() =>
    PREVIEW_BOOKMARKS.map((b, index) => ({
      ...b,
      id: `seed-${index}`,
    })),
  );

  const [notes, setNotes] = useState<NoteRow[]>(() => [
    {
      id: "n1",
      user_id: "hero",
      text: "Capture pricing pages and docs before you forget where you found them.",
      color: NOTE_COLORS[2],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      order_index: 0,
    },
    {
      id: "n2",
      user_id: "hero",
      text: "Long notes truncate in the sidebar. Click to expand and collapse just like the dashboard.",
      color: NOTE_COLORS[5],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      order_index: 1,
    },
  ]);

  const [activeNotesTodosSection, setActiveNotesTodosSection] = useState<
    "notes" | "todos"
  >("notes");

  const [heroGroups, setHeroGroups] = useState<HeroGroup[]>(() =>
    getInitialHeroGroups({
      folder: Folder01Icon,
      search: Search01Icon,
      bulb: BulbIcon,
      tools: ToolsIcon,
    }),
  );

  const [creatingGroup, setCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupIcon, setNewGroupIcon] = useState<
    typeof Search01Icon | typeof BulbIcon | typeof ToolsIcon | typeof Folder01Icon
  >(Folder01Icon);
  const [newGroupColor, setNewGroupColor] = useState<string | null>(null);

  const [dropdownCreatingGroup, setDropdownCreatingGroup] = useState(false);
  const [dropdownNewGroupName, setDropdownNewGroupName] = useState("");

  const [todos, setTodos] = useState<TodoRow[]>(() => [
    {
      id: "t1",
      user_id: "hero",
      text: "Group similar links",
      priority: "high",
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null,
      order_index: 0,
    },
    {
      id: "t2",
      user_id: "hero",
      text: "Clean duplicates",
      priority: "medium",
      completed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      order_index: 1,
    },
  ]);

  const makeId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return Math.random().toString(16).slice(2);
  };

  const handleCreateHeroGroupFromDropdown = () => {
    const name = dropdownNewGroupName.trim();
    if (!name) return;
    const id = makeId();

    setHeroGroups((prev) => [
      ...prev,
      {
        id,
        label: name,
        icon: Folder01Icon,
        color: null,
      },
    ]);

    setDropdownCreatingGroup(false);
    setDropdownNewGroupName("");
    setActiveGroup("all");
  };

  const visibleBookmarks = useMemo(() => {
    const groupFiltered =
      activeGroup === "all"
        ? heroBookmarks
        : heroBookmarks.filter((b) => b.group === activeGroup);

    const q = (commandMode === "search" ? searchQuery : "").trim().toLowerCase();
    if (!q) return groupFiltered;

    return groupFiltered.filter((b) => {
      return (
        b.title.toLowerCase().includes(q) ||
        b.domain.toLowerCase().includes(q) ||
        b.url.toLowerCase().includes(q)
      );
    });
  }, [activeGroup, commandMode, heroBookmarks, searchQuery]);

  const stableBookmarkSlots = useMemo(() => {
    const max = 9;
    const slots: Array<
      | { kind: "bookmark"; value: HeroBookmark }
      | { kind: "placeholder"; key: string }
    > = visibleBookmarks.slice(0, max).map((b) => ({ kind: "bookmark", value: b }));
    while (slots.length < max) {
      slots.push({ kind: "placeholder", key: `ph-${slots.length}` });
    }
    return slots;
  }, [visibleBookmarks]);

  const handleCreateHeroGroup = () => {
    const name = newGroupName.trim();
    if (!name) return;
    const id = makeId();
    const iconMap: Record<string, { icon: typeof Folder01Icon; color: string }> = {
      Research: { icon: Search01Icon, color: "#3b82f6" },
      Inspiration: { icon: BulbIcon, color: "#f59e0b" },
      Build: { icon: ToolsIcon, color: "#10b981" },
    };
    const preset = iconMap[name] ?? null;

    setHeroGroups((prev) => [
      ...prev,
      {
        id,
        label: name,
        icon: preset?.icon ?? newGroupIcon,
        color: preset?.color ?? newGroupColor,
      },
    ]);

    setCreatingGroup(false);
    setNewGroupName("");
    setNewGroupIcon(Folder01Icon);
    setNewGroupColor(null);
    setActiveGroup("all");
  };

  const cancelCreateHeroGroup = () => {
    setCreatingGroup(false);
    setNewGroupName("");
    setNewGroupIcon(Folder01Icon);
    setNewGroupColor(null);
  };

  const cancelCreateHeroGroupFromDropdown = () => {
    setDropdownCreatingGroup(false);
    setDropdownNewGroupName("");
  };

  const handleToggleTodoCompleted = (id: string, completed: boolean) => {
    void handleSetTodoCompleted(id, completed);
  };

  const handleCreateNote = async (formData: { text: string; color?: string | null }) => {
    const id = makeId();
    setNotes((prev) => [
      {
        id,
        user_id: "hero",
        text: formData.text,
        color: formData.color ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        order_index: prev.length,
      },
      ...prev,
    ]);
    return id;
  };

  const handleUpdateNote = async (
    id: string,
    formData: { text: string; color?: string | null },
  ) => {
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
  };

  const handleDeleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleDeleteNotes = async (ids: string[]) => {
    const idSet = new Set(ids);
    setNotes((prev) => prev.filter((n) => !idSet.has(n.id)));
  };

  const handleCreateTodo = async (formData: { text: string; priority: TodoPriority }) => {
    const id = makeId();
    setTodos((prev) => [
      {
        id,
        user_id: "hero",
        text: formData.text,
        priority: formData.priority,
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null,
        order_index: prev.length,
      },
      ...prev,
    ]);
    return id;
  };

  const handleUpdateTodo = async (
    id: string,
    formData: { text: string; priority: TodoPriority },
  ) => {
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
  };

  const handleDeleteTodo = async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const handleDeleteTodos = async (ids: string[]) => {
    const idSet = new Set(ids);
    setTodos((prev) => prev.filter((t) => !idSet.has(t.id)));
  };

  const handleSetTodoCompleted = async (id: string, completed: boolean) => {
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
  };

  const handleSetTodosCompleted = async (ids: string[], completed: boolean) => {
    const idSet = new Set(ids);
    setTodos((prev) =>
      prev.map((t) =>
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
  };

  const handleCopy = async (
    event: React.MouseEvent,
    bookmarkUrl: string,
    index: number,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(bookmarkUrl);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      setCopiedIndex(null);
    }
  };

  const handleOpen = (event: React.MouseEvent, bookmarkUrl: string) => {
    event.preventDefault();
    event.stopPropagation();
    window.open(bookmarkUrl, "_blank", "noopener,noreferrer");
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="mx-auto mt-12 w-full max-w-350">
      <DemoShell>
        <div className="flex bg-background">
          <GroupsSidebar
            activeGroup={activeGroup}
            heroGroups={heroGroups}
            creatingGroup={creatingGroup}
            newGroupName={newGroupName}
            newGroupIcon={newGroupIcon}
            setNewGroupName={setNewGroupName}
            setNewGroupIcon={setNewGroupIcon}
            setNewGroupColor={setNewGroupColor}
            onSelectGroup={setActiveGroup}
            onOpenCreate={() => setCreatingGroup(true)}
            onCancelCreate={cancelCreateHeroGroup}
            onCreate={handleCreateHeroGroup}
          />

          <div className="flex-1 p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <RewayLogo
                    className="size-7"
                    aria-hidden="true"
                    focusable="false"
                  />

                  <GroupsDropdown
                    activeGroup={activeGroup}
                    heroGroups={heroGroups}
                    dropdownCreatingGroup={dropdownCreatingGroup}
                    dropdownNewGroupName={dropdownNewGroupName}
                    setDropdownNewGroupName={setDropdownNewGroupName}
                    setDropdownCreatingGroup={setDropdownCreatingGroup}
                    onSelectGroup={(id) => setActiveGroup(id)}
                    onCreateGroup={handleCreateHeroGroupFromDropdown}
                    onCancelCreate={cancelCreateHeroGroupFromDropdown}
                  />
                </div>

                <Avatar className="h-7 w-7">
                  <AvatarImage src="https://api.dicebear.com/9.x/thumbs/svg?seed=Reway" />
                  <AvatarFallback className="bg-secondary text-[10px] text-secondary-foreground">
                    RW
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="relative w-full" data-onboarding="command-bar">
                <div
                  className={`group relative flex items-center justify-between gap-2 rounded-2xl px-1.5 py-1.5 after:absolute after:inset-0 after:rounded-2xl after:ring-1 after:pointer-events-none after:content-[''] shadow-none isolate ${
                    isCommandFocused
                      ? "ring-1 ring-primary/30 after:ring-white/10"
                      : "ring-1 ring-foreground/8 after:ring-white/5"
                  }`}
                >
                  <div className="relative flex-1 min-w-0">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (commandMode !== "add") return;
                        const value = commandInputValue.trim();
                        if (!value) return;

                        const nextGroup =
                          activeGroup === "all" ? "Research" : activeGroup;
                        setHeroBookmarks((prev) => [
                          {
                            id: makeId(),
                            title:
                              value.length > 28
                                ? `${value.slice(0, 28)}…`
                                : value,
                            domain: "new.link",
                            url: value.startsWith("http")
                              ? value
                              : `https://${value}`,
                            date: "Now",
                            favicon:
                              "https://www.google.com/s2/favicons?domain=example.com&sz=64",
                            group: nextGroup as
                              | "Research"
                              | "Inspiration"
                              | "Build"
                              | "Learn",
                          },
                          ...prev,
                        ]);
                        setCommandInputValue("");
                      }}
                    >
                      <input
                        type="text"
                        value={
                          commandMode === "search" ? searchQuery : commandInputValue
                        }
                        onChange={(e) => {
                          if (commandMode === "search") {
                            setSearchQuery(e.target.value);
                          } else {
                            setCommandInputValue(e.target.value);
                          }
                        }}
                        onFocus={() => setIsCommandFocused(true)}
                        onBlur={() => setIsCommandFocused(false)}
                        placeholder={
                          commandMode === "search"
                            ? "Search bookmarks..."
                            : "Add a link or search..."
                        }
                        className="w-full bg-transparent p-0 pl-1.5 text-[11px] font-medium outline-none placeholder:text-muted-foreground selection:bg-primary/20"
                        aria-label="Search or add bookmarks"
                      />
                    </form>
                  </div>

                  <div className="flex items-center gap-1 rounded-xl bg-muted/20 p-1 ring-1 ring-inset ring-foreground/5">
                    <button
                      type="button"
                      onClick={() => setCommandMode("add")}
                      className={`flex items-center gap-1 px-1.5 py-1 text-[10px] rounded-lg cursor-pointer ${
                        commandMode === "add"
                          ? "bg-muted/40 text-foreground"
                          : "text-muted-foreground hover:text-primary/90 hover:bg-muted/40"
                      }`}
                      aria-label="Add bookmarks"
                    >
                      <span>Add</span>
                      <KbdGroup className="hidden md:inline-flex">
                        <Kbd className="h-4.5 min-w-4.5 text-[9px] px-1">
                          CtrlK
                        </Kbd>
                      </KbdGroup>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCommandMode("search")}
                      className={`flex items-center gap-1 px-1.5 py-1 text-[10px] rounded-lg cursor-pointer ${
                        commandMode === "search"
                          ? "bg-muted/40 text-foreground"
                          : "text-muted-foreground hover:text-primary/90 hover:bg-muted/40"
                      }`}
                      aria-label="Search bookmarks"
                    >
                      <span>Search</span>
                      <KbdGroup className="hidden md:inline-flex">
                        <Kbd className="h-4.5 min-w-4.5 text-[9px] px-1">
                          CtrlF
                        </Kbd>
                      </KbdGroup>
                    </button>
                  </div>
                </div>
              </div>

              <div className="hidden flex-wrap items-center gap-4 text-[10px] text-muted-foreground sm:flex">
                <div className="flex items-center gap-1.5">
                  <KbdGroup className="gap-0.5">
                    <Kbd className="h-4.5 min-w-4.5 px-0.5 text-[9px]">↑</Kbd>
                    <Kbd className="h-4.5 min-w-4.5 px-0.5 text-[9px]">↓</Kbd>
                    <Kbd className="h-4.5 min-w-4.5 px-0.5 text-[9px]">←</Kbd>
                    <Kbd className="h-4.5 min-w-4.5 px-0.5 text-[9px]">→</Kbd>
                  </KbdGroup>
                  navigate
                </div>
                <div className="flex items-center gap-1.5">
                  <Kbd className="h-4.5 min-w-4.5 px-1 text-[9px]">Space</Kbd>
                  preview
                </div>
                <div className="flex items-center gap-1.5">
                  <KbdGroup className="gap-0.5">
                    <Kbd className="h-4.5 min-w-4.5 px-1 text-[9px]">Ctrl</Kbd>
                    <Kbd className="h-4.5 min-w-4.5 px-0.5 text-[9px]">⏎</Kbd>
                  </KbdGroup>
                  open
                </div>
                <div className="flex items-center gap-1.5">
                  <Kbd className="h-4.5 min-w-4.5 px-0.5 text-[9px]">⏎</Kbd>
                  copy
                </div>
                <div className="flex items-center gap-1.5">
                  <KbdGroup className="gap-0.5">
                    <Kbd className="h-4.5 min-w-4.5 px-1 text-[9px]">Shift</Kbd>
                    <Kbd className="h-4.5 min-w-4.5 px-1 text-[9px]">Click</Kbd>
                  </KbdGroup>
                  bulk select
                </div>
              </div>

              <BookmarksGrid
                stableBookmarkSlots={stableBookmarkSlots}
                copiedIndex={copiedIndex}
                onCopy={handleCopy}
                onOpen={handleOpen}
                onEdit={handleEdit}
              />
            </div>
          </div>

          <NotesTodosSidebar
            activeNotesTodosSection={activeNotesTodosSection}
            setActiveNotesTodosSection={setActiveNotesTodosSection}
            notes={notes}
            todos={todos}
            NotesSectionPreview={NotesSectionPreview}
            TodosSectionPreview={(props) => (
              <TodosSectionPreview
                {...props}
                onToggleCompleted={handleToggleTodoCompleted}
              />
            )}
            onCreateNote={handleCreateNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
            onDeleteNotes={handleDeleteNotes}
            onCreateTodo={handleCreateTodo}
            onUpdateTodo={handleUpdateTodo}
            onDeleteTodo={handleDeleteTodo}
            onDeleteTodos={handleDeleteTodos}
            onSetTodoCompleted={handleSetTodoCompleted}
            onSetTodosCompleted={handleSetTodosCompleted}
          />
        </div>
      </DemoShell>
    </div>
  );
}
