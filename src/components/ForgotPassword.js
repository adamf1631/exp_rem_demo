import React, { useRef, useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/authContext";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const emailRef = useRef();
  const { resetPassword } = useAuth();
  const [err, setErr] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setMessage("");
      setErr("");
      setLoading(true);
      await resetPassword(emailRef.current.value);
      setMessage(
        "Please check your inbox and/or spam folder for further instructions."
      );
    } catch {
      setErr("Failed to reset password.");
    }

    setLoading(false);
  };

  return (
    <>
      <Card>
        <Card.Body>
          <h2>Password Reset</h2>
          {err && <Alert variant="danger">{err}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" ref={emailRef} required />
            </Form.Group>
            <Button disabled={loading} type="submit" variant="primary">
              <i className="fas fa-key"></i> Reset Password
            </Button>
          </Form>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        Ready to login? <Link to="/login">Log in</Link>
      </div>
    </>
  );
};

export default ForgotPassword;
