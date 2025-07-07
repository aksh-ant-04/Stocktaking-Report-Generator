import { EventData } from '../types';

const STORAGE_KEY = 'stocktaking_events';

// Load events from localStorage on initialization
const loadEventsFromStorage = (): EventData[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate that the parsed data is an array
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Failed to load events from localStorage:', error);
  }
  return [];
};

// Save events to localStorage
const saveEventsToStorage = (events: EventData[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.warn('Failed to save events to localStorage:', error);
  }
};

// Initialize events from localStorage
let events: EventData[] = loadEventsFromStorage();

export const getEventById = (eventId: string): EventData | undefined => {
  return events.find(event => event.eventId === eventId);
};

export const getAllEvents = (): EventData[] => {
  return events;
};

export const addEvent = (eventData: EventData): void => {
  // Check if event already exists
  const existingIndex = events.findIndex(event => event.eventId === eventData.eventId);
  
  if (existingIndex >= 0) {
    // Update existing event
    events[existingIndex] = eventData;
  } else {
    // Add new event
    events.push(eventData);
  }
  
  // Save to localStorage
  saveEventsToStorage(events);
};

export const removeEvent = (eventId: string): void => {
  events = events.filter(event => event.eventId !== eventId);
  
  // Save to localStorage
  saveEventsToStorage(events);
};

// Export function to clear all events (useful for testing or reset functionality)
export const clearAllEvents = (): void => {
  events = [];
  saveEventsToStorage(events);
};