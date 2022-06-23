import React, { useState } from "react";
import { Alert, Button, Row, Col, Form } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";
import { useLocation, Link } from "react-router-dom";
import { firestore, storage } from "../firebase";

const EditReminders = () => {
  const reminderRef = useLocation();
  let { reminder } = reminderRef.state;
  const [err, setErr] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(reminder.expDate);
  const [name, setName] = useState(reminder.name);
  const [category, setCategory] = useState(reminder.category);
  const [location, setLocation] = useState(reminder.location);
  const [notes, setNotes] = useState(reminder.notes);
  console.log(reminder.id);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let editedReminder = {
      name,
      expDate: date,
      category,
      location,
      notes,
    };
    const updateRef = firestore.collection("reminders").doc(reminder.id);
    const updating = await updateRef.update(editedReminder);
    if (!updating) {
      setErr("Your reminder has not been updated, please try again.");
    }
    setErr("");
    setMessage("Your reminder has been updated.");
    setLoading(false);
  };

  return (
    <>
      <div
        style={{
          minHeight: "80vh",
          width: "80vw",
        }}
        className="reminder d-flex flex-column justify-content-center align-items-center"
      >
        <div style={{ height: "5vh" }} className="w-100 mt-4">
          <Link to="/">
            <i className="fas fa-angle-left"></i> Back to all Reminders
          </Link>
        </div>
        <div className="m-4 w-100 d-flex justify-content-between align-items-between">
          <div className="reminder m-4 w-75">
            <h6>Edit Your Reminder</h6>
            {err && <Alert variant="danger">{err}</Alert>}
            {message && <Alert variant="success">{message}</Alert>}
            <Form onSubmit={handleFormSubmit}>
              <Row>
                <Col>
                  <Form.Label>Expiration Date</Form.Label>
                  <Form.Control
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    type="date"
                  />
                </Col>
                <Col>
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    as="select"
                    onChange={(e) => setLocation(e.target.value)}
                    value={location}
                  >
                    <option>Select a location</option>
                    <option value="DOC">DOC</option>
                  </Form.Control>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                  />
                </Col>
                <Col>
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    as="select"
                  >
                    <option>Select a category</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                    <option value="Telco">Telco</option>
                    <option value="Generic">Generic</option>
                    <option value="Service Contract">Service Contract</option>
                    <option value="Misc">Misc</option>
                  </Form.Control>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    size="xs"
                    as="textarea"
                    rows={3}
                  />
                </Col>
              </Row>

              <Button
                disabled={loading}
                size="sm"
                variant="info"
                className="m-3"
                type="submit"
              >
                Submit
              </Button>
            </Form>
          </div>
          <div className="ml-4 w-25">
            <AddDocument id={reminder.id} />
          </div>
        </div>
      </div>
    </>
  );
};

export default EditReminders;

const AddDocument = (props) => {
  const [files, setFiles] = useState([]);
  const [err, setErr] = useState("");
  const [message, setMessage] = useState("");
  const id = props.id;

  const fileChange = (e) => {
    for (let i = 0; i < e.target.files.length; i++) {
      const newFile = e.target.files[i];
      newFile["hashedFileName"] = uuidv4();
      setFiles((prevState) => [...prevState, newFile]);
    }
  };

  const uploadSubmit = (e) => {
    e.preventDefault();
    files.forEach((file) => {
      if (!file.name.match(/.(pdf|PDF|docx|doc|jpeg|jpg|xlsx|xls)$/i)) {
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
        locationID: id,
        hashedFileName: hashedFile,
        originalFileName: fileName,
        uploadDate: new Date(),
      };
      setErr("");
      try {
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
      } catch (e) {
        console.log({ msg: e.message });
      }
    });
  };

  return (
    <div className="reminder w-100">
      {err && <Alert variant="danger">{err}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}
      <h6>Add File(s)</h6>
      <Form onSubmit={uploadSubmit}>
        <Form.Group controlId="formFileMultiple" className="mb-3">
          <Form.Control
            onChange={fileChange}
            accept="application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,"
            type="file"
            multiple
          />
        </Form.Group>
        <Button size="xs" variant="info" className="m-2" type="submit">
          <i className="fas fa-file-upload"></i> Add File(s)
        </Button>
      </Form>
    </div>
  );
};
