import {create} from "react-test-renderer";
import React from "react";
import {LeaderboardRow} from "./LeaderboardRow";

describe('LeaderboardRow', () => {
    const name = "Gandalf";
    it('renders name', () => {
        const row = create(<LeaderboardRow name={name} weeks={0} picks={0}/>).root;

        const nameCell = row.findByProps({"data-testid": `leaderboard-row-name-${name}`})

        expect(nameCell.children[0]).toBe(name)
    });

    it('name has left border', () => {
        const row = create(<LeaderboardRow name={name} weeks={0} picks={0}/>).root;

        const nameCell = row.findByProps({"data-testid": `leaderboard-row-name-${name}`})
        const classes = nameCell.props.className.split(" ");

        expect(classes.includes("leaderboard__cell--left-border")).toBeTruthy();
    });

    it('renders different name', () => {
        const name = "Ogo";
        const row = create(<LeaderboardRow name={name} weeks={0} picks={0}/>).root;
        const nameCell = row.findByProps({"data-testid": `leaderboard-row-name-${name}`})

        expect(nameCell.children[0]).toBe(name)
    });

    it('renders weeks of 0', () => {
        const row = create(<LeaderboardRow name={name} weeks={0} picks={0}/>).root;
        const weeksCell = row.findByProps({"data-testid": `leaderboard-row-weeks-${name}`})

        expect(weeksCell.children[0]).toBe("0")
    });

    it('renders weeks of 1', () => {
        const row = create(<LeaderboardRow name={name} weeks={1} picks={0}/>).root;
        const weeksCell = row.findByProps({"data-testid": `leaderboard-row-weeks-${name}`})

        expect(weeksCell.children[0]).toBe("1")
    });

    it('weeks does not have left border', () => {
        const row = create(<LeaderboardRow name={name} weeks={0} picks={0}/>).root;

        const weeksCell = row.findByProps({"data-testid": `leaderboard-row-weeks-${name}`})
        const classes = weeksCell.props.className.split(" ");

        expect(classes.includes("leaderboard__cell--left-border")).toBeFalsy();
    });

    it('renders picks of 0', () => {
        const row = create(<LeaderboardRow name={name} weeks={0} picks={0}/>).root;
        const picksCell = row.findByProps({"data-testid": `leaderboard-row-picks-${name}`})

        expect(picksCell.children[0]).toBe("0")
    });

    it('renders picks of 1', () => {
        const row = create(<LeaderboardRow name={name} weeks={0} picks={1}/>).root;
        const picksCell = row.findByProps({"data-testid": `leaderboard-row-picks-${name}`})

        expect(picksCell.children[0]).toBe("1")
    });

    it('picks does not have left border', () => {
        const row = create(<LeaderboardRow name={name} weeks={0} picks={0}/>).root;

        const picksCell = row.findByProps({"data-testid": `leaderboard-row-picks-${name}`})
        const classes = picksCell.props.className.split(" ");

        expect(classes.includes("leaderboard__cell--left-border")).toBeFalsy();
    });

});
