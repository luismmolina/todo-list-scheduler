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
}) => {
  const activeTasks = tasks.filter(
    (task) => task.status === "pending" || task.status === "ongoing"
  );

  console.log("Active tasks:", activeTasks); // Add this line for debugging

  return (
    <ContentContainer>
      <h2>Active Tasks</h2>
      {activeTasks.length === 0 ? (
        <p>No active tasks at the moment.</p>
      ) : viewMode === "list" ? (
        <TaskList
          tasks={activeTasks}
          deleteTask={deleteTask}
          completeTask={completeTask}
          editTask={editTask}
          currentTime={currentTime}
          openMoveTaskModal={openMoveTaskModal}
        />
      ) : (
        <DayView
          tasks={activeTasks}
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
};

export default Content;
