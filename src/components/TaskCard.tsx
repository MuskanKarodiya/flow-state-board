import { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Calendar, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { Task, TaskPriority } from "@/hooks/useTasks";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditTaskDialog } from "./EditTaskDialog";

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  high: { label: "High", className: "bg-priority-high/15 text-priority-high border-priority-high/30" },
  medium: { label: "Medium", className: "bg-priority-medium/15 text-priority-medium border-priority-medium/30" },
  low: { label: "Low", className: "bg-priority-low/15 text-priority-low border-priority-low/30" },
};

interface TaskCardProps {
  task: Task;
  index: number;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, index, onUpdate, onDelete }: TaskCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const priority = priorityConfig[task.priority];

  return (
    <>
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`group rounded-lg bg-card p-4 transition-all duration-200 ${
              snapshot.isDragging
                ? "card-shadow-hover rotate-2 scale-105"
                : "card-shadow hover:card-shadow-hover"
            }`}
          >
            <div className="mb-3 flex items-start justify-between">
              <Badge variant="outline" className={`text-xs font-medium ${priority.className}`}>
                {priority.label}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(task.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <h4 className="mb-1.5 font-display text-sm font-semibold leading-tight text-foreground">
              {task.title}
            </h4>
            {task.description && (
              <p className="mb-3 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span className="font-medium">{task.progress}%</span>
            </div>
            <Progress value={task.progress} className="h-1.5" />

            {task.due_date && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{new Date(task.due_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        )}
      </Draggable>

      <EditTaskDialog
        task={task}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={(updates) => {
          onUpdate(task.id, updates);
          setEditOpen(false);
        }}
      />
    </>
  );
}
