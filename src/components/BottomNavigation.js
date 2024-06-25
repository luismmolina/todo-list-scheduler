import React from "react";
import styled from "styled-components";
import { List, Calendar, PlusCircle } from "lucide-react";

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${(props) => props.theme.colors.surface};
  display: flex;
  justify-content: space-around;
  padding: 0.5rem;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
`;

const NavButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.text};
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
`;

const BottomNavigation = ({ setViewMode, setIsAddingTask }) => (
  <NavContainer>
    <NavButton onClick={() => setViewMode("list")}>
      <List />
      List
    </NavButton>
    <NavButton onClick={() => setViewMode("day")}>
      <Calendar />
      Day
    </NavButton>
    <NavButton onClick={() => setIsAddingTask(true)}>
      <PlusCircle />
      Add Task
    </NavButton>
  </NavContainer>
);

export default BottomNavigation;
