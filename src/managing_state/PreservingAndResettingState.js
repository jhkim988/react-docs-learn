/**
 * State - 상태 보존과 리셋
 * UI tree
 * - react 는 트리 구조를 다루고, react-dom 은 트리를 브라우저에 그려주는 역할을 한다.
 * 
 * state 는 트리의 위치와 관련돼 있다.
 * - 컴포넌트를 트리에서 없앴다가 다시 만들면 state 는 유지되지 않는다.
 * - css 를 이용하여 컴포넌트를 보이지 않게 했다가 다시 보이게 하면 state 는 유지 된다. (트리에서의 순서가 유지됨)
 * isFancy state 를 바꾸었을 때:
 * - {isFancy ? <Counter isFancy={true} /> : <Counter isFancy={false} />} 트리에서 위치가 같으므로 state 가 유지된다.
 * - {isFancy && <Counter isFancy={true} />} {!isFancy && <Counter isFancy={false} />} 트리에서 위치가 다르므로 state 가 유지되지 않는다.
 * - 중요한 것은 JSX 태그의 위치가 아니라, 트리의 위치이다.
 * 
 * 같은 위치여도 다른 컴포넌트라면 state 가 초기화된다.(다시 처음의 status 로 변환해도)
 * 
 * 같은 위치의 같은 컴포넌트의 상태를 리셋하고 싶을 땐 key 를 이용한다.
 * 트리의 위치를 기반으로 한 방법은 직관적이지 않음.
 */

import { useState } from 'react';

export const Counter = () => {
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(false);

  let className = 'counter';
  if (hover) {
    className += ' hover';
  }

  return (
    <div
			className={className}
			onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <h1>{score}</h1>
      <button onClick={() => setScore(score + 1)}>
        Add one
      </button>
    </div>
  );
}

// 1. 같은 JSX 객체여도 트리에서 순서가 다르기 때문에 별도의 state 를 갖는다.
export const Example1 = () => {
	const counter = <Counter />;
	return (
		<div>
			{counter}
			{counter}
		</div>
	)
}

// 2. 트리에서 순서가 다르기 때문에 별도의 state 를 갖는다.
export const Example2 = () => {
	return (
		<div>
			<Counter />
			<Counter />
		</div>
	)
}

// 3. showB 의 상태가 바뀌어도 트리에서의 순서가 다르기 때문에 이전의 Counter 상태를 기억하지 않는다.
export const Example3 = () => {
  const [showB, setShowB] = useState(true);
  return (
    <div>
      <Counter />
      {showB && <Counter />} 
      <label>
        <input
          type="checkbox"
          checked={showB}
          onChange={e => {
            setShowB(e.target.checked)
          }}
        />
        Render the second counter
      </label>
    </div>
  );
}

// 4. isFancy 상태가 바뀌는 경우
// 삼항연산자 부분의 Counter 는 트리에서 위치가 같기 때문에 상태가 공유된다.
// 그 다음부분은 트리에서 위치가 다르기 때문에(중간에 div 자식인 isFancy 가 추가됨) 상태가 공유되지 않는다.
export const Example4 = () => {
  const [isFancy, setIsFancy] = useState(false);
  return (
    <div>
      {isFancy ? (
        <Counter isFancy={true} /> 
      ) : (
        <Counter isFancy={false} /> 
      )}
      {isFancy && <Counter isFancy={true} />}
      {!isFancy && <Counter isFancy={false} />}
      <label>
        <input
          type="checkbox"
          checked={isFancy}
          onChange={e => {
            setIsFancy(e.target.checked)
          }}
        />
        Use fancy styling
      </label>
    </div>
  );
}

// 5. isPaused 상태를 조작하여 Counter -> p -> Counter 로 변경하여도 Counter 의 state 는 유지되지 않는다.
// 같은 위치여도 다른 컴포넌트라면 state 가 유지되지 않는다.
export const Example5 = () => {
  const [isPaused, setIsPaused] = useState(false);
  return (
    <div>
      {isPaused ? (
        <p>See you later!</p> 
      ) : (
        <Counter /> 
      )}
      <label>
        <input
          type="checkbox"
          checked={isPaused}
          onChange={e => {
            setIsPaused(e.target.checked)
          }}
        />
        Take a break
      </label>
    </div>
  );
}

// 6. div 와 section 이 다르므로 state 가 공유되지 않는다.
export const Example6 = () => {
  const [isFancy, setIsFancy] = useState(false);
  return (
    <div>
      {isFancy ? (
        <div>
          <Counter isFancy={true} /> 
        </div>
      ) : (
        <section>
          <Counter isFancy={false} />
        </section>
      )}
      <label>
        <input
          type="checkbox"
          checked={isFancy}
          onChange={e => {
            setIsFancy(e.target.checked)
          }}
        />
        Use fancy styling
      </label>
    </div>
  );
}

// 7. Counter 의 위치가 같으므로 상태가 유지된다. key 를 설정하여 공유되지 않도록 한다.
// Taylor 에서 Sarah 로 변경됐을 때 key 를 다르게 하여 다른 컴포넌트인 것을 알린다.
export const ScoreBoard = () => {
	const [isPlayerA, setIsPlayerA] = useState(true);
  return (
    <div>
      {isPlayerA ? (
        <Counter person="Taylor" key="Taylor"/>
      ) : (
        <Counter person="Sarah" key="Sarah"/>
      )}
      <button onClick={() => {
        setIsPlayerA(!isPlayerA);
      }}>
        Next player!
      </button>
    </div>
  );
}

// Challenges
export const FIX_DISAPPEARING_INPUT_TEXT = () => {
	const [showHint, setShowHint] = useState(false);
  return (
    <div>
        {showHint && <p><i>Hint: Your favorite city?</i></p>}      
      <Form />
      <button onClick={() => {
        setShowHint(prev => !prev);
      }}>{!showHint ? "Show hint" : "Hide hint"}</button>
    </div>
  );
}

function Form() {
  const [text, setText] = useState('');
  return (
    <textarea
      value={text}
      onChange={e => setText(e.target.value)}
    />
  );
}

export const SWAP_TWO_FORM_FIELDS = () => {
	const [reverse, setReverse] = useState(false);
  let checkbox = (
    <label>
      <input
        type="checkbox"
        checked={reverse}
        onChange={e => setReverse(e.target.checked)}
      />
      Reverse order
    </label>
  );
	return (
		<>
			{ reverse ? <Field label="Last name" key="Last name"/> : <Field label="First name" key="First name"/>} 
			{ reverse ? <Field label="First name" key="First name"/>  : <Field label="Last name" key="Last name"/>} 
			{checkbox}
		</>
	);
}

function Field({ label }) {
  const [text, setText] = useState('');
  return (
    <label>
      {label}:{' '}
      <input
        type="text"
        value={text}
        placeholder={label}
        onChange={e => setText(e.target.value)}
      />
    </label>
  );
}

export const RESET_A_DETAIL_FORM = ({ initialContacts }) => {
  const [contacts, setContacts] = useState(initialContacts);
  const [selectedId, setSelectedId] = useState(0);
  const selectedContact = contacts.find(c => c.id === selectedId);

  function handleSave(updatedData) {
    const nextContacts = contacts.map(c => {
      if (c.id === updatedData.id) {
        return updatedData;
      } else {
        return c;
      }
    });
    setContacts(nextContacts);
  }

  return (
    <div>
      <ContactList
        contacts={contacts}
        selectedId={selectedId}
        onSelect={id => setSelectedId(id)}
      />
      <hr />
      <EditContact
        key={selectedId}
        initialData={selectedContact}
        onSave={handleSave}
      />
    </div>
  )
}

export function ContactList({ contacts, selectedId, onSelect }) {
  return (
    <section>
      <ul>
        {contacts.map(contact =>
          <li key={contact.id}>
            <button onClick={() => {
              onSelect(contact.id);
            }}>
              {contact.id === selectedId ?
                <b>{contact.name}</b> :
                contact.name
              }
            </button>
          </li>
        )}
      </ul>
    </section>
  );
}

export function EditContact({ initialData, onSave }) {
  const [name, setName] = useState(initialData.name);
  const [email, setEmail] = useState(initialData.email);
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
          id: initialData.id,
          name: name,
          email: email
        };
        onSave(updatedData);
      }}>
        Save
      </button>
      <button onClick={() => {
        setName(initialData.name);
        setEmail(initialData.email);
      }}>
        Reset
      </button>
    </section>
  );
}

export function CLEAR_AN_IMAGE_WHILE_IT_IS_LOADING() {
  const [index, setIndex] = useState(0);
  const hasNext = index < images.length - 1;

  function handleClick() {
    if (hasNext) {
      setIndex(index + 1);
    } else {
      setIndex(0);
    }
  }

  let image = images[index];
  return (
    <>
      <button onClick={handleClick}>
        Next
      </button>
      <h3>
        Image {index + 1} of {images.length}
      </h3>
      <img src={image.src} key={image.src} alt={image.place}/>
      <p>
        {image.place}
      </p>
    </>
  );
}

let images = [{
  place: 'Penang, Malaysia',
  src: 'https://i.imgur.com/FJeJR8M.jpg'
}, {
  place: 'Lisbon, Portugal',
  src: 'https://i.imgur.com/dB2LRbj.jpg'
}, {
  place: 'Bilbao, Spain',
  src: 'https://i.imgur.com/z08o2TS.jpg'
}, {
  place: 'Valparaíso, Chile',
  src: 'https://i.imgur.com/Y3utgTi.jpg'
}, {
  place: 'Schwyz, Switzerland',
  src: 'https://i.imgur.com/JBbMpWY.jpg'
}, {
  place: 'Prague, Czechia',
  src: 'https://i.imgur.com/QwUKKmF.jpg'
}, {
  place: 'Ljubljana, Slovenia',
  src: 'https://i.imgur.com/3aIiwfm.jpg'
}];


export function FIX_MISPLACED_STATE_IN_THE_LIST() {
  const [reverse, setReverse] = useState(false);

  const displayedContacts = [...contacts];
  if (reverse) {
    displayedContacts.reverse();
  }

  return (
    <>
      <label>
        <input
          type="checkbox"
          value={reverse}
          onChange={e => {
            setReverse(e.target.checked)
          }}
        />{' '}
        Show in reverse order
      </label>
      <ul>
        {displayedContacts.map((contact, i) =>
          <li key={contact.id}>
            {contact}
          </li>
        )}
      </ul>
    </>
  );
}

const contacts = [
  { id: 0, name: 'Alice', email: 'alice@mail.com' },
  { id: 1, name: 'Bob', email: 'bob@mail.com' },
  { id: 2, name: 'Taylor', email: 'taylor@mail.com' }
];
