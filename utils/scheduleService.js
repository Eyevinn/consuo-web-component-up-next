export const update = async (apiUrl, channelId) => {
  const now = Date.now();
  const startPoint = now - 3600 * 1000;
  const url = `${apiUrl}/channels/${channelId}/schedule?start=${startPoint}`;
  const response = await fetch(url);
  const schedule = await response.json();

  const currentEventIndex = schedule.findIndex(
    (event) => event.start_time <= now && now < event.end_time
  );
  let currentEvent = schedule[currentEventIndex];
  let nextEvent = schedule[currentEventIndex + 1];

  return {
    currentEvent,
    nextEvent,
  };
};
