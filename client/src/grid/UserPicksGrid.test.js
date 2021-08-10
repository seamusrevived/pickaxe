import {create, act} from "react-test-renderer";
import React from "react";
import UserPicksGrid from "./UserPicksGrid";
import {mockQueryData} from "../testUtilities/MockQueryData";
import {fireEvent, render, act as testingLibraryAct} from "@testing-library/react";

describe('UserPicksGrid', () => {

    let sendDataSpy;
    beforeEach(() => {
        sendDataSpy = jest.fn();
    })

    it('PickCell sendData callback executes send with update on onBlur', () => {
        let grid = null;

        act(() => {
            grid = create(<UserPicksGrid
                users={mockQueryData.users}
                games={mockQueryData.games}
                userPicks={mockQueryData.userPicks}
                sendData={sendDataSpy}
            />)
        });
        let cell = grid.root.find(el => el.props.id === "Vegas-HAR@NOR");

        act(() => {
            cell.children[0].props.onBlur({type: "onblur", target: {textContent: "THHH"}});
        });

        expect(sendDataSpy.mock.calls[0][0]).toEqual("Vegas")
        expect(sendDataSpy.mock.calls[0][1]).toEqual("HAR@NOR")
        expect(sendDataSpy.mock.calls[0][2]).toEqual("THHH")
    });


    it('PickCell send on pressing enter', () => {
        let grid = null;

        act(() => {
            grid = create(<UserPicksGrid
                users={mockQueryData.users}
                games={mockQueryData.games}
                userPicks={mockQueryData.userPicks}
                sendData={sendDataSpy}/>)
        });
        let cell = grid.root.find(el => el.props.id === "Davebob-CHI@GB");

        act(() => {
            cell.children[0].props.onBlur({type: "onkeypress", "keyCode": 13, target: {textContent: "GUB"}});
        });

        expect(sendDataSpy.mock.calls[0][0]).toEqual("Davebob")
        expect(sendDataSpy.mock.calls[0][1]).toEqual("CHI@GB")
        expect(sendDataSpy.mock.calls[0][2]).toEqual("GUB")
    });

    describe('on fired blur event', () => {
        let container;
        beforeEach(() => {
            const renderResult = render(<UserPicksGrid
                users={mockQueryData.users}
                games={mockQueryData.games}
                userPicks={mockQueryData.userPicks}
                sendData={sendDataSpy}
                rowOffset={0}
                columnOffset={0}
            />);
            container = renderResult.container;
        })


        it('sends data with cell InnerHTML', () => {
            let cell = container.querySelector('#Vegas-CHI\\@GB');

            testingLibraryAct(() => {
                fireEvent.blur(cell, {target: {textContent: "CHI"}});
            });

            expect(sendDataSpy.mock.calls[0][2]).toBe("CHI")
        });

        it(' do not send data when no change', () => {

            let {container} = render(<UserPicksGrid
                users={mockQueryData.users}
                games={mockQueryData.games}
                userPicks={mockQueryData.userPicks}
                sendData={sendDataSpy}
                rowOffset={0}
                columnOffset={0}
            />);
            let cell = container.querySelector('#Vegas-CHI\\@GB');

            testingLibraryAct(() => {
                fireEvent.blur(cell, {target: {textContent: "B"}});
            });

            expect(sendDataSpy.mock.calls.length).toEqual(0);
        });

        it('textContent with newlines only sends up to first newline', () => {
            let cell = container.querySelector('#Vegas-CHI\\@GB');

            testingLibraryAct(() => {
                fireEvent.blur(cell, {target: {textContent: "CHI\nall this other data"}});
            });

            expect(sendDataSpy.mock.calls[0][2]).toBe("CHI")
        });

        it('innerHTML from textContent with newlines only have up to first newline', () => {
            let cell = container.querySelector('#Vegas-CHI\\@GB');

            testingLibraryAct(() => {
                fireEvent.blur(cell, {target: {textContent: "CHI\nall this other data"}});
            });

            cell = container.querySelector('#Vegas-CHI\\@GB');
            expect(cell.textContent).toBe("CHI")
        });
    });

    describe("row and column offsets", () => {
        const firstCellId = `${mockQueryData.users[0].name}-${mockQueryData.games[0].name}`;
        const firstRowSecondColumnCellId = `${mockQueryData.users[1].name}-${mockQueryData.games[0].name}`;
        const secondRowSecondColumnCellId = `${mockQueryData.users[1].name}-${mockQueryData.games[1].name}`;

        it('first PickCell has column equal to column offset when offset 0', () => {
            let grid = null;

            const expectedColumn = 0;

            act(() => {
                grid = create(<UserPicksGrid
                    users={mockQueryData.users}
                    games={mockQueryData.games}
                    userPicks={mockQueryData.userPicks}
                    sendData={sendDataSpy}
                    columnOffset={expectedColumn}
                />)
            });
            let cell = grid.root.find(el => el.props.id === firstCellId);

            expect(cell.props.column).toEqual(expectedColumn);
        });

        it('first PickCell has column equal to column offset when offset 1', () => {
            let grid = null;

            const expectedColumn = 1;

            act(() => {
                grid = create(<UserPicksGrid
                    users={mockQueryData.users}
                    games={mockQueryData.games}
                    userPicks={mockQueryData.userPicks}
                    sendData={sendDataSpy}
                    columnOffset={expectedColumn}
                />)
            });
            let cell = grid.root.find(el => el.props.id === firstCellId);

            expect(cell.props.column).toEqual(expectedColumn);
        });

        it('first row second column PickCell has column equal to column offset 1 when offset 0', () => {
            let grid = null;

            const columnOffset = 0;
            const expectedColumn = columnOffset + 1;

            act(() => {
                grid = create(<UserPicksGrid
                    users={mockQueryData.users}
                    games={mockQueryData.games}
                    userPicks={mockQueryData.userPicks}
                    sendData={sendDataSpy}
                    columnOffset={columnOffset}
                />)
            });
            let cell = grid.root.find(el => el.props.id === firstRowSecondColumnCellId);

            expect(cell.props.column).toEqual(expectedColumn);
        });

        it('first PickCell has row equal to row offset when offset 0', () => {
            let grid = null;

            const expectedRow = 0;

            act(() => {
                grid = create(<UserPicksGrid
                    users={mockQueryData.users}
                    games={mockQueryData.games}
                    userPicks={mockQueryData.userPicks}
                    sendData={sendDataSpy}
                    rowOffset={expectedRow}
                />)
            });
            let cell = grid.root.find(el => el.props.id === firstCellId);

            expect(cell.props.row).toEqual(expectedRow);
        });

        it('first PickCell has row equal to row offset when offset 1', () => {
            let grid = null;

            const expectedRow = 1;

            act(() => {
                grid = create(<UserPicksGrid
                    users={mockQueryData.users}
                    games={mockQueryData.games}
                    userPicks={mockQueryData.userPicks}
                    sendData={sendDataSpy}
                    rowOffset={expectedRow}
                />)
            });
            let cell = grid.root.find(el => el.props.id === firstCellId);

            expect(cell.props.row).toEqual(expectedRow);
        });

        it('second row second column PickCell has row equal to 2 when offset 1', () => {
            let grid = null;

            const rowOffset = 1;
            const expectedRow = rowOffset + 1;

            act(() => {
                grid = create(<UserPicksGrid
                    users={mockQueryData.users}
                    games={mockQueryData.games}
                    userPicks={mockQueryData.userPicks}
                    sendData={sendDataSpy}
                    rowOffset={rowOffset}
                />)
            });
            let cell = grid.root.find(el => el.props.id === secondRowSecondColumnCellId);

            expect(cell.props.row).toEqual(expectedRow);
        });
    });
});
