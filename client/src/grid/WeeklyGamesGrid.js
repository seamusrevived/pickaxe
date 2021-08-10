import React from "react";
import {useMutation} from "@apollo/react-hooks";
import {UPDATE_PICKS_MUTATION} from "../graphqlQueries";
import ColumnCells from "./ColumnCells";
import RowCells from "./RowCells";
import HeaderRow from "./HeaderRow";
import UserPicksGrid from "./UserPicksGrid";
import "./WeeklyGamesGrid.css"
import {ReactComponent as Spinner} from "./spinner.svg";

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

    const nHeaderRows = 1;

    const nLeadingColumns = 2;
    const nTrailingColumns = 1;
    const nTotalColumns = nLeadingColumns + nTrailingColumns + userNames.length;

    const headerRow = <HeaderRow key="header-row"
                                 userNames={userNames}/>;

    const gamesColumn = <ColumnCells key="game-cells"
                                     id="game-cells"
                                     column={1}
                                     rowOffset={nHeaderRows + 1}
                                     leftBorder
                                     topBorder
                                     alignLeft
                                     items={gameNames}
                                     name="game"/>;

    const spreadsColumn = <ColumnCells key="spread-cells"
                                       className='grid__column'
                                       column={2}
                                       rowOffset={2}
                                       items={gameSpreads}
                                       name="spread"
    />;

    const userPicksGrid = <UserPicksGrid id="user-picks-grid"
                                         key="user-picks-grid"
                                         users={props.users}
                                         games={props.games}
                                         userPicks={props.userPicks}
                                         columnOffset={nLeadingColumns + 1}
                                         rowOffset={nHeaderRows + 1}
                                         sendData={composeSendDataForWeek(props.currentWeek, sendData)}/>;

    const resultsColumn = <ColumnCells key="result-cells"
                                       items={gameResults}
                                       name="result"
                                       column={nLeadingColumns + userNames.length + 1}
                                       rowOffset={2}/>;

    const totalsRow = <RowCells key="total-cells"
                                items={totalValues}
                                name="total"
                                columnOffset={3}
                                row={gameNames.length + nHeaderRows + 1}
                                leftBorder/>;

    const gridStyleColumns = {
        gridTemplateColumns: `repeat(${nTotalColumns}, 6.5em)`
    };

    const spinnerStyle = {
        left: `${nTotalColumns * 6.5 / 2 - 5}em`
    };

    const grid = [
            headerRow,
            gamesColumn,
            spreadsColumn,
            userPicksGrid,
            resultsColumn,
            totalsRow,
            props.isLoading
                ? <Spinner data-testid="loading-spinner"
                           key="loading-spinner"
                           className="spinner"
                           style={spinnerStyle}
                           src="pickaxe/spinner.svg"/>
                : null
        ]
    ;


    return <div className="grid" style={gridStyleColumns}>{grid}</div>;
}

export default WeeklyGamesGrid
