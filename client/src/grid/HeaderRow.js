import React from "react";
import RowCells from "./RowCells";

const HeaderRow = props => {
    const nLeadingColumns = 2;
    const nTotalColumns = nLeadingColumns + props.userNames.length + 1;

    return [
        <div className='grid__cell grid__cell--name grid__cell--no-right-border'
             style={{gridRow: 1, gridColumn: 2}}
             key="spread-header"
             data-testid="spread-header">
            Spread
        </div>,
        <RowCells key="grid__cell--names"
                  items={props.userNames}
                  name="name"
                  row={1}
                  columnOffset={nLeadingColumns + 1}
                  topBorder
                  leftBorder
        />,
        <div className='grid__cell grid__cell--name grid__cell--no-right-border'
             style={{gridRow: 1, gridColumn: nTotalColumns}}
             key="result-header"
             data-testid="result-header">
            Result
        </div>
    ];
}

export default HeaderRow;
