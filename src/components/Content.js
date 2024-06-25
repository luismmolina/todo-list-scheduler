import React from "react";
import styled from "styled-components";
import TaskList from "./TaskList";
import DayView from "./DayView";

const ContentContainer = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
`;

const Content = ({
  viewMode,
  tasks,
  selectedDate,
  setSelectedDate,
  deleteTask,
  completeTask,
  editTask,
  currentTime,
  openMoveTaskModal,
}) => (
  <ContentContainer>
    {viewMode === "list" ? (
      <TaskList
        tasks={tasks}
        deleteTask={deleteTask}
        completeTask={completeTask}
        editTask={editTask}
        currentTime={currentTime}
        openMoveTaskModal={openMoveTaskModal}
      />
    ) : (
      <DayView
        tasks={tasks}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        deleteTask={deleteTask}
        completeTask={completeTask}
        editTask={editTask}
        currentTime={currentTime}
        openMoveTaskModal={openMoveTaskModal}
      />
    )}
  </ContentContainer>
);

export default Content;
