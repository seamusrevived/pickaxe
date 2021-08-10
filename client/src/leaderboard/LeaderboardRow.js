import React from "react";

export function LeaderboardRow(props) {
    const baseCssClasses = "leaderboard__cell"
    let firstCellClass = "leaderboard__cell--left-border";

    return [
        <div className={`${baseCssClasses} ${firstCellClass} leaderboard__cell--name`}
             data-testid={`leaderboard-row-name-${props.name}`}
             key={`leaderboard-row-name-${props.name}`}
        >{props.name}</div>,
        <div className={`${baseCssClasses} leaderboard__cell--numerical`}
             data-testid={`leaderboard-row-weeks-${props.name}`}
             key={`leaderboard-row-weeks-${props.name}`}
        >{props.weeks}</div>,
        <div className={`${baseCssClasses} leaderboard__cell--numerical`}
             data-testid={`leaderboard-row-picks-${props.name}`}
             key={`leaderboard-row-picks-${props.name}`}
        >{props.picks}</div>
    ];
}
