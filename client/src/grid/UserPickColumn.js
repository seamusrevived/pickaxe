import PickCell from "./PickCell";
import React from "react";

const UserPickColumn = props => {
    return props.games.map((game, index) => {
        let thisPick = getPickByGame(props.pickSet, game.name);

        const sendDataCallback = (updatedPick) => {
            props.sendData(props.user.name, game.name, updatedPick)
        };
        return <PickCell
            className="pick-cell grid__cell"
            id={`${props.user.name}-${game.name}`}
            key={`${props.user.name}-${game.name}`}
            game={game.name}
            pick={thisPick}
            user={props.user.name}
            correct={!!thisPick && thisPick?.toLowerCase() === game.result?.toLowerCase()}
            sendData={sendDataCallback}
            row={props.rowOffset + index}
            column={props.column}
        />
    })
}

export default UserPickColumn

function getPickByGame(passedPicks, gameName) {
    if (!passedPicks || passedPicks.size === 0) return null;
    const firstMatchingPick = passedPicks.filter(pick => pick["game"] === gameName)[0];

    return firstMatchingPick ? firstMatchingPick["pick"] : null
}
