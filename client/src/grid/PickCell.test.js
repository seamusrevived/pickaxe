import React from "react";
import {create, act} from "react-test-renderer";
import { render, fireEvent } from '@testing-library/react'
import PickCell from "./PickCell";



describe('PickCell', () => {
    it('takes user, game, and pick props and has pick as text', () => {
        let cellRenderer = null;
        act(() => {
            cellRenderer = create(<PickCell user="Some user" game="GB@CHI" pick="CHI"/>)
        });

        const wrapperChild = cellRenderer.root.children[0];
        expect(wrapperChild.props.children).toBe("CHI");
    });

    it('wrapper type is editable', () => {
        let cellRenderer = null;
        act(() => {
            cellRenderer = create(<PickCell user="Some user" game="GB@CHI" pick="CHI"/>)
        });

        const wrapperChild = cellRenderer.root.children[0];
        expect(wrapperChild.props.contentEditable).toBe(true)
    });

    it('pick for GB shows up as text as text', () => {
        let cellRenderer = null;
        act(() => {
            cellRenderer = create(<PickCell user="Some user" game="GB@CHI" pick="GB"/>)
        });

        let inputElement = cellRenderer.root.findByType('div');
        expect(inputElement.children[0]).toBe("GB")
    });

    it('pick with updated props shows up as text on rerender', () => {
        let cellRenderer = null;
        act(() => {
            cellRenderer = create(<PickCell user="Some user" game="GB@CHI" pick="GB"/>)
        });

        act(() => {
            cellRenderer.update(<PickCell user="Some user" game="GB@CHI" pick="CHI"/>)
        });

        let inputElement = cellRenderer.root.findByType('div');
        expect(inputElement.children[0]).toBe("CHI")
    });


    it('calls sendData callback on blur', () => {
        let lostFocus = false;
        let spyOnLoseFocus = () => {
            lostFocus = true
        };
        let {container} = render(<PickCell user="Some user" game="GB@CHI" pick="CHI"
                                     sendData={spyOnLoseFocus}/>);

        fireEvent.blur(container.querySelector('div'), {target: {textContent: "CWS"}});

        expect(lostFocus).toBeTruthy();
    });

    it('is correct has grid__cell--correct class', () => {
        let cellRenderer = null;
        act(() => {
            cellRenderer = create(<PickCell user="Some user" game="GB@CHI" pick="CHI" correct={true}/>)
        });

        const cell = cellRenderer.root;
        const div = cell.children[0];
        expect(div.props.className).toContain("grid__cell--correct")
    });

    it('is not correct does not have grid__cell--correct class', () => {
        let cellRenderer = null;
        act(() => {
            cellRenderer = create(<PickCell user="Some user" game="GB@CHI" pick="CHI" correct={false}/>)
        });

        const cell = cellRenderer.root;
        const div = cell.children[0];
        expect(div.props.className).not.toContain("grid__cell--correct")
    });

    it('has grid row 0 when row prop 0', () => {
        let cellRenderer = null;
        act(() => {
            cellRenderer = create(<PickCell user="Some user" game="GB@CHI" pick="CHI" correct={false} row={0}/>)
        });

        const cell = cellRenderer.root;
        const div = cell.children[0];
        expect(div.props.style.gridRow).toEqual(0)
    });

    it('has grid row 1 when row prop 1', () => {
        let cellRenderer = null;
        act(() => {
            cellRenderer = create(<PickCell user="Some user" game="GB@CHI" pick="CHI" correct={false} row={1}/>)
        });

        const cell = cellRenderer.root;
        const div = cell.children[0];
        expect(div.props.style.gridRow).toEqual(1)
    });

    it('has grid column 0 when column prop 0', () => {
        let cellRenderer = null;
        act(() => {
            cellRenderer = create(<PickCell user="Some user" game="GB@CHI" pick="CHI" correct={false} column={0}/>)
        });

        const cell = cellRenderer.root;
        const div = cell.children[0];
        expect(div.props.style.gridColumn).toEqual(0)
    });

    it('has grid column 1 when column prop 1', () => {
        let cellRenderer = null;
        act(() => {
            cellRenderer = create(<PickCell user="Some user" game="GB@CHI" pick="CHI" correct={false} column={1}/>)
        });

        const cell = cellRenderer.root;
        const div = cell.children[0];
        expect(div.props.style.gridColumn).toEqual(1)
    });

});
