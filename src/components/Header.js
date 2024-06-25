import React from "react";
import styled from "styled-components";
import { format } from "date-fns";

const HeaderContainer = styled.header`
  background-color: ${(props) => props.theme.colors.surface};
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  @media (min-width: 769px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const Button = styled.button`
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.text};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin: 0.5rem;
`;

const Header = ({
  currentTime,
  remainingTime,
  setViewMode,
  setIsAddingTask,
}) => (
  <HeaderContainer>
    <h1>Task Scheduler</h1>
    <div>
      <span>Current Time: {format(currentTime, "h:mm a")}</span>
      <span> | Remaining Time: {Math.round(remainingTime)} minutes</span>
    </div>
    <div>
      <Button onClick={() => setViewMode("list")}>List View</Button>
      <Button onClick={() => setViewMode("day")}>Day View</Button>
      <Button onClick={() => setIsAddingTask(true)}>Add Task</Button>
    </div>
  </HeaderContainer>
);

export default Header;
