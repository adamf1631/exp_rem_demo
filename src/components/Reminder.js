import React from "react";
import moment from "moment";
import { Alert, Button, Card, ListGroup } from "react-bootstrap";
import { useLocation, Link } from "react-router-dom";
import { useCollectionData } from "react-firebase-hooks/firestore";

import { firestore, storage } from "../firebase";

const Reminder = () => {
  const reminderRef = useLocation();
  let { reminder } = reminderRef.state;
  const { id, name, category, expDate, location, notes } = reminder;
  const today = moment(new Date());
  const expirationDate = moment(expDate);
  const compareDates = expirationDate.diff(today, "days");
  //color of comparing dates alert bar
  const compareDatesColor = () => {
    if (compareDates <= 30) {
      return "danger";
    } else if (compareDates <= 60) {
      return "warning";
    } else if (compareDates <= 90) {
      return "info";
    } else if (compareDates <= 0) {
      return "secondary";
    } else {
      return "primary";
    }
  };

  const diffDays = (e) => {
    const today = moment(new Date());
    const expirationDate = moment(e);
    const difference = expirationDate.diff(today, "days");
    if (difference > 0) {
      return `Contract expires in: ${difference} days`;
    } else {
      return "YOUR CONTRACT HAS EXPIRED.";
    }
  };

  return (
    <>
      <div style={{ height: "5vh" }} className="reminder w-100 mt-4">
        <Link to="/">
          <i className="fas fa-angle-left"></i> Back to all Reminders
        </Link>
      </div>
      <div
        style={{ width: "90vw" }}
        className="mb-4 d-flex justify-content-center align-items-start"
      >
        <div className="reminder w-75">
          <Alert variant={`${compareDatesColor()}`}>{diffDays(expDate)}</Alert>
          <Card className="p-2">
            <Card.Text>{}</Card.Text>
            <Card.Title className="p-2">
              Expiration Date: <h2>{moment(expDate).format("MMMM Do YYYY")}</h2>
            </Card.Title>
            <Card.Title className="p-2">
              Contract Name:
              <h2>{name}</h2>
            </Card.Title>
            <Card.Subtitle className="p-2">
              Category
              <h3>{category}</h3>
            </Card.Subtitle>
            <Card.Subtitle className="p-2">
              Location:
              <h3>{location}</h3>
            </Card.Subtitle>
            <Card.Text className="p-2">
              Notes: <p>{notes}</p>
            </Card.Text>
          </Card>
        </div>
        <div className="reminder ml-1 w-50">
          <AllFiles id={id} />
        </div>
      </div>
    </>
  );
};

export default Reminder;

const AllFiles = (props) => {
  const id = props.id;
  const reminderIDRef = firestore.collection("files");
  const query = reminderIDRef.where("locationID", "==", `${id}`);
  const [files] = useCollectionData(query, { idField: "fileid" });

  const downloadFile = (f) => {
    storage
      .ref(f)
      .getDownloadURL()
      .then(function (url) {
        let link = document.createElement("a");
        if (link.download !== undefined) {
          link.setAttribute("href", url);
          link.setAttribute("target", "_blank");
          link.setAttribute("download", "download");
          link.style.visibility = "hidden";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      });
  };

  const deleteFile = async (name, fileid) => {
    try {
      await storage.ref(name).delete();
      await firestore.collection("files").doc(fileid).delete();
    } catch (e) {
      console.log({ msg: e.message });
    }
  };

  const fileList =
    files &&
    files
      .sort((a, b) => b.uploadDate - a.uploadDate)
      .map((file, i) => (
        <>
          <ListGroup key={i}>
            <ListGroup.Item className="m-2">
              <p>{file.originalFileName}</p>
              <Button
                variant="link"
                onClick={(f) => downloadFile(file.hashedFileName)}
                className="ml-1"
              >
                <i className="far fa-eye"></i>
              </Button>
              <Button
                variant="link"
                className="float-right m-1"
                onClick={(e) => {
                  if (
                    window.confirm(
                      "You are about to delete this file permenently. Are you sure about this?"
                    )
                  ) {
                    deleteFile(file.hashedFileName, file.fileid);
                  }
                }}
              >
                <i className="fas fa-trash"></i>
              </Button>
            </ListGroup.Item>
          </ListGroup>
        </>
      ));

  return (
    <>
      {files && files.length === 0 ? (
        <Alert variant="secondary">This reminder has no files.</Alert>
      ) : (
        <>
          <h6>File List for this reminder:</h6>
          {fileList}
        </>
      )}
    </>
  );
};
