import React from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
import Split from "react-split"
import { nanoid } from "nanoid"
import { addDoc, onSnapshot, doc, deleteDoc, setDoc } from "firebase/firestore" //This allows you to listen for changes in the firestore db and act accordingly in your local code
import { notesCollection, db } from "./firebase";

export default function App() {
    // const [notes, setNotes] = React.useState(
    //     () => JSON.parse(localStorage.getItem("notes")) || []
    // )
    const [notes, setNotes] = React.useState([])
    const [currentNoteId, setCurrentNoteId] = React.useState(
        /*(notes[0]?.id) ||*/ ""
    )
    const [tempNoteText, setTempNoteText] = React.useState("");
    
    const currentNote = 
        notes.find(note => note.id === currentNoteId) 
        || notes[0]

    const sortedNotes = notes.sort((a, b) => b.updatedAt - a.updatedAt)

    // React.useEffect(() => {
    //     localStorage.setItem("notes", JSON.stringify(notes))
    // }, [notes])

    React.useEffect(() => {
        const unsubscribe = onSnapshot(notesCollection, function(snapshot) {
            //Sync up our local notes array with the snapshot data
           const notesArr = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
           }))
           setNotes(notesArr)
        })
        return unsubscribe;

    }, []) //no dependencies array cause we only want to setup onSnapshot listener one time, when the component first mounts

    React.useEffect(() => {
        if (!currentNoteId) {
            setCurrentNoteId(notes[0]?.id)
        }
    }, [notes])

    React.useEffect(() => {
        if (currentNote) {
            setTempNoteText(currentNote.body)
        }
    }, [currentNote]) //we want this useEffect to run whenever current note changes

    //create an effect that runs any time the tempNoteText changes
    //delay the sending of the request to firebase
    //uses setTimeout
    //use clearTimeout to cancel the timeout if the useEffect runs again

    React.useEffect(() => {
         // Code to run when the component mounts or when the effect runs
        const timeoutId = setTimeout(() => {
            if (tempNoteText !== currentNote.body) {
                updateNote(tempNoteText);
            }
        }, 500)
        // Code to run when the component unmounts or before the next effect runs
        // Perform cleanup tasks here (e.g., unsubscribe, clear timers, etc.)
        return () => clearTimeout(timeoutId);
    }, [tempNoteText])

    async function createNewNote() {
        const newNote = {
            //id: nanoid(),
            body: "# Type your markdown note's title here",
            createdAt: Date.now(),
            updatedAt: Date.now()
        }
        //setNotes(prevNotes => [newNote, ...prevNotes])
        const newNoteRef = await addDoc(notesCollection, newNote);
        setCurrentNoteId(newNoteRef.id)
    }

    async function updateNote(text) {
        // setNotes(oldNotes => {
        //     const newArray = []
        //     for (let i = 0; i < oldNotes.length; i++) {
        //         const oldNote = oldNotes[i]
        //         if (oldNote.id === currentNoteId) {
        //             // Put the most recently-modified note at the top
        //             newArray.unshift({ ...oldNote, body: text })
        //         } else {
        //             newArray.push(oldNote)
        //         }
        //     }
        //     return newArray
        // })
        
        //the only thing you need to be concerned about is pushing the correct
        //update to firestore because the local notesArr would automatically update as expected because
        //of what we wrote before in our onSnapshot
        const docRef = doc(db, "notes", currentNoteId);
        await setDoc(
            docRef,
            {body: text, updatedAt: Date.now()},
            {merge: true}
        );
    }

    async function deleteNote(/*event,*/ noteId) {
        //event.stopPropagation()
        //setNotes(oldNotes => oldNotes.filter(note => note.id !== noteId))
        const docRef = doc(db, "notes", noteId);
        await deleteDoc(docRef);
    }

    return (
        <main>
            {
                notes.length > 0
                    ?
                    <Split
                        sizes={[30, 70]}
                        direction="horizontal"
                        className="split"
                    >
                        <Sidebar
                            //notes={notes}
                            notes={sortedNotes}
                            currentNote={currentNote}
                            setCurrentNoteId={setCurrentNoteId}
                            newNote={createNewNote}
                            deleteNote={deleteNote}
                        />
                        {
                            // currentNoteId &&
                            // notes.length > 0 &&
                            <Editor
                                //currentNote={currentNote}
                                //updateNote={updateNote}
                                tempNoteText={tempNoteText}
                                setTempNoteText={setTempNoteText}
                            />
                        }
                    </Split>
                    :
                    <div className="no-notes">
                        <h1>You have no notes</h1>
                        <button
                            className="first-note"
                            onClick={createNewNote}
                        >
                            Create one now
                </button>
                    </div>

            }
        </main>
    )
}
