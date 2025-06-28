interface AssignTaskModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: () => void;
  task: Task;
  setTask: (task: Task) => void;
  getUserStatusIcon: (status: string) => React.ReactElement;
  projectId?: string | number; // Allow both string and number
} 