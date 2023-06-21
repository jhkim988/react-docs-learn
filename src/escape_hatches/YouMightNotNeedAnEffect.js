/**
 * Effect 가 필요 없는 경우
 * 1. 렌더링을 위해 데이터를 변환하는 경우 -> 비효율적으로 여러 번 렌더링 된다.
 * 2. 이벤트를 처리하는 경우 -> 이벤트 핸들러를 이용해야 한다.
 * 3. 외부 시스템과 동기화하려는 게 아닌 경우
 * 
 * 구체적인 예시
 * 1. 기존의 props/state 를 이용하여 state 를 초기화하려는 경우 -> 애초에 state 로 작성하면 안된다.
 * 2. state 와 useEffect 를 이용한 캐싱 -> useMemo 를 이용한다.
 * 3. props 가 바뀔 때 모든 state 를 초기화하려면 -> 해당 컴포넌트를 이용하는 부모 컴포넌트에서 key 를 이용한다. 
 * 4. props 가 바뀔 때 일부 state 를 초기화 하려면 -> state 를 다시 설계해본다.
 * 5. 이벤트 핸들러의 로직을 공유할 때 -> Effect 가 아닌 함수로 빼서 해당 함수를 이용한다.
 * 6. POST 요청을 보낼 때 -> 이벤트 핸들러로 처리해야하는 로직인지 판단한다.
 * 7. 계산 체인 - 다른 상태에 따라 상태를 조정하는 효과 -> state 와 계산함수를 다시 설계한다.
 * 8. 초기화 - 개발모드에서도 한 번만 실행되도록 flag 변수를 두거나, 아예 리액트 앱 밖으로 빼서 최초로 한 번만 실행 시킨다(과도하게 사용하지 말 것).
 * 9. 상태 변경을 부모 구성 요소에 알릴 때 - useEffect 를 사용하지 말고, 함수로 빼서 해당 함수를 호출한다.
 * 10. 자식에서 부모 컴포넌트로 데이터 전달할 때 - 부모에서 자식으로 전달시키도록 한다.
 * 11. 외부 스토어 구독 - useSyncExternalStore 이용한다.
 * 12. 데이터 페치 - clearnup 함수를 작성한다. 하지만 hook 으로 추출하거나, 프레임워크, 라이브러리를 사용하는게 더 낫다.
 */

import { useState, useEffect, useMemo, useSyncExternalStore } from "react";

// ========== props/state 를 이용하여 다른 state 를 변경하는 경우 ==========
export const Form = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // 렌더링을 위해 데이터를 변환하는 경우
  // const [fullName, setFullName] = useState("");
  // useEffect(() => {
  //   setFullName(`${firstName} ${lastName}`);
  // }, [firstName, lastName]);

  
  // 다음과 같이 개선한다.
  // 기존 props/state 에서 계산해서 얻을 수 있는 경우, 새로 state 를 만들지 않는다.
  const fullName = `${firstName} ${lastName}`;
}

// ========== 캐싱 - useMemo ==========
const getFilteredTodos = (todos, filterCallback) => {
  // some slow logic
  for (let i = 0; i < (1 << 30); i++) {
    for (let j = 0; j < (1 << 30); j++) {

    }
  }
  return todos.filter(filterCallback);
}

export const TodoList = ({ todos, filter }) => {
  const [newTodo, setNewTodo] = useState('');

  // props/state 로부터 얻을 수 있으므로 visibleTodos 를 state 로 선언하는 것은 부적절하다.
  // const [visibleTodos, setVisibleTodos] = useState([]);
  // useEffect(() => {
  //   setVisibleTodos(getFilteredTodos(todos, filter));
  // }, [todos, filter]);

  // getFilteredTodos 함수가 느리기 때문에, 자주 계산하지 않고 캐싱한다.
  // useMemo 는 렌더링 도중에 실행되므로 주의해야 한다. (pure)
  // const visibleTodos = getFilteredTodos(todos, filter);
  const visibleTodos = useMemo(() => getFilteredTodos(todos, filter), [todos, filter]);
}

// ========== props 가 바뀔 때 모든 state 를 초기화 하는 예시 ==========
export const ProfilePage = ({ userId }) => {
  // const [comment, setComment] = useState('');

  // props 가 바뀌면 모든 state 를 변경하려면 -> useEffect 보다 key 를 이용한다.
  // useEffect(() => {
  //   setComment('');
  // }, [userId]);

  // key 인 userId 가 바뀌면 Profile 컴포넌트가 교체되므로, comment 도 초기화 된다.
  return (
    <Profile
      userId={userId}
      key={userId}
    />
  )
}

export const Profile = ({ userId }) => {
  const [comment, setComment] = useState('');
  
  // ...
}

// ========== props 가 바뀔 때 일부 state 를 초기화 하는 예시 ==========
const List = ({ items }) => {
  const [isReverse, setIsReverse] = useState(false);
  // const [selection, setSelection] = useState(null);

  // useEffect 를 이용한 방식 - (X)
  // useEffect(() => {
  //   setSelection(null);
  // }, [items]);

  // 이전 상태를 저장하는 방식 - 그나마 낫지만 코드 이해와 디버깅이 어렵다.
  // const [prevItems, setPrevItems] = useState(items);
  // if (prevItems !== items) {
  //   setPrevItems(items);
  //   setSelection(null);
  // }
  
  // selection 대신 selectedId 를 state 로 설정하는 방식
  const [selectedId, setSelectedId] = useState(null);
  const selection = items.filter(item => item.id === selectedId) ?? null;
}

// ========== 이벤트 핸들러의 로직을 공유하는 경우 예시 ==========
// 제품을 구매할 때, 장바구니에 담을 때 showNotification 을 호출한다.
// 이 호출이 반복적으로 느껴져, useEffect 로 처리했다. (X) -> 함수로 빼서, 해당 함수를 이용하는 게 낫다.
const navigateTo = (url) => window.href = url;
const showNotification = (message) => alert(message);
const ProductPage = ({ product, addToCart }) => {
  // useEffect(() => {
  //   if (product.isInCart) {
  //     showNotification(`Added ${product.name} to the shoopping cart!`);
  //   }
  // }, [product]);

  function buyProduct() {
    if (product.isInCart) {
      showNotification(`Added ${product.name} to the shoopping cart!`);
    }
  }

  function handleBuyClick() {
    // addToCart(product);
    buyProduct();
  }

  function handleCheckoutClick() {
    // addToCart(product);
    buyProduct();
    navigateTo('/checkout');
  }
}

// ========== POST 요청을 보내는 예시 ==========
const post = (url, body) => fetch(url, body);
const FormPOST = () => {
  const [firstName, setFiestName] = useState('');
  const [lastName, setLastName] = useState('');

  // 페이지에 방문하면 방문 로그를 보내는 로직, Effect 에 있는 게 맞다.
  useEffect(() => {
    post(`/anayltic/event`, { eventName: "visit_form" });
  }, []);

  // jsonToSubmit 상태가 바뀌면 요청을 보내는 로직. 이벤트 핸들러에서 보내는 게 맞다.
  // const [jsonToSubmit, setJsonToSubmit] = useState(null);
  // useEffect(() => {
  //   if (jsonToSubmit !== null) {
  //     post(`/api/register`, jsonToSubmit);
  //   }
  // }, [jsonToSubmit]);

  function handleSubmit(e) {
    e.preventDefault();
    // setJsonToSubmit({ firstName, lastName });
    post(`/api/register`, { firstName, lastName });
  }
}

// ========== 계산 체인 예시 ==========
const GAME_CHAIN = () => {
  const [card, setCard] = useState(null);
  const [goldCardCount, setGoldCardCount] = useState(0);
  const [round, setRound] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);

  // card 가 gold 인 경우
  useEffect(() => {
    if (card !== null && card.gold) {
      setGoldCardCount(prev => prev + 1);
    }
  }, [card]);

  // goldCardCount 가 3 보다 큰 경우
  useEffect(() => {
    if (goldCardCount > 3) {
      setRound(prev => prev + 1);
      setGoldCardCount(0);
    }
  }, [goldCardCount]);

  // round 가 5 보다 큰 경우
  useEffect(() => {
    if (round > 5) {
      setIsGameOver(true);
    }
  }, [round]);

  function handlePlaceCard(nextCard) {
    if (isGameOver) {
      throw Error(`Game already ended.`);
    } else {
      setCard(nextCard);
    }
  }
}

const Game = () => {
  const [card, setCard] = useState(null);
  const [goldCardCount, setGoldCardCount] = useState(0);
  const [round, setRound] = useState(1);
  const isGameOver = round > 5;

  function handlePlaceCard(nextCard) {
    if (isGameOver) {
      throw Error(`Game already ended.`);
    } else {
      setCard(nextCard);
      if (nextCard.gold) {
        if (goldCardCount <= 3) {
          setGoldCardCount(prev => prev + 1);
        } else {
          setRound(prev => prev + 1);
          setGoldCardCount(0);
          if (round === 5) {
            alert(`Good game!`);
          }
        }
      }
    }
  }
}

// ========== 상태 변경을 부모 컴포넌트에 알릴 때 ==========
const isCloserToRightEdge = (e) => true;
const Toggle = ({ onChange }) => {
  const [isOn, setIsOn] = useState(false);

  // 핸들러에서 state 를 변경하면 onChange 를 호출하는 패턴
  // useEffect(() => {
  //   onChange(isOn);
  // }, [isOn, onChange])

  // 함수로 빼서 직접 호출한다.
  // 혹은 isOn 상태를 부모 컴포넌트로 올려서, updateToggle 대신 onChange(isOn) 을 직접 호출하게 할 수도 있다. 이는 부모가 Toggle 을 완전히 제어할 수 있도록 한다.
  function updateToggle(nextIsOn) {
    setIsOn(nextIsOn);
    onChange(nextIsOn);
  }

  function handleClick() {
    // setIsOn(!isOn);
    updateToggle(!isOn);
  }

  function handleDragEnd(e) {
    if (isCloserToRightEdge(e)) {
      // setIsOn(true);
      updateToggle(true);
    } else {
      // setIsOn(false);
      updateToggle(false);
    }
  }
}

// ========== 부모 컴포넌트에 데이터 보낼 때 ==========
const useSomeAPI = () => ["data"];
const Parent = () => {
  // const [data, setData] = useState(null);
  // return <Child onFetched={setData} />

  const data = useSomeAPI();
  return <Child data={data}/>
}

// const Child = ({ onFetched }) => {
const Child = ({ data }) => {
  // const data = useSomeAPI();
  // useEffect(() => {
  //   if (data) {
  //     onFetched(data);
  //   }
  // }, [data, onFetched]);

  // ...
}

// ========== 외부 스토어 사용(react 18) ==========
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    function updateState() {
      setIsOnline(navigator.onLine);
    }

    updateState();

    window.addEventListener("online", updateState);
    window.addEventListener("offline", updateState);

    return () => {
      window.removeEventListener("online", updateState);
      window.removeEventListener("offline", updateState);
    }
  }, []);

  return isOnline;
}

const subscribe = (callback) => {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);

  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  }
}

const useOnlineStatusSyncExternalStore = () => {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true  
  )
}

// ========== 데이터 페칭(cleanup) ==========
const fetchResults = (query, page) => fetch(query, { param: { page }}).then(res => res.json());
const SearchResults = ({ query }) => {
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let ignore = false;
    fetchResults(query, page)
      .then(json => {
        !ignore && setResults(json);
      });

    return () => {
      ignore = true;
    }
  }, [query, page]);

  function handleNextPageClick() {
    setPage(page + 1);
  }
}

// Challenges
let nextId = 0;
function createTodo(text, completed = false) {
  return {
    id: nextId++,
    text,
    completed
  };
}
const initialTodos = [
  createTodo('Get apples', true),
  createTodo('Get oranges', true),
  createTodo('Get carrots'),
];

export const TRANSFORM_DATA_WITHOUT_EFFECTS = () => {
  const [todos, setTodos] = useState(initialTodos);
  const [showActive, setShowActive] = useState(false);
  const activeTodos = todos.filter(todo => !todo.completed);
  const visibleTodos = showActive ? activeTodos : todos;

  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={showActive}
          onChange={e => setShowActive(e.target.checked)}
        />
        Show only active todos
      </label>
      <NewTodo onAdd={newTodo => setTodos([...todos, newTodo])} />
      <ul>
        {visibleTodos.map(todo => (
          <li key={todo.id}>
            {todo.completed ? <s>{todo.text}</s> : todo.text}
          </li>
        ))}
      </ul>
      <footer>
        {activeTodos.length} todos left
      </footer>
    </>
  );
}

function NewTodo({ onAdd }) {
  const [text, setText] = useState('');

  function handleAddClick() {
    setText('');
    onAdd(createTodo(text));
  }

  return (
    <>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button onClick={handleAddClick}>
        Add
      </button>
    </>
  );
}

let calls = 0;
function getVisibleTodos(todos, showActive) {
  console.log(`getVisibleTodos() was called ${++calls} times`);
  const activeTodos = todos.filter(todo => !todo.completed);
  const visibleTodos = showActive ? activeTodos : todos;
  return visibleTodos;
}

export const CACHE_A_CALCULATION_WITHOUT_EFFECTS = () => {
  const [todos, setTodos] = useState(initialTodos);
  const [showActive, setShowActive] = useState(false);
  const [text, setText] = useState('');
  const visibleTodos = useMemo(() => getVisibleTodos(todos, showActive), [todos, showActive]);

  function handleAddClick() {
    setText('');
    setTodos([...todos, createTodo(text)]);
  }

  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={showActive}
          onChange={e => setShowActive(e.target.checked)}
        />
        Show only active todos
      </label>
      <input value={text} onChange={e => setText(e.target.value)} />
      <button onClick={handleAddClick}>
        Add
      </button>
      <ul>
        {visibleTodos.map(todo => (
          <li key={todo.id}>
            {todo.completed ? <s>{todo.text}</s> : todo.text}
          </li>
        ))}
      </ul>
    </>
  );
}

const EditContact = ({ savedContact, onSave }) => {
  const [name, setName] = useState(savedContact.name);
  const [email, setEmail] = useState(savedContact.email);

  return (
    <section>
      <label>
        Name:{' '}
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </label>
      <label>
        Email:{' '}
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </label>
      <button onClick={() => {
        const updatedData = {
          id: savedContact.id,
          name: name,
          email: email
        };
        onSave(updatedData);
      }}>
        Save
      </button>
      <button onClick={() => {
        setName(savedContact.name);
        setEmail(savedContact.email);
      }}>
        Reset
      </button>
    </section>
  );
}
export const RESET_STATE_WITHOUT_EFFECTS = (props) => {
  return <EditContact {...props} key={props.savedContact.id}/>
}

function sendMessage(message) {
  console.log('Sending message: ' + message);
}
export const SUBMIT_A_FORM_WITHOUT_EFFECTS = () => {
  const [showForm, setShowForm] = useState(true);
  const [message, setMessage] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setShowForm(false);
    sendMessage(message);
  }

  if (!showForm) {
    return (
      <>
        <h1>Thanks for using our services!</h1>
        <button onClick={() => {
          setMessage('');
          setShowForm(true);
        }}>
          Open chat
        </button>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        placeholder="Message"
        value={message}
        onChange={e => setMessage(e.target.value)}
      />
      <button type="submit" disabled={message === ''}>
        Send
      </button>
    </form>
  );
}