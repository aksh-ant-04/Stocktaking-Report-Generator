import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { EventData } from '../types';

interface EventSelectorProps {
  events: EventData[];
  selectedEventId: string;
  onEventSelect: (eventId: string) => void;
}

const EventSelector: React.FC<EventSelectorProps> = ({
  events,
  selectedEventId,
  onEventSelect
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Calendar className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Event Selection</h3>
      </div>
      
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Event ID
        </label>
        <div className="relative">
          <select
            value={selectedEventId}
            onChange={(e) => onEventSelect(e.target.value)}
            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-900"
          >
            <option value="">Select an Event ID or enter manually below...</option>
            {events.map((event) => (
              <option key={event.eventId} value={event.eventId}>
                {event.eventId} - {event.customerName}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
        
        {events.length === 0 && (
          <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
            <p className="text-sm text-blue-800">
              <span className="font-medium">No saved events yet.</span> Enter Event ID and customer information below to get started.
            </p>
          </div>
        )}
        
        {selectedEventId && (
          <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Selected Event:</span> {selectedEventId}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Customer information and logo loaded from saved data
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventSelector;