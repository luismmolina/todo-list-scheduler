import React from "react";
import styled from "styled-components";
import { format } from "date-fns";
import { AlertCircle, Clock, Star, TrendingUp, Activity } from "lucide-react";

const InsightsContainer = styled.div`
  background-color: ${(props) => props.theme.colors.surface};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const InsightSection = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  color: ${(props) => props.theme.colors.text};
  margin-bottom: 1rem;
`;

const AlertContainer = styled.div`
  background-color: ${(props) => props.theme.colors.background};
  border-left: 4px solid ${(props) => props.theme.colors.accent};
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
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

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
`;

const TimeBlock = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const IconWrapper = styled.span`
  margin-right: 0.5rem;
  display: inline-flex;
  align-items: center;
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
      <InsightSection>
        <SectionTitle>Task Ratings</SectionTitle>
        {tasks.map((task, index) => (
          <AlertContainer key={index}>
            <AlertTitle>{task.title}</AlertTitle>
            <AlertDescription>
              Long-term value: {task.longTermValue}/10
            </AlertDescription>
            <RatingContainer>
              <IconWrapper>
                <Star size={16} />
              </IconWrapper>
              <span>{task.rationale}</span>
            </RatingContainer>
          </AlertContainer>
        ))}
      </InsightSection>

      <InsightSection>
        <SectionTitle>Rescheduling Suggestions</SectionTitle>
        {reschedulingSuggestions.map((suggestion, index) => (
          <AlertContainer key={index}>
            <AlertTitle>{suggestion.task.title}</AlertTitle>
            <AlertDescription>
              {suggestion.reason} {suggestion.suggestion}
            </AlertDescription>
            <IconWrapper>
              <AlertCircle size={16} />
            </IconWrapper>
            <Button onClick={() => onReschedule(suggestion.task.id)}>
              Reschedule
            </Button>
          </AlertContainer>
        ))}
      </InsightSection>

      <InsightSection>
        <SectionTitle>Time Block Summary</SectionTitle>
        {timeBlockSummary.map((block, index) => (
          <TimeBlock key={index}>
            <IconWrapper>
              <Clock size={16} />
            </IconWrapper>
            <span>{block.place}: </span>
            <span>
              {format(block.start, "h:mm a")} - {format(block.end, "h:mm a")}
            </span>
            <span> ({block.duration} minutes)</span>
          </TimeBlock>
        ))}
      </InsightSection>

      {productivityInsights && (
        <InsightSection>
          <SectionTitle>Productivity Insights</SectionTitle>
          {productivityInsights.patterns.map((pattern, index) => (
            <AlertContainer key={index}>
              <AlertTitle>Pattern {index + 1}</AlertTitle>
              <AlertDescription>{pattern}</AlertDescription>
              <IconWrapper>
                <TrendingUp size={16} />
              </IconWrapper>
            </AlertContainer>
          ))}
          {productivityInsights.recommendations.map((recommendation, index) => (
            <AlertContainer key={index}>
              <AlertTitle>Recommendation {index + 1}</AlertTitle>
              <AlertDescription>{recommendation}</AlertDescription>
              <IconWrapper>
                <Activity size={16} />
              </IconWrapper>
            </AlertContainer>
          ))}
        </InsightSection>
      )}
    </InsightsContainer>
  );
};

export default TaskInsights;
