import React from "react";
import {Leaderboard} from "./Leaderboard";
import {create} from "react-test-renderer";
import {LeaderboardRow} from "./LeaderboardRow";

describe('Leaderboard', () => {
    let leaderboard = null;

    beforeEach(() => {
        const leaderData = [{name: "Seamus", correctWeeks: 0, correctPicks: 0}]
        leaderboard = create(<Leaderboard data={leaderData}/>).root
    })

    it('renders with single user', () => {
        const user = leaderboard.findByProps({"data-testid": "leader-0"});
        expect(user.props.name).toEqual("Seamus")
        expect(user.props.weeks).toEqual(0)
        expect(user.props.picks).toEqual(0)
    });

    it('names header has no right border', () => {
        const headerCell = leaderboard.findByProps({"data-testid": "leaderboard-names-header"});
        const classes = headerCell?.props?.className?.split(" ");

        expect(classes.includes("leaderboard__cell--no-right-border")).toBeTruthy();
    });

    it('weeks header has no right border', () => {
        const headerCell = leaderboard.findByProps({"data-testid": "leaderboard-weeks-header"});
        const classes = headerCell?.props?.className?.split(" ");

        expect(classes.includes("leaderboard__cell--no-right-border")).toBeTruthy();
    });

    it('picks header has no right border', () => {
        const headerCell = leaderboard.findByProps({"data-testid": "leaderboard-picks-header"});
        const classes = headerCell?.props?.className?.split(" ");

        expect(classes.includes("leaderboard__cell--no-right-border")).toBeTruthy();
    });

    describe('multiple users', () => {

        it('renders with two users', () => {
            const leaderData = [
                {name: "Seamus", correctWeeks: 0, correctPicks: 0},
                {name: "Sereres", correctWeeks: 0, correctPicks: 0}]

            const leaderboard = create(<Leaderboard data={leaderData}/>).root

            const users = leaderboard.findAllByType(LeaderboardRow);
            expect(users).toHaveLength(2)
        });

        it('users are sorted by weeks', () => {
            const leaderData = [
                {name: "Seamus", correctWeeks: 0, correctPicks: 0},
                {name: "Sereres", correctWeeks: 1, correctPicks: 1}]

            const leaderboard = create(<Leaderboard data={leaderData}/>).root

            const user = leaderboard.findByProps({"data-testid": "leader-0"});
            expect(user.props.name).toEqual("Sereres")
        });

        it('users are sorted by weeks with picks as tiebreaker', () => {
            const leaderData = [
                {name: "Seamus", correctWeeks: 0, correctPicks: 2},
                {name: "Sereres", correctWeeks: 1, correctPicks: 1},
                {name: "Gandalf", correctWeeks: 1, correctPicks: 2}

            ]

            const leaderboard = create(<Leaderboard data={leaderData}/>).root

            const user = leaderboard.findByProps({"data-testid": "leader-0"});
            expect(user.props.name).toEqual("Gandalf")
        });
    })

})
