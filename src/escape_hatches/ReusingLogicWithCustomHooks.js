/**
 * 커스텀 hooks 로 로직 재사용하기
 * 1. 공통 로직을 추출하여 hooks 로 만든다.
 * 2. hooks 는 use- 로 시작하도록 명명한다. linter 가 컴포넌트의 탑레벨에서만 호출하도록 한다.
 * 3. 또한 커스텀 hooks 는 내부에서 다른 hook 을 호출해야 한다. 예외적으로 테스트용이나 나중에 추가할 예정의 hooks 에서는 다른 hooks 를 호출하지 않아도 된다.
 * 4. 커스텀 hooks 는 로직을 공유하지만, 커스텀 hooks 의 상태까지 공유하지는 않는다. -> 상태를 공유하기 위해서는 끌어 올려야 한다.
 * 5. Effect 는 점진적으로 hooks 로 변환돼야 한다.
 */

import { useState, useEffect } from 'react';
import { experimental_useEffectEvent as useEffectEvent} from 'react';

const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(true); 

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    }
  }, []);

  return isOnline;
}

export const StatusBar = () => {
  const isOnline = useOnlineStatus();

  return <h1>{isOnline ? '✅ Online' : '❌ Disconnected'}</h1>;
}

export const SaveButton = () => {
  const isOnline = useOnlineStatus();

  function handleSaveClick() {
    console.log('✅ Progress saved');
  }

  return (
    <button disabled={!isOnline} onClick={handleSaveClick}>
      {isOnline ? 'Save progress' : 'Reconnecting...'}
    </button>
  );
}

const useFormInput = (initialValue) => {
  const [value, setValue] = useState('');

  function handleChange(e) {
    setValue(e.target.value);
  }

  return ({ value, onChange: handleChange });
}

export const Form = () => {
  const firstNameProps = useFormInput('Mary');
  const lastNameProps = useFormInput('Poppins');

  return (
    <>
      <label>
        First name:
        <input {...firstNameProps} />
      </label>
      <label>
        Last name:
        <input {...lastNameProps} />
      </label>
      <p><b>Good morning, {firstNameProps.value} {lastNameProps.value}.</b></p>
    </>
  );
}

export function createConnection({ serverUrl, roomId }) {
  // A real implementation would actually connect to the server
  if (typeof serverUrl !== 'string') {
    throw Error('Expected serverUrl to be a string. Received: ' + serverUrl);
  }
  if (typeof roomId !== 'string') {
    throw Error('Expected roomId to be a string. Received: ' + roomId);
  }
  let intervalId;
  let messageCallback;
  return {
    connect() {
      console.log('✅ Connecting to "' + roomId + '" room at ' + serverUrl + '...');
      clearInterval(intervalId);
      intervalId = setInterval(() => {
        if (messageCallback) {
          if (Math.random() > 0.5) {
            messageCallback('hey')
          } else {
            messageCallback('lol');
          }
        }
      }, 3000);
    },
    disconnect() {
      clearInterval(intervalId);
      messageCallback = null;
      console.log('❌ Disconnected from "' + roomId + '" room at ' + serverUrl + '');
    },
    on(event, callback) {
      if (messageCallback) {
        throw Error('Cannot add the handler twice.');
      }
      if (event !== 'message') {
        throw Error('Only "message" event is supported.');
      }
      messageCallback = callback;
    },
  };
}

const showNotification = (msg) => console.log(msg);

const useChatRoom = ({ roomId, serverUrl, onReceiveMessage }) => {
  const onMessage = useEffectEvent(onReceiveMessage);

  useEffect(() => {
    const options = { serverUrl, roomId };
    const connection = createConnection(options);
    connection.connect();
    connection.on('message', onMessage);

    return () => connection.disconnect();
  }, [roomId, serverUrl]);
}

export const ChatRoom = ({ roomId }) => {
  const [serverUrl, setServerUrl] = useState(`https://localhost:1234`);
  useChatRoom({
    roomId,
    serverUrl,
    onReceiveMessage(msg) {
      showNotification(`New Message: ${msg}`);
    }
  });
  return (
    <>
      <label>
        Server URL:
        <input value={serverUrl} onChange={e => setServerUrl(e.target.value)} />
      </label>
      <h1>Welcome to the {roomId} room!</h1>
    </>
  );
}

// Challenges
export const EXTRACT_A_USECOUNTER_HOOK = () => {
  const count = useCounter();

  return <h1>Seconds passed: {count}</h1>
}

const useCounter = (delay) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(c => c + 1);
    }, delay);

    return () => clearInterval(id);
  }, [delay]);

  useInterval(() => {

  })

  return count;
}

export const EXTRACT_USE_INTERVAL_OUT_OF_USECOUNTER = () => {
  const [delay, setDelay] = useState(1000);
  const count = useInterval(delay);
  return (
    <>
      <label>
        Tick duration: {delay} ms
        <br />
        <input
          type="range"
          value={delay}
          min="10"
          max="2000"
          onChange={e => setDelay(Number(e.target.value))}
        />
      </label>
      <hr />
      <h1>Ticks: {count}</h1>
    </>
  );
}

const useInterval = ({onTick, delay}) => {
  const onInterval = useEffectEvent(onTick);

  useEffect(() => {
    const id = setInterval(onInterval, delay);
    return () => clearInterval(id);
  }, [delay]);
}

export const IMPLEMENT_A_STAGGERING_MOVEMENT = () => {
  const pos1 = usePointerPosition();
  const pos2 = useDelayedValue(pos1, 100);
  const pos3 = useDelayedValue(pos2, 200);
  const pos4 = useDelayedValue(pos3, 100);
  const pos5 = useDelayedValue(pos3, 50);
  return (
    <>
      <Dot position={pos1} opacity={1} />
      <Dot position={pos2} opacity={0.8} />
      <Dot position={pos3} opacity={0.6} />
      <Dot position={pos4} opacity={0.4} />
      <Dot position={pos5} opacity={0.2} />
    </>
  );
}

function useDelayedValue(value, delay) {
  const [position, setPosition] = useState(value);
  
  useEffect(() => {
    setTimeout(() => {
      setPosition(value);
    }, delay);
  });

  return position;
}

function Dot({ position, opacity }) {
  return (
    <div style={{
      position: 'absolute',
      backgroundColor: 'pink',
      borderRadius: '50%',
      opacity,
      transform: `translate(${position.x}px, ${position.y}px)`,
      pointerEvents: 'none',
      left: -20,
      top: -20,
      width: 40,
      height: 40,
    }} />
  );
}

export function usePointerPosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    function handleMove(e) {
      setPosition({ x: e.clientX, y: e.clientY });
    }
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);
  return position;
}