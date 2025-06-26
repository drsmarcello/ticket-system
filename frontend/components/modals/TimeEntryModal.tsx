"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useAuth } from "../../contexts/AuthContext";
import { useCreateTimeEntry } from "../../hooks/useTimeEntries";
import LoadingSpinner from "../ui/LoadingSpinner";
import toast from "react-hot-toast";
import {
  XMarkIcon,
  PlayIcon,
  StopIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import type { TimeEntryCreateInput } from "@/lib/graphql";

interface TimeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: {
    id: string;
    title: string;
    company: {
      name: string;
    };
  };
  onTimeEntryCreated?: () => void;
}

export default function TimeEntryModal({
  isOpen,
  onClose,
  ticket,
  onTimeEntryCreated,
}: TimeEntryModalProps) {
  const { user: _user } = useAuth();

  const [formData, setFormData] = useState({
    description: "",
    startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    endTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    billable: true,
  });

  const [isTracking, setIsTracking] = useState(false);
  const [trackingStart, setTrackingStart] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const createTimeEntryMutation = useCreateTimeEntry();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && trackingStart) {
      interval = setInterval(() => {
        setElapsedTime(
          Math.floor((Date.now() - trackingStart.getTime()) / 1000),
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, trackingStart]);

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setFormData({
        description: "",
        startTime: format(now, "yyyy-MM-dd'T'HH:mm"),
        endTime: format(now, "yyyy-MM-dd'T'HH:mm"),
        billable: true,
      });
      setIsTracking(false);
      setTrackingStart(null);
      setElapsedTime(0);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (isTracking) {
      if (
        confirm("Die Zeiterfassung läuft noch. Möchten Sie wirklich schließen?")
      ) {
        setIsTracking(false);
        setTrackingStart(null);
        setElapsedTime(0);
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      toast.error("Bitte geben Sie eine Beschreibung ein");
      return;
    }

    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);

    if (endTime <= startTime) {
      toast.error("Endzeit muss nach der Startzeit liegen");
      return;
    }

    try {
      const timeEntryData: TimeEntryCreateInput = {
        ticketId: ticket.id,
        description: formData.description,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        billable: formData.billable,
      };

      await createTimeEntryMutation.mutateAsync(timeEntryData);
      toast.success("Zeiteintrag erfolgreich erstellt!");
      onTimeEntryCreated?.();
      handleClose();
    } catch (error: any) {
      toast.error(`Fehler: ${error.message}`);
    }
  };

  const handleStartTracking = () => {
    const now = new Date();
    setTrackingStart(now);
    setIsTracking(true);
    setFormData((prev) => ({
      ...prev,
      startTime: format(now, "yyyy-MM-dd'T'HH:mm"),
    }));
    toast.success("Zeiterfassung gestartet");
  };

  const handleStopTracking = () => {
    if (trackingStart) {
      const now = new Date();
      setIsTracking(false);
      setFormData((prev) => ({
        ...prev,
        endTime: format(now, "yyyy-MM-dd'T'HH:mm"),
      }));
      toast.success("Zeiterfassung gestoppt");
    }
  };

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const calculateDuration = () => {
    if (!formData.startTime || !formData.endTime) return 0;
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    return Math.max(
      0,
      Math.floor((end.getTime() - start.getTime()) / (1000 * 60)),
    );
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, "0")}h`;
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Zeit erfassen
                    </Dialog.Title>
                    <p className="text-sm text-gray-600 mt-1">
                      {ticket.title} • {ticket.company.name}
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Timer Section */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="text-center">
                    <div className="mb-4">
                      <div className="text-4xl font-mono font-bold text-gray-900">
                        {isTracking
                          ? formatElapsedTime(elapsedTime)
                          : "00:00:00"}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {isTracking ? "Zeit läuft..." : "Bereit zum Starten"}
                      </p>
                    </div>

                    <div className="flex justify-center space-x-4">
                      {!isTracking ? (
                        <button
                          onClick={handleStartTracking}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium inline-flex items-center"
                        >
                          <PlayIcon className="h-5 w-5 mr-2" />
                          Start
                        </button>
                      ) : (
                        <button
                          onClick={handleStopTracking}
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium inline-flex items-center"
                        >
                          <StopIcon className="h-5 w-5 mr-2" />
                          Stop
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Beschreibung */}
                  <div>
                    <label htmlFor="description" className="form-label">
                      Beschreibung *
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      required
                      className="form-input"
                      placeholder="Was haben Sie gemacht?"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {/* Zeit-Inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startTime" className="form-label">
                        Startzeit *
                      </label>
                      <input
                        type="datetime-local"
                        id="startTime"
                        required
                        className="form-input"
                        value={formData.startTime}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            startTime: e.target.value,
                          }))
                        }
                        disabled={isTracking}
                      />
                    </div>

                    <div>
                      <label htmlFor="endTime" className="form-label">
                        Endzeit *
                      </label>
                      <input
                        type="datetime-local"
                        id="endTime"
                        required
                        className="form-input"
                        value={formData.endTime}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            endTime: e.target.value,
                          }))
                        }
                        disabled={isTracking}
                      />
                    </div>
                  </div>

                  {/* Dauer Anzeige */}
                  {formData.startTime && formData.endTime && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-blue-700">
                          <ClockIcon className="h-4 w-4 mr-2" />
                          Berechnete Dauer:
                        </div>
                        <span className="text-lg font-semibold text-blue-900">
                          {formatDuration(calculateDuration())}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Abrechenbar */}
                  <div className="flex items-center">
                    <input
                      id="billable"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={formData.billable}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          billable: e.target.checked,
                        }))
                      }
                    />
                    <label
                      htmlFor="billable"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Abrechenbare Zeit
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="btn-secondary"
                      disabled={createTimeEntryMutation.isPending}
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      disabled={createTimeEntryMutation.isPending || isTracking}
                      className="btn-primary"
                    >
                      {createTimeEntryMutation.isPending ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Wird gespeichert...
                        </>
                      ) : (
                        "Zeiteintrag speichern"
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
