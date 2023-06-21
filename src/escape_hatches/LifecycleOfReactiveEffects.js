/**
 * Effect 의 라이프 사이클
 * Effect 의 라이프 사이클은 컴포넌트의 라이프 사이클과 비슷하지만 다른 관점에서 독립적으로 생각해야 한다.
 * 컴포넌트 라이프 사이클: mount - update - unmount
 * Effect 라이프 사이클: 마운트 상태에서 유지되는 동안 여러 번 동작할 수 있다. 컴포넌트 관점(마운트, 업데이트, 언마운트)보다, 동기화를 시작하는 방법과 중지하는 방법의 관점에서 기술하면 된다.
 * 
 * Effect 에서 사용하는 변수들은 모두 reactive 이다.
 * 사용하는 모든 변수들을 의존성 배열에 모두 넣는 편이 좋다.
 * 의존성 배열에 너무 많은 변수가 들어간다면, useEffect 코드를 수정하여 의존성을 줄인다. (linter 를 제거하는 옵션을 사용하지 않고, 코드를 바꿔야 한다.)
 * linter 가 제공하는 컴파일 에러를 활용해야 한다.
 * 
 * global, mutable 변수는 의존성 배열에 넣을 필요가 없다. (react 가 바뀐 것을 알 수 없기 때문)
 * 따라서 location.pathname 이나, ref.current 등은 의존성 배열에 넣어도 에러가 발생하진 않으나 넣을 필요는 없다.
 * React 가 변하지 않는 값이라는 것을 아는 변수도 넣을 필요가 없다. set 함수나, ref 가 그렇다.
 * 
 * Effect 의 의존성을 줄이는 방법
 * 1. 독립적인 동기화 프로세스를 나타내는지 확인한다. 여러 가지를 동기화하면 분할하고, 동기화하는 게 없다면 effect 를 사용하지 않는 것을 고려한다.
 * 2. 단지 최신값을 "읽는 것"만 하고, 새로 동기화하지 않는다면 useEffectEvent 를 이용한다. (실험적 기능)
 * 3. 의존성 배열에 object 나 함수를 넣지 않는다.
 */

import { useState, useEffect } from 'react';

function createConnection(serverUrl, roomId) {
    // A real implementation would actually connect to the server
  return {
    connect() {
      console.log('✅ Connecting to "' + roomId + '" room at ' + serverUrl + '...');
    },
    disconnect() {
      console.log('❌ Disconnected from "' + roomId + '" room at ' + serverUrl);
    }
  };
}

const serverUrl = 'https://localhost:1234';
const logVisit = (roomId) => console.log(roomId);
function ChatRoom({ roomId }) {

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]);

  // 동작이 다른 Effect - 따로 분리하는 것이 좋다.
  // 두 effect 를 합친다면, 추후에 코드를 수정할 때 문제가 발생하게 된다.
  // 예를 들어 연결을 관리하는 effect 에 다른 의존성을 추가하게 된다면, roomId 는 바뀌지 않는데도 logVisit 이 호출될 것이다.
  useEffect(() => {
    logVisit(roomId);
  }, [roomId])

  return <h1>Welcome to the {roomId} room!</h1>;
}

export const CharRoomExample = () => {
  const [roomId, setRoomId] = useState('general');
  const [show, setShow] = useState(false);
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
      <button onClick={() => setShow(!show)}>
        {show ? 'Close chat' : 'Open chat'}
      </button>
      {show && <hr />}
      {show && <ChatRoom roomId={roomId} />}
    </>
  );
}

// Challenges
function ChatRoomChallenge({ roomId }) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]);

  return (
    <>
      <h1>Welcome to the {roomId} room!</h1>
      <input
        value={message}
        onChange={e => setMessage(e.target.value)}
      />
    </>
  );
}

export const FIX_RECONNECTION_ON_EVERY_KEYSTROKE = () => {
  const [roomId, setRoomId] = useState('general');
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
      <hr />
      <ChatRoomChallenge roomId={roomId} />
    </>
  );
}

export const SWITCH_SYNCHRONIZATION_ON_AND_OFF = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [canMove, setCanMove] = useState(true);

  useEffect(() => {
    function handleMove(e) {
      if (canMove) {
        setPosition({ x: e.clientX, y: e.clientY });
      }
    }
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, [canMove]);

  return (
    <>
      <label>
        <input type="checkbox"
          checked={canMove}
          onChange={e => setCanMove(e.target.checked)} 
        />
        The dot is allowed to move
      </label>
      <hr />
      <div style={{
        position: 'absolute',
        backgroundColor: 'pink',
        borderRadius: '50%',
        opacity: 0.6,
        transform: `translate(${position.x}px, ${position.y}px)`,
        pointerEvents: 'none',
        left: -20,
        top: -20,
        width: 40,
        height: 40,
      }} />
    </>
  );
}

function createEncryptedConnection(roomId) {
  // A real implementation would actually connect to the server
  return {
    connect() {
      console.log('✅ 🔐 Connecting to "' + roomId + '... (encrypted)');
    },
    disconnect() {
      console.log('❌ 🔐 Disconnected from "' + roomId + '" room (encrypted)');
    }
  };
}
function createUnencryptedConnection(roomId) {
  // A real implementation would actually connect to the server
  return {
    connect() {
      console.log('✅ Connecting to "' + roomId + '... (unencrypted)');
    },
    disconnect() {
      console.log('❌ Disconnected from "' + roomId + '" room (unencrypted)');
    }
  };
}
export const FIX_A_CONNECTION_SWITCH = () => {
  const [roomId, setRoomId] = useState('general');
  const [isEncrypted, setIsEncrypted] = useState(false);
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
          checked={isEncrypted}
          onChange={e => setIsEncrypted(e.target.checked)}
        />
        Enable encryption
      </label>
      <hr />
      <ChatRoomChallenge2
        roomId={roomId}
        isEncrypted={isEncrypted}
      />
    </>
  );
}
function ChatRoomChallenge2({ roomId, isEncrypted }) {

  useEffect(() => {
    const createConnection = isEncrypted ? createEncryptedConnection : createUnencryptedConnection;
    const connection = createConnection(roomId);
    connection.connect();
    return () => connection.disconnect();
  }, [roomId, isEncrypted]);

  return <h1>Welcome to the {roomId} room!</h1>;
}

const fetchData = (url) => new Promise(resolve => {
  setTimeout(() => {
    resolve(`url`);
  }, 3000);
});
export const POPULATE_A_CHAIN_OF_SELECT_BOXES = () => {
  // const [planetList, setPlanetList] = useState([])
  // const [planetId, setPlanetId] = useState('');

  // const [placeList, setPlaceList] = useState([]);
  // const [placeId, setPlaceId] = useState('');

  // useEffect(() => {
  //   let ignore = false;
  //   fetchData('/planets').then(result => {
  //     if (!ignore) {
  //       console.log('Fetched a list of planets.');
  //       setPlanetList(result);
  //       setPlanetId(result[0].id); // Select the first planet
  //     }
  //   });
  //   return () => {
  //     ignore = true;
  //   }
  // }, []);

  // useEffect(() => {
  //   if (planetId === '') return;
  //   let ignore = false;
  //   fetchData(`/planets/${planetId}/places`)
  //     .then(result => {
  //       if (!ignore) {
  //         setPlaceList(result);
  //         setPlaceId(result[0].id);
  //       }
  //     });

  //   return () => {
  //     ignore = true;
  //   }
  // }, [placeId, planetId]);

  const [planetList, planetId, setPlanetId] = useSelectOptions('/planets');
  const [placeList, placeId, setPlaceId] = useSelectOptions(planetId ? `/planets/${planetId}/places` : null);

  return (
    <>
      <label>
        Pick a planet:{' '}
        <select value={planetId} onChange={e => {
          setPlanetId(e.target.value);
        }}>
          {planetList.map(planet =>
            <option key={planet.id} value={planet.id}>{planet.name}</option>
          )}
        </select>
      </label>
      <label>
        Pick a place:{' '}
        <select value={placeId} onChange={e => {
          setPlaceId(e.target.value);
        }}>
          {placeList.map(place =>
            <option key={place.id} value={place.id}>{place.name}</option>
          )}
        </select>
      </label>
      <hr />
      <p>You are going to: {placeId || '???'} on {planetId || '???'} </p>
    </>
  );
}

// 공통 로직을 빼서 커스텀 hook 을 만들 수도 있다.
const useSelectOptions = (url) => {
  const [list, setList] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  useEffect(() => {
    if (url === null) return;

    let ignore = false;

    fetchData(url)
      .then(result => {
        if (!ignore) {
          setList(result);
          setSelectedId(result[0]);
        }
      });

      return () => {
        ignore = true;
      }
  });

  return [list, selectedId, setSelectedId];
}