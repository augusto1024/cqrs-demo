import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:4002');

const getDateString = (date: Date) =>
  `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

function App() {
  const [connected, setConnected] = useState(false);
  const [newEvents, setNewEvents] = useState(false);
  const [events, setEvents] = useState<any[][]>([]);
  const [date, setDate] = useState(() => new Date());

  useEffect(() => {
    const addEvents = (newEvents: any[]) => {
      setEvents((prevEvents) =>
        newEvents.length > 0 ? newEvents : prevEvents
      );
      setDate(() => new Date());
      setNewEvents(newEvents.length > 0 ? true : false);
    };

    const socket = io('http://localhost:4002');
    socket.on('connect', () => {
      setConnected(true);
    });
    socket.on('message', addEvents);

    return () => {
      socket.off('message', addEvents);
    };
  }, []);

  return (
    <div className="py-20 flex flex-col w-full gap-4">
      <div className="flex justify-center">
        <div className="w-4/12 flex flex-col justify-center gap-8">
          {!newEvents ? (
            <div className="bg-yellow-50 text-yellow-800 p-4 rounded-sm border border-yellow-800/30">
              <h3>No new events (Last checked: {getDateString(date)})</h3>
            </div>
          ) : (
            <div className="bg-green-50 text-green-800 p-4 rounded-sm border border-green-800/30">
              <h3>New events detected at {getDateString(date)}</h3>
            </div>
          )}
          <div className="flex flex-col justify-center gap-4">
            <h3 className="text-lg font-bold">Last received events:</h3>
            {events.map((event, eventIndex) => (
              <div className="card">{JSON.stringify(event)}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
