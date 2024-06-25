import React from "react";
import styled from "styled-components";

const SidebarContainer = styled.div`
  width: 100%;
  background-color: ${(props) => props.theme.colors.surface};
  padding: 1rem;
  overflow-y: auto;
  @media (min-width: 769px) {
    width: 300px;
  }
`;

const TaskItem = styled.div`
  background-color: ${(props) => props.theme.colors.surface};
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
`;

const Button = styled.button`
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.text};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-right: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  background-color: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.text};
  border: 1px solid ${(props) => props.theme.colors.text};
  border-radius: 4px;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  background-color: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.text};
  border: 1px solid ${(props) => props.theme.colors.text};
  border-radius: 4px;
`;

const Sidebar = ({ tasks, handleMoveToNextDay, handleAdjustSchedule }) => (
  <SidebarContainer>
    <h3>Deferred Tasks</h3>
    {tasks.map((task) => (
      <TaskItem key={task.id}>
        <h4>{task.title}</h4>
        <p>
          {task.duration} minutes - {task.priority}
        </p>
        <Button onClick={() => handleMoveToNextDay(task.id)}>
          Move to Next Day
        </Button>
        <Input
          type="number"
          value={task.duration}
          onChange={(e) =>
            handleAdjustSchedule([
              { id: task.id, duration: parseInt(e.target.value) },
            ])
          }
          min="1"
        />
        <Select
          value={task.priority}
          onChange={(e) =>
            handleAdjustSchedule([{ id: task.id, priority: e.target.value }])
          }
        >
          <option value="must do">Must do</option>
          <option value="should do">Should do</option>
          <option value="if time available">If time available</option>
        </Select>
      </TaskItem>
    ))}
  </SidebarContainer>
);

export default Sidebar;
