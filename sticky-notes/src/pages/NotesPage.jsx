import { useContext } from "react";
import { NoteContext } from "../context/NoteContext";
import NoteCard from '../components/NoteCard.jsx';
import Controls from "../components/Controls.jsx";

const NotesPage = () => {
  const { notes } = useContext(NoteContext);
  return (
    <div>
      {
        notes.map((note) => (
          <NoteCard key={note.$id} note={note} />
        ))
      }
      <Controls />
    </div>
  )
}

export default NotesPage;