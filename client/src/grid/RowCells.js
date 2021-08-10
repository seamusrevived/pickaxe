import React from "react";

const RowCells = props => {
    const {items, name, columnOffset, row, topBorder, leftBorder} = props;
    let cells = items.map((item, index) => {
        let cssClass = `grid__cell $grid__cell--${name} `;

        if(topBorder) {
            cssClass += "grid__cell--top-border "
        }

        if(leftBorder && index === 0) {
            cssClass += "grid__cell--left-border "
        }

        let style = {
            gridColumn: columnOffset+index,
            gridRow: row
        };

        return <div
            className={cssClass}
            style={style}
            key={`${name}-${index}`}
            id={`${name}-${index}`}
            data-testid={`${name}-row-${index}`}>
            {item}
        </div>
    });
    return !!items ? cells : undefined;
}

export default RowCells;
