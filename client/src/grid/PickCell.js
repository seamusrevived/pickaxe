import React, {useEffect, useState} from "react";


function stripAfterNewline(text) {
    return /^.*/.exec(text)[0]
}

export default function PickCell(props) {
    const [pickText, setPickText] = useState(props.pick);

    useEffect(() => {
        setPickText(props.pick)
    }, [props.pick]);

    const callbackWrapper = (event) => {
        if (event.target.textContent === pickText) {
            return;
        }

        const updatedPick = stripAfterNewline(event.target.textContent);
        props.sendData(updatedPick);
        setPickText(updatedPick);

    };

    let cssClass = `grid__cell ${props.correct ? 'grid__cell--correct-pick' : ''}`
    let style = {
      gridRow: props.row,
      gridColumn: props.column
    };

    return <div contentEditable={true}
                spellCheck={false}
                onBlur={callbackWrapper}
                suppressContentEditableWarning="true"
                id={props.id}
                className={cssClass}
                style={style}
    >{pickText}</div>
}
