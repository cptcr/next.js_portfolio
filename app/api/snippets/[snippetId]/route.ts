// app/snippets/[snippetId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
// Ensure this path is correct for your project structure
import { codeSnippetsService } from '@/lib/services/codeSnippets';

export async function GET(
  request: NextRequest,
  // Using 'context' which contains 'params' is a common pattern
  context: { params: { snippetId: string } },
) {
  try {
    // --- FIX 1: Direct access to params property ---
    // Directly access snippetId from context.params instead of destructuring,
    // in case destructuring causes issues with the Next.js version/features used.
    const snippetId = context.params.snippetId;

    // --- Basic validation ---
    if (!snippetId) {
      // Return a clear JSON error response
      return NextResponse.json({ message: 'Snippet ID parameter is missing' }, { status: 400 });
    }

    // --- Fetch snippet ---
    const snippet = await codeSnippetsService.getCodeSnippet(snippetId);

    // --- Handle Not Found ---
    if (!snippet) {
      return NextResponse.json(
        { message: `Code snippet '${snippetId}' not found` },
        { status: 404 },
      );
    }

    // --- Handle Expired ---
    if (snippet.expiresAt && new Date(snippet.expiresAt) < new Date()) {
      return NextResponse.json({ message: 'This code snippet has expired' }, { status: 410 }); // 410 Gone
    }

    // --- Record View (Asynchronously) ---
    // This runs in the background and doesn't block the response
    codeSnippetsService.recordView(snippetId).catch((err) => {
      console.error(`Non-blocking error: Failed to record view for ${snippetId}:`, err);
    });

    // --- FIX 2: Always return JSON on success (No NextResponse.next()) ---
    // Removed the Accept header check and NextResponse.next().
    // This API route's purpose is to return snippet data.
    return NextResponse.json(
      {
        // Selectively return fields needed by the client
        id: snippet.id,
        snippetId: snippet.snippetId,
        title: snippet.title,
        code: snippet.code,
        language: snippet.language,
        createdAt: snippet.createdAt,
        expiresAt: snippet.expiresAt,
        viewCount: snippet.viewCount, // Return the count *before* the async increment
      },
      { status: 200 },
    ); // OK status
  } catch (error: unknown) {
    // Catch unknown for robust error handling
    console.error(`Error fetching code snippet ${context?.params?.snippetId}:`, error);

    const message = error instanceof Error ? error.message : 'An unexpected error occurred';

    // Return a generic JSON error response
    return NextResponse.json({ message: 'Internal Server Error', error: message }, { status: 500 });
  }
}
