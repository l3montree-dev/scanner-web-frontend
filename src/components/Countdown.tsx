import React, { FunctionComponent, useEffect, useState } from "react";

const calculateTimeLeft = (): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} => {
  const difference = new Date("2023-02-08").getTime() - new Date().getTime();
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
    <div className="grid grid-flow-col gap-5 text-center auto-cols-max text-white justify-center">
      <div className="flex flex-col p-4 rounded bg-deepblue-200">
        <span className="text-5xl">
          <span> {timeLeft.days} </span>
        </span>
        Tagen
      </div>
      <div className="flex flex-col p-4 rounded bg-deepblue-200">
        <span className="text-5xl">
          <span> {timeLeft.hours} </span>
        </span>
        Stunden
      </div>
      <div className="flex flex-col p-4 rounded bg-deepblue-200">
        <span className="text-5xl">
          <span> {timeLeft.minutes} </span>
        </span>
        Minuten
      </div>
      <div className="flex flex-col p-4 rounded bg-deepblue-200">
        <span className="text-5xl">
          <span> {timeLeft.seconds} </span>
        </span>
        Sekunden
      </div>
    </div>
  );
};

export default Countdown;
