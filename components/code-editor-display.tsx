"use client"

import React, { useMemo } from "react"
import CodeMirror from "@uiw/react-codemirror"
import { cpp } from "@codemirror/lang-cpp"
import { oneDark } from "@codemirror/theme-one-dark"
import { EditorView, Decoration } from "@codemirror/view"
import { StateField, RangeSet } from "@codemirror/state"


interface CodeEditorDisplayProps {
  id: string  // ✅ ADD THIS
  value: string
  onChange?: (value: string) => void
  editable?: boolean
  highlightedLines?: Set<number>
  highlightColor?: 'green' | 'yellow' | 'red'
}

export function CodeEditorDisplay({ 
  id,  // ✅ ADD THIS
  value, 
  onChange, 
  editable = false,
  highlightedLines = new Set(),
  highlightColor = 'green'
}: CodeEditorDisplayProps) {
  
  // ✅ Get color based on prop
  const getColor = () => {
    switch (highlightColor) {
      case 'yellow':
        return { class: 'line-coverage-yellow' }
      case 'red':
        return { class: 'line-coverage-red' }
      default:
        return { class: 'line-coverage-green' }
    }
  }

  const { class: highlightClass } = getColor()

  // ✅ Create line highlight extension
  const lineHighlightField = useMemo(() => {
    return StateField.define({
      create() {
        return RangeSet.empty
      },
      update(decorations, tr) {
        // Rebuild decorations on document changes
        const newDecorations: any[] = []
        
        if (highlightedLines.size > 0) {
          const lines = tr.state.doc.toString().split('\n')
          let pos = 0
          
          lines.forEach((line, idx) => {
            const lineNum = idx + 1
            
            if (highlightedLines.has(lineNum)) {
              const lineStart = pos
              const lineEnd = pos + line.length
              
              newDecorations.push(
                Decoration.line({
                  class: highlightClass,
                }).range(lineStart)
              )
            }
            
            pos += line.length + 1 // +1 for newline
          })
        }
        
        return newDecorations.length > 0
          ? RangeSet.of(newDecorations, true)
          : RangeSet.empty
      }
    })
  }, [highlightedLines, highlightClass])

  // ✅ Get color values
  const getColorValues = () => {
    switch (highlightColor) {
      case 'yellow':
        return { bg: 'rgba(234, 179, 8, 0.2)', border: '#eab308' }
      case 'red':
        return { bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444' }
      default:
        return { bg: 'rgba(34, 197, 94, 0.2)', border: '#22c55e' }
    }
  }

  const colors = getColorValues()

  // ✅ SCOPED CSS using editor id
  const highlightCSS = `
    .editor-${id} {
      height: 100%;
    }

    ${Array.from(highlightedLines)
      .map(lineNum => `
        .editor-${id} .cm-line:nth-child(${lineNum}) {
          background-color: ${colors.bg} !important;
          border-left: 3px solid ${colors.border} !important;
          padding-left: 6px !important;
        }
      `)
      .join('\n')}

    .editor-${id} .cm-gutters {
      background-color: rgba(15, 23, 42, 0.8) !important;
      border-right: 1px solid rgba(100, 116, 139, 0.3) !important;
    }

    .editor-${id} .cm-activeLineGutter {
      background-color: rgba(51, 65, 85, 0.4) !important;
    }

    .editor-${id} .cm-line {
      padding-left: 3px;
      padding-bottom: 0px;
    }
  `

  return (
    <div 
      className={`editor-${id} h-full bg-slate-950 w-full`}
      onCopy={(e) => {
        if (!editable) {
          e.preventDefault();
          return false;
        }
      }}
      onCut={(e) => {
        if (!editable) {
          e.preventDefault();
          return false;
        }
      }}
    >
      <style>{highlightCSS}</style>
      <CodeMirror
        value={value}
        height="100%"
        width="100%"
        theme={oneDark}
        extensions={[cpp(), lineHighlightField]}
        editable={editable}
        onChange={onChange}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: editable,
          highlightSelectionMatches: editable,
          foldGutter: true,
          indentOnInput: editable,
          syntaxHighlighting: true,
          autocompletion: false,
          closeBrackets: editable,
          searchKeymap: true,
        }}
        style={{
          fontSize: '14px',
          lineHeight: '1.6',
          height: '100%',
          width: '100%',
          fontFamily: 'JetBrains Mono, Fira Code, monospace',
          userSelect: editable ? 'text' : 'none',
        }}
      />
    </div>
  )
}