import React, { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Form, Button, Alert, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { firestore, storage } from "../firebase";

const AddReminder = () => {
  const [err, setErr] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const dateRef = useRef();
  const nameRef = useRef();
  const categoryRef = useRef();
  const locationRef = useRef();
  const notesRef = useRef();
  const formRef = useRef();

  const fileChange = (e) => {
    for (let i = 0; i < e.target.files.length; i++) {
      const newFile = e.target.files[i];
      newFile["hashedFileName"] = uuidv4();
      setFiles((prevState) => [...prevState, newFile]);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (dateRef.current.value === null || nameRef.current.value === "") {
      setErr("Please set a expiration date or name of this contract.");
      return;
    } else {
      if (files !== []) {
        const newIDRef = uuidv4();
        files.forEach((file) => {
          if (!file.name.match(/.(pdf|PDF|docx|doc|jpeg|jpg|xlsx|xls|ini)$/i)) {
            setMessage("");
            setErr("You must upload an approved file type.");
            return;
          }
          const fileName = file.name;
          const fileExt = fileName.split(".").pop();
          const hash = uuidv4();
          const hashedFile = `${hash}.${fileExt}`;
          const fileNameStorageRef = firestore.collection("files");
          let fileRef = {
            locationID: newIDRef,
            hashedFileName: hashedFile,
            originalFileName: fileName,
            uploadDate: new Date(),
          };
          setErr("");
          const storageRef = storage.ref(`${hashedFile}`).put(file);
          if (!storageRef) {
            setErr(
              "There was an issue uploading your document, please try again."
            );
          }
          const fileNameStored = fileNameStorageRef.add(fileRef);
          if (!fileNameStored) {
            setErr("File name not stored.");
          }
          setFiles([]);
          setErr("");
          setMessage("Success: Your document has been uploaded.");
        });
        setErr("");
        const reminderRef = firestore.collection("reminders");
        setLoading(true);

        let newReminder = {
          expDate: dateRef.current.value,
          name: nameRef.current.value,
          location: locationRef.current.value,
          category: categoryRef.current.value,
          notes: notesRef.current.value,
          isActive: true,
        };
        let storingNewReminder = await reminderRef
          .doc(newIDRef)
          .set(newReminder);
        if (!storingNewReminder) {
          setErr("There has been an error creating your new reminder.");
        }
        setErr("");
        setLoading(false);
        setMessage("Success: Your reminder and its files have been added.");
        formRef.current.reset();
      } else {
        setErr("");
        const reminderRef = firestore.collection("reminders");
        setLoading(true);

        console.log(files);

        let newReminder = {
          expDate: dateRef.current.value,
          name: nameRef.current.value,
          location: locationRef.current.value,
          category: categoryRef.current.value,
          notes: notesRef.current.value,
          isActive: true,
        };
        let storingNewReminder = await reminderRef.add(newReminder);
        if (!storingNewReminder) {
          setErr("There has been an error creating your new reminder.");
        } else {
          setErr("");
          setLoading(false);
          setMessage("Success: Reminder added.");
          formRef.current.reset();
        }
      }
    }
  };

  return (
    <>
      <div
        style={{ height: "100vh" }}
        className="reminder d-flex flex-column justify-content-start align-items-center w-100"
      >
        <div
          style={{ height: "10vh", width: "100vw", overflow: "hidden" }}
          className="d-flex justify-content-between align-items-start p-3"
        >
          <Link to="/">
            <i className="fas fa-angle-left"></i> Back to all reminders
          </Link>
        </div>
        <div
          className="d-flex flex-column justify-content-center align-items-center"
          style={{ width: "90vw" }}
        >
          {err && <Alert variant="danger">{err}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          <Form ref={formRef} onSubmit={handleFormSubmit}>
            <Row>
              <Col>
                <Form.Label>Expiration Date</Form.Label>
                <Form.Control size="lg" ref={dateRef} type="date" />
              </Col>
              <Col>
                <Form.Label>Name</Form.Label>
                <Form.Control size="lg" ref={nameRef} type="text" />
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Label>Category</Form.Label>
                <Form.Control size="lg" as="select" ref={categoryRef}>
                  <option>Select a category</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Telco">Telco</option>
                  <option value="Generic">Generic</option>
                  <option value="Service Contract">Service Contract</option>
                  <option value="Misc">Misc</option>
                </Form.Control>
              </Col>
              <Col>
                <Form.Label>Location</Form.Label>
                <Form.Control size="lg" as="select" ref={locationRef}>
                  <option>Select a location</option>
                  <option value="DOC">DOC</option>
                  <option value="CCHS">CCHS</option>
                </Form.Control>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Control
                  onChange={fileChange}
                  accept="application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  type="file"
                  className="m-4"
                  multiple
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Label>Notes</Form.Label>
                <Form.Control size="lg" as="textarea" ref={notesRef} rows={3} />
              </Col>
            </Row>

            <Button
              variant="info"
              disabled={loading}
              size="sm"
              className="m-3"
              type="submit"
            >
              Submit
            </Button>
          </Form>
        </div>
      </div>
    </>
  );
};

export default AddReminder;
