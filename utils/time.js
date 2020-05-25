export const humanReadableTime = (dateTime) => {
  return dateToHHMM(new Date(dateTime));
}

const dateToHHMM = (date) => {
  return (
    "" +
    (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) +
    ":" +
    (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes())
  );
};
