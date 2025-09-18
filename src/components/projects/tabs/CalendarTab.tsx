"use client"
import TimeTable from "../ProjectTimeTable"

type CalendarTabProps = {
  projectId: number
}

const CalendarTab = ({ projectId }: CalendarTabProps) => {
  return <TimeTable projectId={projectId} />
}

export default CalendarTab
