"use client"
import TimeTable from "../ProjectTimeTable"


type CalendarTabProps = {
  projectId: number;
  projectName?: string;
}

const CalendarTab = ({ projectId, projectName }: CalendarTabProps) => {
  return <TimeTable projectId={projectId} projectName={projectName} />
}

export default CalendarTab
