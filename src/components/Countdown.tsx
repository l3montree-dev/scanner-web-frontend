import { FunctionComponent, useEffect, useState } from "react";

const calculateTimeLeft = (): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} => {
  const endDate = new Date("2023-03-29");

  const difference =
    endDate.getTime() - Date.now() + 1000 * 60 * endDate.getTimezoneOffset();
  let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  return timeLeft;
};

const Countdown: FunctionComponent = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="text-center mx-5 flex-wrap flex flex-row gap-4 text-white justify-center">
      <div className="flex flex-col whitespace-nowrap flex-1 p-4 bg-deepblue-200">
        <span className="text-4xl">
          <span>{timeLeft.days}</span>
        </span>
        Tagen
      </div>
      <div className="flex flex-1 whitespace-nowrap flex-col p-4 bg-deepblue-200">
        <span className="text-4xl">
          <span>{timeLeft.hours}</span>
        </span>
        Stunden
      </div>
      <div className="flex flex-1  whitespace-nowrap flex-col p-4 bg-deepblue-200">
        <span className="text-4xl">
          <span>{timeLeft.minutes}</span>
        </span>
        Minuten
      </div>
      <div className="flex flex-1 flex-col p-4 whitespace-nowrap bg-deepblue-200">
        <span className="text-4xl">
          <span>{timeLeft.seconds}</span>
        </span>
        Sekunden
      </div>
    </div>
  );
};

export default Countdown;
