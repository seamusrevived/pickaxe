import {mockQueryData} from "../testUtilities/MockQueryData";
import {act, create} from "react-test-renderer";
import {assertAllUserPicksMatchCellText, findByClassName, getPickByGame} from "../testUtilities/Helpers";
import PickCell from "./PickCell";
import React from "react";
import WeeklyGamesGrid from "./WeeklyGamesGrid";
import {useMutation} from '@apollo/react-hooks';
import gql from "graphql-tag";

jest.mock('@apollo/react-hooks');

describe('WeeklyGamesGrid', () => {
    let grid, renderer;

    beforeEach(() => {
        jest.resetAllMocks();
        useMutation.mockReturnValue([() => {
        }]);

        renderer = create(<WeeklyGamesGrid
            currentWeek="0"
            users={mockQueryData.users}
            games={mockQueryData.games}
            userPicks={mockQueryData.userPicks}
            totals={mockQueryData.userTotals}/>);
        grid = renderer.root;
    });

    it('calls useMutation', () => {
        expect(useMutation).toBeCalled()
    });

    it('useMutation is called with pick updating query', () => {
        const updatingQuery =
        gql`mutation Mutation($name: String!, $week: String!, $game: String!, $pick: String!)
        { updatePick(name: $name, userPick: { week: $week, game: $game, pick: $pick })
        }`;

        expect(useMutation.mock.calls[0][0]).toBe(updatingQuery);
    });

    describe('rendered picks cells', () => {
        it('WeeklyGamesGrid is given sendData callback', () => {
            let grid = null;
            let isCalled = false;
            const callback = () => {
                isCalled = true;
            };
            useMutation.mockReturnValue([callback]);
            act(() => {
                grid = create(<WeeklyGamesGrid
                    currentWeek="0"
                    users={mockQueryData.users}
                    games={mockQueryData.games}
                    userPicks={mockQueryData.userPicks}
                    totals={mockQueryData.userTotals}/>);
            });
            const cell = grid.root.find(el => el.props.id === "user-picks-grid");

            cell.props.sendData("name", "game", "pick");

            expect(isCalled).toBe(true)
        });


        it('Renders twelve pick cells when there are three users and four games in data response', () => {
            const pickCells = findByClassName(grid, 'pick-cell');

            expect(pickCells.length).toBe(mockQueryData.games.length * mockQueryData.users.length);

            assertAllUserPicksMatchCellText(mockQueryData, pickCells);
        });

        it('Pick cells are of PickCell type', () => {
            const pickCells = findByClassName(grid, 'pick-cell');

            pickCells.map(cell => expect(cell.type).toBe(PickCell))
        });

        it('can choose specific game from pick list for first mock user', () => {
            let picks = mockQueryData["userPicks"][0].picks;

            expect(getPickByGame(picks, "CHI@GB")).toBe("CHI")
        });

        it('can choose specific game from pick list for second mock user', () => {
            let picks = mockQueryData["userPicks"][1].picks;

            expect(getPickByGame(picks, "ANN@COL")).toBe("C")
        });

        it('empty list of picks returns null', () => {
            let emptyPicks = [];

            expect(getPickByGame(emptyPicks, "ANN@COL")).toBe(null)
        })
    });

    describe('header cells', () => {
        let nameCells = null;
        beforeEach(() => {
            nameCells = grid.findAll(el => el.props['data-testid']?.startsWith("name-row-"));
        });

        it('Renders 3 name cells when three users', () => {
            expect(nameCells.length).toBe(mockQueryData.users.length);
        });

        it('Renders first name cell with name of first user', () => {
            expect(nameCells[0].props.children).toEqual(mockQueryData.users[0].name);
        });

        it('Renders second name cell with name of second user', () => {
            expect(nameCells[1].props.children).toEqual(mockQueryData.users[1].name);
        });

        it('First user name has row 1', () => {
            expect(nameCells[0].props.style.gridRow).toBe(1);
        })

        it('First user name has column 3', () => {
            expect(nameCells[0].props.style.gridColumn).toBe(3);
        })

        it('Second user name has row 1', () => {
            expect(nameCells[1].props.style.gridRow).toBe(1);
        })

        it('Second user name has column 4', () => {
            expect(nameCells[1].props.style.gridColumn).toBe(4);
        })

        it('first user name has top border', () => {
            const classes = nameCells[0].props.className.split(" ")
            expect(classes.includes("grid__cell--top-border")).toBeTruthy()
        });

        it('first user name has left border', () => {
            const classes = nameCells[0].props.className.split(" ")
            expect(classes.includes("grid__cell--left-border")).toBeTruthy()
        });

        it('second user name has top border', () => {
            const classes = nameCells[1].props.className.split(" ")
            expect(classes.includes("grid__cell--top-border")).toBeTruthy()
        });

        it('second user name has no left border', () => {
            const classes = nameCells[1].props.className.split(" ")
            expect(classes.includes("grid__cell--left-border")).toBeFalsy()
        });

        describe('headers', () => {
            let spreadHeader = null;
            let resultHeader = null;
            beforeEach(() => {
                spreadHeader = grid.find(el => el.props["data-testid"] === "spread-header");
                resultHeader = grid.find(el => el.props["data-testid"] === "result-header");
            })

            it('has spread header in row 1', () => {
                expect(spreadHeader.props.style.gridRow).toEqual(1)
            })

            it('has spread header has no right border', () => {
                const classes = spreadHeader.props.className.split(" ")
                expect(classes.includes("grid__cell--no-right-border")).toBeTruthy()
            })

            it('has spread header in column 2', () => {
                expect(spreadHeader.props.style.gridColumn).toEqual(2)
            })

            it('has result header in row 1', () => {
                expect(resultHeader.props.style.gridRow).toEqual(1)
            })

            it('has result header in column 6 with three users', () => {
                expect(resultHeader.props.style.gridColumn).toEqual(6)
            })

            it('has result header has no right border', () => {
                const classes = resultHeader.props.className.split(" ")
                expect(classes.includes("grid__cell--no-right-border")).toBeTruthy()
            })

        });


        describe('two users', () => {
            const twoMockUserData = {
                "users": [
                    {"name": "Someone"},
                    {"name": "Derp"},
                ],
                "userTotals": [],
                "games": [],
                "leaders": []
            };
            let twoUserGrid = null;
            let nameCells = null;

            beforeEach(() => {
                twoUserGrid = create(<WeeklyGamesGrid
                    currentWeek="0"
                    users={twoMockUserData.users}
                    games={twoMockUserData.games}
                    userPicks={twoMockUserData.userPicks}
                    totals={twoMockUserData.userTotals}/>).root;

                nameCells = twoUserGrid.findAll(el => el.props['data-testid']?.startsWith("name-row-"));
            })

            it('Renders two id cells when there are two users in data response', () => {
                expect(nameCells.length).toBe(twoMockUserData.users.length);
            });

            it('renders first name cell with name of first user', () => {
                expect(nameCells[0].props.children).toEqual(twoMockUserData.users[0].name);
            });

            it('renders second name cell with name of second user', () => {
                expect(nameCells[1].props.children).toEqual(twoMockUserData.users[1].name);
            });

            it('has result header in column 5', () => {
                const resultHeader = twoUserGrid.find(el =>
                    el.props["data-testid"] === "result-header"
                );

                expect(resultHeader.props.style.gridColumn).toEqual(5)
            })
        });
    });

    describe('rendered totals cells', () => {
        let totalCells = null;
        beforeEach(() => {
            totalCells = grid.findAll(el => el.props['data-testid']?.startsWith("total-row-"));
        });

        it('Renders three total cells when there are three users in data response', () => {
            expect(totalCells.length).toBe(mockQueryData.users.length);
        });

        it('first total cell has first user total', () => {
            expect(totalCells[0].props.children).toEqual(mockQueryData.userTotals[0].total);
        });

        it('second total cell has second user total', () => {
            expect(totalCells[1].props.children).toEqual(mockQueryData.userTotals[1].total);
        });

        it('First user total has row 6 with 4 games', () => {
            expect(totalCells[0].props.style.gridRow).toBe(6);
        })

        it('First user total has column 3', () => {
            expect(totalCells[0].props.style.gridColumn).toBe(3);
        })

        it('Second user total has row 6 with 4 games', () => {
            expect(totalCells[1].props.style.gridRow).toBe(6);
        })

        it('Second user total has column 4', () => {
            expect(totalCells[1].props.style.gridColumn).toBe(4);
        })

        it('first user total has left border', () => {
            const classes = totalCells[0].props.className.split(" ")
            expect(classes.includes("grid__cell--left-border")).toBeTruthy()
        });

        it('second user total has no left border', () => {
            const classes = totalCells[1].props.className.split(" ")
            expect(classes.includes("grid__cell--left-border")).toBeFalsy()
        });

        describe('two users no games', () => {
            const twoMockUserData = {
                "users": [
                    {"name": "Someone"},
                    {"name": "Derp"},
                ],
                "userTotals": [
                    {"name": "Someone", "total": 0},
                    {"name": "Derp", "total": 4}
                ],
                "games": [],
                "leaders": []
            };

            let grid = null;
            let twoUserTotalCells = null;

            beforeEach(() => {
                grid = create(<WeeklyGamesGrid
                    currentWeek="0"
                    users={twoMockUserData.users}
                    games={twoMockUserData.games}
                    userPicks={twoMockUserData.userPicks}
                    totals={twoMockUserData.userTotals}/>).root;

                twoUserTotalCells = grid.findAll(el => el.props['data-testid']?.startsWith("total-row-"));
            });

            it('Renders two total cells', () => {
                expect(twoUserTotalCells.length).toBe(twoMockUserData.users.length);
            });

            it('Renders first user total', () => {
                expect(twoUserTotalCells.length).toBe(twoMockUserData.users.length);
                expect(twoUserTotalCells[0].props.children)
                    .toEqual(twoMockUserData.userTotals[0].total)
            });

            it('First user total has row 2 with 0 games', () => {
                expect(twoUserTotalCells[0].props.style.gridRow).toBe(2);
            })
        });
    });

    describe('rendered games cells', () => {
        let gameCells = null;

        beforeEach(() => {
            gameCells = grid.findAll(el => el.props['data-testid']?.startsWith("game-column-"));
        })

        it('Renders four game cells when there are four games in data response', () => {
            expect(gameCells.length).toBe(mockQueryData.games.length);
        });

        it('has first game cell name equal to game name', () => {
            expect(gameCells[0].props.children).toEqual(mockQueryData.games[0].name);
        });

        it('has second game cell name equal to game name', () => {
            expect(gameCells[1].props.children).toEqual(mockQueryData.games[1].name);
        });

        it('first game is in row 2', () => {
            expect(gameCells[0].props.style.gridRow).toEqual(2);
        });

        it('second game is in row 3', () => {
            expect(gameCells[1].props.style.gridRow).toEqual(3);
        });

        it('first game is in column 1', () => {
            expect(gameCells[0].props.style.gridColumn).toEqual(1);
        });

        it('second game is in column 1', () => {
            expect(gameCells[1].props.style.gridColumn).toEqual(1);
        });


        it('first game cell has left border', () => {
            const classes = gameCells[0].props.className.split(" ")
            expect(classes.includes("grid__cell--left-border")).toBeTruthy()
        });

        it('second game cell has left border', () => {
            const classes = gameCells[1].props.className.split(" ")
            expect(classes.includes("grid__cell--left-border")).toBeTruthy()
        });


        it('first game cell has top border', () => {
            const classes = gameCells[0].props.className.split(" ")
            expect(classes.includes("grid__cell--top-border")).toBeTruthy()
        });

        it('second game cell does not have top border', () => {
            const classes = gameCells[1].props.className.split(" ")
            expect(classes.includes("grid__cell--top-border")).toBeFalsy()
        });

        describe('one game', () => {
            const oneMockGameData = {
                "users": [],
                "games": [
                    {"name": "TLH@PCL"},
                ],
                "userTotals": [],
                "leaders": []
            };

            let oneGameCells = null;

            beforeEach(() => {
                const grid = create(<WeeklyGamesGrid
                    currentWeek="0"
                    users={oneMockGameData.users}
                    games={oneMockGameData.games}
                    userPicks={oneMockGameData.userPicks}
                    totals={oneMockGameData.userTotals}/>).root;

                oneGameCells = grid.findAll(el => el.props['data-testid']?.startsWith("game-column-"));
            })

            it('Renders one game cell when there is one game in data response', () => {
                expect(oneGameCells.length).toBe(oneMockGameData.games.length);
            });

            it('renders game name', () => {
                expect(oneGameCells[0].props.children).toEqual(oneMockGameData.games[0].name);
            })
        });
    });

    describe('rendered spread cells', () => {
        let spreadCells = null;

        beforeEach(() => {
            spreadCells = grid.findAll(el => el.props['data-testid']?.startsWith("spread-column-"));
        })

        it('Renders four spread cells when there are four games in data response', () => {
            expect(spreadCells.length).toBe(mockQueryData.games.length);
        });

        it('has first spread cell name equal to game name', () => {
            expect(spreadCells[0].props.children).toEqual(mockQueryData.games[0].spread);
        });

        it('has second spread cell name equal to game name', () => {
            expect(spreadCells[1].props.children).toEqual(mockQueryData.games[1].spread);
        });

        it('first spread is in row 2', () => {
            expect(spreadCells[0].props.style.gridRow).toEqual(2);
        });

        it('second spread is in row 3', () => {
            expect(spreadCells[1].props.style.gridRow).toEqual(3);
        });

        it('first spread is in column 2', () => {
            expect(spreadCells[0].props.style.gridColumn).toEqual(2);
        });

        it('second spread is in column 2', () => {
            expect(spreadCells[1].props.style.gridColumn).toEqual(2);
        });

        it('first spread cell has no left border', () => {
            const classes = spreadCells[0].props.className.split(" ")
            expect(classes.includes("grid__cell--left-border")).toBeFalsy()
        });

        it('second spread cell has no left border', () => {
            const classes = spreadCells[1].props.className.split(" ")
            expect(classes.includes("grid__cell--left-border")).toBeFalsy()
        });


        it('first spread cell has no top border', () => {
            const classes = spreadCells[0].props.className.split(" ")
            expect(classes.includes("grid__cell--top-border")).toBeFalsy()
        });

        it('second spread cell does not have top border', () => {
            const classes = spreadCells[1].props.className.split(" ")
            expect(classes.includes("grid__cell--top-border")).toBeFalsy()
        });

        describe('one game', () => {
            const oneMockGameData = {
                "users": [],
                "games": [
                    {"name": "TLH@PCL", "spread": -20},
                ],
                "userTotals": [],
                "leaders": []
            };

            let oneGameSpreadCells = null;

            beforeEach(() => {
                const grid = create(<WeeklyGamesGrid
                    currentWeek="0"
                    users={oneMockGameData.users}
                    games={oneMockGameData.games}
                    userPicks={oneMockGameData.userPicks}
                    totals={oneMockGameData.userTotals}/>).root;

                oneGameSpreadCells = grid.findAll(el => el.props['data-testid']?.startsWith("spread-column-"));
            })

            it('Renders one spread cell when there is one game in data response', () => {
                expect(oneGameSpreadCells.length).toBe(oneMockGameData.games.length);
            });

            it('renders spread value', () => {
                expect(oneGameSpreadCells[0].props.children).toEqual(oneMockGameData.games[0].spread);
            })
        });
    });

    describe('rendered result cells', () => {
        let resultCells = null;

        beforeEach(() => {
            resultCells = grid.findAll(el => el.props['data-testid']?.startsWith("result-column-"));
        })

        it('Renders four result cells when there are four games in data response', () => {
            expect(resultCells.length).toBe(mockQueryData.games.length);
        });

        it('has first result cell name equal to game name', () => {
            expect(resultCells[0].props.children).toEqual(mockQueryData.games[0].result);
        });

        it('has second result cell name equal to game name', () => {
            expect(resultCells[1].props.children).toEqual(mockQueryData.games[1].result);
        });

        it('first result is in row 2', () => {
            expect(resultCells[0].props.style.gridRow).toEqual(2);
        });

        it('second result is in row 3', () => {
            expect(resultCells[1].props.style.gridRow).toEqual(3);
        });

        it('first result is in column 6 with three users', () => {
            expect(resultCells[0].props.style.gridColumn).toEqual(6);
        });

        it('second result is in column 6 with three users', () => {
            expect(resultCells[1].props.style.gridColumn).toEqual(6);
        });


        it('first result cell has no left border', () => {
            const classes = resultCells[0].props.className.split(" ")
            expect(classes.includes("grid__cell--left-border")).toBeFalsy()
        });

        it('second result cell has no left border', () => {
            const classes = resultCells[1].props.className.split(" ")
            expect(classes.includes("grid__cell--left-border")).toBeFalsy()
        });


        it('first result cell has no top border', () => {
            const classes = resultCells[0].props.className.split(" ")
            expect(classes.includes("grid__cell--top-border")).toBeFalsy()
        });

        it('second v cell does not have top border', () => {
            const classes = resultCells[1].props.className.split(" ")
            expect(classes.includes("grid__cell--top-border")).toBeFalsy()
        });

        describe('one game zero users', () => {
            const oneMockGameData = {
                "users": [],
                "games": [
                    {"name": "TLH@PCL", "spread": -20, "result": "PCL"},
                ],
                "userTotals": [],
                "leaders": []
            };

            let oneGameResultCells = null;

            beforeEach(() => {
                const grid = create(<WeeklyGamesGrid
                    currentWeek="0"
                    users={oneMockGameData.users}
                    games={oneMockGameData.games}
                    userPicks={oneMockGameData.userPicks}
                    totals={oneMockGameData.userTotals}/>).root;

                oneGameResultCells = grid.findAll(el => el.props['data-testid']?.startsWith("result-column-"));
            })

            it('Renders one result cell when there is one game in data response', () => {
                expect(oneGameResultCells.length).toBe(oneMockGameData.games.length);
            });

            it('renders result value', () => {
                expect(oneGameResultCells[0].props.children).toEqual(oneMockGameData.games[0].result);
            })

            it('first result is in column 3', () => {
                expect(oneGameResultCells[0].props.style.gridColumn).toEqual(3);
            });
        });

    });
});
