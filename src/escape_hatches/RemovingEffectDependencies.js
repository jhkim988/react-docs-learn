/**
 * Effect 에서 의존성 제거하기
 * 불필요한 의존성으로 Effect 가 너무 자주 실행되거나, 무한 루프에 빠질 수 있다.
 * 
 * 1. 의존성은 코드와 매치된다. - linter 가 모든 reactive variable 를 체크해준다.
 * - 따라서 의존성을 제거하기 위해서는 의존성 배열이나 linter가 아닌, 코드를 고쳐야 한다.
 * - 의존성 배열 원소들이 바뀔 때마다 effect 가 실행돼야 하는지 판단하여 조정한다.
 * 
 * 2. 제거하는 방법
 * 1) 이 Effect 가 Effect 여야 하는가? 이벤트 핸들러로 옮겨야 하는가? -> 이벤트 핸들러로 옮긴다.
 * 2) Effect 가 여러 가지 관련없는 일을 하고 있는가? -> Effect 를 분할한다.
 * 3) 다음 상태를 계산하기 위해 일부 상태를 읽고 있는가? -> setState 의 callback 함수를 이용한다.
 * 4) 반응하지 않고(즉, effect 를 재실행하지 않고) 최신값만을 읽고 싶은가? -> useEffectEvent 를 이용한다.
 * 5) 함수나 object 를 의존성배열로 사용하고 있는가?
 * -> 함수, object 는 렌더링마다 재생성되고 있을 가능성이 높다. useEffect 내부에서 함수/object를 선언하거나, 아예 리액트 컴포넌트 외부로 뺀다.
 * -> object 의 경우 원시값을 이용해도 된다.
 */

import { useState, useEffect, useRef } from "react";
import { experimental_useEffectEvent as useEffectEvent } from "react";

// Challenges
export const Timer = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('✅ Creating an interval');
    const timerID = setInterval(() => {
      console.log('⏰ Interval tick');
      setCount(prev => prev + 1);
    }, 1000);

    return () => {
      console.log('❌ Clearing an interval');
      clearInterval(timerID);
    }
  }, []);

  return <h1>Counter: {count}</h1>
}

export class FadeInAnimation {
  constructor(node) {
    this.node = node;
  }
  start(duration) {
    this.duration = duration;
    if (this.duration === 0) {
      // Jump to end immediately
      this.onProgress(1);
    } else {
      this.onProgress(0);
      // Start animating
      this.startTime = performance.now();
      this.frameId = requestAnimationFrame(() => this.onFrame());
    }
  }
  onFrame() {
    const timePassed = performance.now() - this.startTime;
    const progress = Math.min(timePassed / this.duration, 1);
    this.onProgress(progress);
    if (progress < 1) {
      // We still have more frames to paint
      this.frameId = requestAnimationFrame(() => this.onFrame());
    }
  }
  onProgress(progress) {
    this.node.style.opacity = progress;
  }
  stop() {
    cancelAnimationFrame(this.frameId);
    this.startTime = null;
    this.frameId = null;
    this.duration = 0;
  }
}


function Welcome({ duration }) {
  const ref = useRef(null);

  const onAnimation = useEffectEvent((animation) => {
    animation.start(duration);
  });

  useEffect(() => {
    const animation = new FadeInAnimation(ref.current);
    onAnimation(animation);
    return () => {
      animation.stop();
    };
  }, []);

  return (
    <h1
      ref={ref}
      style={{
        opacity: 0,
        color: 'white',
        padding: 50,
        textAlign: 'center',
        fontSize: 50,
        backgroundImage: 'radial-gradient(circle, rgba(63,94,251,1) 0%, rgba(252,70,107,1) 100%)'
      }}
    >
      Welcome
    </h1>
  );
}
export const FIX_A_RETRIGGERING_ANIMATION = () => {

  const [duration, setDuration] = useState(1000);
  const [show, setShow] = useState(false);

  return (
    <>
      <label>
        <input
          type="range"
          min="100"
          max="3000"
          value={duration}
          onChange={e => setDuration(Number(e.target.value))}
        />
        <br />
        Fade in duration: {duration} ms
      </label>
      <button onClick={() => setShow(!show)}>
        {show ? 'Remove' : 'Show'}
      </button>
      <hr />
      {show && <Welcome duration={duration} />}
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
  return {
    connect() {
      console.log('✅ Connecting to "' + roomId + '" room at ' + serverUrl + '...');
    },
    disconnect() {
      console.log('❌ Disconnected from "' + roomId + '" room at ' + serverUrl);
    }
  };
}

export const FIX_A_RECONNECTION_CHAT = () => {
  const [isDark, setIsDark] = useState(false);
  const [roomId, setRoomId] = useState('general');
  const [serverUrl, setServerUrl] = useState('https://localhost:1234');

  const options = {
    serverUrl: serverUrl,
    roomId: roomId
  };

  return (
    <div className={isDark ? 'dark' : 'light'}>
      <button onClick={() => setIsDark(!isDark)}>
        Toggle theme
      </button>
      <label>
        Server URL:{' '}
        <input
          value={serverUrl}
          onChange={e => setServerUrl(e.target.value)}
        />
      </label>
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
      <hr />
      <ChatRoom options={options} />
    </div>
  );
}

const ChatRoom = ({ options }) => {
  const { serverUrl, roomId } = options; 
  useEffect(() => {
    const connection = createConnection({ serverUrl, roomId });
    connection.connect();
    return () => connection.disconnect();
  }, [serverUrl, roomId]);

  return <h1>Welcome to the {options.roomId} room!</h1>;
}

const showNotification = (msg, theme) => console.log(msg, theme);
export const FIX_A_RECONNECTING_CHAT_AGAIN = () => {

  const [isDark, setIsDark] = useState(false);
  const [roomId, setRoomId] = useState('general');
  const [isEncrypted, setIsEncrypted] = useState(false);

  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={isDark}
          onChange={e => setIsDark(e.target.checked)}
        />
        Use dark theme
      </label>
      <label>
        <input
          type="checkbox"
          checked={isEncrypted}
          onChange={e => setIsEncrypted(e.target.checked)}
        />
        Enable encryption
      </label>
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
      <hr />
      <ChatRoom1
        roomId={roomId}
        isDark={isDark}
        isEncrypted={isEncrypted}
        createConnection={() => {
          const options = {
            serverUrl: 'https://localhost:1234',
            roomId: roomId
          };
          if (isEncrypted) {
            return createEncryptedConnection(options);
          } else {
            return createUnencryptedConnection(options);
          }
        }}
      />
    </>
  );
}

export function createEncryptedConnection({ serverUrl, roomId }) {
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
      console.log('✅ 🔐 Connecting to "' + roomId + '" room... (encrypted)');
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
      console.log('❌ 🔐 Disconnected from "' + roomId + '" room (encrypted)');
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

export const ChatRoom1 = ({ roomId, isDark, isEncrypted }) => {

  const onMessage = useEffectEvent((msg) => showNotification(msg, isDark ? "dark" : "light"));

  useEffect(() => {
    const options = {
      serverUrl: 'https://localhost:1234',
      roomId: roomId
    }
    const connection = isEncrypted ? createEncryptedConnection(options) : createUnencryptedConnection(options);
    connection.on('message', onMessage);
    connection.connect();
    return () => connection.disconnect();
  }, [isEncrypted, roomId]);

  return <h1>Welcome to the {roomId} room!</h1>;
}


function createUnencryptedConnection({ serverUrl, roomId }) {
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
      console.log('✅ Connecting to "' + roomId + '" room (unencrypted)...');
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
      console.log('❌ Disconnected from "' + roomId + '" room (unencrypted)');
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
