import {useQuery} from "@apollo/react-hooks";
import {create} from "react-test-renderer";
import PicksGrid from "./PicksGrid";
import React from "react";
import {mockQueryData} from "./MockQueryData";
import {findByClassName, assertAllUserPicksMatchCellText} from "./Helpers";

jest.mock('@apollo/react-hooks');
useQuery.mockReturnValue({loading: false, error: null, data: mockQueryData});

describe('PicksGrid pick cell rendering', () => {
    let grid, renderer;

    beforeEach(() => {
        jest.resetAllMocks();
        useQuery.mockReturnValue({loading: false, error: null, data: mockQueryData});

        renderer = create(<PicksGrid/>);
        grid = renderer.root;
    });

    it('Renders twelve pick cells when there are three users and four games in data response', () => {
        const pickCells = findByClassName(grid, 'pick-cell');

        expect(pickCells.length).toBe(mockQueryData.games.length * mockQueryData.users.length);

        assertAllUserPicksMatchCellText(mockQueryData, pickCells);
    });



});
