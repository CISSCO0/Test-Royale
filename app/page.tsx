"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

const codeSnippets = [
  {
    id: 1,
    title: "Calculator Class",
    difficulty: "Easy",
    language: "Java",
    code: `public class Calculator {
    public int add(int a, int b) {
        return a + b;
    }
    
    public int subtract(int a, int b) {
        return a - b;
    }
    
    public int multiply(int a, int b) {
        return a * b;
    }
    
    public double divide(int a, int b) {
        if (b == 0) {
            throw new IllegalArgumentException("Cannot divide by zero");
        }
        return (double) a / b;
    }
}`,
  },
  {
    id: 2,
    title: "String Validator",
    difficulty: "Medium",
    language: "Python",
    code: `class StringValidator:
    def is_valid_email(self, email):
        """Check if email format is valid"""
        if not email or '@' not in email:
            return False
        parts = email.split('@')
        if len(parts) != 2:
            return False
        return len(parts[0]) > 0 and len(parts[1]) > 0
    
    def is_palindrome(self, text):
        """Check if text is a palindrome"""
        cleaned = ''.join(c.lower() for c in text if c.isalnum())
        return cleaned == cleaned[::-1]
    
    def count_vowels(self, text):
        """Count vowels in text"""
        vowels = 'aeiouAEIOU'
        return sum(1 for char in text if char in vowels)`,
  },
  {
    id: 3,
    title: "Binary Search Tree",
    difficulty: "Hard",
    language: "Java",
    code: `public class BinarySearchTree {
    private Node root;
    
    private class Node {
        int value;
        Node left, right;
        
        Node(int value) {
            this.value = value;
        }
    }
    
    public void insert(int value) {
        root = insertRec(root, value);
    }
    
    private Node insertRec(Node node, int value) {
        if (node == null) {
            return new Node(value);
        }
        if (value < node.value) {
            node.left = insertRec(node.left, value);
        } else if (value > node.value) {
            node.right = insertRec(node.right, value);
        }
        return node;
    }
    
    public boolean search(int value) {
        return searchRec(root, value);
    }
    
    private boolean searchRec(Node node, int value) {
        if (node == null) return false;
        if (node.value == value) return true;
        return value < node.value 
            ? searchRec(node.left, value)
            : searchRec(node.right, value);
    }
}`,
  },
]

export default function StartPage() {
  const router = useRouter()
  const [playerName, setPlayerName] = useState("")
  const [challengeCode, setChallengeCode] = useState("")

  const handleJoinGame = () => {
    if (playerName && challengeCode) {
      const codeIndex = Number.parseInt(challengeCode) % codeSnippets.length
      const selectedSnippet = codeSnippets[codeIndex]

      // Store player data in sessionStorage
      sessionStorage.setItem(
        "playerData",
        JSON.stringify({
          playerName,
          challengeCode,
          codeSnippet: selectedSnippet,
        }),
      )
      router.push("/game")
    }
  }

  const isReadyToStart = playerName && challengeCode

  return (
    <div className="min-h-screen bg-background pt-24 p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="font-bebas text-8xl tracking-wider">
            <span className="text-foreground">BATTLE OF </span>
            <span className="text-primary">TESTS</span>
          </h1>
          <p className="text-muted-foreground text-lg">Compete to write the best unit tests. Quality over quantity.</p>
        </div>

        {/* Player Setup */}
        <Card className="bg-card border-border p-8 space-y-6">
          <h2 className="font-bebas text-3xl text-foreground tracking-wider">JOIN BATTLE</h2>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Your Name</label>
              <Input
                placeholder="Enter your name..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Challenge Code</label>
              <Input
                placeholder="Enter 4-digit code (e.g., 1234)..."
                value={challengeCode}
                onChange={(e) => setChallengeCode(e.target.value)}
                className="bg-background border-border text-foreground font-mono text-lg"
                maxLength={4}
              />
              <p className="text-xs text-muted-foreground">
                Both players must enter the same code to battle the same challenge
              </p>
            </div>
          </div>
        </Card>

        {/* Start Button */}
        <div className="text-center">
          <Button
            onClick={handleJoinGame}
            disabled={!isReadyToStart}
            size="lg"
            className="font-bebas text-2xl tracking-wider px-12 py-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            JOIN BATTLE
          </Button>
        </div>
      </div>
    </div>
  )
}
