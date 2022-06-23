import React, { useRef, useState } from "react";
import { Form, Button, Alert, Image } from "react-bootstrap";
import { useAuth } from "../contexts/authContext";
import { Link, useHistory } from "react-router-dom";
import Image1 from "../assets/mainimg.png";

const Login = () => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setErr("");
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      history.push("/");
    } catch {
      setErr("Failed to log in");
    }

    setLoading(false);
  }

  return (
    <>
      <div
        style={{ height: "100vh" }}
        className="login d-flex justify-content-center align-items-center"
      >
        <div className="m-3">
          <Image width="400px" src={Image1} alt="Expiration reminder" />
        </div>
        <div className="p-4">
          {err && <Alert variant="danger">{err}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                ref={emailRef}
                size="lg"
                placeholder="@camdendiocese.org"
                required
              />
            </Form.Group>
            <Form.Group id="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                size="lg"
                type="password"
                ref={passwordRef}
                required
              />
            </Form.Group>
            <Button variant="info" size="sm" type="submit" disabled={loading}>
              <i className="fas fa-sign-in-alt"></i> Log in
            </Button>
          </Form>
          <div className="reminder w-100 text-center m-2">
            Need to reset your password?{" "}
            <Link to="/forgotpassword">Reset Password</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
