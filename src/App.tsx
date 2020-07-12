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

firebase.initializeApp({
  apiKey: "AIzaSyAWka-tQokMN31ouNWCNY8F4ihl1seqJUE",
  authDomain: "survey-kite.firebaseapp.com",
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
  return <p>Survey {surveyId}</p>;
};

function useAuth() {
  const [user, setUser] = useState<string | undefined>(undefined);
  const auth = firebase.auth();
  useEffect(() => {
    auth.onAuthStateChanged(user => setUser(user?.uid));
  }, [auth]);
  return user;
}

const Login: React.FC = () => {
  useEffect(() => {
    firebase.auth().signInAnonymously();
  })
  return <p>Loading...</p>;
};

export default App;
