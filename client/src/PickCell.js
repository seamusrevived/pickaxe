import React, {useEffect, useLayoutEffect, useState} from "react";


function stripAfterNewline(text) {
    return /^.*/.exec(text)[0]
}

export default function PickCell(props){
    const [innerText, setInnerText] = useState(props.pick);

    useEffect(() => {
        setInnerText(props.pick)
    }, [props.pick]);

    const callbackWrapper = (event) => {
        if(event.target.textContent === innerText){
            return;
        }

        const updatedPick = stripAfterNewline(event.target.textContent);
        event.target.textContent = updatedPick;
        props.sendData(event, updatedPick);
        setInnerText(updatedPick)
    };

    return <div contentEditable={true}
                spellCheck={false}
                onBlur={callbackWrapper}
                suppressContentEditableWarning="true"
                id={props.id}
    >{innerText}</div>
}
