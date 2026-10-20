// events.js
// This is our "mock database": a simple list of events.
// Each event has: id (must be unique), title, category, date, location.
// Want more events? Copy one block, change the id, and edit the details.

const EVENTS = [
  { id: 1,  title: "Hackathon 24h",          category: "Tech",     date: "2026-10-24T09:00", location: "Innovation Lab" },
  { id: 2,  title: "Intro to AI Workshop",   category: "Tech",     date: "2026-10-27T15:00", location: "Seminar Hall B" },
  { id: 3,  title: "Web Dev Meetup",         category: "Tech",     date: "2026-11-03T17:30", location: "CS Block, Room 204" },
  { id: 4,  title: "Diwali Cultural Night",  category: "Cultural", date: "2026-10-25T18:00", location: "Main Auditorium" },
  { id: 5,  title: "Classical Dance Show",   category: "Cultural", date: "2026-11-05T19:00", location: "Open Air Theatre" },
  { id: 6,  title: "Food Fest",              category: "Cultural", date: "2026-11-08T12:00", location: "Central Lawn" },
  { id: 7,  title: "Inter-Dept Cricket",     category: "Sports",   date: "2026-10-23T08:00", location: "College Ground" },
  { id: 8,  title: "Football Finals",        category: "Sports",   date: "2026-10-30T16:00", location: "Stadium" },
  { id: 9,  title: "Morning Marathon 5K",    category: "Sports",   date: "2026-11-01T06:00", location: "Main Gate" },
  { id: 10, title: "Battle of the Bands",    category: "Music",    date: "2026-10-28T18:30", location: "Student Centre" },
  { id: 11, title: "Open Mic Night",         category: "Music",    date: "2026-11-06T20:00", location: "Cafeteria Stage" },
  { id: 12, title: "Career Fair",            category: "Academic", date: "2026-11-10T10:00", location: "Exhibition Hall" }
];
