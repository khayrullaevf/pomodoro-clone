import { useState, useEffect } from "react";

interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: string;
  timestamp: string;
  dueDate: string;
}

interface CustomTimes {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
}

const Pomodoro: React.FC = () => {
  const [time, setTime] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [mode, setMode] = useState<string>("pomodoro");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskInput, setTaskInput] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [customTimes, setCustomTimes] = useState<CustomTimes>({ pomodoro: 25, shortBreak: 5, longBreak: 15 });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isRunning) {
      timer = setInterval(() => {
        setTime(prev => {
          if (prev > 0) return prev - 1;
          clearInterval(timer);
          setIsRunning(false);
          if (soundEnabled) new Audio("/alarm.mp3").play();
          return 0;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, soundEnabled]);

  const handleModeChange = (newMode: string) => {
    setMode(newMode);
    setIsRunning(false);
    setTime(customTimes[newMode as keyof CustomTimes] * 60);
  };

  const addTask = () => {
    if (taskInput.trim()) {
      const newTask: Task = {
        id: Date.now(),
        text: taskInput,
        completed: false,
        priority: "Medium",
        timestamp: new Date().toLocaleString(),
        dueDate: dueDate
      };
      setTasks([...tasks, newTask]);
      setTaskInput("");
      setDueDate("");
    }
  };

  const editTask = (id: number) => {
    const taskToEdit = tasks.find(task => task.id === id);
    if (taskToEdit) {
      setEditingTask(taskToEdit);
      setTaskInput(taskToEdit.text);
      setDueDate(taskToEdit.dueDate);
    }
  };

  const saveTask = () => {
    if (editingTask) {
      setTasks(tasks.map(task => task.id === editingTask.id ? { ...task, text: taskInput, dueDate: dueDate } : task));
      setEditingTask(null);
      setTaskInput("");
      setDueDate("");
    }
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleTaskCompletion = (id: number) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  };

  return (
    <div className={`flex flex-col items-center justify-center h-screen ${mode === 'pomodoro' ? 'bg-red-500' : mode === 'shortBreak' ? 'bg-green-500' : 'bg-blue-500'} text-white`}>
      <div className="flex gap-4 mb-8">
        <button onClick={() => handleModeChange("pomodoro")} className={`px-4 py-2 rounded ${mode === 'pomodoro' ? 'bg-red-600 text-white' : ''}`}>Pomodoro</button>
        <button onClick={() => handleModeChange("shortBreak")} className={`px-4 py-2 rounded ${mode === 'shortBreak' ? 'bg-green-600 text-white' : ''}`}>Short Break</button>
        <button onClick={() => handleModeChange("longBreak")} className={`px-4 py-2 rounded ${mode === 'longBreak' ? 'bg-blue-600 text-white' : ''}`}>Long Break</button>
      </div>
      
      <h1 className="text-6xl font-bold">{Math.floor(time / 60)}:{String(time % 60).padStart(2, "0")}</h1>
      <button onClick={() => setIsRunning(!isRunning)} className="mt-4 px-6 py-3 bg-white text-gray-600 rounded text-2xl">
        {isRunning ? "Pause" : "Start"}
      </button>
      
      <div className="mt-6 w-96">
        <input 
          type="text" 
          value={taskInput} 
          onChange={(e) => setTaskInput(e.target.value)} 
          className="w-full p-2 border rounded"
          placeholder="Add a new task..."
        />
        <input 
          type="datetime-local" 
          value={dueDate} 
          onChange={(e) => setDueDate(e.target.value)} 
          className="w-full p-2 border rounded mt-2"
        />
        {editingTask ? (
          <button onClick={saveTask} className="w-full mt-2 p-2 bg-yellow-600 text-white rounded">Save Task</button>
        ) : (
          <button onClick={addTask} className="w-full mt-2 p-2 bg-blue-600 text-white rounded">Add Task</button>
        )}
      </div>
      
      <ul className="mt-4 w-96">
        {tasks.map(task => (
          <li key={task.id} className="flex items-center justify-between p-2 border-b">
            <div>
              <span className={task.completed ? "line-through" : ""}>{task.text}</span>
              <div className="text-sm text-gray-300">Due: {task.dueDate}</div>
            </div>
            <div>
              <button onClick={() => toggleTaskCompletion(task.id)} className="px-2 py-1  text-white rounded mr-2">
                {task.completed ? "Undo" : "Done"}
              </button>
              <button onClick={() => editTask(task.id)} className="px-2 py-1  text-white rounded mr-2">Edit</button>
              <button onClick={() => deleteTask(task.id)} className="px-2 py-1 text-white rounded">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Pomodoro;
