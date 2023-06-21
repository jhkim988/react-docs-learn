/**
 * Refs: 리액트 외부 시템을 제어하고 동기화할 때 사용
 * 1. 컴포넌트가 일부 정보를 기억하길 원하지만, 해당 정보가 새 렌더링을 트리거하지 않도록 하고 싶을 때 사용한다.
 * 2. ref.current 는 setState 와 달리 즉시 값이 변한다.
 * 3. 렌더링 프로세스 외부에서 ref.current 값을 변경할 수 있다.
 * 4. 렌더링 도중에 값을 읽거나 쓰지 않아야 한다. (완료된 이후에 해야 한다.) React 는 ref.current 의 값이 언제 변경됐는지 모른다.
 * 
 * 사용예시
 * 1. timeout ID 저장
 * 2. DOM elements 저장/조작
 * 3. JSX 를 계산하는 데 필요하지 않은 다른 객체 저장
*/

import { useRef, useState } from 'react';

export const ReferencingRefs = () => {
	let ref = useRef(0);

	function handleClick() {
		ref.current = ref.current + 1;
		alert(`You clicked ${ref.current} times!`);
	}

	console.log("RENDER");

	return (
		<button onClick={handleClick}>
			Click Me!
		</button>
	)
};

export const StopWatch = () => {
	const [startTime, setStartTime] = useState(null);
	const [now, setNow] = useState(null);
	const intervalRef = useRef(null);
	function handleStart() {
		setStartTime(Date.now());
		setNow(Date.now());
		intervalRef.current = setInterval(() => {
			setNow(Date.now());
		}, 10);
	}

	function handleStop() {
		clearInterval(intervalRef.current);
	}

	let secondsPassed = 0;
	if (startTime !== null && now !== null) {
		secondsPassed = (now - startTime) / 1000;
	}

	return (
		<>
			<h1>Time passed: {secondsPassed.toFixed(3)}</h1>
			<button onClick={handleStart}>
				start
			</button>
			<button onClick={handleStop}>
				stop
			</button>
		</>
	)
}

/**
 * ref 로 하게 되면, 값은 변하지만 렌더링 되지 않는다.
 * 렌더링 중에 ref.current 를 읽을 때 주의해야 한다. (즉 JSX 리턴 부분)
 */
export const Counter = () => {
	// const [count, setCount] = useState(0);
	const countRef = useRef(0);

	function handleClick() {
		// setCount(count + 1);
		countRef.current = countRef.current + 1;
	}

	return (
		<button onClick={handleClick}>
			You clikced {countRef.current} times
		</button>
	)
}

// 실제 useRef 구현
export const useRefImpl = (initValue) => {
	const [ref, setRef] = useState({ current: initValue });
	return ref;
}

// Challenges
export const FIX_A_BROKEN_CHAT_INPUT = () => {
	const [text, setText] = useState('');
	const [isSending, setIsSending] = useState(false);
	const timeoutID = useRef(null);

	function handleSend() {
		setIsSending(true);
		timeoutID.current = setTimeout(() => {
			alert("Sent");
			setIsSending(false);
		}, 3000);
	}

	function handleUndo() {
		setIsSending(false);
		clearTimeout(timeoutID.current);
	}

	return (
		<>
			<input
				disabled={isSending}
				value={text}
				onChange={e => setText(e.target.value)}
			/>
			<button
				disabled={isSending}
				onClick={handleSend}>
					{isSending ? "Sending..." : "Send"}
			</button>
			{isSending && <button onClick={handleUndo}>Undo</button>}
		</>
	)
}

export const FIX_A_COMPONENT_FAILING_TO_RE_RENDER = () => {
	const [isOnRef, setIsOnRef] = useState(false);

	return (
		<button onClick={() => {
			setIsOnRef(prev => !prev);
		}}>
			{isOnRef ? 'On': 'Off'}
		</button>
	)
}

const DebouncedButton = ({ onClick, children }) => {
	const timeoutID = useRef(null);
	return (
		<button onClick={() => {
			clearTimeout(timeoutID.current);
			timeoutID.current = setTimeout(() => {
				onClick();
			}, 1000);
		}}>
			{children}
		</button>
	)
}

export const FIX_DEBOUNCING = () => {
	return (
		<>
			<DebouncedButton onClick={() => alert("Spaceship launched!")}>
				Launch the spaceship
			</DebouncedButton>
			<DebouncedButton onClick={() => alert("Soup boiled!")}>
				Boil the soup
			</DebouncedButton>
			<DebouncedButton onClick={() => alert("Lullaby sung!")}>
				Sing a lullaby
			</DebouncedButton>
		</>
	)
}

export const READ_THE_LATEST_STATE = () => {
	const [text, setText] = useState('');
	const textRef = useRef('');

	function handleChange(e) {
		setText(e.target.value);
		textRef.current = e.target.value;	
	}

	function handleSend() {
		setTimeout(() => {
			alert(`Sending: ${textRef.current}`);
		}, 3000);
	}

	return (
		<>
			<input value={text} onChange={handleChange}/>
			<button onClick={handleSend}>Send</button>
		</>
	)
}