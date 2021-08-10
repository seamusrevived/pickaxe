import React from "react";

const ColumnCells = props => {
    const {items, name, column, rowOffset, leftBorder, topBorder, alignLeft} = props;
    let cells = items.map((item, index) => {
        let cssClass = `grid__cell `;

        if(leftBorder) {
            cssClass += "grid__cell--left-border "
        }
        if(topBorder && index === 0) {
            cssClass += "grid__cell--top-border "
        }
        if(alignLeft) {
            cssClass += "grid__cell--align-left "
        }

        let style = {
            gridColumn: column,
            gridRow: index+rowOffset
        };

        return <div
            className={cssClass}
            style={style}
            key={`${name}-${index}`}
            id={`${name}-${index}`}
            data-testid={`${name}-column-${index}`}>
            {item}
        </div>
    });
    return !!items ? cells : undefined;
}

export default ColumnCells
