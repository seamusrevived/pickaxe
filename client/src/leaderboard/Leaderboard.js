import React from "react";
import {LeaderboardRow} from "./LeaderboardRow";
import "./Leaderboard.css"

export function Leaderboard({data}) {
    const rows = data
        .sort((a, b) => b.correctPicks - a.correctPicks)
        .sort((a, b) => b.correctWeeks - a.correctWeeks)
        .map((leader, index) =>
            <LeaderboardRow key={`leader-${index}`}
                            data-testid={`leader-${index}`}
                            name={leader.name}
                            weeks={leader.correctWeeks}
                            picks={leader.correctPicks}/>
        );
    const cellHeaderBaseClasses = "leaderboard__cell leaderboard__cell--no-right-border ";

    return <div key="grid-leaders" className="leaderboard__container">
        <div className={`${cellHeaderBaseClasses} leaderboard__cell--name`}
            data-testid="leaderboard-names-header">
            Leaders
        </div>
        <div className={`${cellHeaderBaseClasses} leaderboard__cell--numerical`}
            data-testid="leaderboard-weeks-header">
            Weeks Won
        </div>
        <div className={`${cellHeaderBaseClasses} leaderboard__cell--numerical`}
            data-testid="leaderboard-picks-header">
            Total Correct
        </div>
        {rows}
    </div>
}
