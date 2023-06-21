/**
 * Effect 에서 이벤트 분리하기
 * 이벤트 핸들러는 동일한 상호작용을 수행할 때 다시 실행된다. Effect 는 의존하는 state/props 가 바뀔 때 다시 실행된다. -> 두 가지를 섞는 방법
 * 
 * 1. 이벤트 핸들러와 이펙트 중에 선택하는 방법
 * - 특정 상호작용을 처리하고 싶을 때는 이벤트 핸들러를 이용한다. ex) Send 버튼을 누를 때 등
 * - 특정 상호작용에 상관없이 동기화 상태를 유지해야할 때는 이펙트를 이용한다.
 * 
 * 2. Reactive value 와 Reactive logic
 * - Reactive value 란? props, state, 컴포넌트 최상단에 있는 변수 -> 리렌더링 되면 값이 변경될 수 있다.
 * - 이벤트 핸들러 내부 로직은 Reactive 가 아니다. -> "reacting" 하지않고 reactive value 를 읽을 수 있다.
 * - Effect 내부의 로직은 Reactive 다. 따라서 Effect 가 reactive value 를 읽을 때 의존성을 지정해야 한다.
 * 
 * 3. Effect 의 Non-Reactive logic 을 추출하는 방법
 * - useEffect 에서 이펙트 호출은 원하지 않지만, 최신값을 읽고 싶을 때 useEffectEvent 를 사용한다.
 * - useEffectEvent 는 useEffect 내부에서만 호출해야 한다.
 */

import { useEffect, useState } from "react";
import { experimental_useEffectEvent as useEffectEvent } from "react";

export function createConnection(serverUrl, roomId) {
    // A real implementation would actually connect to the server
  let connectedCallback;
  let timeout;
  return {
    connect() {
      timeout = setTimeout(() => {
        if (connectedCallback) {
          connectedCallback();
        }
      }, 100);
    },
    on(event, callback) {
      if (connectedCallback) {
        throw Error('Cannot add the handler twice.');
      }
      if (event !== 'connected') {
        throw Error('Only "connected" event is supported.');
      }
      connectedCallback = callback;
    },
    disconnect() {
      clearTimeout(timeout);
    }
  };
}

const showNotification = (msg, theme) => {
    console.log(msg, theme);
}

const serverUrl = 'https://localhost:1234';

function ChatRoom({ roomId, theme }) {

  // theme 이 바뀔 때 effect 를 재실행하는 것을 원하진 않지만, theme 의 최신값을 읽고 싶은 경우.
  const onConnected = useEffectEvent(() => showNotification('Connected!', theme));
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.on('connected', () => {
      showNotification('Connected!', theme);
    });
    connection.connect();
    return () => connection.disconnect();
  }, [roomId, theme]);

  return <h1>Welcome to the {roomId} room!</h1>
}

// Challenges
export const FIX_A_VARIABLE_THAT_DOES_NOT_UPDATE = () => {
  const [count, setCount] = useState(0);
  const [increment, setIncrement] = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(prev => prev + increment);
    }, 1000);
    
    return () => {
      clearInterval(id);
    }
  }, [increment]);

  return (
    <>
      <h1>
        Counter: {count}
        <button onClick={() => setCount(0)}>Reset</button>
      </h1>
      <hr />
      <p>
        Every second, increment by:
        <button disabled={increment === 0} onClick={() => {
          setIncrement(i => i - 1);
        }}>–</button>
        <b>{increment}</b>
        <button onClick={() => {
          setIncrement(i => i + 1);
        }}>+</button>
      </p>
    </>
  );
}

export const FIX_A_FREEZING_COUNTER = () => {
  const [count, setCount] = useState(0);
  const [increment, setIncrement] = useState(1);

  const onIncrement = useEffectEvent(() => {
    setCount(prev => prev + increment);
  });

  useEffect(() => {
    const id = setInterval(() => {
      onIncrement();
    }, 1000);

    return () => {
      clearInterval(id);
    }
  }, []);

  return (
    <>
      <h1>
        Counter: {count}
        <button onClick={() => setCount(0)}>Reset</button>
      </h1>
      <hr />
      <p>
        Every second, increment by:
        <button disabled={increment === 0} onClick={() => {
          setIncrement(i => i - 1);
        }}>–</button>
        <b>{increment}</b>
        <button onClick={() => {
          setIncrement(i => i + 1);
        }}>+</button>
      </p>
    </>
  );
}

export const FIX_A_NON_ADJUSTABLE_DELAY = () => {
  const [count, setCount] = useState(0);
  const [increment, setIncrement] = useState(1);
  const [delay, setDelay] = useState(100);

  const onTick = useEffectEvent(() => {
    setCount(prev => prev + increment);
  });

  useEffect(() => {
    const id = setInterval(() => {
      onTick();
    }, delay);
    return () => {
      clearInterval(id);
    }
  }, [delay]);

  return (
    <>
      <h1>
        Counter: {count}
        <button onClick={() => setCount(0)}>Reset</button>
      </h1>
      <hr />
      <p>
        Increment by:
        <button disabled={increment === 0} onClick={() => {
          setIncrement(i => i - 1);
        }}>–</button>
        <b>{increment}</b>
        <button onClick={() => {
          setIncrement(i => i + 1);
        }}>+</button>
      </p>
      <p>
        Increment delay:
        <button disabled={delay === 100} onClick={() => {
          setDelay(d => d - 100);
        }}>–100 ms</button>
        <b>{delay} ms</b>
        <button onClick={() => {
          setDelay(d => d + 100);
        }}>+100 ms</button>
      </p>
    </>
  );
}

function ChatRoomChallenge({ roomId, theme }) {
  const onConnected = useEffectEvent((id) => {
    showNotification('Welcome to ' + id, theme);
  });

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    let timerID;
    connection.on('connected', () => {
      timerID = setTimeout(() => {
        onConnected(roomId);
      }, 2000);
    });
    connection.connect();
    return () => {
      connection.disconnect();
      clearTimeout(timerID);
    }
  }, [roomId]);

  return <h1>Welcome to the {roomId} room!</h1>
}

export const FIX_A_DELAYED_NOTIFICATION = () => {
  const [roomId, setRoomId] = useState('general');
  const [isDark, setIsDark] = useState(false);
  return (
    <>
      <label>
        Choose the chat room:{' '}
        <select
          value={roomId}
          onChange={e => setRoomId(e.target.value)}
        >
          <option value="general">general</option>
          <option value="travel">travel</option>
          <option value="music">music</option>
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          checked={isDark}
          onChange={e => setIsDark(e.target.checked)}
        />
        Use dark theme
      </label>
      <hr />
      <ChatRoomChallenge
        roomId={roomId}
        theme={isDark ? 'dark' : 'light'}
      />
    </>
  );
}