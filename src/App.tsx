import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams,
  Redirect,
} from "react-router-dom";
import "./App.css";

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import {
  Survey as SurveyModel,
  Choices as ChoicesModel,
} from "./models/survey";
import {
  Response as ResponseModel,
  Answer as AnswerModel,
} from "./models/response";
import styled from "styled-components";

firebase.initializeApp({
  apiKey: "AIzaSyAWka-tQokMN31ouNWCNY8F4ihl1seqJUE",
  authDomain: "survey-kite.firebaseapp.com",
  projectId: "survey-kite",
});

const App: React.FC = () => {
  const uid = useAuth();
  return (
    <Router>
      <Switch>
        <Route path="/take/:surveyId">
          {uid ? <TakeSurveyPage uid={uid} /> : <Login />}
        </Route>
        <Route path="/edit">{uid ? <EditPage uid={uid} /> : <Login />}</Route>
        <Route>
          <Redirect to="/edit" />
        </Route>
      </Switch>
    </Router>
  );
};

interface AuthedProps {
  readonly uid: string;
}
const EditPage: React.FC<AuthedProps> = ({ uid }) => {
  return <p>Time to edit a survey!</p>;
};

const TakeSurveyPage: React.FC<AuthedProps> = ({ uid }) => {
  const { surveyId } = useParams();
  const survey = useSurvey(surveyId);
  const [response, updateResponse] = useResponse(surveyId, uid);
  useEffect(() => {
    if (survey && response === null) {
      updateResponse({
        answers: survey.questions.map(() => null),
      });
    }
  }, [survey, response, updateResponse]);

  if (survey === undefined) {
    return <Loading />;
  }
  if (survey === null) {
    return <Redirect to="/" />;
  }
  if (!response) {
    return <Loading />;
  }
  const questions = survey.questions.map((question, idx) => {
    return (
      <Question
        key={idx}
        description={question.description}
        answer={response.answers[idx]}
        choices={question.choices}
        onAnswer={(answer) => {
          response.answers[idx] = answer;
          updateResponse(response);
        }}
      />
    );
  });
  return <SurveyWrapper>{questions}</SurveyWrapper>;
};
const SurveyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 24px;
`;

interface QuestionProps {
  readonly description: string;
  readonly choices: ChoicesModel;
  readonly answer: AnswerModel | null;
  readonly onAnswer: (answer: AnswerModel | null) => void;
}
const Question: React.FC<QuestionProps> = ({
  description,
  choices,
  answer,
  onAnswer,
}) => {
  let content;
  switch (choices.type) {
    case "checkbox": {
      const selected = answer?.type === "checkbox" ? answer.items : undefined;
      content = (
        <Checkboxes
          items={choices.items}
          selected={selected ?? []}
          onSelect={(items) => onAnswer({ type: "checkbox", items })}
        />
      );
      break;
    }
    case "radio": {
      const selected = answer?.type === "radio" ? answer.item : undefined;
      content = (
        <RadioButton
          items={choices.items}
          selected={selected}
          onSelect={(item) => onAnswer({ type: "radio", item })}
        />
      );
      break;
    }
  }
  return (
    <QuestionWrapper>
      <p>{description}</p>
      {content}
    </QuestionWrapper>
  );
};
const QuestionWrapper = styled.div`
  width: 50%;
  padding: 8px;
  box-shadow: 2px 2px 4px 2px;
`;

interface CheckboxesProps {
  readonly items: string[];
  readonly selected: string[];
  readonly onSelect: (items: string[]) => void;
}
const Checkboxes: React.FC<CheckboxesProps> = ({
  items,
  selected,
  onSelect,
}) => {
  const content = items.map((item, idx) => {
    const checked = selected.includes(item);
    return (
      <CheckboxItemWrapper
        key={idx}
        onClick={() =>
          onSelect(
            checked ? selected.filter((v) => v !== item) : [...selected, item]
          )
        }
      >
        <input type="checkbox" checked={checked} />
        <p>{item}</p>
      </CheckboxItemWrapper>
    );
  });
  return <>{content}</>;
};
const CheckboxItemWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  cursor: pointer;
  &:hover {
    background: lightgray;
  }
`;

interface RadioButtonProps {
  readonly items: string[];
  readonly selected?: string;
  readonly onSelect: (item: string) => void;
}
const RadioButton: React.FC<RadioButtonProps> = ({
  items,
  selected,
  onSelect,
}) => {
  const content = items.map((item, idx) => {
    return (
      <RadioItemWrapper key={idx} onClick={() => onSelect(item)}>
        <input type="radio" checked={item === selected} />
        <p>{item}</p>
      </RadioItemWrapper>
    );
  });
  return <>{content}</>;
};
const RadioItemWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  cursor: pointer;
  &:hover {
    background: lightgray;
  }
`;

function useAuth(): string | undefined {
  const [user, setUser] = useState<string | undefined>(undefined);
  const auth = firebase.auth();
  useEffect(() => {
    auth.onAuthStateChanged((user) => setUser(user?.uid));
  }, [auth]);
  return user;
}

function useSurvey(surveyId: string): SurveyModel | null | undefined {
  const [survey, setSurvey] = useState<SurveyModel | null | undefined>(
    undefined
  );
  const db = firebase.firestore();
  useEffect(() => {
    console.log(`subscribing to surveys/${surveyId}`);
    const unsub = db
      .collection("surveys")
      .doc(surveyId)
      .onSnapshot((snap) => {
        setSurvey(snap.exists ? (snap.data() as SurveyModel) : null);
      });
    return () => {
      console.log(`unsubscribing to surveys/${surveyId}`);
      unsub();
    };
  }, [db, surveyId]);
  return survey;
}

function useResponse(
  surveyId: string,
  uid: string
): [ResponseModel | null | undefined, (update: ResponseModel) => void] {
  const [response, setResponse] = useState<ResponseModel | null | undefined>(
    undefined
  );
  const doc = useMemo(
    () =>
      firebase
        .firestore()
        .collection("surveys")
        .doc(surveyId)
        .collection("responses")
        .doc(uid),
    [surveyId, uid]
  );
  useEffect(() => {
    console.log(`subscribing to surveys/${surveyId}/responses/${uid}`);
    const unsub = doc.onSnapshot((snap) => {
      setResponse(snap.exists ? (snap.data() as ResponseModel) : null);
    });
    return () => {
      console.log(`unsubscribing from surveys/${surveyId}/responses/${uid}`);
      unsub();
    };
  }, [doc, surveyId, uid]);
  const updateResponse = useCallback(
    (update) => {
      console.log("updating response to ", update);
      doc.set(update, { merge: true });
    },
    [doc]
  );
  return [response, updateResponse];
}

const Login: React.FC = () => {
  useEffect(() => {
    firebase.auth().signInAnonymously();
  });
  return <Loading />;
};

const Loading: React.FC = () => {
  return <p>Loading...</p>;
};

export default App;
