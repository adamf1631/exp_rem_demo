import "../App.css";
import React from "react";
import { Container } from "react-bootstrap";
import Header from "./Header";
import { AuthProvider } from "../contexts/authContext";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword";
import PrivateRoute from "./PrivateRoute";
import Reminders from "./Reminders";
import Reminder from "./Reminder";
import AddReminder from "./AddReminder";
import EditReminders from "./EditReminders";

function App() {
  return (
    <>
      <Header />

      <Container
        className="main d-flex align-items-start justify-content-center"
        style={{
          minHeight: "100vh",
          minWidth: "100vw",
        }}
      >
        <div className="w-100">
          <Router>
            <AuthProvider>
              <Switch>
                <PrivateRoute exact path="/" component={Reminders} />
                <PrivateRoute path="/addreminder" component={AddReminder} />
                <PrivateRoute path="/reminder" component={Reminder} />
                <PrivateRoute path="/editreminder" component={EditReminders} />
                <Route path="/login" component={Login} />
                <Route path="/forgotpassword" component={ForgotPassword} />
              </Switch>
            </AuthProvider>
          </Router>
        </div>
      </Container>
    </>
  );
}

export default App;
