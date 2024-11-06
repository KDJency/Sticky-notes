import { useRef, useEffect, useState, useContext } from 'react';
import { db } from '../appwrite/databases';
import DeleteButton from '../components/DeleteButton';
import Spinner from '../icons/Spinner';
import { autoGrow, bodyParser, setNewOffset, setZIndex } from '../utils';
import { NoteContext } from '../context/NoteContext';

const NoteCard = ({ note }) => {
  const [position, setPosition] = useState(JSON.parse(note.position));
  const [saving, setSaving] = useState(false);
  const { setSelectedNote } = useContext(NoteContext);
  const keyUpTimer = useRef(null);
  const colors = JSON.parse(note.colors);
  const body = bodyParser(note.body);

  let mouseStartPos = { x: 0, y: 0 };
  const cardRef = useRef(null);

  const textAreaRef = useRef(null);

  const mouseDown = (event) => {
    if (event.target.className === "card-header") {
      mouseStartPos.x = event.clientX;
      mouseStartPos.y = event.clientY;

      document.addEventListener('mousemove', mouseMove);
      document.addEventListener("mouseup", mouseUp);

      setZIndex(cardRef.current);
      setSelectedNote(note);
    }
  }

  const mouseUp = async () => {
    document.removeEventListener("mousemove", mouseMove);
    document.removeEventListener("mouseup", mouseUp);

    const newPosition = setNewOffset(cardRef.current); //{x,y}
    saveData("position", newPosition);
  };

  const mouseMove = (event) => {
    const mouseMoveDirection = {
      x: mouseStartPos.x - event.clientX,
      y: mouseStartPos.y - event.clientY
    }

    mouseStartPos.x = event.clientX;
    mouseStartPos.y = event.clientY;

    const newPosition = setNewOffset(cardRef.current, mouseMoveDirection);

    setPosition(newPosition);
  }

  const saveData = async (key, value) => {
    const payload = { [key]: JSON.stringify(value) };
    try {
      await db.notes.update(note.$id, payload);
    } catch (error) {
      console.error(error);
    }

    setSaving(false);
  };

  const handleKeyUp = async () => {
    //1 - Initiate "saving" state
    setSaving(true);

    //2 - If we have a timer id, clear it so we can add another two seconds
    if (keyUpTimer.current) {
      clearTimeout(keyUpTimer.current);
    }

    //3 - Set timer to trigger save in 2 seconds
    keyUpTimer.current = setTimeout(() => {
      saveData("body", textAreaRef.current.value);
    }, 2000);
  };

  useEffect(() => {
    autoGrow(textAreaRef);
    setZIndex(cardRef.current);
  }, []);

  return (
    <div
      ref={cardRef}
      className="card"
      style={{
        backgroundColor: colors.colorBody,
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      <div
        onMouseDown={mouseDown}
        className="card-header"
        style={{
          backgroundColor: colors.colorHeader,
        }}
      >
        <DeleteButton noteId={note.$id} />

        {
          saving && (
            <div className="card-saving">
              <Spinner color={colors.colorText} />
              <span style={{ color: colors.colorText }}>Saving...</span>
            </div>
          )
        }
      </div>

      <div className="card-body">
        <textarea
          ref={textAreaRef}
          onKeyUp={handleKeyUp}
          style={{ color: colors.colorText }}
          defaultValue={body}
          onInput={() => { autoGrow(textAreaRef) }}
          onFocus={() => {
            setZIndex(cardRef.current)
            setSelectedNote(note);
          }}
        ></textarea>
      </div>
    </div>
  );
};

export default NoteCard;