// app/snippets/[snippetId]/page.tsx
import { notFound } from 'next/navigation'; // Import for handling 404
// Ensure this path is correct for your project structure
import { codeSnippetsService } from '@/lib/services/codeSnippets';
import { Badge } from '@/components/ui/badge'; // Example UI component
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Example UI
// --- Import the custom CodeBlock component ---
import { CodeBlock } from '@/components/ui/code-block';
import { Clock } from 'lucide-react'; // Example icon
import { JSX } from 'react'; // Import JSX type for explicit return type

// --- Define language options and helper function here ---
// (Consider moving to a shared utils/constants file if used elsewhere)
const languageOptions = [
  { value: 'text', label: 'Plain Text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'jsx', label: 'React JSX' },
  { value: 'tsx', label: 'React TSX' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'bash', label: 'Bash' },
  { value: 'powershell', label: 'PowerShell' },
  // Add any other languages your CodeBlock supports
];

// Helper function to get the display label for a language value
const getLanguageLabel = (value: string | null): string => {
  if (!value) return 'Plain Text'; // Default label if language is null/undefined
  // Find matching language, comparing case-insensitively
  const language = languageOptions.find((opt) => opt.value.toLowerCase() === value?.toLowerCase());
  return language ? language.label : value; // Fallback to the raw value if no label found
};
// --- End of language definitions ---


// This is now an async Server Component
export default async function SnippetPage({ params }: { params: { snippetId: string } }): Promise<JSX.Element> {
  // Log entry point for diagnostics
  console.log(`PAGE /snippets/${params?.snippetId} - Page component started`);

  const snippetId = params.snippetId;

  // Basic validation
  if (!snippetId) {
    console.log("Validation Failed: Snippet ID missing in params");
    notFound(); // Trigger a 404 page
  }

  try {
    // --- Fetch snippet directly (Server Component capability) ---
    console.log(`Fetching snippet: ${snippetId} for page`);
    const snippet = await codeSnippetsService.getCodeSnippet(snippetId);
    console.log(`Fetched snippet result: ${snippet ? 'Found' : 'Not Found'}`);

    // --- Handle Not Found ---
    if (!snippet) {
      console.log(`Snippet ${snippetId} not found, triggering 404 page`);
      notFound(); // Use Next.js notFound helper
    }

    // --- Handle Expired ---
    const isExpired = snippet.expiresAt && new Date(snippet.expiresAt) < new Date();
    console.log(`Snippet expiration check: expiresAt=${snippet.expiresAt}, isExpired=${isExpired}`);
    if (isExpired) {
      console.log(`Snippet ${snippetId} expired, rendering expired message`);
      // Render a specific message for expired snippets
      return (
        <div className="container p-4 pt-12 mx-auto text-center">
          <h1 className="text-2xl font-bold text-destructive">Snippet Expired</h1>
          <p className="mt-2 text-muted-foreground">This code snippet (ID: {snippetId}) has expired and is no longer available.</p>
        </div>
      );
    }

    // --- Record View (Asynchronously) ---
    // This won't block the page rendering
    console.log(`Queueing recordView for ${snippetId}`);
    codeSnippetsService.recordView(snippetId).catch(err => {
      console.error(`Non-blocking error: Failed to record view for ${snippetId}:`, err);
    });

    // --- Render the Page using JSX ---
    console.log(`Snippet ${snippetId} is valid, rendering page`);
    return (
      // Added responsive padding
      <div className="container p-4 mx-auto mt-8 md:p-8">
        {/* Ensure card takes full width within container but has max-width */}
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            {/* Allow title to break words if very long */}
            <CardTitle className="text-2xl break-words md:text-3xl">{snippet.title || 'Untitled Snippet'}</CardTitle>
            {/* --- Improved Styling for CardDescription --- */}
            <CardDescription className="flex flex-wrap items-center pt-2 text-sm gap-x-6 gap-y-2 text-muted-foreground">
              {/* Group related items if desired, or keep as separate spans */}
              <span className="flex items-center">
                ID:&nbsp;
                <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                  {snippet.snippetId}
                </code>
              </span>
              {snippet.language && (
                 <Badge variant="secondary" className="border"> {/* Use secondary or outline */}
                    {getLanguageLabel(snippet.language)}
                 </Badge>
              )}
              <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {/* Slightly larger icon */}
                  Created: {new Date(snippet.createdAt).toLocaleString()}
              </span>
              {snippet.expiresAt && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {/* Slightly larger icon */}
                  Expires: {new Date(snippet.expiresAt).toLocaleString()}
                </span>
              )}
              <span>Views: {snippet.viewCount}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* --- Add subtle border to CodeBlock container --- */}
            <div className="overflow-hidden border rounded-md">
                 <CodeBlock language={snippet.language || 'text'} code={snippet.code} />
            </div>
          </CardContent>
        </Card>
      </div>
    );

  } catch (error: unknown) {
    console.error(`--- CATCH BLOCK ERROR rendering page for snippetId ${snippetId} ---`, error);
    // Render a generic error message on the page
    return (
       <div className="container p-4 pt-12 mx-auto text-center">
          <h1 className="text-2xl font-bold text-destructive">Server Error</h1>
          <p className="mt-2 text-muted-foreground">Could not load the snippet due to an unexpected error.</p>
          {error instanceof Error && <p className="mt-2 text-xs text-red-700">Details: {error.message}</p>}
        </div>
    );
  }
}

// Optional: Add metadata for the page title, description, etc.
export async function generateMetadata({ params }: { params: { snippetId: string } }) {
   const snippetId = params.snippetId;
   if (!snippetId) return { title: 'Invalid Snippet Request' };

  try {
    // Fetch minimal data needed for metadata, or reuse if caching is effective
    const snippet = await codeSnippetsService.getCodeSnippet(snippetId); // Consider fetching only title/expiry if possible

    // Handle not found or expired for metadata
    if (!snippet || (snippet.expiresAt && new Date(snippet.expiresAt) < new Date())) {
      return { title: 'Snippet Not Found or Expired' };
    }
    return {
      title: snippet.title || 'Code Snippet',
      description: `View the code snippet titled: ${snippet.title || snippet.snippetId}`, // More descriptive
    };
  } catch (error) {
     console.error(`Error generating metadata for snippet ${snippetId}:`, error);
    return { title: 'Error Loading Snippet' };
  }
}
