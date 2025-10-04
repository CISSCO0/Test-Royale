import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeEditorDisplayProps {
  code: string
}

interface CodeEditorDisplayProps {
  code: string
}const javaCode = `public class Calculator {

    // Adds two numbers
    public int add(int a, int b) {
        return a + b;
    }

    // Subtracts two numbers
    public int subtract(int a, int b) {
        return a - b;
    }

    // Multiplies two numbers
    public int multiply(int a, int b) {
        return a * b;
    }

    // Divides two numbers, returns 0 if divisor is 0
    public int divide(int a, int b) {
        if (b == 0) {
            return 0;
        }
        return a / b;
    }

    // Checks if a number is even
    public boolean isEven(int n) {
        return n % 2 == 0;
    }
}`


export function CodeEditorDisplay({ code }: { code: string }) {
  const lines = code.split("\n")

  return (
    <div className="bg-card rounded-lg border-2 border-border overflow-hidden font-mono text-sm">
      <SyntaxHighlighter language="java" style={oneDark} showLineNumbers>
        {javaCode}
      </SyntaxHighlighter>
      {/* {lines.map((line, index) => (
        <div key={index} className="flex">
          <span className="inline-block w-12 text-center text-muted-foreground bg-secondary border-r border-border select-none">
            {index + 1}
          </span>
          <pre className="flex-1 px-4 py-1">
            <code>{line}</code>
          </pre>
        </div>
      ))} */}
    </div>
  )
}


// Escape HTML to prevent nested spans breaking the layout
function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

// Simple syntax highlighter (safe)
function highlightSyntaxSafe(line: string): string {
  let escaped = escapeHtml(line)

  // Highlight keywords
  escaped = escaped.replace(
    /\b(function|return|assert|const|let|var|if|else|for|while|class|def)\b/g,
    '<span class="text-orange-400">$1</span>'
  )

  // Highlight function names (followed by '(')
  escaped = escaped.replace(
    /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g,
    '<span class="text-yellow-300">$1</span>'
  )

  // Highlight numbers
  escaped = escaped.replace(/\b(\d+)\b/g, '<span class="text-orange-300">$1</span>')

  // Highlight operators
  escaped = escaped.replace(/([+\-=<>!])/g, '<span class="text-orange-300">$1</span>')

  return escaped
}
