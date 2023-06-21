/**
 * Ref 로 DOM 조작하기
 * React 가 DOM 을 자동으로 업데이트 하기 때문에 자주 사용하지는 않지만 가끔 DOM 요소에 액세스 하는 경우가 생긴다.
 * focus, scroll, 크기/위치 측정 등
 * ref callback - ref list 관리할 때 사용할 수 있다.
 * forwardRef - 커스텀 컴포넌트에 Ref 적용
 * useImperativeHandle - 커스텀 컴포넌트 Ref에서 노출된 기능을 제한하는 방법(즉 DOM 의 모든 기능을 제공하지 않고 제한함)
 * flushSync - React 가 DOM 을 동기식으로 업데이트 하도록 강제한다. state update 는 대기열에 들어가 변경되고, ref 는 즉시 업데이트 되면서 발생하는 문제를 해결할 수 있다.
 * ref 를 이용하여 DOM 을 수동으로 수정하면 React 와 충돌할 위험이 있다. React를 이용하지 않고 DOM 을 수동으로 조작하여 자식을 추가/수정/삭제하면 안된다.
 */

import { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { flushSync } from "react-dom";

export const Form = () => {
  const inputRef = useRef(null);

  function handleClick() {
    inputRef.current.focus();
  }

  return (
    <>
      <input ref={inputRef}/>
      <button onClick={handleClick}>
        Focus the input
      </button>
    </>
  )
}

export const CatFriends = () => {
  const firstCatRef = useRef(null);
  const secondCatRef = useRef(null);
  const thirdCatRef = useRef(null);

  function handleScrollToFirstCat() {
    firstCatRef.current.scrollIntoView({
      behaviro: 'smooth',
      bock: 'nearest',
      inline: 'center'
    });
  }

  function handleScrollToSecondCat() {
    secondCatRef.current.scrollIntoView({
      behaviro: 'smooth',
      bock: 'nearest',
      inline: 'center'
    });
  }

  function handleScrollToThirdCat() {
    thirdCatRef.current.scrollIntoView({
      behaviro: 'smooth',
      bock: 'nearest',
      inline: 'center'
    });
  }

  return (
    <>
      <nav>
        <button onClick={handleScrollToFirstCat}>
          Tom
        </button>
        <button onClick={handleScrollToSecondCat}>
          Maru
        </button>
        <button onClick={handleScrollToThirdCat}>
          Jellylorum
        </button>
      </nav>
      <div>
        <ul>
          <li>
            <img
              src="https://placekitten.com/g/200/200"
              alt="Tom"
              ref={firstCatRef}
            />
          </li>
          <li>
            <img
              src="https://placekitten.com/g/300/200"
              alt="Maru"
              ref={secondCatRef}
            />
          </li>
          <li>
            <img
              src="https://placekitten.com/g/250/200"
              alt="Jellylorum"
              ref={thirdCatRef}
            />
          </li>
        </ul>
      </div>
    </>
  )
}

// Ref List 관리하는 방법
// ref callback: ref 설정 시 DOM 노드로 ref callback 호출, 지울 때 null 로 ref callback 호출
const catList = [];
for (let i = 0; i < 10; i++) {
  catList.push({
    id: i,
    imageUrl: 'https://placekitten.com/250/200?image=' + i
  });
}
export const CatFriendsList = () => {
  const itemsRef = useRef(null);

  function scrollToId(itemId) {
    const map = getMap();
    const node = map.get(itemId);
    node.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }

  function getMap() {
    if (itemsRef.current === null) {
      itemsRef.current = new Map();
    }
    return itemsRef.current;
  }

  return (
    <>
      <nav>
        <button onClick={() => scrollToId(0)}>
          Tom
        </button>
        <button onClick={() => scrollToId(5)}>
          Maru
        </button>
        <button onClick={() => scrollToId(9)}>
          Jellylorum
        </button>
        <div>
          <ul>
            {catList.map(cat => (
              <li key={cat.id} ref={(node) => {
                const map = getMap();
                if (node) {
                  // ref 설정 시 node = DOM 으로 호출된다.
                  map.set(cat.id, node);
                } else {
                  // 지울 때 node = null 로 호출된다.
                  map.delete(cat.id);
                }
              }}>
                <img src={cat.imageUrl} alt={`Cat #${cat.id}`}/>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  )
}

// ForwardRef
const MyInput = forwardRef((props, ref) => {
  return <input {...props} ref={ref} />
});

export const FormForwardRef = () => {
  const inputRef = useRef(null);

  function handleClick() {
    inputRef.current.focus();
  }

  return (
    <>
      <MyInput ref={inputRef}/>
      <button onClick={handleClick}>
        Focus the input
      </button>
    </>
  )
}

// useImperativeHandle
const MyInputImperativeHandle = forwardRef((props, ref) => {
  const realInputRef = useRef(null);

  // focus 만 제공한다.
  useImperativeHandle(ref, () => ({
    focus() {
      realInputRef.current.focus();
    }
  }))

  return <input {...props} ref={ref} />
});

export const FormImperativeHandle = () => {
  const inputRef = useRef(null); // JSX 가 아닌 useImperativeHandle 에서 제공한 오브젝트가 current 값이 된다.

  function handleClick() {
    inputRef.current.focus();
  }

  return (
    <>
      <MyInput ref={inputRef}/>
      <button onClick={handleClick}>
        Focus the input
      </button>
    </>
  )
}

// flushSync 에제
let nextId = 0;
let initialTodos = [];
for (let i = 0; i < 20; i++) {
  initialTodos.push({
    id: nextId++,
    text: 'Todo #' + (i + 1)
  });
}
export const TodoList = () => {
  const [text, setText] = useState('');
  const [todos, setTodos] = useState(initialTodos);
  const listRef = useRef(null);

  // 추가한 후, 마지막 아이템으로 스크롤 이동한다.
  function handleAdd() {
    const newTodo = { id: nextId++, text };
    // setState 는 대기열에 들어간 후 수행되는데, current 는 즉시 수행되기 때문에 추가되기 전의 마지막 요소로 스크롤이 이동된다.
    // setTodos(prev => [...prev, newTodo]);
    // setText('');

    // 이를 방지하기 위해, flushSync 를 이용한다.
    flushSync(() => {
      setText('');
      setTodos(prev => [...prev, newTodo]);
    })
    
    listRef.current.lastChild.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    });
  }

  return (
    <>
      <button onClick={handleAdd}>
        Add
      </button>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <ul ref={listRef}>
        {todos.map(todo => <li key={todo.id}>{todo.text}</li>)}
      </ul>
    </>
  )
}

// Challenges
export const PLAY_AND_PAUSE_THE_VIDEO = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  function handleClick() {
    const nextIsPlaying = !isPlaying;
    setIsPlaying(nextIsPlaying);
    if (nextIsPlaying) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }

  return (
    <>
      <button onClick={handleClick}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <video width="250" ref={videoRef}>
        <source
          src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
          type="video/mp4"
        />
      </video>
    </>
  )
}

export const FOCUS_THE_SEARCH_FIELD = () => {
  const inputRef = useRef(null);

  const handleClick = (e) => {
    inputRef.current.focus();
  }

  return (
    <>
      <nav>
        <button onClick={handleClick}>Search</button>
      </nav>
      <input placeholder="Looking for something?" ref={inputRef} />
    </>
  )
}

const challengesCatList = [];
for (let i = 0; i < 10; i++) {
  challengesCatList.push({
    id: i,
    imageUrl: 'https://placekitten.com/250/200?image=' + i
  });
}
export const SCROLLING_AN_IMAGE_CAROUSEL = () => {
  const [index, setIndex] = useState(0);
  const selectRef = useRef(null);
  

  const handleClick = () => {
    flushSync(() => setIndex(prev => (prev+1)%challengesCatList.length));
    selectRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });
  }

  return (
    <>
      <nav>
        <button onClick={handleClick}>Next</button>
      </nav>
      <div>
        <ul>
          {challengesCatList.map((cat, i) => (
            <li key={cat.id} ref={index === i ? selectRef : null}>
              {index === i ? "HERE" : ""}
              <img src={cat.imageUrl} alt={`Cat #${cat.id}`}/>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}


const SearchButton = ({ onClick }) => {
  return <button onClick={onClick}>Search</button>
}

const SearchInput = forwardRef((props, ref) => {
  const realInputRef = useRef(null);
  useImperativeHandle(ref, () => ({
    focus() {
      realInputRef.current.focus();
    },
    disabled() {
      realInputRef.current.disabled = true;
    }
  }))
  return <input {...props} ref={realInputRef} />
});

export const FOCUS_THE_SEARCH_FIELD_WITH_SEPARATE_COMPONENTS = () => {
  const searchInputRef = useRef(null);
  
  const handleClick = (e) => {
    searchInputRef.current.focus();
    // searchInputRef.current.disabled();
  }

  return (
    <>
      <nav>
        <SearchButton onClick={handleClick}/>
      </nav>
      <SearchInput ref={searchInputRef}/>
    </>
  )
}
