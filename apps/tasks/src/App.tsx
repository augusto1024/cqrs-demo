import { useEffect, useState } from 'react';
import axios from 'axios';
import { v4 as uuid } from 'uuid';
import './App.css';

const WRITE_API_URL = 'http://localhost:4001';
const READ_API_URL = 'http://localhost:4000';

type Task = {
  id: string;
  description: string;
};

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskDescription, setTaskDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await axios.get(`${READ_API_URL}/tasks`);
      setTasks(response.data);
    };

    fetchTasks();
  }, []);

  const createTask = async () => {
    setLoading(true);

    try {
      const newTask = {
        id: uuid(),
        description: taskDescription,
      };

      await axios.post(`${WRITE_API_URL}/commands`, {
        commandType: 'create_task',
        command: newTask,
      });

      setTasks([...tasks, newTask]);
    } catch (err) {
      window.alert('Failed to create task!');
    }

    setLoading(false);
    setTaskDescription('');
  };

  const deleteTask = async (taskId: string) => {
    setLoading(true);

    try {
      await axios.post(`${WRITE_API_URL}/commands`, {
        commandType: 'delete_task',
        command: {
          id: taskId,
        },
      });
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (err) {
      window.alert('Failed to delete task!');
    }

    setLoading(false);
    setTaskDescription('');
  };

  return (
    <div className="py-20 flex flex-col w-full gap-4">
      <div className="flex justify-center">
        <div className="w-4/12 flex flex-col justify-center gap-4">
          <textarea
            value={taskDescription}
            onChange={(event) => setTaskDescription(event.target.value)}
            placeholder="Write your new task"
          />
          <button
            disabled={loading || !taskDescription}
            className="mainButton"
            onClick={createTask}
          >
            Save
          </button>
        </div>
      </div>
      <div className="flex justify-center">
        <div className="w-4/12 flex flex-col justify-center gap-4">
          {tasks.map((task) => (
            <div key={task.id} className="card">
              <p>{task.description}</p>
              <button
                onClick={() => deleteTask(task.id)}
                className="deleteButton"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
