import React from "react";

import { ReferencingRefs, StopWatch, Counter, FIX_A_BROKEN_CHAT_INPUT, FIX_A_COMPONENT_FAILING_TO_RE_RENDER, FIX_DEBOUNCING, READ_THE_LATEST_STATE } from "./escape_hatches/ReferencingValuesWithRefs";
import { CatFriends, CatFriendsList, FormForwardRef, FormImperativeHandle, TodoList, PLAY_AND_PAUSE_THE_VIDEO, FOCUS_THE_SEARCH_FIELD, SCROLLING_AN_IMAGE_CAROUSEL, FOCUS_THE_SEARCH_FIELD_WITH_SEPARATE_COMPONENTS } from "./escape_hatches/ManipulatingTheDomWithRefs"
import { VideoPlayerExample, ChatRoom, FIX_FETCHING_INSIDE_AN_EFFECT } from "./escape_hatches/SynchronizingWithEffects"
import { TRANSFORM_DATA_WITHOUT_EFFECTS, SUBMIT_A_FORM_WITHOUT_EFFECTS } from "./escape_hatches/YouMightNotNeedAnEffect"
import { CharRoomExample, SWITCH_SYNCHRONIZATION_ON_AND_OFF } from "./escape_hatches/LifecycleOfReactiveEffects";
import { StatusBar, EXTRACT_A_USECOUNTER_HOOK, IMPLEMENT_A_STAGGERING_MOVEMENT } from "./escape_hatches/ReusingLogicWithCustomHooks";
import { Page } from "./managing_state/PassingDataDeeplyWithContext";
const App = () => {
  return <Page />
}

export default App;
