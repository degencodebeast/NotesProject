// import React from "react"
// import R from "react-mde"
// const ReactMde = R.default
// import Showdown from "showdown"

import React from "react"
import ReactMde from "react-mde"
// const ReactMde = R.default
import Showdown from "showdown"

export default function Editor({ /*currentNote, updateNote*/ tempNoteText, setTempNoteText }) {
    const [selectedTab, setSelectedTab] = React.useState("write")

    const converter = new Showdown.Converter({
        tables: true,
        simplifiedAutoLink: true,
        strikethrough: true,
        tasklists: true,
    })  

    return (
        <section className="pane editor">
            <ReactMde
                //value={currentNote?.body}
                //onChange={updateNote}
                value={tempNoteText}
                onChange={setTempNoteText}
                selectedTab={selectedTab}
                onTabChange={setSelectedTab}
                generateMarkdownPreview={(markdown) =>
                    Promise.resolve(converter.makeHtml(markdown))
                }
                minEditorHeight={80}
                heightUnits="vh"
            />
        </section>
    )
}
