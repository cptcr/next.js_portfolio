// app/api/admin/snippets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { z } from 'zod';
import { codeSnippetsService } from '@/lib/services/codeSnippets';

// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-me';

// Validation schema for code snippet creation
const createCodeSnippetSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  code: z.string().min(1, 'Code is required'),
  language: z.string().optional(),
  expiresIn: z.string().optional(), // e.g., "1h", "12h", "1d", "7d"
  isPublic: z.boolean().default(false),
  customId: z.string().optional(),
});

// Verify auth token middleware
async function verifyAuth(request: NextRequest | Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authenticated: false,
      error: 'Missing or invalid authorization header',
      userId: undefined,
    };
  }

  const token = authHeader.substring(7);
  try {
    const payload = verify(token, JWT_SECRET);
    const userId = (payload as any)?.userId;
    if (typeof userId !== 'number') {
      throw new Error('Invalid user ID in token payload');
    }

    return {
      authenticated: true,
      userId: userId,
    };
  } catch (error) {
    return { authenticated: false, error: 'Invalid or expired token', userId: undefined };
  }
}

// GET: List all code snippets for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    const includeExpired = searchParams.get('includeExpired') === 'true';

    // Get snippets from service
    const snippets = await codeSnippetsService.listCodeSnippets({
      userId: auth.userId,
      limit,
      offset,
      includeExpired,
    });

    // Return the snippets
    return NextResponse.json({ snippets });
  } catch (error) {
    console.error('Error listing code snippets:', error);
    return NextResponse.json(
      { message: 'Failed to list code snippets', error: String(error) },
      { status: 500 },
    );
  }
}

// POST: Create a new code snippet
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();

    // Validate request
    const result = createCodeSnippetSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: result.error.errors },
        { status: 400 },
      );
    }

    const { title, code, language, expiresIn, isPublic, customId } = result.data;

    // Create the code snippet
    const snippet = await codeSnippetsService.createCodeSnippet(title, code, {
      language,
      userId: auth.userId,
      expiresIn,
      isPublic,
      customId,
    });

    // Return the created code snippet
    return NextResponse.json({
      message: 'Code snippet created successfully',
      snippet,
    });
  } catch (error) {
    console.error('Error creating code snippet:', error);
    return NextResponse.json(
      { message: 'Failed to create code snippet', error: String(error) },
      { status: 500 },
    );
  }
}

// DELETE: Delete a code snippet
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== 'number') {
      return NextResponse.json({ message: 'Invalid snippet ID' }, { status: 400 });
    }

    // Delete the code snippet
    const deleted = await codeSnippetsService.deleteCodeSnippet(id, auth.userId);

    if (!deleted) {
      return NextResponse.json(
        { message: 'Code snippet not found or you do not have permission to delete it' },
        { status: 404 },
      );
    }

    // Return success
    return NextResponse.json({ message: 'Code snippet deleted successfully' });
  } catch (error) {
    console.error('Error deleting code snippet:', error);
    return NextResponse.json(
      { message: 'Failed to delete code snippet', error: String(error) },
      { status: 500 },
    );
  }
}
