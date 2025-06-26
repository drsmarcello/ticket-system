"use client";

import { useState } from "react";
import { formatDateTime } from "../../utils/dateUtils";

interface TicketCommentsProps {
  comments: any[];
  canEdit: boolean;
  onAddComment: (content: string, isInternal: boolean) => void;
  ticketId: string;
}

export default function TicketComments({
  comments,
  canEdit,
  onAddComment,
  ticketId: _ticketId,
}: TicketCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    onAddComment(newComment, isInternal);
    setNewComment("");
    setIsInternal(false);
  };

  return (
    <div>
      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="comment" className="form-label">
            Neuer Kommentar
          </label>
          <textarea
            id="comment"
            rows={3}
            className="form-input"
            placeholder="Kommentar hinzufügen..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between">
          {canEdit && (
            <div className="flex items-center">
              <input
                id="internal"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
              />
              <label htmlFor="internal" className="ml-2 text-sm text-gray-600">
                Interner Kommentar (nur für Mitarbeiter sichtbar)
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={!newComment.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Kommentar hinzufügen
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments
            .filter((comment: any) => canEdit || !comment.isInternal)
            .map((comment: any) => (
              <div key={comment.id} className="border rounded-lg p-4">
                {/* Comment Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {comment.user.name.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {comment.user.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(comment.createdAt)}
                      </p>
                    </div>
                  </div>

                  {comment.isInternal && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Intern
                    </span>
                  )}
                </div>

                {/* Comment Content */}
                <div className="mb-3">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))
        ) : (
          <p className="text-gray-500 text-center py-8">
            Noch keine Kommentare vorhanden.
          </p>
        )}
      </div>
    </div>
  );
}
