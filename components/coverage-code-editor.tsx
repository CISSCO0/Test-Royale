"use client"

import React from "react"
import CodeMirror from "@uiw/react-codemirror"
import { java } from "@codemirror/lang-java"
import { oneDark } from "@codemirror/theme-one-dark"
import { EditorView } from "@codemirror/view"
import { RangeSetBuilder } from "@codemirror/state"
import { Decoration, DecorationSet, ViewPlugin, ViewUpdate } from "@codemirror/view"

interface CoverageCodeEditorProps {
  value: string
  coveredLines: number[]
  onChange?: (value: string) => void
  editable?: boolean
}

// Create line decorations for covered lines
const coverageHighlighter = (coveredLines: number[]) => {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet

      constructor(view: EditorView) {
        this.decorations = this.createDecorations(view, coveredLines)
      }

      update(update: ViewUpdate) {
        if (update.docChanged || coveredLines !== (this as any).lastCoveredLines) {
          this.decorations = this.createDecorations(update.view, coveredLines)
          ;(this as any).lastCoveredLines = coveredLines
        }
      }

      createDecorations(view: EditorView, coveredLines: number[]) {
        const builder = new RangeSetBuilder<Decoration>()
        
        for (const lineNumber of coveredLines) {
          if (lineNumber <= view.state.doc.lines) {
            const line = view.state.doc.line(lineNumber)
            // Add green background for covered lines
            const coveredDecoration = Decoration.line({
              attributes: { 
                class: 'bg-green-500/20 border-l-4 border-l-green-500'
              }
            })
            builder.add(line.from, line.from, coveredDecoration)
          }
        }
        
        return builder.finish()
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  )
}

export function CoverageCodeEditor({ value, coveredLines, onChange, editable = false }: CoverageCodeEditorProps) {
  const extensions = [
    java(),
    coverageHighlighter(coveredLines),
    EditorView.theme({
      ".cm-line": {
        paddingLeft: "8px",
      },
    })
  ]

  return (
    <div className="h-full bg-slate-950 relative">
      {/* Coverage Legend */}
      <div className="absolute top-2 right-2 z-10 flex gap-2 text-xs">
        <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded border border-green-500/30">
          <div className="w-2 h-2 bg-green-500 rounded"></div>
          <span className="text-green-300">Covered</span>
        </div>
      </div>
      
      <CodeMirror
        value={value}
        height="100%"
        theme={oneDark}
        extensions={extensions}
        editable={editable}
        onChange={onChange}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          foldGutter: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          autocompletion: true,
          closeBrackets: true,
        }}
        style={{
          fontSize: '15px',
          lineHeight: '1.6',
          height: '100%',
          width: '100%',
        }}
      />
    </div>
  )
}