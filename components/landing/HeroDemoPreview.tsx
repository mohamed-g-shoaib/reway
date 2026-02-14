"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RewayLogo from "@/components/logo";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

import {
  NotesSectionPreview,
  TodosSectionPreview,
} from "./hero-demo/NotesTodosPreviews";
import { DemoShell } from "./hero-demo/DemoShell";
import { GroupsSidebar } from "./hero-demo/GroupsSidebar";
import { GroupsDropdown } from "./hero-demo/GroupsDropdown";
import { BookmarksGrid } from "./hero-demo/BookmarksGrid";
import { NotesTodosSidebar } from "./hero-demo/NotesTodosSidebar";
import { useHeroDemoState } from "./hero-demo/useHeroDemoState";

export function HeroDemoPreview() {
  const {
    copiedIndex,
    activeGroup,
    setActiveGroup,
    commandMode,
    setCommandMode,
    commandInputValue,
    setCommandInputValue,
    searchQuery,
    setSearchQuery,
    isCommandFocused,
    setIsCommandFocused,
    stableBookmarkSlots,
    heroGroups,
    creatingGroup,
    setCreatingGroup,
    newGroupName,
    setNewGroupName,
    newGroupIcon,
    setNewGroupIcon,
    setNewGroupColor,
    dropdownCreatingGroup,
    setDropdownCreatingGroup,
    dropdownNewGroupName,
    setDropdownNewGroupName,
    activeNotesTodosSection,
    setActiveNotesTodosSection,
    notes,
    todos,
    handleCreateHeroGroupFromDropdown,
    handleCreateHeroGroup,
    cancelCreateHeroGroup,
    cancelCreateHeroGroupFromDropdown,
    submitCommandInput,
    handleCopy,
    handleOpen,
    handleEdit,
    handleToggleTodoCompleted,
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
  } = useHeroDemoState();

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
                        submitCommandInput();
                      }}
                    >
                      <input
                        type="text"
                        value={
                          commandMode === "search"
                            ? searchQuery
                            : commandInputValue
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
                            : isCommandFocused
                              ? "Sign in to add, this is a demo \ud83d\ude42"
                              : "Add a link or search..."
                        }
                        className="w-full bg-transparent p-0 pl-1.5 text-[11px] font-medium outline-none placeholder:text-muted-foreground selection:bg-primary/20"
                        aria-label="Search or add bookmarks"
                        readOnly={commandMode === "add"}
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
