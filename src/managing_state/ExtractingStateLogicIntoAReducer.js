/**
 * State 로직을 Reducer 로 추출하는 방법
 * 1. setState 를 dispatch로 옮긴다.
 * 2. dispatch 의 action 을 바탕으로 Reducer 함수를 작성한다.
 * 3. 컴포넌트에서 useReducer 를 이용한다.
 * 
 * useState 와 비교
 * 1. 코드량은 useReducer 가 더 많다.
 * 2. 상태가 단순하면 useState 가 읽기 더 쉽지만, 복잡해지면 useReducer 가 업데이트 로직을 파악하기 더 쉽다. 
 * 3. Reducer 에 console.log 를 추가하여 모든 상태 업데이트를 파악할 수 있다.
 * 4. Reducer 는 순수함수이기 때문에 테스트하기 쉽다.
 * 
 * reducer 를 잘 작성하는 방법
 * 1. reducer 는 순수함수여야 한다. 같은 input 으로 항상 같은 결과가 나와야 하며, reducer 내부에서 서버에 요청, Timeout, 어떤 이펙트를 실행하면 안된다.
 * 2. 데이터가 여러 번 변경되더라도, 각각의 액션은 하나의 사용자 상호작용을 해결해야 한다.
 * 
 */

import { useReducer, useState } from "react";

// Challenges
const contacts = [
  {id: 0, name: 'Taylor', email: 'taylor@mail.com'},
  {id: 1, name: 'Alice', email: 'alice@mail.com'},
  {id: 2, name: 'Bob', email: 'bob@mail.com'},
];

export const DISPATCH_ACTIONS_FROM_EVENT_HANDLERS = () => {
  const [state, dispatch] = useReducer(messengerReducer, initialState);
  const message = state.messages[state.selectedId];
  const contact = contacts.find((c) => c.id === state.selectedId);
  return (
    <div>
      <ContactList
        contacts={contacts}
        selectedId={state.selectedId}
        dispatch={dispatch}
      />
      <Chat
        key={contact.id}
        message={message}
        contact={contact}
        dispatch={dispatch}
      />
    </div>
  );
}

export const initialState = {
  selectedId: 0,
  messages: { 0: '' },
};

export function messengerReducer(state, action) {
  switch (action.type) {
    case 'changed_selection': {
      return {
        ...state,
        selectedId: action.contactId,
      };
    }
    case 'edited_message': {
      return {
        ...state,
        messages: { ...state.messages, [state.selectedId]: action.message }
      };
    }
    case 'sent_message': {
      return {
        ...state,
        messages: { ...state.messages, [state.selectedId]: ''},
      }
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}

export function ContactList({contacts, selectedId, dispatch}) {
  return (
    <section className="contact-list">
      <ul>
        {contacts.map((contact) => (
          <li key={contact.id}>
            <button
              onClick={() => {
                dispatch({ type: "changed_selection", contactId: contact.id })
              }}>
              {selectedId === contact.id ? <b>{contact.name}</b> : contact.name}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Chat({contact, message, dispatch}) {
  return (
    <section className="chat">
      <textarea
        value={message}
        placeholder={'Chat to ' + contact.name}
        onChange={(e) => {
          dispatch({ type: "edited_message", message: e.target.value })
        }}
      />
      <br />
      <button onClick={() => {
        alert(`TO: ${contact.name} - ${message}`);
        dispatch({ type: "sent_message" })
      }}>Send to {contact.email}</button>
    </section>
  );
}

export const useMyReducer = (reducer, initialState) => {
  const [state, setState] = useState(initialState);
  const dispatch = (action) => setState(prev => reducer(prev, action));
  return [state, dispatch];
}