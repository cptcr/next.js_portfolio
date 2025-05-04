// components/ui/code-block.tsx
'use client'; // This component uses hooks, needs to be a client component

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// Choose a style. You can explore different styles from 'react-syntax-highlighter/dist/esm/styles/prism'
// Example: okaidia, tomorrow, vs, materialDark, etc.
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Dark theme example
// Or for a light theme: import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button'; // For copy button
import { Copy, Check } from 'lucide-react'; // Icons for copy button
import { useState, useEffect } from 'react'; // Need useEffect for theme detection potentially
import { useToast } from '@/components/ui/use-toast'; // Optional: For copy feedback
import { useTheme } from 'next-themes'; // Optional: For theme-aware styling

interface CodeBlockProps {
  language: string;
  code: string;
  className?: string; // Allow passing additional classes
}

export function CodeBlock({ language, code, className = '' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast(); // Optional toast feedback
  const { resolvedTheme } = useTheme(); // Get current theme (light/dark)

  // Choose highlighter style based on theme (optional)
  // Note: You might need to install more themes if you want different light/dark ones
  const highlighterStyle = resolvedTheme === 'dark' ? vscDarkPlus : vscDarkPlus; // Using same for demo, replace second one if needed

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(
      () => {
        setCopied(true);
        toast({
          // Optional feedback
          description: 'Code copied to clipboard!',
        });
        setTimeout(() => setCopied(false), 2000); // Reset icon after 2 seconds
      },
      (err) => {
        console.error('Failed to copy code: ', err);
        toast({
          // Optional feedback
          variant: 'destructive',
          description: 'Failed to copy code.',
        });
      },
    );
  };

  // Map common language aliases if needed (e.g., js -> javascript)
  const mapLanguage = (lang: string): string => {
    const lowerLang = lang?.toLowerCase() || 'text';
    switch (lowerLang) {
      case 'js':
        return 'javascript';
      case 'ts':
        return 'typescript';
      case 'py':
        return 'python';
      // Add more aliases as needed
      default:
        return lowerLang;
    }
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Copy Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute z-10 transition-opacity opacity-0 top-2 right-2 h-7 w-7 group-hover:opacity-100 bg-background/80 hover:bg-background"
        onClick={handleCopy}
        aria-label="Copy code"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4 text-muted-foreground" />
        )}
      </Button>

      {/* Syntax Highlighter */}
      <SyntaxHighlighter
        language={mapLanguage(language)} // Use mapped language
        style={highlighterStyle} // Apply the chosen theme style
        showLineNumbers // Optional: display line numbers
        wrapLines // Optional: wrap long lines
        customStyle={{
          borderRadius: '0.375rem', // Equivalent to rounded-md
          padding: '1rem', // Equivalent to p-4
          margin: 0, // Remove default margins if any
          fontSize: '0.875rem', // text-sm
          // Add any other custom styles if needed
        }}
        codeTagProps={{
          style: {
            // Ensure code tag uses a common monospace font
            fontFamily:
              'var(--font-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
