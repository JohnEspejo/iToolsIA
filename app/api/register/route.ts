import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

// Mock storage for demo purposes
const users: any[] = [];

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Check if user already exists (in mock storage)
    const existingUser = users.find(user => user.email === email);

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (in mock storage)
    const user = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
    };

    users.push(user);

    return NextResponse.json(
      { message: 'User created successfully', user: { id: user.id, name: user.name, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Error creating user' },
      { status: 500 }
    );
  }
}