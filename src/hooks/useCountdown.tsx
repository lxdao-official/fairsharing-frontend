import { useState, useEffect } from 'react';

function useCountdown(targetDate: number) {
	const calculateTimeLeft = () => {
		const currentTime = new Date().getTime();
		const targetTime = new Date(targetDate).getTime();
		const timeDifference = targetTime - currentTime;

		if (timeDifference <= 0) {
			return { days: 0, hours: 0, minutes: 0, seconds: 0, isEnd: true };
		}

		const seconds = Math.floor((timeDifference / 1000) % 60);
		const minutes = Math.floor((timeDifference / 1000 / 60) % 60);
		const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
		const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

		return { days, hours, minutes, seconds, isEnd: false };
	};

	const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

	useEffect(() => {
		const intervalId = setInterval(() => {
			const timeRemaining = calculateTimeLeft();
			setTimeLeft(timeRemaining);

			if (
				timeRemaining.days === 0 &&
				timeRemaining.hours === 0 &&
				timeRemaining.minutes === 0 &&
				timeRemaining.seconds === 0
			) {
				clearInterval(intervalId);
			}
		}, 1000);

		return () => clearInterval(intervalId);
	}, [targetDate]);

	return timeLeft;
}

export default useCountdown;
