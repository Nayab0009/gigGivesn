import { NextRequest, NextResponse } from 'next/server';

interface TaskData {
  title: string;
  description: string;
  taskFor: number;
  taskOf: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: TaskData = await request.json();
    
    // Validate required fields
    if (!body.title || !body.description || body.taskFor === undefined || body.taskOf === undefined) {
      return NextResponse.json(
        { 
          statusCode: 400, 
          message: "Missing required fields: title, description, taskFor, taskOf" 
        },
        { status: 400 }
      );
    }

    // Validate data types
    if (typeof body.title !== 'string' || 
        typeof body.description !== 'string' || 
        typeof body.taskFor !== 'number' || 
        typeof body.taskOf !== 'number') {
      return NextResponse.json(
        { 
          statusCode: 400, 
          message: "Invalid data types. Expected: title (string), description (string), taskFor (number), taskOf (number)" 
        },
        { status: 400 }
      );
    }

    // Here you would typically save the task to your database
    // For now, we'll just return a success response
    const newTask = {
      id: Date.now().toString(), // Generate a temporary ID
      title: body.title,
      description: body.description,
      taskFor: body.taskFor,
      taskOf: body.taskOf,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // TODO: Add your database logic here
    // Example with Prisma:
    // const task = await prisma.task.create({
    //   data: {
    //     title: body.title,
    //     description: body.description,
    //     taskFor: body.taskFor,
    //     taskOf: body.taskOf,
    //     status: 'pending'
    //   }
    // });

    console.log('Task created:', newTask);

    return NextResponse.json(
      { 
        statusCode: 201, 
        message: "Task created successfully",
        data: newTask
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { 
        statusCode: 500, 
        message: "Internal server error while creating task" 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // TODO: Add your database logic here to fetch tasks
    // Example with Prisma:
    // const tasks = await prisma.task.findMany();
    
    return NextResponse.json(
      { 
        statusCode: 200, 
        message: "Tasks retrieved successfully",
        data: [] // Return empty array for now
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { 
        statusCode: 500, 
        message: "Internal server error while fetching tasks" 
      },
      { status: 500 }
    );
  }
} 