/**
 * Reducer 와 Context 사용하기
 * 문제상황 - props 로 상태를 계속 내려서 불편하다. (props drilling)
 * 
 * 1. 컨텍스트를 만든다. - state 와 dispatch 컨텍스트를 각각 만든다.
 * 2. 컨텍스트를 제공한다.
 * 3. useContext 를 이용해 state 와 dispatch 를 사용한다.
 * 
 * 컨텍스트 파일로 useReducer 를 이동시켜 커스텀 Provider 를 만든다.
 */
import { useReducer, createContext, useContext, useState } from "react";

export function TaskApp() {
  return (
    <TasksProvider>
      <h1>Day off in Kyoto</h1>
      <AddTask />
      <TaskList />
    </TasksProvider>
  )
}

// Context
const TasksContext = createContext(null);
const TasksDispatchContext = createContext(null);
function useTasks () { return useContext(TasksContext); }
function useTasksDispatch() { return useContext(TasksDispatchContext); }

// Reducer
const tasksReducer = function(tasks, action) {
  switch (action.type) {
    case 'added': {
      return [...tasks, {
        id: action.id,
        text: action.text,
        done: false,
      }];
    } case 'changed': {
      return tasks.map(task => task.id === action.task.id ? action.task : task);
    } case 'deleted': {
      return tasks.filter(task => task.id !== action.task.id);
    } default: {
      throw Error(`Unknown action: ${action.type}`);
    }
  }
}

const initialTasks = [
  { id: 0, text: 'Philosopher’s Path', done: true },
  { id: 1, text: 'Visit the temple', done: false },
  { id: 2, text: 'Drink matcha', done: false }
];

function TasksProvider({ children }) {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);
  
  return (
    <TasksContext.Provider value={tasks}>
      <TasksDispatchContext.Provider value={dispatch}>
        {children}
      </TasksDispatchContext.Provider>
    </TasksContext.Provider>
  )
}

let nextId = 4;
function AddTask() {
  const [text, setText] = useState('');
  const dispatch = useTasksDispatch();
  
  function handleAdd() {
    dispatch({ type: 'added', id: nextId++, text: text})
  }

  return (
    <>
      <input placeholder="Add task" value={text} onChange={e => setText(e.target.value)}/>
      <button onClick={handleAdd}>Add</button>
    </>
  )
}

function TaskList() {
  const tasks = useTasks();

  return (
    <ul>
      {tasks.map(task => (
        <li key={task.id}>
          <Task task={task} />
        </li>
      ))}
    </ul>
  )
}

function Task({ task }) {
  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useTasksDispatch();
  let taskContent;
  if (isEditing) {
    taskContent = (
      <>
        <input
          value={task.text}
          onChange={e => {
            dispatch({
              type: 'changed',
              task: {
                ...task,
                text: e.target.value
              }
            });
          }} />
        <button onClick={() => setIsEditing(false)}>
          Save
        </button>
      </>
    );
  } else {
    taskContent = (
      <>
        {task.text}
        <button onClick={() => setIsEditing(true)}>
          Edit
        </button>
      </>
    );
  }
  return (
    <label>
      <input
        type="checkbox"
        checked={task.done}
        onChange={e => {
          dispatch({
            type: 'changed',
            task: {
              ...task,
              done: e.target.checked
            }
          });
        }}
      />
      {taskContent}
      <button onClick={() => {
        dispatch({
          type: 'deleted',
          id: task.id
        });
      }}>
        Delete
      </button>
    </label>
  );
}