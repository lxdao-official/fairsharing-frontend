import { useEffect, useMemo, useState } from 'react';

export interface ITimeLeft {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
}

function useCountDownTime(baseTime: string | number, period: string | number, interval?: number) {
	const [now, setNow] = useState(Date.now());

	const targetTime = useMemo(() => {
		return new Date(baseTime).getTime() + Number(period) * 24 * 60 * 60 * 1000;
	}, [baseTime, period]);

	const isEnd = useMemo(() => {
		return now > targetTime;
	}, [targetTime, now]);

	/**
	 * 倒计时，默认10s一次
	 */
	useEffect(() => {
		const timer = setTimeout(() => {
			setNow(Date.now());
		}, interval || 10000);

		return () => {
			clearTimeout(timer);
		};
	}, [now]);

	const calcTimeLeft = () => {
		if (isEnd) {
			return {
				days: 0,
				hours: 0,
				minutes: 0,
				seconds: 0,
			};
		}

		const distance = targetTime - now;

		const seconds = Math.floor((distance / 1000) % 60);
		const minutes = Math.floor((distance / 1000 / 60) % 60);
		const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
		const days = Math.floor(distance / (1000 * 60 * 60 * 24));

		return {
			days,
			hours,
			minutes,
			seconds,
		};
	};

	const [timeLeft, setTimeLeft] = useState<ITimeLeft>(calcTimeLeft());

	useEffect(() => {
		setTimeLeft(calcTimeLeft());
	}, [targetTime, now, isEnd]);

	return { targetTime, isEnd, timeLeft };
}

export default useCountDownTime;
