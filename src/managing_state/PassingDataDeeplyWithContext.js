/**
 * Context API
 * 상태 끌어올리기 - 공유 데이터가 필요한 컴포넌트가 너무 많거나 산재돼 있으면 불편하다.
 * 공유 저장소(Context)를 만들어 사용한다.
 * 
 * 1. 컨텍스트를 만든다.
 * 2. useContext 를 이용해, 컨텍스트를 사용한다.
 * 3. 컨텍스트를 제공(Provider) 한다.
 * 
 * CSS 상속과 마찬가지로 다른 값을 갖는 (같은) context 를 제공하여 덮어씌울 수 있다.(서로 다른 context 와는 별개)
 * 
 * 주의사항 - 아래의 경우가 아닐 경우 context 사용을 고려하라.
 * 1. props 로 내리는 게 더 나을 수 있다. - context 에 비해 데이터 흐름이 명확하다.
 * 2. 컴포넌트를 추출하여 자식 컴포넌트로 보낸다. - <Layout posts={posts} /> 가 아닌 <Layout><Posts posts={posts}/></Layout> 같은 방식을 통해 Layout 을 거치지 않고 바로 보낼 수 있다.
 * 
 * 사용 예시
 * 1. 테마 - dark mode 등
 * 2. 현재 계정
 * 3. 라우팅 - 많은 라우팅 솔루션들이 내부적으로 context 를 사용한다.
 * 4. 상태관리 - reducer 와 함께
 */

import { useContext, createContext, useState } from 'react';

export function Page () {
  return (
    <Section>
      <Heading>Title</Heading>
      <Section>
        <Heading>Heading</Heading>
        <Heading>Heading</Heading>
        <Heading>Heading</Heading>
        <Section>
          <Heading>Heading</Heading>
          <Heading>Heading</Heading>
          <Heading>Heading</Heading>
          <Section>
            <Heading>Heading</Heading>
            <Heading>Heading</Heading>
            <Heading>Heading</Heading>
          </Section>
        </Section>
      </Section>
    </Section>
  )
} 

const LevelContext = createContext(0)

function Section(props) {
  const { children } = props;
  const level = useContext(LevelContext);
  return (
    <section className="section">
      <LevelContext.Provider value={level + 1}>
        {children}
      </LevelContext.Provider>
    </section>
  )
}

function Heading(props) {
  const { children } = props;
  const level = useContext(LevelContext);
  switch (level) {
    case 1:
      return <h1>{children}</h1>;
    case 2:
      return <h2>{children}</h2>;
    case 3:
      return <h3>{children}</h3>;
    case 4:
      return <h4>{children}</h4>;
    case 5:
      return <h5>{children}</h5>;
    case 6:
      return <h6>{children}</h6>;
    default:
      throw Error('Unknown level: ' + level);
  }
}

const ImageSizeContext = createContext(150);

export function REPLACE_PROP_DRILLING_WITH_CONTEXT() {
  const [isLarge, setIsLarge] = useState(false);
  const imageSize = isLarge ? 150 : 100;
  return (
    <>
      <ImageSizeContext.Provider value={imageSize}>
      <label>
        <input
          type="checkbox"
          checked={isLarge}
          onChange={e => {
            setIsLarge(e.target.checked);
          }}
        />
        Use large images
      </label>
      <hr />
      <List />
      </ImageSizeContext.Provider>
    </>
  )
}

function List() {
  const listItems = places.map(place =>
    <li key={place.id}>
      <Place
        place={place}
      />
    </li>
  );
  return <ul>{listItems}</ul>;
}

function Place({ place }) {
  return (
    <>
      <PlaceImage
        place={place}
      />
      <p>
        <b>{place.name}</b>
        {': ' + place.description}
      </p>
    </>
  );
}

function PlaceImage({ place }) {
  const imageSize = useContext(ImageSizeContext);
  return (
    <img
      src={getImageUrl(place)}
      alt={place.name}
      width={imageSize}
      height={imageSize}
    />
  );
}

export const places = [{
  id: 0,
  name: 'Bo-Kaap in Cape Town, South Africa',
  description: 'The tradition of choosing bright colors for houses began in the late 20th century.',
  imageId: 'K9HVAGH'
}, {
  id: 1, 
  name: 'Rainbow Village in Taichung, Taiwan',
  description: 'To save the houses from demolition, Huang Yung-Fu, a local resident, painted all 1,200 of them in 1924.',
  imageId: '9EAYZrt'
}, {
  id: 2, 
  name: 'Macromural de Pachuca, Mexico',
  description: 'One of the largest murals in the world covering homes in a hillside neighborhood.',
  imageId: 'DgXHVwu'
}, {
  id: 3, 
  name: 'Selarón Staircase in Rio de Janeiro, Brazil',
  description: 'This landmark was created by Jorge Selarón, a Chilean-born artist, as a "tribute to the Brazilian people."',
  imageId: 'aeO3rpI'
}, {
  id: 4, 
  name: 'Burano, Italy',
  description: 'The houses are painted following a specific color system dating back to 16th century.',
  imageId: 'kxsph5C'
}, {
  id: 5, 
  name: 'Chefchaouen, Marocco',
  description: 'There are a few theories on why the houses are painted blue, including that the color repells mosquitos or that it symbolizes sky and heaven.',
  imageId: 'rTqKo46'
}, {
  id: 6,
  name: 'Gamcheon Culture Village in Busan, South Korea',
  description: 'In 2009, the village was converted into a cultural hub by painting the houses and featuring exhibitions and art installations.',
  imageId: 'ZfQOOzf'
}];

export function getImageUrl(place) {
  return (
    'https://i.imgur.com/' +
    place.imageId +
    'l.jpg'
  );
}
