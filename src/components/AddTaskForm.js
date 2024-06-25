import React, { useState } from "react";
import styled from "styled-components";

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  margin-bottom: 1rem;
  padding: 0.5rem;
`;

const Select = styled.select`
  margin-bottom: 1rem;
  padding: 0.5rem;
`;

const Button = styled.button`
  padding: 0.5rem;
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.text};
  border: none;
  cursor: pointer;
`;

const AddTaskForm = ({ addTask, onCancel }) => {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(30);
  const [priority, setPriority] = useState("should do");
  const [place, setPlace] = useState("home");

  const handleSubmit = (e) => {
    e.preventDefault();
    addTask({
      id: Date.now(),
      title,
      duration: parseInt(duration),
      priority,
      place,
      status: "pending",
      startTime: null,
      endTime: null,
    });
    onCancel();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        required
      />
      <Input
        type="number"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        placeholder="Duration (minutes)"
        required
        min="1"
      />
      <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
        <option value="must do">Must do</option>
        <option value="should do">Should do</option>
        <option value="if time available">If time available</option>
      </Select>
      <Select value={place} onChange={(e) => setPlace(e.target.value)}>
        <option value="home">Home</option>
        <option value="work">Work</option>
      </Select>
      <Button type="submit">Add Task</Button>
      <Button type="button" onClick={onCancel}>
        Cancel
      </Button>
    </Form>
  );
};

export default AddTaskForm;
