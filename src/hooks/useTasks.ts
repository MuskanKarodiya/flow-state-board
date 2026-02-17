import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type TaskStatus = "todo" | "in_progress" | "complete";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  due_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("position", { ascending: true });

    if (!error && data) {
      setTasks(data as Task[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (task: Partial<Task>) => {
    if (!user) return null;
    const maxPos = tasks.filter((t) => t.status === (task.status || "todo")).length;
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        title: task.title || "New Task",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        progress: task.progress || 0,
        due_date: task.due_date || null,
        position: maxPos,
      })
      .select()
      .single();

    if (!error && data) {
      setTasks((prev) => [...prev, data as Task]);
      return data as Task;
    }
    return null;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const { error } = await supabase.from("tasks").update(updates).eq("id", id);
    if (!error) {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    }
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (!error) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const moveTask = async (taskId: string, newStatus: TaskStatus, newIndex: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const otherTasks = tasks.filter((t) => t.id !== taskId);
    const columnTasks = otherTasks.filter((t) => t.status === newStatus);
    columnTasks.splice(newIndex, 0, { ...task, status: newStatus });

    const updates = columnTasks.map((t, i) => ({
      id: t.id,
      status: newStatus,
      position: i,
    }));

    setTasks((prev) => {
      const updated = prev.map((t) => {
        const upd = updates.find((u) => u.id === t.id);
        if (upd) return { ...t, status: upd.status as TaskStatus, position: upd.position };
        return t;
      });
      return updated;
    });

    for (const upd of updates) {
      await supabase.from("tasks").update({ status: upd.status, position: upd.position }).eq("id", upd.id);
    }
  };

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status).sort((a, b) => a.position - b.position);

  return { tasks, loading, addTask, updateTask, deleteTask, moveTask, getTasksByStatus, fetchTasks };
}
