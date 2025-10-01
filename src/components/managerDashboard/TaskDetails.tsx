"use client"
import { X } from "lucide-react"
import Image from "next/image"

// Custom scrollbar styles
const scrollbarStyles = `
  .task-description-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  
  .task-description-scrollbar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
  }
  
  .task-description-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 10px;
  }
  
  .task-description-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
`

interface TaskDetailsPopupProps {
  onClose: () => void
  task?: any
}

const formatDuration = (start: Date, end: Date) => {
  if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) return "-"

  const diffMs = end.getTime() - start.getTime()
  if (diffMs < 0) return "-"

  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = Math.floor(diffHours / 24)

  return `${diffDays}d ${Math.floor(diffHours % 24)}h`
}


const TaskDetailsPopup: React.FC<TaskDetailsPopupProps> = ({ onClose, task }) => {

  if (!task) return null;

  // Sprint estimated time
  const sprintEstimatedTime = formatDuration(
    new Date(task.sprint?.startDate),
    new Date(task.sprint?.endDate)
  )

  // Task estimated time (using createdAt → taskDate)
  const taskEstimatedTime = formatDuration(
    new Date(task.createdAt),
    new Date(task.taskDate)
  )

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={onClose}
      style={{
        background: '#00000099',
        backdropFilter: 'blur(30px)',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />

      <div
        onClick={e => e.stopPropagation()}
        className="max-w-md w-[95%] mx-auto"
        style={{
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          padding: '42px',
          gap: '16px',
          opacity: 1,
          background: 'rgba(0, 0, 0, 0.3)',
          boxSizing: 'border-box',
        }}
      >

        {/* Flex container for Status and Ticket Info */}
        <div className="flex justify-between mb-6">

          {/* Ticket Info */}
          <div className="space-y-2 flex-shrink-0">
            <div>
              <p
                className="text-[#A4A7AE]"
                style={{
                  fontFamily: "Roboto",
                  fontWeight: 300,
                  fontStyle: "normal",
                  fontSize: "10px",
                  lineHeight: "100%",
                  letterSpacing: "0px",
                  verticalAlign: "middle",
                }}
              >
                Ticket Number
              </p>

              <p className="text-[#BDBDBD] font-medium"
                style={{
                  fontFamily: "Roboto",
                  fontWeight: 500,
                  fontSize: "22px",
                  lineHeight: "28px",
                  letterSpacing: "0px",
                  verticalAlign: "middle",
                }}
              >
                {task.ticketNumber || "-"}
              </p>
            </div>
            <div className="pt-[22px]">
              <p
                className="text-[#A4A7AE]"
                style={{
                  fontFamily: "Roboto",
                  fontWeight: 300,
                  fontStyle: "normal",
                  fontSize: "10px",
                  lineHeight: "100%",
                  letterSpacing: "0px",
                  verticalAlign: "middle",
                }}
              >
                Sprint Number
              </p>
              <p className="text-[#BDBDBD] font-medium"
                style={{
                  fontFamily: "Roboto",
                  fontWeight: 500,
                  fontSize: "22px",
                  lineHeight: "28px",
                  letterSpacing: "0px",
                  verticalAlign: "middle",
                }}>
                  {task.sprint?.name || "-"}
                </p>
            </div>
          </div>


          {/* Status badge */}
          <div className="flex-shrink-0">
            <span
              className="text-[#FFFFFF]"
              style={{
                background: "#0CA9F6",
                fontFamily: "Roboto",
                fontWeight: 400,
                fontStyle: "normal",
                fontSize: "12px",
                lineHeight: "28px",
                letterSpacing: "0px",
                borderRadius: "99px",
                padding: "0 12px",
                opacity: 1,
                width: "84px",
                height: "28px",
                textAlign: "center",
                display: "flex",         
                alignItems: "center",    
                justifyContent: "center", 
                overflow: "hidden"       
              }}
            >
              {task.status || "In progress"}
            </span>
          </div>

          
        </div>

        {/* Meta Info */}
        <div className="space-y-3 mb-6 text-[#D1D5DB]"
          style={{
            fontFamily: "Inter",
            fontWeight: 500,
            fontStyle: "Medium",
            fontSize: "18px",
            lineHeight: "20px",
            letterSpacing: "0px",
            verticalAlign: "middle",
          }}
        >
          <div className="flex items-center justify-between">
            <p >Priority</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span> 
              <span >{task.priority || "High"}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p>Due date</p>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center text-xs">
                ⭘
              </span>
              <span>{task.taskDate ? new Date(task.taskDate).toLocaleDateString() : "Yesterday"}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p>Assignee</p>
            <div className="flex items-center gap-2">
              {task.taskFor?.avatar ? (
                <img
                  src={task.taskFor.avatar}
                  alt={task.taskFor.name || "Assignee"}
                  className="rounded-full w-[19px] h-[19px]"
                />

              ) : (
                <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white">
                  {task.taskFor?.name?.charAt(0) || "M"}
                </span>
              )}
              <span>{task.taskFor?.name || "Musa Khan"}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p>Reporter</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-gray-700 rounded-sm px-1">AK</span>
              <span>{task.sprint?.createdBy?.name || "Me"}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p>Estimated time</p>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white">
                ⭘
              </span>
              <span className="text-white">{taskEstimatedTime || "0.15h (spent 0.15h)"}</span>
            </div>
          </div>
        </div>

        {/* Task Card */}
        <div
          className="w-full h-[150px] rounded-[12px] border border-white/30 px-4 py-5 flex flex-col mx-auto"
          style={{
            gap: "10px",  // Reduced gap slightly to give more space to description
            opacity: 1,
            background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7))",  // Gradient background for better contrast
            border: "1px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "inset 0 1px rgba(255, 255, 255, 0.1)" // Subtle inner shadow for depth
          }}
        >
          <div className="flex justify-between items-start pb-[8px]">
            <h4
              className="flex-1 break-words pr-2 "
              style={{
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: "20px", // Reduced from 22px
                lineHeight: "110%", // Reduced line height
                color: "#FFFFFF",
                textShadow: "0px 0px 2px rgba(0,0,0,0.8)", // Add slight shadow for better readability
                margin: "0"
              }}
            >
              {task.title || "-"}
            </h4>

            <span
              style={{
                width: 50,
                height: 15,
                borderRadius: "4px",
                padding: "0 4px",
                background: "#FF8731",
                color: "#FFFFFF",
                fontSize: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                
              }}
            >
              {task.priority || "-"}
            </span>
          </div>

          <div 
            className="flex-grow overflow-y-auto task-description-scrollbar"
            style={{
              maxHeight: "60px",  // Fixed height for scrollable area
              // marginBottom: "px",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255, 255, 255, 0.3) rgba(0, 0, 0, 0.1)",
              msOverflowStyle: "none", /* Internet Explorer 10+ */
              padding: "4px 2px",
              backgroundColor: "rgba(0, 0, 0, 0.3)", // Add slight background for better text contrast
              borderRadius: "4px",
            }}
          >
            <p
              style={{
                fontFamily: "Inter",
                fontWeight: 500,  // Increased from 400 to 500 for better visibility
                fontSize: "13px",  // Increased from 12px to 13px
                lineHeight: "160%",  // Increased line height for better readability
                letterSpacing: "0.2px", // Slight letter spacing for better readability
                color: "#FFFFFF",
                textShadow: "0px 0px 1px rgba(0,0,0,0.5)", // Subtle text shadow for better visibility
                marginBottom: "4px", // Add some space between paragraphs if there are multiple
                whiteSpace: "pre-line", // Preserve line breaks in the description
              }}
              title={task.description}
            >
              {task.description || "-"}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {task.taskFor?.avatar ? (
                <img
                  src={task.taskFor.avatar}
                  alt={task.taskFor.name || "User"}
                  className="rounded-full border-2 border-[#181c24] w-[24px] h-[24px]"
                />
              ) : (
                <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white">
                  {task.taskFor?.name?.charAt(0) || "U"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              ⏱ <span
                style={{
                  fontFamily: "Inter",
                  fontWeight: 400,
                  fontStyle: "Regular",
                  fontSize: "12px",
                  lineHeight: "100%",
                  letterSpacing: "0px",
                  verticalAlign: "middle",
                  color: "#FFFFFF"
                }}
              >
                {sprintEstimatedTime || "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPopup;
