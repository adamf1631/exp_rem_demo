import React, { useState, useEffect } from "react";
import { Button, Alert, ListGroup } from "react-bootstrap";
import { useAuth } from "../contexts/authContext";
import { Link, useHistory } from "react-router-dom";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { firestore, storage } from "../firebase";
import moment from "moment";

const Reminders = () => {
  const [err, setErr] = useState("");
  const { currentUser, logout } = useAuth();
  const history = useHistory();

  const remindersRef = firestore.collection("reminders");
  const query = remindersRef.orderBy("expDate");
  const [reminders] = useCollectionData(query, {
    idField: "id",
  });

  async function handleLogout() {
    setErr("");

    try {
      await logout();
      history.push("/Login");
    } catch {
      setErr("Logout has failed, please try again.");
    }
  }

  const deleteReminder = async (e, id) => {
    e.preventDefault();
    const filesRef = firestore.collection("files");
    const snapshot = await filesRef.where("locationID", "==", `${id}`).get();
    await snapshot.forEach((file) => {
      storage.ref(file.data().hashedFileName).delete();
      file.ref.delete();
    });

    const deleteRef = await firestore.collection("reminders").doc(id).delete();
    if (!deleteRef) {
      setErr("Your reminder could not be deleted.");
    }
    setErr("");
  };

  const makeActive = async (id) => {
    await firestore.collection("reminders").doc(id).update({
      isActive: true,
    });
  };
  const makeInActive = async (id) => {
    await firestore.collection("reminders").doc(id).update({
      isActive: false,
    });
  };

  //color of comparing dates alert bar
  const compareDatesColor = (date) => {
    const today = moment(new Date());
    const expirationDate = moment(date);
    const compareDates = expirationDate.diff(today, "days");
    if (compareDates <= 30) {
      return "danger";
    } else if (compareDates <= 60) {
      return "warning";
    } else if (compareDates <= 90) {
      return "secondary";
    } else {
      return "info";
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
      <div
        style={{ height: "10vh", width: "100vw" }}
        className="d-flex justify-content-between align-items-center p-3"
      >
        <h5>Welcome {currentUser.email}</h5>
        <Link to="/addReminder">
          <Button variant="info" size="xs">
            <i className="fas fa-calendar-plus"></i> Add New Reminder
          </Button>
        </Link>
        {err && <Alert variant="danger">{err}</Alert>}
        <Button
          variant="link"
          style={{ marginRight: "40px", color: "#fff" }}
          size="xs"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
      <div
        style={{ maxWidth: "100vw" }}
        className="d-flex justify-content-center align-items-start"
      >
        <SearchReminders reminders={reminders} />
        <SearchByCategory reminders={reminders} />
      </div>
      <h4>Active Reminders</h4>
      <div className="reminders d-flex flex-wrap justify-content-center align-items-start">
        {reminders &&
          reminders.map(
            (reminder) =>
              reminder.isActive && (
                <div
                  style={{ flexGrow: 1 }}
                  className="w-25 ml-1 mr-1"
                  key={reminder.id}
                >
                  <Alert variant={`${compareDatesColor(reminder.expDate)}`}>
                    <h3>{moment(reminder.expDate).format("MMMM Do YYYY")}</h3>
                    <p>{diffDays(reminder.expDate)}</p>
                    <h5 className="mb-1">Name: {reminder.name}</h5>
                    <p>Category: {reminder.category}</p>
                    <ListGroup>
                      <ListGroup.Item>
                        <Link
                          to={{
                            pathname: "/reminder",
                            state: {
                              reminder,
                            },
                          }}
                        >
                          <i className="fas fa-location-arrow"></i> View
                          Reminder
                        </Link>
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <Link
                          to={{
                            pathname: "/editreminder",
                            state: {
                              reminder,
                            },
                          }}
                        >
                          <i className="fas fa-edit"></i> Edit Reminder
                        </Link>
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <Link onClick={() => makeInActive(reminder.id)}>
                          <i className="fas fa-minus-circle"></i> Make InActive
                        </Link>
                      </ListGroup.Item>
                      <Link
                        onClick={(e) => {
                          if (
                            window.confirm(
                              "You are about to delete this reminder and all of its files: Are you sure about this?"
                            )
                          ) {
                            deleteReminder(e, reminder.id);
                          }
                        }}
                      >
                        <i className="fas fa-trash"></i>
                      </Link>
                    </ListGroup>
                  </Alert>
                </div>
              )
          )}
      </div>
      <div style={{ width: "70vw", marginTop: "40px" }}>
        <h4>Inactive Reminders</h4>
        {reminders &&
          reminders.map(
            (reminder) =>
              !reminder.isActive && (
                <div className="reminders" key={reminder.id}>
                  <Alert className="w-100" variant="secondary">
                    <h5>
                      Expiration Date:{" "}
                      {moment(reminder.expDate).format("MMMM Do YYYY")}
                    </h5>
                    <h4 className="m-2">{reminder.name}</h4>
                    <Link
                      to={{
                        pathname: "/reminder",
                        state: {
                          reminder,
                        },
                      }}
                    >
                      <Button className="m-1" variant="secondary">
                        <i className="fas fa-location-arrow"></i> View Reminder
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      onClick={() => makeActive(reminder.id)}
                      className="m-1"
                    >
                      <i className="fas fa-plus-circle"></i> Make Active
                    </Button>
                    <Button
                      className="m-1 float-right"
                      variant="link"
                      onClick={(e) => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this reminder permently?"
                          )
                        ) {
                          deleteReminder(e, reminder.id);
                        }
                      }}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </Alert>
                </div>
              )
          )}
      </div>
    </>
  );
};

const SearchReminders = ({ reminders }) => {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const findReminder = () => {
      if (search) {
        const results =
          reminders &&
          reminders.filter((reminder) =>
            reminder.name.toLowerCase().includes(search)
          );
        setSearchResults(results);
      } else {
        setSearchResults(null);
      }
    };
    return findReminder();
  }, [search, reminders]);

  const makeInActive = async (id) => {
    await firestore.collection("reminders").doc(id).update({
      isActive: false,
    });
  };

  const deleteReminder = async (e, id) => {
    e.preventDefault();
    const filesRef = firestore.collection("files");
    const snapshot = await filesRef.where("locationID", "==", `${id}`).get();
    await snapshot.forEach((file) => {
      storage.ref(file.data().hashedFileName).delete();
      file.ref.delete();
    });

    const deleteRef = await firestore.collection("reminders").doc(id).delete();
    if (!deleteRef) {
      setErr("Your reminder could not be deleted.");
    }
    setErr("");
  };
  //color of comparing dates alert bar
  const compareDatesColor = (date) => {
    const today = moment(new Date());
    const expirationDate = moment(date);
    const compareDates = expirationDate.diff(today, "days");
    if (compareDates <= 30) {
      return "danger";
    } else if (compareDates <= 60) {
      return "warning";
    } else if (compareDates <= 90) {
      return "info";
    } else {
      return "success";
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
      <div className="d-flex flex-column justify-content-center align-items-center">
        <div style={{ maxWidth: "75%" }} className="form-group">
          {err && <Alert variant="danger">{err}</Alert>}
          <label className="m-1">Search Reminders</label>
          <input
            type="text"
            placeholder="Search by name"
            className="form-control"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            required
          />
          {search === "" ? (
            ""
          ) : (
            <Button variant="link text-white" onClick={() => setSearch("")}>
              <i class="fas fa-times"></i>
            </Button>
          )}
        </div>
        <div
          style={{ flexGrow: 1 }}
          className="d-flex flex-wrap justify-content-center align-items-start"
        >
          {searchResults &&
            searchResults.map((reminder) => (
              <div className="m-1" key={reminder.id}>
                <div className="reminders" key={reminder.id}>
                  <Alert variant={`${compareDatesColor(reminder.expDate)}`}>
                    <h3>{moment(reminder.expDate).format("MMMM Do YYYY")}</h3>
                    <p>{diffDays(reminder.expDate)}</p>
                    {reminder.isActive ? (
                      ""
                    ) : (
                      <h6 class="text-danger">
                        This Reminder is currently Inactive.
                      </h6>
                    )}
                    <h5 className="mb-1">Name: {reminder.name}</h5>
                    <p>Category: {reminder.category}</p>
                    <ListGroup>
                      <ListGroup.Item>
                        <Link
                          to={{
                            pathname: "/reminder",
                            state: {
                              reminder,
                            },
                          }}
                        >
                          <i className="fas fa-location-arrow"></i> View
                          Reminder
                        </Link>
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <Link
                          to={{
                            pathname: "/editreminder",
                            state: {
                              reminder,
                            },
                          }}
                        >
                          <i className="fas fa-edit"></i> Edit Reminder
                        </Link>
                      </ListGroup.Item>
                      {!reminder.isActive ? (
                        ""
                      ) : (
                        <ListGroup.Item>
                          <Link onClick={() => makeInActive(reminder.id)}>
                            <i className="fas fa-minus-circle"></i> Make
                            InActive
                          </Link>
                        </ListGroup.Item>
                      )}
                      <Link
                        onClick={(e) => {
                          if (
                            window.confirm(
                              "You are about to delete this reminder and all of its files: Are you sure about this?"
                            )
                          ) {
                            deleteReminder(e, reminder.id);
                          }
                        }}
                      >
                        <i className="fas fa-trash"></i>
                      </Link>
                    </ListGroup>
                  </Alert>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

const SearchByCategory = ({ reminders }) => {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const findReminder = () => {
      if (search) {
        const results =
          reminders &&
          reminders.filter((reminder) => reminder.category.includes(search));
        setSearchResults(results);
      } else {
        setSearchResults(null);
      }
    };

    return findReminder();
  }, [search, reminders]);

  const makeInActive = async (id) => {
    await firestore.collection("reminders").doc(id).update({
      isActive: false,
    });
  };

  const deleteReminder = async (e, id) => {
    e.preventDefault();
    const filesRef = firestore.collection("files");
    const snapshot = await filesRef.where("locationID", "==", `${id}`).get();
    await snapshot.forEach((file) => {
      storage.ref(file.data().hashedFileName).delete();
      file.ref.delete();
    });

    const deleteRef = await firestore.collection("reminders").doc(id).delete();
    if (!deleteRef) {
      setErr("Your reminder could not be deleted.");
    }
    setErr("");
  };
  //color of comparing dates alert bar
  const compareDatesColor = (date) => {
    const today = moment(new Date());
    const expirationDate = moment(date);
    const compareDates = expirationDate.diff(today, "days");
    if (compareDates <= 30) {
      return "danger";
    } else if (compareDates <= 60) {
      return "warning";
    } else if (compareDates <= 90) {
      return "info";
    } else {
      return "success";
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
      <div className="d-flex flex-column justify-content-center align-items-center">
        <div style={{ maxWidth: "400px" }} className="form-group">
          {err && <Alert variant="danger">{err}</Alert>}
          <label className="m-1">Search Reminders</label>
          <select
            className="form-control"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            required
          >
            <option>Select a category</option>
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
            <option value="Telco">Telco</option>
            <option value="Generic">Generic</option>
            <option value="Service Contract">Service Contract</option>
            <option value="Misc">Misc</option>
          </select>
          {search === "" ? (
            ""
          ) : (
            <Button variant="link text-white" onClick={() => setSearch("")}>
              <i class="fas fa-times"></i>
            </Button>
          )}
        </div>

        <div
          style={{ flexGrow: 1 }}
          className="d-flex flex-wrap justify-content-center align-items-start"
        >
          {searchResults &&
            searchResults.map((reminder) => (
              <div className="m-1" key={reminder.id}>
                <div className="reminders" key={reminder.id}>
                  <Alert variant={`${compareDatesColor(reminder.expDate)}`}>
                    <h3>{moment(reminder.expDate).format("MMMM Do YYYY")}</h3>
                    <p>{diffDays(reminder.expDate)}</p>
                    {reminder.isActive ? (
                      ""
                    ) : (
                      <h6 class="text-danger">
                        This Reminder is currently Inactive.
                      </h6>
                    )}
                    <h5 className="mb-1">Name: {reminder.name}</h5>
                    <p>Category: {reminder.category}</p>
                    <ListGroup>
                      <ListGroup.Item>
                        <Link
                          to={{
                            pathname: "/reminder",
                            state: {
                              reminder,
                            },
                          }}
                        >
                          <i className="fas fa-location-arrow"></i> View
                          Reminder
                        </Link>
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <Link
                          to={{
                            pathname: "/editreminder",
                            state: {
                              reminder,
                            },
                          }}
                        >
                          <i className="fas fa-edit"></i> Edit Reminder
                        </Link>
                      </ListGroup.Item>

                      {!reminder.isActive ? (
                        ""
                      ) : (
                        <ListGroup.Item>
                          <Link onClick={() => makeInActive(reminder.id)}>
                            <i className="fas fa-minus-circle"></i> Make
                            InActive
                          </Link>
                        </ListGroup.Item>
                      )}

                      <Link
                        onClick={(e) => {
                          if (
                            window.confirm(
                              "You are about to delete this reminder and all of its files: Are you sure about this?"
                            )
                          ) {
                            deleteReminder(e, reminder.id);
                          }
                        }}
                      >
                        <i className="fas fa-trash"></i>
                      </Link>
                    </ListGroup>
                  </Alert>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default Reminders;
