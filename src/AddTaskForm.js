import React, { useState } from "react";

const AddTaskForm = ({ addTask }) => {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [place, setPlace] = useState("home");
  const [priority, setPriority] = useState("should do");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !duration) return;

    addTask({
      id: Date.now(),
      title,
      duration: parseInt(duration),
      place,
      priority,
      status: "pending",
    });

    // Reset form
    setTitle("");
    setDuration("");
    setPlace("home");
    setPriority("should do");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        required
      />
      <input
        type="number"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        placeholder="Duration (minutes)"
        required
      />
      <select value={place} onChange={(e) => setPlace(e.target.value)}>
        <option value="home">Home</option>
        <option value="work">Work</option>
      </select>
      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
        <option value="must do">Must do</option>
        <option value="should do">Should do</option>
        <option value="if time available">If time available</option>
      </select>
      <button type="submit">Add Task</button>
    </form>
  );
};

export default AddTaskForm;
