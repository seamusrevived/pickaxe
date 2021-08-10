import ColumnCells from "./ColumnCells";
import UserPicksGrid from "./UserPicksGrid";
import React from "react";
import {useMutation} from "@apollo/react-hooks";
import {UPDATE_PICKS_MUTATION} from "../graphqlQueries";
import "./WeeklyGamesGrid.css"
import RowCells from "./RowCells";

const composeSendDataForWeek = (week, sendData) => {
    return (userName, gameName, updatedPick) => sendData({
        variables: {
            name: userName,
            week: week,
            game: gameName,
            pick: updatedPick,
        }
    });
}

const WeeklyGamesGrid = props => {
    const [sendData] = useMutation(UPDATE_PICKS_MUTATION);

    const userNames = props.users?.map(user => user.name);

    const gameNames = props.games?.map(game => game.name);
    const gameSpreads = props.games?.map(game => game.spread);
    const gameResults = props.games?.map(game => game.result);

    const totalValues = props.totals?.map(totalData => totalData.total);


    const headerRow = [
        <div className='grid__cell grid__cell--name grid__cell--no-right-border'
             style={{gridRow: 1, gridColumn: 2}}
             key="spread-header"
             data-testid="spread-header"
        >Spread</div>,
        <RowCells key="grid__cell--names"
                  items={userNames}
                  name="name"
                  row={1}
                  columnOffset={3}
                  topBorder
                  leftBorder
        />,
        <div className='grid__cell grid__cell--name grid__cell--no-right-border'
             style={{gridRow: 1, gridColumn: 3 + userNames.length}}
             key="result-header"
             data-testid="result-header"
        >Result</div>
    ];


    const grid = [
        ...headerRow,
        <ColumnCells key="game-cells"
                     id="game-cells"
                     column={1}
                     rowOffset={2}
                     leftBorder
                     topBorder
                     alignLeft
                     items={gameNames}
                     name="game"
        />,
        <ColumnCells key="spread-cells"
                     className='grid__column'
                     column={2}
                     rowOffset={2}
                     items={gameSpreads}
                     name="spread"
        />,
        <UserPicksGrid id="user-picks-grid"
                       key="user-picks-grid"
                       users={props.users}
                       games={props.games}
                       userPicks={props.userPicks}
                       columnOffset={3}
                       rowOffset={2}
                       sendData={composeSendDataForWeek(props.currentWeek, sendData)}
        />,
        <ColumnCells key="result-cells"
                     items={gameResults}
                     name="result"
                     column={3 + userNames.length}
                     rowOffset={2}
        />,
        <RowCells key="total-cells"
                  items={totalValues}
                  name="total"
                  columnOffset={3}
                  row={gameNames.length + 2}
                  leftBorder
        />
    ];

    const gridStyleColumns = {
        gridTemplateColumns: `repeat(${3 + userNames.length}, 6.5em)`
    };

    return <div className="grid" style={gridStyleColumns}>{grid}</div>;
}

export default WeeklyGamesGrid
