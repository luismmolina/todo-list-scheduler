import { differenceInMinutes, addMinutes, isWithinInterval } from "date-fns";
import { getTaskRatings } from "./taskRatingSystem";

const TIME_BLOCKS = [
  { start: 8, end: 12, place: "home" },
  { start: 12, end: 13, place: "break" },
  { start: 13, end: 17, place: "work" },
  { start: 17, end: 22, place: "home" },
  { start: 22, end: 8, place: "sleep" },
];

const BUFFER_TIME = 10; // 10 minutes buffer between tasks

export class DynamicScheduler {
  constructor(tasks, currentTime) {
    this.tasks = tasks;
    this.currentTime = new Date(currentTime);
    this.schedule = [];
  }

  async optimizeSchedule() {
    // Get AI ratings for tasks
    this.tasks = await getTaskRatings(this.tasks);

    this.sortTasksByPriorityAndValue();
    this.schedule = [];
    let currentSlot = new Date(this.currentTime);

    for (let task of this.tasks) {
      if (task.status === "completed") continue;

      const slot = this.findNextSlot(currentSlot, task.duration, task.place);
      if (slot) {
        const startTime = new Date(slot);
        const endTime = addMinutes(slot, task.duration);
        this.schedule.push({
          ...task,
          startTime,
          endTime,
          status: "pending",
        });
        currentSlot = addMinutes(slot, task.duration + BUFFER_TIME);
      } else {
        task.status = "deferred";
        task.startTime = null;
        task.endTime = null;
      }
    }

    this.tasks = this.schedule.concat(
      this.tasks.filter((t) => t.status === "deferred")
    );
    return this.tasks;
  }

  async addTask(newTask) {
    this.tasks.push(newTask);
    return this.optimizeSchedule();
  }

  async completeTask(taskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      task.status = "completed";
      task.endTime = new Date();
      this.learnFromCompletion(task);
    }
    return this.optimizeSchedule();
  }

  async updateCurrentTime(newTime) {
    this.currentTime = new Date(newTime);
    return this.optimizeSchedule();
  }

  sortTasksByPriorityAndValue() {
    const priorityOrder = {
      "must do": 3,
      "should do": 2,
      "if time available": 1,
    };
    this.tasks.sort((a, b) => {
      if (a.status === "completed" && b.status !== "completed") return 1;
      if (b.status === "completed" && a.status !== "completed") return -1;
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.longTermValue - a.longTermValue;
    });
  }

  getRemainingTime() {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(22, 0, 0, 0); // Assuming the day ends at 10 PM

    if (now >= endOfDay) {
      return 0;
    }

    const scheduledTasksTime = this.schedule.reduce((total, task) => {
      if (task.startTime > now && task.startTime < endOfDay) {
        return total + task.duration;
      }
      return total;
    }, 0);

    const totalRemainingTime = differenceInMinutes(endOfDay, now);
    return Math.max(0, totalRemainingTime - scheduledTasksTime);
  }

  findNextSlot(startTime, duration, taskPlace) {
    let currentTime = new Date(startTime);
    const endOfDay = new Date(currentTime);
    endOfDay.setHours(24, 0, 0, 0);

    const isConflicting = (task) => {
      return (
        task.status !== "completed" &&
        currentTime < task.endTime &&
        addMinutes(currentTime, duration + BUFFER_TIME) > task.startTime
      );
    };

    while (currentTime < endOfDay) {
      const currentHour = currentTime.getHours();
      const slot = TIME_BLOCKS.find(
        (slot) =>
          ((currentHour >= slot.start && currentHour < slot.end) ||
            (slot.start > slot.end &&
              (currentHour >= slot.start || currentHour < slot.end))) &&
          slot.place === taskPlace
      );

      if (slot) {
        const slotEnd = new Date(currentTime);
        slotEnd.setHours(slot.end, 0, 0, 0);
        if (slot.end < slot.start) {
          slotEnd.setDate(slotEnd.getDate() + 1);
        }

        const conflictingTask = this.schedule.find(isConflicting);

        if (
          !conflictingTask &&
          differenceInMinutes(slotEnd, currentTime) >= duration + BUFFER_TIME
        ) {
          return currentTime;
        }

        if (conflictingTask) {
          currentTime = new Date(
            conflictingTask.endTime.getTime() + BUFFER_TIME * 60000
          );
        } else {
          currentTime = addMinutes(currentTime, 1);
        }
      } else {
        currentTime = addMinutes(currentTime, 60);
        currentTime.setMinutes(0, 0, 0);
      }
    }

    return null;
  }

  learnFromCompletion(task) {
    const actualDuration = differenceInMinutes(task.endTime, task.startTime);
    const durationDiff = actualDuration - task.duration;

    if (Math.abs(durationDiff) > 10) {
      // If the difference is more than 10 minutes
      const learningRate = 0.1; // 10% adjustment
      const newEstimate = task.duration + durationDiff * learningRate;

      // Find similar tasks and adjust their durations
      this.tasks
        .filter(
          (t) =>
            t.title.toLowerCase().includes(task.title.toLowerCase()) &&
            t.id !== task.id
        )
        .forEach((t) => {
          t.duration = Math.round((t.duration + newEstimate) / 2);
        });
    }
  }

  isWithinWorkingHours(startTime, endTime) {
    const workStart = new Date(startTime).setHours(8, 0, 0, 0);
    const workEnd = new Date(startTime).setHours(22, 0, 0, 0);
    return (
      isWithinInterval(startTime, { start: workStart, end: workEnd }) &&
      isWithinInterval(endTime, { start: workStart, end: workEnd })
    );
  }
}
