import { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { Navigate, useNavigate } from "react-router-dom";
import VideoLayout from "./components/VideoLayout";
import { VideoStream } from "./dtos/VideoStream";

interface VideoStreamInput {
  id: number;
  name: string;
  wsUrl: string;
}

function Home() {

  useEffect(() => {
    refreshStreams();
  }, []);

  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);

  const [streams, setStreams] = useState<VideoStream[]>([]);

  const showModal = () => {
    setIsOpen(true);
  };

  const hideModal = () => {
    setIsOpen(false);
  };

  const showDeleteModal = () => {
    setIsDeleteConfirm(true);
  };

  const hideDeleteModal = () => {
    setIsDeleteConfirm(false);
  };

  const [inputs, setInputs] = useState<VideoStreamInput>({
    id: 0,
    name: "",
    wsUrl: "",
  });

  const [disabled, setDisabled] = useState(true);

  const refreshStreams = () => {
    fetch("/api/all")
      .then((res) => res.json())
      .then(
        (streams) => {
          setStreams(streams);
        },
        (error) => {
          // setError(error);
        }
      );
  };

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name;
    const value = event.target.value;
    const wsValid = wsUrlRegex.test(inputs.wsUrl);
    setInputs((values) => ({ ...values, [name]: value }));
    setDisabled(inputs.name === "" || inputs.wsUrl === "" || !wsValid);
  };

  const handleFormSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    fetch("/api/save", {
      method: "POST",
      body: JSON.stringify(inputs),
    })
      .then((res) => res.json())
      .then((_) => {
        refreshStreams();
      });
    hideModal();
  };

  const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    fetch("/api/delete/" + inputs.id, {
      method: "DELETE",
      body: JSON.stringify(inputs),
    }).then((_) => {
      refreshStreams();
    });
    hideDeleteModal();
  };

  const newStream = () => {
    setInputs({
      id: 0,
      name: "",
      wsUrl: "",
    });
    showModal();
  };

  const onEdit = (item: VideoStream) => {
    setInputs(item);
    showModal();
  };

  const onDelete = (item: VideoStream) => {
    setInputs(item);
    showDeleteModal();
  };

  const onSingleStreamView = (item: VideoStream) => {
    navigate("/stream/" + item.id);
  };

  const wsUrlRegex = /^wss?:\/\/(?:www\.)?(?:localhost|[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b)(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-2">
        <a className="navbar-brand ml-1" href="#">
          Video Wall
        </a>
        <ul className="nav navbar-nav ms-auto">
          <button
            className="btn btn-primary"
            data-toggle="modal"
            data-target="#newStream"
            onClick={newStream}
          >
            Add
          </button>
        </ul>
      </nav>
      <VideoLayout
        videoStreams={streams}
        onEdit={onEdit}
        onDelete={onDelete}
        onSingleStreamView={onSingleStreamView}
      ></VideoLayout>
      <Modal show={isOpen}>
        <Modal.Header>
          {inputs.id > 0 ? "Edit" : "New"} Video Stream
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label htmlFor="nameInput" className="form-label">
              Name
            </label>
            <input
              type="text"
              className="form-control"
              id="nameInput"
              name="name"
              value={inputs.name || ""}
              onChange={handleFormChange}
            ></input>
          </div>
          <div className="mb-3">
            <label htmlFor="wsUrlInput" className="form-label">
              WS URL
            </label>
            <input
              type="text"
              className="form-control"
              id="wsUrlInput"
              name="wsUrl"
              value={inputs.wsUrl || ""}
              onChange={handleFormChange}
            ></input>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-primary" onClick={hideModal}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleFormSubmit}
            disabled={disabled}
          >
            Save
          </button>
        </Modal.Footer>
      </Modal>
      <Modal show={isDeleteConfirm}>
        <Modal.Header>Delete Video Stream?</Modal.Header>
        <Modal.Body>
          <div className="mb-3">Deleting stream {inputs.name}?</div>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-primary" onClick={hideDeleteModal}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleDelete}>
            Delete
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Home;
