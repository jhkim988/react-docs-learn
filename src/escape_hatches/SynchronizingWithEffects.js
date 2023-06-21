/**
 * Effect
 * 외부 시스템과 동기화할 때 사용한다.
 * 예시) React 컴포넌트가 아닌 것을 컨트롤 할 때, 서버와 연결할 때, 로그 전송할 때 등
 * Effect 는 렌더링 이후에 코드를 실행할 수 있도록 하며, 외부 시스템과 동기화시킬 수 있다.
 * 
 * 렌더링 코드 - 컴포넌트 최상단에 위치해서, props 와 state 를 변환하여 JSX 를 리턴한다.
 * 이벤트 핸들러 - 컴포넌트 내부에 있는 중첩된 함수. 계산만 하지 않고, 작업을 수행한다. (input 필드 업데이트, HTTP 요청, 사이드 이펙트)
 * Effect - 특정 이벤트가 아닌 렌더링 자체로 발생하는 사이드 이펙트 지정
 * 주의) 외부 시스템과 연동하지 않고, state 를 바꾸기 위해서 사용하는 경우, Effect 가 필요 없을 가능성이 있다.
 * 
 * 개발 모드에서는 모든 컴포넌트가 처음 마운트 되고, 다시 unmount 된 후에 mount 된다. 이로써 clearnup 함수를 테스트할 수 있다.
 * cleanup 함수 사용 예시
 * 1. 리액트 컴포넌트가 아닌 위젯 컨트롤 -> cleanup 함수에서 닫는 등의 작업을 한다.
 * 2. 이벤트 구독 -> cleanup 함수에서 이벤트 구독을 제거한다.
 * 3. 애니메이션 트리거 -> cleanup 함수에서 초기값으로 되돌려준다.
 * 4. 데이터 페치 -> 보낸 요청을 취소할 수는 없다. flag 변수를 이용하여, 요청 도중 cleanup 됐을 때, 응답이 state 등을 변경하지 않도록 컨트롤 한다.
 *    useEffect 로 데이터를 가져오는 것은 여러 단점이 있다.
 *    1) Effect 는 서버에서 실행되지 않는다. 최초로 데이터를 가져올 때 "데이터가 로드돼야 한다는 사실"을 발견하기 위해 모든 JS 를 다운로드하고 렌더링 해야한다.
 *    2) 네트워크 워터폴이 만들어진다. 상위 컴포넌트를 렌더링 하고 순차적으로 하위 컴포넌트에서 데이터를 가져오고 렌더링하게 된다. 모든 데이터를 병렬로 가져오는 것보다 느리게 된다.
 *    3) 컴포넌트가 unmount 됐다가 다시 mount 되면 데이터를 다시 가져온다. 캐싱, 프리로드 등을 하지 않는다.
 *    4) 많은 보일러플레이트 코드, 레이스 컨디션 등이 발생한다.
 *    커스텀 hook 이나, React Query, useSWR 등으로 교체하는 것이 좋다.
 * 5. 로그 전송 - production 에서는 로그가 두 번 찍히지 않는다.
 * 
 * Effect 를 사용하지 않아도 되는 예시
 * 1. 초기화 - useEffect 에 넣지 말고, React 외부에 작성하면 한 번 실행된다.
 * 2. 렌더링 시 동작하는게 아니고, 이벤트 핸들러를 사용해야할 때
 */

import { useRef, useState, useEffect } from "react";

const VideoPlayer = ({ src, isPlaying }) => {
  const ref = useRef(null);

  // 렌더링 코드 - ref 가 지정되지 않았으므로 오류 발생된다.
  // 렌더링 도중 DOM 수정 등을 하면 안된다.
  // if (isPlaying) {
  //   ref.current.play();
  // } else {
  //   ref.current.pause();
  // }

  // 렌더링이 모두 완료 되고 실행된다.
  // 외부시스템인 브라우저 media api 와 연동
  useEffect(() => {
    if (isPlaying) {
      console.log('Calling video.play()');
      ref.current.play();
    } else {
      console.log('Calling video.pause()');
      ref.current.pause();
    }
  }, [isPlaying]); // dep 는 Object.is() 메서드를 통해 이전 값과 같은지 확인한다.

  return <video ref={ref} src={src} loop playsInline />
}

export const VideoPlayerExample = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [text, setText] = useState('');
  return (
    <>
      <input value={text} onChange={(e) => setText(e.target.value)}/>
      <button onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <VideoPlayer isPlaying={isPlaying} src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"/>
    </>
  )
}

// cleanup function
// 개발 모드에서는 모든 컴포넌트를 unmount 한 후에 다시 mount 한다.
// effect 의 clearnup function 을 테스트 할 수 있도록 하기 위함이다.(기본적으로 Strict Mode 에서 활성화된다.)
// useEffect 가 실행되고 clearup 한 뒤에 다시 실행돼도, 한 번만 실행된 것과 차이가 없어야 한다.
export function createConnection() {
  // A real implementation would actually connect to the server
  return {
    connect() {
      console.log('✅ Connecting...');
    },
    disconnect() {
      console.log('❌ Disconnected.');
    }
  };
}

export const ChatRoom = () => {
  useEffect(() => {
    const connection = createConnection();
    connection.connect();

    return () => connection.disconnect();
  }, []);

  return <h1>Welcome to the chat!</h1>
}

// Challenges
export const FOCUS_A_FIELD_ON_MOUNT = ({ value, onChange }) => {
  const ref = useRef(null);

  useEffect(() => {
    ref.current.focus();
  }, []);

  return (
    <input ref={ref} value={value} onChange={onChange}/>
  )
}

export const FOCUS_A_FIELD_CONDITIONALLY = ({ shouldFocus, value, onChange }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (shouldFocus) {
      ref.current.focus();
    }
  }, [shouldFocus]);

  return (
    <input ref={ref} value={value} onChange={onChange} />
  )
}

export const FIX_AN_INTERVAL_THAT_FIRES_TWICE = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function onTick() {
      setCount(prev => prev+1);
    }

    let timerID = setInterval(onTick, 1000);
    return () => clearInterval(timerID);
  }, []);

  return <h1>{count}</h1>
}

const fetchBio = (person) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`This is ${person}'s bio.`);
    }, 3000);
  })
}

export const FIX_FETCHING_INSIDE_AN_EFFECT = () => {
  const [person, setPerson] = useState('Alice');
  const [bio, setBio] = useState(null);

  useEffect(() => {
    let ignore = false;

    setBio(null);
    fetchBio(person).then(result => {
      !ignore && setBio(result);
    });
  
    return () => {
      ignore = true;
    }
  }, [person]);

  return (
    <>
      <select value={person} onChange={e => {
        setPerson(e.target.value);
      }}>
        <option value="Alice">Alice</option>
        <option value="Bob">Bob</option>
        <option value="Taylor">Taylor</option>
      </select>
      <br />
      <p><i>{bio ?? 'Loading...'}</i></p>
    </>
  )
}