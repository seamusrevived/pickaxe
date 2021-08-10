import React from "react";
import {create, act} from "react-test-renderer";
import UserPickColumn from "./UserPickColumn";

describe('UserPickColumn', () => {
    it('correct pick has cell flagged correct', () => {
        let renderer = null;
        act(() => {
            renderer = create(<UserPickColumn
                games={[{name: "CHI@GB", result:"CHI"}]}
                pickSet={[{game: "CHI@GB", pick: "CHI"}]}
                user={{name: "someone"}}/>)
        });

        const cell = renderer.root.findByProps({id: "someone-CHI@GB"})

        expect(cell.props.correct).toBe(true)
    })

    it('correct pick is not case sensitive', () => {
        let renderer = null;
        act(() => {
            renderer = create(<UserPickColumn
                games={[{name: "CHI@GB", result:"CHI"}]}
                pickSet={[{game: "CHI@GB", pick: "cHi"}]}
                user={{name: "someone"}}/>)
        });

        const cell = renderer.root.findByProps({id: "someone-CHI@GB"})

        expect(cell.props.correct).toBe(true)
    })

    it('incorrect pick has cell flagged incorrect', () => {
        let renderer = null;
        act(() => {
            renderer = create(<UserPickColumn
                games={[{name: "CHI@GB", result:"CHI"}]}
                pickSet={[{game: "CHI@GB", pick: "GB"}]}
                user={{name: "someone"}}/>)
        });

        const cell = renderer.root.findByProps({id: "someone-CHI@GB"})

        expect(cell.props.correct).toBe(false)
    })

    it('null result flagged as not correct', () => {
        let renderer = null;
        act(() => {
            renderer = create(<UserPickColumn
                games={[{name: "CHI@GB"}]}
                pickSet={[{game: "CHI@GB", pick: "GB"}]}
                user={{name: "someone"}}/>)
        });

        const cell = renderer.root.findByProps({id: "someone-CHI@GB"})

        expect(cell.props.correct).toBe(false)
    })

    it('null pick flagged as not correct', () => {
        let renderer = null;
        act(() => {
            renderer = create(<UserPickColumn
                games={[{name: "CHI@GB", result: "GB"}]}
                pickSet={[{game: "CHI@GB"}]}
                user={{name: "someone"}}/>)
        });

        const cell = renderer.root.findByProps({id: "someone-CHI@GB"})

        expect(cell.props.correct).toBe(false)
    })

    it('null pick and result flagged as not correct', () => {
        let renderer = null;
        act(() => {
            renderer = create(<UserPickColumn
                games={[{name: "CHI@GB"}]}
                pickSet={[]}
                user={{name: "someone"}}/>)
        });

        const cell = renderer.root.findByProps({id: "someone-CHI@GB"})

        expect(cell.props.correct).toBe(false)
    })

    describe('column grid row and column numbers', () => {
        const games = [{name: "CHI@GB"}, {name: "DET@WAS"}];
        const user = {name: "someone"};

        const firstCellId = `${user.name}-${games[0].name}`;
        const secondCellId = `${user.name}-${games[1].name}`;

        it('first cell has column 0 when column prop is 0', () => {
            const expectedColumn = 0;
            let renderer = null;
            act(() => {
                renderer = create(<UserPickColumn
                    games={games}
                    pickSet={[]}
                    user={user}
                    column={expectedColumn}
                />)
            });

            const cell = renderer.root.findByProps({id: firstCellId})

            expect(cell.props.column).toBe(expectedColumn)
        });

        it('second cell has column 0 when column prop is 0', () => {
            const expectedColumn = 0;
            let renderer = null;
            act(() => {
                renderer = create(<UserPickColumn
                    games={games}
                    pickSet={[]}
                    user={user}
                    column={expectedColumn}
                />)
            });

            const cell = renderer.root.findByProps({id: secondCellId})

            expect(cell.props.column).toBe(expectedColumn)
        });

        it('first cell has column 1 when column prop is 1', () => {
            const expectedColumn = 1;
            let renderer = null;
            act(() => {
                renderer = create(<UserPickColumn
                    games={games}
                    pickSet={[]}
                    user={user}
                    column={expectedColumn}
                />)
            });

            const cell = renderer.root.findByProps({id: firstCellId})

            expect(cell.props.column).toBe(expectedColumn)
        });

        it('first cell has row 0 when row offset is 0', () => {
            const expectedRow = 0;
            let renderer = null;
            act(() => {
                renderer = create(<UserPickColumn
                    games={games}
                    pickSet={[]}
                    user={user}
                    rowOffset={expectedRow}
                />)
            });

            const cell = renderer.root.findByProps({id: firstCellId})

            expect(cell.props.row).toBe(expectedRow)
        });

        it('first cell has row 1 when row offset is 1', () => {
            const expectedRow = 1;
            let renderer = null;
            act(() => {
                renderer = create(<UserPickColumn
                    games={games}
                    pickSet={[]}
                    user={user}
                    rowOffset={expectedRow}
                />)
            });

            const cell = renderer.root.findByProps({id: firstCellId})

            expect(cell.props.row).toBe(expectedRow)
        });
        it('second cell has row 1 when row offset is 0', () => {
            const rowOffset = 0;
            const expectedRow = rowOffset+1;
            let renderer = null;
            act(() => {
                renderer = create(<UserPickColumn
                    games={games}
                    pickSet={[]}
                    user={user}
                    rowOffset={rowOffset}
                />)
            });

            const cell = renderer.root.findByProps({id: secondCellId})

            expect(cell.props.row).toBe(expectedRow)
        });
    });
})
