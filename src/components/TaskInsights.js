import React from "react";
import styled from "styled-components";

const InsightsContainer = styled.div`
  padding: 20px;
  background-color: ${(props) => props.theme.colors.background};
  border-left: 1px solid ${(props) => props.theme.colors.border};
  overflow-y: auto;
  width: 300px;
`;

const InsightSection = styled.div`
  margin-bottom: 20px;
`;

const InsightTitle = styled.h3`
  color: ${(props) => props.theme.colors.primary};
  margin-bottom: 10px;
`;

const InsightItem = styled.div`
  margin-bottom: 10px;
`;

const SuggestionButton = styled.button`
  background-color: ${(props) => props.theme.colors.secondary};
  color: ${(props) => props.theme.colors.text};
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 5px;
`;

const TaskInsights = ({
  tasks,
  reschedulingSuggestions,
  timeBlockSummary,
  onReschedule,
  productivityInsights,
}) => {
  return (
    <InsightsContainer>
      {productivityInsights && (
        <InsightSection>
          <InsightTitle>Productivity Insights</InsightTitle>
          <InsightItem>
            Most Productive Day:{" "}
            {productivityInsights.mostProductiveDay || "N/A"}
          </InsightItem>
          <InsightItem>
            Least Productive Day:{" "}
            {productivityInsights.leastProductiveDay || "N/A"}
          </InsightItem>
          <InsightItem>
            Most Productive Time:{" "}
            {productivityInsights.mostProductiveTimeOfDay || "N/A"}
          </InsightItem>
          <InsightItem>
            Task Completion Rate:{" "}
            {productivityInsights.taskCompletionRate.toFixed(2)}%
          </InsightItem>
          <InsightItem>
            Average Task Duration:{" "}
            {productivityInsights.averageTaskDuration.toFixed(2)} minutes
          </InsightItem>
        </InsightSection>
      )}

      {reschedulingSuggestions.length > 0 && (
        <InsightSection>
          <InsightTitle>Rescheduling Suggestions</InsightTitle>
          {reschedulingSuggestions.map((suggestion, index) => (
            <InsightItem key={index}>
              <div>{suggestion.task.title}</div>
              <div>{suggestion.reason}</div>
              <div>{suggestion.suggestion}</div>
              <SuggestionButton
                onClick={() => onReschedule(suggestion.task.id)}
              >
                Reschedule
              </SuggestionButton>
            </InsightItem>
          ))}
        </InsightSection>
      )}

      {timeBlockSummary.length > 0 && (
        <InsightSection>
          <InsightTitle>Time Block Summary</InsightTitle>
          {timeBlockSummary.map((block, index) => (
            <InsightItem key={index}>
              <div>Location: {block.place}</div>
              <div>Start: {block.start.toLocaleTimeString()}</div>
              <div>End: {block.end.toLocaleTimeString()}</div>
              <div>Duration: {block.duration} minutes</div>
            </InsightItem>
          ))}
        </InsightSection>
      )}

      {tasks.length === 0 && (
        <InsightSection>
          <InsightTitle>No Tasks</InsightTitle>
          <InsightItem>
            You have no tasks scheduled. Add some tasks to get started!
          </InsightItem>
        </InsightSection>
      )}
    </InsightsContainer>
  );
};

export default TaskInsights;
