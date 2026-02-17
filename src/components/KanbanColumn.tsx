import { Droppable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { Task, TaskStatus } from "@/hooks/useTasks";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";

const columnConfig: Record<TaskStatus, { title: string; dotClass: string; bgClass: string }> = {
  todo: { title: "To Do", dotClass: "bg-column-todo", bgClass: "bg-column-todo/5" },
  in_progress: { title: "In Progress", dotClass: "bg-column-progress", bgClass: "bg-column-progress/5" },
  complete: { title: "Complete", dotClass: "bg-column-complete", bgClass: "bg-column-complete/5" },
};

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onAddTask: () => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

export function KanbanColumn({ status, tasks, onAddTask, onUpdateTask, onDeleteTask }: KanbanColumnProps) {
  const config = columnConfig[status];

  return (
    <div className={`flex w-80 flex-shrink-0 flex-col rounded-xl ${config.bgClass} p-3`}>
      <div className="mb-4 flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className={`h-2.5 w-2.5 rounded-full ${config.dotClass}`} />
          <h3 className="font-display text-sm font-semibold text-foreground">{config.title}</h3>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={onAddTask}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-1 flex-col gap-3 rounded-lg p-1 transition-colors ${
              snapshot.isDraggingOver ? "bg-primary/5" : ""
            }`}
            style={{ minHeight: 100 }}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
