import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams,
  Redirect,
} from "react-router-dom";
import "./App.css";

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
  return <p>Time to edit a survey!</p>;
};

const TakeSurveyPage: React.FC = () => {
  const { surveyId } = useParams();
  return <p>Survey {surveyId}</p>;
};

export default App;
