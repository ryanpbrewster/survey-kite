import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams,
  Redirect,
} from "react-router-dom";
import "./App.css";

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { Survey as SurveyModel, Question as QuestionModel} from "./models";
import styled from 'styled-components';

firebase.initializeApp({
  apiKey: "AIzaSyAWka-tQokMN31ouNWCNY8F4ihl1seqJUE",
  authDomain: "survey-kite.firebaseapp.com",
  projectId: "survey-kite",
});

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route path="/take/:surveyId">
          <TakeSurveyPage />
        </Route>
        <Route path="/edit">
          <EditPage />
        </Route>
        <Route>
          <Redirect to="/edit" />
        </Route>
      </Switch>
    </Router>
  );
};

const EditPage: React.FC = () => {
  const uid = useAuth();
  if (!uid) {
    return <Login />
  }
  return <p>Time to edit a survey!</p>;
};

const TakeSurveyPage: React.FC = () => {
  const { surveyId } = useParams();
  const survey = useSurvey(surveyId);
  console.log(survey);
  if (survey === undefined) {
    return <Loading />;
  }
  if (survey === null) {
    return <Redirect to="/" />;
  }
  const questions = survey.questions.map((question, idx) => {
    return <Question {...question} />
  });
  return <SurveyWrapper>{questions}</SurveyWrapper>;
};
const SurveyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 24px;
`;

const Question: React.FC<QuestionModel> = ({description, answers}) => {
  let content;
  switch (answers.type) {
    case 'checkbox':
      content = <Checkboxes choices={answers.choices} />;
      break;
    case 'radio':
      content = <RadioButton choices={answers.choices} />;
      break;
  }
  return <QuestionWrapper>
    <p>{description}</p>
    {content}
  </QuestionWrapper>
};
const QuestionWrapper = styled.div`
  width: 50%;
  padding: 8px;
  box-shadow: 2px 2px 4px 2px;
`;

interface CheckboxesProps {
  readonly choices: string[];
}
const Checkboxes: React.FC<CheckboxesProps> = ({choices}) => {
  const items = choices.map((choice, idx) => {
    return <div>
      <input type="checkbox" />
      <p>{choice}</p>
    </div>;
  });
  return <>{items}</>;
};

interface RadioButtonProps {
  readonly choices: string[];
}
const RadioButton: React.FC<RadioButtonProps> = ({choices}) => {
  const items = choices.map((choice, idx) => {
    return <RadioItemWrapper>
      <input type="radio" />
      <p>{choice}</p>
    </RadioItemWrapper>;
  });
  return <>{items}</>;
};
const RadioItemWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

function useAuth(): string | undefined {
  const [user, setUser] = useState<string | undefined>(undefined);
  const auth = firebase.auth();
  useEffect(() => {
    auth.onAuthStateChanged(user => setUser(user?.uid));
  }, [auth]);
  return user;
}

function useSurvey(surveyId: string): SurveyModel | null | undefined {
  const [survey, setSurvey] = useState<SurveyModel | null | undefined>(undefined);
  const db = firebase.firestore();
  useEffect(() => {
    console.log(`subscribing to surveys/${surveyId}`);
    const unsub = db.collection("surveys").doc(surveyId).onSnapshot(snap =>  {
      setSurvey(snap.exists ? snap.data() as SurveyModel : null);
    });
    return () => {
      console.log(`unsubscribing to surveys/${surveyId}`);
      unsub();
    };
  }, [db, surveyId]);
  return survey;
}

const Login: React.FC = () => {
  useEffect(() => {
    firebase.auth().signInAnonymously();
  })
  return <Loading />;
};

const Loading: React.FC = () => {
  return <p>Loading...</p>;
};

export default App;
