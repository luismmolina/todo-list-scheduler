import React from "react";
import { format } from "date-fns";
import styled from "styled-components";
import { AlertCircle, Clock } from "lucide-react";

const AlertContainer = styled.div`
  background-color: ${(props) => props.theme.colors.surface};
  border-left: 4px solid ${(props) => props.theme.colors.accent};
  padding: 1rem;
  margin-bottom: 1rem;
`;

const AlertTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: ${(props) => props.theme.colors.text};
`;

const AlertDescription = styled.p`
  margin: 0;
  color: ${(props) => props.theme.colors.text};
`;

const Button = styled.button`
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.text};
  border: none;
  padding: 0.5rem 1rem;
  margin-top: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
`;

const Alert = ({ children, title, description }) => (
  <AlertContainer>
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription>{description}</AlertDescription>
    {children}
  </AlertContainer>
);

const TaskInsights = ({
  reschedulingSuggestions,
  timeBlockSummary,
  onReschedule,
}) => {
  return (
    <div>
      <h2>Task Insights</h2>

      <div>
        <h3>Rescheduling Suggestions</h3>
        {reschedulingSuggestions.map((suggestion, index) => (
          <Alert
            key={index}
            title={suggestion.task.title}
            description={`${suggestion.reason} ${suggestion.suggestion}`}
          >
            <AlertCircle size={16} />
            <Button onClick={() => onReschedule(suggestion.task.id)}>
              Reschedule
            </Button>
          </Alert>
        ))}
      </div>

      <div>
        <h3>Time Block Summary</h3>
        {timeBlockSummary.map((block, index) => (
          <div key={index}>
            <Clock size={16} />
            <span>{block.place}: </span>
            <span>
              {format(block.start, "h:mm a")} - {format(block.end, "h:mm a")}
            </span>
            <span>({block.duration} minutes)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskInsights;
