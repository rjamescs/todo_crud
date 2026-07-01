import { useState, useEffect } from "react";

export default function TodoCRUDApp() {
    const [todos, setTodos] = useState(() => {
        const saved = localStorage.getItem("todos");
        return saved ? JSON.parse(saved) : [];
    });
    const [title, setTitle] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState("");

    useEffect(() => {
        localStorage.setItem("todos", JSON.stringify(todos));
    }, [todos]);

    const addTodo = () => {
        if (!title.trim()) return;

        const newTodo = {
            id: Date.now(),
            title,
            completed: false,
            createdAt: new Date().toLocaleString(),
        };

        setTodos([newTodo, ...todos]);
        setTitle("");
    };

    const deleteTodo = (id) => {
        setTodos(todos.filter((todo) => todo.id !== id));
    };

    const toggleComplete = (id) => {
        setTodos(
            todos.map((todo) =>
                todo.id === id
                    ? { ...todo, completed: !todo.completed }
                    : todo
            )
        );
    };

    const startEdit = (todo) => {
        setEditingId(todo.id);
        setEditingText(todo.title);
    };

    const saveEdit = (id) => {
        if (!editingText.trim()) return;

        setTodos(
            todos.map((todo) =>
                todo.id === id
                    ? { ...todo, title: editingText }
                    : todo
            )
        );

        setEditingId(null);
        setEditingText("");
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold mb-2" data-testid="header">Todo CRUD App</h1>
                    <p className="text-gray-500" data-testid="subHeader">
                        Create, edit, complete, and delete todos.
                    </p>
                </div>

                <div className="flex gap-3 mb-8">
                    <input
                        type="text"
                        placeholder="Add a new todo..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                        className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                        data-testid="todoInput"
                    />

                    <button
                        onClick={addTodo}
                        className="px-6 py-3 rounded-2xl bg-black text-white font-medium hover:opacity-90 transition"
                        data-testid="addTodoButton"
                    >
                        Add
                    </button>
                </div>

                <div className="space-y-4">
                    {todos.length === 0 && (
                        <div className="text-center text-gray-400 py-12 border rounded-2xl" data-testid="defaultEmpty">
                            No todos yet.
                        </div>
                    )}

                    {todos.map((todo) => (
                        <div
                            key={todo.id}
                            className="border rounded-2xl p-4 flex items-start justify-between gap-4"
                            data-testid='todoItem'
                        >
                            <div className="flex items-start gap-3 flex-1">
                                <input
                                    type="checkbox"
                                    checked={todo.completed}
                                    onChange={() => toggleComplete(todo.id)}
                                    className="mt-1 w-5 h-5"
                                    data-testid='todoItemCheckbox'
                                />

                                <div className="flex-1">
                                    {editingId === todo.id ? (
                                        <div className="flex gap-2">
                                            <input
                                                value={editingText}
                                                onChange={(e) => setEditingText(e.target.value)}
                                                className="flex-1 border rounded-xl px-3 py-2"
                                                data-testid='todoEditInput'
                                            />

                                            <button
                                                onClick={() => saveEdit(todo.id)}
                                                className="px-4 py-2 rounded-xl bg-green-600 text-white"
                                                data-testid='saveEditButton'
                                            >
                                                Save
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <h2
                                                className={`text-lg font-medium ${
                                                    todo.completed
                                                        ? 'line-through text-gray-400'
                                                        : 'text-black'
                                                }`}
                                                data-testid='todoItemHeading'
                                            >
                                                {todo.title}
                                            </h2>

                                            <p className="text-sm text-gray-400 mt-1" data-testid='createdAt'>
                                                Created: {todo.createdAt}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {editingId !== todo.id && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => startEdit(todo)}
                                        className="px-4 py-2 rounded-xl border hover:bg-gray-100"
                                        data-testid="todoItemEditButton"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => deleteTodo(todo.id)}
                                        className="px-4 py-2 rounded-xl bg-red-500 text-white hover:opacity-90"
                                        data-testid='todoItemDeleteButton'
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
