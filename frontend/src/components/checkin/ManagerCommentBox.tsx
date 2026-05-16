"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";

interface ManagerCommentBoxProps {
  existingComment?: string;
  onSave: (comment: string) => void;
  isReadOnly?: boolean;
}

export function ManagerCommentBox({ existingComment = "", onSave, isReadOnly }: ManagerCommentBoxProps) {
  const [comment, setComment] = React.useState(existingComment);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 mt-6">
      <h4 className="text-sm font-semibold text-slate-800 mb-2">Manager Check-in Comments</h4>
      <p className="text-xs text-slate-500 mb-3">Document the quarterly check-in discussion and performance feedback.</p>
      
      <textarea
        className="w-full h-32 p-3 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:bg-slate-100 disabled:text-slate-600"
        placeholder="Enter structured feedback here..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={isReadOnly}
      />
      
      {!isReadOnly && (
        <div className="mt-3 flex justify-end">
          <Button 
            variant="primary" 
            onClick={() => onSave(comment)}
            disabled={!comment.trim() || comment === existingComment}
          >
            Save Feedback
          </Button>
        </div>
      )}
    </div>
  );
}
