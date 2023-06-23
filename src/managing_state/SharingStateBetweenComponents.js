/**
 * 여러 컴포넌트가 상태를 공유하는 방법 - 상태 끌어올리기
 * 1. state 를 없애고 props 로 바꾼다.
 * 2. 공통 부모 컴포넌트를 찾아 props로 (우선 하드코딩하여) 내려준다.
 * 3. 부모 컴포넌트에 state 를 추가한다.
 */

import { useState } from "react";

export const SyncedInputs = () => {
  const [text, setText] = useState('');

  function handleChange(e) {
    setText(e.target.value);
  }

  return (
    <>
      <Input label="First input" value={text} onChange={handleChange} />
      <Input label="Second input" value={text} onChange={handleChange} />
    </>
  )
}

function Input({ label, value: text, onChange: handleChange }) {
  return (
    <label>
      {label}
      {' '}
      <input
        value={text}
        onChange={handleChange}
      />
    </label>
  );
}

const filterItems = () => {};
export const FILTERING_A_LIST = ({ foods }) => {
  const [query, setQuery] = useState('');
  const filteredFood = filterItems(foods, query);
  
  function handleChange(e) {
    setQuery(e.target.value);
  }

  return (
    <>
      <SearchBar query={query} onChange={handleChange} />
      <hr />
      <List items={filteredFood} />
    </>
  );
}

function SearchBar({ query, onChange: handleChange }) {
  return (
    <label>
      Search:{' '}
      <input
        value={query}
        onChange={handleChange}
      />
    </label>
  );
}

function List({ items }) {
  return (
    <table>
      <tbody>
        {items.map(food => (
          <tr key={food.id}>
            <td>{food.name}</td>
            <td>{food.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
