/**
 * state 설계 원칙
 * 1. 관련 있는 state 를 그룹화한다. -> 항상 동시에 업데이트되는 상태라면 단일 변수로 병합한다.
 * 2. 서로 모순되는 state 를 피한다.
 * 3. 불필요한 state 를 피한다. -> 기존의 props/state 로 계산될 수 있는 것을 새로 state 로 선언하지 않는다.
 * 4. 중복된 state 를 피한다. -> 동기화를 유지하기 어렵다.
 * 5. 깊이 중첩돼 있는 state 를 피한다. -> 업데이트 하기 어렵다.
 */

import { useState } from "react";

// 1. 관련 있는 state 를 그룹화 한다.
// 2차원 점 -> 항상 두 좌표를 동시에 업데이트 한다.
export const MovingDot = () => {
  const [position, setPosition] = useState({ x: 0, y: 0})
}

// 2. 모순되는 상태를 피한다.
// 타이핑 중이면서 전송중이면서 동시에 전송완료일 수는 없다.
export const FeedbackForm = () => {
  const [text, setText] = useState('');
  // const [isSending, setIsSending] = useState(false);
  // const [isSent, setIsSent] = useState(false);
  const [status, setStatus] = useState("typing");
}

// 3. 불필요한 state 를 피한다.
// firstName 과 lastName 으로부터 fullName 을 계산해낼 수 있다. 따라서 따로 상태로 선언하지 않는다.
export const Form = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  // const [fullName, setFullName] = useState('');
  const fullName = `${firstName} ${lastName}`;
}

// 4. 중복된 상태를 피한다.
// selectedItem 을 상태로 지정하지 않고, id 를 상태로 지정한다.
export const Menu = ({ initialItems }) => {
  const [items, setItems] = useState(initialItems);
  // const [selectedItem, setSelectedItem] = useState(items[0]);
  const [selectedId, setSelectedId] = useState(0);
  const selectedItem = items.filter(item => item.id === selectedId);
}

// 5. 깊게 중첩된 상태를 피한다. - immer library 를 사용할 수도 있다.
export const TravelPlan = ({ initialTravelPlan }) => {
  const [plan, setPlan] = useState(initialTravelPlan);

  function handleComplete(parentId, childId) {
    const parent = plan[parentId];
    const nextParent = {
      ...parent,
      childIds: parent.childIds.filter(id => id !== childId)
    }
    setPlan(prev => ({ ...plan, [parentId]: nextParent }));
  }

  const root = plan[0];
  const planetIds = root.childIds;

  return (
    <>
      <h2>Places to visit</h2>
      <ol>
        {planetIds.map(id => (
          <PlaceTree
            key={id}
            id={id}
            parentId={0}
            placesById={plan}
            onComplete={handleComplete}
          />
        ))}
      </ol>
    </>
  );
}

// 재귀
const PlaceTree = ({ id, parentId, placesById, onComplete }) => {
  const place = placesById[id];
  const childIds = place.childIds;

  return (
    <li>
      {place.title}
      <button onClick={() => {
        onComplete(parentId, id);
      }}>
        Complete
      </button>
      {childIds.length > 0 &&
        <ol>
          {childIds.map(childId => (
            <PlaceTree
              key={childId}
              id={childId}
              parentId={id}
              placesById={placesById}
              onComplete={onComplete}
            />
          ))}
        </ol>
      }
    </li>
  )
}

export const FIX_A_COMPONENT_THAT_IS_NOT_UPDATING = (props) => {
  return (
    <h1 style={{ color: props.color }}>
      {props.time}
    </h1>
  );
}
export const FIX_A_BROKEN_PACKING_LIST = ({ initialItems}) => {
  const [items, setItems] = useState(initialItems);
  const total = items.length;
  const packed = items.filter(item => item.packed).length;
}

export const FIX_THE_DISAPPEARING_SELECTION = ({ initialLetters }) => {
  const [letters, setLetters] = useState(initialLetters);
  const [highlightedId, setHighlightedId] = useState(null);
}

export const IMPLEMENT_MULTIPLE_SELECTION = () => {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const selectedCount = selectedIds.length;

  function handleToggle(toggledId) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(toggledId)) {
        next.delete(toggledId);
        return next;
      } else {
        next.add(toggledId);
        return next;        
      }
    });
  }
}