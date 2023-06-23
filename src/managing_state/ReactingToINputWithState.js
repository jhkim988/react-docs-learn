/**
 * UI 의 개별부분을 직접 조작하지 않고, 컴포넌트의 "상태" 를 정의하여, 사용자와 상호작용하면서 상태를 전환한다.
 * 선언적 UI 와 명령형 UI
 * - 명령적 UI: 각각의 상호작용에 대해서 어떻게 동작할지 명령한다. -> 복잡한 시스템에서는 관리하기 굉장히 어려워진다.
 * - 선언적 UI: 
 * (1) 상태를 식별한다.
 * (2) 언제 상태가 변하는지 결정한다. -> 사용자 상호작용 / PC 상호작용(네트워크 연결 등)
 * (3) useState 를 이용하여 메모리에 상태를 표현한다.
 * (4) 필요없는 상태 제거
 * (5) 이벤트 핸들러와 연결
 */

import { useState } from "react";

export const ADD_AND_REMOVE_A_CSS_CLASS = () => {
  const [isActivate, setIsActivate] = useState(false);
  const backgroundClassName = isActivate ? "background background--active" : "background";
  const pictureClassName = isActivate ? "picture" : "picture picture--active";

  const handleClick = () => {
      setIsActivate(prev => !prev);
  }

  return (
    <div onClick={handleClick} className={backgroundClassName}>
      <img
        className={pictureClassName}
        alt="Rainbow houses in Kampung Pelangi, Indonesia"
        src="https://i.imgur.com/5qwVYb1.jpeg"
      />
    </div>
  );
}

export const PROFILE_EDITOR = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [firstName, setFirstName] = useState("Jane");
  const [lastName, setLastName] = useState("Jacobs");
  
  const handleClick = (e) => {
    e.preventDefault();
    setIsEdit(prev => !prev);
  }
  
  return (
    <form>
      <label>
        First name:{' '}
        {isEdit ? <b>{firstName}</b> : <input value={firstName} onChange={(e) => setFirstName(e.target.value)}/>}
      </label>
      <label>
        Last name:{' '}
        {isEdit ? <b>{lastName}</b> : <input value={lastName} onChange={(e) => setLastName(e.target.value)}/>}
      </label>
      <button type="submit" onClick={handleClick}>
        Edit Profile
      </button>
      <p><i>Hello, {`${firstName} ${lastName}`}!</i></p>
    </form>
  );
}