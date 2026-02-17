import { useState, useCallback } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { LogOut, Kanban, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTasks, TaskStatus, Task } from "@/hooks/useTasks";
import { KanbanColumn } from "@/components/KanbanColumn";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { AIChatbot } from "@/components/AIChatbot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fireConfetti } from "@/lib/confetti";
import { toast } from "@/hooks/use-toast";

const columns: TaskStatus[] = ["todo", "in_progress", "complete"];

export default function Board() {
  const { user, signOut } = useAuth();
  const { tasks, addTask, updateTask, deleteTask, moveTask, getTasksByStatus } = useTasks();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDialogStatus, setAddDialogStatus] = useState<TaskStatus>("todo");
  const [search, setSearch] = useState("");

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;
      const { draggableId, destination } = result;
      const newStatus = destination.droppableId as TaskStatus;
      const task = tasks.find((t) => t.id === draggableId);

      if (newStatus === "complete" && task?.status !== "complete") {
        fireConfetti();
      }

      moveTask(draggableId, newStatus, destination.index);
    },
    [tasks, moveTask]
  );

  const handleAddClick = (status: TaskStatus) => {
    setAddDialogStatus(status);
    setAddDialogOpen(true);
  };

  const handleAIAction = async (action: any) => {
    try {
      switch (action.action) {
        case "create":
          await addTask({
            title: action.title,
            description: action.description || "",
            priority: action.priority || "medium",
            status: action.status || "todo",
          });
          toast({ title: "Task created by AI", description: action.title });
          break;
        case "edit":
          if (action.taskId) {
            await updateTask(action.taskId, action.updates);
            toast({ title: "Task updated by AI" });
          }
          break;
        case "move":
          if (action.taskId) {
            const t = tasks.find((t) => t.id === action.taskId);
            if (t && action.status === "complete" && t.status !== "complete") {
              fireConfetti();
            }
            await moveTask(action.taskId, action.status, 0);
            toast({ title: "Task moved by AI" });
          }
          break;
        case "delete":
          if (action.taskId) {
            await deleteTask(action.taskId);
            toast({ title: "Task deleted by AI" });
          }
          break;
      }
    } catch (e) {
      console.error("AI action failed:", e);
    }
  };

  const filteredTasks = (status: TaskStatus) => {
    const statusTasks = getTasksByStatus(status);
    if (!search.trim()) return statusTasks;
    const q = search.toLowerCase();
    return statusTasks.filter(
      (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <Kanban className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="font-display text-xl font-bold">FlowBoard</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 pl-9 text-sm"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-primary-foreground text-xs font-semibold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:inline">{user?.email}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Board */}
      <main className="flex-1 overflow-x-auto p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-6 pb-6">
            {columns.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={filteredTasks(status)}
                onAddTask={() => handleAddClick(status)}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
              />
            ))}
          </div>
        </DragDropContext>
      </main>

      <AddTaskDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        defaultStatus={addDialogStatus}
        onAdd={addTask}
      />

      <AIChatbot tasks={tasks} onAction={handleAIAction} />
    </div>
  );
}
