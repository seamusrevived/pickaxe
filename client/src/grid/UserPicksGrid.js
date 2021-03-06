import React from "react";
import UserPickColumn from "./UserPickColumn";

const UserPicksGrid = props => {
    const {users, games, userPicks, sendData, rowOffset, columnOffset} = props;
    return (!users || !games) ? undefined :
        users.map((user, index) => {
            return <UserPickColumn
                className='grid__column' key={`grid-column-${user.name}`}
                user={user}
                games={games}
                pickSet={getPicksForUser(userPicks, user.name)}
                sendData={sendData}
                rowOffset={rowOffset}
                column={columnOffset + index}
            />
        });
}

export default UserPicksGrid


function getPicksForUser(passedPicks, userName) {
    if (!passedPicks || passedPicks.size === 0) return null;
    const firstMatchingPick = passedPicks.filter(pickSet => pickSet.user.name === userName)[0];

    return firstMatchingPick ? firstMatchingPick.picks : null
}

