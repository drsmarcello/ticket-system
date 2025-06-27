"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import {
  useTicket,
  useUpdateTicket,
  useCreateComment,
} from "../../../hooks/useTickets";

import StatusBadge from "../../../components/ui/StatusBadge";
import PriorityBadge from "../../../components/ui/PriorityBadge";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import TimeEntryModal from "../../../components/modals/TimeEntryModal";
import TicketComments from "../../../components/ticket/TicketComments";
import TicketTimeEntries from "../../../components/ticket/TicketTimeEntries";
import TicketHistory from "../../../components/ticket/TicketHistory";
import TicketSidebar from "../../../components/ticket/TicketSidebar";

import toast from "react-hot-toast";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import type {
  CommentCreateInput,
  TicketUpdateInput,
} from "@/lib/graphql";

export default function TicketDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const ticketId = params.id as string;

  const [activeTab, setActiveTab] = useState("comments");
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);

  const { data, isLoading, error } = useTicket(ticketId);
  const updateTicketMutation = useUpdateTicket();
  const createCommentMutation = useCreateComment();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Fehler beim Laden des Tickets
        </h3>
        <p className="text-red-600 mb-4">
          {error.message || "Unbekannter Fehler"}
        </p>
        <div className="space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary"
          >
            Seite neu laden
          </button>
          <Link href="/tickets" className="btn-primary">
            Zurück zu Tickets
          </Link>
        </div>
      </div>
    );
  }

  if (!data?.ticket) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Ticket nicht gefunden
        </h3>
        <p className="text-gray-600 mb-4">
          Das angeforderte Ticket existiert nicht oder Sie haben keine
          Berechtigung.
        </p>
        <Link href="/tickets" className="btn-primary">
          Zurück zu Tickets
        </Link>
      </div>
    );
  }

  const ticket = data.ticket;
  const canEdit = user?.role === "ADMIN" || user?.role === "EMPLOYEE";

  const handleStatusChange = async (status: string) => {
    try {
      const updateData: TicketUpdateInput = { status: status as any };
      await updateTicketMutation.mutateAsync({
        id: ticketId,
        data: updateData,
      });
      toast.success("Status aktualisiert");
    } catch (error: any) {
      toast.error(`Fehler: ${error.message}`);
    }
  };

  const handlePriorityChange = async (priority: string) => {
    try {
      const updateData: TicketUpdateInput = { priority: priority as any };
      await updateTicketMutation.mutateAsync({
        id: ticketId,
        data: updateData,
      });
      toast.success("Priorität aktualisiert");
    } catch (error: any) {
      toast.error(`Fehler: ${error.message}`);
    }
  };

  const handleAddComment = async (content: string, isInternal: boolean) => {
    try {
      const commentData: CommentCreateInput = {
        ticketId,
        content,
        isInternal,
      };
      await createCommentMutation.mutateAsync(commentData);
      toast.success("Kommentar hinzugefügt");
    } catch (error: any) {
      toast.error(`Fehler: ${error.message}`);
    }
  };

  const handleTimeEntryCreated = () => {
    toast.success("Zeiteintrag hinzugefügt");
  };

  return (
    <div>
      <TimeEntryModal
        isOpen={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
        ticket={ticket}
        onTimeEntryCreated={handleTimeEntryCreated}
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link
            href="/tickets"
            className="mr-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
            <p className="mt-1 text-sm text-gray-600">
              Ticket #{ticket.id.slice(-8)}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />

            {/* Edit Button - Nur für berechtigte Benutzer */}
            {canEdit && (
              <Link
                href={`/tickets/${ticketId}/edit`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                title="Ticket bearbeiten"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Bearbeiten
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Description */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Beschreibung
              </h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  className={`py-2 px-4 border-b-2 font-medium text-sm ${
                    activeTab === "comments"
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("comments")}
                >
                  <ChatBubbleLeftIcon className="h-4 w-4 mr-2 inline" />
                  Kommentare ({ticket.comments?.length || 0})
                </button>
                {canEdit && (
                  <button
                    className={`py-2 px-4 border-b-2 font-medium text-sm ${
                      activeTab === "timeEntries"
                        ? "border-primary-500 text-primary-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setActiveTab("timeEntries")}
                  >
                    <ClockIcon className="h-4 w-4 mr-2 inline" />
                    Zeiteinträge ({ticket.timeEntries?.length || 0})
                  </button>
                )}
                <button
                  className={`py-2 px-4 border-b-2 font-medium text-sm ${
                    activeTab === "history"
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("history")}
                >
                  Historie ({ticket.histories?.length || 0})
                </button>
              </nav>
            </div>

            <div className="px-4 py-5 sm:p-6">
              {activeTab === "comments" && (
                <TicketComments
                  comments={ticket.comments || []}
                  canEdit={canEdit}
                  onAddComment={handleAddComment}
                  ticketId={ticketId}
                />
              )}

              {activeTab === "timeEntries" && canEdit && (
                <TicketTimeEntries timeEntries={ticket.timeEntries || []} />
              )}

              {activeTab === "history" && (
                <TicketHistory histories={ticket.histories || []} />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <TicketSidebar
            ticket={ticket}
            canEdit={canEdit}
            onOpenTimeModal={() => setIsTimeModalOpen(true)}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
          />
        </div>
      </div>
    </div>
  );
}
