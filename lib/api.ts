import {
  Task,
  TaskCreateInput,
  TaskUpdateInput,
  TasksResponse,
  TaskFilters,
} from "./types";

const API_BASE = "/api";

export async function fetchTasks(
  page: number = 1,
  limit: number = 10,
  filters: TaskFilters = {}
): Promise<TasksResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters.status && filters.status !== "ALL") {
    params.set("status", filters.status);
  }
  if (filters.search) {
    params.set("search", filters.search);
  }
  if (filters.sortBy) {
    params.set("sortBy", filters.sortBy);
  }
  if (filters.sortOrder) {
    params.set("sortOrder", filters.sortOrder);
  }
  if (filters.priority && filters.priority !== "ALL") {
    params.set("priority", filters.priority);
  }

  const response = await fetch(`${API_BASE}/tasks?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch tasks");
  }

  return response.json();
}

export async function createTask(data: TaskCreateInput): Promise<Task> {
  const response = await fetch(`${API_BASE}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create task");
  }

  const result = await response.json();
  return result.task;
}

export async function getTask(id: string): Promise<Task> {
  const response = await fetch(`${API_BASE}/tasks/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get task");
  }

  const result = await response.json();
  return result.task;
}

export async function updateTask(
  id: string,
  data: TaskUpdateInput
): Promise<Task> {
  const response = await fetch(`${API_BASE}/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update task");
  }

  const result = await response.json();
  return result.task;
}

export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/tasks/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete task");
  }
}

export async function toggleTaskStatus(id: string): Promise<Task> {
  const response = await fetch(`${API_BASE}/tasks/${id}/toggle`, {
    method: "POST",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to toggle task status");
  }

  const result = await response.json();
  return result.task;
}
