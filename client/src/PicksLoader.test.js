import PicksGrid from "./grid/PicksGrid";
import {create} from "react-test-renderer";
import PicksLoader from "./PicksLoader";
import React from "react";
import {useMutation, useQuery} from "@apollo/react-hooks";
import {mockQueryData} from "./testUtilities/MockQueryData";
import {WEEKS_QUERY} from "./graphqlQueries";

jest.mock('@apollo/react-hooks');

describe('PicksLoader', () => {
    const picksQueryResult = {
        loading: false, error: null, data: mockQueryData, refetch: () => {
        }
    };

    beforeEach(() => {
        jest.resetAllMocks();
        useQuery
            .mockReturnValueOnce({
                loading: false, error: null, data: {currentWeek: "0", weeks: ["0", "1"]}})
            .mockReturnValueOnce(picksQueryResult);
        useMutation.mockReturnValue([() => {
        }]);
    });

    it('has a PicksGrid element', () => {
        const loader = create(<PicksLoader/>).root;

        const grid = loader.findAllByType(PicksGrid);
        expect(grid.length).toEqual(1);
    });

    it('passes current week of 0 to PicksGrid', () => {
        const loader = create(<PicksLoader/>).root;

        const grid = loader.findByProps({id: "picks-grid"});

        expect(grid.props.defaultWeek).toEqual("0")
    });

    it('calls query for weeks', () => {
        // eslint-disable-next-line no-unused-expressions
        create(<PicksLoader/>).root;

        expect(useQuery.mock.calls[0][0]).toEqual(WEEKS_QUERY);
    });

    it('passes current week of 1 to PicksGrid', () => {
        useQuery.mockReset();
        useQuery
            .mockReturnValueOnce({
                loading: false, error: null, data: {currentWeek: "1", weeks: ["0", "1"]}})
            .mockReturnValueOnce(picksQueryResult);


        const loader = create(<PicksLoader/>).root;

        const grid = loader.findByProps({id: "picks-grid"});

        expect(grid.props.defaultWeek).toEqual("1")
    });

    it('when query loading shows loading', () => {
        useQuery.mockReset();

        useQuery
            .mockReturnValueOnce({loading: true, error: null, data: undefined});

        const loader = create(<PicksLoader/>).root;

        expect(loader.findByType('div').props.children).toEqual("Loading App")
    });

    it('when query errors shows error message', () => {
        useQuery.mockReset();

        useQuery
            .mockReturnValueOnce({loading: false, error: true, data: undefined});

        const loader = create(<PicksLoader/>).root;

        expect(loader.findByType('div').props.children).toEqual("Something has gone wrong")
    });
});