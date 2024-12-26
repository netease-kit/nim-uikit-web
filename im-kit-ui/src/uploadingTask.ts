type Task = {
  abort: () => void
  [key: string]: any
}

const taskMap = new Map<string, Task>()

export const addTask = (id: string, task: Task): void => {
  taskMap.set(id, task)
}

export const removeTask = (id): boolean => {
  return taskMap.delete(id)
}

export const abortTask = (id: string): void => {
  const task = taskMap.get(id)

  if (task) {
    task.abort()
    removeTask(id)
  }
}
